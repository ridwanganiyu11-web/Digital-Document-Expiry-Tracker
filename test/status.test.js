import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDocumentStatus } from '../src/services/blockchain.js';

test('Status computation logic', async (t) => {
  const now = Math.floor(Date.now() / 1000);

  await t.test('returns 0 for null/undefined doc', () => {
    assert.equal(computeDocumentStatus(null), 0);
  });

  await t.test('returns 5 (Revoked) if isRevoked is true regardless of date', () => {
    const doc = {
      isRevoked: true,
      expiryTimestamp: now + 100000
    };
    assert.equal(computeDocumentStatus(doc), 5);
  });

  await t.test('returns 4 (Expired) if expiryTimestamp is in the past', () => {
    const doc = {
      isRevoked: false,
      expiryTimestamp: now - 3600
    };
    assert.equal(computeDocumentStatus(doc), 4);
  });

  await t.test('returns 3 (Critical) if expiry is within 7 days', () => {
    const doc = {
      isRevoked: false,
      expiryTimestamp: now + (4 * 86400) // 4 days from now
    };
    assert.equal(computeDocumentStatus(doc), 3);
  });

  await t.test('returns 2 (Expiring Soon) if expiry is between 8 and 30 days', () => {
    const doc = {
      isRevoked: false,
      expiryTimestamp: now + (20 * 86400) // 20 days from now
    };
    assert.equal(computeDocumentStatus(doc), 2);
  });

  await t.test('returns 1 (Valid) if expiry is more than 30 days away', () => {
    const doc = {
      isRevoked: false,
      expiryTimestamp: now + (90 * 86400) // 90 days from now
    };
    assert.equal(computeDocumentStatus(doc), 1);
  });
});

