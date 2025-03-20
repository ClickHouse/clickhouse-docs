
[//]: # (此文件包含在 FAQ > 故障排查 中)

- [安装](#troubleshooting-installation-errors)
- [连接到服务器](#troubleshooting-accepts-no-connections)
- [查询处理](#troubleshooting-does-not-process-queries)
- [查询处理的效率](#troubleshooting-too-slow)

## 安装 {#troubleshooting-installation-errors}

### 你无法通过 Apt-get 从 ClickHouse 仓库获取 Deb 包 {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- 检查防火墙设置。
- 如果由于某种原因无法访问仓库，请根据 [安装指南](../getting-started/install.md) 文章中的说明下载软件包并使用 `sudo dpkg -i <packages>` 命令手动安装。你还需要 `tzdata` 软件包。

### 你无法通过 Apt-get 更新 ClickHouse 仓库中的 Deb 包 {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- 如果 GPG 密钥发生更改，可能会出现此问题。

请使用 [设置](../getting-started/install.md#setup-the-debian-repository) 页面中的手册更新仓库配置。

### 你在使用 `apt-get update` 时收到不同的警告 {#you-get-different-warnings-with-apt-get-update}

- 完整的警告消息如下之一：

```bash
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```bash
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```text
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

要解决上述问题，请使用以下脚本：

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 你无法通过 Yum 获取软件包，因为签名错误 {#you-cant-get-packages-with-yum-because-of-wrong-signature}

可能的问题：缓存有误，可能在 2022-09 更新 GPG 密钥后损坏。

解决方案是清理 yum 的缓存和 lib 目录：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

之后，请按照 [安装指南](../getting-started/install.md#from-rpm-packages) 进行操作。

### 你无法运行 Docker 容器 {#you-cant-run-docker-container}

你运行简单的 `docker run clickhouse/clickhouse-server` 时崩溃，堆栈跟踪类似于以下内容：

```bash
$ docker run -it clickhouse/clickhouse-server
........
2024.11.06 21:04:48.912036 [ 1 ] {} <Information> SentryWriter: Sending crash reports is disabled
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (when copying this message, always include the lines below):

0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char**) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char**) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. _start @ 0x00000000062e802e
 (version 24.10.1.2812 (official build))
```

原因是 Docker 守护程序版本低于 `20.10.10`。修复方法是升级它，或运行 `docker run [--privileged | --security-opt seccomp=unconfined]`。后者具有安全隐患。

## 连接到服务器 {#troubleshooting-accepts-no-connections}

可能的问题：

- 服务器未运行。
- 配置参数意外或错误。

### 服务器未运行 {#server-is-not-running}

**检查服务器是否在运行**

命令：

``` bash
$ sudo service clickhouse-server status
```

如果服务器未运行，请使用以下命令启动它：

``` bash
$ sudo service clickhouse-server start
```

**检查日志**

默认情况下，`clickhouse-server` 的主日志位于 `/var/log/clickhouse-server/clickhouse-server.log`。

如果服务器启动成功，您应该看到以下字符串：

- `<Information> Application: starting up.` — 服务器已启动。
- `<Information> Application: Ready for connections.` — 服务器正在运行并准备接受连接。

如果 `clickhouse-server` 因配置错误而启动失败，您应该会看到带有错误描述的 `<Error>` 字符串。例如：

``` text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

如果在文件末尾没有看到错误，请从以下字符串开始查找整个文件：

``` text
<Information> Application: starting up.
```

如果您尝试在服务器上启动第二个实例的 `clickhouse-server`，您将看到以下日志：

``` text
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

**查看 system.d 日志**

如果在 `clickhouse-server` 日志中找不到有用信息或没有日志，可以使用以下命令查看 `system.d` 日志：

``` bash
$ sudo journalctl -u clickhouse-server
```

**以交互模式启动 clickhouse-server**

``` bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

此命令以交互应用程序的标准参数启动服务器。在此模式下，`clickhouse-server` 在控制台中打印所有事件消息。

### 配置参数 {#configuration-parameters}

检查：

- Docker 设置。

    如果您在 IPv6 网络中以 Docker 运行 ClickHouse，请确保设置 `network=host`。

- 端点设置。

    检查 [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) 和 [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port) 设置。

    ClickHouse 服务器默认只接受 localhost 连接。

- HTTP 协议设置。

    检查 HTTP API 的协议设置。

- 安全连接设置。

    检查：

    - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 设置。
    - [SSL 证书](../operations/server-configuration-parameters/settings.md#openssl) 的设置。

    连接时使用适当的参数。例如，使用 `port_secure` 参数与 `clickhouse_client`。

- 用户设置。

    你可能使用了错误的用户名或密码。

## 查询处理 {#troubleshooting-does-not-process-queries}

如果 ClickHouse 无法处理查询，它会向客户端发送错误描述。在 `clickhouse-client` 中，你将在控制台中获得错误描述。如果你使用 HTTP 接口，ClickHouse 会在响应体中发送错误描述。例如：

``` bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

如果你使用 `stack-trace` 参数启动 `clickhouse-client`，ClickHouse 将返回服务器堆栈跟踪以及错误描述。

你可能会看到关于连接中断的消息。在这种情况下，你可以重试查询。如果每次执行查询时连接都中断，请检查服务器日志以获取错误。

## 查询处理的效率 {#troubleshooting-too-slow}

如果你发现 ClickHouse 的工作速度太慢，你需要分析服务器资源和网络的负载，以优化你的查询。

你可以使用 clickhouse-benchmark 工具来分析查询。它显示每秒处理的查询数量、每秒处理的行数，以及查询处理时间的百分位。
```
