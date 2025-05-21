---
'sidebar_label': '概述'
'sidebar_position': 0
'slug': '/cloud/manage/backups/overview'
'title': '概述'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': '提供 ClickHouse 云中备份概述'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# 备份

数据库备份提供了一种安全网，确保如果数据因任何不可预见的原因丢失，服务可以从上一个成功的备份恢复到之前的状态。这样可以最小化停机时间，并防止关键业务数据永久丢失。本指南涵盖了 ClickHouse Cloud 中备份的工作原理、您可以配置备份的选项以及如何从备份中恢复。

## ClickHouse Cloud 中备份的工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 备份由“全备份”和“增量备份”组合而成，构成了一条备份链。该链以全备份开始，随后在接下来的几个调度时间段内进行增量备份，以创建备份序列。一旦备份链达到一定长度，就会启动新的链。然后，这整条备份链可以在需要时用于将数据恢复到新的服务中。一旦某一特定链中包含的所有备份超出为该服务设置的保留时间框架（具体保留时间将在下面讨论），该链将被丢弃。

在下面的截图中，实线方块表示全备份，虚线方块表示增量备份。围绕方块的实线矩形表示保留期以及对最终用户可见的备份，这些备份可以用于备份恢复。在下面的场景中，备份每 24 小时进行一次，并保留 2 天。

在第 1 天，进行一次全备份以启动备份链。在第 2 天，进行一次增量备份，此时我们现在有一个全备份和一个增量备份可供恢复。到第 7 天，我们在链中有一个全备份和六个增量备份，最近的两个增量备份对用户可见。在第 8 天，我们进行一次新的全备份，在第 9 天，一旦在新链中有两个备份，之前的链将被丢弃。

<Image img={backup_chain} size="md" alt="ClickHouse Cloud 中的备份链示例" />

*ClickHouse Cloud 中的备份场景示例*

## 默认备份策略 {#default-backup-policy}

在基础、规模和企业层级中，备份按使用量计费，与存储分开计费。所有服务默认为一个备份，并且从 Scale 层开始，可以通过 Cloud Console 的设置选项卡配置更多备份。

## 备份状态列表 {#backup-status-list}

您的服务将根据设定的时间表进行备份，无论是默认的每日时间表，还是您选择的 [自定义时间表](./configurable-backups.md)。所有可用的备份可以从服务的 **Backups** 选项卡查看。从这里，您可以查看备份的状态、持续时间以及备份的大小。您还可以使用 **Actions** 列恢复特定备份。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud 中的备份状态列表" border/>

## 了解备份成本 {#understanding-backup-cost}

根据默认策略，ClickHouse Cloud 要求每天进行一次备份，并保留 24 小时。选择一个需要保留更多数据或更频繁备份的时间表，可能会导致额外的存储费用。

要了解备份成本，您可以从使用情况屏幕查看每个服务的备份成本（如下所示）。一旦您在几天内以自定义时间表运行备份，您可以了解成本并推算出备份的月成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud 中的备份使用情况图表" border/>

估算备份的总成本需要您设定一个时间表。我们还在更新我们的 [定价计算器](https://clickhouse.com/pricing)，如此您可以在设定时间表之前获得每月成本估算。您需要提供以下输入来估算成本：
- 全备份和增量备份的大小
- 所需频率
- 所需保留时间
- 云服务提供商和区域

:::note
请注意，备份的预估成本将随着服务中数据的增长而变化。
:::

## 恢复备份 {#restore-a-backup}

备份将恢复到新的 ClickHouse Cloud 服务，而不是恢复到从中提取备份的现有服务。

单击 **Restore** 备份图标后，您可以指定将要创建的新服务的服务名称，然后恢复该备份：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务在准备好之前将以 `Provisioning` 状态显示在服务列表中：

<Image img={backup_service_provisioning} size="md" alt="服务配置中" border/>

## 使用恢复后的服务 {#working-with-your-restored-service}

备份恢复后，您现在将拥有两个类似的服务：需要恢复的 **原始服务** 和已经从原始服务的备份恢复的新 **恢复服务**。

一旦备份恢复完成，您应该进行以下操作之一：
- 使用新的恢复服务并删除原始服务。
- 将数据从新的恢复服务迁移回原始服务，并删除新的恢复服务。

### 使用 **新的恢复服务** {#use-the-new-restored-service}

要使用新服务，请执行以下步骤：

1. 验证新服务是否具有您使用案例所需的 IP 访问列表条目。
1. 验证新服务是否包含您需要的数据。
1. 删除原始服务。

### 将数据从 **新恢复服务** 迁移回 **原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设由于某种原因您无法使用新恢复服务，例如，如果您仍然有用户或应用程序连接到现有服务。您可以决定将新恢复的数据迁移到原始服务。可以按照以下步骤完成迁移：

**允许远程访问新恢复服务**

新服务应从具有与原始服务相同的 IP 允许列表的备份中恢复。这是必要的，因为除非您允许从 **Anywhere** 访问，否则不允许连接到其他 ClickHouse Cloud 服务。暂时修改允许列表并允许从 **Anywhere** 访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（托管恢复数据的系统）**

:::note
您需要重置新服务的密码才能访问它。您可以从服务列表的 **Settings** 选项卡完成此操作。
:::

添加一个只读用户以读取源表（在此示例中为 `db.table`）：

```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
```

```sql
  GRANT SELECT ON db.table TO exporter;
```

复制表定义：

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
```

**在目标 ClickHouse Cloud 系统上（具有损坏表的系统）：**

创建目标数据库：
```sql
  CREATE DATABASE db
```

使用源的 `CREATE TABLE` 语句创建目的地：

:::tip
运行 `CREATE` 语句时，将 `ENGINE` 更改为 `ReplicatedMergeTree`，而不需要任何参数。ClickHouse Cloud 始终复制表并提供正确的参数。
:::

```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
```

使用 `remoteSecure` 函数将数据从新恢复的 ClickHouse Cloud 服务提取到您的原始服务中：

```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

成功将数据插入原始服务后，请确保验证服务中的数据。一旦数据经过验证，您还应该删除新的服务。

## 恢复已删除或丢失的表 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

ClickHouse Cloud 不支持 `UNDROP` 命令。如果您不小心 `DROP` 了一个表，最佳的解决方案是恢复您的最后一个备份并从备份中重新创建该表。

为了防止用户不小心删除表，您可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 撤销特定用户或角色对 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 的权限。

:::note
为了防止意外删除数据，请注意在 ClickHouse Cloud 中，默认情况下无法删除大于 `1TB` 的表。如果您希望删除大于此阈值的表，您可以使用设置 `max_table_size_to_drop` 来实现：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- increases the limit to 2TB
```
:::

## 可配置备份 {#configurable-backups}

如果您想设置不同于默认备份时间表的备份时间表，请查看 [可配置备份](./configurable-backups.md)。

## 将备份导出到您自己的云帐户 {#export-backups-to-your-own-cloud-account}

对于希望将备份导出到自己的云帐户的用户，请参见 [这里](./export-backups-to-own-cloud-account.md)。
