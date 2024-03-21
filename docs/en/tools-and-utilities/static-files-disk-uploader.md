---
slug: /en/operations/utilities/static-files-disk-uploader
title: clickhouse-static-files-disk-uploader
keywords: [clickhouse-static-files-disk-uploader, utility, disk, uploader]
---

# clickhouse-static-files-disk-uploader

Outputs a data directory containing metadata for a specified ClickHouse table. This metadata can be used to create a ClickHouse table on a different server containing a read-only dataset backed by a `web` disk.

Do not use this tool for migrating data. Instead use the [`BACKUP` and `RESTORE` commands](/docs/en/operations/backup).

## Usage

```
$ clickhouse static-files-disk-uploader [args]
```

## Commands

|Command|Description|
|---|---|
|`-h`, `--help`|Prints help information|
|`--metadata-path [path]`|The path containing metadata for the specified table|
|`--test-mode`|Enables `test` mode which submits a PUT request to the given URL with the table metadata|
|`--link`|Creates symlinks instead of copying files to the output directory|
|`--url [url]`|Web server URL for `test` mode|
|`--output-dir [dir]`|Directory to output files in `non-test` mode|

## Retrieve metadata path for the specified table

When using `clickhouse-static-files-disk-uploader`, you will need to obtain the metadata path for your desired table.

1. Run the following query specifying your target table and database:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. This should return the path to the data directory for the specified table:

<br />

```
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## Output table metadata directory to the local filesystem

Using the target output directory `output` and a given metadata path, execute the following command:

```
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

If successful, you should see the following message and the `output` directory should contain the metadata for the specified table:

```
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## Output table metadata directory to an external URL

This step is similar to outputting the data directory to the local filesystem, but with the addition of the `--test-mode` flag. Also, instead of specifying an output directory, you must specify a target URL via the `--url` flag.

With `test` mode enabled, the table metadata directory is uploaded via a PUT request to the specified URL.

```
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```
