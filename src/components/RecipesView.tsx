/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Recipe, FoodItem, MealType } from '../types';
import { DESHI_RECIPES } from '../data/bangladeshiFoods';
import { Coffee, Clock, Plus, Check, Lightbulb } from 'lucide-react';

interface RecipesViewProps {
  onLogFood: (food: FoodItem, servings: number, mealType: MealType) => void;
  lang: 'en' | 'bn';
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  onLogFood,
  lang,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogRecipe = (recipe: Recipe) => {
    // Construct virtual food item from recipe
    const virtualFood: FoodItem = {
      id: `recipe-food-${recipe.id}`,
      nameEn: recipe.titleEn,
      nameBn: recipe.titleBn,
      category: 'shakes',
      servingSizeEn: '1 complete recipe serving',
      servingSizeBn: '১ সম্পূর্ণ রেসিপি সার্ভিং',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      estimatedPriceBdt: recipe.approxCostBdt,
      marketUnitEn: 'Per serving',
      marketUnitBn: 'সার্ভিং প্রতি',
      availability: 'high',
      weightGainTipEn: recipe.proTipEn,
      weightGainTipBn: recipe.proTipBn,
      iconType: 'cup',
    };

    onLogFood(virtualFood, 1, 'evening_shake');
    setToastMessage(
      lang === 'bn'
        ? `"${recipe.titleBn}" বিকাল/সন্ধ্যার নাস্তায় যুক্ত হয়েছে!`
        : `Logged "${recipe.titleEn}" to your afternoon routine!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-2">
        <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-400" />
          {lang === 'bn' ? 'দেশি হাই-ক্যালরি শেক ও রেসিপি' : 'Deshi High-Calorie Shakes & Recipes'}
        </h1>
        <p className="text-xs text-zinc-400">
          {lang === 'bn'
            ? 'খাবারের রুচি কম থাকলেও তরল ও মুখরোচক উপায়ে সহজে ৫০০-৭০০ ক্যালরি যোগ করার গোপন সূত্র।'
            : 'Liquid calories and delicious combos: drink 500-700 calories in 3 minutes without feeling stuffed.'}
        </p>
      </section>

      {/* Recipes Cards */}
      <div className="space-y-4">
        {DESHI_RECIPES.map((recipe) => (
          <div
            key={recipe.id}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? recipe.titleBn : recipe.titleEn}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {lang === 'bn' ? recipe.subtitleBn : recipe.subtitleEn}
                </p>
              </div>

              <button
                onClick={() => handleLogRecipe(recipe)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'আজকের ডায়েরিতে যোগ করুন' : '+ Log Recipe'}</span>
              </button>
            </div>

            {/* Quick Stats: Calories, Protein, Carbs, Prep */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 block font-medium">Calories</span>
                <strong className="text-white text-sm font-black">{recipe.calories}</strong>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
                <span className="text-[10px] text-emerald-400 block font-medium">Protein</span>
                <strong className="text-emerald-300 text-sm font-black">{recipe.protein}g</strong>
              </div>
              <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-900/50">
                <span className="text-[10px] text-blue-400 block font-medium">Carbs</span>
                <strong className="text-blue-300 text-sm font-black">{recipe.carbs}g</strong>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 block font-medium flex items-center justify-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> Prep
                </span>
                <strong className="text-white text-sm font-black">{recipe.prepTimeMinutes}m</strong>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {lang === 'bn' ? 'প্রয়োজনীয় পুষ্টিকর উপাদান:' : 'Nutritious Ingredients:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recipe.ingredients.map((ing, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-800/60 border border-zinc-800"
                  >
                    <div>
                      <span className="font-medium text-white block">
                        {lang === 'bn' ? ing.itemBn : ing.itemEn}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {lang === 'bn' ? ing.amountBn : ing.amountEn}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {lang === 'bn' ? 'পুষ্টিকর' : 'Nutrition'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {lang === 'bn' ? 'বানানোর সহজ নিয়ম:' : 'Step-by-Step Instructions:'}
              </h4>
              <ol className="space-y-1.5 text-xs text-zinc-300">
                {(lang === 'bn' ? recipe.stepsBn : recipe.stepsEn).map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-zinc-700 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Bachelor & Student Pro-Tip */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 font-bold">
                  {lang === 'bn' ? 'মেস বা ব্যাচেলরদের জন্য হ্যাক:' : 'Bachelor / Student Hack:'}
                </strong>{' '}
                {lang === 'bn' ? recipe.proTipBn : recipe.proTipEn}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
