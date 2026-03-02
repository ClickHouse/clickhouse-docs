# 使用 tgz 压缩包安装 ClickHouse \{#install-clickhouse-using-tgz-archives\}

> 建议在无法安装 `deb` 或 `rpm` 软件包的所有 Linux 发行版上使用官方预编译的 `tgz` 压缩包进行安装。

<VerticalStepper>

## 下载并安装最新稳定版本 \{#install-latest-stable\}

可以使用 `curl` 或 `wget` 从仓库 https://packages.clickhouse.com/tgz/ 下载所需版本。
然后解压下载的压缩包，并使用安装脚本进行安装。

下面是安装最新稳定版本的示例。

:::note
在生产环境中，建议使用最新的 `stable` 版本。
您可以在这个 [GitHub 页面](https://github.com/ClickHouse/ClickHouse/tags) 上找到带有 `-stable` 后缀的发行版本号。
:::

## 获取最新的 ClickHouse 版本 \{#get-latest-version\}

从 GitHub 获取最新的 ClickHouse 版本，并将其保存到 `LATEST_VERSION` 变量中。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## 检测系统架构 \{#detect-system-architecture\}

检测系统架构并相应地设置 ARCH 变量：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # 对于 Intel/AMD 64 位处理器
  aarch64) ARCH=arm64 ;;        # 对于 ARM 64 位处理器
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # 如果架构不受支持则退出
esac
```

## 为每个 ClickHouse 组件下载压缩包 \{#download-tarballs\}

为每个 ClickHouse 组件下载压缩包。该循环会优先尝试与架构相关的
软件包，如果失败则回退到通用包。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## 解压并安装软件包 \{#extract-and-install\}

运行以下命令来解压并安装这些软件包：
- `clickhouse-common-static`

```bash
# 解压并安装 clickhouse-common-static 软件包
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash
# 解压并安装调试符号软件包
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash
# 解压并安装包含配置的服务端软件包
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # 启动服务端
```

- `clickhouse-client`

```bash
# 解压并安装客户端软件包
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>