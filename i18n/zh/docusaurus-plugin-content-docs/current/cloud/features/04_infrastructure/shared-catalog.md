---
slug: /cloud/reference/shared-catalog
sidebar_label: '共享目录'
title: '共享目录与共享数据库引擎'
keywords: ['SharedCatalog', 'SharedDatabaseEngine']
description: '描述 ClickHouse Cloud 中的 Shared Catalog 组件和 Shared 数据库引擎'
doc_type: 'reference'
---

# 共享目录和共享数据库引擎 {#shared-catalog-and-shared-database-engine}

**仅在 ClickHouse Cloud（以及官方一方合作云服务）中提供**

Shared Catalog 是一个云原生组件，负责在 ClickHouse Cloud 中跨副本复制使用无状态引擎的数据库和表的元数据与 DDL 操作。它为这些对象提供一致、集中的状态管理，即使在动态或部分离线的环境中也能确保元数据的一致性。

Shared Catalog **不会复制表中的数据本身**，而是通过复制 DDL 查询和元数据来确保所有副本对数据库和表定义拥有一致的视图。

它支持以下数据库引擎的复制：

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## 架构与元数据存储 {#architecture-and-metadata-storage}

Shared Catalog 中的所有元数据和 DDL 查询历史记录都集中存储在 ZooKeeper 中，本地磁盘上不会持久化任何数据。此架构可确保：

- 所有副本之间状态一致
- 计算节点保持无状态
- 副本能够快速、可靠地启动和初始化

## 共享数据库引擎 {#shared-database-engine}

**共享数据库引擎（Shared database engine）** 与 Shared Catalog 协同工作，用于管理其中的表使用诸如 `SharedMergeTree` 之类**无状态表引擎（stateless table engines）** 的数据库。这些表引擎不会将持久状态写入磁盘，并且兼容动态计算环境。

共享数据库引擎在 Replicated database engine 的基础上进行了扩展和改进，同时提供了额外的保障和运维优势。

### 主要优势 {#key-benefits}

- **原子执行 CREATE TABLE ... AS SELECT**
  表的创建和数据插入以原子方式执行——要么整个操作完成，要么表根本不会被创建。

- **在数据库之间执行 RENAME TABLE**
  支持在数据库之间以原子方式移动表：
  ```sql
  RENAME TABLE db1.table TO db2.table;
  ```

- **使用 UNDROP TABLE 的自动表恢复**
  被删除的表会默认保留 8 小时，可以恢复：
  ```sql
  UNDROP TABLE my_table;
  ```
  保留时间窗口可以通过服务器设置进行配置。

- **改进的计算节点间解耦**
  与需要所有副本在线才能处理 DROP 查询的 Replicated database engine 不同，Shared Catalog 执行集中式元数据删除。这使得即使某些副本离线，操作也能成功。

- **自动元数据复制**
  Shared Catalog 确保数据库定义在启动时会自动复制到所有服务器。运维人员无需在新实例上手动配置或同步元数据。

- **集中、版本化的元数据状态**
  Shared Catalog 在 ZooKeeper 中存储单一事实来源（single source of truth）。当副本启动时，它会获取最新状态并应用差异以实现一致性。在查询执行期间，系统可以等待其他副本至少达到所需的元数据版本，以确保正确性。

## 在 ClickHouse Cloud 中的使用 {#usage-in-clickhouse-cloud}

对于终端用户而言，使用 Shared Catalog 和 Shared 数据库引擎无需任何额外配置。数据库的创建方式与以往完全相同：

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud 会自动为数据库分配 Shared 数据库引擎。在此类数据库中创建的、使用无状态引擎的任意表，都将自动具备 Shared Catalog 的复制与协调能力。

## 概要 {#summary}

Shared Catalog 和 Shared 数据库引擎具备以下特性：

- 为无状态引擎提供可靠、自动的元数据复制
- 无本地元数据持久化的无状态计算
- 针对复杂 DDL 的原子性操作
- 对弹性、短暂存在或部分离线计算环境的更好支持
- 为 ClickHouse Cloud 用户提供无缝使用体验

这些能力使 Shared Catalog 成为在 ClickHouse Cloud 中实现可扩展、云原生元数据管理的基础。
