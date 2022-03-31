import got from 'got';

const url = 'https://raw.githubusercontent.com/tidev/organization-docs/main/AUTHORIZED_CONTRIBUTORS.md';

const { body } = await got(url);

const signed = body
	.match(/^\|.+\|$/mg)
	?.slice(2)
	.map(u => u.split('|')[2].trim());

if (!signed.find(u => u === process.env.GITHUB_USER)) {
	process.exit(1);
}
