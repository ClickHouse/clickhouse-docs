---
description: '升级文档'
sidebar_title: '自托管升级'
slug: /operations/update
title: '自托管升级'
doc_type: 'guide'
---

## ClickHouse 升级概览 \{#clickhouse-upgrade-overview\}

本文档包含：
- 通用指南
- 推荐方案
- 在系统上升级二进制文件的具体说明

## 一般指南 \{#general-guidelines\}

这些说明有助于你进行规划，并理解在文档后面部分我们为何会给出相应的建议。

### 将 ClickHouse server 与 ClickHouse Keeper 或 ZooKeeper 分开升级 \{#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper\}
除非 ClickHouse Keeper 或 Apache ZooKeeper 存在需要修复的安全问题，否则在升级 ClickHouse server 时没有必要同时升级 Keeper。升级过程中需要保持 Keeper 的稳定性，因此应先完成 ClickHouse server 的升级，再考虑升级 Keeper。

### 应经常进行小版本升级 \{#minor-version-upgrades-should-be-adopted-often\}
强烈建议在最新小版本发布后尽快升级到该版本。小版本发布不会包含破坏性变更，但会包含重要的缺陷修复（并且可能包含安全修复）。

### 在运行目标版本的独立 ClickHouse server 上测试实验特性 \{#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version\}

实验特性的兼容性可能在任何时间、以任何方式被破坏。如果你在使用实验特性，请检查变更日志，并考虑搭建一个安装了目标版本的独立 ClickHouse server，在该实例上测试你对实验特性的使用情况。

### 降级 \{#downgrades\}
如果你升级后发现新版本与某些你依赖的特性不兼容，并且你尚未开始使用任何新特性，那么你可能可以降级到一个最近的版本（不超过一年前的版本）。一旦开始使用新特性，降级将无法进行。

### 集群中存在多个 ClickHouse server 版本 \{#multiple-clickhouse-server-versions-in-a-cluster\}

我们会努力维持一年的兼容性窗口（其中包含 2 个 LTS 版本）。这意味着只要两个版本之间的发布时间差小于一年（或它们之间少于两个 LTS 版本），这两个版本就应该能够在同一集群中协同工作。不过，仍然建议尽快将集群中所有成员升级到相同版本，因为可能会出现一些小问题（例如分布式查询变慢、ReplicatedMergeTree 中某些后台操作出现可重试错误等）。

我们从不建议在同一集群中运行发布时间相差超过一年的不同版本。虽然我们不预期会发生数据丢失，但集群可能会变得不可用。如果版本之间相差超过一年，你应预期会遇到的问题包括：

- 集群可能无法正常工作
- 部分（甚至全部）查询可能会因各种错误而失败
- 日志中可能出现各种错误/警告
- 可能无法执行降级

### 增量升级 \{#incremental-upgrades\}

如果当前版本与目标版本之间的差异超过一年，建议采取以下两种方式之一：
- 通过停机升级（停止所有 server、升级所有 server、重新启动所有 server）。
- 或通过中间版本进行升级（选择一个比当前版本新但发布时间不超过一年的版本作为中间版本）。

## 推荐方案 \{#recommended-plan\}

以下是实现 ClickHouse 零停机升级的推荐步骤：

1. 确保你的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中，而是放在 `/etc/clickhouse-server/config.d/` 中，因为 `/etc/clickhouse-server/config.xml` 在升级过程中可能会被覆盖。
2. 通读 [更新日志](/whats-new/changelog/index.md)，查找不兼容变更（从目标版本往回查看到你当前使用的版本）。
3. 根据不兼容变更说明，对可以在升级前完成的修改先行调整，并整理出升级完成后仍需进行的变更清单。
4. 为每个分片确定一个或多个在升级期间保持运行的副本，同时升级该分片的其他副本。
5. 对于要升级的副本，逐个执行：

* 关闭 ClickHouse 服务器
* 将服务器升级到目标版本
* 启动 ClickHouse 服务器
* 等待 Keeper 消息表明系统已稳定
* 继续处理下一个副本6. 检查 Keeper 日志和 ClickHouse 日志中的错误

7. 将步骤 4 中确定的副本升级到新版本。
8. 参考步骤 1 至 3 中整理的变更清单，执行需要在升级后完成的变更。

:::note
在复制环境中同时运行多个版本的 ClickHouse 时，出现此错误消息是预期行为。当所有副本都升级到同一版本后，该错误消息将不再出现。

```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```

:::

## ClickHouse 服务器二进制升级流程 \{#clickhouse-server-binary-upgrade-process\}

如果 ClickHouse 是通过 `deb` 软件包安装的，请在服务器上执行以下命令：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果你不是使用推荐的 `deb` 软件包来安装 ClickHouse，请使用相应的更新方法。

:::note
只要确保不存在某个分片的所有副本同时离线的时刻，你就可以一次性更新多个服务器。
:::

将旧版本的 ClickHouse 升级到指定版本：

例如：

`xx.yy.a.b` 是当前的稳定版本之一。最新的稳定版本可以在[这里](https://github.com/ClickHouse/ClickHouse/releases)找到。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
