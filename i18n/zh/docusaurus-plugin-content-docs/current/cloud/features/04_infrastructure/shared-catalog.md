---
slug: /cloud/reference/shared-catalog
sidebar_label: '共享目录'
title: '共享目录和共享数据库引擎'
keywords: ['SharedCatalog', 'SharedDatabaseEngine']
description: '介绍 ClickHouse Cloud 中的 Shared Catalog 组件和 Shared 数据库引擎'
doc_type: 'reference'
---



# 共享目录和共享数据库引擎 {#shared-catalog-and-shared-database-engine}

**仅在 ClickHouse Cloud(及第一方合作伙伴云服务)中可用**

Shared Catalog 是一个云原生组件,负责在 ClickHouse Cloud 的副本间复制使用无状态引擎的数据库和表的元数据及 DDL 操作。它为这些对象提供一致且集中的状态管理,确保即使在动态或部分离线的环境中也能保持元数据一致性。

Shared Catalog **不复制表本身**,而是通过复制 DDL 查询和元数据来确保所有副本对数据库和表定义保持一致的视图。

它支持复制以下数据库引擎:

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog


## 架构与元数据存储 {#architecture-and-metadata-storage}

共享目录中的所有元数据和 DDL 查询历史均集中存储在 ZooKeeper 中。本地磁盘不会持久化任何数据。这种架构确保:

- 所有副本间的状态一致性
- 计算节点的无状态特性
- 快速可靠的副本启动


## Shared 数据库引擎 {#shared-database-engine}

**Shared 数据库引擎**与 Shared Catalog 协同工作,用于管理使用**无状态表引擎**(如 `SharedMergeTree`)的数据库。这些表引擎不会将持久化状态写入磁盘,适用于动态计算环境。

Shared 数据库引擎基于 Replicated 数据库引擎构建并进行了改进,提供了额外的保障和运维优势。

### 主要优势 {#key-benefits}

- **原子性 CREATE TABLE ... AS SELECT**
  表创建和数据插入以原子方式执行——要么整个操作完成,要么表完全不会被创建。

- **跨数据库 RENAME TABLE**
  支持在数据库之间原子性地移动表:

  ```sql
  RENAME TABLE db1.table TO db2.table;
  ```

- **使用 UNDROP TABLE 自动恢复表**
  已删除的表默认保留 8 小时,可以恢复:

  ```sql
  UNDROP TABLE my_table;
  ```

  保留时间窗口可通过服务器设置进行配置。

- **改进的计算层分离**
  与 Replicated 数据库引擎不同(需要所有副本在线才能处理 DROP 查询),Shared Catalog 执行集中式元数据删除。这使得即使部分副本离线,操作也能成功执行。

- **自动元数据复制**
  Shared Catalog 确保数据库定义在启动时自动复制到所有服务器。运维人员无需在新实例上手动配置或同步元数据。

- **集中式版本化元数据状态**
  Shared Catalog 在 ZooKeeper 中存储单一可信数据源。当副本启动时,它会获取最新状态并应用差异以达到一致性。在查询执行期间,系统可以等待其他副本至少达到所需的元数据版本,以确保正确性。


## 在 ClickHouse Cloud 中使用 {#usage-in-clickhouse-cloud}

对于最终用户,使用 Shared Catalog 和 Shared 数据库引擎无需额外配置。数据库的创建方式与以往相同:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud 会自动为数据库分配 Shared 数据库引擎。在此类数据库中使用无状态引擎创建的任何表都将自动获得 Shared Catalog 的复制和协调功能。


## 概述 {#summary}

Shared Catalog 和 Shared 数据库引擎提供以下能力:

- 为无状态引擎提供可靠的自动元数据复制
- 无本地元数据持久化的无状态计算
- 复杂 DDL 的原子操作
- 增强对弹性、临时或部分离线计算环境的支持
- 为 ClickHouse Cloud 用户提供无缝使用体验

这些能力使 Shared Catalog 成为 ClickHouse Cloud 中可扩展的云原生元数据管理基础。
