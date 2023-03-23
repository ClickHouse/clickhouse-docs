---
sidebar_position: 20
slug: /en/integrations/sql-clients/clickhouse-client-local
sidebar_label:  clickhouse-client (CLI)
title: Download clickhouse-client and clickhouse-local
---

# clickhouse client and clickhouse local

`clickhouse client` is a client application that is used to connect to ClickHouse from the command line. `clickhouse local` is a client application that is used to query files on disk and across the network.  Many of the guides in the ClickHouse documentation will have you examine the schema of a file (CSV, TSV, Parquet, etc.) with `clickhouse local`, query the file, and even manipulate the data from the file in order to prepare it for insertion into ClickHouse.  We will often have you query a file with `clickhouse local` and pipe the output to `clickhouse client` to stream the data into ClickHouse.  There are example datasets that use both `clickhouse client` and `clickhouse local` in the Next Steps section at the end of this document.

:::tip
If you have already installed ClickHouse server locally you may have **clickhouse client** and **clickhouse local** installed.  Check by running **clickhouse client** and **clickhouse local** at the commandline.  Otherwise, follow the instructions for your operating system.
:::


## Prerequisite for Microsoft Windows

In Microsoft Windows 10 or 11 with the Windows Subsystem for Linux (WSL) version 2 (WSL 2) you can run Ubuntu Linux, and then run `clickhouse client` and `clickhouse local`.

Install WSL by following Microsoft's [WSL documentation](https://docs.microsoft.com/en-us/windows/wsl/install).

#### Open a shell in WSL 2:

By running the `bash` command from your terminal you will enter WSL:

```bash
bash
```

## Download ClickHouse

```
curl https://clickhouse.com/ | sh
```

## Verify `clickhouse client`

```bash
./clickhouse client
```
:::note
`clickhouse client` will try to connect to a local ClickHouse server instance, if you do not have one running it will timeout.  See the [`clickhouse-client`](/docs/en/integrations/cli.mdx) docs for examples.
:::

## Verify `clickhouse local`

```bash
./clickhouse local
```

## Next Steps
See the [NYPD Complaint dataset](/docs/en/getting-started/example-datasets/nypd_complaint_data.md) for example use of both `clickhouse-client` and `clickhouse-local`.

See the [`clickhouse-client`](/docs/en/integrations/cli.mdx) docs.

See the [`clickhouse-local`](/docs/en/operations/utilities/clickhouse-local.md) docs.

See the [ClickHouse install](/docs/en/getting-started/install.md) docs.
