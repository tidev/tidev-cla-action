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
    - env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      uses: tidev/tidev-cla-action@v1
```

## Releasing a new version

To release a new version we need to bump the version and then recreate the `v1` tag. We use the `v1` tag to avoid having to update the action in all repositories when a change is made. To do this:

1. Bump the version as required using `npm version major|minor|patch`
2. Recreate the v1 tag using `git tag --force v1`
3. Delete the tag on the remote `git tag :refs/tags/v1`
4. Push the commit and updated tags `git push -f --tags`
