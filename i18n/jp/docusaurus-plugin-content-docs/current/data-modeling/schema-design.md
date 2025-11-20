---
slug: /data-modeling/schema-design
title: 'スキーマ設計'
description: 'クエリパフォーマンス向上のための ClickHouse スキーマ最適化'
keywords: ['schema', 'schema design', 'query optimization']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

効果的なスキーマ設計を理解することは ClickHouse のパフォーマンス最適化の要であり、しばしばトレードオフを伴う選択が発生します。最適なアプローチは、処理すべきクエリの内容に加えて、データ更新頻度、レイテンシ要件、データ量といった要因によって決まります。本ガイドでは、ClickHouse のパフォーマンスを最適化するためのスキーマ設計におけるベストプラクティスとデータモデリング手法の概要を紹介します。


## Stack Overflowデータセット {#stack-overflow-dataset}

本ガイドの例では、Stack Overflowデータセットのサブセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての投稿、投票、ユーザー、コメント、バッジが含まれています。このデータは、S3バケット`s3://datasets-documentation/stackoverflow/parquet/`配下で、以下のスキーマを使用したParquet形式で利用できます。

> 示されている主キーとリレーションシップは制約によって強制されていません(Parquetはテーブル形式ではなくファイル形式です)。これらは単にデータの関連性と保有する一意キーを示すものです。

<Image img={stackOverflowSchema} size='lg' alt='Stack Overflowスキーマ' />

<br />

Stack Overflowデータセットには、複数の関連テーブルが含まれています。データモデリングタスクでは、まず主要テーブルの読み込みに集中することを推奨します。これは必ずしも最大のテーブルである必要はなく、最も多くの分析クエリが実行されると予想されるテーブルを指します。これにより、ClickHouseの主要な概念とデータ型に慣れることができます。特にOLTP中心のバックグラウンドを持つ場合には重要です。このテーブルは、ClickHouseの機能を最大限に活用し最適なパフォーマンスを得るために、追加のテーブルが加わるにつれて再モデリングが必要になる場合があります。

上記のスキーマは、本ガイドの目的上、意図的に最適化されていません。


## 初期スキーマの確立 {#establish-initial-schema}

`posts`テーブルはほとんどの分析クエリの対象となるため、このテーブルのスキーマ確立に焦点を当てます。このデータは、パブリックS3バケット`s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet`で利用可能で、年ごとに1ファイルが格納されています。

> Parquet形式でS3からデータをロードすることは、ClickHouseへのデータロードにおいて最も一般的で推奨される方法です。ClickHouseはParquetの処理に最適化されており、S3から毎秒数千万行の読み取りと挿入が可能です。

ClickHouseは、データセットの型を自動的に識別するスキーマ推論機能を提供しています。これはParquetを含むすべてのデータ形式でサポートされています。この機能を利用して、s3テーブル関数と[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使用し、データのClickHouse型を識別できます。以下では、`stackoverflow/parquet/posts`フォルダ内のすべてのファイルを読み取るためにglobパターン`*.parquet`を使用している点に注意してください。

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

> [s3テーブル関数](/sql-reference/table-functions/s3)を使用すると、S3内のデータをClickHouseから直接クエリできます。この関数は、ClickHouseがサポートするすべてのファイル形式と互換性があります。

これにより、最適化されていない初期スキーマが得られます。デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。これらの型を使用して、シンプルな`CREATE EMPTY AS SELECT`コマンドでClickHouseテーブルを作成できます。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつかの重要なポイント:

このコマンドを実行した後、postsテーブルは空です。データはロードされていません。
テーブルエンジンとしてMergeTreeを指定しました。MergeTreeは、最もよく使用するClickHouseテーブルエンジンです。ClickHouseツールボックスの万能ツールであり、PB規模のデータを処理でき、ほとんどの分析ユースケースに対応します。効率的な更新をサポートする必要があるCDCなどのユースケース向けには、他のテーブルエンジンも存在します。

`ORDER BY ()`句は、インデックスがなく、より具体的にはデータに順序がないことを意味します。これについては後で詳しく説明します。今のところ、すべてのクエリで線形スキャンが必要になることだけを理解しておいてください。

テーブルが作成されたことを確認するには:

```sql
SHOW CREATE TABLE posts

```


CREATE TABLE posts
(
`Id` Nullable(Int64),
`PostTypeId` Nullable(Int64),
`AcceptedAnswerId` Nullable(Int64),
`CreationDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`Score` Nullable(Int64),
`ViewCount` Nullable(Int64),
`Body` Nullable(String),
`OwnerUserId` Nullable(Int64),
`OwnerDisplayName` Nullable(String),
`LastEditorUserId` Nullable(Int64),
`LastEditorDisplayName` Nullable(String),
`LastEditDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`LastActivityDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`Title` Nullable(String),
`Tags` Nullable(String),
`AnswerCount` Nullable(Int64),
`CommentCount` Nullable(Int64),
`FavoriteCount` Nullable(Int64),
`ContentLicense` Nullable(String),
`ParentId` Nullable(String),
`CommunityOwnedDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`ClosedDate` Nullable(DateTime64(3, &#39;UTC&#39;))
)
ENGINE = MergeTree(&#39;/clickhouse/tables/{uuid}/{shard}&#39;, &#39;{replica}&#39;)
ORDER BY tuple()

````

初期スキーマを定義したら、`INSERT INTO SELECT`を使用してデータを投入できます。データの読み込みにはs3テーブル関数を使用します。以下のクエリは、8コアのClickHouse Cloudインスタンスで約2分で`posts`データをロードします。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
````

> 上記のクエリは 6,000 万行をロードします。ClickHouse にとっては小規模ですが、インターネット接続が遅いユーザーは、データの一部だけをロードしたい場合があるかもしれません。これは、ロードしたい年を、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` や `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet` のような glob パターンで指定するだけで実現できます。glob パターンを使用してファイルのサブセットを対象にする方法については[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。


## 型の最適化 {#optimizing-types}

ClickHouseのクエリパフォーマンスの秘訣の一つは圧縮です。

ディスク上のデータ量が少ないほどI/Oが減少し、クエリと挿入が高速化されます。圧縮アルゴリズムによるCPUのオーバーヘッドは、ほとんどの場合、IOの削減によって相殺されます。したがって、ClickHouseクエリの高速化を図る際には、データの圧縮改善を最優先に取り組むべきです。

> ClickHouseがデータを効率的に圧縮できる理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を推奨します。要約すると、カラム指向データベースとして、値はカラム順に書き込まれます。これらの値がソートされている場合、同じ値が隣接して配置されます。圧縮アルゴリズムは、このような連続したデータパターンを活用します。さらに、ClickHouseにはコーデックと細分化されたデータ型があり、ユーザーは圧縮技術をさらに調整できます。

ClickHouseの圧縮は、主に3つの要因に影響されます：ソートキー、データ型、使用されるコーデックです。これらはすべてスキーマを通じて設定されます。

圧縮とクエリパフォーマンスの最大の初期改善は、型の最適化という単純なプロセスによって得られます。スキーマを最適化するために、いくつかの簡単なルールを適用できます：

- **厳密な型を使用する** - 初期スキーマでは、明らかに数値である多くのカラムにString型を使用していました。正しい型を使用することで、フィルタリングや集計時に期待される意味論が保証されます。これは日付型にも当てはまり、Parquetファイルでは正しく提供されています。
- **Nullableカラムを避ける** - デフォルトでは、上記のカラムはNullと想定されています。Nullable型により、クエリは空の値とNull値の違いを判別できます。これにより、UInt8型の別カラムが作成されます。この追加カラムは、ユーザーがnullableカラムを操作するたびに処理される必要があります。これにより、追加のストレージ容量が使用され、ほぼ常にクエリパフォーマンスに悪影響を及ぼします。型のデフォルト空値とNullの間に違いがある場合にのみNullableを使用してください。たとえば、`ViewCount`カラムの空値に0を使用すれば、ほとんどのクエリで十分であり、結果に影響しません。空値を異なる方法で扱う必要がある場合は、フィルタを使用してクエリから除外することもできます。
  **数値型には最小限の精度を使用する** - ClickHouseには、異なる数値範囲と精度に対応した多数の数値型があります。常にカラムを表現するために使用するビット数を最小化することを目指してください。Int16などの異なるサイズの整数に加えて、ClickHouseは最小値が0である符号なしバリアントを提供しています。これにより、カラムに使用するビット数を減らすことができます。たとえば、UInt16の最大値は65535で、Int16の2倍です。可能であれば、より大きな符号付きバリアントよりもこれらの型を優先してください。
- **日付型には最小限の精度を使用する** - ClickHouseは多数の日付型と日時型をサポートしています。DateとDate32は純粋な日付の保存に使用でき、後者はより多くのビットを使用する代わりに、より広い日付範囲をサポートします。DateTimeとDateTime64は日時をサポートします。DateTimeは秒単位の粒度に制限され、32ビットを使用します。DateTime64は、名前が示すように64ビットを使用しますが、ナノ秒単位の粒度までサポートします。常に、クエリに許容される粗い方のバージョンを選択し、必要なビット数を最小化してください。
- **LowCardinalityを使用する** - 一意の値の数が少ない数値、文字列、Date、またはDateTimeカラムは、LowCardinality型を使用してエンコードできる可能性があります。この辞書エンコーディングにより値がエンコードされ、ディスク上のサイズが削減されます。一意の値が10,000未満のカラムに対してこれを検討してください。
  **特殊なケースにはFixedStringを使用する** - 固定長の文字列は、FixedString型でエンコードできます（例：言語コードや通貨コード）。これは、データが正確にNバイトの長さを持つ場合に効率的です。それ以外のすべてのケースでは、効率が低下する可能性が高く、LowCardinalityが推奨されます。
- **データ検証にはEnumを使用する** - Enum型は列挙型を効率的にエンコードするために使用できます。Enumは、保存する必要がある一意の値の数に応じて、8ビットまたは16ビットのいずれかになります。挿入時の関連する検証が必要な場合（宣言されていない値は拒否されます）、またはEnum値の自然な順序を活用するクエリを実行したい場合に、これの使用を検討してください。たとえば、ユーザーの応答を含むフィードバックカラム`Enum(':(' = 1, ':|' = 2, ':)' = 3)`を想像してください。

> ヒント：すべてのカラムの範囲と一意の値の数を見つけるには、ユーザーは簡単なクエリ`SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。これはコストがかかる可能性があるため、データのより小さなサブセットに対して実行することを推奨します。このクエリで正確な結果を得るには、数値が少なくともそのように定義されている必要があります（つまり、Stringではない）。

これらの簡単なルールをpostsテーブルに適用することで、各カラムの最適な型を特定できます：


| カラム                     | 数値かどうか判定 | 最小, 最大                                                       | 一意な値     | Null 値 | コメント                                                                  | 最適化型                                                                                                                                                         |
| ----------------------- | -------- | ------------------------------------------------------------ | -------- | ------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい       | 1, 8                                                         | 8        | いいえ    |                                                                       | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい       | 0, 78285170                                                  | 12282094 | はい     | NULL と 0 の値を区別する                                                      | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ      | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ    | ミリ秒精度が不要な場合は、DateTime を使用                                             | DateTime                                                                                                                                                     |
| `Score`                 | はい       | -217, 34970                                                  | 3236     | いいえ    |                                                                       | Int32                                                                                                                                                        |
| `ViewCount`             | はい       | 2, 13962748                                                  | 170867   | いいえ    |                                                                       | UInt32                                                                                                                                                       |
| `Body`                  | いいえ      | -                                                            | *        | いいえ    |                                                                       | 文字列                                                                                                                                                          |
| `OwnerUserId`           | はい       | -1, 4056915                                                  | 6256237  | はい     |                                                                       | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ      | -                                                            | 181251   | はい     | Null を空文字列として扱う                                                       | 文字列                                                                                                                                                          |
| `LastEditorUserId`      | はい       | -1, 9999993                                                  | 1104694  | はい     | 0 は未使用の値であり、Null を表すために使用できます                                         | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ      | *                                                            | 70952    | はい     | Null を空文字列として扱うことを検討してください。LowCardinality も試しましたが、特に効果はありませんでした       | 文字列                                                                                                                                                          |
| `LastEditDate`          | いいえ      | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用                                          | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ      | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用する                                        | DateTime                                                                                                                                                     |
| `Title`                 | いいえ      | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                       | 文字列                                                                                                                                                          |
| `タグ`                    | いいえ      | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                       | 文字列                                                                                                                                                          |
| `AnswerCount`           | はい       | 0, 518                                                       | 216      | いいえ    | Null と 0 を同一視する                                                       | UInt16                                                                                                                                                       |
| `CommentCount`          | はい       | 0, 135                                                       | 100      | いいえ    | Null と 0 を同一視する                                                       | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい       | 0, 225                                                       | 6        | はい     | Null と 0 を同一視する                                                       | UInt8                                                                                                                                                        |
| `コンテンツライセンス`            | いいえ      | -                                                            | 3        | いいえ    | LowCardinality は FixedString より高い性能を発揮します                             | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ      | *                                                            | 20696028 | はい     | Null を空文字列として扱う                                                       | 文字列                                                                                                                                                          |
| `CommunityOwnedDate`    | いいえ      | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい     | Null のデフォルト値として 1970-01-01 を使用してください。ミリ秒精度は不要なので、DateTime を使用します      | DateTime                                                                                                                                                     |
| `ClosedDate`            | いいえ      | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい     | Null には既定値として 1970-01-01 を使用することを検討してください。ミリ秒精度は不要なため、DateTime を使用します | DateTime                                                                                                                                                     |

<br />

上記から、次のようなスキーマになります。

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
COMMENT '最適化された型'
```

前のテーブルからデータを読み込み、このテーブルに挿入するために、シンプルな `INSERT INTO SELECT` を使って値を投入できます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマでは、null は一切保持されません。上記の insert 文では、これらはそれぞれの型のデフォルト値に暗黙的に変換されます。整数型では 0、文字列型では空文字列です。さらに ClickHouse は、数値も自動的にターゲットの精度に変換します。
ClickHouse におけるプライマリ（オーダリング）キー
OLTP データベースから移行してくるユーザーは、ClickHouse でこれに相当する概念をよく探します。


## 順序キーの選択 {#choosing-an-ordering-key}

ClickHouseが使用される規模では、メモリとディスクの効率性が最も重要です。データはパートと呼ばれるチャンク単位でClickHouseテーブルに書き込まれ、バックグラウンドでパートをマージするルールが適用されます。ClickHouseでは、各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージされたパートのプライマリインデックスもマージされます。パートのプライマリインデックスは、行のグループごとに1つのインデックスエントリを持ちます - この手法はスパースインデックスと呼ばれます。

<Image
  img={schemaDesignIndices}
  size='md'
  alt='ClickHouseにおけるスパースインデックス'
/>

ClickHouseで選択されたキーは、インデックスだけでなく、ディスクにデータが書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を与え、それがクエリパフォーマンスに影響を及ぼす可能性があります。ほとんどのカラムの値が連続した順序で書き込まれるような順序キーを使用すると、選択された圧縮アルゴリズム(およびコーデック)がデータをより効果的に圧縮できるようになります。

> テーブル内のすべてのカラムは、キー自体に含まれているかどうかに関係なく、指定された順序キーの値に基づいてソートされます。たとえば、`CreationDate`をキーとして使用する場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定することができます - これは`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けされます。

順序キーの選択を支援するために、いくつかの簡単なルールを適用できます。以下のルールは時に競合することがあるため、順番に検討してください。ユーザーはこのプロセスから複数のキーを特定できますが、通常は4〜5個で十分です:

- 一般的なフィルタに合致するカラムを選択します。`WHERE`句で頻繁に使用されるカラムがある場合は、使用頻度の低いカラムよりも優先してキーに含めます。
  フィルタリング時に全体の行の大部分を除外するのに役立つカラムを優先します。これにより、読み取る必要のあるデータ量が削減されます。
- テーブル内の他のカラムと高い相関関係を持つ可能性が高いカラムを優先します。これにより、これらの値も連続して格納されることが保証され、圧縮が向上します。
  順序キー内のカラムに対する`GROUP BY`および`ORDER BY`操作は、よりメモリ効率的に実行できます。

順序キーのカラムのサブセットを特定する際は、特定の順序でカラムを宣言します。この順序は、クエリにおけるセカンダリキーカラムのフィルタリング効率と、テーブルのデータファイルの圧縮率の両方に大きな影響を与える可能性があります。一般的には、カーディナリティの昇順でキーを並べるのが最適です。ただし、順序キーの後方に現れるカラムでのフィルタリングは、タプルの前方に現れるカラムでのフィルタリングよりも効率が低くなることを考慮する必要があります。これらの動作のバランスを取り、アクセスパターンを考慮してください(そして最も重要なことは、バリエーションをテストすることです)。

### 例 {#example}

上記のガイドラインを`posts`テーブルに適用し、ユーザーが日付と投稿タイプでフィルタリングする分析を実行したいと仮定します。例えば:

「過去3ヶ月で最もコメントが多かった質問はどれか」

最適化された型を持つが順序キーを持たない以前の`posts_v2`テーブルを使用した、この質問に対するクエリ:

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

> このクエリは、6000万行すべてが線形スキャンされているにもかかわらず非常に高速です - ClickHouseは単に高速なのです :) TBやPBスケールでは順序キーが価値があることを信じてください!

`PostTypeId`と`CreationDate`のカラムを順序キーとして選択しましょう。


おそらくこのケースでは、ユーザーは常に `PostTypeId` でフィルタリングすると想定しています。これはカーディナリティが 8 であり、並び替えキーの最初の要素として妥当な選択です。日付粒度でのフィルタリングで十分と考えられるため（`DateTime` 型でのフィルタリングも引き続き恩恵を受けられます）、キーの 2 番目の要素として `toDate(CreationDate)` を使用します。これにより、日付を 16 で表現できるため、より小さなインデックスとなり、フィルタリングが高速化されます。最後のキー要素は `CommentCount` で、コメント数の多い投稿（最終的なソート対象）を見つけやすくするためのものです。

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
COMMENT 'ソートキー'

--既存のテーブルからデータを投入

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
ピークメモリ使用量: 6.41 GiB.

このクエリにより、クエリ応答時間が3倍以上改善されます:

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

特定の型と適切な並び替えキーを使用することで得られる圧縮の改善に関心があるユーザーは、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) を参照してください。さらに圧縮を向上させる必要がある場合は、[Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) のセクションも参照することをお勧めします。


## 次のステップ: データモデリング技法 {#next-data-modeling-techniques}

ここまでは単一のテーブルのみを移行してきました。これによりClickHouseのコア概念をいくつか紹介することができましたが、残念ながらほとんどのスキーマはこれほど単純ではありません。

以下に示す他のガイドでは、最適なClickHouseクエリのために広範なスキーマを再構築するための複数の技法を探求します。このプロセス全体を通じて、`Posts`をほとんどの分析クエリが実行される中心的なテーブルとして維持することを目指します。他のテーブルも単独でクエリできますが、ほとんどの分析は`posts`のコンテキストで実行されることを想定しています。

> このセクション全体を通じて、他のテーブルの最適化されたバリアントを使用します。これらのスキーマは提供しますが、簡潔さのために行った決定の説明は省略します。これらは前述のルールに基づいており、決定の推論は読者に委ねます。

以下のアプローチはすべて、読み取りを最適化しクエリパフォーマンスを向上させるためにJOINの使用を最小限に抑えることを目的としています。JOINはClickHouseで完全にサポートされていますが、最適なパフォーマンスを達成するために控えめに使用すること(JOINクエリで2〜3テーブルは問題ありません)を推奨します。

> ClickHouseには外部キーの概念がありません。これはJOINを禁止するものではありませんが、参照整合性はアプリケーションレベルでユーザーが管理する必要があることを意味します。ClickHouseのようなOLAPシステムでは、データ整合性は、大きなオーバーヘッドが発生するデータベース自体で強制されるのではなく、アプリケーションレベルまたはデータ取り込みプロセス中に管理されることが多くあります。このアプローチにより、柔軟性が高まり、データ挿入が高速化されます。これは、非常に大規模なデータセットでの読み取りおよび挿入クエリの速度とスケーラビリティに焦点を当てたClickHouseの方針と一致しています。

クエリ時のJOINの使用を最小限に抑えるために、ユーザーにはいくつかのツール/アプローチがあります:

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを結合し、1:1でない関係に複合型を使用してデータを非正規化します。これには、クエリ時から挿入時にJOINを移動することが含まれることがよくあります。
- [**Dictionary**](/dictionary) - 直接的なJOINとキーバリュー検索を処理するためのClickHouse固有の機能です。
- [**インクリメンタルマテリアライズドビュー**](/materialized-view/incremental-materialized-view) - 集計値を段階的に計算する機能を含め、計算のコストをクエリ時から挿入時に移行するためのClickHouse機能です。
- [**リフレッシュ可能なマテリアライズドビュー**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使用されるマテリアライズドビューと同様に、クエリの結果を定期的に計算し、結果をキャッシュすることができます。

各ガイドでこれらのアプローチをそれぞれ探求し、Stack Overflowデータセットの問題解決にどのように適用できるかを示す例とともに、それぞれが適切な場合を強調します。
