---
description: 'Quickly install ClickHouse using the ClickHouse CLI'
keywords: ['ClickHouse', 'install', 'quick', 'clickhousectl', 'CLI']
sidebar_label: 'Quick install'
slug: /install/quick-install
title: 'Quick install'
hide_title: true
doc_type: 'guide'
---

If you don't need to install ClickHouse for production, the quickest way to get
set up is using the ClickHouse CLI (`clickhousectl`), which helps you install
local ClickHouse versions, launch servers, run queries and manage ClickHouse
Cloud.

:::note Windows users
ClickHouse runs natively on Linux and macOS. On Windows, run these steps inside
the [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about).
:::

<VerticalStepper>

## Install the ClickHouse CLI {#install-the-cli}

```bash
curl https://clickhouse.com/cli | sh
```

A `chctl` alias is also created automatically for convenience.

## Install ClickHouse {#install-clickhouse}

Install the latest stable version of ClickHouse and make it your default:

```bash
clickhousectl local use stable
```

`local use` installs the version if it isn't already present, sets it as your
default, and creates a `clickhouse` symlink in `~/.local/bin` (on your `PATH`)
so you can invoke the `clickhouse` binary directly. Any later step in these docs
that runs a `clickhouse` command then works as-is.

:::note[Use vs install]
`clickhousectl local use <version>` installs a version *and* makes it your
default, updating the `clickhouse` symlink on your `PATH`. To download a version
without changing your default or updating the symlink, use
`clickhousectl local install <version>` instead.
:::

## Start clickhouse-server {#start-clickhouse-server}

```bash
clickhousectl local server start
```

The server runs in the background. To verify it's running:

```bash
clickhousectl local server list
```

## Start clickhouse-client {#start-clickhouse-client}

```bash
clickhousectl local client
```

You will see something like this:

```response
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

You're now ready to start sending SQL commands to ClickHouse!

:::tip
The [Quick Start](/get-started/quick-start) walks you through the steps for creating tables and inserting data.
:::

</VerticalStepper>
