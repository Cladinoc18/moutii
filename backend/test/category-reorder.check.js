const assert = require('assert');

// Self-check for category reordering bulkWrite logic
function generateReorderOps(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Se requiere una lista de IDs de categorías');
  }
  return ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index + 1 } },
    },
  }));
}

// 1. Validations
assert.throws(() => generateReorderOps([]), /Se requiere una lista de IDs/);
assert.throws(() => generateReorderOps(null), /Se requiere una lista de IDs/);

// 2. 1-based order index assignment
const ops = generateReorderOps(['cat-1', 'cat-2', 'cat-3']);
assert.strictEqual(ops.length, 3);
assert.deepStrictEqual(ops[0], { updateOne: { filter: { _id: 'cat-1' }, update: { $set: { order: 1 } } } });
assert.deepStrictEqual(ops[1], { updateOne: { filter: { _id: 'cat-2' }, update: { $set: { order: 2 } } } });
assert.deepStrictEqual(ops[2], { updateOne: { filter: { _id: 'cat-3' }, update: { $set: { order: 3 } } } });

console.log('✔ Category reorder self-check passed successfully.');

