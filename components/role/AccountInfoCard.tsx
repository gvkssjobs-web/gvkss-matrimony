import { User } from '@/lib/auth';

interface AccountInfoCardProps {
  user: User;
  roleColor?: string;
}

export default function AccountInfoCard({ user, roleColor = 'text-zinc-600 dark:text-zinc-400' }: AccountInfoCardProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: '#FFFFFF' }}>
      <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Account Information</h2>
      <div className="space-y-3">
        <div>
          <span className="text-zinc-600 dark:text-zinc-400">Email: </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</span>
        </div>
        {user.name && (
          <div>
            <span className="text-zinc-600 dark:text-zinc-400">Name: </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
          </div>
        )}
        <div>
          <span className="text-zinc-600 dark:text-zinc-400">Plan: </span>
          <span className={`font-semibold ${roleColor} capitalize`}>{user.role}</span>
        </div>
      </div>
    </div>
  );
}
