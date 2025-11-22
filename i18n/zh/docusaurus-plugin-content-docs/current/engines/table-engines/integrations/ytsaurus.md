---
description: '用于从 YTsaurus 集群导入数据的表引擎。'
sidebar_label: 'YTsaurus'
sidebar_position: 185
slug: /engines/table-engines/integrations/ytsaurus
title: 'YTsaurus 表引擎'
keywords: ['YTsaurus', '表引擎']
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# YTsaurus 表引擎

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

YTsaurus 表引擎可用于从 YTsaurus 集群导入数据。



## 创建表 {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
这是一个实验性功能,在未来版本中可能会以不向后兼容的方式发生变化。
通过设置 [`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 来启用 YTsaurus 表引擎。

您可以使用以下方式:

`SET allow_experimental_ytsaurus_table_engine = 1`.
:::

**引擎参数**

- `http_proxy_url` — YTsaurus HTTP 代理的 URL。
- `cypress_path` — 数据源的 Cypress 路径。
- `oauth_token` — OAuth 令牌。


## 使用示例 {#usage-example}

显示创建 YTsaurus 表的查询:

```sql title="查询"
SHOW CREATE TABLE yt_saurus;
```

```sql title="响应"
CREATE TABLE yt_saurus
(
    `a` UInt32,
    `b` String
)
ENGINE = YTsaurus('http://localhost:8000', '//tmp/table', 'password')
```

要从表中返回数据,请运行:

```sql title="查询"
SELECT * FROM yt_saurus;
```

```response title="响应"
 ┌──a─┬─b──┐
 │ 10 │ 20 │
 └────┴────┘
```


## 数据类型 {#data-types}

### 基础数据类型 {#primitive-data-types}

| YTsaurus 数据类型          | ClickHouse 数据类型      |
| --------------------------- | ------------------------- |
| `int8`                      | `Int8`                    |
| `int16`                     | `Int16`                   |
| `int32`                     | `Int32`                   |
| `int64`                     | `Int64`                   |
| `uint8`                     | `UInt8`                   |
| `uint16`                    | `UInt16`                  |
| `uint32`                    | `UInt32`                  |
| `uint64`                    | `UInt64`                  |
| `float`                     | `Float32`                 |
| `double`                    | `Float64`                 |
| `boolean`                   | `Bool`                    |
| `string`                    | `String`                  |
| `utf8`                      | `String`                  |
| `json`                      | `JSON`                    |
| `yson(type_v3)`             | `JSON`                    |
| `uuid`                      | `UUID`                    |
| `date32`                    | `Date`(暂不支持) |
| `datetime64`                | `Int64`                   |
| `timestamp64`               | `Int64`                   |
| `interval64`                | `Int64`                   |
| `date`                      | `Date`(暂不支持) |
| `datetime`                  | `DateTime`                |
| `timestamp`                 | `DateTime64(6)`           |
| `interval`                  | `UInt64`                  |
| `any`                       | `String`                  |
| `null`                      | `Nothing`                 |
| `void`                      | `Nothing`                 |
| `T` with `required = False` | `Nullable(T)`             |

### 复合数据类型 {#composite-data-types}

| YTsaurus 数据类型 | ClickHouse 数据类型 |
| ------------------ | -------------------- |
| `decimal`          | `Decimal`            |
| `optional`         | `Nullable`           |
| `list`             | `Array`              |
| `struct`           | `NamedTuple`         |
| `tuple`            | `Tuple`              |
| `variant`          | `Variant`            |
| `dict`             | `Array(Tuple(...))   |
| `tagged`           | `T`                  |

**另请参阅**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) 表函数
- [ytsaurus 数据架构](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurus 数据类型](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
