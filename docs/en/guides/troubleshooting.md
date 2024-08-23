---
title: "Troubleshooting"
---

## Installation

### Cannot import GPG keys from keyserver.ubuntu.com with apt-key

The `apt-key` feature with the [Advanced package tool (APT) has been deprecated](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html). Users should use the `gpg` command instead. Please refer the [install guide](../getting-started/install.md) article.

### Canot import GPG keys from keyserver.ubuntu.com with gpg

1. See if your `gpg` is installed:

```shell
sudo apt-get install gnupg
```

### Cannot get deb packages from ClickHouse repository with apt-get

1. Check firewall settings.
1. If you cannot access the repository for any reason, download packages as described in the [install guide](../getting-started/install.md) article and install them manually using the `sudo dpkg -i <packages>` command. You will also need the `tzdata` package.

### Cannot update deb packages from ClickHouse repository with apt-get

The issue may be happened when the GPG key is changed.

Please use the manual from the [setup](../getting-started/install.md#setup-the-debian-repository) page to update the repository configuration.

### You get different warnings with `apt-get update`

The completed warning messages are as one of following:

```shell
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```shell
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```shell
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

To resolve the above issue, please use the following script:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Can't get packages with Yum because of wrong signature

Possible issue: the cache is wrong, maybe it's broken after updated GPG key in 2022-09.

The solution is to clean out the cache and lib directory for Yum:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

After that follow the [install guide](../getting-started/install.md#from-rpm-packages)

## Connecting to the server 

Possible issues:

- The server is not running.
- Unexpected or wrong configuration parameters.

### Server is not running

#### Check if server is running

```shell
sudo service clickhouse-server status
```

If the server is not running, start it with the command:

```shell
sudo service clickhouse-server start
```

#### Check the logs

The main log of `clickhouse-server` is in `/var/log/clickhouse-server/clickhouse-server.log` by default.

If the server started successfully, you should see the strings:

- `<Information> Application: starting up.` — Server started.
- `<Information> Application: Ready for connections.` — Server is running and ready for connections.

If `clickhouse-server` start failed with a configuration error, you should see the `<Error>` string with an error description. For example:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

If you do not see an error at the end of the file, look through the entire file starting from the string:

```plaintext
<Information> Application: starting up.
```

If you try to start a second instance of `clickhouse-server` on the server, you see the following log:

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Status file ./status already exists - unclean restart. Contents:
PID: 8510
Started at: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Cannot lock file ./status. Another server instance in same directory is already running.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: shutting down
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Uninitializing subsystem: Logging Subsystem
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

#### See system.d logs

If you do not find any useful information in `clickhouse-server` logs or there aren’t any logs, you can view `system.d` logs using the command:

```shell
sudo journalctl -u clickhouse-server
```

#### Start clickhouse-server in interactive mode

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

This command starts the server as an interactive app with standard parameters of the autostart script. In this mode `clickhouse-server` prints all the event messages in the console.

### Configuration parameters

Check:

1. Docker settings:

    - If you run ClickHouse in Docker in an IPv6 network, make sure that `network=host` is set.

1. Endpoint settings.
    - Check [listen_host](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-listen_host) and [tcp_port](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-tcp_port) settings.
    - ClickHouse server accepts localhost connections only by default.

1. HTTP protocol settings:

    - Check protocol settings for the HTTP API.

1. Secure connection settings.

    - Check:
        - The [tcp_port_secure](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-tcp_port_secure) setting.
        - Settings for [SSL certificates](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-openssl).
    - Use proper parameters while connecting. For example, use the `port_secure` parameter with `clickhouse_client`.

1. User settings:

    - You might be using the wrong user name or password.

## Query processing

If ClickHouse is not able to process the query, it sends an error description to the client. In the `clickhouse-client` you get a description of the error in the console. If you are using the HTTP interface, ClickHouse sends the error description in the response body. For example:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

If you start `clickhouse-client` with the `stack-trace` parameter, ClickHouse returns the server stack trace with the description of an error.

You might see a message about a broken connection. In this case, you can repeat the query. If the connection breaks every time you perform the query, check the server logs for errors.

## Efficiency of query processing

If you see that ClickHouse is working too slowly, you need to profile the load on the server resources and network for your queries.

You can use the clickhouse-benchmark utility to profile queries. It shows the number of queries processed per second, the number of rows processed per second, and percentiles of query processing times.
