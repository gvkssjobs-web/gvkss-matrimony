'use client';

interface RoleSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function RoleSearchBar({ searchQuery, onSearchChange }: RoleSearchBarProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by parent component through onSearchChange
  };

  return (
    <div className='mb-6 w-full'>
      <form onSubmit={handleSearch} className='relative w-full'>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full px-4 py-2 pl-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
        <svg
          className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          strokeWidth={2.5}
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
        </svg>
      </form>
    </div>
  );
}
