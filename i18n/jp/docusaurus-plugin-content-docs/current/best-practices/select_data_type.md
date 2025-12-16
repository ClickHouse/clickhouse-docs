---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: 'データ型の選択'
title: 'データ型の選択'
description: 'ClickHouse で適切なデータ型を選択する方法を説明するページ'
keywords: ['データ型']
doc_type: 'reference'
---

import NullableColumns from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse のクエリ性能を支える主要な要因の 1 つは、高効率なデータ圧縮です。ディスク上のデータ量が少ないほど I/O オーバーヘッドが抑えられ、クエリや挿入が高速になります。ClickHouse のカラム指向アーキテクチャは、類似したデータを自然に隣接して配置するため、圧縮アルゴリズムやコーデックによってデータサイズを大幅に削減できます。こうした圧縮の利点を最大化するには、適切なデータ型を慎重に選択することが不可欠です。

ClickHouse における圧縮効率は主に 3 つの要因――オーダリングキー、データ型、コーデック――に依存し、これらはすべてテーブルスキーマで定義されます。最適なデータ型を選択することで、ストレージとクエリ性能の両方を即座に改善できます。

いくつかの単純なガイドラインに従うだけで、スキーマを大きく改善できます。

* **厳密な型を使用する:** 常にカラムに対して正しいデータ型を選択してください。数値や日付のフィールドには、汎用的な String 型ではなく、適切な数値型および日付型を使用します。これにより、フィルタリングや集約において正しい意味づけが保証されます。

* **nullable カラムを避ける:** Nullable カラムは、null 値を追跡するための別カラムを保持する必要があるため、追加のオーバーヘッドを生みます。空と null の状態を明確に区別する必要がある場合にのみ Nullable を使用してください。そうでなければ、デフォルト値またはゼロ同等の値で十分なことが一般的です。この型を必要な場合以外に避けるべき理由の詳細は、[Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns) を参照してください。

* **数値精度を最小化する:** 期待されるデータ範囲を収容できる範囲で、ビット幅が最小の数値型を選択してください。たとえば、負の値が不要で、かつ範囲が 0–65535 に収まるのであれば、[Int32 より UInt16](/sql-reference/data-types/int-uint) を優先します。

* **日付と時刻の精度を最適化する:** クエリ要件を満たす範囲で、できるだけ粒度の粗い date または datetime 型を選択してください。日付のみのフィールドには Date または Date32 を使用し、ミリ秒単位またはそれより細かい精度が本質的に必要な場合を除き、DateTime64 より DateTime を優先します。

* **LowCardinality と特殊型を活用する:** 一意な値が概ね 10,000 未満のカラムには、辞書エンコーディングによってストレージを大幅に削減できる LowCardinality 型を使用してください。同様に、カラム値が厳密に固定長文字列（例: 国コードや通貨コード）である場合にのみ FixedString を使用し、取り得る値が有限集合であるカラムには Enum 型を優先して、効率的なストレージと組み込みのデータ検証を実現します。

* **データ検証のための Enum:** Enum 型は列挙型を効率的にエンコードするために使用できます。Enum は、保持する必要がある一意な値の数に応じて、8 ビットまたは 16 ビットのいずれかになります。挿入時のバリデーション（宣言されていない値は拒否される）が必要な場合や、Enum 値に自然な順序付けがあり、それを利用するクエリを実行したい場合には、Enum の使用を検討してください。たとえば、ユーザーのフィードバックを格納するカラムがあり、Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3) のような応答を持つケースを想像してください。

## 例 {#example}

ClickHouse には、型の最適化を効率化するためのツールが組み込まれています。たとえば、スキーマ推論を使うと初期のデータ型を自動的に特定できます。Parquet 形式で公開されている Stack Overflow データセットを考えてみましょう。[`DESCRIBE`](/sql-reference/statements/describe-table) コマンドで簡単なスキーマ推論を実行すると、初期の、まだ最適化されていないスキーマが得られます。

:::note
デフォルトでは、ClickHouse はこれらを同等の Nullable 型にマッピングします。これは、スキーマが行の一部サンプルのみに基づいているため、望ましい挙動です。
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
以下の例では、`stackoverflow/parquet/posts` フォルダ内のすべてのファイルを読み込むために、グロブパターン `*.parquet` を使用しています。
:::

先ほど示した簡単なルールを `posts` テーブルに適用することで、各カラムに対して最適な型を特定できます。

| 列                       | 数値かどうか | 最小、最大                                                        | ユニーク値    | NULL 値 | コメント                                                                      | 最適化型                                                                                                                                                         |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい     | 1, 8                                                         | 8        | いいえ    |                                                                           | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい     | 0, 78285170                                                  | 12282094 | はい     | Null と 0 を区別する                                                            | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ    | ミリ秒単位の精度が不要であれば、DateTime を使用する                                            | DateTime                                                                                                                                                     |
| `Score`                 | はい     | -217, 34970                                                  | 3236     | いいえ    |                                                                           | Int32                                                                                                                                                        |
| `ViewCount`             | はい     | 2, 13962748                                                  | 170867   | いいえ    |                                                                           | UInt32                                                                                                                                                       |
| `Body`                  | いいえ    | -                                                            | *        | いいえ    |                                                                           | String                                                                                                                                                       |
| `OwnerUserId`           | はい     | -1, 4056915                                                  | 6256237  | はい     |                                                                           | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ    | -                                                            | 181251   | はい     | Null を空文字列として扱う                                                           | 文字列                                                                                                                                                          |
| `LastEditorUserId`      | はい     | -1, 9999993                                                  | 1104694  | はい     | 0 は未使用の値であり、Null を表すために使用できる                                              | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ    | *                                                            | 70952    | はい     | Null は空文字列として扱う。LowCardinality も試したが、効果はなかった。                             | 文字列                                                                                                                                                          |
| `LastEditDate`          | いいえ    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ    | ミリ秒精度が不要な場合は、DateTime を使用します                                              | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ    | ミリ秒単位の粒度が不要な場合は DateTime を使用                                              | DateTime                                                                                                                                                     |
| `タイトル`                  | いいえ    | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                           | 文字列                                                                                                                                                          |
| `タグ`                    | いいえ    | -                                                            | *        | いいえ    | NULL を空文字列として扱う                                                           | 文字列                                                                                                                                                          |
| `AnswerCount`           | はい     | 0, 518                                                       | 216      | いいえ    | Null と 0 を同一視する                                                           | UInt16                                                                                                                                                       |
| `CommentCount`          | はい     | 0, 135                                                       | 100      | いいえ    | Null と 0 を同一視する                                                           | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい     | 0, 225                                                       | 6        | はい     | Null と 0 を同じものとして扱う                                                       | UInt8                                                                                                                                                        |
| `ContentLicense`        | いいえ    | -                                                            | 3        | いいえ    | LowCardinality は FixedString より高い性能を発揮します                                 | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ    | *                                                            | 20696028 | はい     | Null を空文字列として扱う                                                           | String                                                                                                                                                       |
| `CommunityOwnedDate`    | いいえ    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい     | Null のデフォルト値には 1970-01-01 を使用することを検討してください。ミリ秒精度は不要なため、DateTime を使用してください | DateTime                                                                                                                                                     |
| `ClosedDate`            | いいえ    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい     | Null のデフォルト値には 1970-01-01 を使用します。ミリ秒単位の精度は不要なので、DateTime 型を使用してください       | DateTime                                                                                                                                                     |

:::note ヒント
列の型を特定するには、その数値範囲と一意な値の数を把握する必要があります。すべての列について範囲と異なる値の個数を調べるには、`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` というシンプルなクエリを使用できます。処理コストが高くなる可能性があるため、これはデータのより小さなサブセットに対して実行することを推奨します。
:::

これにより、（型の観点から）次のように最適化されたスキーマが得られます。

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

## NULL 許容カラムは避ける {#avoid-nullable-columns}

<NullableColumns />
