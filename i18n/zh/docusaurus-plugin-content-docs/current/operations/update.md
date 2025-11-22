---
description: '升级文档'
sidebar_title: '自管式升级'
slug: /operations/update
title: '自管式升级'
doc_type: 'guide'
---



## ClickHouse 升级概述 {#clickhouse-upgrade-overview}

本文档包含：

- 通用指南
- 推荐的升级计划
- 系统二进制文件升级的具体步骤


## 通用指南 {#general-guidelines}

这些说明将帮助您进行规划,并理解我们在本文档后续部分提出相关建议的原因。

### 将 ClickHouse 服务器与 ClickHouse Keeper 或 ZooKeeper 分开升级 {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}

除非 ClickHouse Keeper 或 Apache ZooKeeper 需要安全修复,否则在升级 ClickHouse 服务器时无需升级 Keeper。升级过程中需要保持 Keeper 的稳定性,因此请先完成 ClickHouse 服务器的升级,再考虑升级 Keeper。

### 应经常采用次版本升级 {#minor-version-upgrades-should-be-adopted-often}

强烈建议在最新次版本发布后立即升级。次版本不包含破坏性变更,但包含重要的错误修复(并可能包含安全修复)。

### 在运行目标版本的独立 ClickHouse 服务器上测试实验性功能 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

实验性功能的兼容性可能随时以任何方式被破坏。如果您正在使用实验性功能,请检查变更日志,并考虑设置一个安装了目标版本的独立 ClickHouse 服务器,在其上测试您对实验性功能的使用情况。

### 降级 {#downgrades}

如果您升级后发现新版本与您依赖的某些功能不兼容,并且尚未开始使用任何新功能,则可以降级到较新的版本(发布时间不超过一年)。一旦使用了新功能,降级将无法进行。

### 集群中的多个 ClickHouse 服务器版本 {#multiple-clickhouse-server-versions-in-a-cluster}

我们努力维持一年的兼容性窗口(包括 2 个 LTS 版本)。这意味着如果两个版本之间的时间差异小于一年(或它们之间的 LTS 版本少于两个),则它们应该能够在集群中协同工作。但是,建议尽快将集群的所有成员升级到相同版本,因为可能会出现一些小问题(如分布式查询变慢、ReplicatedMergeTree 某些后台操作中的可重试错误等)。

我们从不建议在发布日期相差超过一年的情况下在同一集群中运行不同版本。虽然我们预计不会出现数据丢失,但集群可能会变得不可用。如果版本差异超过一年,您应该预期会出现以下问题:

- 集群可能无法工作
- 某些(甚至全部)查询可能会因各种错误而失败
- 日志中可能出现各种错误/警告
- 可能无法降级

### 增量升级 {#incremental-upgrades}

如果当前版本与目标版本之间的时间差异超过一年,则建议采用以下方式之一:

- 停机升级(停止所有服务器,升级所有服务器,启动所有服务器)。
- 或通过中间版本升级(选择比当前版本新不到一年的版本)。


## 推荐方案 {#recommended-plan}

以下是实现 ClickHouse 零停机升级的推荐步骤:

1. 确保您的配置更改不在默认的 `/etc/clickhouse-server/config.xml` 文件中,而是位于 `/etc/clickhouse-server/config.d/` 目录下,因为 `/etc/clickhouse-server/config.xml` 可能在升级过程中被覆盖。
2. 仔细阅读[变更日志](/whats-new/changelog/index.md)中的破坏性变更(从目标版本回溯到您当前使用的版本)。
3. 执行破坏性变更中识别出的可以在升级前进行的更新,并列出升级后需要进行的变更清单。
4. 为每个分片确定一个或多个副本保持运行,同时升级该分片的其余副本。
5. 在将要升级的副本上,每次一个地执行以下操作:

- 关闭 ClickHouse 服务器
- 将服务器升级到目标版本
- 启动 ClickHouse 服务器
- 等待 Keeper 消息表明系统已稳定
- 继续处理下一个副本

6. 检查 Keeper 日志和 ClickHouse 日志中的错误
7. 将步骤 4 中确定的副本升级到新版本
8. 参考步骤 1 至 3 中列出的变更清单,执行升级后需要进行的变更。

:::note
当复制环境中运行多个版本的 ClickHouse 时,此错误消息是预期的。当所有副本都升级到相同版本后,您将不再看到这些错误。

```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```

:::


## ClickHouse 服务器二进制升级流程 {#clickhouse-server-binary-upgrade-process}

如果 ClickHouse 是通过 `deb` 软件包安装的,请在服务器上执行以下命令:

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

如果您使用了推荐的 `deb` 软件包以外的方式安装 ClickHouse,请使用相应的更新方法。

:::note
只要确保同一分片的所有副本不会同时离线,您就可以同时更新多台服务器。
:::

将旧版本 ClickHouse 升级到指定版本:

示例:

`xx.yy.a.b` 为当前稳定版本。最新稳定版本可在[此处](https://github.com/ClickHouse/ClickHouse/releases)查看

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
