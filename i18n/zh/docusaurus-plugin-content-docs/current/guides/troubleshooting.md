---
title: '故障排查'
description: '安装故障排查指南'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['故障排查', '调试', '问题解决', '错误', '诊断']
---



## 安装

### 无法使用 apt-key 从 keyserver.ubuntu.com 导入 GPG 密钥

[APT 高级包管理工具中的 `apt-key` 功能已被弃用](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。用户应改为使用 `gpg` 命令。请参阅[安装指南](../getting-started/install/install.mdx)一文。

### 无法使用 gpg 从 keyserver.ubuntu.com 导入 GPG 密钥

1. 检查是否已安装 `gpg`：

```shell
sudo apt-get install gnupg
```

### 无法使用 apt-get 从 ClickHouse 仓库获取 deb 包

1. 检查防火墙设置。
2. 如果由于任何原因无法访问仓库，请按照 [安装指南](../getting-started/install/install.mdx) 文章中的说明下载软件包，并使用 `sudo dpkg -i <packages>` 命令手动安装。还需要安装 `tzdata` 软件包。

### 无法使用 apt-get 从 ClickHouse 仓库更新 deb 包

当 GPG 密钥发生更改时，可能会出现此问题。

请使用 [setup](/install/debian_ubuntu) 页面中的说明更新仓库配置。

### 运行 `apt-get update` 时收到不同的警告

完整的警告消息可能如下所示之一：

```shell
N: 跳过获取已配置的文件 'main/binary-i386/Packages',因为软件源 'https://packages.clickhouse.com/deb stable InRelease' 不支持 'i386' 架构
```

```shell
E: 无法获取 https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  文件大小不符合预期 (30451 != 28154)。镜像同步正在进行中？
```

```shell
E: 软件源 'https://packages.clickhouse.com/deb stable InRelease' 的 'Origin' 值已从 'Artifactory' 变更为 'ClickHouse'
E: 软件源 'https://packages.clickhouse.com/deb stable InRelease' 的 'Label' 值已从 'Artifactory' 变更为 'ClickHouse'
N: 软件源 'https://packages.clickhouse.com/deb stable InRelease' 的 'Suite' 值已从 'stable' 变更为 ''
N: 必须明确接受此变更后才能应用该软件源的更新。详情请参阅 apt-secure(8) 手册页。
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

### 由于签名错误无法通过 Yum 获取软件包

可能的问题：缓存不正确，在 2022 年 9 月更新 GPG 密钥之后可能已损坏。

解决方法是清理 Yum 的缓存和 lib 目录：

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

然后请按照[安装指南](/install/redhat)进行操作


## 连接到服务器

可能出现的问题：

* 服务器未运行。
* 配置参数异常或错误。

### 服务器未运行

#### 检查服务器是否正在运行

```shell
sudo service clickhouse-server status
```

如果服务器尚未运行，请使用以下命令启动：

```shell
sudo service clickhouse-server start
```

#### 检查日志

`clickhouse-server` 的主日志文件默认位于 `/var/log/clickhouse-server/clickhouse-server.log`。

如果服务器启动成功，应当能看到类似如下的日志行：

* `<Information> Application: starting up.` — 服务器已启动。
* `<Information> Application: Ready for connections.` — 服务器正在运行并已准备好接受连接。

如果 `clickhouse-server` 因配置错误导致启动失败，你应当会看到带有错误描述的 `<Error>` 日志行。例如：

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 重新加载外部字典 'event2id' 失败：Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

如果你在文件末尾没有看到错误，请从该字符串开始检查整个文件：

```plaintext
<Information> Application: 正在启动。
```

如果您在该服务器上尝试启动第二个 `clickhouse-server` 实例，会看到如下日志：

```plaintext
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

#### 查看 system.d 日志

如果在 `clickhouse-server` 日志中找不到有用的信息，或者根本没有日志，你可以使用以下命令查看 `system.d` 日志：

```shell
sudo journalctl -u clickhouse-server
```

#### 以交互式模式启动 clickhouse-server

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

该命令会使用自动启动脚本的标准参数，以交互式应用的方式启动服务器。在此模式下，`clickhouse-server` 会在控制台输出所有事件消息。

### 配置参数

请检查：

1. Docker 设置：

   * 如果在 IPv6 网络中通过 Docker 运行 ClickHouse，请确保已设置 `network=host`。

2. 端点设置：

   * 检查 [listen&#95;host](/operations/server-configuration-parameters/settings#listen_host) 和 [tcp&#95;port](/operations/server-configuration-parameters/settings#tcp_port) 设置。
   * 默认情况下，ClickHouse 服务器只接受来自 localhost 的连接。

3. HTTP 协议设置：

   * 检查 HTTP API 的协议相关设置。

4. 安全连接设置：

   * 检查：
     * [tcp&#95;port&#95;secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 设置。
     * [SSL 证书](/operations/server-configuration-parameters/settings#openssl) 相关设置。
   * 建立连接时请使用正确的参数。例如，在 `clickhouse_client` 中使用 `port_secure` 参数。

5. 用户设置：

   * 可能使用了错误的用户名或密码。


## 查询处理

如果 ClickHouse 无法处理查询，它会将错误描述返回给客户端。在 `clickhouse-client` 中，错误描述会显示在控制台中。如果使用 HTTP 接口，ClickHouse 会在响应正文中返回错误描述。例如：

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

如果您在启动 `clickhouse-client` 时使用 `stack-trace` 参数，ClickHouse 会随错误描述一起返回服务器的堆栈跟踪信息。

您可能会看到关于连接中断的消息。在这种情况下，您可以重新执行该查询。如果每次执行查询时连接都会中断，请检查服务器日志中是否存在错误。


## 查询处理效率 {#efficiency-of-query-processing}

如果发现 ClickHouse 运行速度过慢，需要对查询在服务器资源和网络上的负载进行性能分析。

可以使用 `clickhouse-benchmark` 基准测试工具对查询进行分析。它会显示每秒处理的查询数量、每秒处理的行数，以及查询处理时间的各个百分位数。
