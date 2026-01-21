interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-white'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 border-4 border-zinc-300 dark:border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <div className="text-lg font-medium text-zinc-600">{message}</div>
      </div>
    </div>
  );
}
