---
'description': '表引擎，允许从 YTsaurus 集群导入数据。'
'sidebar_label': 'YTsaurus'
'sidebar_position': 185
'slug': '/engines/table-engines/integrations/ytsaurus'
'title': 'YTsaurus'
'keywords':
- 'YTsaurus'
- 'table engine'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# YTsaurus

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

YTsaurus 表引擎允许您从 YTsaurus 集群导入数据。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
这是一个实验性功能，未来版本可能以向后不兼容的方式更改。
启用 YTsaurus 表引擎的使用
使用设置 [`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine)。

您可以通过以下方式进行设置：

`SET allow_experimental_ytsaurus_table_engine = 1`。
:::

**引擎参数**

- `http_proxy_url` — YTsaurus http 代理的 URL。
- `cypress_path` — 数据源的 Cypress 路径。
- `oauth_token` — OAuth 令牌。

## 使用示例 {#usage-example}

显示创建 YTsaurus 表的查询：

```sql title="Query"
SHOW CREATE TABLE yt_saurus;
```

```sql title="Response"
CREATE TABLE yt_saurus
(
    `a` UInt32,
    `b` String
)
ENGINE = YTsaurus('http://localhost:8000', '//tmp/table', 'password')
```

要从表中返回数据，请运行：

```sql title="Query"
SELECT * FROM yt_saurus;
```

```response title="Response"
┌──a─┬─b──┐
│ 10 │ 20 │
└────┴────┘
```

## 数据类型 {#data-types}

### 原始数据类型 {#primitive-data-types}

| YTsaurus 数据类型 | Clickhouse 数据类型   |
| ------------------ | ---------------------- |
| `int8`             | `Int8`                 |
| `int16`            | `Int16`                |
| `int32`            | `Int32`                |
| `int64`            | `Int64`                |
| `uint8`           | `UInt8`                |
| `uint16`          | `UInt16`               |
| `uint32`          | `UInt32`               |
| `uint64`          | `UInt64`               |
| `float`           | `Float32`              |
| `double`          | `Float64`              |
| `boolean`         | `Bool`                 |
| `string`          | `String`               |
| `utf8`            | `String`               |
| `json`            | `JSON`                 |
| `yson(type_v3)`   | `JSON`                 |
| `uuid`            | `UUID`                 |
| `date32`          | `Date`(尚不支持)       |
| `datetime64`      | `Int64`                |
| `timestamp64`     | `Int64`                |
| `interval64`      | `Int64`                |
| `date`            | `Date`(尚不支持)       |
| `datetime`        | `DateTime`             |
| `timestamp`       | `DateTime64(6)`        |
| `interval`        | `UInt64`               |
| `any`             | `String`               |
| `null`            | `Nothing`              |
| `void`            | `Nothing`              |
| `T` 和 `required = False`  | `Nullable(T)` |

### 复合类型 {#composite-data-types}

| YTsaurus 数据类型 | Clickhouse 数据类型 |
| ------------------ | ------------------- |
| `decimal`          | `Decimal`           |
| `optional`         | `Nullable`          |
| `list`             | `Array`             |
| `struct`           | `NamedTuple`        |
| `tuple`            | `Tuple`             |
| `variant`          | `Variant`           |
| `dict`             | `Array(Tuple(...))  |
| `tagged`           | `T`                 |

**另见**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) 表函数
- [ytsaurus 数据模式](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurus 数据类型](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
