"use client";

import { useState } from "react";
import { Feature } from "@/types/intake";
import { v4 as uuidv4 } from "uuid";

interface FeatureSelectorProps {
  features: Feature[];
  onAdd: (feature: Feature) => void;
  onRemove: (id: string) => void;
  suggestions: string[];
}

export default function FeatureSelector({ features, onAdd, onRemove, suggestions }: FeatureSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
    !features.some(feature => feature.text.toLowerCase() === suggestion.toLowerCase())
  );

  const handleAddFeature = (text: string) => {
    if (text.trim() && !features.some(f => f.text.toLowerCase() === text.toLowerCase())) {
      onAdd({
        id: uuidv4(),
        text: text.trim()
      });
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleAddFeature(suggestion);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pages / Features
      </label>
      
      {/* Current Features */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map(feature => (
            <div
              key={feature.id}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{feature.text}</span>
              <button
                type="button"
                onClick={() => onRemove(feature.id)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={`Remove ${feature.text}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder="e.g., user login, payment checkout, blog..."
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => handleAddFeature(inputValue)}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Add the pages and features you need for your project. Start typing to see suggestions.
      </p>
    </div>
  );
}
