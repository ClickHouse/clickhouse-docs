
[//]: # (This file is included in FAQ > Troubleshooting)

- [安装](#troubleshooting-installation-errors)
- [连接服务器](#troubleshooting-accepts-no-connections)
- [查询处理](#troubleshooting-does-not-process-queries)
- [查询效率](#troubleshooting-too-slow)

## 安装 \\{#troubleshooting-installation-errors\\}

### 无法通过 apt-get 从 ClickHouse 仓库获取 deb 包 \\{#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get\\}

* 检查防火墙设置。
* 如果由于任何原因无法访问该仓库，请按照[安装指南](../getting-started/install.md)中的说明下载软件包，并使用 `sudo dpkg -i <packages>` 命令手动安装。您还需要安装 `tzdata` 软件包。

### 无法通过 apt-get 从 ClickHouse 仓库更新 deb 包 \\{#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get\\}

* 当 GPG 密钥更改时，可能会出现此问题。

请按照 [setup](../getting-started/install.md#setup-the-debian-repository) 页面中的说明更新仓库配置。

### 运行 `apt-get update` 时收到不同的警告 \\{#you-get-different-warnings-with-apt-get-update\\}

* 完整的警告信息类似于以下几种情况之一：

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

### 由于签名不正确，你无法通过 yum 获取软件包 \\{#you-cant-get-packages-with-yum-because-of-wrong-signature\\}

可能的问题：缓存不正确；在 2022 年 9 月更新 GPG 密钥后，缓存可能已损坏。

解决办法是清理 yum 的缓存和 lib 目录：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

之后请按照[安装指南](../getting-started/install.md#from-rpm-packages)进行操作。

### 无法运行 Docker 容器 \\{#you-cant-run-docker-container\\}

当你运行一个简单的命令 `docker run clickhouse/clickhouse-server` 时，它会崩溃并输出类似如下的堆栈跟踪：

```bash
$ docker run -it clickhouse/clickhouse-server
........
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

原因是 Docker 守护进程版本低于 `20.10.10`。解决方法是升级 Docker 守护进程,或运行 `docker run [--privileged | --security-opt seccomp=unconfined]`。后者具有安全风险。

## 连接到服务器 \\{#troubleshooting-accepts-no-connections\\}

可能出现的问题：

* 服务器未运行。
* 配置参数异常或错误。

### 服务器未运行 \\{#server-is-not-running\\}

**检查服务器是否正在运行**

命令：

```bash
$ sudo service clickhouse-server status
```

如果服务器未运行，请使用以下命令启动：

```bash
$ sudo service clickhouse-server start
```

**检查日志**

`clickhouse-server` 的主日志默认位于 `/var/log/clickhouse-server/clickhouse-server.log`。

如果服务器成功启动，你应该看到如下日志行：

* `<Information> Application: starting up.` — 服务器已启动。
* `<Information> Application: Ready for connections.` — 服务器正在运行并已准备好接受连接。

如果 `clickhouse-server` 因配置错误而启动失败，你应该会看到带有错误描述的 `<Error>` 日志行。例如：

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 重新加载外部字典 'event2id' 失败:Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

如果在文件末尾没有看到错误，请从以下字符串开始检查整个文件：

```text
<Information> 应用程序：正在启动。
```

如果你尝试在同一台服务器上启动第二个 `clickhouse-server` 实例，将会看到如下日志：

```text
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : 正在启动 ClickHouse 19.1.0,修订版 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: 正在启动
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: 状态文件 ./status 已存在 - 非正常重启。内容:
PID: 8510
启动于: 2019-01-11 15:24:23
修订版: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: 无法锁定文件 ./status。同一目录中已有另一个服务器实例正在运行。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: 正在关闭
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: 正在取消初始化子系统: 日志子系统
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: 停止 SignalListener 线程
```

**查看 system.d 日志**

如果在 `clickhouse-server` 日志中找不到任何有用的信息，或者根本没有日志，可以使用以下命令查看 `system.d` 日志：

```bash
$ sudo journalctl -u clickhouse-server
```

**以交互式模式启动 clickhouse-server**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

此命令会使用自动启动脚本的标准参数，以交互式应用程序的方式启动服务器。在此模式下，`clickhouse-server` 会在控制台输出所有事件消息。

### 配置参数 \\{#configuration-parameters\\}

请检查：

* Docker 设置

  如果你在 IPv6 网络中通过 Docker 运行 ClickHouse，确保设置了 `network=host`。

* 端点（Endpoint）设置

  检查 [listen&#95;host](../operations/server-configuration-parameters/settings.md#listen_host) 和 [tcp&#95;port](../operations/server-configuration-parameters/settings.md#tcp_port) 设置。

  默认情况下，ClickHouse 服务器只接受来自 localhost 的连接。

* HTTP 协议设置

  检查 HTTP API 的协议相关设置。

* 安全连接设置

  请检查：

  * [tcp&#95;port&#95;secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 设置。
  * [SSL 证书](../operations/server-configuration-parameters/settings.md#openssl) 相关设置。

    连接时请使用正确的参数。例如，在使用 `clickhouse_client` 时应使用 `port_secure` 参数。

* 用户设置

  你可能使用了错误的用户名或密码。

## 查询处理 \\{#troubleshooting-does-not-process-queries\\}

如果 ClickHouse 无法处理查询，它会将错误描述发送给客户端。在 `clickhouse-client` 中，错误描述会显示在控制台中。如果使用 HTTP 接口，ClickHouse 会在响应体中返回错误描述。例如：

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: 未知标识符:a。注意您的查询中没有表(缺少 FROM 子句),上下文:required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

如果使用 `stack-trace` 参数启动 `clickhouse-client`，ClickHouse 会连同错误描述一起返回服务器端的堆栈跟踪信息。

你可能会看到一条有关连接断开的消息。在这种情况下，可以重试该查询。如果每次执行该查询时连接都会断开，请检查服务器端日志以查找错误。

## 查询处理效率 \\{#troubleshooting-too-slow\\}

如果发现 ClickHouse 工作得过慢，应对相关查询在服务器资源和网络上的负载进行分析。

你可以使用 `clickhouse-benchmark` 工具对查询进行分析。它会显示每秒处理的查询数量、每秒处理的行数，以及查询处理时间的百分位数。
