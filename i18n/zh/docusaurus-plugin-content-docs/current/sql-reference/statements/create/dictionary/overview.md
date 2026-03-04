---
description: '用于说明如何创建和配置字典的文档'
sidebar_label: '概览'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import CloudSupportedBadge from '@theme/badges/CloudSupportedBadge';


# CREATE DICTIONARY \{#create-dictionary\}

字典是一种映射（`key -> attributes`），便于维护各种类型的参考数据列表。
ClickHouse 支持用于操作字典的特殊函数，这些函数可以在查询中使用。与对参考表执行 `JOIN` 相比，结合函数使用字典更加简单且高效。

可以通过两种方式创建字典：

- [使用 DDL 查询](#creating-a-dictionary-with-a-ddl-query)（推荐）
- [使用配置文件](#creating-a-dictionary-with-a-configuration-file)

## 使用 DDL 查询创建字典 \{#creating-a-dictionary-with-a-ddl-query\}

<CloudSupportedBadge/>

可以通过 DDL 查询创建字典。  
这是推荐的方法，因为以 DDL 方式创建的字典具有以下优点：

- 无需在服务器配置文件中添加额外记录。
- 字典可以像表或视图等一等对象一样使用。
- 可以使用熟悉的 `SELECT` 语法直接读取数据，而无需通过字典表函数。请注意，当通过 `SELECT` 语句直接访问字典时，对于启用缓存的字典，仅会返回缓存中的数据；而对于未启用缓存的字典，则会返回其存储的全部数据。
- 可以轻松重命名字典。

### 语法 \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1  type1  [DEFAULT | EXPRESSION expr1] [IS_OBJECT_ID],
    key2  type2  [DEFAULT | EXPRESSION expr2],
    attr1 type2  [DEFAULT | EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2  [DEFAULT | EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

| Clause                                      | Description                                |
| ------------------------------------------- | ------------------------------------------ |
| [Attributes](./attributes.md)               | 字典属性的指定方式与表的列类似。唯一必需的属性是类型，其他属性都可以使用默认值。   |
| PRIMARY KEY                                 | 为字典查询定义键列。根据布局，可以将一个或多个属性指定为键。             |
| [`SOURCE`](./sources/overview.md)           | 定义字典的数据源（例如 ClickHouse 表、HTTP、PostgreSQL）。 |
| [`LAYOUT`](./layouts/overview.md)           | 控制字典在内存中的存储方式（例如 `FLAT`、`HASHED`、`CACHE`）。 |
| [`LIFETIME`](./lifetime.md)                 | 设置字典的刷新间隔。                                 |
| [`ON CLUSTER`](../../../distributed-ddl.md) | 在集群上创建字典。可选。                               |
| `SETTINGS`                                  | 字典的附加设置。可选。                                |
| `COMMENT`                                   | 为字典添加文本注释。可选。                              |


## 使用配置文件创建字典 \{#creating-a-dictionary-with-a-configuration-file\}

<CloudNotSupportedBadge />

:::note
在 ClickHouse Cloud 中不支持使用配置文件创建字典。请使用 DDL（见上文），并使用 `default` 用户创建字典。
:::

字典配置文件的格式如下：

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

可以在同一个文件中配置任意数量的字典。


## 相关内容 \{#related-content\}

- [Layouts](/sql-reference/statements/create/dictionary/layouts) — 字典在内存中的存储方式
- [Sources](/sql-reference/statements/create/dictionary/sources) — 连接到数据源
- [Lifetime](./lifetime.md) — 自动刷新设置
- [Attributes](./attributes.md) — 键与属性配置
- [Embedded Dictionaries](./embedded.md) — 内置地理位置字典
- [system.dictionaries](../../../../operations/system-tables/dictionaries.md) — 包含字典信息的系统表