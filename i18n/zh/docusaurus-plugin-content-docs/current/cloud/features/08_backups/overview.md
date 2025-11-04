---
'sidebar_label': '概述'
'sidebar_position': 0
'slug': '/cloud/manage/backups/overview'
'title': '概述'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': '提供 ClickHouse Cloud 中备份的概述'
'doc_type': 'guide'
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

数据库备份提供了一种安全保障，确保在数据因任何不可预见的原因丢失时，服务可以从最后一次成功备份恢复到之前的状态。这可以最小化停机时间，并防止业务关键数据被永久丢失。本指南涵盖了在 ClickHouse Cloud 中备份的工作原理、您可以为服务配置备份的选项，以及如何从备份中恢复。

## ClickHouse Cloud 中备份的工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 备份是由“全量”备份和“增量”备份组合而成的备份链。链条从全量备份开始，然后在接下来的几个调度时间段内进行增量备份，以创建一系列备份。一旦备份链达到一定长度，将开始新的链条。整个备份链可以用于在需要时将数据恢复到新的服务中。一旦特定链中所有备份都超过了为服务设置的保留时间（有关保留的更多信息见下文），该链将被丢弃。

在下面的截图中，实线方框表示全量备份，虚线方框表示增量备份。方框周围的实线矩形表示保留期和用户可见的备份，这些备份可用于备份恢复。在下面的场景中，每24小时进行一次备份，并保留2天。

在第1天，进行全量备份以启动备份链。在第2天，进行增量备份，现在我们有一个全量备份和一个增量备份可供恢复。在第7天，我们在链中有一个全量备份和六个增量备份，其中最新的两个增量备份对用户可见。在第8天，我们进行新的全量备份，在第9天，当我们在新链中有两个备份时，前一个链被丢弃。

<Image img={backup_chain} size="md" alt="在 ClickHouse Cloud 中的备份链示例" />

*ClickHouse Cloud 中的备份场景示例*

## 默认备份策略 {#default-backup-policy}

在基础、高级和企业级别中，备份是按使用量计费，与存储分开计费。所有服务默认每天备份一次，并且可以在 Cloud 控制台的设置选项卡中进行更多配置，从高级套餐开始。每个备份将至少保留24小时。

## 备份状态列表 {#backup-status-list}

您的服务将根据设定的调度进行备份，无论是默认的每日调度还是您选定的 [自定义调度](./configurable-backups.md)。所有可用的备份可以在服务的**备份**选项卡中查看。从这里，您可以查看备份的状态、持续时间以及备份的大小。您还可以使用**操作**列恢复特定备份。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud 中的备份状态列表" border/>

## 理解备份成本 {#understanding-backup-cost}

根据默认政策，ClickHouse Cloud 每天强制备份一次，保留24小时。选择需要保留更多数据的调度，或导致备份更频繁的调度可能会产生额外的存储费用。

要了解备份成本，您可以从使用情况屏幕查看每个服务的备份成本（如下所示）。一旦您根据自定义调度运行了一些天的备份，您就可以大致了解成本并推断出备份的每月成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud 中的备份使用情况图表" border/>

估算备份的总成本需要您设定一个调度。我们还在更新我们的 [定价计算器](https://clickhouse.com/pricing)，以便您在设定调度之前获得每月成本估算。您需要提供以下输入以估算成本：
- 全量和增量备份的大小
- 希望的频率
- 希望的保留期
- 云提供商和区域

:::note
请注意，备份的估算成本将随着服务中数据大小的增长而变化。
:::

## 恢复备份 {#restore-a-backup}

备份将恢复到新的 ClickHouse Cloud 服务中，而不是恢复到备份来源的现有服务中。

点击**恢复**备份图标后，您可以指定将要创建的新服务的服务名称，然后恢复该备份：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务将在服务列表中显示为 `Provisioning`，直到它准备就绪：

<Image img={backup_service_provisioning} size="md" alt="正在进行服务配置" border/>

## 使用恢复后的服务 {#working-with-your-restored-service}

在备份恢复后，您将拥有两个相似的服务：需要恢复的**原始服务**和从原始备份恢复的新**恢复服务**。

备份恢复完成后，您应该执行以下操作之一：
- 使用新的恢复服务并删除原始服务。
- 将数据从新的恢复服务迁移回原始服务并删除新的恢复服务。

### 使用 **新恢复的服务** {#use-the-new-restored-service}

要使用新服务，请执行以下步骤：

1. 验证新服务是否具有您用例所需的 IP 访问列表条目。
1. 验证新服务是否包含您所需的数据。
1. 删除原始服务。

### 从 **新恢复的服务** 迁移数据回到 **原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设您出于某种原因无法使用新恢复的服务，例如仍有用户或应用程序连接到现有服务。您可以决定将新恢复的数据迁移到原始服务中。迁移可以通过以下步骤完成：

**允许远程访问新恢复的服务**

新服务应从具有与原始服务相同的 IP 允许列表的备份中恢复。这是必要的，因为连接将不允许访问其他 ClickHouse Cloud 服务，除非您允许了来自 **Anywhere** 的访问。暂时修改允许列表，并允许来自 **Anywhere** 的访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（托管恢复数据的系统）**

:::note
您需要重置新服务的密码以便访问。您可以从服务列表的 **设置** 选项卡中进行此操作。
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

**在目标 ClickHouse Cloud 系统上（损坏表的系统）：**

创建目标数据库：
```sql
CREATE DATABASE db
```

使用源的 `CREATE TABLE` 语句创建目标：

:::tip
在运行 `CREATE` 语句时，将 `ENGINE` 更改为 `ReplicatedMergeTree`，不带任何参数。ClickHouse Cloud 始终复制表并提供正确的参数。
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

成功将数据插入原始服务后，请确保验证服务中的数据。数据验证后，您也应删除新服务。

## 未删除或未丢弃表 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

在 ClickHouse Cloud 中不支持 `UNDROP` 命令。如果您意外 `DROP` 了一个表，最好的做法是从最后的备份中恢复并重新创建该表。

为了防止用户不小心丢弃表，您可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 撤销特定用户或角色对 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 的权限。

:::note
请注意，默认情况下，在 ClickHouse Cloud 中无法删除超过`1TB`大小的表。
如果您希望删除超过此阈值的表，可以使用设置 `max_table_size_to_drop` 来实现：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```
:::

:::note
遗留计划：对于使用遗留计划的客户，默认的每日备份保留24小时，已包含在存储成本中。
:::

## 可配置的备份 {#configurable-backups}

如果您希望设置不同于默认备份调度的备份计划，请查看 [可配置的备份](./configurable-backups.md)。

## 将备份导出到您的云帐户 {#export-backups-to-your-own-cloud-account}

有关希望将备份导出到自己云帐户的用户，请参见 [这里](./export-backups-to-own-cloud-account.md)。
