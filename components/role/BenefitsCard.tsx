interface BenefitsCardProps {
  benefits: string[];
  title?: string;
}

export default function BenefitsCard({ benefits, title = 'Your Benefits' }: BenefitsCardProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#FBF0F2', borderColor: '#E7C9D1' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#3A3A3A' }}>{title}</h2>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2" style={{ color: '#3A3A3A' }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#E94B6A' }} aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
