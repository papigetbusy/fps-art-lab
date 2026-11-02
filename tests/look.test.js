import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, pickPreset } from '../src/look/presets.js';

test('The phone preset never costs more than the high preset', () => {
  const p = PRESETS.phone, h = PRESETS.high;
  assert.ok(p.pixelRatio <= h.pixelRatio && p.shadowMap <= h.shadowMap && p.msaa <= h.msaa);
  assert.ok(p.groundTexture <= h.groundTexture && p.bloom.scale <= h.bloom.scale);
});
test('Textures stay within the 1024 px budget', () => {
  for (const preset of Object.values(PRESETS)) assert.ok(preset.groundTexture <= 1024);
});
test('An unknown preset name falls back to the phone preset', () => {
  assert.equal(pickPreset('nonsense'), PRESETS.phone);
  assert.equal(pickPreset(undefined), PRESETS.phone);
});
test('Both presets define every look setting', () => {
  for (const preset of Object.values(PRESETS)) {
    for (const key of ['pixelRatio', 'shadowMap', 'groundTexture', 'msaa', 'exposure', 'bloom', 'grade']) assert.ok(key in preset, key);
    for (const key of ['strength', 'radius', 'threshold', 'scale']) assert.ok(key in preset.bloom, key);
    for (const key of ['vignette', 'saturation', 'shadowLift', 'goldHighlights']) assert.ok(key in preset.grade, key);
  }
});
