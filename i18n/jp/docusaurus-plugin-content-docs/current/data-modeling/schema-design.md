---
slug: /data-modeling/schema-design
title: 'スキーマ設計'
description: 'クエリパフォーマンスを最適化する ClickHouse スキーマ設計'
keywords: ['スキーマ', 'スキーマ設計', 'クエリ最適化']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

効果的なスキーマ設計を理解することは、ClickHouse のパフォーマンスを最適化するうえでの重要な鍵です。スキーマ設計にはしばしばトレードオフを伴う選択が含まれ、提供されるクエリの内容に加え、データの更新頻度、レイテンシ要件、データ量などの要因によって最適なアプローチは異なります。本ガイドでは、ClickHouse のパフォーマンスを最適化するためのスキーマ設計のベストプラクティスとデータモデリング手法を概説します。


## Stack Overflow データセット {#stack-overflow-dataset}

このガイドの例では、Stack Overflow データセットのサブセットを使用します。これには、2008 年から 2024 年 4 月までに Stack Overflow 上で行われたすべての投稿、投票、ユーザー、コメント、およびバッジが含まれます。このデータは、以下のスキーマに従った Parquet 形式で、S3 バケット `s3://datasets-documentation/stackoverflow/parquet/` から利用できます:

> 示されている主キーおよびリレーションは制約としては強制されていません（Parquet はテーブル形式ではなくファイル形式であるため）ので、データ同士の関係性と、それぞれが持つ一意キーを示しているに過ぎません。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow スキーマ"/>

<br />

Stack Overflow データセットには、相互に関連する複数のテーブルが含まれています。いかなるデータモデリング作業においても、まずは主となるテーブルの読み込みに集中することを推奨します。これは必ずしも最大のテーブルとは限らず、分析クエリの大半が発行されると想定されるテーブルです。これにより、主な ClickHouse の概念や型に慣れることができます。特に、主に OLTP を扱ってきたバックグラウンドから移行する場合には重要です。このテーブルは、追加のテーブルを取り込むにつれて、ClickHouse の機能を十分に活用し、最適なパフォーマンスを得るために再モデリングが必要になる場合があります。

上記のスキーマは、このガイドの目的上、意図的に最適化されていません。



## 初期スキーマを定義する

`posts` テーブルはほとんどの分析クエリの対象となるため、このテーブルのスキーマ定義に焦点を当てます。このデータは、パブリックな S3 バケット `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` に年ごとのファイルとして配置されています。

> Parquet 形式で S3 からデータを読み込む方法は、ClickHouse にデータをロードする最も一般的で推奨される方法です。ClickHouse は Parquet の処理に最適化されており、S3 から毎秒数千万行を読み取りおよび挿入することができます。

ClickHouse には、データセットの型を自動的に特定するスキーマ推論機能があります。これは Parquet を含むすべてのデータ形式でサポートされています。この機能を利用して、S3 テーブル関数と [`DESCRIBE`](/sql-reference/statements/describe-table) コマンドを通じて、このデータに対する ClickHouse の型を特定できます。以下の例では、`stackoverflow/parquet/posts` フォルダ内のすべてのファイルを読み取るために、グロブパターン `*.parquet` を使用しています。

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

> [s3 table function](/sql-reference/table-functions/s3) を使用すると、S3 上のデータを ClickHouse から直接クエリできます。この関数は、ClickHouse がサポートするすべてのファイル形式と互換性があります。

これにより、まずは最適化されていない初期スキーマが得られます。デフォルトでは、ClickHouse はこれらを対応する Nullable 型にマッピングします。これらの型を用いて、単純な `CREATE EMPTY AS SELECT` コマンドで ClickHouse テーブルを作成できます。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつか重要なポイントがあります。

このコマンドを実行した後、`posts` テーブルは空のままです。データはまだロードされていません。
テーブルエンジンとして MergeTree を指定しました。MergeTree は、一般的に最もよく使われる ClickHouse のテーブルエンジンです。ClickHouse のツールボックスにあるマルチツールのような存在で、PB 級のデータを扱うことができ、ほとんどの分析ユースケースに対応します。ほかにも、効率的な更新をサポートする必要がある CDC（変更データキャプチャ） などのユースケース向けに、別のテーブルエンジンも存在します。

`ORDER BY ()` という句は、インデックスが存在しないこと、より正確にはデータに順序がないことを意味します。これについては後ほど詳しく説明します。今のところは、すべてのクエリが線形スキャンを必要とする、という点だけ理解しておいてください。

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

初期スキーマを定義したら、`INSERT INTO SELECT` を使用してデータを投入できます。この際、S3 テーブル関数を使用してデータを読み込みます。以下は、8コアの ClickHouse Cloud インスタンスで約2分かけて `posts` データを読み込む例です。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
````

> 上記のクエリは 6,000 万行を読み込みます。これは ClickHouse にとっては小規模ですが、インターネット接続が遅い環境では、データの一部だけを読み込みたい場合があるかもしれません。その場合は、読み込みたい年を glob パターンで指定するだけで実現できます。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` や `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。glob パターンを使ってファイルのサブセットを指定する方法については[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。


## 型の最適化 {#optimizing-types}

ClickHouse のクエリ性能の秘訣の 1 つは圧縮です。

ディスク上のデータ量が少ないほど I/O が減り、結果としてクエリや INSERT が高速になります。CPU に対する圧縮アルゴリズムのオーバーヘッドは、多くの場合 I/O の削減によって十分に相殺されます。したがって、ClickHouse のクエリを高速にする際には、まずデータの圧縮率を改善することに注力すべきです。

> ClickHouse がなぜここまで高い圧縮率を実現できるかについては、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を参照してください。要約すると、カラム指向データベースとして、値はカラム順に書き込まれます。これらの値がソートされている場合、同じ値が互いに隣接するようになります。圧縮アルゴリズムは、このような連続したデータパターンを利用します。加えて、ClickHouse にはコーデックやきめ細かいデータ型が用意されており、ユーザーは圧縮手法をさらに調整できます。

ClickHouse における圧縮は主に 3 つの要素の影響を受けます: 並び替えキー、データ型、および使用されるコーデックです。これらはすべてスキーマを通じて設定されます。

圧縮率とクエリ性能における最初の大きな改善は、単純な型の最適化プロセスによって得られます。スキーマを最適化するために、いくつかの簡単なルールを適用できます:

- **厳密な型を使用する** - 初期スキーマでは、多くのカラムで明らかに数値であるにもかかわらず String が使用されていました。正しい型を使用することで、フィルタリングや集計時に期待通りのセマンティクスが保証されます。同じことは日付型にも当てはまり、Parquet ファイルではこれらが正しく指定されています。
- **Nullable カラムを避ける** - デフォルトでは、上記のカラムは Null を取りうるものと想定されています。Nullable 型では、クエリが空値と Null 値の違いを判別できるようになります。これは UInt8 型の別カラムを生成します。この追加カラムは、ユーザーが nullable カラムを扱うたびに処理する必要があります。その結果、追加のストレージ領域が必要になり、ほぼ確実にクエリ性能に悪影響を与えます。ある型におけるデフォルトの空値と Null とで意味上の違いがある場合にのみ Nullable を使用してください。例えば、`ViewCount` カラムにおいて、空値を 0 で表現しても、ほとんどのクエリでは十分であり、結果に影響しないでしょう。空値を別扱いにすべき場合、多くの場合はフィルタによってクエリから除外することもできます。
- **数値型は最小限の精度を使用する** - ClickHouse には、さまざまな数値範囲と精度向けに設計された複数の数値型があります。常に、カラムを表現するために使用するビット数を最小化することを目指してください。たとえば異なるサイズの整数型 (例: Int16) に加えて、ClickHouse には最小値が 0 の符号なしバリアントもあります。これにより、カラムに使用するビット数をさらに削減できます。例えば UInt16 の最大値は 65535 で、Int16 の 2 倍です。可能であれば、より大きな符号付き型よりもこれらの型を優先してください。
- **日付型の精度を最小限にする** - ClickHouse は複数の日付および日時型をサポートしています。Date と Date32 は純粋な日付の保存に使用でき、後者はより多くのビットと引き換えに、より広い日付範囲をサポートします。DateTime と DateTime64 は日時をサポートします。DateTime は秒単位の粒度に制限され、32 ビットを使用します。名前が示すように、DateTime64 は 64 ビットを使用しますが、ナノ秒単位までの粒度をサポートします。常に、クエリで許容される中で最も粗いバージョンを選択し、必要なビット数を最小化してください。
- **LowCardinality を使用する** - 少数のユニーク値しか持たない数値、文字列、Date、または DateTime カラムは、LowCardinality 型を使用してエンコードできる可能性があります。これは辞書エンコードによって値を格納し、ディスク上のサイズを削減します。ユニーク値が 1 万未満のカラムについて検討してください。
- **FixedString は特殊なケースに使用する** - 固定長の文字列は、FixedString 型でエンコードできます (例: 言語コードや通貨コード)。これは、データ長が正確に N バイトである場合に効率的です。それ以外のケースでは、効率を下げる可能性が高く、通常は LowCardinality を使用することが推奨されます。
- **データ検証のための Enum** - Enum 型は、列挙型を効率的にエンコードするために使用できます。Enum は、保持する必要があるユニーク値の数に応じて、8 ビットまたは 16 ビットにできます。INSERT 時の関連する検証 (宣言されていない値は拒否される) が必要な場合や、Enum の値に自然な順序があり、それを利用するクエリを実行したい場合に使用を検討してください。例えば、ユーザーのフィードバックを含むカラムに `Enum(':(' = 1, ':|' = 2, ':)' = 3)` のような定義を持たせることを想像してください。

> ヒント: すべてのカラムの値の範囲とユニーク値の数を調べるには、`SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical` という簡単なクエリを使用できます。これは高コストになりうるため、データの小さなサブセットに対して実行することを推奨します。このクエリで正確な結果を得るには、数値が少なくとも数値型として定義されている必要があります (つまり String ではないこと)。

これらの簡単なルールを posts テーブルに適用することで、各カラムに対する最適な型を特定できます。



| 列                       | 数値であるか | 最小, 最大                                                       | ユニーク値    | NULL 値 | コメント                                                                      | 最適化型                                                                                                                                                         |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | はい     | 1, 8                                                         | 8        | なし     |                                                                           | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい     | 0, 78285170                                                  | 12282094 | はい     | Null と 0 を区別する                                                            | UInt32                                                                                                                                                       |
| `CreationDate`          | いいえ    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | いいえ    | ミリ秒精度が不要な場合は、DateTime を使用します                                              | DateTime                                                                                                                                                     |
| `Score`                 | はい     | -217, 34970                                                  | 3236     | いいえ    |                                                                           | Int32                                                                                                                                                        |
| `ViewCount`             | はい     | 2, 13962748                                                  | 170867   | いいえ    |                                                                           | UInt32                                                                                                                                                       |
| `Body`                  | いいえ    | -                                                            | *        | いいえ    |                                                                           | 文字列                                                                                                                                                          |
| `OwnerUserId`           | はい     | -1, 4056915                                                  | 6256237  | はい     |                                                                           | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | いいえ    | -                                                            | 181251   | はい     | NULL を空文字列として扱う                                                           | String                                                                                                                                                       |
| `LastEditorUserId`      | はい     | -1, 9999993                                                  | 1104694  | はい     | 0 は未使用の値であり、Null の代わりとして使用できる                                             | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | いいえ    | *                                                            | 70952    | はい     | Null は空文字列と見なす。LowCardinality も試したが、特にメリットはなかった。                          | String                                                                                                                                                       |
| `LastEditDate`          | いいえ    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | いいえ    | ミリ秒精度が不要な場合は、DateTime 型を使用する                                              | DateTime                                                                                                                                                     |
| `LastActivityDate`      | いいえ    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | いいえ    | ミリ秒精度が不要な場合は、DateTime を使用します                                              | DateTime                                                                                                                                                     |
| `Title`                 | いいえ    | -                                                            | *        | いいえ    | Null を空文字列として扱う                                                           | String                                                                                                                                                       |
| `タグ`                    | いいえ    | -                                                            | *        | いいえ    | NULL を空文字列として扱う                                                           | String                                                                                                                                                       |
| `AnswerCount`           | はい     | 0, 518                                                       | 216      | いいえ    | Null と 0 を同一視する                                                           | UInt16                                                                                                                                                       |
| `CommentCount`          | はい     | 0, 135                                                       | 100      | いいえ    | NULL と 0 を同一視する                                                           | UInt8                                                                                                                                                        |
| `FavoriteCount`         | はい     | 0, 225                                                       | 6        | はい     | Null と 0 を同一視する                                                           | UInt8                                                                                                                                                        |
| `ContentLicense`        | いいえ    | -                                                            | 3        | いいえ    | LowCardinality は FixedString より高いパフォーマンスを発揮します                            | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | いいえ    | *                                                            | 20696028 | はい     | Null を空文字列として扱う                                                           | 文字列                                                                                                                                                          |
| `CommunityOwnedDate`    | いいえ    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | はい     | Null 値のデフォルトは 1970-01-01 とする。ミリ秒単位の精度は不要なため、DateTime 型を使用する               | DateTime                                                                                                                                                     |
| `ClosedDate`            | いいえ    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | はい     | Null 値の既定値として 1970-01-01 を使用することを検討してください。ミリ秒精度は不要なため、DateTime 型を使用してください | DateTime                                                                                                                                                     |

<br />

すると、上記のようなスキーマになります。

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

前のテーブルからデータを読み出し、このテーブルに挿入する単純な `INSERT INTO SELECT` 文でデータを投入できます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマでは NULL は保持されません。上記の insert によって、それぞれの型に対するデフォルト値へ暗黙的に変換されます。整数型なら 0、文字列型なら空文字列です。ClickHouse は、あらゆる数値を自動的に対象の精度へ変換します。
Primary (Ordering) Keys in ClickHouse
OLTP データベースから移行してくるユーザーは、しばしば ClickHouse における同等の概念を探します。


## オーダリングキーの選択

ClickHouse がよく利用されるスケールでは、メモリ効率とディスク効率が最重要になります。データは、`parts` と呼ばれるチャンク単位で ClickHouse のテーブルに書き込まれ、バックグラウンドでこれらのパーツをマージするためのルールが適用されます。ClickHouse では、それぞれのパーツが独自のプライマリインデックスを持ちます。パーツがマージされると、マージされたパーツのプライマリインデックスも同様にマージされます。1 つのパーツに対するプライマリインデックスは、行グループごとに 1 つのインデックスエントリを持ち、この手法は疎インデックス（sparse indexing）と呼ばれます。

<Image img={schemaDesignIndices} size="md" alt="ClickHouse における疎インデックス" />

ClickHouse で選択したキーは、インデックスだけでなく、データがディスク上に書き込まれる順序も決定します。このため、圧縮率に大きく影響し、その結果としてクエリ性能にも影響を与えます。ほとんどのカラムの値が連続した順序で書き込まれるようなオーダリングキーを選択すると、選択した圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようになります。

> テーブル内のすべてのカラムは、指定されたオーダリングキーの値に基づいてソートされます。これは、そのカラムがキー自体に含まれているかどうかに関係ありません。たとえば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は、`CreationDate` カラムの値の順序に対応します。複数のオーダリングキーを指定することも可能で、これは `SELECT` クエリにおける `ORDER BY` 句と同じセマンティクスで並び替えを行います。

いくつかの単純なルールを適用することで、オーダリングキーの選択を助けることができます。以下のルールは互いに衝突する場合もあるため、順番に検討してください。ユーザーはこのプロセスから複数のキー候補を洗い出すことができ、通常は 4〜5 個程度で十分です。

* よく使われるフィルタ条件に合致するカラムを選択します。`WHERE` 句で頻繁に使用されるカラムがある場合、使用頻度の低いカラムよりも、それらを優先的にキーに含めます。
  フィルタ適用時に、全体の行数の大部分を除外できるようなカラムを優先すると、読み取る必要のあるデータ量を削減できます。
* テーブル内の他のカラムと高い相関が見込まれるカラムを優先します。これにより、それらの値も連続して格納されやすくなり、圧縮が改善されます。
  オーダリングキーに含まれるカラムに対する `GROUP BY` や `ORDER BY` 演算は、よりメモリ効率よく実行できます。

オーダリングキーに含めるカラムの部分集合を特定したら、それらのカラムを特定の順序で宣言します。この順序は、クエリでのセカンダリキーとなるカラムに対するフィルタ効率と、テーブルのデータファイルに対する圧縮率の両方に大きな影響を与えます。一般的には、カーディナリティの昇順でキーを並べるのが最適です。ただし、オーダリングキーの後ろに現れるカラムに対するフィルタは、先頭に近いカラムに対するフィルタよりも効率が低くなるという事実とのバランスを取る必要があります。これらの挙動とアクセスパターンを総合的に考慮し（そして何より重要なのは、候補パターンを実際にテストすることです）、バランスをとってください。

### 例

上記のガイドラインを `posts` テーブルに適用すると、ユーザーが日付と投稿タイプでフィルタされた分析を行いたいと仮定してみましょう。たとえば次のようなものです:

「過去 3 ヶ月で最も多くコメントされた質問はどれか」。

型を最適化したものの、オーダリングキーをまだ定義していない `posts_v2` テーブルを使用して、この問いに対するクエリは次のようになります。

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

> ここでのクエリは、6000万行すべてを全件走査しているにもかかわらず非常に高速です。ClickHouse はそれだけ高速なのです :) TB～PB スケールでは、オーダリングキーを設定する価値があるという点は、ぜひ信じてください。

`PostTypeId` と `CreationDate` の列をオーダリングキーとして選択してみましょう。


今回のケースでは、ユーザーが常に `PostTypeId` でフィルタリングすると想定します。これは基数が 8 であり、並び替えキーの最初の要素として論理的な選択です。日付粒度でのフィルタリングで十分であると判断できるため（`datetime` によるフィルタリングでも依然として効果があります）、キーの 2 番目の要素として `toDate(CreationDate)` を使用します。これによりインデックスも小さくなります。日付は 16 で表現できるため、フィルタリングの高速化につながります。最後のキー要素は `CommentCount` で、コメント数の多い投稿（最終ソート）を見つけるのを支援します。

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
Peak memory usage: 6.41 GiB.

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

特定の型と適切な並び替えキーを使用することで得られる圧縮効率の向上に関心がある場合は、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) を参照してください。さらに圧縮を改善する必要がある場合は、[Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) のセクションも併せて参照することを推奨します。


## 次のステップ: データモデリング手法 {#next-data-modeling-techniques}

ここまでで、移行したのは 1 つのテーブルだけです。これによって ClickHouse のいくつかのコアな概念を紹介することはできましたが、残念ながら多くのスキーマはここまで単純ではありません。

以下に挙げる他のガイドでは、より広いスキーマ全体を対象に、ClickHouse に最適化されたクエリを実行できるよう再構成するための、さまざまな手法を見ていきます。このプロセス全体を通じて、`Posts` を分析クエリの大半が実行される中心的なテーブルとして維持することを目標とします。他のテーブルを単独でクエリすることも可能ですが、多くの分析は `Posts` のコンテキストで実行されることを想定しています。

> このセクション全体を通して、他のテーブルについては最適化済みのバリエーションを使用します。これらのスキーマは提示しますが、簡潔さを優先して、どのような設計判断を行ったかの説明は省略しています。これらの判断は前述のルールに基づいており、その内容の推測は読者に委ねます。

以下のアプローチはいずれも、読み取りの最適化とクエリ性能の向上のために JOIN の必要性を最小限に抑えることを目的としています。ClickHouse では JOIN は完全にサポートされていますが、最適なパフォーマンスを得るために、JOIN クエリで使用するテーブル数は控えめにすることを推奨します（2〜3 テーブル程度であれば問題ありません）。

> ClickHouse には外部キーという概念がありません。これは JOIN を禁止するものではありませんが、参照整合性の維持はアプリケーションレベルでユーザーが管理する必要があることを意味します。ClickHouse のような OLAP システムでは、多くの場合、データの整合性はアプリケーションレベル、あるいはデータのインジェスト処理中に管理され、データベース自体が強制することはありません。なぜなら、それには大きなオーバーヘッドが伴うためです。このアプローチにより、柔軟性が増し、高速なデータ挿入が可能になります。これは、非常に大規模なデータセットに対する読み取りおよび挿入クエリの速度とスケーラビリティに重点を置く ClickHouse の設計思想と一致しています。

クエリ時における JOIN の使用を最小限にするために、ユーザーには次のようないくつかのツール／アプローチが用意されています。

- [**Denormalizing data**](/data-modeling/denormalization) - テーブルを結合し、1:1 ではないリレーションに対して複合型を用いることでデータを非正規化します。これは多くの場合、JOIN をクエリ時から挿入時へと移動することを意味します。
- [**Dictionaries**](/dictionary) - 直接的な JOIN やキー・バリュー型のルックアップを扱うための、ClickHouse 固有の機能です。
- [**Incremental Materialized Views**](/materialized-view/incremental-materialized-view) - 計算コストをクエリ時から挿入時へとシフトする ClickHouse の機能であり、集約値を増分的に計算することも可能です。
- [**Refreshable Materialized Views**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で利用されるマテリアライズドビューと同様に、クエリ結果を定期的に計算し、その結果をキャッシュとして保持できる機能です。

これらの各アプローチについて、それぞれのガイドで詳しく取り上げ、どのような状況で適切かを示しつつ、Stack Overflow データセットに対する実際の課題を解決するための適用例を示します。
