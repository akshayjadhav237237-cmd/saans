import React from 'react';
import { Card, VisuallyHidden } from '../../shared';
import type { SchoolStatusDisplay } from './community.viewmodel';

export interface CommunitySchoolCardProps {
  readonly schoolStatus: SchoolStatusDisplay;
  readonly statusHeading: string;
}

/** School outdoor physical activity and assembly safety threshold card. */
export function CommunitySchoolCard({
  schoolStatus,
  statusHeading,
}: CommunitySchoolCardProps): React.JSX.Element {
  const schoolBadgeStyle = schoolStatus.isPermitted
    ? 'bg-teal-light text-teal-dark border-teal'
    : 'bg-amber-light text-amber-dark border-amber-dark';

  return (
    <Card
      className={`print:p-3 print:shadow-none print:border-gray-300 border-l-4 ${
        schoolStatus.isPermitted ? 'border-l-teal' : 'border-l-amber-dark'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-main">{statusHeading}</h3>
          <p className="text-sm text-text-muted">{schoolStatus.statusText}</p>
        </div>
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold tracking-wide uppercase border ${schoolBadgeStyle}`}
        >
          <VisuallyHidden>School outdoor status: </VisuallyHidden>
          <span>{schoolStatus.badge}</span>
        </span>
      </div>
    </Card>
  );
}
