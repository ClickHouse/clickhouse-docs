---
'sidebar_label': '排序键'
'description': '如何定义自定义排序键。'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': '排序键'
---

Ordering Keys (也称为排序键) 定义了 ClickHouse 中表的数据如何在磁盘上排序和索引。当从 Postgres 进行复制时，ClickPipes 将 Postgres 表的主键设置为 ClickHouse 中相应表的排序键。在大多数情况下，Postgres 主键足以充当排序键，因为 ClickHouse 已经针对快速扫描进行了优化，通常不需要自定义排序键。

正如在 [迁移指南](https://docs.peerdb.io/mirror/ordering-key-different) 中所描述的，对于较大的用例，您应该在 ClickHouse 排序键中包含除了 Postgres 主键之外的额外列，以优化查询。

默认情况下，使用 CDC 时，选择与 Postgres 主键不同的排序键可能会导致 ClickHouse 中的数据去重问题。这是因为 ClickHouse 中的排序键具有双重作用：它同时控制数据索引和排序，并且充当去重键。解决此问题的最简单方法是定义可刷新的物化视图。

## 使用可刷新的物化视图 {#use-refreshable-materialized-views}

定义自定义排序键 (ORDER BY) 的一个简单方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) (MVs)。这些视图允许您定期（例如，每 5 或 10 分钟）使用所需的排序键复制整个表。

以下是一个带有自定义 ORDER BY 和所需去重的可刷新的 MV 示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## 无可刷新的物化视图的自定义排序键 {#custom-ordering-keys-without-refreshable-materialized-views}

如果由于数据规模的原因可刷新的物化视图无法使用，以下是一些建议，您可以遵循这些建议在较大的表上定义自定义排序键并克服与去重相关的问题。

### 选择对于给定行不会改变的排序键列 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

在 ClickHouse 的排序键中包含额外列（除了 Postgres 的主键）时，我们建议选择每行不会改变的列。这有助于防止与 ReplacingMergeTree 相关的数据一致性和去重问题。

例如，在一个多租户的 SaaS 应用中，使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列唯一标识每行，而且即使其他列发生变化，`tenant_id` 对于某个 `id` 仍然保持不变。由于按 id 去重与按 (tenant_id, id) 去重一致，这有助于避免可能由于 tenant_id 变化而引发的数据 [去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 在 Postgres 表上设置主副本标识为自定义排序键 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

为了让 Postgres CDC 按预期工作，重要的是修改表上的 `REPLICA IDENTITY` 以包含排序键列。这对准确处理 DELETE 至关重要。

如果 `REPLICA IDENTITY` 不包含排序键列，Postgres CDC 将无法捕获主键以外的列的值 - 这是 Postgres 逻辑解码的一个限制。所有除了主键之外的排序键列在 Postgres 中将为 null。这影响去重，这意味着行的先前版本可能无法与最新删除版本（其中 `_peerdb_is_deleted` 设置为 1）进行去重。

在上述包含 `owneruserid` 和 `id` 的示例中，如果主键没有包含 `owneruserid`，您需要在 (`owneruserid`, `id`) 上创建 `UNIQUE INDEX` 并将其设置为表的 `REPLICA IDENTITY`。这确保 Postgres CDC 捕获必要的列值以实现准确的复制和去重。

以下是如何在 events 表上执行此操作的示例。确保将其应用于所有具有修改排序键的表。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
