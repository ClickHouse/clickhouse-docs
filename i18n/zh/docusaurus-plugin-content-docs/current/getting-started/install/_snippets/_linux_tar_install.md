
# 使用 tgz 压缩包安装 ClickHouse

> 推荐使用官方预编译的 `tgz` 压缩包，适用于所有 Linux 发行版，在无法安装 `deb` 或 `rpm` 软件包的情况下。

<VerticalStepper>

## 下载并安装最新稳定版本 {#install-latest-stable}

所需版本可以通过 `curl` 或 `wget` 从仓库 https://packages.clickhouse.com/tgz/ 下载。
下载后的压缩包应使用安装脚本进行解压和安装。

以下是如何安装最新稳定版本的示例。

:::note
对于生产环境，建议使用最新的 `stable` 版本。
您可以在这 [GitHub 页面](https://github.com/ClickHouse/ClickHouse/tags) 上找到版本号，后缀为 `-stable`。
:::

## 获取最新的 ClickHouse 版本 {#get-latest-version}

从 GitHub 获取最新的 ClickHouse 版本并存储在 `LATEST_VERSION` 变量中。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## 检测您的系统架构 {#detect-system-architecture}

检测系统架构并相应地设置 ARCH 变量：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## 下载每个 ClickHouse 组件的 tarball {#download-tarballs}

下载每个 ClickHouse 组件的 tarball。循环首先尝试特定架构的软件包，然后回退到通用软件包。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## 解压并安装软件包 {#extract-and-install}

运行以下命令以解压和安装以下软件包：
- `clickhouse-common-static`

```bash

# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash

# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash

# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

- `clickhouse-client`

```bash

# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
