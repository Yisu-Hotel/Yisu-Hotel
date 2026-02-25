import React, { useEffect, useMemo, useState, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { createHotel, updateHotel } from '../../utils/api';

// 设置高德地图安全密钥
window._AMapSecurityConfig = {
  securityJsCode: process.env.VITE_AMAP_SECURITY_CODE || '2759e8896af8c3643139709006226061',
};

const DEFAULT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%23e2e8f0"/><path d="M180 280l90-110 90 110 60-70 110 130H180z" fill="%23cbd5f5"/><circle cx="420" cy="150" r="40" fill="%23cbd5f5"/></svg>';

const FACILITIES_OPTIONS = [
  { id: 'wifi', name: '免费WiFi' },
  { id: 'parking', name: '免费停车场' },
  { id: 'air_conditioner', name: '空调' },
  { id: 'tv', name: '电视' },
  { id: 'breakfast', name: '早餐' },
  { id: 'gym', name: '健身房' },
  { id: 'pool', name: '游泳池' },
  { id: 'spa', name: 'SPA' }
];

const SERVICES_OPTIONS = [
  { id: 'reception', name: '24小时前台' },
  { id: 'luggage', name: '行李寄存' },
  { id: 'laundry', name: '洗衣服务' },
  { id: 'taxi', name: '叫车服务' },
  { id: 'concierge', name: '礼宾服务' },
  { id: 'room_service', name: '客房服务' },
  { id: 'wakeup', name: '叫醒服务' }
];

const ROOM_FACILITIES_OPTIONS = [
  { id: 'free_wifi', name: '免费WiFi' },
  { id: 'air_conditioner', name: '空调' },
  { id: 'tv', name: '平板电视' },
  { id: 'minibar', name: '迷你吧' },
  { id: 'bathtub', name: '浴缸' },
  { id: 'workdesk', name: '办公桌' },
  { id: 'sofa', name: '沙发' },
  { id: 'hairdryer', name: '吹风机' }
];

const ROOM_SERVICES_OPTIONS = [
  { id: 'room_service', name: '24小时客房服务' },
  { id: 'laundry', name: '洗衣服务' },
  { id: 'airport_transfer', name: '机场接送' },
  { id: 'butler', name: '管家服务' }
];

export default function CreateHotel({ onBack, hotelId, initialData }) {
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('general'); // general, facilities, rooms
  const [showMapModal, setShowMapModal] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isEditMode = Boolean(hotelId);

  // General Info State
  const [generalInfo, setGeneralInfo] = useState({
    hotel_name_cn: '',
    hotel_name_en: '',
    star_rating: 3,
    description: '',
    phone: '',
    opening_date: new Date().toISOString().split('T')[0],
    nearby_info: '',
    tags: [],
    tagInput: '',
    location_info: {
      formatted_address: '',
      country: '中国',
      province: '',
      city: '',
      district: '',
      street: '',
      number: '',
      location: ''
    }
  });
  const [hotelImages, setHotelImages] = useState([]); // Array of { url, base64 }

  const formattedAddress = useMemo(() => {
    const { country, province, city, district, street, number } = generalInfo.location_info;
    return [country, province, city, district, street, number].filter(Boolean).join('');
  }, [
    generalInfo.location_info.country,
    generalInfo.location_info.province,
    generalInfo.location_info.city,
    generalInfo.location_info.district,
    generalInfo.location_info.street,
    generalInfo.location_info.number
  ]);

  useEffect(() => {
    if (formattedAddress !== generalInfo.location_info.formatted_address) {
      setGeneralInfo(prev => ({
        ...prev,
        location_info: { ...prev.location_info, formatted_address: formattedAddress }
      }));
    }
  }, [formattedAddress, generalInfo.location_info.formatted_address]);

  // Facilities & Policies State
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [policies, setPolicies] = useState({
    cancellation: '',
    payment: '',
    children: '',
    pets: ''
  });

  // Room Types State
  const [roomTypes, setRoomTypes] = useState([]);
  // roomType structure: 
  // { id: tempId, name, bed_type, area, description, facilities: [], services: [], policies: {}, tags: [], images: [], prices: {} }

  useEffect(() => {
    if (showMapModal) {
      initMap();
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [showMapModal]);

  const initMap = async () => {
    try {
      const AMap = await AMapLoader.load({
        key: process.env.VITE_AMAP_KEY || '469dee2db9050f7bdc2b44d6505c1632',
        version: '2.0',
        plugins: ['AMap.Geocoder', 'AMap.Marker']
      });

      const initialLocation = generalInfo.location_info.location;
      let center = [116.397428, 39.90923]; // 默认北京

      if (initialLocation && initialLocation.includes(',')) {
        const [lng, lat] = initialLocation.split(',').map(Number);
        if (!isNaN(lng) && !isNaN(lat)) {
          center = [lng, lat];
        }
      }

      const map = new AMap.Map(mapContainerRef.current, {
        zoom: 15,
        center: center
      });

      mapInstanceRef.current = map;

      const marker = new AMap.Marker({
        position: center,
        draggable: true,
        map: map
      });

      markerRef.current = marker;

      // 拖拽结束获取地址
      marker.on('dragend', (e) => {
        const position = e.lnglat;
        updateLocationFromPos(position, AMap);
      });

      // 点击地图移动标记
      map.on('click', (e) => {
        const position = e.lnglat;
        marker.setPosition(position);
        updateLocationFromPos(position, AMap);
      });

      // 如果没有坐标但有地址信息，尝试通过地址定位中心点
      if (!initialLocation && generalInfo.location_info.formatted_address && generalInfo.location_info.formatted_address !== '中国') {
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(generalInfo.location_info.formatted_address, (status, result) => {
          if (status === 'complete' && result.geocodes.length) {
            const pos = result.geocodes[0].location;
            map.setCenter(pos);
            marker.setPosition(pos);
            const posStr = `${pos.lng},${pos.lat}`;
            handleLocationChange('location', posStr);
          }
        });
      }
    } catch (e) {
      console.error('地图加载失败:', e);
    }
  };

  const updateLocationFromPos = (lnglat, AMap) => {
    const posStr = `${lnglat.lng},${lnglat.lat}`;
    handleLocationChange('location', posStr);

    const geocoder = new AMap.Geocoder();
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        const component = result.regeocode.addressComponent;
        setGeneralInfo(prev => ({
          ...prev,
          location_info: {
            ...prev.location_info,
            location: posStr,
            province: component.province || '',
            city: component.city || component.province || '',
            district: component.district || '',
            street: component.township || component.street || '',
            number: component.streetNumber || '',
            formatted_address: result.regeocode.formattedAddress || ''
          }
        }));
      }
    });
  };

  useEffect(() => {
    if (!initialData) {
      return;
    }
    const locationInfo = initialData.location_info || {};
    setGeneralInfo({
      hotel_name_cn: initialData.hotel_name_cn || '',
      hotel_name_en: initialData.hotel_name_en || '',
      star_rating: initialData.star_rating || 3,
      description: initialData.description || '',
      phone: initialData.phone || '',
      opening_date: initialData.opening_date || new Date().toISOString().split('T')[0],
      nearby_info: initialData.nearby_info || '',
      tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      tagInput: '',
      location_info: {
        formatted_address: locationInfo.formatted_address || '',
        country: locationInfo.country || '中国',
        province: locationInfo.province || '',
        city: locationInfo.city || '',
        district: locationInfo.district || '',
        street: locationInfo.street || '',
        number: locationInfo.number || '',
        location: locationInfo.location || ''
      }
    });

    const facilities = (initialData.facilities || []).map((item) => item?.id || item).filter(Boolean);
    const services = (initialData.services || []).map((item) => item?.id || item).filter(Boolean);
    setSelectedFacilities(facilities);
    setSelectedServices(services);

    setPolicies({
      cancellation: initialData.policies?.cancellation || '',
      payment: initialData.policies?.payment || '',
      children: initialData.policies?.children || '',
      pets: initialData.policies?.pets || ''
    });

    const mainImages = Array.isArray(initialData.main_image_url) ? initialData.main_image_url : initialData.main_image_url ? [initialData.main_image_url] : [];
    setHotelImages(mainImages.filter(Boolean).map((url) => ({ base64: url, url })));

    const roomPrices = initialData.room_prices || {};
    const rooms = Object.entries(roomPrices).map(([name, room], index) => ({
      _tempId: Date.now() + index,
      name: name || '',
      bed_type: room?.bed_type || 'king',
      area: room?.area || 30,
      description: room?.description || '',
      facilities: (room?.facilities || []).map((item) => item?.id || item).filter(Boolean),
      services: (room?.services || []).map((item) => item?.id || item).filter(Boolean),
      policies: {
        cancellation: room?.policies?.cancellation || '',
        payment: room?.policies?.payment || '',
        children: room?.policies?.children || '',
        pets: room?.policies?.pets || ''
      },
      tags: room?.tags || [],
      tagInput: '',
      images: room?.room_image_url ? [{ base64: room.room_image_url, url: room.room_image_url }] : [],
      prices: room?.prices || {}
    }));
    setRoomTypes(rooms);
  }, [initialData]);

  const handleGeneralChange = (field, value) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field, value) => {
    setGeneralInfo(prev => ({
      ...prev,
      location_info: { ...prev.location_info, [field]: value }
    }));
  };

  const handleAddTag = () => {
    if (generalInfo.tagInput.trim()) {
      setGeneralInfo(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (index) => {
    setGeneralInfo(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e, isRoom = false, roomIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageObj = { base64: reader.result, url: '' }; // URL would be empty for new uploads
      if (isRoom && roomIndex !== null) {
        const newRooms = [...roomTypes];
        newRooms[roomIndex].images = [imageObj]; // Single image for room as per UI simplified, but API supports array? No, API room_image_base64 is string
        setRoomTypes(newRooms);
      } else {
        setHotelImages(prev => [...prev, imageObj]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckboxChange = (list, setList, item) => {
    if (list.includes(item.id)) {
      setList(list.filter(id => id !== item.id));
    } else {
      setList([...list, item.id]);
    }
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, {
      _tempId: Date.now(),
      name: '',
      bed_type: 'king',
      area: 30,
      description: '',
      facilities: [],
      services: [],
      policies: { cancellation: '', payment: '', children: '', pets: '' },
      tags: [],
      tagInput: '',
      images: [],
      prices: {} // 'YYYY-MM-DD': price
    }]);
  };

  const updateRoomType = (index, field, value) => {
    const newRooms = [...roomTypes];
    newRooms[index][field] = value;
    setRoomTypes(newRooms);
  };

  const updateRoomPolicy = (index, field, value) => {
    const newRooms = [...roomTypes];
    newRooms[index].policies[field] = value;
    setRoomTypes(newRooms);
  };

  const handleRoomTagAdd = (index) => {
    const room = roomTypes[index];
    if (room.tagInput.trim()) {
      const newRooms = [...roomTypes];
      newRooms[index].tags.push(room.tagInput.trim());
      newRooms[index].tagInput = '';
      setRoomTypes(newRooms);
    }
  };

  const handleRoomCheckboxChange = (index, field, itemId) => {
    const newRooms = [...roomTypes];
    const list = newRooms[index][field]; // facilities or services
    if (list.includes(itemId)) {
      newRooms[index][field] = list.filter(id => id !== itemId);
    } else {
      newRooms[index][field] = [...list, itemId];
    }
    setRoomTypes(newRooms);
  };

  // Pricing Logic
  const [batchPrice, setBatchPrice] = useState({
    roomIndex: null,
    startDate: '',
    endDate: '',
    price: ''
  });

  const applyBatchPrice = () => {
    const { roomIndex, startDate, endDate, price } = batchPrice;
    if (roomIndex === null || !startDate || !endDate || !price) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const priceVal = parseFloat(price);
    const newRooms = [...roomTypes];
    const room = newRooms[roomIndex];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      room.prices[dateStr] = priceVal;
    }
    setRoomTypes(newRooms);
    setBatchPrice({ ...batchPrice, roomIndex: null }); // Close modal/panel
  };

  const buildPayload = () => {
    const mainImageBase64 = hotelImages
      .map((img) => img.base64)
      .filter((value) => typeof value === 'string' && value.startsWith('data:'));
    const mainImageUrl = hotelImages
      .map((img) => img.url)
      .filter((value) => typeof value === 'string' && value && !value.startsWith('data:'));

    const payload = {
      ...generalInfo,
      star_rating: Number(generalInfo.star_rating),
      facilities: FACILITIES_OPTIONS.filter(f => selectedFacilities.includes(f.id)),
      services: SERVICES_OPTIONS.filter(s => selectedServices.includes(s.id)),
      policies,
      main_image_url: mainImageUrl,
      main_image_base64: mainImageBase64,
      room_prices: {}
    };

    roomTypes.forEach(room => {
      const roomImageBase64 = room.images[0]?.base64 && room.images[0].base64.startsWith('data:') ? room.images[0].base64 : '';
      const roomImageUrl = room.images[0]?.url && !room.images[0].url.startsWith('data:') ? room.images[0].url : '';
      payload.room_prices[room.name] = {
        bed_type: room.bed_type,
        area: Number(room.area),
        description: room.description,
        facilities: ROOM_FACILITIES_OPTIONS.filter(f => room.facilities.includes(f.id)),
        services: ROOM_SERVICES_OPTIONS.filter(s => room.services.includes(s.id)),
        policies: room.policies,
        tags: room.tags,
        room_image_url: roomImageUrl,
        room_image_base64: roomImageBase64,
        prices: room.prices
      };
    });

    return payload;
  };

  const handleSubmit = async () => {
    // Validation
    if (!generalInfo.hotel_name_cn) return alert('请填写酒店中文名称');
    if (roomTypes.length === 0) return alert('请至少添加一种房型');
    const locationFields = ['formatted_address', 'country', 'province', 'city', 'district', 'street', 'number', 'location'];
    const missingLocationField = locationFields.find((field) => !generalInfo.location_info[field]?.trim());
    if (missingLocationField) return alert('请填写完整位置信息');
    const locationPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (!locationPattern.test(generalInfo.location_info.location.trim())) return alert('经纬度格式应为: 经度,纬度');

    setSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = buildPayload();

    try {
      const { result } = isEditMode
        ? await updateHotel({ token, hotelId, payload: { ...payload, save_as_draft: false } })
        : await createHotel({ token, payload });
      if (result.code === 0) {
        alert(isEditMode ? '酒店更新成功！' : '酒店创建成功！');
        onBack(true);
      } else {
        alert(result.msg || (isEditMode ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const payload = {
      ...buildPayload(),
      save_as_draft: true
    };

    try {
      const { result } = isEditMode
        ? await updateHotel({ token, hotelId, payload })
        : await createHotel({ token, payload });
      if (result.code === 0) {
        alert(result.msg || '草稿已保存');
      } else {
        alert(result.msg || '保存失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={onBack} className="hover:text-primary">酒店列表</button>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-bold">{isEditMode ? '编辑酒店' : '创建新酒店'}</span>
          {/* Map Picker Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl h-[600px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">地图选点</h3>
                  <p className="text-xs text-slate-500 mt-0.5">拖动标记或点击地图选择酒店位置，地址将自动填充。</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 relative">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute top-4 left-4 z-10 max-w-sm">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">当前选择地址</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {generalInfo.location_info.formatted_address || '请在地图上选择位置...'}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    坐标: {generalInfo.location_info.location || '尚未获取'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowMapModal(false)}
                className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                确认位置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        <div className="flex gap-3">
            <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
            <button type="button" onClick={(event) => { event.stopPropagation(); handleSave(); }} disabled={saving || submitting} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">{saving ? '保存中...' : '保存'}</button>
            <button 
                type="button"
                onClick={handleSubmit} 
                disabled={submitting || saving}
                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center gap-2"
            >
                {submitting ? '提交中...' : '提交酒店'}
                <span className="material-symbols-outlined text-lg">check</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Module 1: General Info */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. 基本信息</h2>
                    <p className="text-sm text-slate-500 mt-1">酒店的基本详情、联系方式及地理位置。</p>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Primary Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">酒店名称 (中文)</label>
                                <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                    value={generalInfo.hotel_name_cn} onChange={(e) => handleGeneralChange('hotel_name_cn', e.target.value)} placeholder="请输入酒店中文全称" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">酒店名称 (英文)</label>
                                <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                    value={generalInfo.hotel_name_en} onChange={(e) => handleGeneralChange('hotel_name_en', e.target.value)} placeholder="Enter hotel English name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">星级</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white"
                                        value={generalInfo.star_rating} onChange={(e) => handleGeneralChange('star_rating', e.target.value)}>
                                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} 星级</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">联系电话</label>
                                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400"
                                        value={generalInfo.phone} onChange={(e) => handleGeneralChange('phone', e.target.value)} placeholder="如：021-12345678" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">酒店描述</label>
                                <textarea className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400 h-[124px] resize-none"
                                    value={generalInfo.description} onChange={(e) => handleGeneralChange('description', e.target.value)} placeholder="介绍一下您的酒店..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">开业日期</label>
                                    <input type="date" disabled className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 cursor-not-allowed outline-none"
                                        value={generalInfo.opening_date} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">周边信息</label>
                                    <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400"
                                        value={generalInfo.nearby_info} onChange={(e) => handleGeneralChange('nearby_info', e.target.value)} placeholder="邻近景点或地标" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">标签</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {generalInfo.tags.map((tag, i) => (
                                <span key={i} className="pl-3 pr-2 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg flex items-center gap-2 border border-primary/10">
                                    {tag} 
                                    <button onClick={() => handleRemoveTag(i)} className="hover:bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center transition-colors text-base leading-none">&times;</button>
                                </span>
                            ))}
                            {generalInfo.tags.length === 0 && (
                                <span className="text-xs text-slate-400 italic py-1.5">暂无标签，请在下方添加</span>
                            )}
                        </div>
                        <div className="flex gap-2 max-w-md">
                            <input className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400"
                                value={generalInfo.tagInput} onChange={(e) => handleGeneralChange('tagInput', e.target.value)} placeholder="输入标签并回车" 
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} />
                            <button onClick={handleAddTag} className="px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95">添加</button>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* Location & Image Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                                    位置详情
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">国家</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="国家" value={generalInfo.location_info.country} onChange={(e) => handleLocationChange('country', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">省份</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="省份" value={generalInfo.location_info.province} onChange={(e) => handleLocationChange('province', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">城市</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="城市" value={generalInfo.location_info.city} onChange={(e) => handleLocationChange('city', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">区县</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="区县" value={generalInfo.location_info.district} onChange={(e) => handleLocationChange('district', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">街道</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="街道" value={generalInfo.location_info.street} onChange={(e) => handleLocationChange('street', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">门牌号</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="门牌号" value={generalInfo.location_info.number} onChange={(e) => handleLocationChange('number', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">详细地址 (自动生成)</label>
                                    <input className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed outline-none" placeholder="详细地址"
                                        value={generalInfo.location_info.formatted_address} readOnly />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">坐标 (经度,纬度)</label>
                                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" placeholder="如：121.47,31.23"
                                            value={generalInfo.location_info.location} onChange={(e) => handleLocationChange('location', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <button 
                                            type="button"
                                            onClick={() => setShowMapModal(true)}
                                            className="h-9 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-primary transition-colors">map</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">地图选点</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-primary">image</span>
                                    酒店图片
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">主图 & 轮播图</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {hotelImages.map((img, i) => (
                                    <div key={i} className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl bg-cover bg-center relative group overflow-hidden border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url(${img.base64 || img.url || DEFAULT_IMAGE})` }}>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => setHotelImages(prev => prev.filter((_, idx) => idx !== i))} className="bg-red-500 text-white rounded-full p-1.5 hover:scale-110 transition-transform shadow-lg">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        {i === 0 && <span className="absolute top-2 left-2 bg-primary text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">主图</span>}
                                    </div>
                                ))}
                                <label className="aspect-video bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                    <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">上传图片</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-primary mr-1">提示:</span> 
                                第一张图片将作为酒店的主图显示。建议上传 16:9 比例的高清图片，支持 jpg、png 格式，单张不超过 5MB。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Module 2: Facilities & Services & Policies */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. 设施、服务与政策</h2>
                    <p className="text-sm text-slate-500 mt-1">勾选酒店提供的设施服务，并设定相关预订政策。</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Facilities Grid */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">room_service</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">酒店设施</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {FACILITIES_OPTIONS.map(opt => (
                                <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                                    selectedFacilities.includes(opt.id) 
                                    ? 'bg-primary/5 border-primary/20 text-primary' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                        selectedFacilities.includes(opt.id)
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-primary/50'
                                    }`}>
                                        {selectedFacilities.includes(opt.id) && <span className="material-symbols-outlined text-xs">check</span>}
                                    </div>
                                    <input type="checkbox" className="hidden" 
                                        checked={selectedFacilities.includes(opt.id)}
                                        onChange={() => handleCheckboxChange(selectedFacilities, setSelectedFacilities, opt)} />
                                    <span className="text-xs font-bold">{opt.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* Services Grid */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">support_agent</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">酒店服务</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {SERVICES_OPTIONS.map(opt => (
                                <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                                    selectedServices.includes(opt.id) 
                                    ? 'bg-primary/5 border-primary/20 text-primary' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                        selectedServices.includes(opt.id)
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-primary/50'
                                    }`}>
                                        {selectedServices.includes(opt.id) && <span className="material-symbols-outlined text-xs">check</span>}
                                    </div>
                                    <input type="checkbox" className="hidden" 
                                        checked={selectedServices.includes(opt.id)}
                                        onChange={() => handleCheckboxChange(selectedServices, setSelectedServices, opt)} />
                                    <span className="text-xs font-bold">{opt.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* Policies Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">酒店政策</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">取消政策</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-32 resize-none text-sm dark:text-white placeholder:text-slate-400"
                                        placeholder="例如：入住前24小时可免费取消..."
                                        value={policies.cancellation} onChange={e => setPolicies({...policies, cancellation: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">儿童政策</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-32 resize-none text-sm dark:text-white placeholder:text-slate-400"
                                        placeholder="例如：不接受18岁以下客人在无监护人陪同的情况下入住..."
                                        value={policies.children} onChange={e => setPolicies({...policies, children: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">支付政策</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-32 resize-none text-sm dark:text-white placeholder:text-slate-400"
                                        placeholder="例如：支持信用卡、支付宝、微信支付..."
                                        value={policies.payment} onChange={e => setPolicies({...policies, payment: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">宠物政策</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-32 resize-none text-sm dark:text-white placeholder:text-slate-400"
                                        placeholder="例如：允许携带宠物，需额外支付清洁费..."
                                        value={policies.pets} onChange={e => setPolicies({...policies, pets: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Module 3: Room Types & Pricing */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. 房型与定价</h2>
                        <p className="text-sm text-slate-500 mt-1">管理酒店房型、客房设施及每日动态定价。</p>
                    </div>
                    <button onClick={addRoomType} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">add</span>
                        添加房型
                    </button>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roomTypes.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-300">bed</span>
                            </div>
                            <p className="text-slate-500 font-medium">尚未添加任何房型</p>
                            <p className="text-xs text-slate-400 mt-1">点击右上角按钮开始添加您的第一个房型</p>
                        </div>
                    ) : (
                        roomTypes.map((room, index) => (
                            <div key={room._tempId} className="p-8 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                            {room.name || `未命名房型 #${index + 1}`}
                                        </h3>
                                    </div>
                                    <button onClick={() => setRoomTypes(roomTypes.filter((_, i) => i !== index))} 
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        移除房型
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                    {/* Left: Room Basic Info */}
                                    <div className="xl:col-span-4 space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">房型名称</label>
                                            <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                                placeholder="如：豪华大床房"
                                                value={room.name} onChange={(e) => updateRoomType(index, 'name', e.target.value)} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">床型</label>
                                                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white"
                                                    value={room.bed_type} onChange={(e) => updateRoomType(index, 'bed_type', e.target.value)}>
                                                    <option value="king">大床 (King)</option>
                                                    <option value="queen">双人床 (Queen)</option>
                                                    <option value="twin">单人床 (Twin)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">面积</label>
                                                <div className="relative">
                                                    <input type="number" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                                        placeholder="0"
                                                        value={room.area} onChange={(e) => updateRoomType(index, 'area', e.target.value)} />
                                                    <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">m²</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">房型描述</label>
                                            <textarea className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-24 resize-none text-sm dark:text-white placeholder:text-slate-400" 
                                                placeholder="介绍房型的特色..."
                                                value={room.description} onChange={(e) => updateRoomType(index, 'description', e.target.value)}></textarea>
                                        </div>
                                        
                                        {/* Room Image Upload */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">房型图片</label>
                                            {room.images[0] ? (
                                                <div className="aspect-video bg-cover bg-center rounded-2xl relative group overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundImage: `url(${room.images[0].base64 || room.images[0].url || DEFAULT_IMAGE})` }}>
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={() => {
                                                            const newRooms = [...roomTypes];
                                                            newRooms[index].images = [];
                                                            setRoomTypes(newRooms);
                                                        }} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="block w-full aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">add_a_photo</span>
                                                    <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wider">上传房型图片</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true, index)} />
                                                </label>
                                            )}
                                        </div>

                                        {/* Room Tags */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">房型标签</label>
                                            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
                                                {room.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} className="pl-3 pr-2 py-1.5 bg-primary/5 text-primary text-[10px] font-bold rounded-lg flex items-center gap-2 border border-primary/10">
                                                        {tag}
                                                        <button onClick={() => {
                                                            const newRooms = [...roomTypes];
                                                            newRooms[index].tags = newRooms[index].tags.filter((_, i) => i !== tIdx);
                                                            setRoomTypes(newRooms);
                                                        }} className="hover:bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center transition-colors text-base leading-none">&times;</button>
                                                    </span>
                                                ))}
                                                {room.tags.length === 0 && (
                                                    <span className="text-[10px] text-slate-400 italic py-1.5">暂无房型标签</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-primary transition-all dark:text-white placeholder:text-slate-400"
                                                    value={room.tagInput} onChange={(e) => updateRoomType(index, 'tagInput', e.target.value)} 
                                                    placeholder="输入标签并回车" 
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRoomTagAdd(index))} />
                                                <button onClick={() => handleRoomTagAdd(index)} className="px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">添加</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Facilities & Pricing */}
                                    <div className="xl:col-span-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Room Facilities */}
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-primary text-lg">layers</span>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">客房设施</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-3">
                                                    {ROOM_FACILITIES_OPTIONS.map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                room.facilities.includes(opt.id)
                                                                ? 'bg-primary border-primary text-white'
                                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-primary/50'
                                                            }`}>
                                                                {room.facilities.includes(opt.id) && <span className="material-symbols-outlined text-[10px]">check</span>}
                                                            </div>
                                                            <input type="checkbox" className="hidden"
                                                                checked={room.facilities.includes(opt.id)}
                                                                onChange={() => handleRoomCheckboxChange(index, 'facilities', opt.id)} />
                                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Room Services */}
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-primary text-lg">concierge</span>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">专属服务</h4>
                                                </div>
                                                <div className="grid grid-cols-1 gap-y-3">
                                                    {ROOM_SERVICES_OPTIONS.map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                room.services.includes(opt.id)
                                                                ? 'bg-primary border-primary text-white'
                                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-primary/50'
                                                            }`}>
                                                                {room.services.includes(opt.id) && <span className="material-symbols-outlined text-[10px]">check</span>}
                                                            </div>
                                                            <input type="checkbox" className="hidden"
                                                                checked={room.services.includes(opt.id)}
                                                                onChange={() => handleRoomCheckboxChange(index, 'services', opt.id)} />
                                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing Calendar UI */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">每日定价 (未来30天)</h4>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] text-slate-400 animate-pulse hidden md:inline-flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">swipe_left</span>
                                                        左右滑动查看更多
                                                    </span>
                                                    <button 
                                                        onClick={() => setBatchPrice({ ...batchPrice, roomIndex: index })}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit_calendar</span>
                                                        批量设置价格
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                                                <div className="flex divide-x divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide">
                                                    {Array.from({ length: 30 }).map((_, dIdx) => {
                                                        const priceDates = Object.keys(room.prices || {}).sort();
                                                        const baseDate = priceDates.length ? new Date(priceDates[0]) : new Date();
                                                        const safeBaseDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;
                                                        const date = new Date(safeBaseDate);
                                                        date.setDate(safeBaseDate.getDate() + dIdx);
                                                        const dateStr = date.toISOString().split('T')[0];
                                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                                        const price = room.prices[dateStr] || '';

                                                        return (
                                                            <div key={dIdx} className="flex-1 min-w-[100px] p-4 text-center">
                                                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isWeekend ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                    {new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date)}
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                                                    {date.getDate()}
                                                                </div>
                                                                <div className="relative">
                                                                    <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">¥</span>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full pl-5 pr-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white placeholder:text-slate-400"
                                                                        value={price} 
                                                                        onChange={(e) => {
                                                                            const newRooms = [...roomTypes];
                                                                            newRooms[index].prices[dateStr] = parseFloat(e.target.value);
                                                                            setRoomTypes(newRooms);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-1">
                                                <span className="material-symbols-outlined text-xs">info</span>
                                                修改价格将实时同步到各预订渠道。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      </div>

      {/* Batch Price Modal */}
      {batchPrice.roomIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined">edit_calendar</span>
                      </div>
                      <div>
                          <h3 className="font-bold text-xl text-slate-900 dark:text-white">批量设置价格</h3>
                          <p className="text-xs text-slate-500 mt-0.5">为选定日期范围统一设置房价。</p>
                      </div>
                  </div>

                  <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">开始日期</label>
                              <div className="relative">
                                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                      value={batchPrice.startDate} onChange={e => setBatchPrice({...batchPrice, startDate: e.target.value})} />
                                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">calendar_today</span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">结束日期</label>
                              <div className="relative">
                                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm dark:text-white placeholder:text-slate-400" 
                                      value={batchPrice.endDate} onChange={e => setBatchPrice({...batchPrice, endDate: e.target.value})} />
                                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">event</span>
                              </div>
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">每日房价 (CNY)</label>
                          <div className="relative">
                              <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">¥</span>
                              <input type="number" className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-bold text-primary dark:text-white placeholder:text-slate-400" 
                                  placeholder="0.00"
                                  value={batchPrice.price} onChange={e => setBatchPrice({...batchPrice, price: e.target.value})} />
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                        onClick={() => setBatchPrice({...batchPrice, roomIndex: null})} 
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 rounded-xl transition-all active:scale-95"
                      >
                        取消
                      </button>
                      <button 
                        onClick={applyBatchPrice} 
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">done_all</span>
                        确认应用
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
