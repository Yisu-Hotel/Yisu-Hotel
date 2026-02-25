import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAccountAvailable, login, register, resetPassword, sendAuthCode } from '../../utils/api';

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 20;
}

function validateCode(code) {
  return /^\d{6}$/.test(code);
}

function saveToken(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
}

function getRolePath(role) {
  if (role === 'admin') {
    return '/admin';
  }
  return '/merchant';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerCode, setRegisterCode] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('merchant');
  const [registerAgreed, setRegisterAgreed] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isRegisterSending, setIsRegisterSending] = useState(false);
  const [isForgotSending, setIsForgotSending] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const successTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    document.title = '商户登录与注册 | 易宿';
    document.documentElement.classList.add('light');

    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user?.role) {
      navigate(getRolePath(user.role), { replace: true });
    } else if (token || user) {
      clearToken();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setShowErrorMessage(false);
    }, 5000);
  };

  const startCountdown = (target) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setCountdownTarget(target);
    setCountdownSeconds(60);
    countdownRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdownTarget(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  async function sendCode(phone, type) {
    try {
      const { result } = await sendAuthCode(phone, type);
      if (result.code === 0) {
        showSuccess('验证码已发送');
        return true;
      }
      showError(result.msg || '验证码发送失败');
      return false;
    } catch (error) {
      showError('网络错误，请稍后重试');
      return false;
    }
  }

  async function checkAccount(phone) {
    return checkAccountAvailable(phone);
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!validatePhone(loginPhone)) {
      showError('手机号格式不正确');
      return;
    }

    if (!validatePassword(loginPassword)) {
      showError('密码长度应为6-20位');
      return;
    }

    setIsLoginSubmitting(true);
    try {
      const requestBody = { phone: loginPhone, password: loginPassword };
      if (rememberMe) {
        requestBody.token_expires_in = 60 * 60 * 24 * 30;
      }

      const { result } = await login(requestBody);
      if (result.code === 0) {
        if (result.data?.token && result.data?.user) {
          saveToken(result.data.token, result.data.user);
        }
        showSuccess('登录成功');
        const role = result.data?.user?.role;
        if (!role) {
          clearToken();
          showError('无法识别用户身份');
          return;
        }
        redirectTimeoutRef.current = setTimeout(() => {
          navigate(getRolePath(role), { replace: true });
        }, 1000);
      } else {
        showError(result.msg || '登录失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleRegisterSendCode = async () => {
    if (!validatePhone(registerPhone)) {
      showError('手机号格式不正确');
      return;
    }

    const isAvailable = await checkAccount(registerPhone);
    if (!isAvailable) {
      showError('该手机号已被注册');
      return;
    }

    setIsRegisterSending(true);
    const success = await sendCode(registerPhone, 'register');
    if (success) {
      startCountdown('register');
    }
    setIsRegisterSending(false);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!validatePhone(registerPhone)) {
      showError('手机号格式不正确');
      return;
    }

    if (!validateCode(registerCode)) {
      showError('验证码格式不正确');
      return;
    }

    if (!validatePassword(registerPassword)) {
      showError('密码长度应为6-20位');
      return;
    }

    if (!registerAgreed) {
      showError('请同意用户协议与隐私政策');
      return;
    }

    setIsRegisterSubmitting(true);
    try {
      const { result } = await register({
        phone: registerPhone,
        password: registerPassword,
        code: registerCode,
        role: registerRole,
        agreed: registerAgreed
      });
      if (result.code === 0) {
        if (result.data?.token && result.data?.user) {
          saveToken(result.data.token, result.data.user);
        }
        showSuccess('注册成功');
        const role = result.data?.user?.role;
        if (!role) {
          clearToken();
          showError('无法识别用户身份');
          return;
        }
        redirectTimeoutRef.current = setTimeout(() => {
          navigate(getRolePath(role), { replace: true });
        }, 1000);
      } else {
        showError(result.msg || '注册失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleForgotSendCode = async () => {
    if (!validatePhone(forgotPhone)) {
      showError('手机号格式不正确');
      return;
    }

    setIsForgotSending(true);
    const success = await sendCode(forgotPhone, 'reset');
    if (success) {
      startCountdown('forgot');
    }
    setIsForgotSending(false);
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();

    if (!validatePhone(forgotPhone)) {
      showError('手机号格式不正确');
      return;
    }

    if (!validateCode(forgotCode)) {
      showError('验证码格式不正确');
      return;
    }

    if (!validatePassword(forgotPassword)) {
      showError('密码长度应为6-20位');
      return;
    }

    setIsForgotSubmitting(true);
    try {
      const { result } = await resetPassword({
        phone: forgotPhone,
        code: forgotCode,
        new_password: forgotPassword
      });
      if (result.code === 0) {
        showSuccess('密码重置成功');
        resetTimeoutRef.current = setTimeout(() => {
          setActiveTab('login');
        }, 1500);
      } else {
        showError(result.msg || '密码重置失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const registerCountdownActive = countdownTarget === 'register' && countdownSeconds > 0;
  const forgotCountdownActive = countdownTarget === 'forgot' && countdownSeconds > 0;
  const backgroundImageUrl = `${process.env.PUBLIC_URL}/img/unnamed.png`;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      <div className="flex h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            data-alt="Luxury modern hotel lobby with high ceilings and elegant lighting"
            style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/30">
                <span className="material-symbols-outlined text-white text-3xl">domain</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                易宿 <span className="font-light opacity-80">商户平台</span>
              </h1>
            </div>
            <div className="max-w-md">
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">用易宿赋能您的酒店业务。</h2>
              <p className="text-lg text-slate-200 mb-8 font-light">
                加入超过 5,000+ 家顶级酒店，使用我们的统一平台管理运营、预订和宾客体验。
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary rounded-full p-1">
                    <span className="material-symbols-outlined text-white text-sm leading-none">check</span>
                  </div>
                  <p className="text-sm font-medium">跨所有渠道的实时库存管理</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary rounded-full p-1">
                    <span className="material-symbols-outlined text-white text-sm leading-none">check</span>
                  </div>
                  <p className="text-sm font-medium">高级分析和收入报告</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary rounded-full p-1">
                    <span className="material-symbols-outlined text-white text-sm leading-none">check</span>
                  </div>
                  <p className="text-sm font-medium">无缝入住和数字宾客服务</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400">© 2024 易宿管理系统有限公司。保留所有权利。</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">domain</span>
              <h2 className="text-xl font-bold">易宿</h2>
            </div>
            <button className="text-sm text-primary font-semibold" type="button">
              帮助中心
            </button>
          </div>
          <div className="px-6 sm:px-12 lg:px-24 pt-16 pb-4">
            <div className="w-full max-w-[440px] mx-auto">
              <div className="mb-6 lg:block hidden">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">欢迎您！</h3>
                <p className="text-slate-500 dark:text-slate-400">管理您的酒店业务与运营数据。</p>
              </div>

              <div className="mb-6" id="tab-container" style={{ display: activeTab === 'forgot' ? 'none' : 'block' }}>
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                  <button
                    className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'login' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    data-tab="login"
                    type="button"
                    onClick={() => setActiveTab('login')}
                  >
                    登录
                  </button>
                  <button
                    className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    data-tab="register"
                    type="button"
                    onClick={() => setActiveTab('register')}
                  >
                    注册
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-24 pb-8">
            <div className="w-full max-w-[440px] mx-auto">
              <div
                id="error-message"
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg ${showErrorMessage ? 'block' : 'hidden'}`}
              >
                <p id="error-text" className="text-sm text-red-600">
                  {errorMessage}
                </p>
              </div>

              <div
                id="success-message"
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-green-50 border border-green-200 rounded-lg shadow-lg ${showSuccessMessage ? 'block' : 'hidden'}`}
              >
                <p id="success-text" className="text-sm text-green-600">
                  {successMessage}
                </p>
              </div>

              <form id="login-form" className={`space-y-5 ${activeTab === 'login' ? 'block' : 'hidden'}`} onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="login-phone">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">phone</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="login-phone"
                      placeholder="请输入手机号"
                      type="text"
                      value={loginPhone}
                      onChange={(event) => setLoginPhone(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="login-password">
                      密码
                    </label>
                    <a
                      className="text-xs font-bold text-primary hover:underline"
                      href="#"
                      id="forgot-password-link"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveTab('forgot');
                      }}
                    >
                      忘记密码？
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="login-password"
                      placeholder="••••••••"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      id="login-password-toggle"
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400" htmlFor="remember-me">
                    保持登录状态 30 天
                  </label>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  id="login-btn"
                  type="submit"
                  disabled={isLoginSubmitting}
                >
                  {isLoginSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      登录中...
                    </>
                  ) : (
                    <>
                      <span>登录到仪表板</span>
                      <span className="material-symbols-outlined text-sm">login</span>
                    </>
                  )}
                </button>
              </form>

              <form id="register-form" className={`space-y-5 ${activeTab === 'register' ? 'block' : 'hidden'}`} onSubmit={handleRegisterSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="register-phone">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">phone</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="register-phone"
                      placeholder="请输入手机号"
                      type="text"
                      value={registerPhone}
                      onChange={(event) => setRegisterPhone(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="register-code">
                    验证码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">verified_user</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-28 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="register-code"
                      placeholder="请输入验证码"
                      type="text"
                      value={registerCode}
                      onChange={(event) => setRegisterCode(event.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 px-3 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                      id="register-send-code"
                      type="button"
                      disabled={isRegisterSending || registerCountdownActive}
                      onClick={handleRegisterSendCode}
                    >
                      {registerCountdownActive ? `${countdownSeconds}秒后重发` : '发送验证码'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="register-password">
                    密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="register-password"
                      placeholder="请输入密码（6-20位）"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      id="register-password-toggle"
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        {showRegisterPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">角色</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300"
                        id="role-merchant"
                        name="role"
                        type="radio"
                        value="merchant"
                        checked={registerRole === 'merchant'}
                        onChange={(event) => setRegisterRole(event.target.value)}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">商户</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300"
                        id="role-admin"
                        name="role"
                        type="radio"
                        value="admin"
                        checked={registerRole === 'admin'}
                        onChange={(event) => setRegisterRole(event.target.value)}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">管理员</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded mt-1"
                    id="register-agreed"
                    type="checkbox"
                    checked={registerAgreed}
                    onChange={(event) => setRegisterAgreed(event.target.checked)}
                  />
                  <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400" htmlFor="register-agreed">
                    我已阅读并同意
                    <a className="text-primary hover:underline" href="#">
                      用户协议
                    </a>
                    与
                    <a className="text-primary hover:underline" href="#">
                      隐私政策
                    </a>
                  </label>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  id="register-btn"
                  type="submit"
                  disabled={isRegisterSubmitting}
                >
                  {isRegisterSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      注册中...
                    </>
                  ) : (
                    <>
                      <span>注册账号</span>
                      <span className="material-symbols-outlined text-sm">person_add</span>
                    </>
                  )}
                </button>
              </form>

              <form id="forgot-form" className={`space-y-5 ${activeTab === 'forgot' ? 'block' : 'hidden'}`} onSubmit={handleForgotSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="forgot-phone">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">phone</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="forgot-phone"
                      placeholder="请输入手机号"
                      type="text"
                      value={forgotPhone}
                      onChange={(event) => setForgotPhone(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="forgot-code">
                    验证码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">verified_user</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-28 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="forgot-code"
                      placeholder="请输入验证码"
                      type="text"
                      value={forgotCode}
                      onChange={(event) => setForgotCode(event.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 px-3 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                      id="forgot-send-code"
                      type="button"
                      disabled={isForgotSending || forgotCountdownActive}
                      onClick={handleForgotSendCode}
                    >
                      {forgotCountdownActive ? `${countdownSeconds}秒后重发` : '发送验证码'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="forgot-password">
                    新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      id="forgot-password"
                      placeholder="请输入新密码（6-20位）"
                      type={showForgotPassword ? 'text' : 'password'}
                      value={forgotPassword}
                      onChange={(event) => setForgotPassword(event.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      id="forgot-password-toggle"
                      type="button"
                      onClick={() => setShowForgotPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        {showForgotPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  id="forgot-btn"
                  type="submit"
                  disabled={isForgotSubmitting}
                >
                  {isForgotSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      重置中...
                    </>
                  ) : (
                    <>
                      <span>重置密码</span>
                      <span className="material-symbols-outlined text-sm">lock_reset</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <a
                    className="text-sm text-primary font-bold hover:underline"
                    href="#"
                    id="back-to-login"
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveTab('login');
                    }}
                  >
                    返回登录
                  </a>
                </div>
              </form>

              <div id="social-login" className="my-6" style={{ display: activeTab === 'login' ? 'block' : 'none' }}>
                <div className="flex items-center before:flex-1 before:border-t before:border-slate-200 dark:before:border-slate-700 after:flex-1 after:border-t after:border-slate-200 dark:after:border-slate-700">
                  <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">或使用以下方式登录</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" type="button">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"
                        fill="#1296db"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">微信登录</span>
                  </button>
                  <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" type="button">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"
                        fill="#12B7F5"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">QQ登录</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center" id="footer-text" style={{ display: activeTab === 'forgot' ? 'none' : 'block' }}>
                {activeTab === 'register' ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    已有账号？
                    <a
                      className="text-primary font-bold hover:underline"
                      href="#"
                      id="go-to-login"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveTab('login');
                      }}
                    >
                      立即登录
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    还没有商户账号？
                    <a
                      className="text-primary font-bold hover:underline"
                      href="#"
                      id="go-to-register"
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveTab('register');
                      }}
                    >
                      免费开始
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
