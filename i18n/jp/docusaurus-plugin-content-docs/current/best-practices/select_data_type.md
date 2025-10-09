---
'slug': '/best-practices/select-data-types'
'sidebar_position': 10
'sidebar_label': 'データタイプの選択'
'title': 'データタイプの選択'
'description': 'ページは、ClickHouse におけるデータタイプの選び方について説明しています'
'keywords':
- 'data types'
'doc_type': 'reference'
---

import NullableColumns from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouseのクエリパフォーマンスの主要な理由の一つは、その効率的なデータ圧縮です。ディスク上のデータが少ないことで、I/Oオーバーヘッドを最小限に抑え、クエリと挿入が高速化されます。ClickHouseの列指向アーキテクチャは、同様のデータを自然に隣接させるため、圧縮アルゴリズムとコーデックがデータサイズを劇的に削減できるようになります。これらの圧縮の利点を最大化するためには、適切なデータ型を慎重に選択することが重要です。

ClickHouseにおける圧縮効率は、主に三つの要因に依存します：オーダリングキー、データ型、およびコーデックで、これらはすべてテーブルスキーマを通じて定義されます。最適なデータ型を選択することで、ストレージとクエリパフォーマンスの両方に即座に改善が見られます。

スキーマを大幅に向上させるためのいくつかの簡単なガイドラインがあります：

* **厳格な型を使う:** 常にカラムに対して正しいデータ型を選択してください。数値および日付フィールドには一般的なString型ではなく、適切な数値および日付型を使用するべきです。これにより、フィルタリングや集計に対して正しい意味論が確保されます。

* **Nullableカラムを避ける:** Nullableカラムは、null値を追跡するために別のカラムを保持することで追加オーバーヘッドをもたらします。空状態とnull状態を区別するために明示的に必要でない限り、Nullableを使用しないでください。そうでなければ、デフォルトまたはゼロに相当する値で十分です。この型は必要ない限り避けるべき理由についての詳細は、[Nullableカラムを避ける](/best-practices/select-data-types#avoid-nullable-columns)を参照してください。

* **数値の精度を最小限に抑える:** 期待されるデータ範囲をまだ満たす最小ビット幅の数値型を選択してください。たとえば、負の値が必要ない場合は、[Int32よりUInt16を優先する](/sql-reference/data-types/int-uint)べきで、範囲は0～65535に収まります。

* **日付および時刻の精度を最適化する:** クエリ要件を満たす最も粗い日付または日時型を選択してください。日付のみに使用する場合はDateまたはDate32を使用し、ミリ秒またはそれ以下の精度が必要でない限り、DateTimeの方がDateTime64よりも好まれます。

* **LowCardinalityおよび特殊型を活用する:** 約10,000未満のユニークな値を持つカラムには、辞書エンコーディングを使用してストレージを大幅に削減するためにLowCardinality型を使用してください。同様に、カラム値が厳密に固定長文字列（例：国コードまたは通貨コード）の場合にのみFixedStringを使用し、有限の可能な値のセットを持つカラムにはEnum型を好んで使用し、効率的なストレージと組み込みデータ検証を可能にします。

* **データ検証のためのEnums:** Enum型を使用して列挙型を効率的にエンコードできます。Enumsは必要なユニークな値の数に応じて8ビットまたは16ビットにすることができます。挿入時の関連する検証（未宣言の値は拒否される）およびEnumの値における自然な順序を利用したクエリを行いたい場合には、これを使用することを検討してください。例えば、ユーザーの反応を含むフィードバックカラムにはEnum(':(' = 1, ':|' = 2, ':)' = 3)が考えられます。

## 例 {#example}

ClickHouseは型最適化を簡素化するための組み込みツールを提供しています。例えば、スキーマ推論は自動的に初期型を特定できます。Stack Overflowデータセットを考えてみましょう。これはParquet形式で公開されています。[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使ってシンプルなスキーマ推論を実行すると、初期の非最適化スキーマを取得できます。

:::note
デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。これは、スキーマが行のサンプルに基づいているため好まれます。
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
以下では、stackoverflow/parquet/postsフォルダ内のすべてのファイルを読み取るために、グロブパターン*.parquetを使用しています。
:::

投稿テーブルに初期の簡単なルールを適用することにより、各カラムに最適な型を特定できます：

| カラム                  | 数値型 | 最小, 最大                                                                | ユニーク値 | Nulls | コメント                                                                                      | 最適化された型                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | はい        | 1, 8                                                                   | 8              | いいえ     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい        | 0, 78285170                                                            | 12282094       | はい    | Nullを0値と区別する                                                                        | UInt32                                   |
| `CreationDate`           | いいえ         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | いいえ     | ミリ秒の精度は必要ない、DateTimeを使用                                                     | DateTime                                 |
| `Score`                  | はい        | -217, 34970                                                            | 3236           | いいえ     |                                                                                              | Int32                                    |
| `ViewCount`              | はい        | 2, 13962748                                                            | 170867         | いいえ     |                                                                                              | UInt32                                   |
| `Body`                   | いいえ         | -                                                                      | -              | いいえ     |                                                                                              | String                                   |
| `OwnerUserId`            | はい        | -1, 4056915                                                            | 6256237        | はい    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | いいえ         | -                                                                      | 181251         | はい    | Nullを空文字列と見なす                                                                      | String                                   |
| `LastEditorUserId`       | はい        | -1, 9999993                                                            | 1104694        | はい    | 0は未使用値でNullとして使用できる                                                         | Int32                                    |
| `LastEditorDisplayName`  | いいえ         | -                                                                      | 70952          | はい    | Nullを空文字列と見なす。LowCardinalityをテストしたがベネフィットなし                            | String                                   |
| `LastEditDate`           | いいえ         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | いいえ     | ミリ秒の精度は必要ない、DateTimeを使用                                                     | DateTime                                 |
| `LastActivityDate`       | いいえ         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | いいえ     | ミリ秒の精度は必要ない、DateTimeを使用                                                     | DateTime                                 |
| `Title`                  | いいえ         | -                                                                      | -              | いいえ     | Nullを空文字列と見なす                                                                         | String                                   |
| `Tags`                   | いいえ         | -                                                                      | -              | いいえ     | Nullを空文字列と見なす                                                                         | String                                   |
| `AnswerCount`            | はい        | 0, 518                                                                 | 216            | いいえ     | Nullと0を同じとみなす                                                                          | UInt16                                   |
| `CommentCount`           | はい        | 0, 135                                                                 | 100            | いいえ     | Nullと0を同じとみなす                                                                          | UInt8                                    |
| `FavoriteCount`          | はい        | 0, 225                                                                 | 6              | はい    | Nullと0を同じとみなす                                                                          | UInt8                                    |
| `ContentLicense`         | いいえ         | -                                                                      | 3              | いいえ     | LowCardinalityがFixedStringを上回る                                                          | LowCardinality(String)                   |
| `ParentId`               | いいえ         | -                                                                      | 20696028       | はい    | Nullを空文字列と見なす                                                                         | String                                   |
| `CommunityOwnedDate`     | いいえ         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | はい    | Nullのためにデフォルト1970-01-01を使用します。ミリ秒の精度は必要ない、DateTimeを使用          | DateTime                                 |
| `ClosedDate`             | いいえ         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | はい    | Nullのためにデフォルト1970-01-01を使用します。ミリ秒の精度は必要ない、DateTimeを使用          | DateTime                                 |

:::note tip
カラムの型を特定するには、その数値範囲とユニークな値の数を理解する必要があります。すべてのカラムの範囲と異なる値の数を見つけるために、ユーザーはシンプルなクエリ`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。これは高価になり得るため、データの小さなサブセットで実行することをお勧めします。
:::

これにより、次のような型に関する最適化されたスキーマが得られます：

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
