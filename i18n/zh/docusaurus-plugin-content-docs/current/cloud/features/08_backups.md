---
sidebar_label: '备份'
slug: /cloud/features/backups
title: '备份'
keywords: ['备份', '云备份', '恢复']
description: '概述 ClickHouse Cloud 的备份功能'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';

数据库备份提供了一道安全防线，确保在因任何不可预见的原因导致数据丢失时，服务可以从最近一次成功备份中恢复到先前的状态。
这可以最大限度地减少停机时间，并防止关键业务数据被永久丢失。


## 备份 \{#backups\}

### ClickHouse Cloud 中备份的工作原理 \{#how-backups-work-in-clickhouse-cloud\}

ClickHouse Cloud 的备份由“完整备份”和“增量备份”组合而成，它们共同构成一个备份链。备份链从一次完整备份开始，然后在接下来若干个预定时间点执行增量备份，从而形成一个按时间顺序排列的备份序列。一旦某个备份链的长度达到特定阈值，就会启动一个新的备份链。整个备份链随后可在需要时用于将数据恢复到一个新服务。当某个备份链中包含的所有备份都超出为该服务设置的保留时间范围（关于保留策略的更多信息见下文）后，该备份链会被丢弃。

在下图中，实线方框表示完整备份，虚线方框表示增量备份。围绕这些方框的实线矩形表示保留期以及对最终用户可见的备份，这些备份可用于执行数据恢复。在下述场景中，备份每 24 小时执行一次，并保留 2 天。

第 1 天，执行一次完整备份以启动备份链。第 2 天，执行一次增量备份，此时我们已有一个完整备份和一个增量备份可供恢复。到第 7 天时，该链中包含 1 个完整备份和 6 个增量备份，其中最近的两个增量备份对用户可见。第 8 天，我们执行一次新的完整备份，而在第 9 天，当新链中已有两个备份时，之前的备份链即被丢弃。

<Image img={backup_chain} size="lg" alt="ClickHouse Cloud 中备份链示例" />

### 默认备份策略 \{#default-backup-policy\}

在 Basic、Scale 和 Enterprise 级别中，备份会单独计量，并与存储分开计费。
所有服务默认每天执行一次备份；从 Scale 级别开始，可以通过 Cloud 控制台的 Settings 选项卡配置更多备份。
每个备份至少会保留 24 小时。

有关更多详细信息，请参阅 ["查看和恢复备份"](/cloud/manage/backups/overview)。

## 可配置备份 \{#configurable-backups\}

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 等级的服务配置备份计划。您可以根据业务需求，从以下几个维度配置备份：

- **Retention**：每个备份的保留天数。保留期最短可以设置为 1 天，最长可设置为 30 天，中间提供多个可选值。
- **Frequency**：用于指定两次备份之间的时间间隔。例如，频率为“every 12 hours”表示每次备份之间相隔 12 小时。频率可以在“every 6 hours”到“every 48 hours”之间选择，支持的小时增量为：`6`、`8`、`12`、`16`、`20`、`24`、`36`、`48`。
- **Start Time**：每天开始调度备份的时间。指定开始时间意味着备份的“Frequency”默认会变为每 24 小时一次。ClickHouse Cloud 会在指定开始时间的一小时内启动备份。

:::note
自定义计划会覆盖 ClickHouse Cloud 中该服务的默认备份策略。

在某些少见情况下，备份调度器不会遵循为备份指定的 **Start Time**。具体来说，如果在当前计划备份时间点前不足 24 小时内已经触发过一次成功的备份，就会出现这种情况。这可能是由于我们为备份设置的重试机制导致的。在这种情况下，调度器会跳过当天的备份，并在第二天的计划时间重试备份。
:::

有关配置备份计划的步骤，请参阅 ["Configure backup schedules"](/cloud/manage/backups/configurable-backups)。

## 自有对象存储（BYOB）备份 \{#byob\}

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud 允许将备份导出到您自己的云服务提供商（CSP）账户存储（AWS S3、Google Cloud Storage 或 Azure Blob Storage）。
即使您将备份配置到自有的 bucket，ClickHouse Cloud 仍会将每日备份保存到其自身的 bucket 中。
这可确保在您 bucket 中的备份损坏时，我们至少有一份可用于恢复的数据副本。
有关 ClickHouse Cloud 备份工作原理的详细信息，请参阅 [backups](/cloud/manage/backups/overview) 文档。

在本指南中，我们将演示如何将备份导出到您在 AWS、GCP、Azure 上的对象存储，以及如何在您的账户中将这些备份恢复到新的 ClickHouse Cloud 服务。
我们还会提供备份/恢复命令，帮助您将备份导出到 bucket 并从中恢复。

:::note 跨区域备份
将备份导出到同一云服务提供商中不同区域的任何用例，都会产生 [数据传输](/cloud/manage/network-data-transfer) 费用。

目前，我们不支持跨云备份，也不支持使用 [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) 的服务或受监管服务的备份/恢复。
:::

有关如何对 AWS、GCP、Azure 对象存储执行完整和增量备份以及如何从这些备份中恢复的示例，请参阅 ["Export backups to your own Cloud account"](/cloud/manage/backups/export-backups-to-own-cloud-account)。

### 备份选项 \{#backup-options\}

要将备份导出到自有云账户，有两种方式：

<VerticalStepper headerLevel="h5">

##### 通过 Cloud 控制台 UI \{#via-ui\}

可以在 [UI 中配置](/cloud/manage/backups/backup-restore-via-ui) 外部备份。
默认情况下，随后会按日执行备份（如[默认备份策略](/cloud/features/backups#default-backup-policy)中所指定）。
此外，我们也支持到自有云账户的[可配置](/cloud/manage/backups/configurable-backups)备份，以便设置自定义调度。
需要特别注意的是，所有到您 bucket 的备份都是完整备份，彼此之间没有任何关联关系。

##### 使用 SQL 命令 \{#using-commands\}

您可以使用 [SQL 命令](/cloud/manage/backups/backup-restore-via-commands) 将备份导出到 bucket。

</VerticalStepper>

:::warning
ClickHouse Cloud 不会管理客户 bucket 中备份的生命周期。
客户有责任确保其 bucket 中的备份得到适当管理，以满足合规要求并控制成本。
如果备份损坏，将无法进行恢复。
:::