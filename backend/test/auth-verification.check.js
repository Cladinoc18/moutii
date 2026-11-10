const assert = require('assert');

// Self-check for auth email verification & anti-bot logic
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function validateCode(user, inputCode) {
  if (user.isVerified) {
    return { ok: true, alreadyVerified: true };
  }
  if (!user.verificationCode || user.verificationCode !== inputCode.trim()) {
    throw new Error('El código de verificación es incorrecto');
  }
  if (user.verificationExpires && new Date(user.verificationExpires).getTime() < Date.now()) {
    throw new Error('El código ha expirado. Solicita un nuevo código.');
  }
  return { ok: true };
}

function checkResendCooldown(lastCodeSentAt, now = Date.now()) {
  const cooldownMs = 60000;
  const lastSent = lastCodeSentAt ? new Date(lastCodeSentAt).getTime() : 0;
  if (now - lastSent < cooldownMs) {
    const waitSec = Math.ceil((cooldownMs - (now - lastSent)) / 1000);
    throw new Error(`Por favor espera ${waitSec} segundos antes de solicitar otro código.`);
  }
  return true;
}

// 1. Code format test
for (let i = 0; i < 20; i++) {
  const code = generateCode();
  assert.strictEqual(typeof code, 'string');
  assert.strictEqual(code.length, 6);
  assert.ok(/^\d{6}$/.test(code), `Code ${code} must be 6 digits`);
}

// 2. Verification matching test
const mockUser = {
  isVerified: false,
  verificationCode: '849201',
  verificationExpires: new Date(Date.now() + 15 * 60 * 1000),
};
assert.throws(() => validateCode(mockUser, '000000'), /El código de verificación es incorrecto/);
assert.ok(validateCode(mockUser, '849201').ok);

// 3. Expiration test
const expiredUser = {
  isVerified: false,
  verificationCode: '123456',
  verificationExpires: new Date(Date.now() - 1000),
};
assert.throws(() => validateCode(expiredUser, '123456'), /El código ha expirado/);

// 4. Cooldown test
const recentTime = new Date(Date.now() - 30000); // 30s ago
assert.throws(() => checkResendCooldown(recentTime), /Por favor espera/);

const oldTime = new Date(Date.now() - 65000); // 65s ago
assert.strictEqual(checkResendCooldown(oldTime), true);

console.log('✔ Auth email verification self-check passed successfully.');
