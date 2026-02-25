const assert = require('assert');
const { formatAuditLogs, getAuditStatusText, getAuditorName } = require('../../utils/hotel');

const auditorWithProfile = {
  id: 'auditor-1',
  phone: '13800138000',
  profile: { nickname: '管理员' }
};

const auditorWithNickname = {
  id: 'auditor-2',
  nickname: '张三'
};

const logs = [
  {
    hotel_id: 'hotel-1',
    result: 'approved',
    created_at: '2026-02-05T10:00:00.000Z',
    audited_at: '2026-02-05T12:00:00.000Z',
    auditor_id: 'auditor-1',
    auditor: auditorWithProfile
  },
  {
    hotel_id: 'hotel-1',
    result: 'rejected',
    created_at: '2026-02-04T10:00:00.000Z',
    audited_at: '2026-02-04T12:00:00.000Z',
    reject_reason: '信息不完整',
    auditor_id: 'auditor-2',
    auditor: auditorWithNickname
  }
];

assert.strictEqual(getAuditStatusText('approved'), '已通过');
assert.strictEqual(getAuditStatusText('rejected'), '已拒绝');
assert.strictEqual(getAuditStatusText('pending'), '待审核');

assert.strictEqual(getAuditorName(auditorWithProfile), '管理员');
assert.strictEqual(getAuditorName(auditorWithNickname), '张三');

const formatted = formatAuditLogs(logs);
assert.strictEqual(formatted.length, 2);
assert.strictEqual(formatted[0].hotel_id, 'hotel-1');
assert.strictEqual(formatted[0].status, 'approved');
assert.strictEqual(formatted[0].status_text, '已通过');
assert.strictEqual(formatted[0].audited_by, '管理员');
assert.strictEqual(formatted[1].status, 'rejected');
assert.strictEqual(formatted[1].status_text, '已拒绝');
assert.strictEqual(formatted[1].reject_reason, '信息不完整');

console.log('audit-status utils tests passed');
