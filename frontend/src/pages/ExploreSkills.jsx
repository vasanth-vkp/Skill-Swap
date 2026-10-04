import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import discoveryService from '../services/discoveryService';
import ProviderCard from '../components/discovery/ProviderCard';
import FilterSidebar, { CATEGORIES } from '../components/discovery/FilterSidebar';
import ActiveFilters from '../components/discovery/ActiveFilters';

export default function ExploreSkills() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null,
    sortBy: searchParams.get('sortBy') || 'RATING_DESC',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
  });

  const [searchInput, setSearchInput] = useState(filters.keyword || '');
  const [providers, setProviders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch providers from API
  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await discoveryService.searchMembers({
        keyword: filters.keyword,
        category: filters.category,
        location: filters.location,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
        page: filters.page,
        size: 9,
      });

      setProviders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load community providers. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.sortBy && filters.sortBy !== 'RATING_DESC') params.set('sortBy', filters.sortBy);
    if (filters.page > 0) params.set('page', filters.page);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      keyword: searchInput.trim(),
      page: 0,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      keyword: '',
      category: '',
      location: '',
      minRating: null,
      sortBy: 'RATING_DESC',
      page: 0,
    });
  };

  const handleRemoveFilter = (key) => {
    if (key === 'keyword') {
      setSearchInput('');
      setFilters((prev) => ({ ...prev, keyword: '', page: 0 }));
    } else if (key === 'category') {
      setFilters((prev) => ({ ...prev, category: '', page: 0 }));
    } else if (key === 'location') {
      setFilters((prev) => ({ ...prev, location: '', page: 0 }));
    } else if (key === 'minRating') {
      setFilters((prev) => ({ ...prev, minRating: null, page: 0 }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Top Hero Section */}
      <section className="bg-stone-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-amber-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillSwap Community Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Explore Community Skills
            </h1>
            <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8">
              Exchange what you know for what you want to learn. Connect with verified members ready to share their expertise without money.
            </p>

            {/* Keyword Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-xl border border-stone-200/80 max-w-2xl"
            >
              <div className="flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-stone-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by skill name, topic, or member..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setFilters((prev) => ({ ...prev, keyword: '', page: 0 }));
                    }}
                    className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer hover:shadow-md flex-shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden w-full flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-sm font-bold text-stone-800">
              {totalElements} {totalElements === 1 ? 'Member' : 'Members'} Found
            </span>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold cursor-pointer"
            >
              <Filter className="w-4 h-4 text-amber-400" />
              <span>Filter Directory</span>
            </button>
          </div>

          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24 self-start">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Provider Results Pane */}
          <div className="flex-1 w-full min-w-0">
            {/* Active Filter Chips & Match Count */}
            <ActiveFilters
              filters={filters}
              totalElements={totalElements}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleResetFilters}
            />

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm mb-6 flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={fetchProviders}
                  className="font-bold underline ml-4 hover:text-rose-900 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-6 border border-stone-200 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-stone-200 rounded-2xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-stone-200 rounded w-2/3" />
                        <div className="h-3 bg-stone-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-3 bg-stone-200 rounded w-full" />
                    <div className="h-3 bg-stone-200 rounded w-4/5" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-stone-200 rounded-full w-20" />
                      <div className="h-6 bg-stone-200 rounded-full w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : providers.length > 0 ? (
              /* Provider Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              /* Rich Empty State */
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-xl mx-auto my-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">
                  No members match your criteria
                </h3>
                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                  We couldn't find any community providers matching your active filters. Try broadening your keywords or resetting filters.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Filters</span>
                  </button>
                </div>

                {/* Popular Categories Shortcut */}
                <div className="mt-8 pt-6 border-t border-stone-100">
                  <span className="block text-xs font-semibold text-stone-400 mb-3">
                    Explore Popular Domains
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORIES.filter((c) => c.id !== 'ALL').slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            keyword: '',
                            category: c.id,
                            page: 0,
                          }));
                        }}
                        className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-600 text-xs font-medium transition cursor-pointer"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 0}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePageChange(i)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        filters.page === i
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages - 1}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 cursor-pointer transition-colors shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="pt-6 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
              >
                Apply Filters & View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
