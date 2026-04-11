/**
 * Bilingual toggle: remove Arabic scaffolding when the user opts out.
 *
 * The .env file is generated fresh from cli/templates/env.example each run,
 * so env handling lives inside generateEnvFile. This action only removes
 * non-env artefacts (the ar translations directory).
 *
 * TODO: When we revisit multi-site properly, this should also strip RTL/
 * language-switcher logic from templates rather than leaving it in.
 */

import fs from 'fs';
import path from 'path';
import { ROOT } from '../paths.mjs';

export function removeBilingual() {
	const arPath = path.join(ROOT, 'translations', 'ar');
	if (fs.existsSync(arPath)) {
		fs.rmSync(arPath, { recursive: true });
	}
}
