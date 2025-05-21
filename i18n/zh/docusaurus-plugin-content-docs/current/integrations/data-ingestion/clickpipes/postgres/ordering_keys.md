---
'sidebar_label': '排序键'
'description': '如何定义自定义排序键。'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': '排序键'
---



Ordering Keys (也称为排序键) 定义了 ClickHouse 中表的数据在磁盘上的排序和索引方式。当从 Postgres 复制时，ClickPipes 将表的 Postgres 主键设置为 ClickHouse 中相应表的排序键。在大多数情况下，Postgres 主键作为排序键是足够的，因为 ClickHouse 已针对快速扫描进行了优化，而通常不需要自定义排序键。

如 [迁移指南](/migrations/postgresql/data-modeling-techniques) 中所述，对于更大的用例，应在 ClickHouse 排序键中添加除了 Postgres 主键之外的其他列来优化查询。

默认情况下，在 CDC 的情况下，选择与 Postgres 主键不同的排序键可能会导致 ClickHouse 中的数据重复问题。这是因为 ClickHouse 中的排序键具有双重角色：它同时控制数据索引和排序，并作为去重键。解决此问题的最简单方法是定义可刷新的物化视图。

## 使用可刷新的物化视图 {#use-refreshable-materialized-views}

定义自定义排序键 (ORDER BY) 的一种简单方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) (MVs)。这些视图允许您定期（例如每 5 或 10 分钟）复制整个表，并使用所需的排序键。

以下是带有自定义 ORDER BY 和所需去重的可刷新的物化视图的示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## 没有可刷新的物化视图的自定义排序键 {#custom-ordering-keys-without-refreshable-materialized-views}

如果由于数据规模的原因，无法使用可刷新的物化视图，以下是一些建议，您可以遵循以在较大表上定义自定义排序键并克服与去重相关的问题。

### 选择对于给定行不变的排序键列 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

在 ClickHouse 的排序键中添加其他列（除了来自 Postgres 的主键）时，我们建议选择对于每行不变的列。这有助于防止与 ReplacingMergeTree 的数据一致性和去重问题。

例如，在多租户的 SaaS 应用程序中，使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列唯一标识每一行，并且即使其他列发生变化，`tenant_id` 对于一个 `id` 仍然保持不变。由于通过 id 去重与通过 (tenant_id, id) 去重相一致，这有助于避免由于 tenant_id 变化而可能引发的数据 [去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 在 Postgres 表上将 Replica Identity 设置为自定义排序键 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

为了确保 Postgres CDC 按预期功能正常，将表的 `REPLICA IDENTITY` 修改为包含排序键列非常重要。这对于准确处理 DELETE 操作是必不可少的。

如果 `REPLICA IDENTITY` 不包含排序键列，Postgres CDC 将不会捕获主键以外的列的值——这是 Postgres 逻辑解码的一个限制。Postgres 中除主键外的所有排序键列将为 null。这会影响去重，意味着之前版本的行可能无法与最新的已删除版本去重（即 `_peerdb_is_deleted` 设置为 1）。

在上述示例中，如果主键未包含 `owneruserid`，则需要在 (`owneruserid`, `id`) 上创建一个 `UNIQUE INDEX` 并将其设置为表的 `REPLICA IDENTITY`。这确保了 Postgres CDC 捕获必要的列值，以实现准确的复制和去重。

以下是如何在 events 表上执行此操作的示例。确保将其应用于所有具有修改过的排序键的表。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
