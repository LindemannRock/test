/**
 * Multi-site actions: scaffold translation directories and clean unused ones.
 */

import fs from 'fs';
import path from 'path';
import { ROOT } from '../paths.mjs';

const TRANSLATIONS_DIR = path.join(ROOT, 'translations');
const EN_TEMPLATE = path.join(TRANSLATIONS_DIR, 'en', 'site.php');

/**
 * Create translation directories for each site.
 * Uses the EN template as a base for new languages.
 */
export function scaffoldTranslations(sites) {
	// Read the EN template as the base for all new languages
	let template = '';
	if (fs.existsSync(EN_TEMPLATE)) {
		template = fs.readFileSync(EN_TEMPLATE, 'utf-8');
	}

	for (const site of sites) {
		const langDir = path.join(TRANSLATIONS_DIR, site.handle);
		const sitePhp = path.join(langDir, 'site.php');

		fs.mkdirSync(langDir, { recursive: true });

		// Only create site.php if it doesn't exist (don't overwrite user edits)
		if (!fs.existsSync(sitePhp) && template) {
			fs.writeFileSync(sitePhp, template);
		}
	}
}

/**
 * Remove translation directories that don't match any selected site handle.
 */
export function cleanUnusedTranslations(sites) {
	const activeHandles = new Set(sites.map((s) => s.handle));

	if (!fs.existsSync(TRANSLATIONS_DIR)) return;

	for (const entry of fs.readdirSync(TRANSLATIONS_DIR, { withFileTypes: true })) {
		if (entry.isDirectory() && !activeHandles.has(entry.name)) {
			fs.rmSync(path.join(TRANSLATIONS_DIR, entry.name), { recursive: true });
		}
	}
}
