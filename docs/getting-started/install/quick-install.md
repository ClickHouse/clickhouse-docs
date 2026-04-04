---
description: 'Quickly install ClickHouse using the CLI or curl'
keywords: ['ClickHouse', 'install', 'quick', 'curl', 'clickhousectl', 'CLI']
sidebar_label: 'Quick install'
slug: /install/quick-install
title: 'Quick install'
hide_title: true
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickInstall from './_snippets/_quick_install.md'

# Quick install

If you don't need to install ClickHouse for production, the quickest way to get
set up is using the ClickHouse CLI or running an install script using curl.

<Tabs>
  <TabItem value="cli" label="ClickHouse CLI" default>

The ClickHouse CLI (`clickhousectl`) helps you install and manage local ClickHouse
versions, launch servers, and run queries.

<VerticalStepper>

## Install the ClickHouse CLI {#install-the-cli}

```bash
curl https://clickhouse.com/cli | sh
```

A `chctl` alias is also created automatically for convenience.

## Install ClickHouse {#install-clickhouse}

```bash
clickhousectl local install stable
```

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

  </TabItem>
  <TabItem value="curl" label="Curl script">

<QuickInstall/>

  </TabItem>
</Tabs>
