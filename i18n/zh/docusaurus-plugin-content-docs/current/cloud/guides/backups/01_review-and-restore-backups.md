---
sidebar_label: '查看和恢复备份'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概览'
keywords: ['backups', 'cloud backups', 'restore']
description: '介绍 ClickHouse Cloud 中备份功能的概览'
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


# 查看与恢复备份

本指南介绍 ClickHouse Cloud 中备份的工作机制、可用于为服务配置备份的选项，以及如何从备份中恢复数据。



## 备份状态列表 {#backup-status-list}

您的服务将按照设定的计划自动备份,可以是默认的每日备份计划,也可以是您自定义的[备份计划](/cloud/manage/backups/configurable-backups)。所有可用备份均可在服务的 **Backups** 选项卡中查看。在此页面中,您可以查看备份状态、持续时间以及备份大小。您还可以通过 **Actions** 列恢复指定的备份。

<Image
  img={backup_status_list}
  size='md'
  alt='ClickHouse Cloud 中的备份状态列表'
  border
/>


## 了解备份成本 {#understanding-backup-cost}

根据默认策略,ClickHouse Cloud 要求每天备份一次,保留 24 小时。如果选择需要保留更多数据或更频繁备份的计划,可能会产生额外的备份存储费用。

要了解备份成本,您可以从使用情况页面查看每个服务的备份成本(如下所示)。使用自定义计划运行备份几天后,您就可以了解成本情况并推算出每月的备份成本。

<Image
  img={backup_usage}
  size='md'
  alt='ClickHouse Cloud 中的备份使用情况图表'
  border
/>

估算备份的总成本需要您先设置计划。我们也在更新[价格计算器](https://clickhouse.com/pricing),以便您在设置计划之前就能获得月度成本估算。要估算成本,您需要提供以下信息:

- 完整备份和增量备份的大小
- 所需频率
- 所需保留期
- 云服务提供商和区域

:::note
请注意,随着服务中数据量的增长,备份的估算成本也会相应变化。
:::


## 恢复备份 {#restore-a-backup}

备份会恢复到新的 ClickHouse Cloud 服务中,而不是恢复到创建备份的原服务。

点击**恢复**备份图标后,您可以指定要创建的新服务名称,然后恢复该备份:

<Image
  img={backup_restore}
  size='md'
  alt='在 ClickHouse Cloud 中恢复备份'
/>

新服务在准备就绪之前,会在服务列表中显示为 `Provisioning` 状态:

<Image
  img={backup_service_provisioning}
  size='md'
  alt='服务配置进行中'
  border
/>


## 使用已恢复的服务 {#working-with-your-restored-service}

备份恢复完成后,您将拥有两个相似的服务:**原始服务**(需要恢复的服务)和一个新的**已恢复服务**(从原始服务的备份中恢复)。

备份恢复完成后,您应执行以下操作之一:

- 使用新恢复的服务并删除原始服务。
- 将数据从新恢复的服务迁移回原始服务,然后删除新恢复的服务。

### 使用**新恢复的服务** {#use-the-new-restored-service}

要使用新服务,请执行以下步骤:

1. 验证新服务具有您使用场景所需的 IP 访问列表条目。
1. 验证新服务包含您需要的数据。
1. 删除原始服务。

### 将数据从**新恢复的服务**迁移回**原始服务** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

假设由于某种原因您无法使用新恢复的服务,例如仍有用户或应用程序连接到现有服务。您可能需要将新恢复的数据迁移到原始服务中。可以通过以下步骤完成迁移:

**允许远程访问新恢复的服务**

新服务应从具有与原始服务相同 IP 允许列表的备份中恢复。这是必需的,因为除非您允许从**任何位置**访问,否则不允许连接到其他 ClickHouse Cloud 服务。请修改允许列表并临时允许从**任何位置**访问。有关详细信息,请参阅 [IP 访问列表](/cloud/security/setting-ip-filters)文档。

**在新恢复的 ClickHouse 服务上(托管已恢复数据的系统)**

:::note
您需要重置新服务的密码才能访问它。您可以从服务列表的**设置**选项卡执行此操作。
:::

添加一个可以读取源表的只读用户(本例中为 `db.table`):

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

复制表定义:

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

**在目标 ClickHouse Cloud 系统上(具有损坏表的系统):**

创建目标数据库:

```sql
CREATE DATABASE db
```

使用源中的 `CREATE TABLE` 语句创建目标表:

:::tip
运行 `CREATE` 语句时,将 `ENGINE` 更改为不带任何参数的 `ReplicatedMergeTree`。ClickHouse Cloud 始终会复制表并提供正确的参数。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

使用 `remoteSecure` 函数将数据从新恢复的 ClickHouse Cloud 服务拉取到原始服务中:

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

成功将数据插入原始服务后,请务必验证服务中的数据。数据验证完成后,您还应删除新服务。


## 恢复已删除的表 {#undeleting-or-undropping-tables}

ClickHouse Cloud 通过 [Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog) 支持 `UNDROP` 命令。

为防止用户误删表,您可以使用 [`GRANT` 语句](/sql-reference/statements/grant)撤销特定用户或角色执行 [`DROP TABLE` 命令](/sql-reference/statements/drop#drop-table)的权限。

:::note
为防止数据被误删,请注意 ClickHouse Cloud 默认不允许删除大于 `1TB` 的表。
如需删除超过此阈值的表,可以使用 `max_table_size_to_drop` 设置:

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- 将限制提高到 2TB
```

:::

:::note
旧版套餐:对于使用旧版套餐的客户,默认每日备份保留 24 小时,已包含在存储费用中。
:::


## 可配置备份 {#configurable-backups}

如果您需要设置不同于默认备份计划的备份策略,请参阅[可配置备份](/cloud/manage/backups/configurable-backups)。


## 将备份导出到您自己的云账户 {#export-backups-to-your-own-cloud-account}

如需将备份导出到您自己的云账户,请参阅[此处](/cloud/manage/backups/export-backups-to-own-cloud-account)。
