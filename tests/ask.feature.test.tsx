import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiProvider } from '../src/ai/gemini';
import { AskPanel } from '../src/features/ask/AskPanel';
import { executeAiQuestion } from '../src/features/ask/ask.helpers';
import {
  buildPayloadFromState,
  formatCharacterCount,
  getDisclosureList,
  getExampleQuestions,
  getProviderMode,
  getProviderModeKey,
  isCharacterLimitExceeded,
  EXAMPLE_QUESTION_KEYS,
  MAX_QUESTION_LENGTH,
  type ExampleQuestionKey,
} from '../src/features/ask/ask.viewmodel';
import { useAppStore } from '../src/state/store';

describe('Ask AI Feature Viewmodel and Panel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAppStore.setState({
      language: 'en',
      aiKey: '',
      airData: null,
      plan: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pure viewmodel functions format text and resolve mode correctly', () => {
    expect(getProviderMode('')).toBe('local');
    expect(getProviderMode('  ')).toBe('local');
    expect(getProviderMode('secret-key')).toBe('gemini');

    expect(formatCharacterCount(15, 'en')).toBe('15/280 characters');
    expect(isCharacterLimitExceeded(280)).toBe(false);
    expect(isCharacterLimitExceeded(281)).toBe(true);

    const examples = getExampleQuestions('en');
    expect(examples.length).toBe(3);

    const disclosures = getDisclosureList('en');
    expect(disclosures.length).toBe(6);
    expect(disclosures.map((d) => d.field)).toContain('aqiBandKey');
    expect(disclosures.map((d) => d.field)).toContain('roundedPm25');
    expect(disclosures.map((d) => d.field)).toContain('userQuestion');

    const payload = buildPayloadFromState({
      profile: {
        id: 'h1',
        name: 'Family',
        city: 'Delhi',
        members: [{ id: 'm1', role: 'adult', hasRespiratoryCondition: false }],
      },
      language: 'en',
      airData: { hourly: [], currentAqi: 150, currentPm25: 80 },
      plan: null,
    });
    expect(payload.roundedPm25).toBe(80);
    expect(payload.memberKinds).toEqual(['adult']);
  });

  it('renders provider mode badge and handles API key input and clearing', async () => {
    render(<AskPanel />);
    const badge = screen.getByTestId('mode-badge');
    expect(badge.textContent).toContain('On-Device Local Guidance');

    const keyInput = screen.getByLabelText(/Optional Gemini API Key/i);
    await userEvent.type(keyInput, 'gemini-secret-123');
    expect(badge.textContent).toContain('Cloud Gemini 2.5 Flash');

    const clearBtn = screen.getByRole('button', { name: /Clear Key/i });
    await userEvent.click(clearBtn);
    expect(badge.textContent).toContain('On-Device Local Guidance');
  });

  it('renders disclosure list explaining data minimization allowlist', () => {
    render(<AskPanel />);
    expect(screen.getByText(/Review data shared with Google/i)).toBeDefined();
    expect(
      screen.getByText(
        /City name, personal nicknames, notes, and coordinates are not transmitted/i,
      ),
    ).toBeDefined();
    expect(
      screen.getByText('Your question text is sent to Google when Gemini is on.'),
    ).toBeDefined();
    expect(screen.getByText(/roundedPm25/i)).toBeDefined();
    expect(screen.getByText(/userQuestion/i)).toBeDefined();
  });

  it('populates input from example chips and displays character limit counter', async () => {
    render(<AskPanel />);
    expect(screen.getByText('0/280 characters')).toBeDefined();

    const chip = screen.getByRole('button', { name: /Should I run my air purifier at night/i });
    await userEvent.click(chip);

    const input = screen.getByLabelText(/Your Question/i) as HTMLInputElement;
    expect(input.value).toContain('air purifier at night');
    expect(screen.getByText(`${input.value.length}/280 characters`)).toBeDefined();
  });

  it('submits question and renders answer card with suggested action chip', async () => {
    render(<AskPanel />);
    const input = screen.getByLabelText(/Your Question/i);
    await userEvent.type(input, 'Which mask is safest?');

    const sendBtn = screen.getByRole('button', { name: /Ask Question/i });
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/N95 respirators provide high particulate filtration/i),
      ).toBeDefined();
    });
    expect(screen.getByText(/Wear N95 Respirator During Commute/i)).toBeDefined();
  });

  it('renders fallback notice when cloud provider fails', async () => {
    useAppStore.setState({ aiKey: 'cloud-key' });
    vi.spyOn(GeminiProvider, 'answerQuestion').mockResolvedValue({
      ok: false,
      error: 'ai.error.timeout',
    });

    render(<AskPanel />);
    const input = screen.getByLabelText(/Your Question/i);
    await userEvent.type(input, 'How to handle cooking smoke?');

    const sendBtn = screen.getByRole('button', { name: /Ask Question/i });
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cloud provider unavailable/i)).toBeDefined();
    });
    expect(screen.getAllByText(/kitchen exhaust/i).length).toBeGreaterThan(0);
  });

  it('disables submit button when question is empty or exceeds 280 characters', async () => {
    render(<AskPanel />);
    const sendBtn = screen.getByRole('button', { name: /Ask Question/i });
    expect(sendBtn.hasAttribute('disabled')).toBe(true);

    const input = screen.getByLabelText(/Your Question/i);
    await userEvent.type(input, 'a'.repeat(281));
    expect(sendBtn.hasAttribute('disabled')).toBe(true);
  });

  it('verifies ask viewmodel constants and direct ai execution', async () => {
    expect(MAX_QUESTION_LENGTH).toBe(280);
    expect(EXAMPLE_QUESTION_KEYS.length).toBe(3);
    const exKey: ExampleQuestionKey = 'ask.example.1';
    expect(exKey).toBe('ask.example.1');
    expect(getProviderModeKey('')).toBe('ask.provider.local');
    expect(getProviderModeKey('gemini-key')).toBe('ask.provider.gemini');

    const res = await executeAiQuestion({
      question: 'Should I wear a mask?',
      payload: {
        aqiBandKey: 'aqi.band.unhealthy',
        roundedPm25: 200,
        memberKinds: ['adult'],
        actions: [],
        language: 'en',
      },
      apiKey: '',
    });
    expect(res.answer.text.length).toBeGreaterThan(0);
    expect(res.isFallback).toBe(false);
  });
});
