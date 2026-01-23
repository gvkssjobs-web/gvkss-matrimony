'use client';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  photo: string | null;
  phone_number: string | null;
  gender: string | null;
  created_at: string;
}

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'platinum':
        return 'bg-blue-600 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-zinc-400 text-white';
      default:
        return 'bg-zinc-600 text-white';
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-zinc-200 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: '#FFFFFF' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#22C55E'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
      {/* Photo Section with Role Badge */}
      <div className="relative h-72 overflow-hidden">
        {user.photo ? (
          <img
            src={(() => {
              // If photo is from S3 and we have user ID, use PostgreSQL blob API to avoid CORS issues
              if (user.id && user.photo?.includes('s3')) {
                return `/api/photo?userId=${user.id}`;
              }
              
              // Normalize the photo URL
              let photoUrl = user.photo.trim();
              
              // Fix malformed URLs (https:/ instead of https://)
              if (photoUrl.startsWith('https:/') && !photoUrl.startsWith('https://')) {
                photoUrl = photoUrl.replace('https:/', 'https://');
              }
              if (photoUrl.startsWith('http:/') && !photoUrl.startsWith('http://')) {
                photoUrl = photoUrl.replace('http:/', 'http://');
              }
              
              // Handle full URLs
              if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                return photoUrl;
              }
              
              // Handle relative paths
              if (photoUrl.startsWith('/')) {
                return photoUrl;
              }
              
              // Default: prepend / for relative paths
              return `/${photoUrl}`;
            })()}
            alt={user.name || user.email}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // If we're already using the API endpoint and it fails, show placeholder
              if (img.src.includes('/api/photo')) {
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('.photo-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'photo-placeholder w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 flex items-center justify-center';
                  placeholder.innerHTML = `<div class="text-7xl font-bold text-zinc-400">${user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</div>`;
                  parent.appendChild(placeholder);
                }
              } else if (user.id && user.photo?.includes('s3')) {
                // Try fallback to PostgreSQL blob API if S3 fails
                img.src = `/api/photo?userId=${user.id}`;
              } else {
                // Fallback to placeholder if image fails to load
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('.photo-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'photo-placeholder w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 flex items-center justify-center';
                  placeholder.innerHTML = `<div class="text-7xl font-bold text-zinc-400">${user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</div>`;
                  parent.appendChild(placeholder);
                }
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 flex items-center justify-center">
            <div className="text-7xl font-bold text-zinc-400">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Role Badge - Top Right */}
        {user.role && user.role !== 'admin' && (
          <div className="absolute top-3 right-3 z-20">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-md ${getRoleBadgeColor()}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        )}
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 dark:from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* User Info Section */}
      <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="space-y-3">
          {/* Name and Role */}
          <div>
            <h3 className="text-xl font-bold text-zinc-900 mb-1">
              {user.name || 'User'}
            </h3>
          </div>
          
          {/* Email */}
          <p className="text-sm text-zinc-600 truncate">
            {user.email}
          </p>
          
          {/* Details Grid */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-200">
            {user.gender && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="capitalize">{user.gender}</span>
              </div>
            )}
            {user.phone_number && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{user.phone_number}</span>
              </div>
            )}
          </div>
          
          {/* View Profile Button */}
          <button className="mt-5 w-full px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-zinc-200/50 group/btn">
            <span>View Profile</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
