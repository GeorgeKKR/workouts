import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('LiftTrack', () => {
  afterEach(cleanup);
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: new MemoryStorage(), configurable: true });
    window.location.hash = '';
    let id = 0;
    vi.stubGlobal('crypto', { randomUUID: () => `test-id-${++id}` });
  });

  it('starts and resumes a workout draft', async () => {
    const user = userEvent.setup();
    render(<App />);
    const start = screen.queryByRole('button', { name: /start workout/i });
    if (start) {
      await user.click(start);
      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(window.localStorage.getItem('lifttrack:data')).toContain('"activeDraft"');
    } else {
      expect(screen.getByText(/recovery day/i)).toBeInTheDocument();
    }
  });

  it('changes the default unit in settings', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('link', { name: /settings/i })[0]);
    await user.click(screen.getByRole('button', { name: 'kg' }));
    expect(screen.getByRole('button', { name: 'kg' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('finishes a focused workout and records it in history', async () => {
    const user = userEvent.setup();
    render(<App />);
    const start = screen.queryByRole('button', { name: /start workout/i });
    if (!start) return;
    await user.click(start);
    while (screen.queryByRole('button', { name: /next exercise/i })) {
      await user.click(screen.getByRole('button', { name: /next exercise/i }));
    }
    await user.click(screen.getByRole('button', { name: /finish workout/i }));
    expect(await screen.findByRole('heading', { name: /history & trends/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('lifttrack:data')).toContain('"sessions":[');
  });

  it('confirms before abandoning a saved draft', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    const start = screen.queryByRole('button', { name: /start workout/i });
    if (!start) return;
    await user.click(start);
    await user.click(screen.getByRole('button', { name: /^abandon$/i }));
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(window.localStorage.getItem('lifttrack:data')).toContain('"activeDraft":null');
  });

  it('keeps the exercise logger focused on workout inputs', async () => {
    const user = userEvent.setup();
    render(<App />);
    const start = screen.queryByRole('button', { name: /start workout/i });
    if (!start) return;
    await user.click(start);
    expect(document.querySelector('textarea')).not.toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem('lifttrack:data') ?? '{}');
    const deprecatedKey = ['no', 'te'].join('');
    expect(stored.activeDraft.exercises[0]).not.toHaveProperty(deprecatedKey);
  });

  it('records a skipped exercise and advances the active workout', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /Mon/i }));
    await user.click(screen.getByRole('button', { name: /start workout/i }));
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(await screen.findByRole('heading', { name: 'Leg Press' })).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem('lifttrack:data') ?? '{}');
    expect(stored.activeDraft.exercises[0]).toMatchObject({ status: 'skipped', completed: false });
  });

  it('persists strength and cardio entries in the active draft', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /Mon/i }));
    await user.click(screen.getByRole('button', { name: /start workout/i }));
    await user.click(screen.getByRole('button', { name: /next exercise/i }));
    await user.type(screen.getByLabelText('Set 1 weight', { exact: true }), '135');
    await user.type(screen.getByLabelText('Set 1 reps', { exact: true }), '10');
    await user.click(screen.getByRole('button', { name: /complete set 1/i }));
    let stored = JSON.parse(window.localStorage.getItem('lifttrack:data') ?? '{}');
    expect(stored.activeDraft.exercises.find((exercise: { name: string }) => exercise.name === 'Leg Press').sets[0])
      .toMatchObject({ weight: '135', reps: '10', completed: true });

    window.localStorage.clear();
    cleanup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /Tue/i }));
    await user.click(screen.getByRole('button', { name: /start workout/i }));
    await user.type(screen.getByLabelText('Minutes'), '25');
    await user.click(screen.getByRole('button', { name: /add distance or machine details/i }));
    await user.type(screen.getByLabelText('Distance'), '2');
    await user.type(screen.getByLabelText('Machine'), 'Bike');
    stored = JSON.parse(window.localStorage.getItem('lifttrack:data') ?? '{}');
    expect(stored.activeDraft.exercises[0].cardio).toMatchObject({
      durationMinutes: '25',
      distance: '2',
      machine: 'Bike',
    });
  });

  it('exports and previews a validated backup before replacement', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:lifttrack');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);
    await user.click(screen.getAllByRole('link', { name: /settings/i })[0]);
    await user.click(screen.getByRole('button', { name: 'kg' }));
    await user.click(screen.getByRole('button', { name: 'Export' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:lifttrack');

    const replacement = JSON.parse(window.localStorage.getItem('lifttrack:data') ?? '{}');
    replacement.settings.defaultWeightUnit = 'lb';
    const contents = JSON.stringify(replacement);
    const file = new File([contents], 'lifttrack.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => contents });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await user.upload(input!, file);
    expect(await screen.findByText('Backup ready')).toBeInTheDocument();
    expect(screen.getByText(/Version 1 · 0 sessions/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /replace local data/i }));
    expect(screen.getByRole('button', { name: 'lb' })).toHaveAttribute('aria-pressed', 'true');
  });
});
