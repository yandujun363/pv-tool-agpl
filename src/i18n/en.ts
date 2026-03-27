/*!
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * PV Tool — AGPL Community Edition
 * Based on the last AGPL-3.0 version published on 2026-03-18
 * 
 * Copyright (c) 2026 DanteAlighieri13210914
 * Copyright (c) 2026 Contributors to PV Tool AGPL Community Edition
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/agpl-3.0.txt>.
 * 
 * Source repository: https://github.com/yandujun363/pv-tool-agpl
 */

import type { LocaleKey } from './zh';

export const en: Record<LocaleKey, string> = {
  // Page
  'page_title': 'PV Tool AGPL Community Edition - Japanese PV Visual Generator',
  'initializing': 'Initializing PV Tool AGPL Community Edition...',
  'initializing_desc': 'Please wait, detecting monitor refresh rate on first load',

  // Panel titles
  'postfx': 'Post FX',
  'effects_library': 'Effects Library',

  // Left panel
  'template': 'Template',
  'custom': '✦ Custom',
  'canvas_color': 'Canvas Color',
  'follow_template': 'Follow Template',
  'text_label': 'Text (split with /)',
  'expand': 'Expand',
  'collapse': 'Collapse',
  'seg_duration': 'Segment Duration',
  'anim_speed': 'Animation Speed',
  'motion_intensity': 'Motion Intensity',
  'bg_opacity': 'Background Opacity',
  'media': 'Media',
  'media_mode': 'Media Mode',
  'auto_fit': 'Auto Fit',
  'free_mode': 'Free Mode',
  'apply': 'Apply',
  'audio': 'Audio',
  'pause': '⏸ Pause',
  'play': '▶ Play',
  'playing': '♪ Playing',
  'paused': '⏹ Paused',
  'bpm': 'BPM',
  'beat_react': 'Beat React',

  // Right panel — Post FX
  'shake': 'Shake',
  'zoom': 'Zoom',
  'tilt': 'Tilt',
  'glitch': 'Glitch',
  'hue_shift': 'Hue Shift',
  'media_position': 'Media Position',
  'offset_x': 'Offset X',
  'offset_y': 'Offset Y',
  'scale': 'Scale',
  'rec': 'REC',
  'stop': 'STOP',
  'packing': 'Packing...',
  'alpha_export': 'Alpha Export',
  'srt_import': 'SRT Timeline',
  'lrc_import': 'Import LRC',
  'timer_label': 'Time',


  'render': 'Render Settings',
  'render_resolution': 'Render Resolution',
  'render_resolution_auto': 'Auto (Performance Based)',
  'render_resolution_1x': '1x (Standard)',
  'render_resolution_1_5x': '1.5x (High)',
  'render_resolution_2x': '2x (Ultra)',
  'render_resolution_custom': 'Custom WxH',
  'render_resolution_width': 'Width',
  'render_resolution_height': 'Height',
  'render_resolution_apply': 'Apply',
  'render_fps': 'FPS Limit',
  'render_fps_auto': 'Auto (Max)',
  'render_fps_30': '30 FPS',
  'render_fps_60': '60 FPS',
  'render_fps_custom': 'Custom',
  'render_fps_value': 'FPS',
  'render_fps_current': 'Current FPS: {fps}',
  'fps_warning_exceed_monitor': 'Set FPS({fps}) exceeds monitor refresh rate({max}), may cause screen tearing',

  // Right panel — Export
  'export': 'Export',
  'copy_url': 'Copy URL',

  // Right panel — Listen
  'listen': 'Listen',
  'listen_now_playing': 'Listen Now Playing',

  // Color swatch titles
  'white': 'White',
  'black': 'Black',
  'blue': 'Blue',
  'red': 'Red',
  'yellow': 'Yellow',
  'pink': 'Pink',
  'p5red': 'P5 Red',

  // Effect categories
  'cat_background': 'Background',
  'cat_geometry': 'Geometry',
  'cat_lines': 'Lines',
  'cat_text': 'Text',
  'cat_overlay': 'Overlay',
  'cat_hud': 'HUD',
  'cat_organic': 'Organic',
  'cat_grunge': 'Digital Grunge',
  'cat_special': 'Special Shapes',

  // Template names
  'tpl_p5': 'P5',
  'tpl_blueBold': 'Blue Impact',
  'tpl_kineticSplit': 'Kinetic Split',
  'tpl_bluePlane': 'Blue Composition (video recommended)',
  'tpl_cyberGrunge': 'Cyber Grunge',
  'tpl_geometric': 'Geometric',
  'tpl_rainCity': 'Matrix',
  'tpl_cyberpunkHud': 'Night City Monitor (video recommended)',
  'tpl_emotionCinema': 'Emotion Cinema (video recommended)',
  'tpl_hystericNight': 'Hysteric Night (photosensitivity warning)',
  'tpl_spiderWeb': 'Spider Web',
  'tpl_staggeredText': 'Staggered Text',
  'tpl_calmVillain': 'Calm Villain',
  'tpl_girlyClouds': 'Pink Cloud',
  'tpl_sweetPink': 'Sweet Pink',
  'tpl_flyMeToTheMoon': 'Fly Me to the Moon',
  'tpl_kawaiPixel': 'Kawaii Pixel',

  // File picker
  'choose_file': 'Choose File',
  'no_file': 'No file chosen',

  //Export and import project
  'project_file': 'Project File',
  'export_project': 'Export Project',
  'import_project': 'Import Project',
  'export_success': 'Export Successful',
  'import_success': 'Import Successful',
  'import_failed': 'Import Failed',
  'project_file_desc': 'PV Tool CE Project File (.pvtoolce)',
  'confirm_import': 'Importing will replace the current configuration. Continue?',
  'export_with_resources': 'Include Resource Files',
  'export_with_media': 'Include Background Media',
  'export_with_audio': 'Include Audio',
  'export_with_lyrics': 'Include Lyrics',
  'lrc_imported': 'Lyrics imported',

  // Sharecode
  'export_code': 'Export Code',
  'export_json_confirm': 'Export as JSON format (readable)?\nOK=JSON, Cancel=legacy binary',
  'import_code': 'Import Code',
  'import_btn': 'Import',
  'code_copied': 'Share code copied to clipboard',
  'code_invalid': 'Invalid code',
  'save_tpl': 'Save',
  'delete_tpl': 'Delete',
  'confirm': 'Confirm',
  'cancel': 'Cancel',
  'tpl_name_placeholder': 'Template name...',
  'confirm_delete': 'Confirm delete',
  'copy': 'Copy',
  'share_code': 'Share Code',
  'paste_code': 'Paste share code...',

  // Effect categories (used in custom panel)
  'ecat_背景': 'Background',
  'ecat_几何装饰': 'Geometry',
  'ecat_线条结构': 'Lines & Structure',
  'ecat_文字': 'Text',
  'ecat_叠加效果': 'Overlay',
  'ecat_HUD': 'HUD',
  'ecat_有机形态': 'Organic',
  'ecat_数字废墟': 'Digital Grunge',
  'ecat_特殊形状': 'Special Shapes',
  'ecat_云朵条纹': 'Clouds & Stripes',
  'ecat_Kawaii像素': 'Kawaii Pixel',

  // Effect labels
  'fx_textureBackground': 'Texture BG',
  'fx_gradientOverlay': 'Gradient Overlay',
  'fx_triangleGrid': 'Triangle Grid',
  'fx_backgroundBlocks': 'Background Blocks',
  'fx_breathingBlocks': 'Breathing Blocks',
  'fx_checkerboard': 'Checkerboard',
  'fx_concentricCircles': 'Concentric Circles',
  'fx_diamondShapes': 'Diamonds',
  'fx_crossPattern': 'Cross Pattern',
  'fx_scatteredShapes': 'Scattered Shapes',
  'fx_halftoneBlocks': 'Halftone',
  'fx_shadowShapes': 'Shadow Shapes',
  'fx_centeredSquares': 'Centered Squares',
  'fx_balancingCircles': 'Balancing Circles',
  'fx_radialRectangles': 'Radial Rectangles',
  'fx_flowingLines': 'Flowing Lines',
  'fx_diagonalFill': 'Diagonal Fill',
  'fx_diagonalHatch': 'Diagonal Hatch',
  'fx_parallelogramStripes': 'Parallelogram Stripes',
  'fx_diagonalSplit': 'Diagonal Split',
  'fx_diagonalStructure': 'Diagonal Structure',
  'fx_burstLines': 'Burst Lines',
  'fx_screenBorder': 'Screen Border',
  'fx_dashedGuideLines': 'Dashed Guidelines',
  'fx_perspectiveGrid': 'Perspective Grid',
  'fx_compositionGuides': 'Composition Guides',
  'fx_webLines': 'Web Lines',
  'fx_heroText': 'Hero Text',
  'fx_scatteredText': 'Scattered Text',
  'fx_textStrip': 'Text Strip',
  'fx_textCards': 'Text Cards',
  'fx_bigOutlineText': 'Big Outline Text',
  'fx_cuteOutlineText': 'Cute Outline Text',
  'fx_layeredText': 'Layered Text',
  'fx_glowTextCards': 'Glow Text Cards',
  'fx_verticalSubText': 'Vertical Sub Text',
  'fx_formulaText': 'Formula Text',
  'fx_fallingText': 'Falling Text',
  'fx_staggeredText': 'Staggered Text',
  'fx_colorMask': 'Color Mask',
  'fx_chromaticAberration': 'Chromatic Aberration',
  'fx_glitchBars': 'Glitch Bars',
  'fx_vignette': 'Vignette',
  'fx_scanlines': 'Scanlines',
  'fx_filmGrain': 'Film Grain',
  'fx_dotScreen': 'Dot Screen',
  'fx_hudCorners': 'HUD Corners',
  'fx_hudStatusText': 'HUD Status',
  'fx_hudInfoPanel': 'HUD Info Panel',
  'fx_rulerGuide': 'Ruler Guide',
  'fx_targetGuide': 'Target Guide',
  'fx_motionBrackets': 'Motion Brackets',
  'fx_glowRing': 'Glow Ring',
  'fx_lightSpot': 'Light Spot',
  'fx_organicBlob_blob': 'Organic Blob',
  'fx_organicBlob_wave': 'Wave',
  'fx_organicBlob_cloud': 'Cloud',
  'fx_smearBrush': 'Smear Brush',
  'fx_noiseText': 'Noise Text',
  'fx_dataMonitors': 'Data Monitors',
  'fx_paperTear': 'Paper Tear',
  'fx_jigsawGrid': 'Jigsaw Grid',
  'fx_edgeClouds': 'Edge Clouds',
  'fx_pinkStripes': 'Pink Stripes',
  'fx_pinkGrid': 'Pink Grid',
  'fx_scalloppedBorder': 'Scalloped Border',
  'fx_pulsingCircle': 'Pulsing Circle',
  'fx_starTrail': 'Star Trail',
  'fx_planet': 'Planet',
  'fx_pixelWindow': 'Pixel Window',
  'fx_desktopIcon': 'Desktop Icon',
  'fx_pixelBackground': 'Pixel Background',
  'fx_pixelTypewriter': 'Pixel Typewriter',

  // Hint messages
  'hint_press': 'Press',
  'hint_hide_panels': 'to hide panels',

  // Modal messages
  'modal_confirm': 'OK',
  'np_fail_title': 'Listen failed: Now Playing service not detected!',
  'np_fail_body': 'Now Playing is a free, open-source song display tool that supports 20+ music apps. Download it from:',
  'copy_url_settings': 'Settings',
  'copy_url_transparent_bg': 'Transparent Background',
  'copy_url_use_template': 'Use Current Template',
  'copy_url_copy_btn': 'Copy',
  'url_copied': 'URL copied to clipboard',
  'listen_np_tip': '',
  'copy_url_tip': '',

  // WesingCap
  'listen_wesingcap': 'Listen Nexus WesingCap',
  'listen_wesingcap_tip': '',
  'nwc_fail_title': 'Listen failed: Nexus WesingCap service not detected!',
  'nwc_fail_body': 'Metabox Nexus WesingCap reads lyrics from WeSing desktop app. Learn more:',
  'nwc_settings_title': 'Nexus WesingCap Settings',
  'nwc_ws_addr': 'WebSocket Address',
  'nwc_ws_addr_placeholder': 'Default localhost:8765',
  'nwc_save': 'Save',
  'nwc_saved': 'Saved',
  'nwc_disconnected': 'WesingCap connection lost',

  // Copyright
  'license_title': 'AGPL-3.0 Open Source License',
  'license_text': 'This tool is open source under the GNU Affero General Public License v3.0.',
  'license_source': 'Source Code',
  'license_copyright': '© 2026 PV Tool — AGPL Community Edition',
};
