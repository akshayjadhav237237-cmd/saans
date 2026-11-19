import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import type { AqiBand, HourlySeries } from '../domain/types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly children: ReactNode;
}

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly children?: ReactNode | undefined;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly children: ReactNode;
}

export interface ToggleProps {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly hint?: string;
  readonly className?: string;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
}

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'info' | 'warning' | 'success';
  readonly children: ReactNode;
}

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
}

export interface SkipLinkProps {
  readonly targetId?: string;
  readonly label?: string;
}

export interface BandBadgeProps {
  readonly band: AqiBand;
  readonly label: string;
  readonly className?: string;
}

export interface SpinnerProps {
  readonly label?: string;
  readonly className?: string;
}

export interface ChartProps {
  readonly hourly: HourlySeries;
  readonly title: string;
  readonly description: string;
  readonly className?: string;
}

export interface IconProps {
  readonly className?: string;
  readonly size?: number;
  readonly 'aria-hidden'?: boolean | 'true' | 'false';
}
