import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  SVGProps,
} from 'react';
import type { AqiBand, HourlySeries } from '../domain/types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | undefined;
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

export type FormFieldRenderProp = (describedBy: string | undefined) => ReactNode;

export interface FormFieldLayoutProps {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly className?: string | undefined;
  readonly children: ReactNode | FormFieldRenderProp;
}

export interface ToggleProps {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly hint?: string | undefined;
  readonly className?: string | undefined;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly children: ReactNode;
}

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'info' | 'warning' | 'success' | undefined;
  readonly children: ReactNode;
}

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
}

export interface SkipLinkProps {
  readonly targetId?: string | undefined;
  readonly label?: string | undefined;
}

export interface BandBadgeProps {
  readonly band: AqiBand;
  readonly label: string;
  readonly className?: string | undefined;
}

export interface SpinnerProps {
  readonly label?: string | undefined;
  readonly className?: string | undefined;
}

export interface ChartProps {
  readonly hourly: HourlySeries;
  readonly title: string;
  readonly description: string;
  readonly className?: string | undefined;
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  readonly className?: string | undefined;
  readonly size?: number | undefined;
  readonly label?: string | undefined;
}
