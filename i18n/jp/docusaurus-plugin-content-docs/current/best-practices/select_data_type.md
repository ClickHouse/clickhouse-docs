---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: 'データ型の選択'
title: 'データ型の選択'
description: 'ClickHouse におけるデータ型の選び方を説明するページ'
keywords: ['データ型']
doc_type: 'reference'
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse のクエリパフォーマンスを支える主要な要因の 1 つは、高効率なデータ圧縮です。ディスク上のデータ量が少ないほど I/O オーバーヘッドが減少し、クエリや INSERT の実行が高速になります。ClickHouse のカラム指向アーキテクチャは、類似したデータを自然に隣接して配置するため、圧縮アルゴリズムやコーデックによってデータサイズを大幅に削減できます。これらの圧縮効果を最大化するには、適切なデータ型を慎重に選択することが重要です。

ClickHouse における圧縮効率は主に 3 つの要因、すなわちオーダリングキー、データ型、およびコーデックに依存しており、これらはすべてテーブルスキーマで定義されます。最適なデータ型を選択することで、ストレージとクエリパフォーマンスの両方を即座に改善できます。

いくつかの簡単なガイドラインに従うだけで、スキーマを大きく改善できます。

* **厳密な型を使用する:** 常にカラムに対して正しいデータ型を選択してください。数値や日付のフィールドには、汎用的な String 型ではなく、適切な数値型および日付型を使用します。これにより、フィルタリングや集計の意味づけが正しく保たれます。

* **Nullable カラムを避ける:** Nullable カラムは、null 値を追跡するための別カラムを保持する必要があるため、追加のオーバーヘッドを発生させます。空文字列と null の状態を明示的に区別する必要がある場合にのみ Nullable を使用してください。そうでなければ、デフォルト値や 0 相当の値で十分なことがほとんどです。この型を必要な場合を除いて避けるべき理由の詳細は、[Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns) を参照してください。

* **数値精度を最小化する:** 期待されるデータ範囲を満たしつつ、ビット幅が最小となる数値型を選択します。たとえば、負の値が不要であり、値の範囲が 0–65535 に収まるのであれば、[Int32 よりも UInt16](/sql-reference/data-types/int-uint) を優先します。

* **日付と時刻の精度を最適化する:** クエリ要件を満たす範囲で、できる限り粒度の粗い date または datetime 型を選択します。日付のみのフィールドには Date または Date32 を使用し、ミリ秒精度やそれより細かい精度が不可欠でない限り、DateTime64 よりも DateTime を優先します。

* **LowCardinality と専用型を活用する:** 一意な値が概ね 10,000 未満のカラムには、辞書エンコーディングによってストレージを大幅に削減できる LowCardinality 型を使用します。同様に、カラム値が厳密に固定長文字列（例: 国コードや通貨コード）である場合にのみ FixedString を使用し、取り得る値の集合が有限であるカラムには Enum 型を優先して使用することで、効率的なストレージと組み込みのデータ検証を実現できます。

* **データ検証のための Enum:** Enum 型は列挙型を効率的にエンコードするために使用できます。Enum は格納すべき一意な値の数に応じて 8 ビットまたは 16 ビットのいずれかとなります。挿入時の検証（宣言されていない値は拒否される）が必要な場合や、Enum の値に自然な順序があり、これを活用したクエリを実行したい場合に使用を検討してください。例えば、ユーザーの応答を含むフィードバックカラムを次のように定義することが考えられます: Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3)。


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

postsテーブルに初期の簡単なルールを適用することで、各列に最適な型を特定できます:


| 列                       | 数値かどうか | 最小値、最大値                                                      | 一意の値     | NULL 値 | コメント                                                               | 最適化型                                                                                                                                                         |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | ------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい     | 1, 8                                                         | 8        | いいえ    |                                                                    | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい     | 0, 78285170                                                  | 12282094 | はい     | Null と 0 を区別する                                                     | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用                                       | DateTime                                                                                                                                                     |
| `Score`                 | はい     | -217, 34970                                                  | 3236     | いいえ    |                                                                    | Int32                                                                                                                                                        |
| `ViewCount`             | はい     | 2, 13962748                                                  | 170867   | いいえ    |                                                                    | UInt32                                                                                                                                                       |
| `Body`                  | いいえ    | -                                                            | *        | いいえ    |                                                                    | String                                                                                                                                                       |
| `OwnerUserId`           | はい     | -1, 4056915                                                  | 6256237  | はい     |                                                                    | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ    | -                                                            | 181251   | はい     | Null を空文字列として扱う                                                    | 文字列                                                                                                                                                          |
| `LastEditorUserId`      | はい     | -1, 9999993                                                  | 1104694  | はい     | 0 は未使用の値であり、Null を表す値として使用できる                                      | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ    | *                                                            | 70952    | はい     | Null を空文字列として扱う。LowCardinality も試したが効果はなかった                        | 文字列                                                                                                                                                          |
| `LastEditDate`          | いいえ    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ    | ミリ秒単位の精度が不要な場合は DateTime を使用する                                     | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用                                       | DateTime                                                                                                                                                     |
| `Title`                 | いいえ    | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                    | String                                                                                                                                                       |
| `タグ`                    | いいえ    | -                                                            | *        | いいえ    | NULL を空文字列として扱う                                                    | 文字列                                                                                                                                                          |
| `AnswerCount`           | はい     | 0, 518                                                       | 216      | いいえ    | Null と 0 を同一視する                                                    | UInt16                                                                                                                                                       |
| `CommentCount`          | はい     | 0, 135                                                       | 100      | いいえ    | NULL と 0 を同一視する                                                    | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい     | 0, 225                                                       | 6        | はい     | Null および 0 を同一視する                                                  | UInt8                                                                                                                                                        |
| `ContentLicense`        | いいえ    | -                                                            | 3        | なし     | LowCardinality は FixedString より高性能                                 | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ    | *                                                            | 20696028 | はい     | Null を空文字列として扱う                                                    | 文字列                                                                                                                                                          |
| `CommunityOwnedDate`    | いいえ    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい     | Null のデフォルト値には 1970-01-01 を使用することを検討する。ミリ秒精度は不要なので、DateTime を使用する。 | DateTime                                                                                                                                                     |
| `ClosedDate`            | いいえ    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい     | Null のデフォルトは 1970-01-01 とし、ミリ秒精度は不要なため DateTime を使用する              | DateTime                                                                                                                                                     |

:::note ヒント
列の型を特定するには、その数値範囲と一意な値の数を把握する必要があります。すべての列の範囲と異なる値の数を調べるには、`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` という簡単なクエリを使用できます。コストが高くなる可能性があるため、これはデータのより小さなサブセットに対して実行することを推奨します。
:::

これにより、（型の観点から）次のような最適化されたスキーマになります。

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
