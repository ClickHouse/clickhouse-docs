---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: 'データ型の選び方'
title: 'データ型の選び方'
description: 'ClickHouseで適切なデータ型を選択する方法を説明するページ'
keywords: ['data types']
doc_type: 'reference'
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse のクエリ性能を支える中核的な要因の 1 つは、効率的なデータ圧縮です。ディスク上のデータ量が少ないほど I/O のオーバーヘッドが減るため、クエリや挿入が高速になります。ClickHouse のカラム指向アーキテクチャでは、類似したデータが自然に隣接して配置されるため、圧縮アルゴリズムやコーデックによってデータサイズを大幅に削減できます。こうした圧縮の利点を最大化するには、適切なデータ型を慎重に選択することが不可欠です。

ClickHouse における圧縮効率は主に 3 つの要素、すなわち並び替えキー、データ型、コーデックに依存しており、これらはすべてテーブルスキーマで定義されます。最適なデータ型を選択することで、ストレージおよびクエリ性能の両方を即座に改善できます。

いくつかの単純なガイドラインに従うだけで、スキーマを大幅に改善できます。

* **厳密な型を使用する:** 常にカラムに対して正しいデータ型を選択してください。数値や日付のフィールドには、汎用的な String 型ではなく、適切な数値型や日付型を使用します。これにより、フィルタリングや集計において正しいセマンティクスが保証されます。

* **Nullable カラムを避ける:** Nullable カラムは、null 値を追跡するための別カラムを維持する必要があるため、追加のオーバーヘッドを発生させます。空と null の状態を明示的に区別する必要がある場合にのみ Nullable を使用してください。そうでなければ、デフォルト値やゼロ相当の値で十分なことがほとんどです。この型を必要な場合以外は避けるべき理由の詳細については、[Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns) を参照してください。

* **数値精度を最小化する:** 想定されるデータ範囲を表現できる範囲で、ビット幅が最小の数値型を選択してください。たとえば負の値が不要で、かつ範囲が 0–65535 に収まるのであれば、[Int32 よりも UInt16](/sql-reference/data-types/int-uint) を優先します。

* **日付と時刻の精度を最適化する:** クエリ要件を満たす中で、できる限り粒度の粗い日付または日時型を選択してください。日付のみのフィールドには Date または Date32 を使用し、ミリ秒以上の精度が本当に必要な場合を除き、DateTime64 よりも DateTime を優先します。

* **LowCardinality と特殊化された型を活用する:** 一意の値が概ね 1 万未満のカラムには、LowCardinality 型を使用して辞書エンコーディングによりストレージを大幅に削減します。同様に、カラム値が厳密に固定長の文字列（例: 国コードや通貨コード）の場合にのみ FixedString を使用し、取り得る値が有限集合に限られるカラムには Enum 型を優先して、効率的なストレージと組み込みのデータ検証を実現します。

* **データ検証のための Enum:** Enum 型は列挙型を効率的にエンコードするために使用できます。Enum は格納すべき一意の値の数に応じて 8 ビットまたは 16 ビットのいずれかです。挿入時の検証（宣言されていない値は拒否される）が必要な場合や、Enum 値の自然な順序付けを利用するクエリを実行したい場合には、これを使用することを検討してください。たとえば、ユーザーのフィードバックを格納するカラムがあり、値として Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3) を持つ状況を想像してみてください。


## 例 {#example}

ClickHouseは型最適化を効率化する組み込みツールを提供しています。例えば、スキーマ推論により初期型を自動的に識別できます。Parquet形式で公開されているStack Overflowデータセットを考えてみましょう。[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドで簡単なスキーマ推論を実行すると、最適化されていない初期スキーマが得られます。

:::note
デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。スキーマは行のサンプルのみに基づいているため、この動作が推奨されます。
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
以下では、stackoverflow/parquet/postsフォルダ内のすべてのファイルを読み取るためにglobパターン\*.parquetを使用しています。
:::

postsテーブルに初期の簡単なルールを適用することで、各カラムの最適な型を特定できます:


| カラム                     | 数値かどうかを判定 | 最小、最大                                                        | 一意値      | NULL | コメント                                                                           | 最適化型                                                                                                                                                         |
| ----------------------- | --------- | ------------------------------------------------------------ | -------- | ---- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい        | 1, 8                                                         | 8        | いいえ  |                                                                                | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい        | 0, 78285170                                                  | 12282094 | はい   | NULL と 0 を区別する                                                                 | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ       | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ  | ミリ秒精度が不要な場合は、DateTime を使用                                                      | DateTime                                                                                                                                                     |
| `Score`                 | はい        | -217, 34970                                                  | 3236     | いいえ  |                                                                                | Int32                                                                                                                                                        |
| `ViewCount`             | はい        | 2, 13962748                                                  | 170867   | いいえ  |                                                                                | UInt32                                                                                                                                                       |
| `Body`                  | いいえ       | -                                                            | *        | いいえ  |                                                                                | 文字列                                                                                                                                                          |
| `OwnerUserId`           | はい        | -1, 4056915                                                  | 6256237  | はい   |                                                                                | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ       | -                                                            | 181251   | はい   | Null を空文字列と見なす                                                                 | String                                                                                                                                                       |
| `LastEditorUserId`      | はい        | -1, 9999993                                                  | 1104694  | はい   | 0 は未使用の値であり、Null を表す値として使用できます                                                 | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ       | *                                                            | 70952    | はい   | Null を空文字列として扱います。LowCardinality も試しましたが、効果はありませんでした                           | 文字列                                                                                                                                                          |
| `LastEditDate`          | いいえ       | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ  | ミリ秒精度が不要な場合は、DateTime を使用                                                      | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ       | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ  | ミリ秒精度が不要な場合は、DateTime を使用                                                      | DateTime                                                                                                                                                     |
| `タイトル`                  | いいえ       | -                                                            | *        | いいえ  | Null を空文字列として扱う                                                                | String                                                                                                                                                       |
| `タグ`                    | いいえ       | -                                                            | *        | いいえ  | Null を空文字列として扱う                                                                | 文字列                                                                                                                                                          |
| `AnswerCount`           | はい        | 0, 518                                                       | 216      | いいえ  | Null と 0 を同一視する                                                                | UInt16                                                                                                                                                       |
| `CommentCount`          | はい        | 0, 135                                                       | 100      | いいえ  | NULL と 0 を同一視する                                                                | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい        | 0, 225                                                       | 6        | はい   | Null と 0 を同一視する                                                                | UInt8                                                                                                                                                        |
| `ContentLicense`        | いいえ       | -                                                            | 3        | いいえ  | LowCardinality は FixedString より高性能です                                           | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ       | *                                                            | 20696028 | はい   | Null を空文字列として扱う                                                                | String                                                                                                                                                       |
| `CommunityOwnedDate`    | いいえ       | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい   | Null に対しては既定値として 1970-01-01 を使用することを検討してください。ミリ秒単位の精度は不要なため、DateTime を使用してください | DateTime型                                                                                                                                                    |
| `ClosedDate`            | いいえ       | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい   | Null に対しては既定値として 1970-01-01 を使用することを検討してください。ミリ秒精度は不要なため、DateTime を使用してください    | DateTime                                                                                                                                                     |

:::note Tip
列の型を特定するには、その数値範囲とユニークな値の個数を把握する必要があります。すべての列の範囲と異なる値の数を確認するには、`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` というシンプルなクエリを使用できます。処理コストが高くなる可能性があるため、より小さいデータのサブセットに対して実行することを推奨します。
:::

これにより、（型の観点から）次のような最適化されたスキーマが得られます。

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


## Nullable カラムを避ける {#avoid-nullable-columns}

<NullableColumns />
