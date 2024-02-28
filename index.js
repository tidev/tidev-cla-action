import https from 'node:https';
import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';

const ghToken = core.getInput('repo-token', { required: true });
const gh = getOctokit(ghToken);

const cache = {
	'dependabot[bot]': true
};

async function check(username) {
	if (cache[username]) {
		return cache[username];
	}

	const body = await new Promise((resolve, reject) => {
		// checkToken
		https.get(
			`https://tidev.io/api/cla/check/${username}`,
			res => {
				let buf = '';
				res.on('data', data => {
					buf += data.toString();
				});
				res.on('end', () => {
					if (res.statusCode === 200) {
						resolve(buf);
					} else {
						reject(new Error(`Failed to check CLA: ${res.statusCode} ${res.statusMessage}`));
					}
				});
				res.on('error', reject);
			}
		);
	});

	const { signed } = JSON.parse(body);
	cache[username] = signed;
	return signed;
}

let valid = null;

if (context.eventName === 'push') {
	const login = context.actor;
	if (await check(login.toLowerCase())) {
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

	for (const commitData of pr.data) {
		const { author, commit, sha } = commitData;
		const login = author?.login || commit?.author?.name;
		if (!login) {
			console.log(`User login not found for commit ${sha}!`, commitData);
			valid = false;
		} else if (await check(login.toLowerCase())) {
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
