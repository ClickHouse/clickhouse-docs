---
'sidebar_label': '概述'
'sidebar_position': 0
'slug': '/cloud/manage/backups/overview'
'title': '概述'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': '提供有关 ClickHouse Cloud 中备份的概述'
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

数据库备份通过确保在任何不可预见的原因导致数据丢失时，可以从最后一次成功的备份中将服务恢复到之前的状态，从而提供了一个安全网。这将最小化停机时间，并防止业务关键数据永久丢失。本指南涵盖了备份在 ClickHouse Cloud 中的工作原理，您可以为您的服务配置备份的选项，以及如何从备份中恢复。

## 备份在 ClickHouse Cloud 中的工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 备份是“全量”和“增量”备份的组合，构成了备份链。备份链以全量备份开始，然后在接下来的几个计划时间段内进行增量备份，以创建一系列备份。一旦备份链达到一定长度，将启动新链。在需要时，整个备份链可以用于将数据恢复到新服务。一旦特定链中包含的所有备份超过服务设置的保留时间框架（更多关于保留的内容见下文），该链将被丢弃。

在下面的截图中，实线方块表示全量备份，虚线方块表示增量备份。包围方块的实线矩形表示保留期以及最终用户可以用于备份恢复的备份。在下面的场景中，备份每24小时进行一次，并保留2天。

在第1天，进行全量备份以启动备份链。在第2天，进行增量备份，现在可以从全量和增量备份中进行恢复。到第7天，我们在链中有一个全量备份和六个增量备份，其中最近的两个增量备份对用户可见。在第8天，我们进行新的全量备份，在第9天，当我们在新链中有两个备份时，前一个链将被丢弃。

<Image img={backup_chain} size="md" alt="ClickHouse Cloud中的备份链示例" />

*ClickHouse Cloud中的备份场景示例*

## 默认备份策略 {#default-backup-policy}

在 Basic、Scale 和 Enterprise 级别，备份是计量并与存储分开计费的。所有服务默认设置为一个备份，并可以通过 Cloud Console 的设置选项卡配置更多备份，从 Scale 级别开始。

## 备份状态列表 {#backup-status-list}

您的服务将根据设定的计划备份，无论是默认的每日计划还是您选择的[自定义计划](./configurable-backups.md)。所有可用的备份可以从服务的 **Backups** 选项卡中查看。从这里，您可以看到备份的状态、持续时间以及备份的大小。您还可以使用 **Actions** 列恢复特定的备份。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud中的备份状态列表" border/>

## 理解备份成本 {#understanding-backup-cost}

根据默认策略，ClickHouse Cloud 每天要求进行一次备份，并保持 24 小时的保留。选择需要保留更多数据的计划，或导致更频繁备份的计划可能会产生额外的备份存储费用。

要了解备份成本，您可以从使用屏幕查看每项服务的备份成本（如下所示）。一旦您在几天内运行了定制计划的备份，您就可以对成本有一个大致的了解，并推算出每月的备份成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud中的备份使用图表" border/>

估算备份的总成本需要您设置一个计划。我们也在更新我们的[定价计算器](https://clickhouse.com/pricing)，以便您在设置计划之前获得月度成本估算。您需要提供以下输入才能估算成本：
- 全量和增量备份的大小
- 所需频率
- 所需保留期
- 云提供商和区域

:::note
请记住，随着服务中数据的增长，备份的估计成本将会变化。
:::

## 从备份中恢复 {#restore-a-backup}

备份是恢复到新的 ClickHouse Cloud 服务，而不是恢复到源服务中。

单击 **Restore** 备份图标后，您可以指定将要创建的新服务的服务名称，然后恢复此备份：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务在就绪之前将在服务列表中显示为 `Provisioning`：

<Image img={backup_service_provisioning} size="md" alt="正在进行服务配置" border/>

## 使用恢复的服务 {#working-with-your-restored-service}

备份恢复后，您现在将有两个类似的服务：需要恢复的 **原始服务** 和从原始服务的备份中恢复的新 **恢复服务**。

备份恢复完成后，您可以执行以下操作之一：
- 使用新恢复的服务并删除原始服务。
- 将数据从新恢复的服务迁移回原始服务，并删除新恢复的服务。

### 使用 **新恢复的服务** {#use-the-new-restored-service}

要使用新服务，请执行以下步骤：

1. 验证新服务是否具有您的用例所需的 IP 访问列表条目。
1. 验证新服务是否包含您所需的数据。
1. 删除原始服务。

### 从 **新恢复的服务** 迁移数据回 **原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设您由于某种原因无法使用新恢复的服务，例如，如果您仍有用户或应用程序连接到现有服务。您可以决定将新恢复的数据迁移到原始服务。通过以下步骤可以完成迁移：

**允许对新恢复服务的远程访问**

新服务应从与原始服务相同的 IP 允许列表的备份中恢复。这是必要的，因为如果您没有允许 **Anywhere** 的访问，则不允许连接到其他 ClickHouse Cloud 服务。修改允许列表并暂时允许来自 **Anywhere** 的访问。有关详细信息，请参见[IP 访问列表](/cloud/security/setting-ip-filters)文档。

**在新恢复的 ClickHouse 服务上（承载恢复数据的系统）：**

:::note
您需要重置新服务的密码才能访问它。您可以通过服务列表中的 **Settings** 选项卡进行此操作。
:::

添加一个只读用户，可以读取源表（在此示例中为 `db.table`）：

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

**在目标 ClickHouse Cloud 系统上（原来存在损坏表的系统）：**

创建目标数据库：
```sql
CREATE DATABASE db
```

使用源的 `CREATE TABLE` 语句创建目标：

:::tip
在执行 `CREATE` 语句时，将 `ENGINE` 更改为 `ReplicatedMergeTree`，而不带任何参数。 ClickHouse Cloud 始终为表复制并提供正确的参数。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

使用 `remoteSecure` 函数将数据从新恢复的 ClickHouse Cloud 服务拉入您的原始服务：

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

在成功将数据插入原始服务后，请务必验证服务中的数据。验证数据后，还应删除新服务。

## 无法删除或撤销删除表 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

`UNDROP` 命令在 ClickHouse Cloud 中不受支持。如果您意外 `DROP` 表，最佳做法是恢复您的最后一次备份，并从备份中重新创建表。

为了防止用户意外删除表，您可以使用[`GRANT` 语句](/sql-reference/statements/grant)撤销特定用户或角色的[`DROP TABLE`命令](/sql-reference/statements/drop#drop-table)的权限。

:::note
为了防止数据意外删除，请注意，默认情况下，在 ClickHouse Cloud 中不允许删除大于 `1TB` 的表。如果您希望删除超过此阈值的表，可以使用设置 `max_table_size_to_drop` 来执行：
```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- increases the limit to 2TB
```
:::

## 可配置的备份 {#configurable-backups}

如果您希望设置不同于默认备份计划的备份计划，请查看[可配置的备份](./configurable-backups.md)。

## 将备份导出到您自己的云账户 {#export-backups-to-your-own-cloud-account}

有关想要将备份导出到自己云账户的用户，请参见[这里](./export-backups-to-own-cloud-account.md)。
