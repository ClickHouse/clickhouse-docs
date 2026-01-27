---
slug: /cloud/data-resiliency
sidebar_label: '数据恢复能力'
title: '灾难恢复'
description: '本指南概述了灾难恢复相关内容。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '数据恢复能力', '灾难恢复']
---

import Image from '@theme/IdealImage';
import restore_backup from '@site/static/images/cloud/guides/restore_backup.png';


# 数据弹性 \{#clickhouse-cloud-data-resiliency\}

本页介绍 ClickHouse Cloud 的灾难恢复建议，以及为客户从故障中断中恢复提供指导。
ClickHouse Cloud 目前不支持自动故障转移，也不支持跨多个地理区域的自动同步。

:::tip
客户应定期执行备份恢复测试，以了解在其服务规模和配置下的具体恢复时间目标（RTO）。
:::



## 定义 \{#definitions\}

首先了解一些相关定义会很有帮助。

**RPO（恢复点目标）**：在发生中断事件后，以时间衡量的、可接受的最大数据丢失量。例如：RPO 为 30 分钟意味着在发生故障时，数据库应能够恢复到不早于 30 分钟前的数据。当然，这取决于备份的执行频率。

**RTO（恢复时间目标）**：在发生故障或中断后，业务必须恢复到正常运行状态之前所允许的最长停机时间。例如：RTO 为 30 分钟意味着在发生故障时，团队能够在 30 分钟内恢复数据和应用，并使业务恢复正常运行。

**数据库备份和快照**：备份提供将数据副本存储在独立介质上的持久性长期存储。快照不会创建额外的数据副本，通常速度更快，并且可以提供更好的 RPO。



## 数据库备份 \{#database-backups\}

为主服务创建备份，可以在主服务发生停机时从备份中进行恢复，是一种行之有效的手段。
ClickHouse Cloud 支持以下备份功能。

1. **默认备份**

默认情况下，ClickHouse Cloud 会每 24 小时对您的服务执行一次[备份](/cloud/manage/backups)。
这些备份与服务位于同一地区，并存放于 ClickHouse CSP（云服务提供商）提供的存储桶中。
当主服务中的数据损坏时，可以使用该备份将数据恢复到一个新服务。

2. **外部备份（存放在客户自有的存储桶中）**

Enterprise Tier 客户可以将[备份导出](/cloud/manage/backups/export-backups-to-own-cloud-account)到其账号中的对象存储中，可以位于同一地区，也可以位于其他地区。
跨云备份导出功能即将推出。
对于跨地区和跨云备份，将产生相应的数据传输费用。

:::note
此特性目前在 PCI/HIPAA 服务中不可用
:::

3. **可配置备份**

客户可以[配置备份](/cloud/manage/backups/configurable-backups)以更高频率执行，最高可每 6 小时执行一次，以改善 RPO。
客户还可以配置更长的保留期限。

当前可用于该服务的备份会列在 ClickHouse Cloud 控制台的 “backups” 页面中。
该页面还会显示每个备份的成功 / 失败状态。



## 从备份恢复 \{#restoring-from-a-backup\}

1. 默认备份（位于 ClickHouse Cloud 存储桶中）可以恢复到同一区域内的新服务。
2. 外部备份（位于客户对象存储中）可以恢复到同一区域或不同区域的新服务。



## 备份和恢复时长指南 \{#backup-and-restore-duration-guidance\}

备份和恢复所需时间取决于多个因素，例如数据库大小、模式（schema）以及数据库中的表数量。

在我们的测试中，较小规模的备份（约 1 TB）完成备份可能需要 10–15 分钟或更长时间。
小于 20 TB 的备份通常可以在一小时内完成，而备份约 50 TB 的数据通常需要 2–3 小时。
对于更大规模的数据，备份在时长上会体现一定的规模效应，我们观察到部分内部服务的备份规模达到 1 PB，仍可在 10 小时内完成。

我们建议使用您自己的数据库或示例数据进行测试，以获得更准确的预估，因为实际耗时取决于上述多个因素。

对于相同规模的数据，恢复所需时间通常与备份时间相近。
如上所述，我们建议使用您自己的数据库进行测试，以便了解恢复备份大致需要的时间。

:::note
当前在同一区域或跨区域的两个 ClickHouse Cloud 实例之间**不支持**自动故障切换。
当前在同一区域或跨区域的不同 ClickHouse Cloud 服务之间**不支持**自动数据同步，即不支持 Active-Active 复制。
:::



## 恢复流程 \{#recovery-process\}

本节说明了可用的恢复选项以及在每种情况下可以遵循的具体流程。

### 主服务数据损坏 \{#primary-service-data-corruption\}

在这种情况下，可以将备份中的数据[恢复](/cloud/manage/backups/overview#restore-a-backup)到同一地域中的另一个服务。
如果使用默认备份策略，备份可能最多早至24小时前创建；如果使用备份频率为6小时的可配置备份，备份可能最多早至6小时前创建。

#### 恢复步骤 \{#restoration-steps\}

要从现有备份进行恢复

<VerticalStepper headerLevel="list">

1. 进入 ClickHouse Cloud 控制台的“Backups”部分。
2. 在要恢复的特定备份对应的“Actions”下，点击“三个点”按钮。
3. 为新服务指定一个名称，并从此备份进行恢复。

<Image img={restore_backup} size="md" alt="从备份恢复"/>

</VerticalStepper>

### 主地域停机 \{#primary-region-downtime\}

Enterprise Tier 的客户可以将[备份导出](/cloud/manage/backups/export-backups-to-own-cloud-account)到其自己的云服务商 bucket 中。
如果您担心地域级故障，建议将备份导出到其他地域。
请注意，将会产生跨地域数据传输费用。

如果主地域发生停机，可以在其他地域将该地域中的备份恢复到新的服务上。

一旦将备份恢复到另一个服务，您需要确保任何 DNS、负载均衡器或连接字符串配置都已更新为指向新服务。
这可能包括：

- 更新环境变量或机密
- 重启应用服务以建立新的连接

:::note
当前不支持对使用 [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) 的服务执行备份/恢复到外部 bucket 的操作。
:::



## 其他选项 \{#additional-options\}

还有一些其他选项可以考虑。

1. **向独立集群进行双写**

在此方案中，你可以在不同地域部署两个独立集群，并同时向这两个集群写入数据。
由于需要运行多个服务，此方案本身成本更高，但在某个地域不可用时可以提供更高的可用性。

2. **利用 CSP 复制**

在此方案中，你可以利用云服务提供商原生的对象存储复制能力来复制数据。
例如，在 BYOB 模式下，你可以将备份导出到你在主地域拥有的存储桶中，然后使用 [AWS cross region replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html) 将其复制到另一个地域。