---
sidebar_label: '查看并恢复备份'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概览'
keywords: ['备份', '云备份', '恢复']
description: '概述 ClickHouse Cloud 中的备份'
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


# 查看和恢复备份

本指南介绍 ClickHouse Cloud 中备份的工作机制、可用于为你的服务配置备份的选项，以及如何从备份中恢复数据。



## 备份状态列表 {#backup-status-list}

无论是默认的每日计划，还是你选择的[自定义计划](/cloud/manage/backups/configurable-backups)，你的服务都会按照设定的计划自动备份。所有可用的备份都可以在服务的 **Backups** 选项卡中查看。在这里，你可以看到备份的状态、耗时以及备份大小。你也可以通过 **Actions** 列来恢复特定的备份。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud 中备份状态列表" border/>



## 了解备份成本 {#understanding-backup-cost}

根据默认策略，ClickHouse Cloud 要求每天执行一次备份，并保留 24 小时的数据。选择需要保留更多数据的备份计划，或导致更频繁备份的计划，可能会产生额外的备份存储费用。

要了解备份成本，可以在用量页面查看每个服务的备份成本（如下所示）。当你在自定义计划下运行备份几天后，就可以大致了解成本，并据此推算出每月的备份成本。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud 中的备份使用情况图表" border/>

要估算备份的总成本，你需要先设置一个备份计划。我们也在更新我们的[价格计算器](https://clickhouse.com/pricing)，以便你在设置计划之前就能获得每月成本的预估值。你需要提供以下参数来估算成本：
- 全量和增量备份的大小
- 期望的备份频率
- 期望的保留时间
- 云服务提供商和区域

:::note
请记住，随着服务中数据量随时间增长，备份的预估成本也会发生变化。
:::



## 恢复备份 {#restore-a-backup}

备份会被恢复到一个新的 ClickHouse Cloud 服务中，而不是恢复到创建该备份的现有服务上。

点击 **Restore** 备份图标后，你可以指定将要创建的新服务的名称，然后恢复该备份：

<Image img={backup_restore} size="md" alt="在 ClickHouse Cloud 中恢复备份" />

新服务将在服务列表中显示为 `Provisioning`，直到其准备就绪：

<Image img={backup_service_provisioning} size="md" alt="服务正在 Provisioning 中" border/>



## 使用已恢复的服务

在完成一次备份恢复后，您将会拥有两个类似的服务：需要恢复的**原始服务**，以及从原始服务备份中恢复得到的新的**已恢复服务**。

当备份恢复完成后，您应执行以下两种操作之一：

* 使用新的已恢复服务并删除原始服务。
* 将新的已恢复服务中的数据迁移回原始服务，然后删除新的已恢复服务。

### 使用**新的已恢复服务**

要使用新服务，请执行以下步骤：

1. 验证新服务是否具有满足您使用场景所需的 IP 访问列表条目。
2. 验证新服务是否包含您需要的数据。
3. 删除原始服务。

### 将**新恢复服务**中的数据迁移回**原始服务**

假设由于某些原因您无法使用新恢复的服务，例如，仍然有用户或应用程序连接到现有服务。您可以选择将新恢复的数据迁移回原始服务。可以通过以下步骤完成迁移：

**允许对新恢复服务的远程访问**

新服务应当是使用与原始服务相同的 IP 允许列表从备份中恢复的。这是必需的，因为除非您已允许从 **Anywhere** 访问，否则不会允许连接到其他 ClickHouse Cloud 服务。请临时修改允许列表并允许从 **Anywhere** 访问。详情参见 [IP Access List](/cloud/security/setting-ip-filters) 文档。

**在新恢复的 ClickHouse 服务上（承载恢复数据的系统）**

:::note
您需要重置新服务的密码才能访问它。您可以在服务列表的 **Settings** 选项卡中完成此操作。
:::

添加一个只读用户，用于读取源表（本例中为 `db.table`）：

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

复制该表的定义：

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

**在目标 ClickHouse Cloud 系统上（包含损坏表的那个系统）：**

创建目标数据库：

```sql
创建数据库 db
```

使用源端的 `CREATE TABLE` 语句来创建目标表：

:::tip
在运行 `CREATE` 语句时，将 `ENGINE` 修改为不带任何参数的 `ReplicatedMergeTree`。ClickHouse Cloud 会始终对表进行复制并自动提供正确的参数。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

使用 `remoteSecure` 函数将数据从刚恢复的 ClickHouse Cloud 服务拉取到原始服务中：

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

在成功将数据插入到原有服务后，请务必在该服务中验证数据。数据验证完成后，还应删除新服务。


## 恢复已删除的表

通过 [Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog)，ClickHouse Cloud 支持使用 `UNDROP` 命令。

为防止用户误删表，你可以使用 [`GRANT` 语句](/sql-reference/statements/grant) 撤销特定用户或角色对 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table) 的权限。

:::note
为避免数据被意外删除，请注意，在 ClickHouse Cloud 中默认不允许删除大小 &gt;`1TB` 的表。
如果你希望删除超过该阈值的表，可以通过设置 `max_table_size_to_drop` 来实现：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- 将限制增加至 2TB
```

:::

:::note
旧版套餐：对于使用旧版套餐的客户，默认的每日备份保留 24 小时，其占用的存储空间已包含在存储费用中。
:::


## 可配置备份 {#configurable-backups}

如果您希望设置不同于默认备份计划的备份计划，请参阅[可配置备份](/cloud/manage/backups/configurable-backups)。



## 将备份导出到您自己的云账户 {#export-backups-to-your-own-cloud-account}

如果您希望将备份导出到您自己的云账户，请参阅[此页面](/cloud/manage/backups/export-backups-to-own-cloud-account)。
