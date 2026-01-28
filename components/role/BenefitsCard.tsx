interface BenefitsCardProps {
  benefits: string[];
  title?: string;
}

export default function BenefitsCard({ benefits, title = 'Your Benefits' }: BenefitsCardProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: '#FFFFFF' }}>
      <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{title}</h2>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#E94B6A' }}>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
