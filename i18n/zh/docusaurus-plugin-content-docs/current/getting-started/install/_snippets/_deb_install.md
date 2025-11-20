import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



# 在 Debian/Ubuntu 上安装 ClickHouse {#install-from-deb-packages}

> 建议在 **Debian** 或 **Ubuntu** 上使用官方预编译的 `deb` 软件包。

<VerticalStepper>


## 设置 Debian 仓库 {#setup-the-debian-repository}

要安装 ClickHouse,请运行以下命令:


```bash
# 安装前置依赖包
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
```


# 下载 ClickHouse GPG 密钥并将其保存到密钥环中
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg



# 获取系统架构
ARCH=$(dpkg --print-architecture)



# 将 ClickHouse 仓库添加到 apt 源列表
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list



# 更新 apt 软件包列表

sudo apt-get update

```

- 您可以根据需要将 `stable` 替换为 `lts` 以使用不同的[发布版本类型](/knowledgebase/production)。
- 您可以从 [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/) 手动下载并安装软件包。
<br/>
<details>
<summary>安装 deb 软件包的旧版方法</summary>
```


```bash
# 安装必备软件包
sudo apt-get install apt-transport-https ca-certificates dirmngr
```


# 添加 ClickHouse GPG 密钥以认证软件包
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754



# 将 ClickHouse 仓库添加到 apt 源列表中
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    


# 更新 apt 包列表
sudo apt-get update



# 安装 ClickHouse 服务端和客户端软件包
sudo apt-get install -y clickhouse-server clickhouse-client



# 启动 ClickHouse 服务器
sudo service clickhouse-server start



# 启动 ClickHouse 命令行客户端

clickhouse-client # 如果设置了密码，则使用 &quot;clickhouse-client --password&quot;。

```

</details>
```


## 安装 ClickHouse 服务端和客户端 {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```


## 启动 ClickHouse {#start-clickhouse-server}

要启动 ClickHouse 服务器,请运行:

```bash
sudo service clickhouse-server start
```

要启动 ClickHouse 客户端,请运行:

```bash
clickhouse-client
```

如果您为服务器设置了密码,则需要运行:

```bash
clickhouse-client --password
```


## 安装独立的 ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
在生产环境中,我们强烈建议在专用节点上运行 ClickHouse Keeper。
在测试环境中,如果您决定在同一服务器上运行 ClickHouse Server 和 ClickHouse Keeper,
则无需安装 ClickHouse Keeper,因为它已包含在 ClickHouse Server 中。
:::

要在独立的 ClickHouse Keeper 服务器上安装 `clickhouse-keeper`,请运行:

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

下面详细列出了可用的各种 deb 软件包:

| 软件包                        | 说明                                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse-common-static`     | 安装 ClickHouse 编译后的二进制文件。                                                                                                                                                                                                                                                            |
| `clickhouse-server`            | 为 `clickhouse-server` 创建符号链接并安装默认服务器配置。                                                                                                                                                                                                        |
| `clickhouse-client`            | 为 `clickhouse-client` 和其他客户端相关工具创建符号链接,并安装客户端配置文件。                                                                                                                                                                                                                                              |
| `clickhouse-common-static-dbg` | 安装带有调试信息的 ClickHouse 编译后的二进制文件。                                                                                                                                                                                                                                                            |
| `clickhouse-keeper`            | 用于在专用 ClickHouse Keeper 节点上安装 ClickHouse Keeper。如果您在与 ClickHouse 服务器相同的服务器上运行 ClickHouse Keeper,则无需安装此软件包。安装 ClickHouse Keeper 和默认 ClickHouse Keeper 配置文件。 |

<br />
:::info 如果您需要安装特定版本的 ClickHouse,则必须安装相同版本的所有软件包:`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7` :::
