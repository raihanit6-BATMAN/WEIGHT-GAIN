/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BANGLADESHI_FOODS } from '../data/bangladeshiFoods';

describe('Fast Food Search and Consolidation', () => {
  it('contains everyday staples (dim, rice, ruti, chicken, fish, milk, banana)', () => {
    const ids = BANGLADESHI_FOODS.map((f) => f.id.toLowerCase());
    assert.ok(ids.some((id) => id.includes('dim')));
    assert.ok(ids.some((id) => id.includes('bhaat') || id.includes('rice')));
    assert.ok(ids.some((id) => id.includes('ruti') || id.includes('paratha')));
    assert.ok(ids.some((id) => id.includes('murgi') || id.includes('chicken')));
    assert.ok(ids.some((id) => id.includes('mach') || id.includes('fish')));
    assert.ok(ids.some((id) => id.includes('milk') || id.includes('dudh')));
    assert.ok(ids.some((id) => id.includes('kola')));
  });

  it('contains authentic Ghoroya Ranna (Panchmishali Sobji, Shak Bhaji, Alu/Potol Torkari, Dals)', () => {
    const ids = BANGLADESHI_FOODS.map((f) => f.id);
    assert.ok(ids.includes('panchmishali-sobji'));
    assert.ok(ids.includes('shak-bhaji-oil'));
    assert.ok(ids.includes('potol-alu-lau-torkari'));
    assert.ok(ids.includes('patla-masoor-dal'));
    assert.ok(ids.includes('ghon-bhuna-dal'));
    assert.ok(ids.includes('cholar-booter-dal'));
  });

  it('contains Street & Outside Snacks (Singara, Somosa, Puri, Muglai Porota, Dudh Cha, Lal Cha, Roll, Biscuit)', () => {
    const ids = BANGLADESHI_FOODS.map((f) => f.id);
    assert.ok(ids.includes('singara-hot'));
    assert.ok(ids.includes('somosa-hot'));
    assert.ok(ids.includes('dal-alu-puri'));
    assert.ok(ids.includes('mughlai-paratha'));
    assert.ok(ids.includes('dudh-cha-sweet'));
    assert.ok(ids.includes('lal-cha-sweet'));
    assert.ok(ids.includes('chola-boot-outside'));
    assert.ok(ids.includes('chicken-roll-shawarma'));
    assert.ok(ids.includes('bakery-biscuit-toast'));
  });

  it('contains Quick Fallback Items (150kcal, 300kcal, 650kcal)', () => {
    const ids = BANGLADESHI_FOODS.map((f) => f.id);
    assert.ok(ids.includes('quick-light-snack-150'));
    assert.ok(ids.includes('quick-medium-snack-300'));
    assert.ok(ids.includes('quick-heavy-meal-650'));

    const light = BANGLADESHI_FOODS.find((f) => f.id === 'quick-light-snack-150');
    assert.strictEqual(light?.calories, 150);

    const med = BANGLADESHI_FOODS.find((f) => f.id === 'quick-medium-snack-300');
    assert.strictEqual(med?.calories, 300);

    const heavy = BANGLADESHI_FOODS.find((f) => f.id === 'quick-heavy-meal-650');
    assert.strictEqual(heavy?.calories, 650);
  });
});
