---
null
...
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 在 Debian/Ubuntu 上安装 ClickHouse {#install-from-deb-packages}

> 建议使用官方预编译的 `deb` 包来安装 **Debian** 或 **Ubuntu**。

<VerticalStepper>

## 设置 Debian 存储库 {#setup-the-debian-repository}

要安装 ClickHouse，请运行以下命令：

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

- 您可以将 `stable` 替换为 `lts`，以根据需要使用不同的 [发布类型](/knowledgebase/production)。
- 您可以从 [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/) 手动下载并安装软件包。
<br/>
<details>
<summary>旧版本的 deb-packages 安装方法</summary>

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

## 安装 ClickHouse 服务器和客户端 {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## 启动 ClickHouse {#start-clickhouse-server}

要启动 ClickHouse 服务器，请运行：

```bash
sudo service clickhouse-server start
```

要启动 ClickHouse 客户端，请运行：

```bash
clickhouse-client
```

如果您为服务器设置了密码，则需要运行：

```bash
clickhouse-client --password
```

## 安装独立的 ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
在生产环境中，我们强烈建议在专用节点上运行 ClickHouse Keeper。
在测试环境中，如果您决定在同一台服务器上运行 ClickHouse Server 和 ClickHouse Keeper，
则无需安装 ClickHouse Keeper，因为它已包含在 ClickHouse 服务器中。
:::

要在独立的 ClickHouse Keeper 服务器上安装 `clickhouse-keeper`，请运行：

```bash
sudo apt-get install -y clickhouse-keeper
```

## 启用并启动 ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## 软件包 {#packages}

可用的各种 deb 软件包详述如下：

| 包                              | 描述                                                                                                                                                                                                                                                                              |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | 安装 ClickHouse 编译的二进制文件。                                                                                                                                                                                                                                                  |
| `clickhouse-server`            | 创建 `clickhouse-server` 的符号链接并安装默认服务器配置。                                                                                                                                                                                                                      |
| `clickhouse-client`            | 创建 `clickhouse-client` 的符号链接和其他与客户端相关的工具，并安装客户端配置文件。                                                                                                                                                                                                |
| `clickhouse-common-static-dbg` | 安装带调试信息的 ClickHouse 编译的二进制文件。                                                                                                                                                                                                                                     |
| `clickhouse-keeper`            | 用于在专用 ClickHouse Keeper 节点上安装 ClickHouse Keeper。如果您在与 ClickHouse 服务器相同的服务器上运行 ClickHouse Keeper，则无需安装此软件包。安装 ClickHouse Keeper 及默认的 ClickHouse Keeper 配置文件。 |

<br/>
:::info
如果您需要安装特定版本的 ClickHouse，您必须安装具有相同版本的所有软件包：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
