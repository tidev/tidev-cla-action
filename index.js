import https from 'https';

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

const signed = body
	.match(/^\|.+\|$/mg)
	?.slice(2)
	.map(u => u.split('|')[2].trim());

if (signed.find(u => u === process.env.GITHUB_USER)) {
	console.log('User is authorized');
} else {
	console.log('User not authorized');
	process.exit(1);
}
