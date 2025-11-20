---
slug: /cloud/data-resiliency
sidebar_label: '数据弹性'
title: '灾难恢复'
description: '本指南概述了灾难恢复相关内容。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'data resiliency', 'disaster recovery']
---

import Image from '@theme/IdealImage';
import restore_backup from '@site/static/images/cloud/guides/restore_backup.png';


# 数据韧性 {#clickhouse-cloud-data-resiliency}

本页面介绍 ClickHouse Cloud 的灾难恢复建议,以及客户从服务中断中恢复的指导。
ClickHouse Cloud 目前不支持自动故障转移或跨多个地理区域的自动同步。

:::tip
客户应定期执行备份恢复测试,以了解其服务规模和配置的具体恢复时间目标(RTO)。
:::


## 定义 {#definitions}

首先了解一些定义会很有帮助。

**RPO(恢复点目标)**: 发生中断事件后,以时间衡量的最大可接受数据丢失量。示例:RPO 为 30 分钟意味着在发生故障时,数据库应能恢复到不早于 30 分钟前的数据。当然,这取决于备份的执行频率。

**RTO(恢复时间目标)**: 发生中断后,恢复正常运营之前的最大允许停机时间。示例:RTO 为 30 分钟意味着在发生故障时,团队能够在 30 分钟内恢复数据和应用程序并恢复正常运营。

**数据库备份和快照**: 备份提供持久的长期存储,并创建数据的独立副本。快照不会创建数据的额外副本,通常速度更快,并能提供更好的 RPO。


## 数据库备份 {#database-backups}

为主服务创建备份是一种有效的方式,可以在主服务发生故障时利用备份进行恢复。
ClickHouse Cloud 支持以下备份功能。

1. **默认备份**

默认情况下,ClickHouse Cloud 每 24 小时对您的服务进行一次[备份](/cloud/manage/backups)。
这些备份位于与服务相同的区域,存储在 ClickHouse CSP(云服务提供商)的存储桶中。
当主服务中的数据损坏时,可以使用备份恢复到新服务。

2. **外部备份(存储在客户自己的存储桶中)**

企业版客户可以将[备份导出](/cloud/manage/backups/export-backups-to-own-cloud-account)到其自有账户中的对象存储,可以在同一区域或其他区域。
跨云备份导出支持即将推出。
跨区域和跨云备份将产生相应的数据传输费用。

:::note
此功能目前在 PCI/HIPAA 服务中不可用
:::

3. **可配置备份**

客户可以[配置备份](/cloud/manage/backups/configurable-backups)以更高的频率执行,最高可达每 6 小时一次,从而改善 RPO。
客户还可以配置更长的保留期限。

服务当前可用的备份列在 ClickHouse Cloud 控制台的"备份"页面上。
此部分还提供每个备份的成功/失败状态。


## 从备份恢复 {#restoring-from-a-backup}

1. 默认备份存储在 ClickHouse Cloud 存储桶中,可恢复至同一区域内的新服务。
2. 外部备份(存储在客户对象存储中)可恢复至同一区域或不同区域的新服务。


## 备份和恢复时长指南 {#backup-and-restore-duration-guidance}

备份和恢复时长取决于多个因素,例如数据库大小、schema 结构以及数据库中的表数量。

在我们的测试中,约 1 TB 的小规模备份需要 10-15 分钟或更长时间才能完成。
小于 20 TB 的备份通常在一小时内完成,而约 50 TB 数据的备份大约需要 2-3 小时。
备份在更大规模时具有规模经济效应,我们观察到某些内部服务高达 1 PB 的备份可在 10 小时内完成。

我们建议使用您自己的数据库或样本数据进行测试以获得更准确的时长估算,因为实际时长取决于上述多个因素。

恢复时长与相似规模的备份时长基本相当。
如上所述,我们建议使用您自己的数据库进行测试,以了解恢复备份所需的时间。

:::note
目前不支持在 2 个 ClickHouse Cloud 实例之间进行自动故障转移,无论它们位于相同还是不同的区域。
目前不支持在相同或不同区域的不同 ClickHouse Cloud 服务之间自动同步数据,即 Active-Active 复制。
:::


## 恢复流程 {#recovery-process}

本节介绍各种恢复选项以及每种情况下可遵循的流程。

### 主服务数据损坏 {#primary-service-data-corruption}

在这种情况下,可以从备份[恢复数据](/cloud/manage/backups/overview#restore-a-backup)到同一区域的另一个服务。
如果使用默认备份策略,备份数据可能最多延迟 24 小时;如果使用可配置备份(6 小时频率),则最多延迟 6 小时。

#### 恢复步骤 {#restoration-steps}

从现有备份恢复

<VerticalStepper headerLevel="list">

1. 进入 ClickHouse Cloud 控制台的"备份"部分。
2. 在要恢复的特定备份的"操作"下点击三个点。
3. 为新服务指定一个名称并从此备份恢复

<Image img={restore_backup} size='md' alt='从备份恢复' />

</VerticalStepper>

### 主区域停机 {#primary-region-downtime}

企业版客户可以将备份[导出](/cloud/manage/backups/export-backups-to-own-cloud-account)到自己的云提供商存储桶。
如果您担心区域故障,我们建议将备份导出到不同的区域。
请注意,跨区域数据传输将产生费用。

如果主区域发生故障,可以将另一个区域的备份恢复到不同区域的新服务。

备份恢复到另一个服务后,您需要确保更新任何 DNS、负载均衡器或连接字符串配置以指向新服务。
这可能涉及:

- 更新环境变量或密钥
- 重启应用程序服务以建立新连接

:::note
使用[透明数据加密 (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) 的服务目前不支持备份/恢复到外部存储桶。
:::


## 其他选项 {#additional-options}

以下是一些可供考虑的其他选项。

1. **双写到独立集群**

在此选项中,您可以在不同区域设置 2 个独立集群并同时向两者写入数据。
此选项由于需要运行多个服务而会带来更高的成本,但在某个区域不可用时可提供更高的可用性。

2. **利用 CSP 复制**

使用此选项,您可以利用云服务提供商的原生对象存储复制功能来复制数据。
例如,通过 BYOB,您可以将备份导出到主区域中您拥有的存储桶,然后使用 [AWS 跨区域复制](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)将其复制到另一个区域。
