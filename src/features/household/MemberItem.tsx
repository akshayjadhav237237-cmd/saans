import type { HouseholdMember, MemberRole } from '../../domain/types';
import { translate, type Language } from '../../i18n';
import { Button, Card, Select, Toggle } from '../../shared';
import { COMMUTE_OPTIONS, MEMBER_ROLE_OPTIONS, type CommuteMode } from './household.viewmodel';

export interface MemberItemProps {
  readonly member: HouseholdMember;
  readonly index: number;
  readonly language: Language;
  readonly onRoleChange: (id: string, role: MemberRole) => void;
  readonly onConditionToggle: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

/** Accessible household member item row rendering demographic role selection and clinical sensitivity toggles. */
export function MemberItem({
  member,
  index,
  language,
  onRoleChange,
  onConditionToggle,
  onRemove,
}: MemberItemProps): JSX.Element {
  const memberLabel = `Member ${index + 1}`;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-text-main">{memberLabel}</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onRemove(member.id)}
          aria-label={`${translate(language, 'household.member.remove')} ${memberLabel}`}
          className="text-amber-dark text-xs"
        >
          {translate(language, 'household.member.remove')}
        </Button>
      </div>
      <Select
        id={`member-role-${member.id}`}
        label={`Role (${memberLabel})`}
        value={member.role}
        onChange={(e) => onRoleChange(member.id, e.target.value as MemberRole)}
      >
        {MEMBER_ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {translate(language, opt.labelKey)}
          </option>
        ))}
      </Select>
      <Toggle
        id={`member-respiratory-${member.id}`}
        label={translate(language, 'household.member.respiratory')}
        hint={translate(language, 'household.member.respiratory_hint')}
        checked={member.hasRespiratoryCondition}
        onChange={() => onConditionToggle(member.id)}
      />
    </Card>
  );
}

export interface MembersSectionProps {
  readonly members: readonly HouseholdMember[];
  readonly canAdd: boolean;
  readonly language: Language;
  readonly onAdd: () => void;
  readonly onRoleChange: (id: string, role: MemberRole) => void;
  readonly onConditionToggle: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

/** Accessible family members list section rendering member cards and the addition trigger. */
export function MembersSection({
  members,
  canAdd,
  language,
  onAdd,
  onRoleChange,
  onConditionToggle,
  onRemove,
}: MembersSectionProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-main">
          {translate(language, 'household.members.title')}
        </h3>
        <Button type="button" variant="secondary" onClick={onAdd} disabled={!canAdd}>
          {translate(language, 'household.member.add')}
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {members.map((member, index) => (
          <MemberItem
            key={member.id}
            member={member}
            index={index}
            language={language}
            onRoleChange={onRoleChange}
            onConditionToggle={onConditionToggle}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

export interface CommutePurifierCardProps {
  readonly commuteMode: CommuteMode;
  readonly hasAirPurifier: boolean;
  readonly language: Language;
  readonly onCommuteChange: (mode: CommuteMode) => void;
  readonly onPurifierToggle: (checked: boolean) => void;
}

/** Accessible configuration card for household primary commute mode and indoor air purifier presence. */
export function CommutePurifierCard({
  commuteMode,
  hasAirPurifier,
  language,
  onCommuteChange,
  onPurifierToggle,
}: CommutePurifierCardProps): JSX.Element {
  return (
    <Card className="flex flex-col gap-4">
      <Select
        id="household-commute"
        label={translate(language, 'household.commute.label')}
        value={commuteMode}
        onChange={(e) => onCommuteChange(e.target.value as CommuteMode)}
      >
        {COMMUTE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {translate(language, opt.labelKey)}
          </option>
        ))}
      </Select>
      <Toggle
        id="household-air-purifier"
        label={translate(language, 'household.home.purifier')}
        checked={hasAirPurifier}
        onChange={onPurifierToggle}
      />
    </Card>
  );
}
