import { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Slider({ className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={cn(
        'h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-red-500',
        className,
      )}
      {...props}
    />
  );
}
