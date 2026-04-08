import { useState } from 'react';
import Header from './components/Header';
import SearchBar, { SearchFilters } from './components/SearchBar';
import PropertyGrid from './components/PropertyGrid';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import Footer from './components/Footer';

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [filters, setFilters] = useState<SearchFilters | null>(null);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowSearch(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        onSearchClick={() => setShowSearch(true)}
        onProfileClick={() => setShowProfile(true)}
        onAdminClick={() => setShowAdmin(true)}
      />

      {showSearch && (
        <SearchBar onSearch={handleSearch} onClose={() => setShowSearch(false)} />)}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />)}

      {showAdmin && (
        <AdminDashboard onClose={() => setShowAdmin(false)} />)}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Amazing Places
          </h2>
          <p className="text-gray-600">
            Find the perfect place away from home
          </p>
        </div>

        <PropertyGrid filters={filters} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
