export default function PremiumBadge() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-700 text-center">
      <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-200">✨ Premium Member ✨</h3>
      <p className="text-purple-800 dark:text-purple-300">You have access to all premium features!</p>
    </div>
  );
}
