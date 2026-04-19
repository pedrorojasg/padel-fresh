interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}

export default function BottomButton({ label, onClick, disabled = false, variant = 'primary' }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
      <button
        onClick={onClick}
        disabled={disabled}
        className={
          variant === 'primary'
            ? `w-full py-4 rounded-2xl font-semibold text-base transition-opacity ${
                disabled ? 'bg-primary/40 text-white/40 cursor-not-allowed' : 'bg-primary text-white active:opacity-80'
              }`
            : 'w-full py-4 rounded-2xl font-semibold text-base text-primary border border-primary/40 active:opacity-80'
        }
      >
        {label}
      </button>
    </div>
  );
}
