/**
 * Async shell command runner.
 *
 * Captures stdout/stderr and only prints them on failure, so the clack spinner
 * stays clean during normal runs. Bails out of the setup with a helpful error
 * message when a command fails.
 */

import * as p from '@clack/prompts';
import { spawn } from 'child_process';
import { ROOT } from '../paths.mjs';

export function run(cmd) {
	return new Promise((resolve, reject) => {
		const child = spawn('sh', ['-c', cmd], {
			cwd: ROOT,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (data) => { stdout += data; });
		child.stderr.on('data', (data) => { stderr += data; });

		child.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				if (stdout) console.log(stdout);
				if (stderr) console.error(stderr);
				p.log.error(`Command failed: ${cmd}`);
				p.cancel('Installation failed. Fix the error above and run: make install');
				process.exit(1);
			}
		});

		child.on('error', (err) => {
			p.log.error(`Failed to run: ${cmd}\n${err.message}`);
			p.cancel('Installation failed.');
			process.exit(1);
		});
	});
}
