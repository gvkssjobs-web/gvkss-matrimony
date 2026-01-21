import React from 'react';
import Card from './Card';

interface FormCardProps {
  children: React.ReactNode;
  title: string;
  footer?: React.ReactNode;
}

export default function FormCard({ children, title, footer }: FormCardProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <Card>
        <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
        {children}
        {footer && <div className="mt-6">{footer}</div>}
      </Card>
    </div>
  );
}
