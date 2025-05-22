import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';

# 备份

数据库备份提供了一个安全网，确保如果数据由于任何不可预见的原因丢失，服务可以从最后一次成功的备份恢复到先前的状态。这最小化了停机时间，防止关键业务数据被永久丢失。本指南涵盖了 ClickHouse Cloud 中备份的工作原理、配置服务备份的选项，以及如何从备份中恢复。

## ClickHouse Cloud 中备份的工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 备份是由“完全备份”和“增量备份”组成的备份链。这条链从完全备份开始，随后在接下来的几个计划时间段内进行增量备份，以创建一系列备份。一旦备份链达到特定长度，就会启动一个新的链。这整个备份链可以在需要时用于将数据恢复到新服务中。一旦特定链中包含的所有备份超过服务设置的保存时间（关于保留的更多信息见下文），该链会被丢弃。

在下面的屏幕截图中，实线方块表示完全备份，而虚线方块表示增量备份。方框周围的实线矩形表示保留期以及对最终用户可见的备份，这些备份可用于备份恢复。在下面的场景中，备份每 24 小时进行一次，并保留 2 天。

在第 1 天，进行完全备份以启动备份链。在第 2 天，进行增量备份，此时我们有一个完全备份和一个增量备份可供恢复。在第 7 天，链中有一个完全备份和六个增量备份，其中最近的两个增量备份对用户可见。在第 8 天，进行新的完全备份，并在第 9 天，一旦新链中有两个备份，之前的链就会被丢弃。

<Image img={backup_chain} size="md" alt="ClickHouse Cloud中的备份链示例" />

*ClickHouse Cloud 中的备份场景示例*

## 默认备份策略 {#default-backup-policy}

在基础、规模和企业级别中，备份是计量的，并与存储单独收费。所有服务默认有一个备份，并且可以进行更多配置，从规模级别开始，通过云控制台的设置选项卡进行设置。

## 备份状态列表 {#backup-status-list}

您的服务将根据设置的计划进行备份，无论是默认的每日计划还是您选择的 [自定义计划](./configurable-backups.md)。可以从服务的 **备份** 选项卡查看所有可用的备份。从这里，您可以查看备份的状态、持续时间以及备份的大小。您还可以使用 **操作** 列恢复特定的备份。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud中的备份状态列表" border/>

## 理解备份成本 {#understanding-backup-cost}

根据默认策略，ClickHouse Cloud 要求每天进行一次备份，保留 24 小时。选择一个需要保留更多数据或者导致备份更频繁的计划可能会导致额外的存储费用。

要理解备份成本，可以从使用情况屏幕查看每个服务的备份成本（如下所示）。一旦您在几天内以定制计划运行备份，您可以了解成本并推算出每月的备份成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud中的备份使用情况图表" border/>

估计备份的总成本需要您设置一个计划。我们也在努力更新我们的 [定价计算器](https://clickhouse.com/pricing)，以便在设置计划之前提供每月成本估算。您需要提供以下输入以便估算成本：
- 完全和增量备份的大小
- 期望的频率
- 期望的保留时间
- 云提供商和区域

:::note
请记住，备份的估算成本会随着服务中数据大小的增长而变化。
:::

## 恢复备份 {#restore-a-backup}

备份会恢复到一个新的 ClickHouse Cloud 服务，而不是恢复到备份所取出的现有服务。

单击 **恢复** 备份图标后，您可以指定将要创建的新服务的服务名称，然后恢复该备份：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务会在服务列表中显示为 `Provisioning`，直到它准备就绪：

<Image img={backup_service_provisioning} size="md" alt="服务正在进行中" border/>

## 使用您恢复的服务 {#working-with-your-restored-service}

备份恢复后，您将有两个相似的服务：需要恢复的 **原始服务** 和从原始备份恢复的新 **恢复服务**。

一旦备份恢复完成，您应该做以下其中之一：
- 使用新恢复的服务并删除原始服务。
- 将数据从新恢复的服务迁移回原始服务，并删除新恢复的服务。

### 使用 **新恢复服务** {#use-the-new-restored-service}

要使用新服务，请执行以下步骤：

1. 验证新服务是否具有您的用例所需的 IP 访问列表条目。
1. 验证新服务是否包含您所需的数据。
1. 删除原始服务。

### 将数据从 **新恢复的服务** 迁移回 **原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设由于某种原因您无法使用新恢复的服务，例如，如果您仍有用户或应用程序连接到现有服务。您可以决定将新恢复的数据迁移到原始服务。迁移可以通过以下步骤完成：

**允许对新恢复服务的远程访问**

新服务应从与原始服务相同的 IP 允许列表中恢复。因为除非您允许来自 **任何地方** 的连接，否则将不允许访问其他 ClickHouse Cloud 服务。修改允许列表，并临时允许来自 **任何地方** 的访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（承载恢复数据的系统）**

:::note
您需要重置新服务的密码才能访问它。您可以在服务列表的 **设置** 选项卡中进行操作。
:::

添加一个只读用户，以便可以读取源表（在此示例中为 `db.table`）：

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

**在目标 ClickHouse Cloud 系统上（即损坏表的系统）：**

创建目标数据库：
```sql
CREATE DATABASE db
```

使用源表的 `CREATE TABLE` 语句创建目标表：

:::tip
在运行 `CREATE` 语句时将 `ENGINE` 更改为 `ReplicatedMergeTree`，无需参数。 ClickHouse Cloud 总是复制表并提供正确的参数。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

使用 `remoteSecure` 函数将数据从新恢复的 ClickHouse Cloud 服务提取到您原始的服务中：

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

成功将数据插入到您的原始服务后，请确保验证该服务中的数据。数据验证后，应删除新服务。

## 解除删除或还原表 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

ClickHouse Cloud 不支持 `UNDROP` 命令。如果您不小心 `DROP` 了一个表，最佳做法是恢复您最后一次的备份，并根据该备份重新创建表。

为了防止用户意外删除表，您可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 撤销特定用户或角色的 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 权限。

:::note
请注意，默认情况下，在 ClickHouse Cloud 中无法删除大于 `1TB` 的表，以防止数据意外删除。
如果您希望删除大于此阈值的表，您可以使用设置 `max_table_size_to_drop` 来操作：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- increases the limit to 2TB
```
:::

## 可配置备份 {#configurable-backups}

如果您希望设置与默认备份计划不同的备份计划，请查看 [可配置备份](./configurable-backups.md)。

## 将备份导出到您自己的云账户 {#export-backups-to-your-own-cloud-account}

有关用户想要将备份导出到自己云账户的信息，请参见 [这里](./export-backups-to-own-cloud-account.md)。
