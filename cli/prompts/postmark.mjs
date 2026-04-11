/**
 * Postmark-specific credentials prompt.
 * Only shown when Postmark is selected as a plugin.
 */

import * as p from '@clack/prompts';
import { cancel } from '../utils/cancel.mjs';

export async function promptPostmarkToken() {
	p.note(
		'Postmark needs a Server API Token to send email in staging/production.\n' +
		'Get it from: https://account.postmarkapp.com → Servers → (your server) → API Tokens\n' +
		'Leave blank to skip (local dev uses Mailpit regardless).',
		'Postmark token',
	);

	const token = await p.password({
		message: 'Postmark Server API Token (optional)',
	});

	if (p.isCancel(token)) cancel();
	return token || null;
}
