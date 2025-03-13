---
slug: /operations/update
sidebar_title: 自管理升级
title: 自管理升级
---

## ClickHouse 升级概述 {#clickhouse-upgrade-overview}

本文档包含：
- 一般指南
- 推荐计划
- 在您的系统上升级二进制文件的具体步骤

## 一般指南 {#general-guidelines}

这些注意事项应帮助您进行规划，并理解我们在文档后面做出推荐的原因。

### 单独升级 ClickHouse 服务器与 ClickHouse Keeper 或 ZooKeeper {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
除非 ClickHouse Keeper 或 Apache ZooKeeper 需要安全修复，否则在升级 ClickHouse 服务器时不必升级 Keeper。在升级过程中，Keeper 的稳定性是必需的，因此在考虑升级 Keeper 之前，请完成 ClickHouse 服务器的升级。

### 应该经常进行小版本升级 {#minor-version-upgrades-should-be-adopted-often}
强烈建议在发布后尽快升级到最新的小版本。小版本发布没有重大变更，但有重要的错误修复（可能也有安全修复）。

### 在运行目标版本的单独 ClickHouse 服务器上测试实验性功能 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

实验性功能的兼容性可能随时以任何方式被破坏。如果您使用实验性功能，请检查更改日志，并考虑设置一个安装了目标版本的单独 ClickHouse 服务器，并在那里测试您对实验性功能的使用。

### 降级 {#downgrades}
如果您升级后发现新版本与您依赖的某个功能不兼容，如果未开始使用任何新功能，您可能能够降级到最近的（不到一年的）版本。一旦使用了新功能，降级将不起作用。

### 集群中多个 ClickHouse 服务器版本 {#multiple-clickhouse-server-versions-in-a-cluster}

我们努力维持一年的兼容性窗口（包括 2 个 LTS 版本）。这意味着如果两个版本之间的差异少于一年（或如果它们之间少于两个 LTS 版本），它们应该能够在集群中协同工作。然而，建议尽快将集群中的所有成员升级到相同版本，因为可能会出现一些小问题（如分布式查询的减速、ReplicatedMergeTree 中某些后台操作的可重试错误等）。

我们绝不建议在同一集群中运行版本发布日期相差超过一年的不同版本。虽然我们不期望您会遭遇数据丢失，但集群可能会变得不可用。如果您的版本差异超过一年，您应该预期以下问题：

- 集群可能无法工作
- 某些（甚至所有）查询可能会因任意错误而失败
- 日志中可能会出现任意错误/警告
- 可能无法降级

### 增量升级 {#incremental-upgrades}

如果当前版本与目标版本之间的差异超过一年，建议采取以下方法之一：
- 进行停机升级（停止所有服务器，升级所有服务器，运行所有服务器）。
- 或者通过一个中间版本进行升级（一个比当前版本更近的、少于一年旧的版本）。

## 推荐计划 {#recommended-plan}

以下是零停机 ClickHouse 升级的推荐步骤：

1. 确保您的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中，而是在 `/etc/clickhouse-server/config.d/` 中，因为 `/etc/clickhouse-server/config.xml` 可能在升级过程中被覆盖。
2. 阅读 [changelogs](/whats-new/changelog/index.md) 中有关破坏性更改的内容（从目标版本回溯到您当前使用的版本）。
3. 进行升级前可以进行的破坏性更改，并编写升级后需要进行的更改列表。
4. 确定每个分片的一个或多个副本，以便在其他副本升级时保持运行。
5. 在要升级的副本上，一次一个：
   - 关闭 ClickHouse 服务器
   - 将服务器升级到目标版本
   - 启动 ClickHouse 服务器
   - 等待 Keeper 消息指示系统已稳定
   - 继续下一个副本
6. 检查 Keeper 日志和 ClickHouse 日志中的错误
7. 将第四步中确定的副本升级到新版本
8. 参考第 1 到 3 步中所做的更改列表，并进行升级后需要做的更改。

:::note
当在复制环境中运行多个版本的 ClickHouse 时，会出现此错误消息。当所有副本升级到相同版本时，您将不再看到这些消息。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::


## ClickHouse 服务器二进制文件升级过程 {#clickhouse-server-binary-upgrade-process}

如果 ClickHouse 是通过 `deb` 包安装的，请在服务器上执行以下命令：

``` bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果您使用其他方法安装 ClickHouse，请使用相应的更新方法。

:::note
您可以在没有所有副本同时离线的情况下，同时更新多个服务器。
:::

将旧版本 ClickHouse 升级到特定版本：

例如：

`xx.yy.a.b` 是当前稳定版本。最新稳定版本可以在 [这里](https://github.com/ClickHouse/ClickHouse/releases) 找到。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
