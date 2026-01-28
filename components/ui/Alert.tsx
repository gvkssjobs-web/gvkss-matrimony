interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  className?: string;
}

export default function Alert({ type, message, className = '' }: AlertProps) {
  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#FFF5F7', borderColor: '#FFE5E9', color: '#E94B6A' };
      case 'error':
        return { backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' };
      case 'info':
        return { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' };
      case 'warning':
        return { backgroundColor: '#FEFCE8', borderColor: '#FDE047', color: '#CA8A04' };
      default:
        return { backgroundColor: '#FFF5F7', borderColor: '#FFE5E9', color: '#E94B6A' };
    }
  };

  return (
    <div className={`border px-4 py-3 rounded-lg ${className}`} style={{ ...getTypeStyle(), border: '1px solid' }}>
      {message}
    </div>
  );
}
