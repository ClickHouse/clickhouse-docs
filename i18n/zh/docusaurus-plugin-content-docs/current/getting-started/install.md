---
sidebar_label: 安装
keywords: [clickhouse, 安装, 入门, 快速开始]
description: 安装 ClickHouse
slug: /install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# 安装 ClickHouse

您有四种选择来快速启动 ClickHouse：

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** 官方的 ClickHouse 服务，由 ClickHouse 的创建者构建、维护和支持
- **[快速安装](#quick-install):** 适用于测试和开发的易下载二进制文件
- **[生产部署](#available-installation-options):** ClickHouse 可以在任何 Linux、FreeBSD 或 macOS 上运行，支持 x86-64、现代 ARM (ARMv8.2-A 及以上) 或 PowerPC64LE CPU 架构
- **[Docker 镜像](https://hub.docker.com/_/clickhouse):** 使用 Docker Hub 中的官方 Docker 镜像

## ClickHouse Cloud {#clickhouse-cloud}

获取和运行 ClickHouse 的最快、最简单的方法是在 [ClickHouse Cloud](https://clickhouse.cloud/) 中创建一个新服务。

## 快速安装 {#quick-install}

:::tip
有关特定版本的生产安装，请参见下面的 [安装选项](#available-installation-options)。
:::

在 Linux、macOS 和 FreeBSD 上：

1. 如果您刚刚开始并想看看 ClickHouse 能做什么，下载 ClickHouse 最简单的方法是运行以下命令。它为您的操作系统下载一个可用于运行 ClickHouse 服务器、`clickhouse-client`、`clickhouse-local`、ClickHouse Keeper 和其他工具的二进制文件：

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Mac 用户注意：如果您收到二进制文件开发者无法验证的错误，请参见 [这里](/knowledgebase/fix-developer-verification-error-in-macos)。
   :::

2. 运行以下命令以启动 [clickhouse-local](../operations/utilities/clickhouse-local.md)：

   ```bash
   ./clickhouse
   ```

   `clickhouse-local` 允许您使用 ClickHouse 强大的 SQL 处理本地和远程文件，而无需配置。表数据存储在临时位置，这意味着在 `clickhouse-local` 重启后，之前创建的表将不再可用。

   作为替代方案，您可以使用此命令启动 ClickHouse 服务器 ...

   ```bash
   ./clickhouse server
   ```

   ... 并打开一个新终端以使用 `clickhouse-client` 连接到服务器：

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

   表数据存储在当前目录中，并在重启 ClickHouse 服务器后仍然可用。如有必要，您可以将 `-C config.xml` 作为附加命令行参数传递给 `./clickhouse server`，并在配置文件中提供进一步的配置。所有可用的配置设置都记录在 [这里](../operations/settings/settings.md) 和 [示例配置文件模板](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)。

   您已经准备好开始向 ClickHouse 发送 SQL 命令！

:::tip
[快速开始](/quick-start.mdx) 介绍了创建表和插入数据的步骤。
:::

## 生产部署 {#available-installation-options}

对于 ClickHouse 的生产部署，请从以下安装选项中选择之一。

### 从 DEB 包安装 {#install-from-deb-packages}

建议使用 Debian 或 Ubuntu 的官方预编译 `deb` 包。运行以下命令安装软件包：

#### 设置 Debian 仓库 {#setup-the-debian-repository}
``` bash
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

ARCH=$(dpkg --print-architecture)
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
```

#### 安装 ClickHouse 服务器和客户端 {#install-clickhouse-server-and-client}
```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

#### 启动 ClickHouse 服务器 {#start-clickhouse-server}

```bash
sudo service clickhouse-server start
clickhouse-client # 或 "clickhouse-client --password" 如果您设置了密码。
```

<details>
<summary>旧版本的 DEB 包安装方法</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # 或 "clickhouse-client --password" 如果您设置了密码。
```

</details>

您可以将 `stable` 替换为 `lts` 以使用不同的 [发布种类](/knowledgebase/production) 以满足您的需求。

您也可以从 [这里](https://packages.clickhouse.com/deb/pool/main/c/) 手动下载并安装软件包。

#### 安装独立的 ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
在生产环境中，我们强烈建议在专用节点上运行 ClickHouse Keeper。
在测试环境中，如果您决定在同一台服务器上运行 ClickHouse Server 和 ClickHouse Keeper，则不需要安装 ClickHouse Keeper，因为它包含在 ClickHouse 服务器中。
此命令仅在独立的 ClickHouse Keeper 服务器上需要。
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### 启用并启动 ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### 软件包 {#packages}

- `clickhouse-common-static` — 安装 ClickHouse 编译的二进制文件。
- `clickhouse-server` — 为 `clickhouse-server` 创建符号链接，并安装默认的服务器配置。
- `clickhouse-client` — 为 `clickhouse-client` 和其他客户端相关工具创建符号链接并安装客户端配置文件。
- `clickhouse-common-static-dbg` — 安装带有调试信息的 ClickHouse 编译二进制文件。
- `clickhouse-keeper` - 用于在专用 ClickHouse Keeper 节点上安装 ClickHouse Keeper。如果您在与 ClickHouse 服务器相同的服务器上运行 ClickHouse Keeper，则不需要安装此软件包。安装 ClickHouse Keeper 及默认的 ClickHouse Keeper 配置文件。

:::info
如果您需要安装特定版本的 ClickHouse，则必须安装所有版本相同的软件包：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### 从 RPM 包安装 {#from-rpm-packages}

建议为 CentOS、RedHat 和所有其他基于 rpm 的 Linux 发行版使用官方预编译的 `rpm` 包。

#### 设置 RPM 仓库 {#setup-the-rpm-repository}
首先，您需要添加官方仓库：

``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

对于带有 `zypper` 包管理器的系统 (如 openSUSE、SLES)：

``` bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

之后，任何 `yum install` 都可以用 `zypper install` 替换。要指定特定版本，请在软件包名称末尾添加 `-$VERSION`，例如 `clickhouse-client-22.2.2.22`。

#### 安装 ClickHouse 服务器和客户端 {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### 启动 ClickHouse 服务器 {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # 或 "clickhouse-client --password" 如果您设置了密码。
```

#### 安装独立的 ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
在生产环境中，我们强烈建议在专用节点上运行 ClickHouse Keeper。
在测试环境中，如果您决定在同一台服务器上运行 ClickHouse Server 和 ClickHouse Keeper，则不需要安装 ClickHouse Keeper，因为它包含在 ClickHouse 服务器中。
此命令仅在独立的 ClickHouse Keeper 服务器上需要。
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### 启用并启动 ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

您可以将 `stable` 替换为 `lts` 以使用不同的 [发布种类](/knowledgebase/production) 以满足您的需求。

然后运行以下命令安装软件包：

``` bash
sudo yum install clickhouse-server clickhouse-client
```

您也可以从 [这里](https://packages.clickhouse.com/rpm/stable) 手动下载并安装软件包。

### 从 Tgz 归档安装 {#from-tgz-archives}

建议为所有 Linux 发行版使用官方预编译的 `tgz` 归档，无法安装 `deb` 或 `rpm` 包的情况下。

所需版本可以使用 `curl` 或 `wget` 从 https://packages.clickhouse.com/tgz/ 下载。
下载后，归档文件应解压并使用安装脚本安装。以下是最新稳定版本的示例：

``` bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "未知架构 $(uname -m)"; exit 1 ;;
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

对于生产环境，建议使用最新的 `stable` 版本。您可以在 GitHub 页面 https://github.com/ClickHouse/ClickHouse/tags 上找到其编号，后缀为 `-stable`。

### 从 Docker 镜像安装 {#from-docker-image}

要在 Docker 中运行 ClickHouse，请遵循 [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) 上的指南。这些镜像在内部使用官方的 `deb` 包。

## 非生产部署 (高级) {#non-production-deployments-advanced}

### 从源代码编译 {#from-sources}

要手动编译 ClickHouse，请遵循 [Linux](/development/build.md) 或 [macOS](/development/build-osx.md) 的说明。

您可以编译软件包并安装它们，或在不安装软件包的情况下使用程序。

```xml
客户端: <build_directory>/programs/clickhouse-client
服务器: <build_directory>/programs/clickhouse-server
```

您需要手动创建数据和元数据文件夹，并将其 `chown` 为所需用户。它们的路径可以在服务器配置中更改 (src/programs/server/config.xml)，默认值为：

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

在 Gentoo 上，您只需使用 `emerge clickhouse` 从源代码安装 ClickHouse。

### 安装 CI 生成的二进制文件 {#install-a-ci-generated-binary}

ClickHouse 的持续集成 (CI) 基础设施为 [ClickHouse
仓库](https://github.com/clickhouse/clickhouse/) 中的每次提交生成专用构建，例如 [sanitized](https://github.com/google/sanitizers) 构建、未优化 (Debug) 构建、交叉编译构建等。虽然这些构建通常仅在开发期间有用，但在某些情况下也可能对用户有吸引力。

:::note
由于 ClickHouse 的 CI 随着时间的发展而演变，因此下载 CI 生成的构建的确切步骤可能会有所不同。
另外，CI 可能会删除太旧的构建工件，使其无法下载。
:::

例如，要下载 ClickHouse v23.4 的 aarch64 二进制文件，请按照以下步骤操作：

- 找到发布 v23.4 的 GitHub 拉取请求: [Release pull request for branch 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- 点击“提交”，然后点击与您喜欢安装的特定版本相似的提交，如“将自动生成的版本更新为 23.4.2.1 和贡献者”。
- 点击绿色检查 / 黄色圆点 / 红色叉号以打开 CI 检查列表。
- 在列表中点击“构建”旁边的“详细信息”，它将打开与 [此页面](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html) 类似的页面。
- 找到编译器 = "clang-*-aarch64" 的行 - 有多行。
- 下载这些构建的工件。

### 仅限 macOS：使用 Homebrew 安装 {#macos-only-install-with-homebrew}

要使用 [homebrew](https://brew.sh/) 在 macOS 上安装 ClickHouse，请查看 ClickHouse [社区的 homebrew 配方](https://formulae.brew.sh/cask/clickhouse)。

:::note
Mac 用户注意：如果您收到二进制文件开发者无法验证的错误，请参见 [这里](/knowledgebase/fix-developer-verification-error-in-macos)。
:::

## 启动 {#launch}

要将服务器作为守护进程启动，请运行：

``` bash
$ clickhouse start
```

还有其他方法可以运行 ClickHouse：

``` bash
$ sudo service clickhouse-server start
```

如果您没有 `service` 命令，请按如下方式运行：

``` bash
$ sudo /etc/init.d/clickhouse-server start
```

如果您有 `systemctl` 命令，请按如下方式运行：

``` bash
$ sudo systemctl start clickhouse-server.service
```

请查看 `/var/log/clickhouse-server/` 目录中的日志。

如果服务器未启动，请检查文件 `/etc/clickhouse-server/config.xml` 中的配置。

您也可以从控制台手动启动服务器：

``` bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

在这种情况下，日志将打印到控制台，这在开发期间非常方便。
如果配置文件位于当前目录中，则无需指定 `--config-file` 参数。默认情况下，它使用 `./config.xml`。

ClickHouse 支持访问限制设置。这些设置位于 `users.xml` 文件中（与 `config.xml` 同一目录）。默认情况下，`default` 用户从任何地方允许访问，无需密码。请参阅 `user/default/networks`。
有关更多信息，请参见 ["配置文件"](/operations/configuration-files.md) 一节。

启动服务器后，您可以使用命令行客户端连接到它：

``` bash
$ clickhouse-client
```

默认情况下，它以用户 `default` 的身份连接到 `localhost:9000`，无需密码。它还可以使用 `--host` 参数连接到远程服务器。

终端必须使用 UTF-8 编码。
有关更多信息，请参见 ["命令行客户端"](/interfaces/cli.md) 一节。

示例：

```bash
$ ./clickhouse-client
ClickHouse client version 0.0.18749.
Connecting to localhost:9000.
Connected to ClickHouse server version 0.0.18749.

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 rows in set. Elapsed: 0.003 sec.

:)
```

**恭喜，系统运行正常！**

要继续实验，您可以下载其中一个测试数据集或经过 [教程](/tutorial.md) 指导。

## 针对自管理 ClickHouse 的建议 {#recommendations-for-self-managed-clickhouse}

ClickHouse 可以在任何 Linux、FreeBSD 或 macOS 上运行，支持 x86-64、ARM 或 PowerPC64LE CPU 架构。

ClickHouse 利用所有可用的硬件资源处理数据。

ClickHouse 通常在大量核心的低频率下比在少量内核的高频率下更高效。

我们建议至少使用 4GB 的 RAM 以执行非简单查询。ClickHouse 服务器可以在更少的 RAM 下运行，但是查询将经常中止。

所需的 RAM 量通常取决于：

- 查询的复杂性。
- 在查询中处理的数据量。

要计算所需的 RAM 量，您可以估算 [GROUP BY](/sql-reference/statements/select/group-by)、[DISTINCT](/sql-reference/statements/select/distinct)、[JOIN](/sql-reference/statements/select/join) 及其他操作中临时数据的大小。

为了减少内存消耗，ClickHouse 可以将临时数据交换到外部存储。有关详细信息，请参见 [外部内存中的 GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory)。

我们建议在生产环境中禁用操作系统的交换文件。

ClickHouse 二进制文件安装需要至少 2.5 GB 的磁盘空间。

所需的数据存储量可以单独计算，基于：

- 数据量的估算。

    您可以抽取一部分数据并从中获取行的平均大小。然后将该值乘以您计划存储的行数。

- 数据压缩系数。

    要估计数据压缩系数，将一部分数据加载到 ClickHouse 中，并比较实际数据的大小与存储表的大小。例如，点击流数据通常会压缩 6-10 倍。

要计算最终存储数据的体积，请将压缩系数应用于估算的数据量。如果您计划在多个副本中存储数据，则将估算的体积乘以副本的数量。

对于分布式 ClickHouse 部署（集群），我们建议至少使用 10G 级别的网络连接。

网络带宽对于处理大量中间数据的分布式查询至关重要。此外，网络速度会影响复制过程。

