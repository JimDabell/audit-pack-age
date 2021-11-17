# audit-pack-age

GitHub [recently disclosed](https://github.blog/2021-11-15-githubs-commitment-to-npm-ecosystem-security/#security-issues-related-to-the-npm-registry)
that there was a vulnerability that allowed people to publish new versions of
any npm package without proper authorization. They say that this hasn’t been
abused from September 2020 onwards. However this means that any package that
hasn’t been updated since that time is of unknown provenance and may have been
published by somebody malicious.

This tool runs against a JavaScript project and tells you which packages you
rely on have not been updated since that time.

## Usage

Run `npx audit-pack-age` in the root of your JavaScript project.

```
Usage: audit-pack-age [options]
    -h, --help          Show help
    -v, --verbose       Show extra info while running
    -q, --quiet         Don’t generate any output
    -j, --json          Output JSON
```
