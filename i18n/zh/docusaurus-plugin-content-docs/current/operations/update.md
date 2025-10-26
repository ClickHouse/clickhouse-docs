---
'description': 'Update 的文档'
'sidebar_title': 'Self-managed Upgrade'
'slug': '/operations/update'
'title': '自管理 升级'
'doc_type': 'guide'
---

## ClickHouse 升级概述 {#clickhouse-upgrade-overview}

本文档包含：
- 一般指南
- 推荐计划
- 在您的系统上升级二进制文件的具体细节

## 一般指南 {#general-guidelines}

以下说明应帮助您进行规划，并了解我们稍后在文档中所做推荐的原因。

### 在升级 ClickHouse 服务器时，与 ClickHouse Keeper 或 ZooKeeper 分开进行 {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
除非需要对 ClickHouse Keeper 或 Apache ZooKeeper 进行安全修复，否则在升级 ClickHouse 服务器时，不必升级 Keeper。升级过程中需要保证 Keeper 的稳定性，因此在考虑升级 Keeper 之前，请完成 ClickHouse 服务器的升级。

### 应频繁采用小版本升级 {#minor-version-upgrades-should-be-adopted-often}
强烈建议在发布新小版本后尽快升级到最新版。小版本发布没有破坏性更改，但包含重要的错误修复（可能还有安全修复）。

### 在运行目标版本的单独 ClickHouse 服务器上测试实验性功能 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

实验性功能的兼容性可能随时以任何方式受到影响。如果您正在使用实验性功能，请检查变更日志，并考虑设置一个安装了目标版本的单独 ClickHouse 服务器，在那里测试您的实验性功能使用情况。

### 降级 {#downgrades}
如果您升级后发现新版本与您依赖的某些功能不兼容，如果您没有开始使用任何新功能，您可能能够降级到最近的（不到一年的）版本。一旦使用了新功能，降级将不可行。

### 集群中有多个 ClickHouse 服务器版本 {#multiple-clickhouse-server-versions-in-a-cluster}

我们努力保持一年的兼容窗口（包括 2 个 LTS 版本）。这意味着如果两个版本之间的差异小于一年（或之间有不到两个 LTS 版本），则任何两个版本应该能够在集群中协同工作。然而，建议尽快将集群中所有成员升级到相同的版本，因为可能会出现一些小问题（例如，分布式查询的减速，ReplicatedMergeTree 中某些后台操作首次错误等）。

我们从不建议在同一集群中运行版本发布时间超过一年的不同版本。虽然我们不期望出现数据丢失，但集群可能会变得不可用。如果版本之间的差异超过一年，您应该预期会出现以下问题：

- 集群可能无法正常工作
- 某些（甚至所有）查询可能会以任意错误失败
- 日志中可能会出现任意错误/警告
- 可能无法降级

### 增量升级 {#incremental-upgrades}

如果当前版本与目标版本之间的差异超过一年，则建议：
- 进行停机升级（停止所有服务器，升级所有服务器，启动所有服务器）。
- 或者通过一个中间版本进行升级（一个比当前版本新不到一年的版本）。

## 推荐计划 {#recommended-plan}

以下是进行零停机 ClickHouse 升级的推荐步骤：

1. 确保您的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中，而是在 `/etc/clickhouse-server/config.d/` 中，因为 `/etc/clickhouse-server/config.xml` 在升级过程中可能会被覆盖。
2. 阅读 [变更日志](/whats-new/changelog/index.md)，以确认破坏性更改（从目标版本到您当前版本）。
3. 在升级之前进行任何可以在破坏性更改中识别的更新，以及需要在升级后进行的更改列表。
4. 确定每个分片中一个或多个副本在其余副本升级期间保持同步。
5. 在即将升级的副本上，逐个进行：
- 关闭 ClickHouse 服务器  
- 将服务器升级到目标版本  
- 启动 ClickHouse 服务器  
- 等待 Keeper 消息以表明系统稳定  
- 继续下一个副本
6. 检查 Keeper 日志和 ClickHouse 日志中的错误
7. 将步骤 4 中识别的副本升级到新版本
8. 查阅步骤 1 到 3 中所做的更改列表，并进行升级后需要的更改。

:::note
在复制环境中运行多个版本的 ClickHouse 时预期会出现此错误消息。当所有副本升级到相同版本后，您将不再看到这些消息。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse 服务器二进制升级过程 {#clickhouse-server-binary-upgrade-process}

如果 ClickHouse 是通过 `deb` 包安装的，请在服务器上执行以下命令：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果您使用其他方法安装 ClickHouse，请使用相应的更新方法。

:::note
您可以在没有任何一个分片的所有副本都离线的瞬间同时更新多个服务器。
:::

将较旧版本的 ClickHouse 升级到特定版本：

例如：

`xx.yy.a.b` 是当前稳定版本。最新的稳定版本可在 [这里](https://github.com/ClickHouse/ClickHouse/releases) 找到。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
