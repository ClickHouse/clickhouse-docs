---
slug: /cloud/managed-postgres/migrations/overview
sidebar_label: '概述'
title: 'Managed Postgres 数据迁移'
description: '比较迁移到 ClickHouse Managed Postgres 的四种方式，并根据源数据库和停机要求选择最合适的方案。'
keywords: ['managed postgres', '迁移', 'postgres 迁移', 'clickpipes', 'peerdb', 'pg_dump', 'pg_restore', '逻辑复制']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Managed Postgres 数据迁移 \{#managed-postgres-data-migration\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-overview-beta" />

您可以通过四种不同的方式迁移到 Managed Postgres。具体选择哪一种，
取决于您是否需要持续复制、迁移来源，以及应用在切换期间
可容忍的停机时间。

| 方法                                                                                      | 持续复制 (CDC)  | 运行位置                 | 最适用场景                              |
| --------------------------------------------------------------------------------------- | ----------- | -------------------- | ---------------------------------- |
| [ClickPipes](/cloud/managed-postgres/migrations/clickpipes)                             | 是           | ClickHouse Cloud 控制台 | 适用于大多数迁移——提供开箱即用的引导式向导，包含初始加载和 CDC |
| [PeerDB](/cloud/managed-postgres/migrations/peerdb)                                     | 是           | 自托管 (Docker)         | 适用于 ClickPipes UI 未涵盖的来源或工作流       |
| [pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) | 否           | 本地计算机                | 适用于小型或静态数据集的一次性迁移，且可以接受停机          |
| [逻辑复制](/cloud/managed-postgres/migrations/logical-replication)           | 是           | 源端和目标端 Postgres      | 适合直接控制原生 Postgres 复制、且不依赖第三方工具的场景  |

## ClickPipes \{#clickpipes\}

对于大多数迁移，[ClickPipes](/cloud/managed-postgres/migrations/clickpipes) 是推荐方案。它完全在 ClickHouse Cloud 控制台内运行，并引导您逐步完成连接源端、导出和导入 schema，以及启动带或不带 CDC 的初始加载。预置的源端连接器支持 Amazon RDS、Aurora、Supabase、Google Cloud SQL、Azure Flexible Server、Neon、Crunchy Bridge、TimescaleDB，以及任何通用的 Postgres 实例。

## PeerDB \{#peerdb\}

[PeerDB](/cloud/managed-postgres/migrations/peerdb) 是一个可通过 Docker 运行的自托管迁移
工具。当您的源端或工作流不适合使用 ClickPipes 向导时，请使用它——例如，当您需要为多个数据库编写
创建 peer 的脚本，或需要让整个迁移完全在您自己的网络内运行时。
PeerDB 不会自动迁移索引、约束或触发器；数据迁移到目标端后，您需要在目标端重新创建这些对象。

## pg_dump and pg_restore \{#pg-dump-pg-restore\}

[pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore)
会对源端进行快照，并在目标端恢复。由于没有持续的
复制，因此在转储和恢复期间，必须停止源端写入。
对于较小或静态的数据集，或者可以接受维护窗口的非生产环境，
这是合适的选择。

## 逻辑复制 \{#logical-replication\}

[逻辑复制](/cloud/managed-postgres/migrations/logical-replication)
使用 Postgres 原生的 publication 和订阅，将变更从
源端流式传输到目标端。你需要自行配置 `wal_level`、replication slot，以及
`REPLICATION` 权限——整个过程中不依赖任何第三方工具。
如果你希望完全控制复制机制，或者你的环境不允许使用外部迁移工具，请选择此方式。

## 迁移后 \{#after-migration\}

开始传输数据后，使用[数据验证](/cloud/managed-postgres/migrations/data-validation)
确认源端和目标端的行数及内容一致，再
切换应用流量。[迁移 FAQ](/cloud/managed-postgres/migrations/faq)
涵盖了常见错误和恢复步骤。

## 从 Supabase 迁移 \{#supabase\}

如果你要从 Supabase 迁移，请参阅 [Supabase 到 Managed Postgres 迁移指南](https://github.com/iskakaushik/supa-auth-migrate/blob/main/MIGRATION.md)，其中提供了分步操作说明。