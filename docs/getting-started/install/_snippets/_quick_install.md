# Install ClickHouse via script using curl

## Install ClickHouse using curl

If you are just getting started and want to see what ClickHouse can do, the simplest way to download ClickHouse 
locally is to run the following command. 

It downloads a single binary for your operating system that can be used to
run the ClickHouse server, `clickhouse-client`, `clickhouse-local`, ClickHouse Keeper, and other tools:

```bash
curl https://clickhouse.com/ | sh
```

:::note
For Mac users: If you are getting errors that the developer of the binary cannot be verified, please see [here](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Start clickhouse-local

Run the following command to start [clickhouse-local](../operations/utilities/clickhouse-local.md):

```bash
./clickhouse
```

`clickhouse-local` allows you to process local and remote files using ClickHouse's powerful SQL and without a need for configuration. Table
data is stored in a temporary location, meaning that after a restart of `clickhouse-local` previously created tables are no longer
available.

As an alternative, you can start the ClickHouse server with this command ...

 ```bash
 ./clickhouse server
 ```

... and open a new terminal to connect to the server with `clickhouse-client`:

```bash
./clickhouse client
```

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Table data is stored in the current directory and still available after a restart of ClickHouse server. If necessary, you can pass
`-C config.xml` as an additional command line argument to `./clickhouse server` and provide further configuration in a configuration
file. All available configuration settings are documented [here](../operations/settings/settings.md) and in an [example configuration file
template](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

You are ready to start sending SQL commands to ClickHouse!

:::tip
The [Quick Start](/quick-start.mdx) walks through the steps for creating tables and inserting data.
:::
