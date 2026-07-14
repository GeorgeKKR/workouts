import { useRef, useState, type ChangeEvent } from 'react';
import { parseBackup, serializeBackup } from '../lib/storage';
import { useFitness } from '../context/FitnessContext';
import type { AppData } from '../types';

export const Settings = () => {
  const { data, updateSettings, replaceData } = useFitness();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<AppData | null>(null);
  const [importError, setImportError] = useState('');
  const legacyCount = data.legacyCompletions.reduce((count, item) => count + item.workoutIds.length, 0);

  const exportData = () => {
    const blob = new Blob([serializeBackup(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifttrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const readBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setPreview(parseBackup(await file.text()));
      setImportError('');
    } catch (error) {
      setPreview(null);
      setImportError(error instanceof Error ? error.message : 'The backup could not be read.');
    } finally {
      event.target.value = '';
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    if (window.confirm(`Replace local data with ${preview.sessions.length} completed sessions? This cannot be undone without an export.`)) {
      replaceData(preview);
      setPreview(null);
    }
  };

  return (
    <div className="page settings-page">
      <header className="page-header"><div><p className="date-line">Local preferences</p><h1>Settings</h1></div></header>
      <h2 className="settings-label">Preferences</h2>
      <section className="settings-section">
        <div className="setting-row">
          <span><strong>Default weight unit</strong><small>New strength sets start with this unit.</small></span>
          <div className="segmented" role="group" aria-label="Default weight unit">
            {(['lb', 'kg'] as const).map((unit) => <button key={unit} aria-pressed={data.settings.defaultWeightUnit === unit} onClick={() => updateSettings({ defaultWeightUnit: unit })}>{unit}</button>)}
          </div>
        </div>
        <div className="setting-row">
          <span><strong>Default distance unit</strong><small>New cardio sessions start with this unit.</small></span>
          <div className="segmented" role="group" aria-label="Default distance unit">
            {(['mi', 'km'] as const).map((unit) => <button key={unit} aria-pressed={data.settings.defaultDistanceUnit === unit} onClick={() => updateSettings({ defaultDistanceUnit: unit })}>{unit}</button>)}
          </div>
        </div>
      </section>

      <h2 className="settings-label">Data</h2>
      <section className="settings-section">
        <div className="setting-row">
          <span><strong>Export backup</strong><small>Download all workouts and settings as JSON.</small></span>
          <button className="button button-secondary" onClick={exportData}>Export</button>
        </div>
        <div className="setting-row">
          <span><strong>Import backup</strong><small>Validate a LiftTrack backup before replacing local data.</small></span>
          <button className="button button-secondary" onClick={() => inputRef.current?.click()}>Choose file</button>
          <input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={readBackup} />
        </div>
        {importError ? <div className="notice notice-warning" role="alert">{importError}</div> : null}
        {preview ? (
          <div className="import-preview">
            <span><strong>Backup ready</strong><small>Version {preview.version} · {preview.sessions.length} sessions · {preview.legacyCompletions.length} legacy day records</small></span>
            <div><button className="text-button" onClick={() => setPreview(null)}>Cancel</button><button className="button button-primary" onClick={confirmImport}>Replace local data</button></div>
          </div>
        ) : null}
      </section>

      <h2 className="settings-label">iPhone app</h2>
      <section className="settings-section">
        <div className="setting-row setting-row-stack">
          <span><strong>Add LiftTrack to your Home Screen</strong><small>In Safari, tap Share, then choose Add to Home Screen. LiftTrack opens full-screen and keeps your workout data on this device.</small></span>
        </div>
      </section>

      {legacyCount > 0 ? (
        <>
          <h2 className="settings-label">Imported data</h2>
          <section className="settings-section">
            <div className="setting-row setting-row-stack">
              <span><strong>Legacy completions</strong><small>Undated markers from the original app. They stay out of progress charts.</small></span>
              <strong>{legacyCount} markers</strong>
            </div>
          </section>
        </>
      ) : null}
      <p className="about-copy">LiftTrack stores everything in this browser. No account, server, analytics, or cloud sync.</p>
    </div>
  );
};
