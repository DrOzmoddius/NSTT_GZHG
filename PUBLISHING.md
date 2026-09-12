# Publishing NSTT_GZHG

To publish a new version:

## Create a Release Tag

```bash
git tag v0.1.0
git push origin v0.1.0
```

The GitHub Actions workflow will automatically:
- Run tests and linting
- Publish to GitHub Packages (@DrOzmoddius/nstt-gzhg)
- Create a GitHub Release with auto-generated notes

## Installing the Package

Users can install with:

```bash
npm install @DrOzmoddius/nstt-gzhg
```

## First Time Setup (if needed)

Authenticate with GitHub Packages:

```bash
npm config set @DrOzmoddius:registry https://npm.pkg.github.com
npm login --scope=@DrOzmoddius --registry=https://npm.pkg.github.com
```

Then publish manually:

```bash
npm publish
```
