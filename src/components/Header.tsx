import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export default function Header({ title, subtitle, showBack = false, onBack, right }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-black sticky top-0 z-30">
      <div className="w-16">
        {showBack && (
          <button onClick={handleBack} className="text-primary text-base font-normal active:opacity-60">
            ←
          </button>
        )}
      </div>
      <div className="text-center flex-1">
        <div className="font-semibold text-base text-white">{title}</div>
        {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
      </div>
      <div className="w-16 flex justify-end">{right}</div>
    </div>
  );
}
