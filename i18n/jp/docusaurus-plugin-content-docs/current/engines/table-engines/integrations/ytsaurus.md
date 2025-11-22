---
description: 'YTsaurus クラスターのデータをインポートできるテーブルエンジン。'
sidebar_label: 'YTsaurus'
sidebar_position: 185
slug: /engines/table-engines/integrations/ytsaurus
title: 'YTsaurus テーブルエンジン'
keywords: ['YTsaurus', 'table engine']
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# YTsaurus テーブルエンジン

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

YTsaurus テーブルエンジンを使用すると、YTsaurus クラスタからデータを取り込むことができます。



## テーブルの作成 {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = YTsaurus('http_proxy_url', 'cypress_path', 'oauth_token')
```

:::info
これは実験的機能であり、将来のリリースで後方互換性のない変更が行われる可能性があります。
YTsaurusテーブルエンジンを使用するには、設定[`allow_experimental_ytsaurus_table_engine`](/operations/settings/settings#allow_experimental_ytsaurus_table_engine)を有効にしてください。

以下のように設定します:

`SET allow_experimental_ytsaurus_table_engine = 1`.
:::

**エンジンパラメータ**

- `http_proxy_url` — YTsaurus HTTPプロキシのURL。
- `cypress_path` — データソースへのCypressパス。
- `oauth_token` — OAuthトークン。


## 使用例 {#usage-example}

YTsaurusテーブルを作成するクエリの例を示します：

```sql title="クエリ"
SHOW CREATE TABLE yt_saurus;
```

```sql title="レスポンス"
CREATE TABLE yt_saurus
(
    `a` UInt32,
    `b` String
)
ENGINE = YTsaurus('http://localhost:8000', '//tmp/table', 'password')
```

テーブルからデータを取得するには、次のクエリを実行します：

```sql title="クエリ"
SELECT * FROM yt_saurus;
```

```response title="レスポンス"
 ┌──a─┬─b──┐
 │ 10 │ 20 │
 └────┴────┘
```


## データ型 {#data-types}

### プリミティブデータ型 {#primitive-data-types}

| YTsaurusデータ型          | ClickHouseデータ型      |
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
| `date32`                    | `Date`(未サポート) |
| `datetime64`                | `Int64`                   |
| `timestamp64`               | `Int64`                   |
| `interval64`                | `Int64`                   |
| `date`                      | `Date`(未サポート) |
| `datetime`                  | `DateTime`                |
| `timestamp`                 | `DateTime64(6)`           |
| `interval`                  | `UInt64`                  |
| `any`                       | `String`                  |
| `null`                      | `Nothing`                 |
| `void`                      | `Nothing`                 |
| `T` with `required = False` | `Nullable(T)`             |

### 複合型 {#composite-data-types}

| YTsaurusデータ型 | ClickHouseデータ型 |
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
- [ytsaurusデータスキーマ](https://ytsaurus.tech/docs/en/user-guide/storage/static-schema)
- [ytsaurusデータ型](https://ytsaurus.tech/docs/en/user-guide/storage/data-types)
