---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: 'データ型の選択'
title: 'データ型の選択'
description: 'ClickHouseでデータ型を選ぶ方法を説明するページ'
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouseのクエリ性能の主要な理由の一つは、その効率的なデータ圧縮です。ディスク上のデータが少ないほど、I/Oオーバーヘッドを最小限に抑えて、クエリと挿入をより迅速に行うことができます。ClickHouseの列指向アーキテクチャは、類似のデータを隣接して自然に配置するため、圧縮アルゴリズムやコーデックがデータサイズを劇的に削減することができます。これらの圧縮メリットを最大化するためには、適切なデータ型を慎重に選ぶことが不可欠です。

ClickHouseにおける圧縮効率は主に三つの要因に依存しています。すなわち、オーダリングキー、データ型、コーデックであり、すべてテーブルスキーマを通じて定義されます。最適なデータ型を選ぶことで、ストレージとクエリ性能の両方で即座に改善が得られます。

以下のいくつかの簡単なガイドラインに従うことで、スキーマを大幅に向上させることができます：

* **厳密な型を使用する:** 常にカラムに対して正しいデータ型を選択してください。数値および日付フィールドには、汎用のString型ではなく、適切な数値型と日付型を使用してください。これにより、フィルタリングや集約のための正しい意味論が保証されます。

* **Nullableカラムを避ける:** Nullableカラムはnull値を追跡するために別のカラムを維持することで追加のオーバーヘッドを導入します。空とnullの状態を区別するために明示的に必要とされる場合を除き、Nullableを使用しないでください。そうでない場合、デフォルト値やゼロに相当する値で通常は十分です。このタイプは、必要な場合を除いて避けるべき理由については、[Nullableカラムを避ける](/best-practices/select-data-types#avoid-nullable-columns)を参照してください。

* **数値精度を最小限に抑える:** 期待されるデータ範囲にまだ収まる最小ビット幅の数値型を選択します。例えば、負の値が必要ない場合は、[UInt16をInt32より優先する](/sql-reference/data-types/int-uint)ことを推奨します。

* **日付と時間の精度を最適化する:** クエリ要件を満たす最も粗い日付または日時型を選択してください。日付のみのフィールドにはDateまたはDate32を使用し、ミリ秒以上の精度が重要でない限り、DateTime48よりDateTimeを好むべきです。

* **LowCardinality と特化型を活用する:** 約10,000未満のユニーク値を持つカラムについては、辞書エンコーディングを使用してストレージを大幅に削減するためにLowCardinality型を使用してください。同様に、カラムの値が厳密に固定長の文字列（例：国コードや通貨コード）である場合のみ、FixedStringを使用し、有限の値セットを持つカラムにはEnum型を優先して使用することで、効率的なストレージと組み込みのデータバリデーションを実現します。

* **データバリデーション用のEnum:** Enum型を使用すると、列挙型を効率的にエンコードできます。Enumはストアすべきユニークな値の数に応じて、8ビットまたは16ビットのいずれかにすることができます。挿入時に関連するバリデーションが必要である場合（宣言されていない値は拒否されます）や、Enum値の自然順序を利用するクエリを実行したい場合は、これを使用することを検討してください。例えば、ユーザーの反応を含むフィードバックカラムを考えてみてください。Enum(':(' = 1, ':|' = 2, ':)' = 3)のようになります。

## 例 {#example}

ClickHouseは、型の最適化を効率化するための組み込みツールを提供しています。例えば、スキーマ推測は初期型を自動的に特定できます。Stack Overflowデータセットを考慮してください。これはParquetフォーマットで公に利用可能です。[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使用して簡単なスキーマ推測を実行すると、初期の最適化されていないスキーマが提供されます。

:::note
デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。これはスキーマが行のサンプルに基づいているため、優先されます。
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

22行が設定されました。経過時間: 0.130秒
```

:::note
以下に示すように、*.parquetというグロブパターンを使用して、stackoverflow/parquet/postsフォルダー内のすべてのファイルを読み取ります。
:::

投稿テーブルにこれらの初期の簡単なルールを適用することにより、各カラムに対して最適な型を特定できます：

| カラム                    | 数値型 | 最小, 最大                                                       | ユニーク値 | Nulls | コメント                                                                                      | 最適化された型                           |
|------------------------|--------|-----------------------------------------------------------|------------|-------|---------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | はい    | 1, 8                                                        | 8          | いいえ  |                                                                                             | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい    | 0, 78285170                                                 | 12282094   | はい    | Nullを0値と区別                                                                               | UInt32                                   |
| `CreationDate`           | いいえ   | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | -          | いいえ  | ミリ秒の精度は必要ないため、DateTimeを使用                                                  | DateTime                                 |
| `Score`                  | はい    | -217, 34970                                                | 3236       | いいえ  |                                                                                             | Int32                                    |
| `ViewCount`              | はい    | 2, 13962748                                                | 170867     | いいえ  |                                                                                             | UInt32                                   |
| `Body`                   | いいえ   | -                                                          | -          | いいえ  |                                                                                             | String                                   |
| `OwnerUserId`            | はい    | -1, 4056915                                                | 6256237    | はい    |                                                                                             | Int32                                    |
| `OwnerDisplayName`       | いいえ   | -                                                          | 181251     | はい    | Nullを空文字列と見なしてください                                                        | String                                   |
| `LastEditorUserId`       | はい    | -1, 9999993                                               | 1104694    | はい    | 0は未使用の値のため、Nullに使用される                                                       | Int32                                    |
| `LastEditorDisplayName`  | いいえ   | -                                                          | 70952      | はい    | Nullを空文字列と見なしてください。LowCardinalityを試し、効果がなかった                       | String                                   |
| `LastEditDate`           | いいえ   | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -          | いいえ  | ミリ秒の精度は必要ないため、DateTimeを使用                                                  | DateTime                                 |
| `LastActivityDate`       | いいえ   | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | -          | いいえ  | ミリ秒の精度は必要ないため、DateTimeを使用                                                  | DateTime                                 |
| `Title`                  | いいえ   | -                                                          | -          | いいえ  | Nullを空文字列と見なしてください                                                       | String                                   |
| `Tags`                   | いいえ   | -                                                          | -          | いいえ  | Nullを空文字列と見なしてください                                                       | String                                   |
| `AnswerCount`            | はい    | 0, 518                                                    | 216        | いいえ  | Nullと0を同じと見なす                                                                        | UInt16                                   |
| `CommentCount`           | はい    | 0, 135                                                    | 100        | いいえ  | Nullと0を同じと見なす                                                                        | UInt8                                    |
| `FavoriteCount`          | はい    | 0, 225                                                    | 6          | はい    | Nullと0を同じと見なす                                                                        | UInt8                                    |
| `ContentLicense`         | いいえ   | -                                                          | 3          | いいえ  | LowCardinalityはFixedStringより優れています                                                | LowCardinality(String)                   |
| `ParentId`               | いいえ   | -                                                          | 20696028   | はい    | Nullを空文字列と見なしてください                                                       | String                                   |
| `CommunityOwnedDate`     | いいえ   | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -          | はい    | Nullにはデフォルト1970-01-01を考慮。ミリ秒の精度は必要ないため、DateTimeを使用                | DateTime                                 |
| `ClosedDate`             | いいえ   | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000          | -          | はい    | Nullにはデフォルト1970-01-01を考慮。ミリ秒の精度は必要ないため、DateTimeを使用                | DateTime                                 |

:::note tip
カラムの型を特定するには、その数値範囲とユニーク値の数を理解することが重要です。すべてのカラムの範囲と異なる値の数を見つけるには、ユーザーはシンプルなクエリ`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。このクエリは、高コストになり得るため、データの小さなサブセットでの実行を推奨します。
:::

これにより、以下のような最適化されたスキーマが得られます（型を考慮）：

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
