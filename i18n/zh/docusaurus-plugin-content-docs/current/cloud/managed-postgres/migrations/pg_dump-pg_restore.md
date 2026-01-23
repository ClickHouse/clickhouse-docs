---
slug: /cloud/managed-postgres/migrations/pg_dump-pg_restore
sidebar_label: 'pg_dump and pg_restore'
title: '使用 pg_dump 和 pg_restore 迁移 PostgreSQL 数据'
description: '了解如何使用 pg_dump 和 pg_restore 将 PostgreSQL 数据迁移到 ClickHouse Managed Postgres'
keywords: ['postgres', 'postgresql', 'pg_dump', 'pg_restore', '迁移', '数据传输', '托管 Postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';
import dumpCommand from '@site/static/images/managed-postgres/pg_dump_restore/dump-command.png';
import restoreCommand from '@site/static/images/managed-postgres/pg_dump_restore/restore-command.png';
import targetSetup from '@site/static/images/managed-postgres/pg_dump_restore/target-setup.png';


# 使用 pg_dump 和 pg_restore 迁移到 Managed Postgres \{#pg-dump-pg-restore\}

本指南提供分步说明，介绍如何使用 `pg_dump` 和 `pg_restore` 工具将 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="pg_dump-pg_restore" />

## 先决条件 \{#migration-pgdump-pg-restore-prerequisites\}

- 具备对源 PostgreSQL 数据库的访问权限。
- 本地计算机已安装 `pg_dump` 和 `pg_restore`。这些工具通常随 PostgreSQL 一同安装；如未安装，可从 [PostgreSQL 官方网站](https://www.postgresql.org/download/) 下载。

## 环境准备 \{#migration-pgdump-pg-restore-setup\}

在接下来的步骤中，我们使用一个示例 RDS PostgreSQL 数据库作为源数据库，如下所示：

<Image img={sourceSetup} alt="源 PostgreSQL 数据库设置" size="xl" border />

我们的数据对象包括：

- 两个表——`events` 和 `users`。`events` 有一百万行，`users` 有一千行。
- `events` 表上有一个索引。
- 一个基于 `events` 表的视图。
- 几个序列对象。

## 创建源数据库的转储 \{#migration-pgdump-pg-restore-dump\}

现在让我们使用 `pg_dump` 为上述对象创建一个转储文件。命令非常简单：

```shell
pg_dump \
  -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
  --format directory \
  -f rds-dump
```

如下：

* 将 `<user>`、`<password>`、`<host>`、`<port>` 和 `<database>` 替换为你的源数据库凭据信息。大多数 Postgres 服务提供商会给你一个可以直接使用的连接字符串。
* `--format directory` 指定将导出结果生成为目录格式的 dump，这种格式适用于 `pg_restore`。
* `-f rds-dump` 指定 dump 文件的输出目录。注意，该目录会被自动创建，事先不应存在。
* 你也可以通过添加 `--jobs` 参数并跟上希望运行的并行任务数来并行化 dump 过程。更多详情请参考 [pg&#95;dump 文档](https://www.postgresql.org/docs/current/app-pgdump.html)。

:::tip
你可以先测试一次这个过程，以了解所需时间以及 dump 文件的大小。
:::

运行该命令时的示例如下：

<Image img={dumpCommand} alt="pg_dump 命令执行" size="xl" border />


## 将转储数据迁移到 ClickHouse Managed Postgres \{#migration-pgdump-pg-restore-restore\}

现在我们已经获得了转储文件，可以使用 `pg_restore` 将其恢复到我们的 ClickHouse Managed Postgres 实例中。 

### 创建 Managed Postgres 实例 \{#migration-pgdump-pg-restore-create-pg\}

首先，确保您已经准备好一个 Managed Postgres 实例，最好与源实例位于同一区域。您可以按照[这里](../quickstart#create-postgres-database)的快速指南进行操作。下面是本指南中将要启动的实例：

<Image img={createPgForMigrate} alt="创建 ClickHouse Managed Postgres 实例" size="md" border />

### 恢复转储 \{#migration-pgdump-pg-restore-restore-dump\}

现在回到本地环境，我们可以使用 `pg_restore` 命令，将转储文件恢复到我们的托管 Postgres 实例中：

```shell
pg_restore \
  -d 'postgresql://<user>:<password>@<pg_clickhouse_host>:5432/<database>' \
  --verbose \
  rds-dump
```

你可以在 ClickHouse Cloud 控制台中获取 Managed Postgres 实例的连接字符串，详细说明见[此处](../connection)。

这里也有几个需要注意的参数：

* `--verbose` 会在还原过程中输出详细信息。
* 你也可以在这里使用 `--jobs` 参数来并行执行还原过程。更多详情请参考 [pg&#95;restore 文档](https://www.postgresql.org/docs/current/app-pgrestore.html)。

在我们的示例中，命令如下所示：

<Image img={restoreCommand} alt="pg_restore 命令执行" size="xl" border />


## 验证迁移 \{#migration-pgdump-pg-restore-verify\}

在还原过程完成后，可以连接到 Managed Postgres 实例，验证所有数据和对象是否已成功迁移。可以使用任意 PostgreSQL 客户端进行连接并执行查询。
下面是迁移完成后我们的 Managed Postgres 实例设置示例：

<Image img={targetSetup} alt="目标 Managed Postgres 数据库设置" size="xl" border />

可以看到所有表、索引、视图和序列都完好无损，并且数据记录数保持一致。

## 注意事项 \{#migration-pgdump-pg-restore-considerations\}

- 确保源数据库和目标数据库所使用的 PostgreSQL 版本彼此兼容。
使用比源服务器更旧版本的 `pg_dump` 可能会导致缺少功能或恢复问题。理想情况下，应使用与源数据库相同或更高主版本的 `pg_dump`。
- 对于大型数据库，导出和恢复可能需要相当长的时间。
请提前规划以尽量减少停机时间，并在支持的情况下考虑使用并行导出/恢复（`--jobs`）。
- 请注意，`pg_dump` / `pg_restore` 不会复制所有与数据库相关的对象或运行时状态。
这些包括角色及其成员关系、复制槽、服务器级配置（例如 `postgresql.conf`、`pg_hba.conf`）、表空间以及运行时统计信息。

## 后续步骤 \{#migration-pgdump-pg-restore-next-steps\}

恭喜！您已使用 pg_dump 和 pg_restore 成功将 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。现在，您可以开始探索 Managed Postgres 的各项功能，以及它与 ClickHouse 的集成。下面是一个 10 分钟的快速入门教程，引导您继续操作：

- [Managed Postgres 快速入门指南](../quickstart)