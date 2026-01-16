---
sidebar_label: '排序键'
description: '如何定义自定义排序键。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: '排序键'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

排序键（Ordering Keys，亦称 sorting keys）定义了 ClickHouse 表在磁盘上的数据排序和索引方式。在从 Postgres 进行复制时，ClickPipes 默认使用 Postgres 表的主键作为 ClickHouse 中对应表的排序键。在大多数情况下，Postgres 主键作为排序键已经足够，因为 ClickHouse 本身已经针对快速扫描进行了优化，通常不需要自定义排序键。

正如在[迁移指南](/migrations/postgresql/data-modeling-techniques)中所述，对于更大规模的使用场景，应当在 ClickHouse 的排序键中加入除 Postgres 主键之外的其他列，以优化查询。

在默认的 CDC（变更数据捕获）配置下，选择与 Postgres 主键不同的排序键可能会在 ClickHouse 中导致数据去重问题。这是因为 ClickHouse 中的排序键具有双重角色：既控制数据的索引和排序，又充当去重键。解决此问题的最简单方法是定义可刷新materialized view。

## 使用可刷新的物化视图 \\{#use-refreshable-materialized-views\\}

定义自定义排序键（ORDER BY）的一个简单方法是使用[可刷新物化视图](/materialized-view/refreshable-materialized-view)（MV）。使用它们可以定期（例如每 5 或 10 分钟）按所需的排序键复制整张表。

下面是一个带有自定义 ORDER BY 和必要去重的可刷新 MV 示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```


## 在不使用可刷新物化视图时自定义排序键 \\{#custom-ordering-keys-without-refreshable-materialized-views\\}

如果由于数据规模问题无法使用可刷新物化视图，可以参考下面的一些建议，在更大的表上定义自定义排序键，并解决与去重相关的问题。

### 选择对给定行不会变化的排序键列 \\{#choose-ordering-key-columns-that-dont-change-for-a-given-row\\}

在 ClickHouse 中为排序键（除了来自 Postgres 的主键）包含额外列时，我们建议选择对每一行来说都不会发生变化的列。这有助于避免在使用 ReplacingMergeTree 时出现数据一致性和去重问题。

例如，在多租户 SaaS 应用中，将 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列可以唯一标识每一行，并且即使其他列发生变化，对于某个给定的 `id`，其对应的 `tenant_id` 始终保持不变。由于按 `id` 去重与按 (`tenant_id`, `id`) 去重是一致的，这有助于避免在 `tenant_id` 发生变化时可能出现的数据[去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 在 Postgres 表上将 Replica Identity 设置为自定义排序键 \\{#set-replica-identity-on-postgres-tables-to-custom-ordering-key\\}

为了让 Postgres CDC 按预期工作，一个重要步骤是修改表上的 `REPLICA IDENTITY`，以包含排序键列。这对于准确处理 DELETE 操作至关重要。

如果 `REPLICA IDENTITY` 不包含排序键列，Postgres CDC 将不会捕获主键以外列的值——这是 Postgres 逻辑解码的一个限制。Postgres 中除主键之外的所有排序键列都将为 `NULL`。这会影响去重，意味着该行的旧版本可能无法与最新的已删除版本（其中 `_peerdb_is_deleted` 被设置为 1）被正确去重。

在上面 `owneruserid` 和 `id` 的示例中，如果主键尚未包含 `owneruserid`，则需要在 (`owneruserid`, `id`) 上创建一个 `UNIQUE INDEX`，并将其设置为该表的 `REPLICA IDENTITY`。这样可以确保 Postgres CDC 捕获到准确复制和去重所需的列值。

下面是在 `events` 表上执行此操作的示例。请确保将此操作应用于所有修改过排序键的表。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
