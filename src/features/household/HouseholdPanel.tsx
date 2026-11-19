import { useState, type FormEvent } from 'react';
import type { IdGen } from '../../domain/ports';
import { translate, type Language } from '../../i18n';
import { A11Y_NAMES, Button, Card, Field, Notice, Section } from '../../shared';
import { clearPersistedState } from '../../state/persist';
import { useAppStore } from '../../state/store';
import { CommutePurifierCard, MembersSection } from './MemberItem';
import { useHousehold } from './useHousehold';

export interface HouseholdPanelProps {
  readonly idGen?: IdGen;
}

export interface HouseholdActionsBarProps {
  readonly language: Language;
  readonly clearNotice: string | null;
  readonly onClearData: () => void;
}

/** Accessible actions bar rendering clear-data and save triggers for the household profile. */
export function HouseholdActionsBar({
  language,
  clearNotice,
  onClearData,
}: HouseholdActionsBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onClearData}
        aria-label={A11Y_NAMES.buttons.clearData}
      >
        {translate(language, 'export.clear.button')}
      </Button>
      <div className="flex items-center gap-3">
        {clearNotice && (
          <span role="status" className="text-sm font-medium text-teal">
            {clearNotice}
          </span>
        )}
        <Button type="submit" variant="primary">
          {translate(language, 'household.save')}
        </Button>
      </div>
    </div>
  );
}

/** Accessible household profile configuration panel for managing family vulnerability and routine. */
export function HouseholdPanel({ idGen }: HouseholdPanelProps = {}): JSX.Element {
  const [clearNotice, setClearNotice] = useState<string | null>(null);
  const language = useAppStore((state) => state.language);
  const hh = useHousehold({ idGen });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    hh.save();
  };

  const handleClearData = () => {
    clearPersistedState();
    setClearNotice(translate(language, 'export.clear.success'));
    setTimeout(() => setClearNotice(null), 3000);
  };

  return (
    <Section
      id="household-profile"
      title={translate(language, 'household.title')}
      subtitle={translate(language, 'household.subtitle')}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {hh.notice && <Notice variant="success">{hh.notice}</Notice>}
        {hh.error && <Notice variant="warning">{hh.error}</Notice>}

        <Card className="flex flex-col gap-4">
          <Field
            id="household-name"
            label={translate(language, 'household.name.label')}
            placeholder={translate(language, 'household.name.placeholder')}
            value={hh.name}
            onChange={(e) => hh.setName(e.target.value)}
          />
        </Card>

        <MembersSection
          members={hh.members}
          canAdd={hh.canAdd}
          language={language}
          onAdd={() => hh.addMember()}
          onRoleChange={hh.updateMemberRole}
          onConditionToggle={hh.toggleRespiratoryCondition}
          onRemove={hh.removeMember}
        />

        <CommutePurifierCard
          commuteMode={hh.commuteMode}
          hasAirPurifier={hh.hasAirPurifier}
          language={language}
          onCommuteChange={hh.setCommuteMode}
          onPurifierToggle={hh.setHasAirPurifier}
        />

        <HouseholdActionsBar
          language={language}
          clearNotice={clearNotice}
          onClearData={handleClearData}
        />
      </form>
    </Section>
  );
}
