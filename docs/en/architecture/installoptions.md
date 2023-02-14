---
sidebar_label: Production Installation Process
keywords: [production, clickhouse, install, getting started]
description: Install ClickHouse in production
slug: /en/architecture/installoptions
---

# Installation Process

This document covers the installation of ClickHouse server and ClickHouse Keeper on servers for production use.  For non-production installs, or running
without even installing the binaries, see [install](/docs/en/getting-started/install.md).  For Docker, read the guide with the official image in 
[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/).

## From DEB Packages {#install-from-deb-packages}

It is recommended to use official pre-compiled `deb` packages for Debian or Ubuntu. Run these commands to install packages:

``` bash
sudo apt-get install -y apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you've set up a password.
```


You can replace `stable` with `lts` to use different [release kinds](/docs/en/faq/operations/production.md) based on your needs.

You can also download and install packages manually from [here](https://packages.clickhouse.com/deb/pool/main/c/).

### Packages {#packages}

-   `clickhouse-common-static` — Installs ClickHouse compiled binary files.
-   `clickhouse-server` — Creates a symbolic link for `clickhouse-server` and installs the default server configuration.
-   `clickhouse-client` — Creates a symbolic link for `clickhouse-client` and other client-related tools. and installs client configuration files.
-   `clickhouse-common-static-dbg` — Installs ClickHouse compiled binary files with debug info.

:::info
If you need to install specific version of ClickHouse you have to install all packages with the same version:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

## From RPM Packages {#from-rpm-packages}

It is recommended to use official pre-compiled `rpm` packages for CentOS, RedHat, and all other rpm-based Linux distributions.

First, you need to add the official repository:

``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
sudo yum install -y clickhouse-server clickhouse-client

sudo /etc/init.d/clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

You can replace `stable` with `lts` to use different [release kinds](/docs/en/faq/operations/production.md) based on your needs.

Then run these commands to install packages:

``` bash
sudo yum install clickhouse-server clickhouse-client
```

You can also download and install packages manually from [here](https://packages.clickhouse.com/rpm/stable).

## From Tgz Archives {#from-tgz-archives}

It is recommended to use official pre-compiled `tgz` archives for all Linux distributions, where installation of `deb` or `rpm` packages is not possible.

The required version can be downloaded with `curl` or `wget` from repository https://packages.clickhouse.com/tgz/.
After that downloaded archives should be unpacked and installed with installation scripts. For production environments, it’s recommended to use the latest `stable`-version. You can find its number on GitHub page https://github.com/ClickHouse/ClickHouse/tags with postfix `-stable`.  Example for the latest stable version:

``` bash
LATEST_VERSION=$(curl -s https://packages.clickhouse.com/tgz/stable/ | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;;
esac

for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done

tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start

tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

## Running ClickHouse

ClickHouse can be run using the `service` or `systemctl` commands, or from `init.d`:

``` bash
sudo service clickhouse-server start
```

If you do not have `service` command, run as

``` bash
sudo /etc/init.d/clickhouse-server start
```

If you have `systemctl` command, run as

``` bash
sudo systemctl start clickhouse-server.service
```

## Logs

See the logs in the `/var/log/clickhouse-server/` directory.

## Configuration files

If the server does not start, check the configurations in the file `/etc/clickhouse-server/config.xml`.

## Recommendations for Self-Managed ClickHouse

ClickHouse can run on any Linux, FreeBSD, or macOS with x86-64, ARM, or PowerPC64LE CPU architecture.

ClickHouse uses all hardware resources available to process data.

ClickHouse tends to work more efficiently with a large number of cores at a lower clock rate than with fewer cores at a higher clock rate.

We recommend using a minimum of 4GB of RAM to perform non-trivial queries. The ClickHouse server can run with a much smaller amount of RAM, but 
queries will then frequently abort.

The required volume of RAM generally depends on:

-   The complexity of queries.
-   The amount of data that is processed in queries.

To calculate the required volume of RAM, you may estimate the size of temporary data for 
[GROUP BY](/docs/en/sql-reference/statements/select/group-by.md), 
[DISTINCT](/docs/en/sql-reference/statements/select/distinct.md), 
[JOIN](/docs/en/sql-reference/statements/select/join.md) and other operations you use.

To reduce memory consumption, ClickHouse can swap temporary data to external storage. See 
[GROUP BY in External Memory](/docs/en/sql-reference/statements/select/group-by.md#group-by-in-external-memory) for details.

We recommend to disable the operating system's swap file in production environments.

The ClickHouse binary requires at least 2.5 GB of disk space for installation.

The volume of storage required for your data may be calculated separately based on

-   an estimation of the data volume.

    You can take a sample of the data and get the average size of a row from it. Then multiply the value by the number of rows you plan to store.

-   The data compression coefficient.

    To estimate the data compression coefficient, load a sample of your data into ClickHouse, and compare the actual size of the data with the size of the table stored. For example, clickstream data is usually compressed by 6-10 times.

To calculate the final volume of data to be stored, apply the compression coefficient to the estimated data volume. If you plan to store data in several replicas, then multiply the estimated volume by the number of replicas.

For distributed ClickHouse deployments (clustering), we recommend at least 10G class network connectivity.

Network bandwidth is critical for processing distributed queries with a large amount of intermediate data. Besides, network speed affects replication processes.


