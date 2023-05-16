import https from 'https';
import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';

const token = core.getInput('repo-token', { required: true });
const gh = getOctokit(token);
const url = 'https://raw.githubusercontent.com/tidev/organization-docs/main/AUTHORIZED_CONTRIBUTORS.md';

const body = await new Promise((resolve, reject) => {
	https.get(url, res => {
		let buf = '';
		res.on('data', data => {
			buf += data.toString();
		});
		res.on('end', () => {
			resolve(buf);
		});
		res.on('error', reject);
	});
});

const signedUsers = [...body
	.match(/^\|.+\|$/mg)
	?.slice(2)
	.map(u => u.split('|')[2].trim().toLowerCase()),
	'dependabot[bot]'
];

let valid = null;

if (context.eventName === 'push') {
	const login = context.actor;
	if (signedUsers.includes(login.toLowerCase())) {
		console.log(`User ${login} for commit ${context.sha} is authorized`);
		if (valid === null) {
			valid = true;
		}
	} else {
		console.log(`User ${login} for commit ${context.sha} not authorized`);
		valid = false;
	}

} else if (context.eventName === 'pull_request') {
	const pr = await gh.rest.pulls.listCommits({
		owner: context.repo.owner,
		repo: context.repo.repo,
		pull_number: context.payload.pull_request.number
	});

	for (const { author, sha } of pr.data) {
		const login = author?.login;
		if (!login) {
			console.log(`User login not found for commit ${sha}!`, login);
			valid = false;
		} else if (signedUsers.includes(login.toLowerCase())) {
			console.log(`User ${login} for commit ${sha} is authorized`);
			if (valid === null) {
				valid = true;
			}
		} else {
			console.log(`User ${login} for commit ${sha} not authorized`);
			valid = false;
		}
	}

} else {
	console.error(`Unsupported event "${context.eventName}"`);
}

if (!valid) {
	process.exit(1);
}
