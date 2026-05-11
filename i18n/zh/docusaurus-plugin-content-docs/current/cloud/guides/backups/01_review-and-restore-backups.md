---
sidebar_label: '查看和恢复备份'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概览'
keywords: ['备份', 'Cloud 备份', '恢复']
description: '提供 ClickHouse Cloud 中备份的概览'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# 查看和恢复备份 \{#review-and-restore-backups\}

本指南介绍 ClickHouse Cloud 中备份的工作原理、为服务配置备份时可用的选项，以及如何从备份中恢复。

**前提条件**

- 您已经阅读了[《ClickHouse Cloud 中的备份工作原理》](/cloud/features/backups#how-backups-work-in-clickhouse-cloud)（功能概览页）

## 备份状态列表 \{#backup-status-list\}

无论是默认的每日计划还是您选择的[自定义计划](/cloud/manage/backups/configurable-backups)，您的服务都会按照设定的计划进行备份。所有可用的备份都可以在服务的 **Backups** 选项卡中查看。在这里，您可以查看备份的状态、时长以及备份大小。您还可以通过 **Actions** 列恢复特定的备份。

<Image img={backup_status_list} size="md" alt="List of backup statuses in ClickHouse Cloud" border/>

## 理解备份成本 \{#understanding-backup-cost\}

根据默认策略，ClickHouse Cloud 要求每天执行一次备份，保留时间为 24 小时。选择需要保留更多数据或更频繁备份的计划，将会为备份产生额外的存储费用。

要了解备份成本，您可以在使用情况界面中查看各服务的备份成本（如下图所示）。在使用自定义计划运行备份几天后，您就可以大致了解成本情况，并据此推算每月的备份成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud 中的备份使用情况图表" border/>

要估算备份的总成本，您需要先设置一个计划。我们也在更新我们的[价格计算器](https://clickhouse.com/pricing)，这样您可以在设置计划之前预估每月的备份成本。您需要提供以下信息来估算成本：

- 完全备份和增量备份的大小
- 期望的备份频率
- 期望的保留时间
- Cloud 提供商和区域

:::note
请注意，随着服务中数据规模随时间增长，备份的预估成本也会随之变化。
:::

## 恢复备份 \{#restore-a-backup\}

备份将恢复到一个新的 ClickHouse Cloud 服务中，而不会恢复到创建该备份的现有服务上。

点击 **Restore** 备份图标后，您可以指定将要创建的新服务的服务名称，然后执行备份恢复操作：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务会在服务列表中显示为 `Provisioning` 状态，直到准备就绪：

<Image img={backup_service_provisioning} size="md" alt="正在创建的服务" border/>

## 使用已恢复的服务 \{#working-with-your-restored-service\}

在完成备份恢复后，您将拥有两个类似的服务实例：需要恢复的**原始服务**，以及从该原始服务的备份中恢复得到的新的**已恢复服务**。

在备份恢复完成后，您应在以下两种方式中进行选择：

- 使用新的已恢复服务，并删除原始服务。
- 将数据从新的已恢复服务迁移回原始服务，然后删除新的已恢复服务。

### 使用**新恢复的服务** \{#use-the-new-restored-service\}

要使用此新服务，请执行以下步骤：

1. 确认新服务是否已配置满足你用例需求的 IP 访问列表项。
1. 确认新服务是否包含你所需的数据。
1. 删除原有服务。

### 将数据从**新恢复的服务**迁移回**原始服务** \{#migrate-data-from-the-newly-restored-service-back-to-the-original-service\}

假设由于某些原因你无法使用新恢复的服务，例如仍有用户或应用程序连接到现有服务。你可以选择将新恢复的数据迁移回原始服务。迁移可以通过以下步骤完成：

**允许对新恢复服务的远程访问**

应从一个具有与原始服务相同 IP 允许列表的备份中恢复新服务。这样做是必须的，因为除非你已允许从 **Anywhere** 访问，否则不允许连接到其他 ClickHouse Cloud 服务。临时修改允许列表，并允许从 **Anywhere** 访问。详情请参阅 [IP Access List](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（承载恢复数据的系统）**

:::note
你需要为新服务重置密码才能访问它。你可以在服务列表的 **Settings** 选项卡中完成此操作。
:::

添加一个只读用户，用于读取源表（本示例中的 `db.table`）：

```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
```

```sql
  GRANT SELECT ON db.table TO exporter;
```

复制该表的表结构定义：

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
```

**在目标 ClickHouse Cloud 系统上（存在损坏表的那个实例）：**

创建目标数据库：

```sql
  CREATE DATABASE db
```

使用源中的 `CREATE TABLE` 语句来创建目标表：

:::tip
在执行 `CREATE` 语句时，将 `ENGINE` 更改为不带任何参数的 `ReplicatedMergeTree`。ClickHouse Cloud 始终会对表进行复制，并自动提供正确的参数。
:::

```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
```

使用 `remoteSecure` 函数，将新恢复的 ClickHouse Cloud 服务中的数据拉取回原始服务：

```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

在成功将数据重新插入到原始服务之后，请务必在该服务中验证数据。数据验证完成后，还应删除新建的服务。


## 取消删除或恢复已删除的表 \{#undeleting-or-undropping-tables\}

ClickHouse Cloud 通过 [Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog) 支持 `UNDROP` 命令。

为防止用户意外删除表，您可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 来撤销特定用户或角色对 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 的权限。

:::note
为防止数据被意外删除，请注意，默认情况下，在 ClickHouse Cloud 中无法删除大小超过 `1TB` 的表。
如果您希望删除超过该阈值的表，可以使用设置项 `max_table_size_to_drop` 来实现：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```

:::

:::note
旧版套餐：对于使用旧版套餐的客户，默认的每日备份（保留 24 小时）已包含在存储费用中。
:::


## 备份耗时 \{#backup-durations\}

备份和还原的耗时取决于多个因素，例如数据库的大小、表结构以及数据库中的表数量。  
增量备份通常会比全量备份快得多，因为需要备份的数据更少。  
从增量备份进行还原会比从全量备份略慢一些，因为如上所述，还原时会包含链中的所有增量备份以及最后一次全量备份。

在我们的测试中，发现大约 1 TB 规模的较小备份可能需要大约 10–15 分钟或更长时间才能完成。  
小于 20 TB 的备份应当能在一小时内完成，对 50 TB 数据进行备份大约需要 2–3 小时。  
在更大规模下，备份会体现出规模经济效应，我们曾观察到某些内部服务的备份规模高达 1 PB，能够在大约 10 小时内完成。

:::note
备份到外部存储桶（bucket）的速度可能会比备份到 ClickHouse 存储桶慢
:::

还原耗时与备份耗时大致相同。

我们建议使用自身的数据库或样本数据进行测试以获得更准确的评估，因为实际耗时取决于上文所述的多个因素。

## 可配置备份 \{#configurable-backups\}

如果您希望配置不同于默认设置的备份计划，请参阅[可配置备份](/cloud/manage/backups/configurable-backups)。

## 将备份导出到您自己的 Cloud 帐户 \{#export-backups-to-your-own-cloud-account\}

如需将备份导出到您自己的 Cloud 帐户，请参阅[此处](/cloud/manage/backups/export-backups-to-own-cloud-account)。