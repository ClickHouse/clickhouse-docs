---
sidebar_position: 20
slug: /en/integrations/sql-clients/clickhouse-client-local
sidebar_label: Install clickhouse-client
title: Install clickhouse-client and clickhouse-local
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# clickhouse-client and clickhouse-local

`clickhouse-client` is a client application that is used to connect to ClickHouse from the command line. `clickhouse-local` is a client application that is used to query files on disk and across the network.  Many of the guides in the ClickHouse documentation will have you examine the schema of a file (CSV, TSV, Parquet, etc.) with `clickhouse-local`, query the file, and even manipulate the data from the file in order to prepare it for insertion into ClickHouse.  We will often have you query a file with `clickhouse-local` and pipe the output to `clickhouse-client` to stream the data into ClickHouse.  There are example datasets that use both `clickhouse-client` and `clickhouse-local` in the Next Steps section at the end of this document.

:::tip
If you have already installed ClickHouse server locally you may have **clickhouse-client** and **clickhouse local** installed.  Check by running **clickhouse client** and **clickhouse local** at the commandline.  Otherwise follow the instructions for your operating system.
:::

## Install clickhouse-client and clickhouse-local

<Tabs groupId="os">
<TabItem value="linux" label="Linux" default>

#### Install the clickhouse-client package:

```bash
sudo apt-get install -y apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
sudo apt-get install -y clickhouse-client
```

#### Verify that the commands are in your path:

```bash
which clickhouse-client
which clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

#### Download ClickHouse:

We do not provide an installer for macOS.  Download the binary build for your architecture (x86_64 or Apple Silicon).

```bash title="macOS x86_64"
curl -O 'https://builds.clickhouse.com/master/macos/clickhouse' \
&& chmod a+x ./clickhouse
```

```bash title="macOS Aarch64 (Apple Silicon)"
curl -O 'https://builds.clickhouse.com/master/macos-aarch64/clickhouse' \
&& chmod a+x ./clickhouse
```

#### Add clickhouse to your path

Optionally you might want to add the `clickhouse` binary to your path.

```bash
sudo cp ./clickhouse /usr/local/bin/
```

</TabItem>
<TabItem value="wsl" label="Microsoft Windows with WSL 2">

In Microsoft Windows 10 or 11 with the Windows Subsystem for Linux (WSL) version 2 (WSL 2) you can run Ubuntu Linux, and then install `clickhouse-client` and `clickhouse-local` by following the Debian install instructions.

Install WSL by following Microsoft's [WSL documentation](https://docs.microsoft.com/en-us/windows/wsl/install).

#### Open a shell in WSL 2:

By running the `bash` command from your terminal you will enter WSL:

```bash
bash
```

#### Install the clickhouse-client package:

```bash
sudo apt-get install -y apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
sudo apt-get install -y clickhouse-client
```

#### Verify that the commands are in your path:

```bash
which clickhouse-client
which clickhouse-local
```

</TabItem>
</Tabs>

## Next Steps
See the [NYPD Complaint dataset](/docs/en/getting-started/example-datasets/nypd_complaint_data.md) for example use of both `clickhouse-client` and `clickhouse-local`.

See the [`clickhouse-client`](/docs/en/integrations/cli.mdx) docs.

See the [`clickhouse-local`](/docs/en/operations/utilities/clickhouse-local.md) docs.
