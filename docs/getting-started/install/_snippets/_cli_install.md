# Install ClickHouse using the ClickHouse CLI

The ClickHouse CLI (`clickhousectl`) helps you install and manage local ClickHouse
versions, launch servers, and run queries.

<VerticalStepper>

## Install the ClickHouse CLI {#install-the-cli}

```bash
curl https://clickhouse.com/cli | sh
```

A `chctl` alias is also created automatically for convenience.

## Install ClickHouse {#cli-install-clickhouse}

Install the latest stable version of ClickHouse:

```bash
clickhousectl local install stable
```

You can also install a specific version:

```bash
clickhousectl local install lts             # Latest LTS release
clickhousectl local install 25.6            # Latest 25.6.x.x
clickhousectl local install 25.6.1.1        # Exact version
```

## Start clickhouse-server {#cli-start-clickhouse-server}

```bash
clickhousectl local server start
```

The server runs in the background. To verify it's running:

```bash
clickhousectl local server list
```

## Start clickhouse-client {#cli-start-clickhouse-client}

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
