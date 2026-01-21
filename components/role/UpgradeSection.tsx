import Link from 'next/link';

interface UpgradeSectionProps {
  targetRole: 'gold' | 'platinum';
  title: string;
  description: string;
}

export default function UpgradeSection({ targetRole, title, description }: UpgradeSectionProps) {
  const config = {
    gold: {
      bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-amber-900 dark:text-yellow-200',
      textSecondary: 'text-amber-800 dark:text-yellow-300',
      button: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
    },
    platinum: {
      bg: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-900 dark:text-purple-200',
      textSecondary: 'text-purple-800 dark:text-purple-300',
      button: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
    },
  };

  const style = config[targetRole];

  return (
    <div className={`bg-gradient-to-r ${style.bg} p-6 rounded-lg border-2 ${style.border}`}>
      <h3 className={`text-2xl font-bold mb-2 ${style.text}`}>{title}</h3>
      <p className={`${style.textSecondary} mb-4`}>{description}</p>
      <Link
        href="/"
        className={`inline-block bg-gradient-to-r ${style.button} text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105`}
      >
        Upgrade Now
      </Link>
    </div>
  );
}
