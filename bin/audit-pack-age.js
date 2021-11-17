#! /usr/bin/env node

const { execSync } = require('child_process');

if (process.argv.some((arg) => ['-h', '--help'].includes(arg))) {
  console.log(`Usage: audit-pack-age [options]
    -h, --help          Show help
    -v, --verbose       Show extra info while running
    -q, --quiet         Don’t generate any output
    -j, --json          Output JSON`);
    return;
}

const verbose = process.argv.some((arg) => ['-v', '--verbose'].includes(arg));
const quiet = process.argv.some((arg) => ['-q', '--quiet'].includes(arg));
const outputAsJson = process.argv.some((arg) => ['-j', '--json'].includes(arg));

const cutOffTimestamp = Date.parse('2020-10-01T00:00:00.000Z');

function findPackages(packageInfo) {
  const [packageName, { version, dependencies = {} }] = packageInfo;
  return Object.entries(dependencies).reduce(
    (previous, current) => previous.concat(findPackages(current)),
    [{ packageName, version }],
  );
}

const tree = JSON.parse(execSync('npm ls --all --json'));

const packages = [];
for (const entry of Object.entries(tree.dependencies)) {
  packages.push(...findPackages(entry));
}

const safe = {};
const vulnerable = {};
for (const { packageName, version } of packages) {
  if (safe[packageName]?.includes(version)) continue;
  if (vulnerable[packageName]?.includes(version)) continue;

  if (verbose) console.log(`Checking ${packageName} ${version}…`);
  const info = JSON.parse(execSync(`npm view ${packageName} time --json`));

  const timestamp = Date.parse(info[version]);
  if (timestamp < cutOffTimestamp) {
    if (vulnerable[packageName]) {
      vulnerable[packageName].push(version);
    } else {
      vulnerable[packageName] = [version];
    }
  } else {
    if (safe[packageName]) {
      safe[packageName].push(version);
    } else {
      safe[packageName] = [version];
    }
  }
}

const count = Object.entries(vulnerable).length;
if (count > 0) {
  if (!quiet) {
    if (outputAsJson) {
      console.error(JSON.stringify(vulnerable));
    } else {
      console.error(`${count} potentially compromised packages were found:`);
      for (const [name, versions] of Object.entries(vulnerable)) {
        console.error(`${name}: ${versions.join(', ')}`);
      }
    }
  }
  process.exit(1);
} else {
  if (!quiet) console.log('No vulnerable packages were found.');
}
