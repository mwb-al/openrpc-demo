# OpenRPC Diff & Merge CLI

## Install

```shell script
npm install
```

## Usage

```shell script
node cli.js [options]

Options:
  -g, --merge               merge original -> modified (writes a new dated file)
  -m, --method <name>       limit diff to a single method
  -k, --key <field>         (with --method) limit diff to one top-level field
```

### Examples

Full diff report:

```shell script
node cli.js
```

Compare only `params` of method `eth_getBalance`:

```shell script
node cli.js -m eth_getBalance -k params
```

Merge changes:

```shell script
node cli.js --merge
```
