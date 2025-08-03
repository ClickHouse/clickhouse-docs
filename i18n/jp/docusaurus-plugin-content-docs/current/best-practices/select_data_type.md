---
slug: '/best-practices/select-data-types'
sidebar_position: 10
sidebar_label: 'データ型を選択'
title: 'データ型を選択'
description: 'ClickHouse でデータ型を選択する方法を説明したページ'
---

import NullableColumns from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

One of the core reasons for ClickHouse's query performance is its efficient data compression. Less data on disk results in faster queries and inserts by minimizing I/O overhead. ClickHouse's column-oriented architecture naturally arranges similar data adjacently, enabling compression algorithms and codecs to reduce data size dramatically. To maximize these compression benefits, it's essential to carefully choose appropriate data types.

Compression efficiency in ClickHouse depends mainly on three factors: the ordering key, data types, and codecs, all defined through the table schema. Choosing optimal data types yields immediate improvements in both storage and query performance.

Some straightforward guidelines can significantly enhance the schema:

* **厳密な型を使用する:** 常にカラムに正しいデータ型を選択してください。数値および日付フィールドには、一般的な文字列型ではなく、適切な数値および日付型を使用する必要があります。これにより、フィルタリングや集計に対する正しい意味が確保されます。

* **Nullableカラムを避ける:** Nullableカラムは、null値を追跡するための別のカラムを維持することによる追加のオーバーヘッドを引き起こします。空とnullの状態を区別するために明示的に必要ない限り、Nullableを使用しないでください。それ以外の場合、デフォルト値やゼロ相当の値で通常は十分です。この型を必要に応じて避けるべき理由については、[Nullableカラムを避ける](/best-practices/select-data-types#avoid-nullable-columns)を参照してください。

* **数値精度を最小限に抑える:** 予想されるデータ範囲をまだ満たす最小のビット幅を持つ数値型を選択してください。たとえば、負の値が必要ない場合、[Int32の代わりにUInt16を選択する](/sql-reference/data-types/int-uint)ことをお勧めしますし、範囲が0〜65535に収まる場合に推奨されます。

* **日付および時間精度を最適化する:** クエリの要件を満たす最も粗い日付または日時型を選択してください。日付のみのフィールドにはDateまたはDate32を使用し、ミリ秒やそれ以上の精度が重要でない限り、DateTimeの代わりにDateTime64を使用してください。

* **LowCardinalityおよび特殊型を活用する:** 約10,000未満のユニーク値のカラムには、辞書エンコーディングを用いてストレージを大幅に削減するためにLowCardinality型を使用してください。同様に、カラム値が厳密に固定長の文字列である場合のみFixedStringを使用し、有限の値のセットを持つカラムにはEnum型を好んで使用して、効率的なストレージと組み込みのデータ検証を可能にします。

* **データ検証用のEnums:** Enum型は、列挙型を効率的にエンコードするために使用できます。Enumsは、保存する必要のあるユニーク値の数に応じて8ビットまたは16ビットとなります。挿入時の関連する検証が必要な場合（未宣言の値は拒否されます）や、Enum値の自然な順序を利用したクエリを実行したい場合には、これを使用することを検討してください。例として、ユーザーの反応を含むフィードバックカラムEnum(':(' = 1, ':|' = 2, ':)' = 3)を想像してください。

## 例 {#example}

ClickHouseは、型の最適化を簡素化するための組み込みツールを提供しています。たとえば、スキーマ推論は最初の型を自動的に特定できます。Parquet形式で公開されているStack Overflowデータセットを考慮してください。[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使用して簡単なスキーマ推論を実行すると、初期の最適化されていないスキーマが提供されます。

:::note
デフォルトでは、ClickHouseはこれを同等のNullable型にマッピングします。これは、スキーマが行のサンプルに基づいているため、推奨されます。
:::

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name───────────────────────┬─type──────────────────────────────┐
│ Id                         │ Nullable(Int64)                   │
│ PostTypeId                 │ Nullable(Int64)                   │
│ AcceptedAnswerId           │ Nullable(Int64)                   │
│ CreationDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ Score                      │ Nullable(Int64)                   │
│ ViewCount                  │ Nullable(Int64)                   │
│ Body                       │ Nullable(String)                  │
│ OwnerUserId                │ Nullable(Int64)                   │
│ OwnerDisplayName           │ Nullable(String)                  │
│ LastEditorUserId           │ Nullable(Int64)                   │
│ LastEditorDisplayName      │ Nullable(String)                  │
│ LastEditDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ LastActivityDate           │ Nullable(DateTime64(3, 'UTC'))    │
│ Title                      │ Nullable(String)                  │
│ Tags                       │ Nullable(String)                  │
│ AnswerCount                │ Nullable(Int64)                   │
│ CommentCount               │ Nullable(Int64)                   │
│ FavoriteCount              │ Nullable(Int64)                   │
│ ContentLicense             │ Nullable(String)                  │
│ ParentId                   │ Nullable(String)                  │
│ CommunityOwnedDate         │ Nullable(DateTime64(3, 'UTC'))    │
│ ClosedDate                 │ Nullable(DateTime64(3, 'UTC'))    │
└────────────────────────────┴───────────────────────────────────┘

22 rows in set. Elapsed: 0.130 sec.
```

:::note
以下に、stackoverflow/parquet/postsフォルダー内のすべてのファイルを読み込むためにグロブパターン*.parquetを使用しています。
:::

初期のシンプルなルールをpostsテーブルに適用することで、各カラムに最適な型を特定できます：

| Column                  | Is Numeric | Min, Max                                                              | Unique Values | Nulls | Comment                                                                                      | Optimized Type                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | Yes        | 1, 8                                                                   | 8              | No     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | Yes        | 0, 78285170                                                            | 12282094       | Yes    | Nullを0の値と区別する                                                                    | UInt32                                   |
| `CreationDate`           | No         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | No     | ミリ秒単位の精度は不要、DateTimeを使用                                                    | DateTime                                 |
| `Score`                  | Yes        | -217, 34970                                                            | 3236           | No     |                                                                                              | Int32                                    |
| `ViewCount`              | Yes        | 2, 13962748                                                            | 170867         | No     |                                                                                              | UInt32                                   |
| `Body`                   | No         | -                                                                      | -              | No     |                                                                                              | String                                   |
| `OwnerUserId`            | Yes        | -1, 4056915                                                            | 6256237        | Yes    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | No         | -                                                                      | 181251         | Yes    | Nullは空文字列と見なす                                                                       | String                                   |
| `LastEditorUserId`       | Yes        | -1, 9999993                                                            | 1104694        | Yes    | 0は使われていない値でNullに使用可能                                                      | Int32                                    |
| `LastEditorDisplayName`  | No         | -                                                                      | 70952          | Yes    | Nullは空文字列として見なす。LowCardinalityを試したが利益なし                                          | String                                   |
| `LastEditDate`           | No         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | No     | ミリ秒単位の精度は不要、DateTimeを使用                                                    | DateTime                                 |
| `LastActivityDate`       | No         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | No     | ミリ秒単位の精度は不要、DateTimeを使用                                                    | DateTime                                 |
| `Title`                  | No         | -                                                                      | -              | No     | Nullは空文字列として見なす                                                                   | String                                   |
| `Tags`                   | No         | -                                                                      | -              | No     | Nullは空文字列として見なす                                                                   | String                                   |
| `AnswerCount`            | Yes        | 0, 518                                                                 | 216            | No     | Nullと0は同一扱い                                                                             | UInt16                                   |
| `CommentCount`           | Yes        | 0, 135                                                                 | 100            | No     | Nullと0は同一扱い                                                                             | UInt8                                    |
| `FavoriteCount`          | Yes        | 0, 225                                                                 | 6              | Yes    | Nullと0は同一扱い                                                                             | UInt8                                    |
| `ContentLicense`         | No         | -                                                                      | 3              | No     | LowCardinalityがFixedStringよりも優れています                                                       | LowCardinality(String)                   |
| `ParentId`               | No         | -                                                                      | 20696028       | Yes    | Nullは空文字列として見なす                                                                   | String                                   |
| `CommunityOwnedDate`     | No         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | Yes    | Nullの場合はデフォルト1970-01-01を考慮。ミリ秒単位の精度は不要、DateTimeを使用                       | DateTime                                 |
| `ClosedDate`             | No         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | Yes    | Nullの場合はデフォルト1970-01-01を考慮。ミリ秒単位の精度は不要、DateTimeを使用                       | DateTime                                 |

:::note tip
カラムの型を特定するには、その数値範囲とユニーク値の数を理解することが必要です。すべてのカラムの範囲および異なる値の数を見つけるには、ユーザーはシンプルなクエリ`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。これをデータの少ないサブセットに対して実行することをお勧めします。これは高コストです。
:::

これにより、次のような最適化されたスキーマが得られます（型に関して）：

```sql
CREATE TABLE posts
(
   Id Int32,
   PostTypeId Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 
   'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   AcceptedAnswerId UInt32,
   CreationDate DateTime,
   Score Int32,
   ViewCount UInt32,
   Body String,
   OwnerUserId Int32,
   OwnerDisplayName String,
   LastEditorUserId Int32,
   LastEditorDisplayName String,
   LastEditDate DateTime,
   LastActivityDate DateTime,
   Title String,
   Tags String,
   AnswerCount UInt16,
   CommentCount UInt8,
   FavoriteCount UInt8,
   ContentLicense LowCardinality(String),
   ParentId String,
   CommunityOwnedDate DateTime,
   ClosedDate DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

## Nullableカラムを避ける {#avoid-nullable-columns}

<NullableColumns />
