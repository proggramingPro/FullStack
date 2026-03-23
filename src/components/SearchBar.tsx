import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
}

export interface SearchFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  guests: number;
}

export default function SearchBar({ onSearch, onClose }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 1000,
    bedrooms: 0,
    guests: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 md:pt-32">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Search Properties</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (per night)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (per night)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+</option>
                    <option value={2}>2+</option>
                    <option value={3}>3+</option>
                    <option value={4}>4+</option>
                    <option value={5}>5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setFilters({
                    location: '',
                    minPrice: 0,
                    maxPrice: 1000,
                    bedrooms: 0,
                    guests: 1,
                  });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
