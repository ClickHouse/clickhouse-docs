---
description: '本页介绍 `Shared` 数据库引擎，该引擎可在 ClickHouse Cloud 中使用'
sidebar_label: 'Shared'
sidebar_position: 10
slug: /engines/database-engines/shared
title: 'Shared'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# Shared 数据库引擎 \{#shared-database-engine\}

`Shared` 数据库引擎与 Shared Catalog 配合使用，用于管理其表使用无状态表引擎（例如 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)）的数据库。
这些表引擎不会将任何持久化状态写入磁盘，并且与动态计算环境兼容。

Cloud 中的 `Shared` 数据库引擎消除了对本地磁盘的依赖。
它是一个纯内存引擎，只需要 CPU 和内存。

## 工作原理 \{#how-it-works\}

`Shared` 数据库引擎将所有数据库和表定义存储在一个由 Keeper 作为后端的集中式 Shared Catalog 中。它不再写入本地磁盘，而是维护一个在所有计算节点之间共享的、带版本控制的全局状态。

每个节点只跟踪最近一次应用的版本，并在启动时获取最新状态，无需本地文件或手动设置。

## 语法 \{#syntax\}

对于最终用户而言，使用 Shared Catalog 和 Shared 数据库引擎无需任何额外配置。数据库的创建方式与以往完全相同：

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud 会自动将 Shared 数据库引擎分配给数据库。在此类数据库中使用无状态引擎创建的任何表，都将自动受益于 Shared Catalog 提供的复制和协调功能。

:::tip
有关 Shared Catalog 及其优势的更多信息，请参阅 Cloud 参考文档中的 [&quot;Shared catalog and shared database engine&quot;](/cloud/reference/shared-catalog)。
:::
