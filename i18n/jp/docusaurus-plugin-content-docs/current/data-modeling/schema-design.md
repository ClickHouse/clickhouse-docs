---
slug: /data-modeling/schema-design
title: 'スキーマ設計'
description: 'クエリ性能を最適化する ClickHouse スキーマ設計'
keywords: ['スキーマ', 'スキーマ設計', 'クエリ最適化']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

効果的なスキーマ設計を理解することは ClickHouse のパフォーマンスを最適化するうえで極めて重要であり、多くの場合トレードオフを伴う選択が発生します。最適なアプローチは、処理されるクエリだけでなく、データの更新頻度、レイテンシ要件、データ量といった要因にも左右されます。本ガイドでは、ClickHouse のパフォーマンスを最適化するためのスキーマ設計のベストプラクティスとデータモデリング手法の概要を示します。


## Stack Overflowデータセット {#stack-overflow-dataset}

本ガイドの例では、Stack Overflowデータセットのサブセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての投稿、投票、ユーザー、コメント、バッジが含まれています。このデータは、S3バケット`s3://datasets-documentation/stackoverflow/parquet/`配下で、以下のスキーマを使用したParquet形式で利用できます:

> 示されている主キーとリレーションシップは制約によって強制されていません(Parquetはテーブル形式ではなくファイル形式です)。これらは純粋に、データがどのように関連しているか、およびデータが持つ一意キーを示すものです。

<Image img={stackOverflowSchema} size='lg' alt='Stack Overflowスキーマ' />

<br />

Stack Overflowデータセットには、複数の関連テーブルが含まれています。データモデリングタスクでは、まず主要なテーブルの読み込みに集中することを推奨します。これは必ずしも最大のテーブルである必要はなく、最も多くの分析クエリが実行されると予想されるテーブルを指します。これにより、ClickHouseの主要な概念と型に慣れることができます。特に、主にOLTPバックグラウンドを持つ場合には重要です。このテーブルは、ClickHouseの機能を最大限に活用し最適なパフォーマンスを得るために、追加のテーブルが加わるにつれて再モデリングが必要になる場合があります。

上記のスキーマは、本ガイドの目的上、意図的に最適化されていません。


## 初期スキーマの確立 {#establish-initial-schema}

`posts`テーブルはほとんどの分析クエリの対象となるため、このテーブルのスキーマ確立に焦点を当てます。このデータは、パブリックS3バケット`s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet`で利用可能であり、年ごとに1つのファイルが存在します。

> Parquet形式でS3からデータを読み込むことは、ClickHouseへのデータ読み込みにおいて最も一般的で推奨される方法です。ClickHouseはParquetの処理に最適化されており、S3から毎秒数千万行を読み取り、挿入することが可能です。

ClickHouseは、データセットの型を自動的に識別するスキーマ推論機能を提供しています。この機能はParquetを含むすべてのデータ形式でサポートされています。s3テーブル関数と[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使用して、この機能を活用し、データのClickHouse型を識別できます。以下では、globパターン`*.parquet`を使用して`stackoverflow/parquet/posts`フォルダ内のすべてのファイルを読み取ります。

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

> [s3テーブル関数](/sql-reference/table-functions/s3)を使用すると、ClickHouseからS3内のデータをその場でクエリできます。この関数は、ClickHouseがサポートするすべてのファイル形式と互換性があります。

これにより、最適化されていない初期スキーマが得られます。デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。これらの型を使用して、シンプルな`CREATE EMPTY AS SELECT`コマンドでClickHouseテーブルを作成できます。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつかの重要なポイント:

このコマンドを実行した後、postsテーブルは空です。データは読み込まれていません。
テーブルエンジンとしてMergeTreeを指定しました。MergeTreeは、最も一般的に使用されるClickHouseテーブルエンジンです。これはClickHouseツールボックスの万能ツールであり、PB規模のデータを処理でき、ほとんどの分析ユースケースに対応します。効率的な更新をサポートする必要があるCDCなどのユースケース向けには、他のテーブルエンジンも存在します。

`ORDER BY ()`句は、インデックスがなく、より具体的にはデータに順序がないことを意味します。これについては後で詳しく説明します。今のところ、すべてのクエリが線形スキャンを必要とすることだけを理解しておいてください。

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

初期スキーマを定義したので、`INSERT INTO SELECT`を使用し、s3テーブル関数でデータを読み込んでデータを投入できます。以下は、8コアのClickHouse Cloudインスタンスで`posts`データを約2分で読み込む例です。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
````

> 上記のクエリは 6,000 万行をロードします。ClickHouse にとっては小規模ですが、インターネット接続が遅いユーザーの中には、データのサブセットのみをロードしたい場合もあるでしょう。これは、ロードしたい年を glob パターンで指定するだけで実現できます。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` や `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。glob パターンを使用して対象とするファイルのサブセットを指定する方法については[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。


## 型の最適化 {#optimizing-types}

ClickHouseのクエリパフォーマンスの秘訣の一つは圧縮です。

ディスク上のデータ量が少ないほどI/Oが減少し、クエリと挿入が高速化されます。圧縮アルゴリズムによるCPUのオーバーヘッドは、ほとんどの場合、IOの削減によって相殺されます。したがって、ClickHouseクエリの高速化を図る際には、データの圧縮改善を最優先に取り組むべきです。

> ClickHouseがデータを効率的に圧縮できる理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を推奨します。要約すると、カラム指向データベースとして、値はカラム順に書き込まれます。これらの値がソートされている場合、同じ値が隣接して配置されます。圧縮アルゴリズムは、このような連続したデータパターンを活用します。さらに、ClickHouseにはコーデックと細分化されたデータ型があり、ユーザーは圧縮技術をさらに調整できます。

ClickHouseにおける圧縮は、主に3つの要因に影響されます。それは、順序キー、データ型、使用されるコーデックです。これらはすべてスキーマを通じて設定されます。

圧縮とクエリパフォーマンスにおける最大の初期改善は、型の最適化という単純なプロセスによって得られます。スキーマを最適化するために、いくつかの簡単なルールを適用できます。

- **厳密な型を使用する** - 初期スキーマでは、明らかに数値である多くのカラムにString型を使用していました。正しい型を使用することで、フィルタリングや集計時に期待される意味論が保証されます。これは日付型にも同様に適用され、Parquetファイルでは正しく提供されています。
- **Nullableカラムを避ける** - デフォルトでは、上記のカラムはNullと想定されています。Nullable型により、クエリは空の値とNull値の違いを判別できます。これにより、UInt8型の別カラムが作成されます。この追加カラムは、ユーザーがnullableカラムを操作するたびに処理される必要があります。これにより、追加のストレージ容量が使用され、ほぼ常にクエリパフォーマンスに悪影響を及ぼします。型のデフォルト空値とNullの間に違いがある場合にのみNullableを使用してください。たとえば、`ViewCount`カラムの空値に0を使用すれば、ほとんどのクエリで十分であり、結果に影響を与えません。空値を異なる方法で扱う必要がある場合は、フィルタを使用してクエリから除外することもできます。
- **数値型には最小限の精度を使用する** - ClickHouseには、異なる数値範囲と精度に対応した多数の数値型があります。常にカラムを表現するために使用するビット数を最小化することを目指してください。Int16などの異なるサイズの整数に加えて、ClickHouseは最小値が0である符号なし型も提供しています。これにより、カラムに使用するビット数を削減できます。たとえば、UInt16の最大値は65535で、Int16の2倍です。可能であれば、より大きな符号付き型よりもこれらの型を優先してください。
- **日付型には最小限の精度を使用する** - ClickHouseは、複数の日付型と日時型をサポートしています。DateとDate32は純粋な日付の保存に使用でき、後者はより多くのビットを使用する代わりに、より広い日付範囲をサポートします。DateTimeとDateTime64は日時をサポートします。DateTimeは秒単位の粒度に制限され、32ビットを使用します。DateTime64は、その名が示すとおり64ビットを使用しますが、ナノ秒単位の粒度までサポートします。常に、クエリに許容される粗い方のバージョンを選択し、必要なビット数を最小化してください。
- **LowCardinalityを使用する** - 一意の値の数が少ない数値、文字列、Date、またはDateTimeカラムは、LowCardinality型を使用してエンコードできる可能性があります。この辞書エンコーディングにより値がエンコードされ、ディスク上のサイズが削減されます。一意の値が10,000未満のカラムに対してこれを検討してください。
- **特殊なケースにはFixedStringを使用する** - 固定長の文字列は、FixedString型でエンコードできます。たとえば、言語コードや通貨コードなどです。これは、データが正確にNバイトの長さを持つ場合に効率的です。それ以外のすべてのケースでは、効率が低下する可能性が高く、LowCardinalityが推奨されます。
- **データ検証にはEnumを使用する** - Enum型は、列挙型を効率的にエンコードするために使用できます。Enumは、保存する必要がある一意の値の数に応じて、8ビットまたは16ビットのいずれかになります。挿入時の関連する検証が必要な場合(宣言されていない値は拒否されます)、またはEnum値の自然な順序を活用するクエリを実行したい場合に、これの使用を検討してください。たとえば、ユーザーの応答を含むフィードバックカラム`Enum(':(' = 1, ':|' = 2, ':)' = 3)`を想像してください。

> ヒント: すべてのカラムの範囲と個別値の数を見つけるには、ユーザーは簡単なクエリ`SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。これはコストがかかる可能性があるため、データのより小さなサブセットに対して実行することを推奨します。このクエリで正確な結果を得るには、数値が少なくともそのように定義されている必要があります。つまり、String型ではないことが必要です。

これらの簡単なルールをpostsテーブルに適用することで、各カラムの最適な型を特定できます。


| 列                       | 数値かどうか | 最小値、最大値                                                      | 一意な値     | NULL 値 | コメント                                                                           | 最適化型                                                                                                                                                         |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | ------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい     | 1, 8                                                         | 8        | いいえ    |                                                                                | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい     | 0, 78285170                                                  | 12282094 | はい     | Null と 0 を区別する                                                                 | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ    | ミリ秒精度が不要な場合は、DateTime を使用する                                                    | DateTime                                                                                                                                                     |
| `Score`                 | はい     | -217, 34970                                                  | 3236     | いいえ    |                                                                                | Int32                                                                                                                                                        |
| `ViewCount`             | はい     | 2, 13962748                                                  | 170867   | いいえ    |                                                                                | UInt32                                                                                                                                                       |
| `Body`                  | いいえ    | -                                                            | *        | いいえ    |                                                                                | 文字列                                                                                                                                                          |
| `OwnerUserId`           | はい     | -1, 4056915                                                  | 6256237  | はい     |                                                                                | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ    | -                                                            | 181251   | はい     | NULL を空文字列として扱う                                                                | String                                                                                                                                                       |
| `LastEditorUserId`      | はい     | -1, 9999993                                                  | 1104694  | はい     | 0 は未使用の値であり、Null の代用として使用できる                                                   | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ    | *                                                            | 70952    | はい     | Null は空文字列として扱う。LowCardinality も試したが、メリットは得られなかった                              | String                                                                                                                                                       |
| `LastEditDate`          | いいえ    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用します                                                | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ    | ミリ秒単位の精度が不要な場合は、DateTime を使用する                                                 | DateTime                                                                                                                                                     |
| `タイトル`                  | いいえ    | -                                                            | *        | いいえ    | NULL を空文字列として扱う                                                                | String                                                                                                                                                       |
| `タグ`                    | いいえ    | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                                | String                                                                                                                                                       |
| `AnswerCount`           | はい     | 0, 518                                                       | 216      | いいえ    | Null と 0 を同一視する                                                                | UInt16                                                                                                                                                       |
| `CommentCount`          | はい     | 0, 135                                                       | 100      | いいえ    | Null と 0 を同一視する                                                                | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい     | 0, 225                                                       | 6        | はい     | Null と 0 を同一視する                                                                | UInt8                                                                                                                                                        |
| `ContentLicense`        | いいえ    | -                                                            | 3        | いいえ    | LowCardinality は FixedString より高性能                                             | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ    | *                                                            | 20696028 | はい     | Null を空文字列として扱う                                                                | String                                                                                                                                                       |
| `CommunityOwnedDate`    | いいえ    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい     | Null のデフォルト値には 1970-01-01 を使用することを検討してください。ミリ秒精度は不要なので、DateTime 型を使用してください     | DateTime                                                                                                                                                     |
| `ClosedDate`            | いいえ    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい     | Null のデフォルト値として 1970-01-01 を使用することを検討してください。ミリ秒単位の精度は不要なため、DateTime 型を使用してください | DateTime                                                                                                                                                     |

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

以前のテーブルからデータを読み取り、このテーブルに挿入する単純な `INSERT INTO ... SELECT` 文で、これを埋めることができます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマでは、null は一切保持しません。上記の `INSERT` は、これらをそれぞれの型に応じたデフォルト値に暗黙的に変換します。整数型であれば 0、文字列型であれば空文字列になります。ClickHouse は、あわせて数値を対象の精度に自動変換します。
ClickHouse におけるプライマリ（並び替え）キー
OLTP データベースを利用してきたユーザーは、ClickHouse における同等の概念を探すことがよくあります。


## 順序キーの選択 {#choosing-an-ordering-key}

ClickHouseが使用される規模では、メモリとディスクの効率性が最も重要です。データはパートと呼ばれるチャンク単位でClickHouseテーブルに書き込まれ、バックグラウンドでパートをマージするためのルールが適用されます。ClickHouseでは、各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージされたパートのプライマリインデックスもマージされます。パートのプライマリインデックスは、行のグループごとに1つのインデックスエントリを持ちます。この技術はスパースインデックスと呼ばれます。

<Image
  img={schemaDesignIndices}
  size='md'
  alt='ClickHouseにおけるスパースインデックス'
/>

ClickHouseで選択されたキーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を与え、それがクエリパフォーマンスに影響を及ぼす可能性があります。ほとんどのカラムの値が連続した順序で書き込まれるようにする順序キーは、選択された圧縮アルゴリズム(およびコーデック)がデータをより効果的に圧縮できるようにします。

> テーブル内のすべてのカラムは、キー自体に含まれているかどうかに関係なく、指定された順序キーの値に基づいてソートされます。たとえば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定することができます。これは`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けされます。

順序キーの選択を支援するために、いくつかの簡単なルールを適用できます。以下のルールは時に競合することがあるため、順番に検討してください。ユーザーはこのプロセスから複数のキーを特定できますが、通常は4〜5個で十分です:

- 一般的なフィルタに合致するカラムを選択します。`WHERE`句で頻繁に使用されるカラムがある場合、使用頻度の低いカラムよりも優先してキーに含めます。
  フィルタリング時に全体の行の大部分を除外するのに役立つカラムを優先します。これにより、読み取る必要があるデータ量が削減されます。
- テーブル内の他のカラムと高い相関関係を持つ可能性が高いカラムを優先します。これにより、これらの値も連続して格納されることが保証され、圧縮が向上します。
  順序キー内のカラムに対する`GROUP BY`および`ORDER BY`操作は、よりメモリ効率的に実行できます。

順序キーのカラムのサブセットを特定する際は、特定の順序でカラムを宣言します。この順序は、クエリにおけるセカンダリキーカラムのフィルタリングの効率性と、テーブルのデータファイルの圧縮率の両方に大きな影響を与える可能性があります。一般的に、カーディナリティの昇順でキーを並べるのが最適です。ただし、順序キーの後方に現れるカラムでのフィルタリングは、タプルの前方に現れるカラムでのフィルタリングよりも効率が低くなるという事実とバランスを取る必要があります。これらの動作のバランスを取り、アクセスパターンを考慮してください(そして最も重要なことは、バリアントをテストすることです)。

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

> このクエリは、6000万行すべてが線形スキャンされているにもかかわらず非常に高速です - ClickHouseは単に高速なのです :) TBやPBスケールでは順序キーが価値があることを信じていただく必要があります!

`PostTypeId`と`CreationDate`のカラムを順序キーとして選択しましょう。


たとえばこのケースでは、ユーザーは常に `PostTypeId` でフィルタリングすると仮定します。これは基数が 8 であり、並べ替えキーの最初の要素として論理的な選択です。日付粒度でのフィルタリングで十分である可能性が高いこと（`DateTime` 型でのフィルタリングでも引き続きメリットがあります）から、キーの 2 番目の要素としては `toDate(CreationDate)` を使用します。これにより、日付は 16 で表現できるためインデックスが小さくなり、フィルタリングも高速化されます。最後のキー要素には `CommentCount` を使用し、コメント数の多い投稿（最終的なソート対象）を見つけやすくします。

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

0 rows in set. 経過時間: 158.074秒 処理行数: 5982万行、76.21 GB (37万8420行/秒、482.14 MB/秒)
ピークメモリ使用量: 6.41 GiB。

この変更により、クエリの応答時間が3倍以上改善されます:

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

10 rows in set. 経過時間: 0.020秒 処理行数: 29万909行、21.03 MB (1465万行/秒、1.06 GB/秒)
```

特定の型や適切な `ORDER BY` キーの利用によって得られる圧縮の改善に関心がある方は、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) を参照してください。さらに圧縮を向上させる必要がある場合は、[Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) セクションも参照することを推奨します。


## 次のステップ: データモデリング技法 {#next-data-modeling-techniques}

これまでは単一のテーブルのみを移行してきました。これによりClickHouseの中核的な概念をいくつか紹介することができましたが、残念ながらほとんどのスキーマはこれほど単純ではありません。

以下に示す他のガイドでは、最適なClickHouseクエリのために広範なスキーマを再構築するための複数の技法を探求します。このプロセス全体を通じて、`Posts`をほとんどの分析クエリが実行される中心的なテーブルとして維持することを目指します。他のテーブルも単独でクエリできますが、ほとんどの分析は`posts`のコンテキストで実行されることを想定しています。

> このセクション全体を通じて、他のテーブルの最適化されたバリアントを使用します。これらのスキーマは提供しますが、簡潔さのため、行った決定については省略します。これらは前述のルールに基づいており、決定の推論は読者に委ねます。

以下のアプローチはすべて、読み取りを最適化しクエリパフォーマンスを向上させるためにJOINの使用を最小限に抑えることを目的としています。JOINはClickHouseで完全にサポートされていますが、最適なパフォーマンスを達成するために控えめに使用すること(JOINクエリで2〜3テーブルは問題ありません)を推奨します。

> ClickHouseには外部キーの概念がありません。これはJOINを禁止するものではありませんが、参照整合性はユーザーがアプリケーションレベルで管理する必要があることを意味します。ClickHouseのようなOLAPシステムでは、データベース自体で強制される場合に大きなオーバーヘッドが発生するため、データ整合性はアプリケーションレベルまたはデータ取り込みプロセス中に管理されることが一般的です。このアプローチにより、柔軟性が高まり、データ挿入が高速化されます。これは、非常に大規模なデータセットでの読み取りおよび挿入クエリの速度とスケーラビリティに焦点を当てたClickHouseの方針と一致しています。

クエリ時のJOINの使用を最小限に抑えるために、ユーザーにはいくつかのツール/アプローチがあります:

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを結合し、1:1でない関係に複合型を使用してデータを非正規化します。これには、JOINをクエリ時から挿入時に移動することが含まれることがよくあります。
- [**ディクショナリ**](/dictionary) - 直接的なJOINとキーバリュー検索を処理するためのClickHouse固有の機能です。
- [**インクリメンタルマテリアライズドビュー**](/materialized-view/incremental-materialized-view) - 集計値を段階的に計算する機能を含め、計算のコストをクエリ時から挿入時に移行するためのClickHouse機能です。
- [**リフレッシュ可能なマテリアライズドビュー**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使用されるマテリアライズドビューと同様に、クエリの結果を定期的に計算し、結果をキャッシュすることができます。

各ガイドでこれらのアプローチをそれぞれ探求し、Stack Overflowデータセットの問題解決にどのように適用できるかを示す例とともに、それぞれが適切な場合を明示します。
