// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { PVEngine } from '../core/engine';
import { t } from '../i18n';
import { exportProject, importProject } from '../core/projectFile';
import { showToast } from '../core/uiHelpers';
import type { UIElements } from './elements';
import type { UnifiedConfig } from '../core/unifiedConfig';

export function initExportImport(
  engine: PVEngine,
  ui: UIElements,
  onConfigApplied: (config: UnifiedConfig) => void
): void {
  const importProjectInput = document.createElement('input');
  importProjectInput.type = 'file';
  importProjectInput.accept = '.pvtoolce';
  importProjectInput.style.display = 'none';
  document.body.appendChild(importProjectInput);

  ui.exportProjectBtn.addEventListener('click', () => {
    doExportProject(engine, ui);
  });

  ui.importProjectBtn.addEventListener('click', () => {
    importProjectInput.click();
  });

  importProjectInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      doImportProject(engine, ui, file, onConfigApplied);
    }
    importProjectInput.value = '';
  });
}

async function doExportProject(engine: PVEngine, ui: UIElements): Promise<void> {
  const config = engine.getConfig();

  const mediaFile = engine.getMediaFile?.() || null;
  const audioFile = engine.getAudioFile?.() || null;
  const lrcContent = ui.lrcPickName.textContent !== t('no_file')
    ? ui.textInput.value
    : null;

  const blob = await exportProject({
    config,
    mediaFile: mediaFile || undefined,
    audioFile: audioFile || undefined,
    lrcContent: lrcContent || undefined,
    lrcFileName: ui.lrcPickName.textContent !== t('no_file') ? ui.lrcPickName.textContent : undefined,
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  a.download = `pv-project-${timestamp}.pvtoolce`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(t('export_success'));
}

async function doImportProject(
  engine: PVEngine,
  ui: UIElements,
  file: File,
  onConfigApplied: (config: UnifiedConfig) => void
): Promise<void> {
  if (!confirm(t('confirm_import'))) return;

  ui.recLabel.textContent = t('packing');

  try {
    const { project, mediaFile, audioFile, lrcContent } = await importProject(file);

    // Restore media
    if (mediaFile) {
      const mode = project.config.media.mode || 'fit';
      await engine.addMedia(mediaFile, mode);

      if (project.config.media.offsetX !== 0 || project.config.media.offsetY !== 0) {
        engine.setMediaOffset(project.config.media.offsetX, project.config.media.offsetY);
      }
      if (project.config.media.scale !== 1) {
        engine.setMediaScale(project.config.media.scale);
      }

      ui.mediaPickName.textContent = mediaFile.name;
      ui.mediaModeGroup.style.display = 'flex';
      ui.mediaPosGroup.style.display = 'flex';

      ui.mediaXSlider.value = String(project.config.media.offsetX);
      ui.mediaYSlider.value = String(project.config.media.offsetY);
      ui.mediaScaleSlider.value = String(project.config.media.scale);
      ui.mediaXVal.textContent = String(project.config.media.offsetX);
      ui.mediaYVal.textContent = String(project.config.media.offsetY);
      ui.mediaScaleVal.textContent = `${project.config.media.scale.toFixed(1)}x`;
    }

    // Restore audio
    if (audioFile) {
      ui.audioPickName.textContent = audioFile.name;
      await engine.beat.loadAudio(audioFile);
      ui.audioControls.style.display = 'flex';
      ui.audioStatus.textContent = t('playing');
      ui.audioToggle.textContent = t('pause');
    }

    // Restore LRC
    if (lrcContent) {
      ui.lrcPickName.textContent = project.resources.lrc?.name || t('lrc_imported');
      ui.textInput.value = lrcContent;
      // Apply text input logic
      const hasTimestamps = /\[\d{1,2}:\d{2}/.test(lrcContent);
      if (hasTimestamps) {
        const { parseLrc } = await import('../core/lrc');
        const parsed = parseLrc(lrcContent);
        if (parsed.length > 0) {
          engine.setLyricTimeline(parsed);
        }
      } else {
        engine.setText(lrcContent.replace(/\r?\n/g, '/'));
      }
    }

    // Apply config
    engine.applyConfig(project.config);
    onConfigApplied(project.config);

    showToast(t('import_success'));
  } catch (err) {
    console.error('Import failed:', err);
    showToast(t('import_failed'));
  } finally {
    ui.recLabel.textContent = t('rec');
  }
}