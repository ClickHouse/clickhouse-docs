Ordering Keys (也称为排序键) 定义了 ClickHouse 中表的数据在磁盘上的排序方式和索引。当从 Postgres 复制数据时，ClickPipes 会将表的 Postgres 主键设置为 ClickHouse 中相应表的排序键。在大多数情况下，Postgres 主键作为排序键是足够的，因为 ClickHouse 已经针对快速扫描进行了优化，通常不需要自定义排序键。

正如在 [迁移指南](/migrations/postgresql/data-modeling-techniques) 中所述，对于较大的用例，您应该在 ClickHouse 排序键中包括 Postgres 主键以外的额外列，以优化查询。

在默认情况下，使用 CDC 时，选择不同于 Postgres 主键的排序键可能会导致 ClickHouse 中的数据去重问题。这是因为 ClickHouse 中的排序键承担了双重角色：它不仅控制数据索引和排序，同时也作为去重键。解决此问题的最简单方法是定义可刷新的物化视图。

## 使用可刷新的物化视图 {#use-refreshable-materialized-views}

定义自定义排序键 (ORDER BY) 的一个简单方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) (MVs)。这些物化视图允许您定期（例如，每 5 或 10 分钟）使用所需的排序键复制整个表。

下面是一个带有自定义 ORDER BY 和所需去重的可刷新的物化视图示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## 没有可刷新的物化视图的自定义排序键 {#custom-ordering-keys-without-refreshable-materialized-views}

如果由于数据规模原因，无法使用可刷新的物化视图，以下是一些建议，可以帮助您在较大表上定义自定义排序键并克服与去重相关的问题。

### 选择对给定行不变的排序键列 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

在 ClickHouse 的排序键中包含额外列（除了 Postgres 的主键）时，我们建议选择在每行中不变的列。这有助于避免与 ReplacingMergeTree 相关的数据一致性和去重问题。

例如，在多租户的 SaaS 应用程序中，使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列唯一标识每一行，并且对于一个 `id`，即使其他列发生变化，`tenant_id` 也保持不变。由于通过 id 进行去重与通过 (tenant_id, id) 进行去重是对齐的，因此可以避免如果 tenant_id 发生变化而可能出现的数据 [去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 在 Postgres 表上设置自定义排序键的副本身份 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

为了确保 Postgres CDC 按预期运行，重要的是修改表上的 `REPLICA IDENTITY` 来包括排序键列。这对于准确处理 DELETE 操作至关重要。

如果 `REPLICA IDENTITY` 不包括排序键列，则 Postgres CDC 将不会捕获主键以外的列值 - 这是 Postgres 逻辑解码的一个限制。除了 Postgres 中的主键外，所有排序键列将是 null。这会影响去重，这意味着行的先前版本可能无法与最新的已删除版本（其中 `_peerdb_is_deleted` 被设置为 1）进行去重。

在上述 `owneruserid` 和 `id` 的示例中，如果主键未包含 `owneruserid`，您需要在 (`owneruserid`, `id`) 上有一个 `UNIQUE INDEX` 并将其设置为表的 `REPLICA IDENTITY`。这确保 Postgres CDC 捕获必要的列值以实现准确的复制和去重。

以下是如何在 events 表上执行此操作的示例。请确保对所有具有修改过的排序键的表应用此操作。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
