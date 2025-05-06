# Install ClickHouse on rpm-based distributions {#from-rpm-packages}

It is recommended to use official pre-compiled `rpm` packages for CentOS, RedHat, and all other rpm-based Linux distributions.

## Setup the RPM repository {#setup-the-rpm-repository}
First, you need to add the official repository:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

For systems with `zypper` package manager (openSUSE, SLES):

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

Later any `yum install` can be replaced by `zypper install`. To specify a particular version, add `-$VERSION` to the end of the package name, e.g. `clickhouse-client-22.2.2.22`.

## Install ClickHouse server and client {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

## Start ClickHouse server {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

## Install standalone ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
In production environment we strongly recommend running ClickHouse Keeper on dedicated nodes.
In test environments, if you decide to run ClickHouse Server and ClickHouse Keeper on the same server,  you do not need to install ClickHouse Keeper as it is included with ClickHouse server.
This command is only needed on standalone ClickHouse Keeper servers.
:::

```bash
sudo yum install -y clickhouse-keeper
```

## Enable and start ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

You can replace `stable` with `lts` to use different [release kinds](/knowledgebase/production) based on your needs.

Then run these commands to install packages:

```bash
sudo yum install clickhouse-server clickhouse-client
```

You can also download and install packages manually from [here](https://packages.clickhouse.com/rpm/stable).
