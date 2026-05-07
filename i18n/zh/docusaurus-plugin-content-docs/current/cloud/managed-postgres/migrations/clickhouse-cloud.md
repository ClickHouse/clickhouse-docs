---
slug: /cloud/managed-postgres/migrations/clickhouse-cloud
sidebar_label: 'ClickHouse Cloud'
title: '在 ClickHouse Cloud 中使用数据源迁移 PostgreSQL 数据'
description: '了解如何使用 ClickHouse Cloud 内置的数据源导入向导，将您的 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。'
keywords: ['postgres', 'postgresql', '逻辑复制', '迁移', '数据传输', '托管 postgres', '数据源', '导入']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
import alterRole from '@site/static/images/managed-postgres/pgpg/alterrole.png';
import initialLoad from '@site/static/images/managed-postgres/pgpg/initialload.png';
import migrationForm from '@site/static/images/managed-postgres/pgpg/migrationform.png';
import migrationList from '@site/static/images/managed-postgres/pgpg/migrationlist.png';
import nextExport from '@site/static/images/managed-postgres/pgpg/nextexport.png';
import nextImport from '@site/static/images/managed-postgres/pgpg/nextimport.png';
import overview from '@site/static/images/managed-postgres/pgpg/overview.png';
import psqlExport from '@site/static/images/managed-postgres/pgpg/psqlexport.png';
import psqlImport from '@site/static/images/managed-postgres/pgpg/psqlimport.png';
import serviceCard from '@site/static/images/managed-postgres/pgpg/servicecard.png';
import startImport from '@site/static/images/managed-postgres/pgpg/startimport.png';
import tablePicker from '@site/static/images/managed-postgres/pgpg/tablepicker.png';

# 使用 ClickHouse Cloud 迁移到 Managed Postgres \{#migrate-managed-postgres\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-clickhouse-cloud" />

ClickHouse Cloud 内置了一个导入向导，可将外部 PostgreSQL 数据库迁移到 Managed Postgres 服务。该向导通过五个引导步骤处理源连接、schema 导出与导入、复制设置以及表选择。

## 前提条件 \{#prerequisites\}

* 可访问源 PostgreSQL 数据库，并使用具有复制特权的用户账户。
* 一个用作迁移目标的 ClickHouse Managed Postgres 服务。如果您还没有，请参阅[快速入门](../quickstart)。
* 在本地计算机上安装 `pg_dump` 和 `psql`。两者都随标准 PostgreSQL 客户端工具一同提供。

## 迁移前的注意事项 \{#considerations\}

* **DDL 传播**：持续复制 (CDC) 会捕获 DML 操作以及 `ADD COLUMN`。其他 DDL 修改 (如 `DROP COLUMN` 和 `ALTER COLUMN`) 不会传播，必须在目标端手动执行。
* **外键约束**：为避免摄取因外键检查而受阻，你需要在目标角色上临时设置 `session_replication_role = replica`。这将在下文的第 3 步中说明。

## 步骤 1：连接到源数据库 \{#step-1-connect\}

打开 [ClickHouse Cloud 控制台](https://clickhouse.cloud)，然后选择您的 Managed Postgres 服务。

<Image img={serviceCard} alt="ClickHouse Cloud 服务列表中的 Managed Postgres 服务卡片" size="lg" border />

在左侧边栏中，点击 **数据源**。

<Image img={overview} alt="Managed Postgres 服务侧边栏中的数据源条目" size="lg" border />

点击 **开始导入**。

<Image img={startImport} alt="带有“开始导入”按钮的数据源页面" size="lg" border />

填写源 PostgreSQL 数据库的连接详细信息：主机、端口、用户名、密码和数据库名称。如果源数据库需要，请启用 **TLS**。

如果您需要与源数据库建立私有连接，可以选择 **SSH tunneling** 并提供所需的 SSH 详细信息。这样，迁移过程便可安全地连接到无法通过公网访问的数据库。

选择一种摄取方法：

* **初始加载 + CDC** — 复制现有数据，然后使目标持续与后续变更保持同步。
* **仅初始加载** — 一次性复制，不进行持续复制。
* **仅 CDC** — 跳过初始复制，仅从此时起复制新的变更。

<Image img={migrationForm} alt="步骤 1：包含摄取方法选项的源数据库连接表单" size="lg" border />

点击 **下一步**。

## 第 2 步：导出数据库 schema \{#step-2-export-schema\}

向导会显示一条已预填源连接详细信息的 `pg_dump` 命令。请在终端中运行该命令：

<Image img={nextExport} alt="第 2 步：用于导出 schema 的 pg_dump 命令" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

这会在当前目录下创建 `pg.sql` 文件。

<Image img={psqlExport} alt="运行 pg_dump 后的终端输出" size="lg" border />

点击 **Next**。

## 第 3 步：将 schema 导入您的 Managed Postgres 服务 \{#step-3-import-schema\}

从下拉列表中选择目标端数据库，或点击 **创建新数据库** 以预配一个数据库。

向导会显示一条 `psql` 命令，用于将 schema 转储导入您的 Managed Postgres 服务。请在终端中运行该命令：

<Image img={nextImport} alt="第 3 步：用于导入 schema 的 psql 命令" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="运行 psql schema 导入后的终端输出" size="lg" border />

应用 schema 后，在目标角色上将 `session_replication_role` 设置为 `replica`，以防外键约束阻碍摄取：

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'replica';
```

<Image img={alterRole} alt="将 session_replication_role 设为 replica 的 ALTER ROLE 命令" size="lg" border />

点击 **Next**。

## 第 4 步：配置摄取设置 \{#step-4-ingestion-settings\}

指定用于逻辑复制的 publication。如果将其留空，系统会自动创建一个 publication。

展开 **进阶复制设置** 以调整处理量：

| 设置         | 默认值     | 说明                      |
| ---------- | ------- | ----------------------- |
| 同步间隔 (秒)   | 10      | 轮询 replication slot 的频率 |
| 初始加载的并行线程数 | 4       | 批量复制阶段使用的线程数            |
| 拉取批次大小     | 100,000 | 每个复制批次拉取的行数             |
| 每个分区的快照行数  | 100000  | 大表快照的分区大小               |
| 并行创建快照的表数量 | 1       | 可并行创建快照的表数量             |

<Image img={advancedSettings} alt="第 4 步：包含 publication 和进阶复制选项的摄取设置表单" size="lg" border />

点击 **Next**。

## 第 5 步：选择表 \{#step-5-select-tables\}

选择要复制的表。表会按 schema 分组显示。可选择单个表，或展开某个 schema 以选择其中的所有表。

<Image img={tablePicker} alt="第 5 步：按 schema 分组的表选择器，带有“Create migration”按钮" size="lg" border />

点击 **Create migration**。

## 监控迁移 \{#monitor\}

创建迁移后，你会在**数据源**中看到它，状态为 **Running**。

<Image img={migrationList} alt="显示正在运行的迁移的数据源列表" size="lg" border />

点击该迁移以打开详情页面。**Tables** 选项卡会显示每个表的初始加载进度，包括已处理的行、分区以及每个分区的平均耗时。**Metrics** 选项卡会在 CDC 开始后显示复制延迟和处理量。

<Image img={initialLoad} alt="显示每个表初始加载统计信息的迁移详情页面" size="lg" border />

## 迁移后任务 \{#post-migration\}

初始加载完成后，如果使用了 CDC，且复制延迟接近于零：

**验证行数。** 在切换流量之前，对源端和目标端的关键表进行抽样核对：

```sql
SELECT COUNT(*) FROM public.orders;
```

**停止向源端写入。** 暂停应用写入。要在切换期间强制设为只读模式：

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**确认复制已同步。** 比较源端和目标端的最新一行：

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**重新启用约束并恢复复制角色。** 重新应用在导入期间暂缓处理的所有索引、约束和触发器，然后重置目标角色：

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'origin';
```

**重置序列。** 使序列与各表中的当前最大值保持一致：

```sql
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT
            n.nspname AS schema_name,
            c.relname AS table_name,
            a.attname AS column_name,
            pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) AS seq_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE c.relkind = 'r'
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        IF r.seq_name IS NOT NULL THEN
            EXECUTE format(
                'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                r.seq_name, r.column_name, r.schema_name, r.table_name
            );
        END IF;
    END LOOP;
END $$;
```

**切换应用流量。** 将应用的读写流量切换到您的 Managed Postgres 服务，并监控是否出现错误、约束违规以及复制健康状况。

**清理。**  完成切换并确认新服务运行正常后，从**数据源**中删除该迁移任务。如果您使用了 CDC，请从源端删除 replication slot 以释放资源：

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## 后续步骤 \{#next-steps\}

* [Managed Postgres 快速入门](../quickstart)
* [Managed Postgres 连接详情](../connection)
* [ClickPipes Postgres 常见问题](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)