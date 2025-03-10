---
title: '故障排除'
---

## 安装 {#installation}

### 使用 apt-key 无法从 keyserver.ubuntu.com 导入 GPG 密钥 {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key` 功能已被[高级包工具 (APT) 弃用](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。用户应改用 `gpg` 命令。请参阅[安装指南](../getting-started/install.md)文章。

### 使用 gpg 无法从 keyserver.ubuntu.com 导入 GPG 密钥 {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. 查看你的 `gpg` 是否已安装：

```shell
sudo apt-get install gnupg
```

### 使用 apt-get 无法从 ClickHouse 仓库获取 deb 包 {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. 检查防火墙设置。
1. 如果由于某种原因无法访问仓库，请按照[安装指南](../getting-started/install.md)中的说明下载软件包，并使用 `sudo dpkg -i <packages>` 命令手动安装它们。你还需要 `tzdata` 包。

### 使用 apt-get 无法从 ClickHouse 仓库更新 deb 包 {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

当 GPG 密钥发生更改时，可能会出现此问题。

请使用[设置](../getting-started/install.md#setup-the-debian-repository)页面中的手册更新仓库配置。

### 使用 `apt-get update` 时收到不同的警告 {#you-get-different-warnings-with-apt-get-update}

完整的警告信息如下所示：

```shell
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```shell
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```shell
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

要解决上述问题，请使用以下脚本：

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 因签名错误无法使用 Yum 获取软件包 {#cant-get-packages-with-yum-because-of-wrong-signature}

可能的问题：缓存错误，也许是在 2022-09 更新 GPG 密钥后损坏。

解决方案是清除 Yum 的缓存和 lib 目录：

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

之后请参阅[安装指南](../getting-started/install.md#from-rpm-packages)

## 连接到服务器 {#connecting-to-the-server}

可能的问题：

- 服务器未运行。
- 配置参数意外或错误。

### 服务器未运行 {#server-is-not-running}

#### 检查服务器是否运行 {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

如果服务器未运行，请使用以下命令启动它：

```shell
sudo service clickhouse-server start
```

#### 检查日志 {#check-the-logs}

`clickhouse-server` 的主要日志默认在 `/var/log/clickhouse-server/clickhouse-server.log` 中。

如果服务器成功启动，你应该看到以下字符串：

- `<Information> Application: starting up.` — 服务器已启动。
- `<Information> Application: Ready for connections.` — 服务器正在运行并准备接受连接。

如果 `clickhouse-server` 因配置错误而启动失败，你应该看到带有错误描述的 `<Error>` 字符串。例如：

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

如果你在文件末尾没有看到错误，请从字符串开始浏览整个文件：

```plaintext
<Information> Application: starting up.
```

如果你尝试在服务器上启动第二个 `clickhouse-server` 实例，会看到以下日志：

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Status file ./status already exists - unclean restart. Contents:
PID: 8510
Started at: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Cannot lock file ./status. Another server instance in same directory is already running.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: shutting down
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Uninitializing subsystem: Logging Subsystem
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

#### 查看 system.d 日志 {#see-systemd-logs}

如果你在 `clickhouse-server` 日志中找不到任何有用的信息，或者没有日志，可以使用以下命令查看 `system.d` 日志：

```shell
sudo journalctl -u clickhouse-server
```

#### 在交互模式下启动 clickhouse-server {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

此命令将以交互应用程序的形式启动服务器，并使用自动启动脚本的标准参数。在此模式下，`clickhouse-server` 会在控制台中打印所有事件消息。

### 配置参数 {#configuration-parameters}

检查：

1. Docker 设置：

    - 如果你在 IPv6 网络中运行 ClickHouse，请确保设置 `network=host`。

1. 端点设置。
    - 检查 [listen_host](/operations/server-configuration-parameters/settings#listen_host) 和 [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) 设置。
    - ClickHouse 服务器默认仅接受本地连接。

1. HTTP 协议设置：

    - 检查 HTTP API 的协议设置。

1. 安全连接设置。

    - 检查：
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 设置。
        - [SSL 证书](/operations/server-configuration-parameters/settings#openssl) 的设置。
    - 使用合适的参数进行连接。例如，使用 `clickhouse_client` 的 `port_secure` 参数。

1. 用户设置：

    - 你可能使用了错误的用户名或密码。

## 查询处理 {#query-processing}

如果 ClickHouse 无法处理查询，它会将错误描述发送给客户端。在 `clickhouse-client` 中，你将在控制台上看到错误描述。如果你使用的是 HTTP 接口，ClickHouse 会将错误描述发送到响应体中。例如：

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

如果你使用 `stack-trace` 参数启动 `clickhouse-client`，ClickHouse 将返回服务器的堆栈跟踪及错误描述。

你可能会看到有关断开连接的消息。在这种情况下，你可以重复查询。如果在每次执行查询时连接都断开，请检查服务器日志以查找错误。

## 查询处理的效率 {#efficiency-of-query-processing}

如果你发现 ClickHouse 工作过慢，你需要分析服务器资源和网络的负载以优化你的查询。

你可以使用 clickhouse-benchmark 工具来分析查询性能。它显示每秒处理的查询数量、每秒处理的行数以及查询处理时间的百分位数。
