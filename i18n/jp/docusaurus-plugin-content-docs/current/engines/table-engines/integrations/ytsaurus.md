---
'description': 'テーブルエンジンで、YTsaurus クラスターからデータをインポートすることができます。'
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

YTsaurus テーブルエンジンを使用すると、YTsaurus クラスターからデータをインポートできます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
これは実験的な機能であり、将来のリリースでは後方互換性のない方法で変更される可能性があります。
[`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 設定を使用して YTsaurus テーブルエンジンの使用を有効にします。

次のように設定できます:

`SET allow_experimental_ytsaurus_table_engine = 1`。
:::

**エンジンパラメータ**

- `http_proxy_url` — YTsaurus HTTP プロキシへの URL。
- `cypress_path` — データソースへの Cypress パス。
- `oauth_token` — OAuth トークン。

## 使用例 {#usage-example}

YTsaurus テーブルを作成するクエリを示します:

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

テーブルからデータを返すには、次のように実行します:

```sql title="Query"
SELECT * FROM yt_saurus;
```

```response title="Response"
┌──a─┬─b──┐
│ 10 │ 20 │
└────┴────┘
```

## データ型 {#data-types}

### 原始データ型 {#primitive-data-types}

| YTsaurus データ型   | Clickhouse データ型       |
| ------------------ | ----------------------- |
| `int8`             | `Int8`                  |
| `int16`            | `Int16`                 |
| `int32`            | `Int32`                 |
| `int64`            | `Int64`                 |
| `uint8`            | `UInt8`                 |
| `uint16`           | `UInt16`                |
| `uint32`           | `UInt32`                |
| `uint64`           | `UInt64`                |
| `float`            | `Float32`               |
| `double`           | `Float64`               |
| `boolean`          | `Bool`                  |
| `string`           | `String`                |
| `utf8`             | `String`                |
| `json`             | `JSON`                  |
| `yson(type_v3)`    | `JSON`                  |
| `uuid`             | `UUID`                  |
| `date32`           | `Date`(未対応)          |
| `datetime64`       | `Int64`                 |
| `timestamp64`      | `Int64`                 |
| `interval64`       | `Int64`                 |
| `date`             | `Date`(未対応)          |
| `datetime`         | `DateTime`              |
| `timestamp`        | `DateTime64(6)`         |
| `interval`         | `UInt64`                |
| `any`              | `String`                |
| `null`             | `Nothing`               |
| `void`             | `Nothing`               |
| `T` with `required = False`| `Nullable(T)`   |

### 複合型 {#composite-data-types}

| YTsaurus データ型   | Clickhouse データ型       |
| ------------------ | -------------------- |
| `decimal`          | `Decimal`            |
| `optional`         | `Nullable`           |
| `list`             | `Array`              |
| `struct`           | `NamedTuple`         |
| `tuple`            | `Tuple`              |
| `variant`          | `Variant`            |
| `dict`             | `Array(Tuple(...))`  |
| `tagged`           | `T`                  |

**関連情報**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) テーブル関数
- [ytsaurus データスキーマ](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurus データ型](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
