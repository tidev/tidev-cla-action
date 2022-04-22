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
        GITHUB_USER: ${{ github.actor }}
      uses: tidev/tidev-cla-action@v1
```
