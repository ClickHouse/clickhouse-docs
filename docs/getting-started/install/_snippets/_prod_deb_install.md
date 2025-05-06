import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install ClickHouse on Debian/Ubuntu {#install-from-deb-packages}

> It is recommended to use official pre-compiled `deb` packages for **Debian** or **Ubuntu**.

<VerticalStepper>

## Setup the Debian repository {#setup-the-debian-repository}

To install ClickHouse run the following commands:

```bash
# Install prerequisite packages
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Download the ClickHouse GPG key and store it in the keyring
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

# Get the system architecture
ARCH=$(dpkg --print-architecture)

# Add the ClickHouse repository to apt sources
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

# Update apt package lists
sudo apt-get update
```

- You can replace `stable` with `lts` to use different [release kinds](/knowledgebase/production) based on your needs.
- You can download and install packages manually from [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).
<br/>
<details>
<summary>Old distributions method for installing the deb-packages</summary>

```bash
# Install prerequisite packages
sudo apt-get install apt-transport-https ca-certificates dirmngr

# Add the ClickHouse GPG key to authenticate packages
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

# Add the ClickHouse repository to apt sources
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    
# Update apt package lists
sudo apt-get update

# Install ClickHouse server and client packages
sudo apt-get install -y clickhouse-server clickhouse-client

# Start the ClickHouse server service
sudo service clickhouse-server start

# Launch the ClickHouse command line client
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

## Install ClickHouse server and client {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## Start ClickHouse {#start-clickhouse-server}

To start the ClickHouse server, run:

```bash
sudo service clickhouse-server start
```

To start ClickHouse client, run:

```bash
clickhouse-client
```

If you set up a password for your server, then you will need to run:

```bash
clickhouse-client --password
```

## Install standalone ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
In production environments we strongly recommend running ClickHouse Keeper on dedicated nodes.
In test environments, if you decide to run ClickHouse Server and ClickHouse Keeper on the same server, 
then you do not need to install ClickHouse Keeper as it is included with ClickHouse server.
:::

To install `clickhouse-keeper` on standalone ClickHouse Keeper servers, run:

```bash
sudo apt-get install -y clickhouse-keeper
```

## Enable and start ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## Packages {#packages}

The various deb packages available are detailed below:

| Package                        | Description                                                                                                                                                                                                                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | Installs ClickHouse compiled binary files.                                                                                                                                                                                                                                             |
| `clickhouse-server`            | Creates a symbolic link for `clickhouse-server` and installs the default server configuration.                                                                                                                                                                                         |
| `clickhouse-client`            | Creates a symbolic link for `clickhouse-client` and other client-related tools. and installs client configuration files.                                                                                                                                                               |
| `clickhouse-common-static-dbg` | Installs ClickHouse compiled binary files with debug info.                                                                                                                                                                                                                             |
| `clickhouse-keeper`            | Used to install ClickHouse Keeper on dedicated ClickHouse Keeper nodes.  If you are running ClickHouse Keeper on the same server as ClickHouse server, then you do not need to install this package. Installs ClickHouse Keeper and the default ClickHouse Keeper configuration files. |

<br/>
:::info
If you need to install a specific version of ClickHouse, you have to install all packages with the same version:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::