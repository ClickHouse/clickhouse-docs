---
description: '介绍 ClickHouse Cloud 中提供的 `Shared` 数据库引擎的页面'
sidebar_label: 'Shared'
sidebar_position: 10
slug: /engines/database-engines/shared
title: 'Shared'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />


# Shared 数据库引擎

`Shared` 数据库引擎与 Shared Catalog 配合使用，用于管理那些其表使用无状态表引擎（例如 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)）的数据库。
这类表引擎不会将任何持久状态写入磁盘，并且适用于动态计算环境。

Cloud 中的 `Shared` 数据库引擎消除了对本地磁盘的依赖。
它是一个纯内存型引擎，只需要 CPU 和内存。



## 它是如何工作的？ {#how-it-works}

`Shared` 数据库引擎将所有数据库和表定义存储在由 Keeper 支持的中央共享目录中。它不会写入本地磁盘，而是维护一个在所有计算节点之间共享的单一版本化全局状态。

每个节点仅跟踪最后应用的版本，并在启动时获取最新状态，无需本地文件或手动设置。


## 语法 {#syntax}

对于最终用户,使用 Shared Catalog 和 Shared 数据库引擎无需额外配置。数据库的创建方式与以往相同:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud 会自动为数据库分配 Shared 数据库引擎。在此类数据库中使用无状态引擎创建的任何表都将自动获得 Shared Catalog 的复制和协调能力。

:::tip
有关 Shared Catalog 及其优势的更多信息,请参阅 Cloud 参考部分中的["Shared catalog 和 shared database engine"](/cloud/reference/shared-catalog)。
:::
