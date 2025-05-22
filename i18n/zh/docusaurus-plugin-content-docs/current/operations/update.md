---
'description': 'Update 相关的 文档'
'sidebar_title': 'Self-managed Upgrade'
'slug': '/operations/update'
'title': '自管理 升级'
---

## ClickHouse 升级概述 {#clickhouse-upgrade-overview}

本文件包含：
- 一般指南
- 推荐计划
- 关于在您的系统上升级二进制文件的具体细节

## 一般指南 {#general-guidelines}

这些说明应该能帮助您规划，并理解我们在文件后面所做建议的原因。

### 单独升级 ClickHouse 服务器与 ClickHouse Keeper 或 ZooKeeper {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
除非需要为 ClickHouse Keeper 或 Apache ZooKeeper 提供安全修复，否则在升级 ClickHouse 服务器时不必升级 Keeper。 升级过程中需要 Keeper 的稳定性，因此在考虑升级 Keeper 之前，请先完成 ClickHouse 服务器的升级。

### 应尽快采用次要版本升级 {#minor-version-upgrades-should-be-adopted-often}
强烈建议始终在最新的次要版本发布后立即进行升级。 次要版本不会有破坏性更改，但会有重要的错误修复（并可能包含安全修复）。

### 在运行目标版本的单独 ClickHouse 服务器上测试实验性功能 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

实验性功能的兼容性随时可能以任何方式被破坏。 如果您正在使用实验性功能，请检查变更日志，并考虑在安装目标版本的单独 ClickHouse 服务器上设置并测试您对实验性功能的使用。

### 降级 {#downgrades}
如果您升级后意识到新版本与您依赖的某些功能不兼容，并且如果您尚未开始使用任何新功能，您可以降级到一个近期（不到一年的）版本。 一旦使用了新功能，降级将无法生效。

### 集群中的多个 ClickHouse 服务器版本 {#multiple-clickhouse-server-versions-in-a-cluster}

我们努力保持一年的兼容性窗口（包括 2 个 LTS 版本）。 这意味着如果两个版本之间的差异不到一年（或之间有不到两个 LTS 版本），任何两个版本都应能在集群中协同工作。 然而，建议尽快将集群中的所有成员升级到相同的版本，因为可能会出现一些小问题（例如分布式查询的缓慢、在 ReplicatedMergeTree 中某些后台操作中的可重试错误等）。

我们从不建议在同一集群中运行发行日期相差超过一年的不同版本。 虽然我们不期望您会遭遇数据丢失，但集群可能会变得不可用。 如果您有超过一年版本差异，您应该预期的问题包括：

- 集群可能无法正常工作
- 某些（甚至所有）查询可能会因为任意错误而失败
- 日志中可能会出现任意错误/警告
- 可能无法降级

### 增量升级 {#incremental-upgrades}

如果当前版本和目标版本之间的差异超过一年，则建议：
- 进行停机升级（停止所有服务器，升级所有服务器，启动所有服务器）。
- 或者通过一个中间版本进行升级（该版本比当前版本新但少于一年）。

## 推荐计划 {#recommended-plan}

以下是零停机 ClickHouse 升级的推荐步骤：

1. 确保您的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中，而是放在 `/etc/clickhouse-server/config.d/` 中，因为 `/etc/clickhouse-server/config.xml` 在升级期间可能会被覆盖。
2. 通读 [变更日志](/whats-new/changelog/index.md)，查看破坏性更改（从目标版本回到您当前的版本）。
3. 在升级前进行任何可以在破坏性更改中识别的更新，并列出在升级后需要进行的更改。
4. 确定一个或多个副本，用于在每个分片的其余副本升级期间保持同步。
5. 在要升级的副本上，逐个进行操作：
   - 关闭 ClickHouse 服务器
   - 将服务器升级到目标版本
   - 启动 ClickHouse 服务器
   - 等待 Keeper 消息指示系统稳定
   - 继续下一个副本
6. 检查 Keeper 日志和 ClickHouse 日志中的错误
7. 将步骤 4 中识别的副本升级到新版本
8. 参考步骤 1 到 3 中所做的更改列表，并进行升级后需要进行的更改。

:::note
在运行在复制环境中的多个版本的 ClickHouse 时，会预期出现此错误消息。 当所有副本升级到相同版本时，您将停止看到这些消息。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::


## ClickHouse 服务器二进制文件升级过程 {#clickhouse-server-binary-upgrade-process}

如果 ClickHouse 是通过 `deb` 包安装的，请在服务器上执行以下命令：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果您使用其他方式安装 ClickHouse，请使用适当的更新方法。

:::note
只要没有任何时刻所有一个分片的副本都离线，您可以同时更新多个服务器。
:::

将旧版本的 ClickHouse 升级到特定版本：

例如：

`xx.yy.a.b` 是当前的稳定版本。 最新的稳定版本可以在 [这里](https://github.com/ClickHouse/ClickHouse/releases) 找到。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
