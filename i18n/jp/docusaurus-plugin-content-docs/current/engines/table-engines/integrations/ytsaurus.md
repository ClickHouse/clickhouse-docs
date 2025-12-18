---
description: 'YTsaurus クラスターからデータを取り込むためのテーブルエンジン。'
sidebar_label: 'YTsaurus'
sidebar_position: 185
slug: /engines/table-engines/integrations/ytsaurus
title: 'YTsaurus テーブルエンジン'
keywords: ['YTsaurus', 'table engine']
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# YTsaurus テーブルエンジン {#ytsaurus-table-engine}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

YTsaurus テーブルエンジンを使用すると、YTsaurus クラスターからデータを取り込むことができます。

## テーブルの作成 {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない形で変更される可能性があります。
設定 [`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) を使用して、YTsaurus テーブルエンジンを有効にします。

次のように設定します。

`SET allow_experimental_ytsaurus_table_engine = 1`。
:::

**エンジンパラメータ**

* `http_proxy_url` — YTsaurus HTTP プロキシの URL。
* `cypress_path` — データソースへの Cypress パス。
* `oauth_token` — OAuth トークン。

## 使用例 {#usage-example}

YTsaurus テーブルを作成するクエリの例です。

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

テーブルのデータを取得するには、次を実行します。

```sql title="Query"
SELECT * FROM yt_saurus;
```

```response title="Response"
 ┌──a─┬─b──┐
 │ 10 │ 20 │
 └────┴────┘
```

## データ型 {#data-types}

### プリミティブ型 {#primitive-data-types}

| YTsaurus データ型 | ClickHouse データ型      |
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
| `date32`           | `Date`（まだサポートされていません）|
| `datetime64`       | `Int64`                 |
| `timestamp64`      | `Int64`                 |
| `interval64`       | `Int64`                 |
| `date`             | `Date`（まだサポートされていません）|
| `datetime`         | `DateTime`              |
| `timestamp`        | `DateTime64(6)`         |
| `interval`         | `UInt64`                |
| `any`              | `String`                |
| `null`             | `Nothing`               |
| `void`             | `Nothing`               |
| `T`（`required = False` の場合）| `Nullable(T)`   |

### 複合型 {#composite-data-types}

| YTsaurus データ型 | ClickHouse データ型 |
| ------------------ | -------------------- |
| `decimal`          | `Decimal`            |
| `optional`         | `Nullable`           |
| `list`             | `Array`              |
| `struct`           | `NamedTuple`         |
| `tuple`            | `Tuple`              |
| `variant`          | `Variant`            |
| `dict`             | `Array(Tuple(...))   |
| `tagged`           | `T`                  |

**関連項目**

- [ytsaurus](../../../sql-reference/table-functions/ytsaurus.md) テーブル関数
- [ytsaurus データスキーマ](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurus データ型](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
