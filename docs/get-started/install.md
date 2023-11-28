---
title: "安装"
keywords: [clickhouse, install, getting started, quick start]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# 安装 ClickHouse

您可以通过三个选项来启动和运行 ClickHouse：

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** 官方 ClickHouse 作为一项服务，- 由 ClickHouse 的创建者构建、维护和支持
- **[快速安装](#quick-install):** 易于下载的二进制文件，用于使用 ClickHouse 进行测试和开发
- **[生产部署](#available-installation-options):** ClickHouse 可以在任何具有 x86-64、ARM 或 PowerPC64LE CPU 架构的 Linux、FreeBSD 或 macOS 上运行
- **[Docker Image](https://hub.docker.com/r/clickhouse/clickhouse-server/):** 使用 Docker Hub 中的官方 Docker 镜像

## ClickHouse 云

启动和运行 ClickHouse 的最快、最简单的方法是在 [ClickHouse Cloud](https://clickhouse.cloud/) 中创建新服务。

## 快速安装

:::note
对于特定发行版本的生产安装，请参阅下面的[安装选项](#available-installation-options)。
:::

在 Linux、macOS 和 FreeBSD 上：

1. 如果您刚刚入门，想看看 ClickHouse 能做什么，将 ClickHouse 下载到本地最简单的方法是运行以下命令。 它会为您的操作系统下载一个二进制文件，可用于运行 ClickHouse 服务器、clickhouse-client、clickhouse-local、ClickHouse Keeper 和其他工具：

    ```bash
    curl https://clickhouse.com/ | sh
    ```

1. 运行以下命令启动ClickHouse服务器：

     ```bash
     ./clickhouse-server
     ```

    第一次运行此脚本时，将在当前目录中创建必要的文件和文件夹，然后服务器启动。

1. 打开一个新终端并使用 **./clickhouse 客户端** 连接到您的服务：

  ```bash
  ./clickhouse client
  ```

  ```response
  ./clickhouse client
  ClickHouse client version 23.2.1.1501 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 23.2.1 revision 54461.

  local-host :)
  ```

    您已准备好开始向 ClickHouse 发送 DDL 和 SQL 命令！

:::tip
[快速入门](/docs/en/quick-start.mdx) 逐步介绍创建表和插入数据的步骤。
:::

## 生产部署 {#available-installation-options}

对于 ClickHouse 的生产部署，请选择以下安装选项之一。

### 来自 DEB 软件包 {#install-from-deb-packages}

建议 Debian 或 Ubuntu 使用官方预编译的“deb”包。 运行以下命令来安装软件包：

#### 设置 Debian 存储库

``` bash
sudo apt-get install -y apt-transport-https ca-certificates dirmngr
GNUPGHOME=$(mktemp -d)
sudo GNUPGHOME="$GNUPGHOME" gpg --no-default-keyring --keyring /usr/share/keyrings/clickhouse-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8919F6BD2B48D754
sudo rm -r "$GNUPGHOME"
sudo chmod +r /usr/share/keyrings/clickhouse-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg] https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
```

#### 安装ClickHouse服务器和客户端

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

#### 启动 ClickHouse 服务器

```bash
sudo service clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you've set up a password.
```

<details>
<summary>已弃用的安装 deb 软件包的方法</summary>

``` bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv E0C56BD4

echo "deb https://repo.clickhouse.com/deb/stable/ main/" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

<details>
<summary>安装 deb 软件包的迁移方法</summary>

```bash
sudo apt-key del E0C56BD4
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

您可以根据需要将 `stable` 替换为 `lts`，以使用不同的[发布类型](/知识库/生产)。

您还可以从[此处](https://packages.clickhouse.com/deb/pool/main/c/)手动下载并安装软件包。

#### 安装独立的 ClickHouse Keeper

:::tip
在生产环境中，我们[强烈建议](/docs/en/operations/tips.md#L143-L144)在专用节点上运行 ClickHouse Keeper。 在测试环境中，如果您决定在同一服务器上运行 ClickHouse Server 和 ClickHouse Keeper，则无需安装 ClickHouse Keeper，因为它包含在 ClickHouse 服务器中。 仅在独立的 ClickHouse Keeper 服务器上需要此命令。
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### 启用并启动 ClickHouse Keeper

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### 套餐

- `clickhouse-common-static` — 安装 ClickHouse 编译的二进制文件。
- `clickhouse-server` — 创建 `clickhouse-server` 的符号链接并安装默认服务器配置。
- `clickhouse-client` — 为 `clickhouse-client` 和其他客户端相关工具创建符号链接。 并安装客户端配置文件。
- `clickhouse-common-static-dbg` — 安装带有调试信息的 ClickHouse 编译的二进制文件。
- `clickhouse-keeper` - 用于在专用 ClickHouse Keeper 节点上安装 ClickHouse Keeper。 如果您在与 ClickHouse 服务器相同的服务器上运行 ClickHouse Keeper，则无需安装此软件包。 安装 ClickHouse Keeper 和默认的 ClickHouse Keeper 配置文件。

:::info
如果您需要安装特定版本的 ClickHouse，则必须安装具有相同版本的所有软件包：

```shell
sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7
```
:::

### 来自 RPM 包

建议为 CentOS、RedHat 和所有其他基于 rpm 的 Linux 发行版使用官方预编译的 rpm 包。

#### 设置 RPM 存储库

首先，您需要添加官方存储库：

``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

对于具有“zypper”包管理器的系统（openSUSE、SLES）：

``` bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

稍后任何“yum install”都可以替换为“zypper install”。 要指定特定版本，请将 `-$VERSION` 添加到包名称的末尾，例如 `clickhouse-client-22.2.2.22`。

####安装ClickHouse服务器和客户端

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### 启动 ClickHouse 服务器

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

#### 安装独立的 ClickHouse Keeper

:::tip
在生产环境中，我们[强烈建议](/docs/en/operations/tips.md#L143-L144)在专用节点上运行 ClickHouse Keeper。 在测试环境中，如果您决定在同一服务器上运行 ClickHouse Server 和 ClickHouse Keeper，则无需安装 ClickHouse Keeper，因为它包含在 ClickHouse 服务器中。 仅在独立的 ClickHouse Keeper 服务器上需要此命令。
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### 启用并启动 ClickHouse Keeper

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

<details markdown="1">

<summary>已弃用的安装 rpm 包的方法</summary>

``` bash
sudo yum install yum-utils
sudo rpm --import https://repo.clickhouse.com/CLICKHOUSE-KEY.GPG
sudo yum-config-manager --add-repo https://repo.clickhouse.com/rpm/clickhouse.repo
sudo yum install clickhouse-server clickhouse-client

sudo /etc/init.d/clickhouse-server start
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

您可以根据需要将 `stable` 替换为 `lts`，以使用不同的[发布类型](/知识库/生产)。

然后运行以下命令来安装软件包：

``` bash
sudo yum install clickhouse-server clickhouse-client
```

您还可以从[此处](https://packages.clickhouse.com/rpm/stable)手动下载并安装软件包。

### 来自 Tgz 档案 {#from-tgz-archives}

建议对所有 Linux 发行版使用官方预编译的“tgz”存档，其中无法安装“deb”或“rpm”软件包。

可以使用“curl”或“wget”从存储库 https://packages.clickhouse.com/tgz/ 下载所需的版本。
之后，应解压下载的档案并使用安装脚本进行安装。 最新稳定版本的示例：

``` bash
LATEST_VERSION=$(curl -s https://packages.clickhouse.com/tgz/stable/ | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;;
esac

for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
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

<details markdown="1">

<summary>i已弃用的安装 tgz 档案的方法</summary>

``` bash
export LATEST_VERSION=$(curl -s https://repo.clickhouse.com/tgz/stable/ | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
curl -O https://repo.clickhouse.com/tgz/stable/clickhouse-common-static-$LATEST_VERSION.tgz
curl -O https://repo.clickhouse.com/tgz/stable/clickhouse-common-static-dbg-$LATEST_VERSION.tgz
curl -O https://repo.clickhouse.com/tgz/stable/clickhouse-server-$LATEST_VERSION.tgz
curl -O https://repo.clickhouse.com/tgz/stable/clickhouse-client-$LATEST_VERSION.tgz

tar -xzvf clickhouse-common-static-$LATEST_VERSION.tgz
sudo clickhouse-common-static-$LATEST_VERSION/install/doinst.sh

tar -xzvf clickhouse-common-static-dbg-$LATEST_VERSION.tgz
sudo clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh

tar -xzvf clickhouse-server-$LATEST_VERSION.tgz
sudo clickhouse-server-$LATEST_VERSION/install/doinst.sh
sudo /etc/init.d/clickhouse-server start

tar -xzvf clickhouse-client-$LATEST_VERSION.tgz
sudo clickhouse-client-$LATEST_VERSION/install/doinst.sh
```
</details>

对于生产环境，建议使用最新的“稳定”版本。 您可以在 GitHub 页面 https://github.com/ClickHouse/ClickHouse/tags 上找到其编号，后缀为“-stable”。

### 来自 Docker 镜像 {#from-docker-image}

要在 Docker 内运行 ClickHouse，请遵循 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。 这些图像内部使用官方的“deb”包。

## 非生产部署（高级）

### 从源代码编译 {#from-sources}

要手动编译 ClickHouse，请按照 [Linux](/docs/en/development/build.md) 或 [macOS](/docs/en/development/build-osx.md) 的说明进行操作。

您可以编译软件包并安装它们，也可以在不安装软件包的情况下使用程序。

      Client: <build_directory>/programs/clickhouse-client
      Server: <build_directory>/programs/clickhouse-server

您需要手动创建数据和元数据文件夹，并为所需用户“chown”它们。 它们的路径可以在服务器配置（src/programs/server/config.xml）中更改，默认情况下它们是：

      /var/lib/clickhouse/data/default/
      /var/lib/clickhouse/metadata/default/

在 Gentoo 上，您只需使用“emerge clickhouse”即可从源安装 ClickHouse。

### 安装 CI 生成的二进制文件

ClickHouse 的持续集成 (CI) 基础设施为 [ClickHouse 存储库](https://github.com/clickhouse/clickhouse/) 中的每个提交生成专门的构建，例如 [sanitized](https://github.com/google/sanitizers) 构建、未优化（调试）构建、交叉编译构建等。虽然此类构建通常仅在开发期间有用，但在某些情况下它们也可能对用户感兴趣 。

:::note
由于 ClickHouse 的 CI 随着时间的推移而不断发展，因此下载 CI 生成的版本的确切步骤可能会有所不同。
此外，CI 可能会删除太旧的构建工件，从而使它们无法下载
:::

例如，要下载 ClickHouse v23.4 的 aarch64 二进制文件，请按照以下步骤操作：

- 查找版本 v23.4 的 GitHub 拉取请求：[发布分支 23.4 的拉取请求](https://github.com/ClickHouse/ClickHouse/pull/49238)
- 单击“提交”，然后针对您要安装的特定版本单击类似于“将自动生成的版本更新为 23.4.2.1 和贡献者”的提交。
- 单击绿色勾号/黄点/红十字以打开 CI 检查列表。
- 单击列表中“ClickHouse Build Check”旁边的“详细信息”，它将打开类似于[此页面]的页面（https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/ 报告.html)
- 查找编译器=“clang-*-aarch64”的行 - 有多行。
- 下载这些构建的工件。

下载没有 [SSE3](https://en.wikipedia.org/wiki/SSE3) 支持的非常旧的 x86-64 系统或没有 [SSE3](https://en.wikipedia.org/wiki/SSE3) 支持的旧 ARM 系统的二进制文件
[ARMv8.1-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.1-A)支持，打开一个[拉
request](https://github.com/ClickHouse/ClickHouse/commits/master) 并分别找到 CI 检查“BuilderBinAmd64Compat”
“BuilderBinAarch64V80Compat”。 然后单击“详细信息”，打开“构建”文件夹，滚动到末尾，找到消息“注意：构建 URL
https://s3.amazonaws.com/clickhouse/builds/PRs/.../.../binary_aarch64_v80compat/clickhouse”。然后您可以单击链接下载
建造。

### 仅限 macOS：使用 Homebrew 安装

要使用 [homebrew](https://brew.sh/) 安装 ClickHouse，请参阅[此处](https://formulae.brew.sh/cask/clickhouse)。

## 启动 {#launch}

要将服务器作为守护进程启动，请运行：

```bash
sudo clickhouse start
```

还有其他方式运行 ClickHouse：

```bash
sudo service clickhouse-server start
```

如果您没有“service”命令，请运行

```bash
sudo /etc/init.d/clickhouse-server start
```

如果您有“systemctl”命令，请运行

```bash
sudo systemctl start clickhouse-server.service
```

查看“/var/log/clickhouse-server/”目录中的日志。

如果服务器未启动，请检查文件“/etc/clickhouse-server/config.xml”中的配置。

您还可以从控制台手动启动服务器：

```bash
clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

这样的话，日志就会打印到控制台，方便开发时使用。
如果配置文件在当前目录，则不需要指定`--config-file`参数。 默认情况下，它使用“./config.xml”。

ClickHouse支持访问限制设置。 它们位于“users.xml”文件中（“config.xml”旁边）。
默认情况下，允许“默认”用户从任何地方进行访问，无需密码。 请参阅“用户/默认/网络”。
有关更多信息，请参阅[“配置文件”](/docs/en/operations/configuration-files.md)部分。

启动服务器后，您可以使用命令行客户端连接到它：

``` bash
$ clickhouse-client
```

默认情况下，它代表用户“default”连接到“localhost:9000”，无需密码。 它还可用于使用“--host”参数连接到远程服务器。

终端必须使用UTF-8编码。
有关更多信息，请参阅[“命令行客户端”](/docs/en/interfaces/cli.md)部分。

例子：

```shell
./clickhouse-client

> ClickHouse client version 0.0.18749.
> Connecting to localhost:9000.
> Connected to ClickHouse server version 0.0.18749.
> 
> :) SELECT 1
> 
> SELECT 1
> 
> ┌─1─┐
> │ 1 │
> └───┘
> 
> 1 rows in set. Elapsed: 0.003 sec.
> 
> :)
```

**恭喜，系统工作正常！**

要继续实验，您可以下载测试数据集之一或浏览[教程](/docs/en/tutorial.md)。

## 自管理 ClickHouse 的建议

ClickHouse 可以在任何具有 x86-64、ARM 或 PowerPC64LE CPU 架构的 Linux、FreeBSD 或 macOS 上运行。

ClickHouse 使用所有可用的硬件资源来处理数据。

ClickHouse 在较低时钟速率下使用大量内核往往会比在较高时钟速率下使用较少内核更有效地工作。

我们建议至少使用 4GB RAM 来执行重要查询。 ClickHouse 服务器可以使用更少的 RAM 运行，但查询会频繁中止。

所需的 RAM 容量通常取决于：

- 查询的复杂性。
- 查询中处理的数据量。

要计算所需的 RAM 量，您可以估计 [GROUP BY](/docs/en/sql-reference/statements/select/group-by.md#select-group-by-clause) 的临时数据的大小， [DISTINCT](/docs/en/sql-reference/statements/select/distinct.md#select-distinct)，[JOIN](/docs/en/sql-reference/statements/select/join.md#select-join ）以及您使用的其他操作。

为了减少内存消耗，ClickHouse可以将临时数据交换到外部存储。 有关详细信息，请参阅[外部内存中的 GROUP BY](/docs/en/sql-reference/statements/select/group-by.md#select-group-by-in-external-memory)。

我们建议在生产环境中禁用操作系统的交换文件。

ClickHouse 二进制文件需要至少 2.5 GB 的磁盘空间才能安装。

您的数据所需的存储量可能会根据以下因素单独计算：

- 数据量的估计。

     您可以抽取数据样本并从中获取行的平均大小。 然后将该值乘以您计划存储的行数。

- 数据压缩系数。

     要估计数据压缩系数，请将数据样本加载到 ClickHouse 中，并将数据的实际大小与存储的表的大小进行比较。 例如，点击流数据通常会被压缩 6-10 倍。

要计算要存储的最终数据量，请将压缩系数应用于估计的数据量。 如果您计划将数据存储在多个副本中，请将估计量乘以副本数量。

对于分布式 ClickHouse 部署（集群），我们建议至少 10G 级网络连接。

网络带宽对于处理具有大量中间数据的分布式查询至关重要。 此外，网络速度会影响复制过程。
