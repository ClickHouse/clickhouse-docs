---
slug: /cloud/managed-postgres/migrations/logical-replication
sidebar_label: '逻辑复制'
title: '使用逻辑复制迁移 PostgreSQL 数据'
description: '了解如何使用逻辑复制将 PostgreSQL 数据迁移到 ClickHouse Managed Postgres'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceReplicationSetup from '@site/static/images/managed-postgres/logical_replication/source-setup.png';
import targetInitialSetup from '@site/static/images/managed-postgres/logical_replication/target-initial-setup.png';
import migrationResult from '@site/static/images/managed-postgres/logical_replication/migration-result.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';


# 使用逻辑复制迁移到 Managed Postgres \{#logical-replication-migration\}

本指南通过分步讲解说明如何使用 PostgreSQL 原生逻辑复制，将您的 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。

<PrivatePreviewBadge />

## 前置条件 \{#migration-logical-replication-prerequisites\}

* 能访问源 PostgreSQL 数据库。
* 在本地机器上已安装 `psql`、`pg_dump` 和 `pg_restore`。这些工具用于在目标数据库中创建空表。它们通常随 PostgreSQL 一起安装。如果没有，可以从 [PostgreSQL 官方网站](https://www.postgresql.org/download/) 下载。
* 源数据库必须能从 ClickHouse Managed Postgres 访问。请确保相关防火墙规则或安全组设置允许这种连通性。你可以通过如下方式获取 Managed Postgres 实例的出站 IP 地址（egress IP）：

```shell
dig +short <your-managed-postgres-hostname>
```


## 设置 \{#migration-logical-replication-setup\}

要使逻辑复制正常工作，需要确保源数据库已正确配置。以下是关键要求：

- 源数据库的 `wal_level` 必须设置为 `logical`。
- 源数据库的 `max_replication_slots` 必须至少设置为 `1`。
- 对于 RDS（本指南将其作为示例），需要确保参数组中的 `rds.logical_replication` 设置为 `1`。
- 源数据库用户必须具有 `REPLICATION` 权限。以 RDS 为例，需要运行：
    ```sql
    GRANT rds_replication TO <your-username>;
    ```
- 用于目标数据库的角色必须对目标数据库中的对象具有写权限：
    ```sql
    GRANT USAGE ON SCHEMA <schema_i> TO subscriber_user;
    GRANT CREATE ON DATABASE destination_db TO subscriber_user;
    GRANT pg_create_subscription TO subscriber_user;

    -- 授予表级权限
    GRANT INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA <schema_i> TO subscriber_user;
    ```

确保你的源数据库按如下所示完成配置：

<Image img={sourceReplicationSetup} alt="源 PostgreSQL 复制配置" size="md" border />

## 仅导出源数据库的 Schema（模式） \{#migration-logical-replication-schema-dump\}

在设置逻辑复制之前，我们需要在目标 ClickHouse Managed Postgres 数据库中创建相应的 schema。我们可以通过使用 `pg_dump` 从源数据库生成仅包含 schema 的导出来完成此操作：

```shell
pg_dump \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    -s \
    --format directory \
    -f rds-dump
```

这里：

* 将 `<user>`、`<password>`、`<host>`、`<port>` 和 `<database>` 替换为源数据库的凭据。
* `-s` 表示只导出 schema。
* `--format directory` 指定以目录格式导出备份，该格式适用于 `pg_restore`。
* `-f rds-dump` 指定备份文件的输出目录。注意，此目录会被自动创建，且不应预先存在。

在本示例中，有两张表 —— `events` 和 `users`。`events` 有一百万行，`users` 有一千行。

<Image img={sourceSetup} alt="Source PostgreSQL Tables Setup" size="xl" border />


### 创建 Managed Postgres 实例 \{#migration-pgdump-pg-restore-create-pg\}

首先，确保你已经创建了一个 Managed Postgres 实例，优先选择与源数据库位于同一区域的实例。你可以按照[这里](../quickstart#create-postgres-database)的快速指南进行操作。下面是我们在本指南中将要创建的实例配置：

<Image img={createPgForMigrate} alt="创建 ClickHouse Managed Postgres 实例" size="md" border />

## 将模式恢复到 ClickHouse Managed Postgres \{#migration-logical-replication-restore-schema\}

现在我们已经有了模式转储文件，可以使用 `pg_restore` 将其恢复到我们的 ClickHouse Managed Postgres 实例中：

```shell
pg_restore \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    --verbose \
    rds-dump
```

在这里：

* 将 `<user>`、`<password>`、`<host>`、`<port>` 和 `<database>` 替换为目标 ClickHouse 托管版 Postgres 数据库的凭据。
* `--verbose` 会在恢复过程中输出详细信息。
  此命令会在目标数据库中创建所有表、索引、视图和其他 schema 对象，但不会导入任何数据。

在我们的示例中，运行该命令后，我们得到了两个表，并且它们都是空的：

<Image img={targetInitialSetup} alt="目标 ClickHouse 托管版 Postgres 初始设置" size="xl" border />


## 设置逻辑复制 \{#migration-logical-replication-setup-replication\}

在模式准备就绪后，我们就可以从源数据库到目标 ClickHouse Managed Postgres 数据库设置逻辑复制了。此过程包括在源数据库上创建 publication（发布），并在目标数据库上创建 subscription（订阅）。

### 在源数据库上创建发布（publication） \{#migration-logical-replication-create-publication\}

连接到源 PostgreSQL 数据库，并创建一个包含要复制的表的发布（publication）。

```sql
CREATE PUBLICATION <pub_name> FOR TABLE table1, table2...;
```

:::info
如果存在大量表，为所有表创建 publication（`FOR ALL TABLES`）可能会带来较大的网络开销。建议只指定需要复制的表。
:::


### 在目标 ClickHouse Managed Postgres 数据库上创建订阅 \{#migration-logical-replication-create-subscription\}

接下来，连接到目标 ClickHouse Managed Postgres 数据库，并在其上创建一个订阅，用于连接源数据库上的发布。

```sql
CREATE SUBSCRIPTION demo_rds_subscription
CONNECTION 'postgresql://<user>:<password>@<host>:<port>/<database>'
PUBLICATION <pub_name_you_entered_above>;
```

这将在源数据库上自动创建一个复制槽，并开始将指定表中的数据复制到目标数据库。根据数据规模，此过程可能需要一些时间。

在我们的示例中，完成订阅配置后，数据就开始流入：

<Image img={migrationResult} alt="逻辑复制迁移结果" size="xl" border />

插入到源数据库的新行现在会以准实时的方式复制到目标 ClickHouse Managed Postgres 数据库中。


## 注意事项和考量 \{#migration-logical-replication-caveats\}

- 逻辑复制仅复制数据变更（INSERT、UPDATE、DELETE）。架构变更（如 ALTER TABLE）需要单独处理。
- 确保源数据库和目标数据库之间的网络连接稳定，以避免复制中断。
- 监控复制延迟，以确保目标数据库能够跟上源数据库的更新节奏。在源数据库上为 `max_slot_wal_keep_size` 设置合适的值，有助于管理不断增长的复制槽位，并防止其占用过多磁盘空间。
- 根据具体使用场景，您可能还需要为复制过程配置监控和告警机制。

## 后续步骤 \{#migration-pgdump-pg-restore-next-steps\}

恭喜！您已使用 pg_dump 和 pg_restore 成功将 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。现在，您可以开始探索 Managed Postgres 的各项功能及其与 ClickHouse 的集成。以下是一个 10 分钟快速入门指南，帮助您开始使用：

- [Managed Postgres 快速入门指南](../quickstart)