---
slug: /data-modeling/schema-design
title: 'Schema Design'
description: 'Optimizing ClickHouse schema for query performance'
keywords: ['schema', 'schema design', 'query optimization']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

効果的なスキーマ設計を理解することは、ClickHouse のパフォーマンス最適化の要となります。スキーマ設計にはしばしばトレードオフを伴う選択が含まれ、最適なアプローチは、実行されるクエリに加えて、データの更新頻度、レイテンシ要件、データ量といった要因によって異なります。本ガイドでは、ClickHouse のパフォーマンスを最適化するためのスキーマ設計におけるベストプラクティスとデータモデリング手法の概要を説明します。


## Stack Overflow dataset {#stack-overflow-dataset}

このガイドのサンプルでは、Stack Overflow データセットのサブセットを使用します。これは、2008 年から 2024 年 4 月までに Stack Overflow 上で行われたすべての投稿、投票、ユーザー、コメント、およびバッジを含みます。このデータは、以下のスキーマに従った Parquet 形式として、S3 バケット `s3://datasets-documentation/stackoverflow/parquet/` から利用できます。

> 示されている主キーおよびリレーションシップは CONSTRAINT によって強制されているわけではありません（Parquet はテーブル形式ではなくファイル形式であるため）｡ それらはデータ間の関連性と、データが持つ一意キーを示すためだけのものです。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow データセットには複数の関連テーブルが含まれます。あらゆるデータモデリングのタスクにおいて、まずはプライマリテーブルのロードに集中することを推奨します。これは必ずしも最大のテーブルである必要はなく、むしろ分析クエリの大半が実行されると想定されるテーブルです。これにより、特に主に OLTP に慣れている方にとって、ClickHouse の主要な概念や型に慣れることができます。ClickHouse の機能を最大限に活用し、最適なパフォーマンスを得るために、追加のテーブルを取り込む際にはこのテーブルのリモデリングが必要になる場合があります。

上記のスキーマは、このガイドの目的上、あえて最適化されていません。

## 初期スキーマの定義 {#establish-initial-schema}

`posts` テーブルは大半の分析クエリのターゲットとなるため、このテーブルのスキーマ定義に注力します。このデータは、パブリックな S3 バケット `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` に、1 年ごとに 1 ファイルという構成で保存されています。

> S3 上の Parquet 形式からデータを読み込む方法は、ClickHouse にデータをロードする際の最も一般的かつ推奨される手法です。ClickHouse は Parquet の処理に最適化されており、S3 から 1 秒あたり数千万行規模で読み込みおよび挿入できる可能性があります。

ClickHouse には、データセットの型を自動的に判別するスキーマ推論機能があります。これは Parquet を含むすべてのデータ形式でサポートされています。この機能を利用し、s3 テーブル関数と [`DESCRIBE`](/sql-reference/statements/describe-table) コマンドを用いて、データに対する ClickHouse の型を特定できます。以下の例では、`stackoverflow/parquet/posts` フォルダ内のすべてのファイルを読み込むために、グロブパターン `*.parquet` を使用しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                    │ Nullable(Int64)               │
│ PostTypeId            │ Nullable(Int64)               │
│ AcceptedAnswerId      │ Nullable(Int64)               │
│ CreationDate          │ Nullable(DateTime64(3, 'UTC')) │
│ Score                 │ Nullable(Int64)               │
│ ViewCount             │ Nullable(Int64)               │
│ Body                  │ Nullable(String)              │
│ OwnerUserId           │ Nullable(Int64)               │
│ OwnerDisplayName      │ Nullable(String)              │
│ LastEditorUserId      │ Nullable(Int64)               │
│ LastEditorDisplayName │ Nullable(String)              │
│ LastEditDate          │ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate      │ Nullable(DateTime64(3, 'UTC')) │
│ Title                 │ Nullable(String)              │
│ Tags                  │ Nullable(String)              │
│ AnswerCount           │ Nullable(Int64)               │
│ CommentCount          │ Nullable(Int64)               │
│ FavoriteCount         │ Nullable(Int64)               │
│ ContentLicense        │ Nullable(String)              │
│ ParentId              │ Nullable(String)              │
│ CommunityOwnedDate    │ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate            │ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> The [s3 table function](/sql-reference/table-functions/s3) allows data in S3 to be queried in-place from ClickHouse. This function is compatible with all of the file formats ClickHouse supports.

This provides us with an initial non-optimized schema. By default, ClickHouse maps these to equivalent Nullable types. We can create a ClickHouse table using these types with a simple `CREATE EMPTY AS SELECT` command.

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

A few important points:

Our posts table is empty after running this command. No data has been loaded.
We have specified the MergeTree as our table engine. MergeTree is the most common ClickHouse table engine you will likely use. It&#39;s the multi-tool in your ClickHouse box, capable of handling PB of data, and serves most analytical use cases. Other table engines exist for use cases such as CDC which need to support efficient updates.

The clause `ORDER BY ()` means we have no index, and more specifically no order in our data. More on this later. For now, just know all queries will require a linear scan.

To confirm the table has been created:


```sql
SHOW CREATE TABLE posts

CREATE TABLE posts
(
        `Id` Nullable(Int64),
        `PostTypeId` Nullable(Int64),
        `AcceptedAnswerId` Nullable(Int64),
        `CreationDate` Nullable(DateTime64(3, 'UTC')),
        `Score` Nullable(Int64),
        `ViewCount` Nullable(Int64),
        `Body` Nullable(String),
        `OwnerUserId` Nullable(Int64),
        `OwnerDisplayName` Nullable(String),
        `LastEditorUserId` Nullable(Int64),
        `LastEditorDisplayName` Nullable(String),
        `LastEditDate` Nullable(DateTime64(3, 'UTC')),
        `LastActivityDate` Nullable(DateTime64(3, 'UTC')),
        `Title` Nullable(String),
        `Tags` Nullable(String),
        `AnswerCount` Nullable(Int64),
        `CommentCount` Nullable(Int64),
        `FavoriteCount` Nullable(Int64),
        `ContentLicense` Nullable(String),
        `ParentId` Nullable(String),
        `CommunityOwnedDate` Nullable(DateTime64(3, 'UTC')),
        `ClosedDate` Nullable(DateTime64(3, 'UTC'))
)
ENGINE = MergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY tuple()
```

初期スキーマが定義できたので、s3 テーブル関数を使ってデータを読み込み、`INSERT INTO SELECT` でテーブルを埋めることができます。以下のクエリは、8 コアの ClickHouse Cloud インスタンス上で約 2 分で `posts` データをロードします。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上記のクエリは 6,000 万行をロードします。ClickHouse にとっては小規模な件数ですが、インターネット接続が遅いユーザーはデータの一部のみをロードしたい場合があるかもしれません。これは、ロードしたい年を glob パターンで指定するだけで実現できます。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` または `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。一部のファイルのみを対象とするための glob パターンの使い方は[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。


## Optimizing Types {#optimizing-types}

ClickHouse のクエリ性能を高めるための秘訣の 1 つは圧縮です。

ディスク上のデータが少ないほど I/O が減り、その結果としてクエリや挿入が高速になります。ほとんどの場合、CPU に対する圧縮アルゴリズムのオーバーヘッドは、I/O 削減の効果によって十分に相殺されます。したがって、ClickHouse のクエリを高速に保つうえでは、まずデータの圧縮率を改善することに注力すべきです。

> ClickHouse がこれほどよくデータを圧縮できる理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を参照してください。要約すると、ClickHouse はカラム指向データベースであるため、値はカラム順に書き込まれます。これらの値がソートされていれば、同じ値が互いに隣り合って配置されます。圧縮アルゴリズムは、連続したデータパターンを利用します。さらに ClickHouse には、圧縮手法をより細かくチューニングできるようにするコーデックや、きめ細かなデータ型が用意されています。

ClickHouse における圧縮は、主に 3 つの要因、すなわちソートキー、データ型、利用されるコーデックによって影響を受けます。これらはすべてスキーマを通して設定されます。

圧縮率とクエリ性能に対して最初に得られる大きな改善は、データ型の最適化という簡単なプロセスで実現できます。スキーマを最適化するために適用できる、いくつかの単純なルールを以下に示します。

- **厳密な型を使用する** - 初期スキーマでは、明らかに数値である多くのカラムに String を使用していました。正しい型を使用することで、フィルタリングや集約時に期待どおりのセマンティクスが保証されます。同様のことは、Parquet ファイル内で正しく定義されている日付型にも当てはまります。
- **Nullable カラムを避ける** - デフォルトでは、上記のカラムは Null を取りうるものとして扱われます。Nullable 型を使用すると、クエリで空値と Null 値を区別できるようになりますが、そのために UInt8 型の別カラムが作成されます。この追加カラムは、nullable カラムを扱うたびに処理される必要があり、その結果、追加のストレージ領域が必要となり、ほぼ確実にクエリ性能に悪影響を与えます。ある型のデフォルトの空値と Null とで意味上の違いがある場合にのみ Nullable を使用してください。たとえば、`ViewCount` カラムの空値を 0 とするだけで、ほとんどのクエリには十分であり、結果にも影響しないでしょう。空値を別扱いにする必要がある場合でも、多くの場合はフィルタによってクエリから除外できます。
- **数値型の精度を最小限にする** - ClickHouse には、さまざまな数値範囲と精度向けに設計された数値型が多数用意されています。常に、カラム表現に使用するビット数を最小限に抑えることを目標にしてください。たとえば Int16 のようなサイズの異なる整数に加えて、ClickHouse には最小値が 0 の符号なし型もあります。これにより、カラムに必要なビット数を削減できます。たとえば、UInt16 の最大値は 65535 であり、Int16 の 2 倍です。可能であれば、より大きな符号付き型よりも、こうした型を優先して使用してください。
- **日付型の精度を最小限にする** - ClickHouse は、複数の日付および日時型をサポートしています。Date と Date32 は純粋な日付の保存に使用でき、Date32 はより多くのビットを使用する代わりに、より広い日付範囲をサポートします。DateTime と DateTime64 は日時の保存に使用されます。DateTime は秒精度までで 32 ビットを使用します。名前が示すとおり、DateTime64 は 64 ビットを使用し、ナノ秒精度までサポートします。常に、クエリで許容される中で最も粗い精度を選択し、必要なビット数を最小化してください。
- **LowCardinality を使用する** - 一意な値の数が少ない数値、文字列、Date、または DateTime カラムは、LowCardinality 型でエンコードできる可能性があります。これは Dictionary によって値をエンコードし、ディスク上のサイズを削減します。一意な値が 1 万未満のカラムに対して検討してください。
- **特殊なケースには FixedString を使用する** - 長さが固定された文字列は、FixedString 型でエンコードできます（例: 言語コードや通貨コード）。これは、データ長が N バイトちょうどである場合に効率的です。それ以外のケースでは効率を下げる可能性が高く、通常は LowCardinality を使用する方が望ましいです。
- **データ検証には Enum を使用する** - Enum 型は、列挙型を効率的にエンコードするために使用できます。Enum は、格納する必要のある一意な値の数に応じて、8 ビットまたは 16 ビットのいずれかになります。挿入時に関連する検証（未定義の値を拒否する）が必要な場合や、Enum の値に自然な順序があり、それを利用したクエリを実行したい場合には、この型の使用を検討してください。たとえば、ユーザーのフィードバックを格納するカラムを `Enum(':(' = 1, ':|' = 2, ':)' = 3)` のように定義することを想像してください。

> Tip: すべてのカラムの値の範囲と、一意な値の数を調べるには、`SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical` という単純なクエリを使用できます。これは高コストになり得るため、データの小さなサブセットに対して実行することを推奨します。このクエリで正確な結果を得るには、数値が少なくとも数値型として定義されている必要があります（つまり String ではないこと）。

これらの単純なルールを posts テーブルに適用することで、各カラムに対して最適な型を特定できます。

| Column                  | Is Numeric | Min, Max                                                              | Unique Values | Nulls | Comment                                                                                      | Optimized Type                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | Yes        | 1, 8                                                                   | 8              | No     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | Yes        | 0, 78285170                                                            | 12282094       | Yes    | Differentiate Null with 0 value                                                               | UInt32                                   |
| `CreationDate`           | No         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `Score`                  | Yes        | -217, 34970                                                            | 3236           | No     |                                                                                              | Int32                                    |
| `ViewCount`              | Yes        | 2, 13962748                                                            | 170867         | No     |                                                                                              | UInt32                                   |
| `Body`                   | No         | -                                                                      | -              | No     |                                                                                              | String                                   |
| `OwnerUserId`            | Yes        | -1, 4056915                                                            | 6256237        | Yes    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | No         | -                                                                      | 181251         | Yes    | Consider Null to be empty string                                                             | String                                   |
| `LastEditorUserId`       | Yes        | -1, 9999993                                                            | 1104694        | Yes    | 0 is an unused value can be used for Nulls                                                   | Int32                                    |
| `LastEditorDisplayName`  | No         | -                                                                      | 70952          | Yes    | Consider Null to be an empty string. Tested LowCardinality and no benefit                    | String                                   |
| `LastEditDate`           | No         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `LastActivityDate`       | No         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | No     | Millisecond granularity is not required, use DateTime                                        | DateTime                                 |
| `Title`                  | No         | -                                                                      | -              | No     | Consider Null to be an empty string                                                          | String                                   |
| `Tags`                   | No         | -                                                                      | -              | No     | Consider Null to be an empty string                                                          | String                                   |
| `AnswerCount`            | Yes        | 0, 518                                                                 | 216            | No     | Consider Null and 0 to same                                                                  | UInt16                                   |
| `CommentCount`           | Yes        | 0, 135                                                                 | 100            | No     | Consider Null and 0 to same                                                                  | UInt8                                    |
| `FavoriteCount`          | Yes        | 0, 225                                                                 | 6              | Yes    | Consider Null and 0 to same                                                                  | UInt8                                    |
| `ContentLicense`         | No         | -                                                                      | 3              | No     | LowCardinality outperforms FixedString                                                       | LowCardinality(String)                   |
| `ParentId`               | No         | -                                                                      | 20696028       | Yes    | Consider Null to be an empty string                                                          | String                                   |
| `CommunityOwnedDate`     | No         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | Yes    | Consider default 1970-01-01 for Nulls. Millisecond granularity is not required, use DateTime | DateTime                                 |
| `ClosedDate`             | No         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | Yes    | Consider default 1970-01-01 for Nulls. Millisecond granularity is not required, use DateTime | DateTime                                 |

<br />

The above gives us the following schema:

```sql
CREATE TABLE posts_v2
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

前のテーブルからデータを読み取り、このテーブルに挿入する簡単な `INSERT INTO SELECT` 文でデータを投入できます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマでは、null は一切保持しません。上記の INSERT は、これらを暗黙的に各型のデフォルト値に変換します。整数型であれば 0、文字列型であれば空文字列です。ClickHouse は、数値も自動的に指定された精度に変換します。
ClickHouse におけるプライマリ（並び替え）キー
OLTP データベースから来たユーザーは、ClickHouse における同等の概念を探すことがよくあります。


## 順序キーの選択 {#choosing-an-ordering-key}

ClickHouse がよく利用されるようなスケールでは、メモリとディスクの効率性が最重要となります。データは ClickHouse のテーブルに、パーツと呼ばれるチャンク単位で書き込まれ、バックグラウンドでこれらパーツをマージするためのルールが適用されます。ClickHouse では、それぞれのパーツが独自のプライマリインデックスを持ちます。パーツがマージされると、マージ後のパーツのプライマリインデックスも同様にマージされます。パーツのプライマリインデックスは、行グループごとに 1 つのインデックスエントリを持ち、この手法はスパースインデックスと呼ばれます。

<Image img={schemaDesignIndices} size="md" alt="ClickHouse におけるスパースインデックス"/>

ClickHouse で選択したキーは、索引だけでなく、ディスク上にデータが書き込まれる順序も決定します。そのため、圧縮率に大きな影響を与え、それがクエリ性能にも影響します。多くのカラムの値が連続した順序で書き込まれるような順序キーを指定すると、選択した圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようになります。

> テーブル内のすべてのカラムは、キーに含まれているかどうかにかかわらず、指定された順序キーの値に基づいてソートされます。たとえば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は、`CreationDate` カラムの値の順序に対応します。複数の順序キーを指定することも可能であり、これは `SELECT` クエリの `ORDER BY` 句と同じセマンティクスで並び替えを行います。

順序キーを選択する際には、いくつかの簡単なルールを適用できます。以下は互いに競合する場合もあるため、この順番で検討してください。このプロセスから 4〜5 個程度のキーを特定できれば十分なことが多いでしょう。

- よく使うフィルタと整合するカラムを選択します。あるカラムが `WHERE` 句で頻繁に使われる場合、あまり使われないカラムよりも、そのカラムを優先的にキーへ含めてください。  
  フィルタ時にテーブル全体の行の大部分を除外できるようなカラムを優先すると、読み込む必要のあるデータ量を減らせます。
- テーブル内の他のカラムと高い相関があると考えられるカラムを優先します。これにより、それらの値も連続して格納される可能性が高まり、圧縮が改善されます。  
  順序キーに含まれるカラムに対する `GROUP BY` や `ORDER BY` の処理は、よりメモリ効率良く実行できます。

順序キーに用いるカラムのサブセットを決定する際には、カラムを特定の順番で宣言します。この順番は、クエリにおけるセカンダリキーとなるカラムのフィルタリング効率や、テーブルのデータファイルに対する圧縮率に大きな影響を与えます。一般的には、カーディナリティ（値の種類の多さ）が小さいものから大きいものへと昇順に並べるのが最適です。ただし、順序キーの後ろの方に現れるカラムに対するフィルタリングは、先頭のカラムに対するフィルタリングほど効率的ではないという事実とのバランスを取る必要があります。これらの振る舞いをバランスさせ、自身のアクセスパターンを考慮しつつ（そして何よりもバリエーションを実際にテストしながら）決定してください。

### 例 {#example}

上記のガイドラインを `posts` テーブルに適用すると、ユーザーは日付と投稿タイプでフィルタリングする分析を行いたいと仮定します。たとえば、

「過去3か月で最も多くコメントが付いた質問はどれか」。

型は最適化されているものの ordering key を持たない、以前の `posts_v2` テーブルを用いたこの問いに対するクエリは次のようになります:

```sql
SELECT
    Id,
    Title,
    CommentCount
FROM posts_v2
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────────────────────┬─CommentCount─┐
│ 78203063 │ How to avoid default initialization of objects in std::vector?     │               74 │
│ 78183948 │ About memory barrier                                               │               52 │
│ 77900279 │ Speed Test for Buffer Alignment: IBM's PowerPC results vs. my CPU │        49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
Peak memory usage: 429.38 MiB.
```

> ここでのクエリは、6,000万行すべてを線形スキャンしているにもかかわらず非常に高速です。ClickHouse がそれだけ高速だからです。TB や PB 規模ではオーダリングキーを工夫する価値があることを、ぜひ信じてください！

Lets select the columns `PostTypeId` and `CreationDate` as our ordering keys.

Maybe in our case, we expect users to always filter by `PostTypeId`. This has a cardinality of 8 and represents the logical choice for the first entry in our ordering key. Recognizing date granularity filtering is likely to be sufficient (it will still benefit datetime filters) so we use `toDate(CreationDate)` as the 2nd component of our key. This will also produce a smaller index as a date can be represented by 16, speeding up filtering. Our final key entry is the `CommentCount` to assist with finding the most commented posts (the final sort).

```sql
CREATE TABLE posts_v3
(
        `Id` Int32,
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime,
        `Score` Int32,
        `ViewCount` UInt32,
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime,
        `LastActivityDate` DateTime,
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16,
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime,
        `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
COMMENT 'Ordering Key'

--populate table from existing table

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.

Our previous query improves the query response time by over 3x:

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

10 rows in set. Elapsed: 0.020 sec. Processed 290.09 thousand rows, 21.03 MB (14.65 million rows/s., 1.06 GB/s.)
```

特定の型や適切なオーダーキーの利用によって得られる圧縮効率の向上に関心があるユーザーは、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) を参照してください。圧縮をさらに高める必要がある場合は、[Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) のセクションも参照することを推奨します。


## 次へ: データモデリング手法 {#next-data-modeling-techniques}

ここまでは、1 つのテーブルだけを移行してきました。これにより、いくつかの中核となる ClickHouse の概念を紹介することはできましたが、残念ながら現実のスキーマの多くはここまで単純ではありません。

以下に挙げる他のガイドでは、より広いスキーマを ClickHouse でのクエリ実行に最適化するために再構成する、さまざまな手法を見ていきます。このプロセス全体を通じて、`Posts` を大半の分析クエリが実行される中心的なテーブルとして維持することを目標とします。他のテーブルを単独でクエリすることも可能ですが、多くの分析は `posts` のコンテキストで実行されることを前提とします。

> このセクション全体を通して、他のテーブルについては最適化されたバージョンを使用します。これらのスキーマは提示しますが、簡潔にするため、そこで行った判断については割愛します。これらの判断は前のセクションで説明したルールに基づいており、その推論は読者に委ねます。

以下のアプローチはすべて、読み取りの最適化とクエリ性能の向上のために、JOIN の必要性を最小限に抑えることを目的としています。ClickHouse は JOIN を完全にサポートしていますが、最適なパフォーマンスを得るために、必要最小限（1 回の JOIN クエリで 2〜3 テーブル程度）にとどめることを推奨します。

> ClickHouse には外部キーという概念がありません。これは JOIN を禁止するものではありませんが、参照整合性の維持をアプリケーションレベルでユーザーに委ねていることを意味します。ClickHouse のような OLAP システムでは、データ整合性は多くの場合、データベース自身が強制するのではなく、アプリケーションレベルやデータのインジェスト処理中に管理されます。データベースで強制すると大きなオーバーヘッドが発生するためです。このアプローチにより、より柔軟で高速なデータ挿入が可能になります。これは、非常に大規模なデータセットに対する読み取りおよび挿入クエリのスピードとスケーラビリティに重点を置く ClickHouse の設計思想と一致しています。

クエリ時における JOIN の利用を最小限に抑えるために、ユーザーは次のようなツール／アプローチを利用できます。

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを結合し、非 1:1 関係には複合型を使用してデータを非正規化します。多くの場合、JOIN をクエリ時から挿入時へと移動することになります。
- [**Dictionaries**](/dictionary) - 直接的な JOIN とキー・バリュー型ルックアップを処理するための、ClickHouse 固有の機能です。
- [**Incremental Materialized Views**](/materialized-view/incremental-materialized-view) - 計算コストをクエリ時から挿入時へと移すための ClickHouse の機能であり、集計値をインクリメンタルに計算することも可能です。
- [**Refreshable Materialized Views**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使われる materialized view と同様に、クエリ結果を定期的に計算し、その結果をキャッシュすることができます。

これらの各アプローチについて、それぞれのガイドで取り上げ、Stack Overflow データセットに対する課題をどのように解決できるかを示す例を通じて、どのような場面で適用するのが適切かを説明していきます。