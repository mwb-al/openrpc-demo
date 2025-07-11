# OpenRPC Diff & Merge CLI

A command-line tool for comparing and merging OpenRPC JSON specifications.

## OpenRPC Files Explanation

The ethereum/execution-apis repository contains two OpenRPC JSON files:

- **openrpc.json**: The standard OpenRPC specification with external references. Used for conformity testing.
- **refs-openrpc.json**: The same specification but with all references resolved inline. Used for updating our local OpenRPC specification.

## GitHub Actions Integration

This tool is used with the `openrpc-updater.yml` workflow that automatically:

- Fetches the latest OpenRPC spec from the ethereum/execution-apis repository
- Compares it with our local version
- Creates a PR with the changes if differences are found

The GitHub Actions workflow requires a `PERSONAL_ACCESS_TOKEN` secret to be configured in your repository settings.
Add the token as a repository secret:

- Go to your repository → Settings → Secrets and variables → Actions
- Click "New repository secret"
- Name: `PERSONAL_ACCESS_TOKEN`
- Value: Your generated token

## Exclusions and Customizations (config.js)

This tool applies several filters when processing OpenRPC specifications to align them with our implementation
requirements:

### Skipped Methods

**Discarded Methods:**

- `engine_*` - Engine API methods are not supported in our implementation

**Not Implemented Methods:**

- `debug_getBadBlocks`
- `debug_getRawBlock`
- `debug_getRawHeader`
- `debug_getRawReceipts`
- `debug_getRawTransaction`

These debug methods are excluded because they are not implemented in our current system.

### Skipped Fields/Keys

The following fields are excluded from all methods:

- `examples` - Example values are omitted to reduce specification size
- `baseFeePerBlobGas` - Blob-related fields not applicable to our current implementation
- `blobGasUsedRatio` - Blob-related fields not applicable to our current implementation

### Custom Field Overrides

Certain fields are customized with our own descriptions and metadata for better integration with our system. This
includes custom summaries, descriptions, and schema titles for various `eth_*` methods like `eth_feeHistory`,
`eth_gasPrice`, `eth_getBalance`, etc.

These customizations ensure the OpenRPC specification aligns with our implementation's specific requirements and
documentation standards.

## Install

```shell script
npm install
```

## Usage

```shell script
node cli.js [options]

Options:
  -g, --merge               merge original -> modified (writes a new dated file)
  -o, --original <path>     path to the original OpenRPC JSON file (default: ./original-openrpc.json)
  -m, --modified <path>     path to the modified OpenRPC JSON file (default: ../../docs/openrpc.json)
```

### Examples

Full diff report using default file paths:

```shell script
node cli.js
```

Full diff report with custom file paths:

```shell script
node cli.js --original /path/to/original.json --modified /path/to/modified.json
```

Merge changes using default file paths:

```shell script
node cli.js --merge
```

Merge changes with custom file paths:

```shell script
node cli.js --merge --original /path/to/original.json --modified /path/to/modified.json
```

## Important Note

The script creates a file in the `docs/openrpc.json` path, so the application must be run with appropriate file system
permissions.
