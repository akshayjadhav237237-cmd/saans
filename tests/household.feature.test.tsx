import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAppStore } from '../src/state/store';
import { createCounterIdGen } from '../src/domain/ports';
import { HouseholdPanel } from '../src/features/household/HouseholdPanel';
import { CommutePurifierCard, MemberItem } from '../src/features/household/MemberItem';
import {
  assessHouseholdSensitivity,
  assessMemberSensitivity,
  canAddMember,
  createDefaultMember,
  getCommuteLabelKey,
  getRoleLabelKey,
  mapValidationError,
  validateHouseholdInputs,
  type CommuteOption,
  type RoleOption,
} from '../src/features/household/household.viewmodel';
import {
  addMemberToList,
  performProfileSave,
  removeMemberFromList,
  toggleRespiratoryInList,
  updateMemberRoleInList,
} from '../src/features/household/useHousehold';

describe('Household Feature', () => {
  beforeEach(() => {
    useAppStore.setState({
      language: 'en',
      profile: {
        id: 'h_test',
        name: 'Our Family',
        city: 'Delhi',
        members: [
          { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
          { id: 'm2', role: 'child', hasRespiratoryCondition: false },
        ],
      },
    });
  });

  it('maps roles, commute modes and evaluates sensitivity metrics', () => {
    expect(getRoleLabelKey('child')).toBe('household.member.role.child');
    expect(getRoleLabelKey('elder')).toBe('household.member.role.elder');
    expect(getRoleLabelKey('adult')).toBe('household.member.role.adult');
    expect(getCommuteLabelKey('commute_car')).toBe('household.commute.car');
    expect(canAddMember(5)).toBe(true);
    expect(canAddMember(6)).toBe(false);

    const m = createDefaultMember('m_new', 'child');
    const sens = assessMemberSensitivity(m);
    expect(sens.isVulnerable).toBe(true);
    expect(sens.weight).toBeGreaterThan(1.0);

    const summary = assessHouseholdSensitivity([m]);
    expect(summary.hasVulnerable).toBe(true);
    expect(summary.vulnerableCount).toBe(1);

    expect(mapValidationError('profile.error.name_required', 'en')).toContain('required');
    expect(validateHouseholdInputs('Family', 'Delhi', [m]).ok).toBe(true);
    expect(validateHouseholdInputs('', 'Delhi', [m]).ok).toBe(false);
  });

  it('handles member item and commute card interactions', () => {
    const onRemove = vi.fn();
    const onRole = vi.fn();
    const onToggle = vi.fn();
    const { rerender } = render(
      <MemberItem
        member={{ id: 'm1', role: 'adult', hasRespiratoryCondition: false }}
        index={0}
        language="en"
        onRoleChange={onRole}
        onConditionToggle={onToggle}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /remove member 1/i }));
    expect(onRemove).toHaveBeenCalledWith('m1');
    fireEvent.change(screen.getByLabelText(/role \(member 1\)/i), { target: { value: 'elder' } });
    expect(onRole).toHaveBeenCalledWith('m1', 'elder');
    fireEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith('m1');

    const onCommute = vi.fn();
    const onPurifier = vi.fn();
    rerender(
      <CommutePurifierCard
        commuteMode="commute_walk"
        hasAirPurifier={false}
        language="en"
        onCommuteChange={onCommute}
        onPurifierToggle={onPurifier}
      />,
    );
    fireEvent.change(screen.getByLabelText(/primary commute mode/i), {
      target: { value: 'commute_car' },
    });
    expect(onCommute).toHaveBeenCalledWith('commute_car');
    fireEvent.click(screen.getByRole('switch'));
    expect(onPurifier).toHaveBeenCalledWith(true);
  });

  it('renders HouseholdPanel and edits household name', () => {
    render(<HouseholdPanel />);
    const nameInput = screen.getByLabelText(/household label/i);
    expect(nameInput).toHaveValue('Our Family');
    fireEvent.change(nameInput, { target: { value: 'Kapoor Family' } });
    expect(nameInput).toHaveValue('Kapoor Family');
  });

  it('adds members up to 6 and enforces limit', () => {
    const idGen = createCounterIdGen('test_add');
    render(<HouseholdPanel idGen={idGen} />);
    const addBtn = screen.getByRole('button', { name: /add family member/i });
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    expect(screen.getByText('Member 6')).toBeInTheDocument();
    expect(addBtn).toBeDisabled();
  });

  it('removes member, updates commute mode and saves profile', () => {
    render(<HouseholdPanel />);
    const removeBtn = screen.getByRole('button', { name: /remove member 2/i });
    fireEvent.click(removeBtn);
    expect(screen.queryByText('Member 2')).not.toBeInTheDocument();

    const commuteSelect = screen.getByLabelText(/primary commute mode/i);
    fireEvent.change(commuteSelect, { target: { value: 'commute_public' } });

    const saveBtn = screen.getByRole('button', { name: /save household profile/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument();
    expect(useAppStore.getState().profile.members).toHaveLength(1);
  });

  it('shows error notice when saving with empty household name', () => {
    render(<HouseholdPanel />);
    const nameInput = screen.getByLabelText(/household label/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const saveBtn = screen.getByRole('button', { name: /save household profile/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/household name is required/i)).toBeInTheDocument();
  });

  it('verifies list manipulation helpers and option types', () => {
    const initial = [createDefaultMember('m1', 'adult')];
    const added = addMemberToList(initial, 'm2', 'child');
    expect(added).toHaveLength(2);

    const updated = updateMemberRoleInList(added, 'm2', 'elder');
    expect(updated[1]?.role).toBe('elder');

    const toggled = toggleRespiratoryInList(updated, 'm2');
    expect(toggled[1]?.hasRespiratoryCondition).toBe(true);

    const removed = removeMemberFromList(toggled, 'm1');
    expect(removed).toHaveLength(1);

    const saveRes = performProfileSave(
      { id: 'h1', name: 'Test', city: 'Delhi', members: removed },
      'en',
      () => {},
    );
    expect(saveRes.ok).toBe(true);

    const commute: CommuteOption = { value: 'commute_car', labelKey: 'household.commute.car' };
    const role: RoleOption = { value: 'child', labelKey: 'household.member.role.child' };
    expect(commute.value).toBe('commute_car');
    expect(role.value).toBe('child');
  });
});
