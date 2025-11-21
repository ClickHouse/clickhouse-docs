---
sidebar_label: '备份'
slug: /cloud/features/backups
title: '备份'
keywords: ['备份', '云备份', '恢复']
description: '提供 ClickHouse Cloud 备份功能的概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';

数据库备份提供了一张安全网，确保在数据因任何不可预见的原因丢失时，可以从最近一次成功备份中将服务恢复到先前状态。
这可以最大限度地减少停机时间，并防止关键业务数据被永久丢失。


## 备份 {#backups}

### ClickHouse Cloud 中备份的工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 备份是"完全"备份和"增量"备份的组合,它们共同构成一个备份链。备份链从完全备份开始,然后在接下来的几个计划时间段内执行增量备份,形成一系列备份。当备份链达到一定长度后,会启动新的备份链。如有需要,可以利用整个备份链将数据恢复到新服务。当特定链中的所有备份都超过了为服务设置的保留时间范围(有关保留的更多信息见下文)后,该链将被丢弃。

在下面的截图中,实线方框表示完全备份,虚线方框表示增量备份。方框周围的实线矩形表示保留期以及对最终用户可见的备份,这些备份可用于恢复操作。在下面的场景中,每 24 小时执行一次备份,并保留 2 天。

第 1 天,执行完全备份以启动备份链。第 2 天,执行增量备份,此时我们有一个完全备份和一个增量备份可供恢复使用。到第 7 天,备份链中有一个完全备份和六个增量备份,其中最近的两个增量备份对用户可见。第 8 天,执行新的完全备份,第 9 天,当新链中有两个备份后,之前的链将被丢弃。

<Image
  img={backup_chain}
  size='lg'
  alt='ClickHouse Cloud 中的备份链示例'
/>

### 默认备份策略 {#default-backup-policy}

在 Basic、Scale 和 Enterprise 层级中,备份与存储分开计量和计费。
所有服务默认每天执行一次备份,从 Scale 层级开始,可以通过 Cloud 控制台的 Settings 选项卡配置更多备份。
每个备份将至少保留 24 小时。

有关更多详细信息,请参阅["查看和恢复备份"](/cloud/manage/backups/overview)。


## 可配置备份 {#configurable-backups}

<ScalePlanFeatureBadge feature='Configurable Backups' linking_verb_are='True' />

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 层级服务配置备份计划。您可以根据业务需求在以下维度配置备份。

- **保留期**:每个备份的保留天数。保留期最短可设置为 1 天,最长可设置为 30 天,中间有多个可选值。
- **频率**:用于指定连续备份之间的时间间隔。例如,频率设置为"每 12 小时"表示备份之间间隔 12 小时。频率范围从"每 6 小时"到"每 48 小时",可选的小时增量为:`6`、`8`、`12`、`16`、`20`、`24`、`36`、`48`。
- **开始时间**:每天执行备份的开始时间。指定开始时间后,备份"频率"将默认为每 24 小时一次。ClickHouse Cloud 将在指定开始时间后的一小时内启动备份。

:::note
自定义计划将覆盖 ClickHouse Cloud 中该服务的默认备份策略。

在某些罕见情况下,备份调度程序可能不会遵守为备份指定的**开始时间**。具体来说,如果在当前计划备份时间的 24 小时内已触发过成功的备份,就会出现这种情况。这可能是由于我们为备份设置的重试机制所致。在这种情况下,调度程序将跳过当天的备份,并在次日的计划时间重新执行备份。
:::

有关配置备份的步骤,请参阅["配置备份计划"](/cloud/manage/backups/configurable-backups)。


## 自带存储桶 (BYOB) 备份 {#byob}

<EnterprisePlanFeatureBadge />

ClickHouse Cloud 支持将备份导出到您自己的云服务提供商 (CSP) 账户存储（AWS S3、Google Cloud Storage 或 Azure Blob Storage）。
如果您配置了备份到自己的存储桶，ClickHouse Cloud 仍会每天将备份保存到其自有存储桶中。
这样做是为了确保在您的存储桶中的备份损坏时，我们至少有一份数据副本可供恢复。
有关 ClickHouse Cloud 备份工作原理的详细信息,请参阅[备份](/cloud/manage/backups/overview)文档。

在本指南中,我们将介绍如何将备份导出到您的 AWS、GCP、Azure 对象存储,以及如何将这些备份恢复到您账户中的新 ClickHouse Cloud 服务。
我们还提供了备份/恢复命令,允许您将备份导出到存储桶并进行恢复。

:::note 跨区域备份
用户应注意,将备份导出到同一云提供商的不同区域将产生[数据传输](/cloud/manage/network-data-transfer)费用。

目前,我们不支持跨云备份,也不支持使用[透明数据加密 (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) 的服务或受监管服务的备份/恢复。
:::

请参阅["将备份导出到您自己的云账户"](/cloud/manage/backups/export-backups-to-own-cloud-account),了解如何对 AWS、GCP、Azure 对象存储进行完整和增量备份以及如何从备份中恢复的示例。

### 备份选项 {#backup-options}

要将备份导出到您自己的云账户,您有两个选项:

<VerticalStepper headerLevel="h5">

##### 通过 Cloud Console UI {#via-ui}

外部备份可以[在 UI 中配置](/cloud/manage/backups/backup-restore-via-ui)。
默认情况下,备份将每天执行一次（如[默认备份策略](/cloud/features/backups#default-backup-policy)中所指定）。
但是,我们也支持[可配置](/cloud/manage/backups/configurable-backups)备份到您自己的云账户,允许您设置自定义计划。
需要注意的是,所有到您存储桶的备份都是完整备份,与其他先前或未来的备份没有关联关系。

##### 使用 SQL 命令 {#using-commands}

您可以使用 [SQL 命令](/cloud/manage/backups/backup-restore-via-commands)将备份导出到您的存储桶。

</VerticalStepper>

:::warning
ClickHouse Cloud 不会管理客户存储桶中备份的生命周期。
客户有责任确保其存储桶中的备份得到适当管理,以遵守合规标准并控制成本。
如果备份损坏,将无法恢复。
:::
