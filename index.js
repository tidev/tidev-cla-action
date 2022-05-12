import https from 'https';
import { context, getOctokit } from '@actions/github';
import core from '@actions/core';

const gh = getOctokit(core.getInput('GITHUB_TOKEN'));
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
	.map(u => u.split('|')[2].trim()),
	'dependabot[bot]'
];

const pr = await gh.rest.pulls.listCommits({
	owner: context.repo.owner,
	repo: context.repo.repo,
	pull_number: context.payload.pull_request.number
});


const signed = pr.data.some(({ author: { login }, commit: { sha } }) => {
	const userHasSigned = signedUsers.includes(login);
	if (userHasSigned) {
		console.log(`User ${user} for commit ${sha} is authorized`);
	} else {
		console.log(`User ${user} for commit ${sha} not authorized`);
	}
	return userHasSigned;
});

if (!signed) {
	process.exit(1);
}
