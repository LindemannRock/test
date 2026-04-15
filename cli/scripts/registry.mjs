#!/usr/bin/env node

/**
 * Interactive registry picker — starter-maintenance tool for the data files
 * that drive `make create` (plugin list today; themes etc. later).
 *
 * Two-step flow: pick resource → pick action. To add a new resource (e.g.
 * themes), just append it to RESOURCES below and create the matching
 * `registry-<resource>-<action>` Makefile targets.
 *
 * @copyright 2026 LindemannRock
 * @license MIT
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { spawn } from 'child_process';
import { cancel } from '../utils/cancel.mjs';

const RESOURCES = [
	{
		value: 'plugins',
		label: 'Plugins',
		hint: 'cli/config/plugins.mjs',
		actions: [
			{ value: 'check',  label: 'Check versions',  hint: 'compare registry against Packagist' },
			{ value: 'update', label: 'Update versions', hint: 'apply bumps (major bumps confirmed)' },
			{ value: 'add',    label: 'Add a plugin',    hint: 'search Packagist + add to registry' },
			{ value: 'fetch',  label: 'Fetch configs',   hint: 'pull default config.php from GitHub' },
		],
	},
	// Future: { value: 'themes', label: 'Themes', actions: [...] },
];

function runShell(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { stdio: 'inherit' });
		child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited ${code}`))));
	});
}

async function main() {
	p.intro(pc.bgCyan(pc.black(' Registry ')));
	p.log.info('Starter-maintenance tool — manages data that drives ' + pc.bold('make create') + '.');

	// If there's only one resource, skip the first picker
	let resource;
	if (RESOURCES.length === 1) {
		resource = RESOURCES[0];
	} else {
		const choice = await p.select({
			message: 'Which registry?',
			options: RESOURCES.map(({ value, label, hint }) => ({ value, label, hint })),
		});
		if (p.isCancel(choice)) cancel();
		resource = RESOURCES.find((r) => r.value === choice);
	}

	const action = await p.select({
		message: `${resource.label} — what would you like to do?`,
		options: resource.actions,
	});
	if (p.isCancel(action)) cancel();

	const target = `registry-${resource.value}-${action}`;
	try {
		p.log.step(`make ${target}`);
		await runShell('make', [target]);
	} catch (err) {
		p.log.error(err.message);
		process.exit(1);
	}

	p.outro(pc.green('Done.'));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
