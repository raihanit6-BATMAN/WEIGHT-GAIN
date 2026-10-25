/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GroceryItem } from '../types';
import { ShoppingBag, Plus, Trash2, Check, Copy, CheckSquare, Square, CheckCircle2 } from 'lucide-react';

interface GroceryBazaarViewProps {
  groceryList: GroceryItem[];
  onUpdateGroceryList: (list: GroceryItem[]) => void;
  lang: 'en' | 'bn';
}

export const GroceryBazaarView: React.FC<GroceryBazaarViewProps> = ({
  groceryList,
  onUpdateGroceryList,
  lang,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1 kg');
  const [newItemCategory, setNewItemCategory] = useState('Protein');
  const [copiedToast, setCopiedToast] = useState(false);

  const completedCount = groceryList.filter((item) => item.checked).length;
  const remainingCount = groceryList.length - completedCount;

  const toggleItem = (id: string) => {
    const updated = groceryList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onUpdateGroceryList(updated);
  };

  const deleteItem = (id: string) => {
    const updated = groceryList.filter((item) => item.id !== id);
    onUpdateGroceryList(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryItem = {
      id: `g-custom-${Date.now()}`,
      nameEn: newItemName,
      nameBn: newItemName,
      categoryEn: newItemCategory,
      categoryBn: newItemCategory,
      amountEn: newItemAmount,
      amountBn: newItemAmount,
      estimatedPriceBdt: 0,
      isEssential: false,
      checked: false,
    };

    onUpdateGroceryList([newItem, ...groceryList]);
    setNewItemName('');
    setShowAddModal(false);
  };

  const handleCopyList = () => {
    const textList = groceryList
      .map(
        (item) =>
          `[${item.checked ? 'X' : ' '}] ${item.nameEn} (${item.amountEn}) - ${item.categoryEn}`
      )
      .join('\n');
    const header = `ShasthoGain BD - Weekly Healthy Grocery Checklist (${completedCount}/${groceryList.length} items collected):\n\n`;
    navigator.clipboard.writeText(header + textList);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>
            {lang === 'bn' ? 'চেকলিস্ট ক্লিপবোর্ডে কপি হয়েছে!' : 'Checklist copied to clipboard!'}
          </span>
        </div>
      )}

      {/* Header & Status Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {lang === 'bn' ? 'সাপ্তাহিক পুষ্টিকর বাজারের চেকলিস্ট' : 'Weekly Healthy Grocery Checklist'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'bn'
                ? 'ওজন বাড়াতে প্রয়োজনীয় পুষ্টিকর দেশি খাদ্য সামগ্রীর তালিকা। বাজারে গিয়ে সহজে মিলিয়ে নিন।'
                : 'Essential Bangladeshi whole foods for healthy weight gain. Check items off as you stock up.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyList}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors"
              title="Copy checklist"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কপি করুন' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আইটেম যোগ' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              {lang === 'bn' ? 'মোট খাদ্যদ্রব্য' : 'Total Staples'}
            </span>
            <p className="text-lg font-black text-white mt-0.5">
              {groceryList.length} <span className="text-xs font-normal text-zinc-400">{lang === 'bn' ? 'টি' : 'items'}</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              {lang === 'bn' ? 'কেনা সম্পন্ন' : 'In Kitchen'}
            </span>
            <p className="text-lg font-black text-emerald-300 mt-0.5">
              {completedCount} <span className="text-xs font-normal text-emerald-400">{lang === 'bn' ? 'টি' : 'ready'}</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/50">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              {lang === 'bn' ? 'বাকি আছে' : 'To Buy'}
            </span>
            <p className="text-lg font-black text-amber-300 mt-0.5">
              {remainingCount} <span className="text-xs font-normal text-amber-400">{lang === 'bn' ? 'টি' : 'left'}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Grocery Items List */}
      <div className="space-y-2">
        {groceryList.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
              item.checked
                ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                type="button"
                className={`p-1 rounded-md transition-colors ${
                  item.checked ? 'text-emerald-400' : 'text-zinc-500'
                }`}
                aria-label={`Toggle ${item.nameEn}`}
              >
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold truncate block ${
                      item.checked ? 'line-through text-zinc-400' : 'text-white'
                    }`}
                  >
                    {lang === 'bn' ? item.nameBn : item.nameEn}
                  </span>
                  {item.isEssential && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {lang === 'bn' ? 'অপরিহার্য' : 'Must-Have'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  {lang === 'bn' ? item.amountBn : item.amountEn} · {lang === 'bn' ? item.categoryBn : item.categoryEn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.checked
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {item.checked ? (lang === 'bn' ? 'কেনা হয়েছে' : 'Ready') : (lang === 'bn' ? 'প্রয়োজন' : 'Need')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
                className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                title="Remove"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-zinc-100">
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'নতুন খাদ্য আইটেম যোগ করুন' : 'Add New Grocery Item'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'bn' ? 'খাবারের নাম ও প্রয়োজনীয় পরিমাণ লিখুন' : 'Enter staple food name and target quantity'}
              </p>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label htmlFor="bazaar-item-name" className="block font-medium text-zinc-300 mb-1">
                  {lang === 'bn' ? 'খাবারের নাম' : 'Item Name'}
                </label>
                <input
                  id="bazaar-item-name"
                  type="text"
                  placeholder="যেমন: খাসির মাংস, কাজুবাদাম, ছানা, খেজুর..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bazaar-item-amount" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'পরিমাণ' : 'Amount / Quantity'}
                  </label>
                  <input
                    id="bazaar-item-amount"
                    type="text"
                    placeholder="১ কেজি / ২ প্যাকেট / ১ ডজন"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="bazaar-item-category" className="block font-medium text-zinc-300 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    id="bazaar-item-category"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Protein">Protein (প্রোটিন)</option>
                    <option value="Carbs">Carbs (কার্বোহাইড্রেট)</option>
                    <option value="Dairy & Fats">Dairy & Fats (দুগ্ধ ও চর্বি)</option>
                    <option value="Snacks & Nuts">Snacks & Nuts (বাদাম/স্ন্যাক্স)</option>
                    <option value="Custom">Other (অন্যান্য)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold"
                >
                  {lang === 'bn' ? 'যোগ করুন' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
