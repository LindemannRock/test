/**
 * Updates package.json with the project name and description.
 * Also strips opt-in devDependencies that weren't selected during `make create`.
 *
 * @copyright 2026 LindemannRock
 * @license MIT
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ROOT } from '../paths.mjs';

/**
 * Read the pinned version of a devDependency from the last git-committed
 * package.json. Falls back to whatever's in the working copy (or undefined).
 * Keeps the CLI in sync with the committed baseline without hardcoding.
 */
function committedDevDep(name) {
	try {
		const raw = execSync('git show HEAD:package.json', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
		return JSON.parse(raw).devDependencies?.[name];
	} catch {
		return undefined;
	}
}

export function updatePackageJson({ name, description }, { useCritical = true } = {}) {
	const pkgPath = path.join(ROOT, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	pkg.name = name;
	pkg.description = description || '';

	pkg.devDependencies ??= {};
	if (useCritical) {
		// Idempotent — add back if a previous run removed it.
		// Prefer the version committed in git, fall back to whatever's already here.
		const version = pkg.devDependencies['rollup-plugin-critical']
			|| committedDevDep('rollup-plugin-critical')
			|| '*';
		pkg.devDependencies['rollup-plugin-critical'] = version;
	} else {
		delete pkg.devDependencies['rollup-plugin-critical'];
	}

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
}
