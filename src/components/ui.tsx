import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-orange-500 text-white shadow-[0_5px_0_#c2410c] active:shadow-[0_1px_0_#c2410c] active:translate-y-1',
  success: 'bg-green-500 text-white shadow-[0_5px_0_#15803d] active:shadow-[0_1px_0_#15803d] active:translate-y-1',
  secondary: 'bg-white text-stone-800 ring-2 ring-orange-200 shadow-[0_4px_0_#fed7aa] active:shadow-none active:translate-y-1',
  ghost: 'bg-transparent text-stone-700 underline-offset-4 hover:underline',
};

export function BigButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`min-h-[56px] rounded-2xl px-6 py-3 text-xl font-bold transition disabled:opacity-40 disabled:shadow-none ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-5 shadow-md ${className}`}>{children}</div>;
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`שלב ${current + 1} מתוך ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 rounded-full transition-all ${i === current ? 'w-8 bg-orange-500' : i < current ? 'w-3 bg-orange-300' : 'w-3 bg-stone-300'}`}
        />
      ))}
    </div>
  );
}
