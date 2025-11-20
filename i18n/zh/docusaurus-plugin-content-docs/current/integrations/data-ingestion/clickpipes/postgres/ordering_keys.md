---
sidebar_label: '排序键'
description: '如何定义自定义排序键。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: '排序键'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

排序键（也称 sorting keys）定义了在 ClickHouse 中表的数据在磁盘上的排序方式以及索引方式。从 Postgres 进行复制时，ClickPipes 默认使用 Postgres 表的主键作为 ClickHouse 中对应表的排序键。在大多数情况下，使用 Postgres 主键作为排序键已经足够，因为 ClickHouse 已针对快速扫描进行了优化，通常不需要自定义排序键。

如在[迁移指南](/migrations/postgresql/data-modeling-techniques)中所述，对于更大规模的使用场景，你应当在 ClickHouse 排序键中包含除 Postgres 主键之外的其他列，以优化查询。

在使用 CDC 时，如果选择的排序键不同于 Postgres 主键，默认情况下可能会在 ClickHouse 中导致数据去重问题。这是因为 ClickHouse 中的排序键具有双重作用：既控制数据的索引和排序，又充当去重键。解决此问题的最简单方法是定义可刷新的物化视图。



## 使用可刷新物化视图 {#use-refreshable-materialized-views}

定义自定义排序键(ORDER BY)的一种简单方法是使用[可刷新物化视图](/materialized-view/refreshable-materialized-view)(MV)。通过这种方式,您可以定期(例如每 5 或 10 分钟)按所需的排序键复制整个表。

以下是一个带有自定义 ORDER BY 和必要去重功能的可刷新物化视图示例:

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- 不同的排序键,但包含后缀形式的 postgres 主键
AS
SELECT * FROM posts FINAL
WHERE _peerdb_is_deleted = 0; -- 执行去重操作
```


## 不使用可刷新物化视图的自定义排序键 {#custom-ordering-keys-without-refreshable-materialized-views}

如果由于数据规模过大导致可刷新物化视图无法正常工作,以下是一些建议,可帮助您在大型表上定义自定义排序键并解决与去重相关的问题。

### 选择对于给定行不会改变的排序键列 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

在为 ClickHouse 的排序键添加额外列时(除了来自 Postgres 的主键之外),我们建议选择对于每一行都不会改变的列。这有助于防止 ReplacingMergeTree 出现数据一致性和去重问题。

例如,在多租户 SaaS 应用程序中,使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列唯一标识每一行,即使其他列发生变化,对于某个 `id` 而言 `tenant_id` 也保持不变。由于按 id 去重与按 (tenant_id, id) 去重是一致的,这有助于避免在 tenant_id 发生变化时可能出现的数据[去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 将 Postgres 表的副本标识设置为自定义排序键 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

为了使 Postgres CDC 按预期运行,必须修改表上的 `REPLICA IDENTITY` 以包含排序键列。这对于准确处理 DELETE 操作至关重要。

如果 `REPLICA IDENTITY` 不包含排序键列,Postgres CDC 将无法捕获主键以外的列的值——这是 Postgres 逻辑解码的一个限制。除 Postgres 主键外的所有排序键列都将为空值。这会影响去重,意味着行的先前版本可能无法与最新的已删除版本(其中 `_peerdb_is_deleted` 设置为 1)进行去重。

在上述 `owneruserid` 和 `id` 的示例中,如果主键尚未包含 `owneruserid`,则需要在 (`owneruserid`, `id`) 上创建 `UNIQUE INDEX` 并将其设置为表的 `REPLICA IDENTITY`。这可确保 Postgres CDC 捕获必要的列值以实现准确的复制和去重。

以下是在 events 表上执行此操作的示例。请确保将此应用于所有具有修改后排序键的表。

```sql
-- 在 (owneruserid, id) 上创建 UNIQUE INDEX
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- 设置 REPLICA IDENTITY 以使用此索引
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
