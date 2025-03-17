---
sidebar_label: 概述
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: 概述
keywords: ['备份', '云备份', '恢复']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# 备份

数据库备份通过确保在数据因任何不可预见的原因丢失时，服务可以从最后一次成功的备份恢复到以前的状态，提供了一种安全保障。这最小化了停机时间，并防止了对业务关键数据的永久丢失。本指南涵盖了 ClickHouse Cloud 中备份的工作原理、您配置服务备份的选项，以及如何从备份中恢复。

## ClickHouse Cloud 中的备份工作原理 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 的备份是“全量备份”和“增量备份”的组合，构成了一条备份链。该链始于一个全量备份，随后在接下来的几个计划时间段内进行增量备份，以创建备份序列。一旦备份链达到一定长度，就会开始新的链。这整条备份链随后可以在需要时用于将数据恢复到新的服务。一旦包含在特定链中的所有备份超过了为服务设置的保留时间框架（关于保留的更多内容见下文），该链将被丢弃。

在下图中，实线方块表示全量备份，而虚线方块表示增量备份。围绕方块的实线矩形表示保留期以及用户可见的备份，可以用于备份恢复。在下面的场景中，备份每 24 小时进行一次，并保留 2 天。

在第 1 天，一个全量备份被创建以开始备份链。在第 2 天，进行了一个增量备份，此时我们现在有一个全量备份和一个增量备份可供恢复。到第 7 天，我们在链中有一个全量备份和六个增量备份，最近的两个增量备份对用户可见。在第 8 天，我们创建了一个新的全量备份，在第 9 天，一旦我们在新链中有两个备份，之前的链将被丢弃。

<img src={backup_chain}
    alt="在 ClickHouse Cloud 中的备份链示例"
    class="image"
/>

*Clickhouse Cloud 中的示例备份场景*

## 默认备份策略 {#default-backup-policy}

在基础、规模和企业级套餐中，备份是计量的，并且与存储分开计费。所有服务将默认设置为一个备份，并可通过 Cloud Console 的设置选项卡配置更多，起始于规模套餐。

## 备份状态列表 {#backup-status-list}

您的服务将根据设定的计划进行备份，无论是默认的每日计划还是您选择的[自定义计划](./configurable-backups.md)。所有可用的备份均可从服务的 **备份** 选项卡查看。从这里，您可以查看备份的状态、持续时间以及备份的大小。您还可以通过 **操作** 列恢复特定的备份。

<img src={backup_status_list}
    alt="在 ClickHouse Cloud 中的备份状态列表"
    class="image"
/>

## 理解备份成本 {#understanding-backup-cost}

根据默认政策，ClickHouse Cloud 每天都要求进行一次备份，保留 24 小时。选择需要保留更多数据的计划或导致更频繁备份的计划可能会导致额外的备份存储费用。

要了解备份成本，您可以在使用情况屏幕上查看每个服务的备份费用（如下所示）。一旦您运行了几天带有自定义计划的备份，您可以对成本有一定了解，并推算出备份的月费用。

<img src={backup_usage}
    alt="在 ClickHouse Cloud 中的备份使用情况图表"
    class="image"
/>

估算备份的总成本需要您设定一个计划。我们还在更新我们的[定价计算器](https://clickhouse.com/pricing)，以便您在设定计划之前获得月度成本估算。您需要提供以下输入以估算成本：
- 全量备份和增量备份的大小
- 期望的频率
- 期望的保留时间
- 云提供商和区域

:::note
请记住，随着服务中数据的增长，备份的估算成本将会发生变化。
:::

## 恢复备份 {#restore-a-backup}

备份是恢复到新的 ClickHouse Cloud 服务，而不是恢复到创建备份的现有服务。

在单击 **恢复** 备份图标后，您可以指定将要创建的新服务的服务名称，并然后恢复此备份：

<img src={backup_restore}
    alt="在 ClickHouse Cloud 中恢复备份"
    class="image"
/>

新服务将在服务列表中显示为 `Provisioning`，直到它准备就绪：

<img src={backup_service_provisioning}
    alt="服务正在配置中"
    class="image"
    style={{width: '80%'}}
/>

## 处理您的恢复服务 {#working-with-your-restored-service}

在恢复备份后，您将会有两个相似的服务：需要恢复的 **原始服务** 和从原始备份恢复的新 **恢复服务**。

一旦备份恢复完成，您应该执行以下操作之一：
- 使用新的恢复服务并删除原始服务。
- 从新的恢复服务迁移数据回原始服务，并删除新的恢复服务。

### 使用 **新恢复服务** {#use-the-new-restored-service}

要使用新服务，请执行以下步骤：

1. 验证新服务具有您用例所需的 IP 访问列表条目。
1. 验证新服务包含您所需的数据。
1. 删除原始服务。

### 从 **新恢复服务** 迁移数据回 **原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设由于某种原因您无法使用新恢复的服务，例如，如果您仍然有用户或应用程序连接到现有服务。您可以选择将新恢复的数据迁移回原始服务。迁移可以通过以下步骤完成：

**允许对新恢复服务的远程访问**

新服务应该从具有与原始服务相同的 IP 允许列表的备份中恢复。这是必要的，因为除非您允许来自 **任何地方** 的访问，否则将不允许连接到其他 ClickHouse Cloud 服务。修改允许列表，并临时允许来自 **任何地方** 的访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（托管恢复数据的系统）**

:::note
您需要重置新服务的密码才能访问它。您可以从服务列表的 **设置** 选项卡完成此操作。
:::

添加一个只读用户，可以读取源表（在本示例中为 `db.table`）：

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

使用源中的 `CREATE TABLE` 语句创建目标：

:::tip
在运行 `CREATE` 语句时，将 `ENGINE` 更改为 `ReplicatedMergeTree`，不带任何参数。ClickHouse Cloud 总是复制表并提供正确的参数。
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

在成功将数据插入原始服务后，请确保验证服务中的数据。您还应在确认数据后删除新服务。

## 取消删除或撤消删除表 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

在 ClickHouse Cloud 中不支持 `UNDROP` 命令。如果您不小心 `DROP` 了一个表，最佳策略是恢复您最后的备份并根据备份重新创建该表。

为了防止用户意外删除表，您可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 撤销特定用户或角色对 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 的权限。

:::note
为了防止意外删除数据，请注意，在 ClickHouse Cloud 中，默认情况下不允许删除大于 `1TB` 的表。
如果您希望删除大于此阈值的表，您可以使用设置 `max_table_size_to_drop` 来实现：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- 将限制增加到 2TB
```
:::

## 可配置备份 {#configurable-backups}

如果您想设定与默认备份计划不同的备份计划，请查看[可配置备份](./configurable-backups.md)。

## 将备份导出到您自己的云账户 {#export-backups-to-your-own-cloud-account}

对于希望将备份导出到自己云账户的用户，请参见[此处](./export-backups-to-own-cloud-account.md)。

