import React from 'react';
import { Card, ShieldIcon } from '../../shared';
import type { CommunityActionDisplay } from './community.viewmodel';

export interface CommunityActionsCardProps {
  readonly title: string;
  readonly actions: readonly CommunityActionDisplay[];
}

/**
 * Collective civic and community clean air actions list card.
 */
export function CommunityActionsCard({
  title,
  actions,
}: CommunityActionsCardProps): React.JSX.Element {
  return (
    <Card className="print:p-3 print:shadow-none print:border-gray-300">
      <h3 className="text-base font-semibold text-text-main mb-3">{title}</h3>
      <ul className="divide-y divide-border" aria-label={title}>
        {actions.map((act) => (
          <li key={act.key} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
            <ShieldIcon className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
            <span className="text-sm text-text-main leading-snug">{act.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
