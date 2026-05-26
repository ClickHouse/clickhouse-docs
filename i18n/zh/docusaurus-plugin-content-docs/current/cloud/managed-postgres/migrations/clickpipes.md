---
slug: /cloud/managed-postgres/migrations/clickpipes
sidebar_label: 'ClickPipes'
title: '通过 ClickPipes 中的数据源迁移 PostgreSQL 数据'
description: '了解如何通过 ClickPipes 将 PostgreSQL 数据库迁移到 ClickHouse Managed Postgres。'
keywords: ['postgres', 'postgresql', '逻辑复制', '迁移', 'clickpipes', 'managed postgres', '数据源', '导入']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
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

# 使用 ClickPipes 迁移到 Managed Postgres \{#migrate-managed-postgres\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-guide-clickhouse-cloud-beta" />

ClickHouse Cloud 现已提供 ClickPipes，可将外部 PostgreSQL 数据库迁移到 Managed Postgres 服务。该内置集成简化了整个流程：连接源数据库、导出 schema、将其导入 Managed Postgres，并设置持续复制。

## 前置条件 \{#prerequisites\}

* 使用具有复制权限的用户访问源 PostgreSQL 数据库。请根据您的源数据库选择相应的设置指南：
  * [Amazon RDS Postgres](/integrations/clickpipes/postgres/source/rds)
  * [Amazon Aurora Postgres](/integrations/clickpipes/postgres/source/aurora)
  * [Supabase Postgres](/integrations/clickpipes/postgres/source/supabase)
  * [Google Cloud SQL Postgres](/integrations/clickpipes/postgres/source/google-cloudsql)
  * [Azure Flexible Server for Postgres](/integrations/clickpipes/postgres/source/azure-flexible-server-postgres)
  * [Neon Postgres](/integrations/clickpipes/postgres/source/neon-postgres)
  * [Crunchy Bridge Postgres](/integrations/clickpipes/postgres/source/crunchy-postgres)
  * [TimescaleDB](/integrations/clickpipes/postgres/source/timescale)
  * [Generic Postgres Source](/integrations/clickpipes/postgres/source/generic) 适用于其他任意提供商或自托管实例
* 准备一个 ClickHouse Managed Postgres 服务作为迁移目标。如果您还没有，请参阅[快速入门](../quickstart)。
* 在本地计算机上安装 `pg_dump` 和 `psql`。这两个工具都包含在标准 PostgreSQL 客户端工具中。

## 迁移前注意事项 \{#considerations\}

* **DDL 传递**：持续复制 (CDC) 会捕获 DML 操作以及 `ADD COLUMN`。其他 DDL 变更 (如 `DROP COLUMN` 和 `ALTER COLUMN`) 不会传递，必须在目标端手动执行。

:::note
如果您在迁移过程中遇到问题，请查阅 [Managed Postgres 迁移常见问题](/cloud/managed-postgres/migrations/faq)，了解常见错误及其解决方法。
:::

## 第 1 步：连接到源数据库 \{#step-1-connect\}

打开 [ClickHouse Cloud 控制台](https://clickhouse.cloud)，然后选择您的 Managed Postgres 服务。

<Image img={serviceCard} alt="ClickHouse Cloud 服务列表中的 Managed Postgres 服务卡片" size="lg" border />

在左侧边栏中，点击 **数据源**。

<Image img={overview} alt="Managed Postgres 服务侧边栏中的数据源条目" size="lg" border />

点击 **开始导入**。

<Image img={startImport} alt="带有“开始导入”按钮的数据源页面" size="lg" border />

填写源 PostgreSQL 数据库的连接信息：主机、端口、用户名、密码和数据库名称。如果源数据库要求，请启用 **TLS**。

如果您需要通过私有连接访问源数据库，可以选择 **SSH 隧道**，并提供所需的 SSH 信息。这样，迁移过程就能安全地连接到无法公开访问的数据库。

选择一种摄取方式：

* **初始加载 + CDC** —— 复制现有数据，然后让目标持续与后续变更保持同步。
* **仅初始加载** —— 一次性复制，不进行持续复制。
* **仅 CDC** —— 跳过初始复制，仅复制从此刻起产生的新变更。

<Image img={migrationForm} alt="第 1 步：包含摄取方式选项的源数据库连接表单" size="lg" border />

点击 **下一步**。

## 第 2 步：导出数据库 schema \{#step-2-export-schema\}

向导会显示一条已预先填入源连接信息的 `pg_dump` 命令。在终端中运行它：

<Image img={nextExport} alt="第 2 步：用于导出 schema 的 pg_dump 命令" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

这会在当前目录中创建 `pg.sql`。

<Image img={psqlExport} alt="运行 pg_dump 后的终端输出" size="lg" border />

点击 **下一步**。

## 第 3 步：将 schema 导入您的 Managed Postgres 服务 \{#step-3-import-schema\}

从下拉菜单中选择目标端数据库，或点击 **Create a new database** 创建一个新数据库。

向导会显示一条 `psql` 命令，用于将 schema 转储导入您的 Managed Postgres 服务。在终端中运行该命令：

<Image img={nextImport} alt="第 3 步：用于导入 schema 的 psql 命令" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="运行 psql schema 导入后显示的终端输出" size="lg" border />

点击 **下一步**。

## 步骤 4：配置摄取设置 \{#step-4-ingestion-settings\}

指定用于逻辑复制的 publication。若留空，系统会自动创建一个 publication。

展开 **高级复制设置** 以调优吞吐量：

| 设置          | 默认值     | 描述                      |
| ----------- | ------- | ----------------------- |
| 同步时间间隔 (秒)  | 10      | 轮询 replication slot 的频率 |
| 初始加载的并行线程数  | 4       | 批量复制阶段使用的线程数            |
| 拉取批次大小      | 100,000 | 每个复制批次拉取的行数             |
| 每个分区快照的行数   | 100000  | 大表快照的分区大小               |
| 并行快照的表数量    | 1       | 可并发创建快照的表数量             |

<Image img={advancedSettings} alt="步骤 4：包含 publication 和高级复制选项的摄取设置表单" size="lg" border />

点击 **下一步**。

## 步骤 5：选择表 \{#step-5-select-tables\}

选择要复制的表。表按 schema 归类。您可以选择单个表，也可以展开某个 schema 以选择其中的所有表。

<Image img={tablePicker} alt="步骤 5：按 schema 归类的表选择器，带有 Create migration 按钮" size="lg" border />

点击 **Create migration**。

## 监控迁移 \{#monitor\}

创建迁移后，你会在**数据源**中看到它，状态为 **运行中**。

<Image img={migrationList} alt="数据源列表中显示一项正在运行的迁移" size="lg" border />

点击该迁移以打开详情视图。**表**选项卡会显示每个表的初始加载进度，包括已处理的行数、分区数以及每个分区的平均耗时。**指标**选项卡则会在 CDC 开始后显示复制延迟和吞吐量。

<Image img={initialLoad} alt="迁移详情视图中显示每个表的初始加载统计信息" size="lg" border />

## 迁移后任务 \{#post-migration\}

完成初始加载后，如果使用了 CDC，且复制延迟已接近零：

**验证行数。** 在切换流量之前，对源端和目标端的关键表进行抽样检查：

```sql
SELECT COUNT(*) FROM public.orders;
```

**停止向源端写入。** 暂停应用写入。要在切换期间强制设为只读模式：

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**确认复制已追上进度。** 比较源端和目标端的最新一行：

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**重置序列。** 使序列与每个表中的当前最大值保持一致：

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

**切换应用流量。** 将读写流量切换到您的 Managed Postgres 服务，并监控错误、约束违规情况以及复制健康状态。

**清理。**  完成切换并确认新服务运行正常后，从**数据源**中删除此次迁移。如果您使用了 CDC，请从源端删除 replication slot 以释放资源：

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## 后续步骤 \{#next-steps\}

* [Managed Postgres 快速入门](../quickstart)
* [Managed Postgres 连接信息](../connection)
* [ClickPipes Postgres 常见问题](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)