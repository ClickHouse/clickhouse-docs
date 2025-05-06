# Install ClickHouse on rpm-based distributions {#from-rpm-packages}

> It is recommended to use official pre-compiled `rpm` packages for **CentOS**, **RedHat**, and all other rpm-based 
> Linux distributions.

<VerticalStepper>

## Setup the RPM repository {#setup-the-rpm-repository}

Add the official repository by running the following command:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

For systems with `zypper` package manager (openSUSE, SLES), run:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

In the steps below, `yum install` can be replaced by `zypper install`, depending
on which package manager you are using.

## Install ClickHouse server and client {#install-clickhouse-server-and-client-1}

To install ClickHouse run the following commands:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- You can replace `stable` with `lts` to use different [release kinds](/knowledgebase/production) based on your needs.
- You can download and install packages manually from [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable).
- To specify a particular version, add `-$version` to the end of the package name,
for example:

```bash
sudo yum install clickhouse-server-22.8.7.34`
```

## Start ClickHouse server {#start-clickhouse-server-1}

To start ClickHouse server, run:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

To start ClickHouse client, run:

```sql
clickhouse-client
```

If you set up a password for your server, then you will need to run:

```bash
clickhouse-client --password
```

## Install standalone ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
In production environments we strongly recommend running ClickHouse Keeper on dedicated nodes.
In test environments, if you decide to run ClickHouse Server and ClickHouse Keeper on the same server, 
then you do not need to install ClickHouse Keeper as it is included with ClickHouse server.
:::

To install `clickhouse-keeper` on standalone ClickHouse Keeper servers, run:

```bash
sudo yum install -y clickhouse-keeper
```

## Enable and start ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
