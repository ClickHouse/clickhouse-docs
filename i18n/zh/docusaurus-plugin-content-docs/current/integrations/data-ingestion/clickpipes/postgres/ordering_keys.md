---
sidebar_label: '排序键'
description: '如何定义自定义排序键。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: '排序键'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

排序键（也称为 sorting keys）用于定义 ClickHouse 中表在磁盘上的数据排序和索引方式。在从 Postgres 进行复制时，ClickPipes 默认会使用 Postgres 中表的主键作为 ClickHouse 中对应表的排序键。在大多数情况下，Postgres 主键作为排序键已经足够，因为 ClickHouse 本身已针对快速扫描进行了优化，通常不需要自定义排序键。

如[迁移指南](/migrations/postgresql/data-modeling-techniques)中所述，对于更大规模的使用场景，您应在 ClickHouse 的排序键中包含除 Postgres 主键之外的其他列，以优化查询。

在使用 CDC（变更数据捕获）时，如果选择的排序键不同于 Postgres 主键，默认情况下可能会在 ClickHouse 中导致数据去重问题。这是因为 ClickHouse 中的排序键具有双重作用：既控制数据的索引和排序，又充当去重键。解决此问题的最简单方法是定义可刷新 materialized view。

## 使用可刷新materialized view \{#use-refreshable-materialized-views\}

定义自定义排序键（ORDER BY）的一个简单方法是使用[可刷新materialized view](/materialized-view/refreshable-materialized-view)（MV）。它们允许你按所需排序键定期（例如每 5 或 10 分钟）复制整个表。

下面是一个具有自定义 ORDER BY 并执行必要去重的可刷新 MV 示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```


## 不使用可刷新materialized view的自定义排序键 \{#custom-ordering-keys-without-refreshable-materialized-views\}

如果由于数据规模原因无法使用可刷新materialized view，以下是一些建议，可用于在较大表上定义自定义排序键，从而规避与去重相关的问题。

### 选择对给定行不会变化的排序键列 \{#choose-ordering-key-columns-that-dont-change-for-a-given-row\}

在为 ClickHouse 的排序键（除了来自 Postgres 的主键之外）添加额外列时，我们建议选择对每一行都不会发生变化的列。这样有助于避免在使用 ReplacingMergeTree 时出现数据一致性问题和去重问题。

例如，在一个多租户 SaaS 应用中，使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列可以唯一标识每一行，并且即使其他列发生变化，对于给定的 `id`，`tenant_id` 也保持不变。由于按 `id` 去重与按 (`tenant_id`, `id`) 去重是一致的，这有助于避免在 `tenant_id` 发生变化时可能出现的数据[去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 将 Postgres 表的 REPLICA IDENTITY 设置为自定义排序键 \{#set-replica-identity-on-postgres-tables-to-custom-ordering-key\}

为了让 Postgres CDC 按预期工作，重要的一点是要修改表上的 `REPLICA IDENTITY`，以包含排序键列。这对于准确处理 DELETE 操作非常关键。

如果 `REPLICA IDENTITY` 不包含排序键列，Postgres CDC 将不会捕获除主键之外其他列的值——这是 Postgres 逻辑解码的一个限制。Postgres 中除主键之外的所有排序键列的值都会是 null。这会影响去重，意味着该行的先前版本可能无法与最新的已删除版本（其中 `_peerdb_is_deleted` 被设置为 1）进行去重。

在上面包含 `owneruserid` 和 `id` 的示例中，如果主键尚未包含 `owneruserid`，你需要在 (`owneruserid`, `id`) 上创建一个 `UNIQUE INDEX`，并将其设置为该表的 `REPLICA IDENTITY`。这样可以确保 Postgres CDC 捕获到进行准确复制和去重所需的列值。

下面是在 events 表上执行此操作的示例。请确保将此设置应用于所有使用自定义排序键的表。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
