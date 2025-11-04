# Install ClickHouse via script using curl

If you don't need to install ClickHouse for production, the quickest way to get 
set up is to run an install script using curl. The script will determine a suitable
binary for your OS.

<VerticalStepper>

## Install ClickHouse using curl {#install-clickhouse-using-curl}

Run the following comand to download a single binary for your operating system.

```bash
curl https://clickhouse.com/ | sh
```

:::note
For Mac users: If you are getting errors that the developer of the binary cannot be verified, please see [here](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Start clickhouse-local {#start-clickhouse-local}

`clickhouse-local` allows you to process local and remote files using ClickHouse's 
powerful SQL syntax and without the need for configuration. Table data is stored
in a temporary location, meaning that after a restart of `clickhouse-local` 
previously created tables are no longer available.

Run the following command to start [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Start clickhouse-server {#start-clickhouse-server}

Should you wish to persist data, you'll want to run `clickhouse-server`. You can
start the ClickHouse server using the following command:

```bash
./clickhouse server
```

## Start clickhouse-client {#start-clickhouse-client}

With the server up and running, open a new terminal window and run the following command
to launch `clickhouse-client`:

```bash
./clickhouse client
```

You will see something like this: 

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Table data is stored in the current directory and will still be available after a restart
of the ClickHouse server. If necessary, you can pass
`-C config.xml` as an additional command line argument to `./clickhouse server` 
and provide further configuration in a configuration
file. All available configuration settings are documented [here](/operations/server-configuration-parameters/settings) and in the 
[example configuration file
template](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

You are now ready to start sending SQL commands to ClickHouse!

:::tip
The [Quick Start](/get-started/quick-start) walks you through the steps for creating tables and inserting data.
:::

</VerticalStepper>
