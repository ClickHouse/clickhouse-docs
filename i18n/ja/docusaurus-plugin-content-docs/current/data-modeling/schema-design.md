---
slug: /data-modeling/schema-design
title: スキーマ設計
description: クエリパフォーマンスのためのClickHouseスキーマの最適化
keywords: [スキーマ, スキーマ設計, クエリ最適化]
---

効果的なスキーマ設計を理解することは、ClickHouseのパフォーマンスを最適化するための鍵であり、対応するクエリやデータの更新頻度、レイテンシ要件、データ量などの要因に応じてトレードオフを含む選択を含みます。このガイドでは、ClickHouseのパフォーマンスを最適化するためのスキーマ設計のベストプラクティスとデータモデリング技術の概要を提供します。

## Stack Overflowデータセット {#stack-overflow-dataset}

このガイドの例では、Stack Overflowデータセットのサブセットを使用します。これは、2008年から2024年4月までにStack Overflowで発生したすべての投稿、投票、ユーザー、コメント、バッジを含みます。このデータは、以下のスキーマを使用してParquet形式で利用可能で、S3バケット `s3://datasets-documentation/stackoverflow/parquet/` にあります。

> 示されている主キーとリレーションシップは制約によって強制されず（Parquetはファイル形式であり、テーブル形式ではないため）、データがどのように関連しているか、持つユニークなキーを示すものです。

<img src={require('./images/stackoverflow-schema.png').default}    
  class='image'
  alt='Stack Overflow Schema'
  style={{width: '800px', background: 'none'}} />

<br />

Stack Overflowデータセットには、いくつかの関連するテーブルが含まれています。データモデリング作業では、最初に主要なテーブルの読み込みに焦点を当てることをお勧めします。これは必ずしも最大のテーブルである必要はなく、むしろほとんどの分析クエリを受け取ることが期待されるテーブルです。これにより、ClickHouseの主要な概念と種類に慣れることができ、特にOLTP環境からの移行者にとって重要です。このテーブルは追加のテーブルが加わると、ClickHouseの機能を最大限に活かし、最適なパフォーマンスを得るためにリモデリングが必要になる場合があります。

上記のスキーマは、このガイドの目的のために最適化されていないことを意図して設計されています。

## 初期スキーマを確立する {#establish-initial-schema}

`posts` テーブルはほとんどの分析クエリの対象となるため、このテーブルのスキーマを確立することに焦点を当てます。このデータは、パブリックS3バケット `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` で、年ごとにファイルが分かれています。

> S3からのParquet形式のデータの読み込みは、ClickHouseにデータをロードする最も一般的で推奨される方法です。ClickHouseはParquetの処理に最適化されており、S3から数千万行を毎秒読み取り、挿入することが可能です。

ClickHouseは、データセットの型を自動的に特定するスキーマ推論機能を提供しています。この機能は、Parquetを含むすべてのデータ形式に対応しています。この機能を利用して、s3テーブル関数と[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを使用し、データのClickHouse型を特定できます。以下のように、`stackoverflow/parquet/posts`フォルダー内のすべてのファイルを読み込むために、グロブパターン `*.parquet` を使用します。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                	│ Nullable(Int64)            	│
│ PostTypeId        	│ Nullable(Int64)            	│
│ AcceptedAnswerId  	│ Nullable(Int64)            	│
│ CreationDate      	│ Nullable(DateTime64(3, 'UTC')) │
│ Score             	│ Nullable(Int64)            	│
│ ViewCount         	│ Nullable(Int64)            	│
│ Body              	│ Nullable(String)           	│
│ OwnerUserId       	│ Nullable(Int64)            	│
│ OwnerDisplayName  	│ Nullable(String)           	│
│ LastEditorUserId  	│ Nullable(Int64)            	│
│ LastEditorDisplayName │ Nullable(String)           	│
│ LastEditDate      	│ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate  	│ Nullable(DateTime64(3, 'UTC')) │
│ Title             	│ Nullable(String)           	│
│ Tags              	│ Nullable(String)           	│
│ AnswerCount       	│ Nullable(Int64)            	│
│ CommentCount      	│ Nullable(Int64)            	│
│ FavoriteCount     	│ Nullable(Int64)            	│
│ ContentLicense    	│ Nullable(String)           	│
│ ParentId          	│ Nullable(String)           	│
│ CommunityOwnedDate	│ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate        	│ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> [s3テーブル関数](/sql-reference/table-functions/s3)を使用することで、S3内のデータをClickHouseからインプレースでクエリすることができます。この関数はClickHouseがサポートするすべてのファイル形式と互換性があります。

これにより、非最適化の初期スキーマが得られます。デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。これらの型を使用して、シンプルな `CREATE EMPTY AS SELECT` コマンドでClickHouseテーブルを作成できます。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつかの重要なポイント:

- このコマンドを実行後、`posts` テーブルは空です。データは読み込まれていません。
- テーブルエンジンをMergeTreeとして指定しました。MergeTreeは、最も一般的に使用されるClickHouseテーブルエンジンであり、PB単位のデータを扱うことができ、大部分の分析ユースケースに対応できます。他のテーブルエンジンは、効率的な更新をサポートする必要があるCDCなどのユースケースでも存在します。

`ORDER BY ()` という句は、インデックスがなく、より具体的にはデータに順序がないことを意味します。この後詳しく説明しますが、今のところ、すべてのクエリは線形スキャンを必要とすることを知っておいてください。

テーブルが作成されたことを確認するには、次のようにします：

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

初期スキーマが定義されたので、`INSERT INTO SELECT` を使用してデータをポピュレートし、s3テーブル関数を使ってデータを読み込みます。次のコードは、8コアのClickHouse Cloudインスタンスで約2分で`posts`データをロードします。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上記のクエリは6000万行を読み込みます。ClickHouseにとっては小さいデータ量ですが、インターネット接続が遅いユーザーはデータのサブセットを読み込むことを望むかもしれません。これは、単に読み込みたい年をグロブパターンを使って指定することで実現できます。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` または `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。グロブパターンを使用してファイルのサブセットにターゲットを絞る方法については、[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。

## 型の最適化 {#optimizing-types}

ClickHouseのクエリパフォーマンスの秘密の一つは圧縮です。

ディスク上のデータが少ないほどI/Oが減少し、結果的にクエリと挿入が高速化します。圧縮アルゴリズムのCPUに関するオーバーヘッドは、ほとんどのケースでIOの削減によって上回ります。したがって、データの圧縮を改善することは、ClickHouseのクエリを高速化するための第一の焦点であるべきです。

> ClickHouseがデータを非常にうまく圧縮する理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をお勧めします。要約すると、列指向データベースとして、値は列順に書き込まれます。これらの値がソートされている場合、同じ値が隣接します。圧縮アルゴリズムは、連続したデータパターンを利用します。その上、ClickHouseはユーザーが圧縮技術をさらに調整できるコーデックと粒度の大きなデータ型を持っています。

ClickHouseでの圧縮は、主に3つの要因によって影響を受けます：順序キー、データ型、および使用されるコーデックです。これらはすべて、スキーマを通じて構成されます。

圧縮とクエリパフォーマンスの最大の最初の改善は、型の最適化という単純なプロセスを通じて得ることができます。スキーマを最適化するために適用できるいくつかのシンプルなルールがあります：

- **厳密な型を使用する** - 初期のスキーマでは、明らかに数値である多くのカラムがStringsとして使用されていました。正しい型の使用は、フィルタリングや集計を行う際に期待される意味論を確保します。日付型についても同様で、Parquetファイルでは正しく提供されています。
- **Nullableカラムを避ける** - デフォルトでは、上記のカラムはNullと見なされています。Nullable型は、クエリが空値とNull値の違いを判断できるようにします。これにより、UInt8型の別のカラムが作成されます。この追加のカラムは、ユーザーがnullableカラムを使用するたびに処理されなければなりません。これにより、追加のストレージスペースが使用され、ほぼ常にクエリパフォーマンスに悪影響を及ぼします。空値とNull値のデフォルト空の値に違いがある場合にのみNullableを使用してください。例えば、`ViewCount`カラムの空の値は0として処理されることがほとんどであり、大多数のクエリに対して結果に影響を与えません。空の値を異なって扱う必要がある場合、フィルタで除外することができます。
- **数値型の最小精度を使用する** - ClickHouseは、異なる数値範囲と精度のために設計された数値型をいくつか提供しています。カラムを表すために使用するビット数を最小限に抑えるように努めてください。異なるサイズの整数（例えばInt16）の他、ClickHouseは最小値が0の符号なしのバリアントを提供しています。これにより、UInt16のように、最大値65535で、Int16の2倍のビットを使用しないカラムができます。可能であれば、これらの型をより大きな符号付きバリアントの代わりに優先します。
- **日付型の最小精度** - ClickHouseは、さまざまな日付および日付時刻型をサポートしています。DateおよびDate32は純粋な日付を格納するために使用され、後者はより多くのビットを費やしてより広い日付範囲をサポートします。DateTimeとDateTime64は、日付時刻をサポートします。DateTimeは秒単位の精度に限定され、32ビットを使用します。名前が示すように、DateTime64は64ビットを使用しますが、ナノ秒単位の精度をサポートします。クエリに必要な最も粗いバージョンを選択し、必要なビット数を最小限に抑えてください。
- **LowCardinalityを使用する** - ユニークな値が少ない数値、文字列、日付、または日付時刻のカラムは、LowCardinality型を使用してエンコードできる可能性があります。この辞書は値をエンコードし、ディスク上のサイズを削減します。ユニークな値が1万未満のカラムについて考慮してください。
- **特殊なケース用のFixedString** - 固定長を持つ文字列は、FixedString型を使ってエンコードでき、例えば言語や通貨コードなどで有効です。データの長さが正確にNバイトである場合に効率的です。他のすべてのケースでは効率が減少する可能性が高く、LowCardinalityが推奨されます。
- **データ検証のためのEnum** - Enum型を使用して列挙型を効率的にエンコードできます。Enumsは、格納するユニークな値の数に応じて8ビットまたは16ビットにできます。挿入時に関連付けられた検証が必要な場合（未宣言の値が拒否される）や、Enum値の自然な順序を利用したクエリを実行したい場合には、これを使用することを検討してください。例として、ユーザーの反応を含むフィードバックカラムを想像してください `Enum(':(' = 1, ':|' = 2, ':)' = 3)`。

> ヒント：すべてのカラムの範囲と一意の値の数を見つけるために、ユーザーは単純なクエリ `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` を使用できます。これは高コストになる可能性があるため、小さいデータのサブセットで実行することをお勧めします。このクエリは、正確な結果を得るために数値型であることが必要です。すなわち、Stringではなく数値型でなければなりません。

これらのシンプルなルールを適用することにより、`posts` テーブルの各カラムに最適な型を特定できます：

<img src={require('./images/schema-design-types.png').default}    
  class='image'
  alt='Stack Overflow Schema'
  style={{width: '1000px'}} />

<br />

上記により、次のスキーマが得られます：

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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '最適化された型'
```

以前のテーブルからデータを読み込み、これに挿入するためのシンプルな `INSERT INTO SELECT` を使用できます：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマにはNullは保持されません。上記の挿入により、これらはそれぞれの型のデフォルト値、すなわち整数は0、文字列は空の値に暗黙的に変換されます。ClickHouseは、ターゲット精度への数値の自動変換も行います。

## ClickHouseにおける主キー（順序キー）

OLTPデータベースから来たユーザーは、ClickHouseにおける同等の概念を探すことがよくあります。

## 順序キーの選択 {#choosing-an-ordering-key}

ClickHouseがしばしば使用される規模では、メモリとディスクの効率が極めて重要です。データは、パーツと呼ばれるチャンクとしてClickHouseのテーブルに書き込まれ、バックグラウンドでパーツのマージに関するルールが適用されます。ClickHouseでは、各パーツには独自の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。パーツの主インデックスには、行のグループごとに1つのインデックスエントリがあります。この技術はスパースインデクシングと呼ばれます。

<img src={require('./images/schema-design-indices.png').default}    
  class='image'
  alt='ClickHouseにおけるスパースインデクシング'
  style={{width: '600px'}} />

<br />

ClickHouseで選択されたキーは、インデックスだけでなく、ディスクに書き込まれるデータの順序も決定します。これにより、圧縮レベルに大きな影響を与え、結果としてクエリパフォーマンスに影響を与える可能性があります。多くのカラムの値が連続した順序で書き込まれる順序キーを使用すると、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮するのを助けます。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。キー自体に含まれているかどうかに関わらず、例えば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定することが可能です - これは、`SELECT`クエリの`ORDER BY`句と同じ意味論での順序を適用します。

順序キーを選択するためのいくつかのシンプルなルールを適用できます。以下は時には対立することもあるので、これらを順序に考慮してください。このプロセスからユーザーは多くのキーを特定でき、通常は4〜5個が十分です：

- 一般的なフィルターと一致するカラムを選択する。カラムが`WHERE`句で頻繁に使用される場合、より頻繁に使用されるキーの中にこれを優先して含めるべきです。
- フィルタリングされたときに総行数の大部分を除外するのに役立つカラムを優先することで、読み込む必要のあるデータ量を削減します。
- テーブル内の他のカラムと高い相関関係があると予想されるカラムを優先する。これにより、これらの値も隣接して保存され、圧縮が改善されます。
- 順序キーのカラムに対する `GROUP BY` および `ORDER BY` 操作は、メモリ効率が向上します。

順序キーのカラムを特定する際、特定の順序でカラムを宣言してください。この順序は、クエリ内のセカンダリキーのフィルタリングの効率と、テーブルのデータファイルの圧縮率に大きく影響します。一般に、キーを基数の昇順で並べることが最善です。これとは対照に、順序キーで後の方に現れるカラムのフィルタリングは、前の方に現れるカラムよりも効率が劣ることを考慮してください。これらの動作をバランスさせ、アクセスパターンを考慮してください（最も重要なのはバリエーションのテストです）。

### 例 {#example}

上記のガイドラインを`posts` テーブルに適用して、ユーザーが日付と投稿タイプによる分析を行うことを望んでいると仮定しましょう。例えば：

「過去3ヶ月で最もコメントを受けた質問はどれか」。

最適化された型を持ち、順序キーがない以前の`posts_v2`テーブルを使用してこの質問のクエリを考えます：

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
│ 78203063 │ How to avoid default initialization of objects in std::vector?	│       	74 │
│ 78183948 │ About memory barrier                                          	│       	52 │
│ 77900279 │ Speed Test for Buffer Alignment: IBM's PowerPC results vs. my CPU │       	49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
Peak memory usage: 429.38 MiB.
```

> ここでのクエリは非常に速いです。すべての6000万行が直線的にスキャンされているにもかかわらず、ClickHouseは速いのです :) 大規模なTBおよびPBのスケールで順序キーは価値があります！

`PostTypeId` と `CreationDate` カラムを順序キーとして選択しましょう。

場合によっては、ユーザーが常に `PostTypeId` でフィルタリングすることを期待しています。これは基数が8であり、順序キーの最初のエントリに論理的に適した選択です。日付の粒度フィルタリングが十分であることを認識し、（それでも日付/時刻のフィルタがまだ利益を得るために）`toDate(CreationDate)` を順序キーの2番目の要素として使用します。これにより、日付が16で表現でき、インデックスを小さくし、フィルタリングを高速化します。最終的なキーのエントリは、最もコメントの多い投稿を見つけるのを助けるための `CommentCount` です（最終ソート）。

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
COMMENT '順序キー'

--既存のテーブルからデータをポピュレートする

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.
```

以前のクエリは、クエリ応答時間を3倍以上改善しました。

```sql
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

特定の型と適切な順序キーを使用することによって得られる圧縮改善に興味のあるユーザーは、[ClickHouseでの圧縮](/data-compression/compression-in-clickhouse)を参照してください。さらに圧縮を改善する必要がある場合は、セクション[適切なカラム圧縮コーデックの選択](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)も推薦します。

## 次：データモデリング技術 {#next-data-modelling-techniques}

ここまで、単一のテーブルのみを移行しました。これにより、ClickHouseのコア概念のいくつかを紹介できましたが、残念ながらほとんどのスキーマはこのようにシンプルではありません。

今後のガイドでは、ClickHouseクエリを最適化するためにワイドなスキーマを再構造化するためのいくつかの技術を探求します。このプロセスを通じて、`Posts`を主要なテーブルとして維持し、ほとんどの分析クエリがここを通じて行われるようにします。他のテーブルも独立してクエリできますが、ほとんどの分析は`posts`のコンテキスト内で実行されると仮定します。

> このセクションでは、他のテーブルの最適化バリアントを使用します。これらのスキーマを提供しますが、簡潔さのために行った決定は省略します。これらは前述のルールに基づいており、決定を推測するのは読者にお任せします。

以下のアプローチはすべて、読み取りを最適化し、クエリパフォーマンスを向上させるためにJOINの使用を最小限に抑えることを目指しています。ClickHouseではJOINが完全にサポートされていますが、最適なパフォーマンスを達成するためには控えめに使用することをお勧めします（JOINクエリで2〜3テーブルは許容されます）。

> ClickHouseには外部キーの概念がありません。これによりJOINが禁止されるわけではありませんが、参照整合性はアプリケーション側で管理されることになります。OLAPシステムとしてのClickHouseでは、データ整合性はしばしばアプリケーションレベルまたはデータインジェスチョンプロセス中に管理され、データベース自体によって強制されることはありません。これにより、柔軟性が増し、データの挿入が高速化されます。これは、非常に大きなデータセットに対して、読み取りおよび挿入クエリの速度とスケーラビリティの向上に対するClickHouseの焦点と一致します。

クエリ時間におけるJoinsの使用を最小限に抑えるために、ユーザーにはいくつかのツール/アプローチがあります：

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを結合し、1:1の関係でない複雑な型を使用してデータを非正規化します。これは、クエリ時間から挿入時間にジョインを移動することを含みます。
- [**辞書**](/dictionary) - 直接的なJOINとキー値のルックアップを処理するためのClickHouse特有の機能。
- [**増分マテリアライズドビュー**](/materialized-view) - クエリ時間から挿入時間に計算のコストを移すClickHouseの機能で、集約値を逐次的に計算できる機能を含みます。
- [**リフレッシュ可能なマテリアライズドビュー**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使用されるマテリアライズドビューに似ており、クエリの結果が定期的に計算され、その結果がキャッシュされます。

これらのアプローチはそれぞれのガイドで探求し、各アプローチが適切な場合を強調し、Stack Overflowデータセットの質問を解決する方法の例を示します。
