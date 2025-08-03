"use client";

import { useState } from "react";
import { BUDGET_TIERS } from "@/types/intake";

interface BudgetSelectorProps {
  min: number;
  max: number;
  tier?: string;
  onChange: (min: number, max: number, tier?: string) => void;
  error?: string;
}

export default function BudgetSelector({ min, max, tier, onChange, error }: BudgetSelectorProps) {
  const [customMode, setCustomMode] = useState(!tier);

  const handleTierSelect = (selectedTier: typeof BUDGET_TIERS[0]) => {
    setCustomMode(false);
    onChange(selectedTier.min, selectedTier.max, selectedTier.name);
  };

  const handleCustomToggle = () => {
    setCustomMode(true);
    onChange(min, max, undefined);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Budget Range
        </label>

        {/* Preset Tiers */}
        <div className="space-y-3 mb-6">
          {BUDGET_TIERS.map((budgetTier) => (
            <div
              key={budgetTier.name}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                tier === budgetTier.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleTierSelect(budgetTier)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="budgetTier"
                    checked={tier === budgetTier.name}
                    onChange={() => handleTierSelect(budgetTier)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {budgetTier.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {budgetTier.description}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(budgetTier.min)} - {formatCurrency(budgetTier.max)}
                </div>
              </div>
            </div>
          ))}

          {/* Custom Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              customMode
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={handleCustomToggle}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="budgetTier"
                checked={customMode}
                onChange={handleCustomToggle}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-900">Custom Range</div>
                <div className="text-sm text-gray-600">
                  Set your own budget range
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Range Inputs */}
        {customMode && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => onChange(Number(e.target.value), max)}
                    min={0}
                    step={100}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => onChange(min, Number(e.target.value))}
                    min={min}
                    step={100}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Range Slider */}
            <div className="px-2">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={500}
                  value={min}
                  onChange={(e) => onChange(Number(e.target.value), Math.max(max, Number(e.target.value)))}
                  className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={500}
                  value={max}
                  onChange={(e) => onChange(min, Number(e.target.value))}
                  className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{formatCurrency(0)}</span>
                <span>{formatCurrency(100000)}+</span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Current Selection Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Selected Range:</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(min)} - {formatCurrency(max)}
            {tier && <span className="text-sm font-normal text-gray-600 ml-2">({tier})</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
