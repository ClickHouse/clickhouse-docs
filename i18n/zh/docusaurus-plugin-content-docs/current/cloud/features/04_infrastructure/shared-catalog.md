---
'slug': '/cloud/reference/shared-catalog'
'sidebar_label': '共享目录'
'title': '共享目录和共享数据库引擎'
'keywords':
- 'SharedCatalog'
- 'SharedDatabaseEngine'
'description': '描述ClickHouse Cloud中的共享目录组件和共享数据库引擎'
'doc_type': 'reference'
---


# 共享目录和共享数据库引擎 {#shared-catalog-and-shared-database-engine}

**仅在 ClickHouse Cloud（和第一方合作伙伴云服务）中可用**

共享目录是一个云原生组件，负责在 ClickHouse Cloud 中跨副本复制使用无状态引擎的数据库和表的元数据和 DDL 操作。它为这些对象提供一致和集中化的状态管理，确保在动态或部分离线环境中元数据的一致性。

共享目录**不复制表本身**，而是通过复制 DDL 查询和元数据，确保所有副本对数据库和表定义的视图一致。

它支持以下数据库引擎的复制：

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## 架构和元数据存储 {#architecture-and-metadata-storage}

所有共享目录中的元数据和 DDL 查询历史都集中存储在 ZooKeeper 中。没有任何内容被保存在本地磁盘上。此架构确保：

- 所有副本之间的状态一致
- 计算节点的无状态性
- 快速、可靠的副本引导

## 共享数据库引擎 {#shared-database-engine}

**共享数据库引擎**与共享目录协同工作，以管理其表使用**无状态表引擎**（如 `SharedMergeTree`）的数据库。这些表引擎不会将持久状态写入磁盘，并且与动态计算环境兼容。

共享数据库引擎在 Replicated 数据库引擎的基础上构建并改善其行为，同时提供额外的保证和操作优势。

### 主要优势 {#key-benefits}

- **原子性 CREATE TABLE ... AS SELECT**
  表创建和数据插入是原子执行的——整个操作要么完成，要么表根本不创建。

- **在数据库之间重命名表**
  使得在数据库之间原子移动表成为可能：
```sql
RENAME TABLE db1.table TO db2.table;
```

- **通过 UNDROP TABLE 自动恢复表**
  被删除的表会在默认的 8 小时内保留，并可以恢复：
```sql
UNDROP TABLE my_table;
```
  保留窗口可通过服务器设置进行配置。

- **改善的计算-计算分离**
  不同于 Replicated 数据库引擎，它要求所有副本在线以处理 DROP 查询，共享目录执行集中元数据删除。这允许在有些副本离线时操作仍然成功。

- **自动元数据复制**
  共享目录确保数据库定义在启动时自动复制到所有服务器。操作员无需手动配置或同步新实例上的元数据。

- **集中、版本化的元数据状态**
  共享目录在 ZooKeeper 中存储唯一的真相源。当副本启动时，它获取最新状态并应用差异以达到一致性。在查询执行期间，系统可以等待其他副本达到至少所需版本的元数据以确保正确性。

## 在 ClickHouse Cloud 中的使用 {#usage-in-clickhouse-cloud}

对于最终用户，使用共享目录和共享数据库引擎无需额外配置。数据库创建与往常一样：

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud 自动将共享数据库引擎分配给数据库。在该数据库中使用无状态引擎创建的任何表将自动受益于共享目录的复制和协调能力。

## 摘要 {#summary}

共享目录和共享数据库引擎提供：

- 对无状态引擎的可靠和自动元数据复制
- 无本地元数据持久性的无状态计算
- 复杂 DDL 的原子操作
- 改进的对弹性、短暂或部分离线计算环境的支持
- ClickHouse Cloud 用户无缝使用

这些功能使得共享目录成为在 ClickHouse Cloud 中可扩展、云原生元数据管理的基础。
