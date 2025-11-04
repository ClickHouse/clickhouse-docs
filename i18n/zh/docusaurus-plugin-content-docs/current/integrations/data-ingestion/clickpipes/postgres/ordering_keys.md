---
'sidebar_label': '排序键'
'description': '如何定义自定义排序键。'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': '排序键'
'doc_type': 'guide'
---

Ordering Keys (即排序键) 定义了在 ClickHouse 中如何对数据进行磁盘排序和索引。当从 Postgres 进行复制时，ClickPipes 将 Postgres 的表主键设置为 ClickHouse 中相应表的排序键。在大多数情况下，Postgres 主键作为排序键就足够了，因为 ClickHouse 已针对快速扫描进行了优化，通常不需要自定义排序键。

如 [迁移指南](/migrations/postgresql/data-modeling-techniques) 中所述，对于较大的用例，您应该在 ClickHouse 的排序键中包含除了 Postgres 主键之外的其他列，以优化查询。

默认情况下，如果使用 CDC，选择一个与 Postgres 主键不同的排序键可能会导致 ClickHouse 中的数据去重问题。这是因为 ClickHouse 中的排序键同时承担了两个角色：它控制数据的索引和排序，同时作为去重键。解决此问题的最简单方法是定义可刷新的物化视图。

## 使用可刷新的物化视图 {#use-refreshable-materialized-views}

定义自定义排序键 (ORDER BY) 的一种简单方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view) (MVs)。这些视图允许您定期（例如，每 5 或 10 分钟）复制整个表，并使用所需的排序键。

下面是一个带有自定义 ORDER BY 和必要去重的可刷新物化视图的示例：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## 无需可刷新的物化视图的自定义排序键 {#custom-ordering-keys-without-refreshable-materialized-views}

如果由于数据规模原因可刷新的物化视图无法使用，您可以遵循以下几个建议，在较大的表上定义自定义排序键并克服与去重相关的问题。

### 选择对于给定行不会改变的排序键列 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

在 ClickHouse 的排序键中（除了 Postgres 的主键之外）包含额外列时，我们建议选择对于每行不会改变的列。这有助于防止使用 ReplacingMergeTree 时的数据一致性和去重问题。

例如，在一个多租户的 SaaS 应用中，使用 (`tenant_id`, `id`) 作为排序键是一个不错的选择。这些列唯一标识每一行，并且即使其他列改变，`tenant_id` 对于一个 `id` 仍然保持不变。由于通过 id 去重与通过 (tenant_id, id) 去重是一致的，这有助于避免由于 tenant_id 的变化而可能引发的数据 [去重问题](https://docs.peerdb.io/mirror/ordering-key-different)。

### 将 Postgres 表的副本身份设置为自定义排序键 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

为了使 Postgres CDC 按预期工作，重要的是要修改表上的 `REPLICA IDENTITY`，以包括排序键列。这对于准确处理 DELETE 操作至关重要。

如果 `REPLICA IDENTITY` 不包括排序键列，Postgres CDC 将无法捕获除主键以外的列的值——这是 Postgres 逻辑解码的一个限制。除 Postgres 中的主键外，所有排序键列将为 null。这会影响去重，意味着行的先前版本可能不会与最新的已删除版本（其中 `_peerdb_is_deleted` 设为 1）去重。

在上述 `owneruserid` 和 `id` 的示例中，如果主键未包含 `owneruserid`，则需要在 (`owneruserid`, `id`) 上拥有一个 `UNIQUE INDEX` 并将其设置为表的 `REPLICA IDENTITY`。这确保了 Postgres CDC 捕获必要的列值，以便进行准确的复制和去重。

下面是如何在事件表上执行此操作的示例。确保将其应用于所有修改过排序键的表。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
