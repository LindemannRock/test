/**
 * Servd-specific credentials prompt.
 * Only shown when Servd is selected as the hosting provider.
 */

import * as p from '@clack/prompts';
import { cancel } from '../utils/cancel.mjs';

export async function promptServdCredentials() {
	p.note(
		'Servd requires a Project Slug and Security Key for local development.\n' +
		'Get them from: https://app.servd.host → Project Settings → Assets',
		'Servd credentials',
	);

	return p.group(
		{
			slug: () =>
				p.text({
					message: 'Servd Project Slug',
					placeholder: 'my-project-slug',
					validate: (v) => {
						if (!v) return 'Project slug is required for Servd';
					},
				}),
			key: () =>
				p.password({
					message: 'Servd Security Key',
					validate: (v) => {
						if (!v) return 'Security key is required for Servd';
					},
				}),
		},
		{ onCancel: () => cancel() },
	);
}
