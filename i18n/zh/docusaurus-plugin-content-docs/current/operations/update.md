---
'description': '升级文档'
'sidebar_title': 'Self-managed Upgrade'
'slug': '/operations/update'
'title': '自管理升级'
---



## ClickHouse 升级概述 {#clickhouse-upgrade-overview}

本文件包含：
- 一般指南
- 推荐计划
- 具体的升级程序和您系统上的二进制文件

## 一般指南 {#general-guidelines}

这些说明应帮助您进行计划，并理解我们在文件后面进行推荐的原因。

### 点击单独升级 ClickHouse 服务器，而非 ClickHouse Keeper 或 ZooKeeper {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
除非需要对 ClickHouse Keeper 或 Apache ZooKeeper 进行安全修复，否则在升级 ClickHouse 服务器时，不必升级 Keeper。在升级过程中，需要保持 Keeper 的稳定性，因此请在考虑升级 Keeper 之前完成 ClickHouse 服务器的升级。

### 应频繁采用小版本升级 {#minor-version-upgrades-should-be-adopted-often}
强烈推荐在新小版本发布后尽快升级到最新的小版本。小版本发布没有破坏性变化，但包含重要的错误修复（并可能包含安全修复）。

### 在运行目标版本的单独 ClickHouse 服务器上测试实验性功能 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

实验性功能的兼容性可能会在任何时间以任何方式被破坏。如果您正在使用实验性功能，请检查更改日志，并考虑设置一个安装了目标版本的单独 ClickHouse 服务器，在那里测试您对实验性功能的使用。

### 降级 {#downgrades}
如果您升级后意识到新版本与您依赖的某些功能不兼容，如果您没有开始使用新功能，您可能能够降级到最近的（不到一年的）版本。一旦使用了新功能，降级将不再有效。

### 集群中多个 ClickHouse 服务器版本 {#multiple-clickhouse-server-versions-in-a-cluster}

我们努力维护一年的兼容性窗口（其中包括 2 个 LTS 版本）。这意味着任何两个版本应该能够在集群中一起工作，如果它们之间的差异少于一年（或者如果它们之间的 LTS 版本少于两个）。然而，建议尽快将集群中的所有成员升级到相同版本，因为可能会出现一些小问题（如分布式查询的减速、在 ReplicatedMergeTree 中某些后台操作的可重试错误等）。

我们从不推荐在同一集群中运行版本发布日期超过一年的不同版本。虽然我们不期望您会丢失数据，但集群可能变得不可用。如果版本之间的差异超过一年，您应该预期出现以下问题：

- 集群可能无法正常工作
- 某些（甚至所有）查询可能因任意错误而失败
- 日志中可能出现任意错误/警告
- 可能无法降级

### 增量升级 {#incremental-upgrades}

如果当前版本与目标版本之间的差异超过一年，则建议：
- 停机维护升级（停止所有服务器，升级所有服务器，运行所有服务器）。
- 或者通过中间版本升级（一个比当前版本更近但少于一年的版本）。

## 推荐计划 {#recommended-plan}

以下是进行零停机 ClickHouse 升级的推荐步骤：

1. 确保您的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中，而是在 `/etc/clickhouse-server/config.d/` 中，因为在升级期间 `/etc/clickhouse-server/config.xml` 可能会被覆盖。
2. 阅读 [changelogs](/whats-new/changelog/index.md) 以了解破坏性变化（从目标版本回溯到您当前的版本）。
3. 进行可以在升级之前进行的破坏性变化中的任何更新，以及升级后需要进行的更改列表。
4. 为每个分片识别一个或多个副本，以在其他副本升级时保持运行。
5. 在将要升级的副本上，一次一个地：
   - 关闭 ClickHouse 服务器
   - 将服务器升级到目标版本
   - 启动 ClickHouse 服务器
   - 等待 Keeper 消息指示系统稳定
   - 继续下一个副本
6. 检查 Keeper 日志和 ClickHouse 日志中的错误
7. 将在第 4 步中识别的副本升级到新版本
8. 参考第 1 步到第 3 步中做出的更改列表，进行升级后需要做的更改。

:::note
当在复制环境中运行多个版本的 ClickHouse 时，预期会出现此错误消息。当所有副本都升级到相同版本时，您将不再看到这些消息。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse 服务器二进制升级过程 {#clickhouse-server-binary-upgrade-process}

如果 ClickHouse 是从 `deb` 包安装的，请在服务器上执行以下命令：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果您使用其他方法安装 ClickHouse，请使用适当的更新方法。

:::note
只要没有任何时刻一个分片的所有副本都离线，您可以同时更新多个服务器。
:::

将较旧版本的 ClickHouse 升级到特定版本：

例如：

`xx.yy.a.b` 是当前稳定版本。可以在 [这里](https://github.com/ClickHouse/ClickHouse/releases) 找到最新的稳定版本。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
