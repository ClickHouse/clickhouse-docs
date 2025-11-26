# 使用 tgz 归档文件安装 ClickHouse

> 对于无法安装 `deb` 或 `rpm` 软件包的 Linux 发行版,建议使用官方预编译的 `tgz` 归档文件。

<VerticalStepper>


## 下载并安装最新稳定版本 {#install-latest-stable}

所需版本可以使用 `curl` 或 `wget` 从仓库 https://packages.clickhouse.com/tgz/ 下载。
随后需要将下载的压缩包解压缩，并使用安装脚本完成安装。

下面是安装最新稳定版本的示例。

:::note
对于生产环境，推荐使用最新的 `stable` 版本。
你可以在这个 [GitHub 页面](https://github.com/ClickHouse/ClickHouse/tags)
中查找到带有 `-stable` 后缀的发布版本号。
:::



## 获取最新的 ClickHouse 版本

从 GitHub 获取最新的 ClickHouse 版本，并将其保存到 `LATEST_VERSION` 变量中。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```


## 检测系统架构

检测系统架构，并相应设置 ARCH 变量：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64 位处理器
  aarch64) ARCH=arm64 ;;        # ARM 64 位处理器
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # 架构不受支持时退出
esac
```


## 为每个 ClickHouse 组件下载 tar 包

为每个 ClickHouse 组件下载 tar 包。该循环会优先尝试特定架构的
软件包，如果不存在则退回到通用软件包。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```


## 解压并安装软件包 {#extract-and-install}

运行下面的命令以解压并安装下列软件包：
- `clickhouse-common-static`



```bash
# 解压并安装 clickhouse-common-static 软件包
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-common-static-dbg`


```bash
# 提取并安装调试符号包
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-server`


```bash
# 解压并安装服务器软件包及配置
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # 启动服务器
```

* `clickhouse-client`


```bash
# 提取并安装客户端软件包
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
