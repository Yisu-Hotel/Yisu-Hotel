const assert = require('assert');
const { isValidUuid } = require('../../utils/validator');

assert.strictEqual(isValidUuid('550e8400-e29b-41d4-a716-446655440001'), true);
assert.strictEqual(isValidUuid('550E8400-E29B-41D4-A716-446655440001'), true);
assert.strictEqual(isValidUuid('invalid-id'), false);
assert.strictEqual(isValidUuid(''), false);
assert.strictEqual(isValidUuid(null), false);

console.log('validator utils tests passed');
