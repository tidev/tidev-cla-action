# TiDev CLA GitHub Action

This action can be called from other GitHub workflows as a status check to make
sure the CLA has been signed.

## Usage

In your project repo, create the file: `.github/workflows/cla.yml`

```yaml
name: Check CLA
on:
  - pull_request

jobs:
  check-cla:
    runs-on: ubuntu-latest
    name: Verify contributor

    steps:
    - uses: tidev/tidev-cla-action@v2
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Releasing a new version

Manually create a new release https://github.com/tidev/tidev-cla-action/releases/new.
Create a new tag such as `v2`.
