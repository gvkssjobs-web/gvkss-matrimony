interface RoleHeaderProps {
  role: 'silver' | 'gold' | 'platinum';
  userName: string;
}

export default function RoleHeader({ role, userName }: RoleHeaderProps) {
  const roleConfig = {
    silver: {
      icon: '🥈',
      title: 'Silver Membership',
      gradient: 'from-slate-600 to-slate-700',
      textColor: 'text-slate-200',
    },
    gold: {
      icon: '🥇',
      title: 'Gold Membership',
      gradient: 'from-yellow-500 to-amber-600',
      textColor: 'text-yellow-100',
    },
    platinum: {
      icon: '💎',
      title: 'Platinum Membership',
      gradient: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-100',
    },
  };

  const config = roleConfig[role];

  return (
    <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-8 mb-8 text-white shadow-xl`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-6xl">{config.icon}</div>
        <div>
          <h1 className="text-4xl font-bold mb-2">{config.title}</h1>
          <p className={`${config.textColor} text-lg`}>Welcome, {userName}!</p>
        </div>
      </div>
    </div>
  );
}
