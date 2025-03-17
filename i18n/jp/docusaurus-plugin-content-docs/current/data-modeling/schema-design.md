---
slug: /data-modeling/schema-design
title: スキーマ設計
description: クエリパフォーマンスのための ClickHouse スキーマの最適化
keywords: [スキーマ, スキーマ設計, クエリ最適化]
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignTypes from '@site/static/images/data-modeling/schema-design-types.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';

効果的なスキーマ設計を理解することは、ClickHouse のパフォーマンスを最適化するための鍵であり、これはしばしばトレードオフを伴う選択を含み、最適なアプローチは提供されるクエリやデータの更新頻度、レイテンシ要件、データ量などの要因に依存します。このガイドでは、ClickHouse のパフォーマンスを最適化するためのスキーマ設計のベストプラクティスとデータモデリング技術の概要を提供します。

## Stack Overflow データセット {#stack-overflow-dataset}

このガイドの例では、Stack Overflow データセットのサブセットを使用します。これには、2008年から2024年4月までに Stack Overflow で発生したすべての投稿、投票、ユーザー、コメント、バッジが含まれています。このデータは、下記のスキーマを使用して Parquet 形式で提供されており、S3 バケット `s3://datasets-documentation/stackoverflow/parquet/` で入手可能です。

> 示された主キーとリレーションは制約を通じて強制されていません（Parquet はファイル形式であり、テーブル形式ではありません）し、データがどのように関連しているかおよびそれが持つユニークキーを示すだけです。

<img src={stackOverflowSchema} class="image" alt="Stack Overflow スキーマ" style={{width: '800px', background: 'none'}} />

<br />

Stack Overflow データセットには、いくつかの関連テーブルが含まれています。データモデリング作業においては、ユーザーが最初に主要なテーブルの読み込みに焦点を当てることをお勧めします。これは必ずしも最大のテーブルである必要はなく、むしろ最も多くの分析クエリが期待されるテーブルです。このことにより、ClickHouse の主要な概念やタイプに慣れることができ、特に OLTP の背景から来ている場合には重要です。このテーブルは、追加のテーブルが追加されるときに ClickHouse の機能をフルに活用し、最適なパフォーマンスを得るために再設計が必要になることがあります。

上記のスキーマは、このガイドの目的において意図的に最適ではありません。

## 初期スキーマの確立 {#establish-initial-schema}

`posts` テーブルがほとんどの分析クエリのターゲットになるため、このテーブルのスキーマの確立に焦点を当てます。このデータは、パブリック S3 バケット `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` で、年ごとにファイルが提供されています。

> Parquet 形式で S3 からデータを読み込むことは、ClickHouse にデータをロードする最も一般的で推奨される方法を表します。ClickHouse は Parquet の処理に最適化されており、S3 から毎秒数千万行を読み取り、挿入する可能性があります。

ClickHouse は、データセットのタイプを自動的に特定するためのスキーマ推論機能を提供しています。これは Parquet を含むすべてのデータ形式でサポートされています。この機能を活用して、s3 テーブル関数と[`DESCRIBE`](/sql-reference/statements/describe-table) コマンドを通じてデータの ClickHouse タイプを特定することができます。以下のように、`stackoverflow/parquet/posts` フォルダー内のすべてのファイルを読み取るために、グロブパターン `*.parquet` を使用しています。

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

> [s3 テーブル関数](/sql-reference/table-functions/s3) を使用すると、ClickHouse から S3 のデータをそのままクエリできます。この関数は、ClickHouse がサポートするすべてのファイル形式と互換性があります。

これにより、初期の非最適化スキーマが提供されます。デフォルトでは、ClickHouse はこれらを同等の Nullable タイプにマッピングします。これらのタイプを使用して ClickHouse テーブルを作成するには、シンプルな `CREATE EMPTY AS SELECT` コマンドを使用します。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつかの重要なポイント：

- このコマンドを実行した後、posts テーブルは空です。データはロードされていません。
- テーブルエンジンとして MergeTree を指定しました。MergeTree は、あなたが使用する可能性が最も高い ClickHouse のテーブルエンジンです。それは ClickHouse ボックスのマルチツールであり、PB のデータを扱い、ほとんどの分析使用例に対応します。CDC などの効率的な更新をサポートする必要があるユースケースのための他のテーブルエンジンも存在します。

`ORDER BY ()` 句は、我々のデータにインデックスがなく、より具体的には順序がないことを意味します。これについては後で詳しく説明します。今は、すべてのクエリが線形スキャンを要求することを知っておいてください。

テーブルが作成されたことを確認するには：

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

初期スキーマが定義されたので、`INSERT INTO SELECT` を使用してデータを補充できます。s3 テーブル関数を使用してデータを読み取り、このデータを 8 コアの ClickHouse Cloud インスタンスで約2分で `posts` データにロードします。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上記のクエリは 6000 万行をロードします。ClickHouse にとっては小規模ですが、インターネット接続が遅いユーザーはデータのサブセットをロードしたいかもしれません。これは、単に特定の年をグロブパターンで指定することで達成できます。例： `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` や `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。ファイルのサブセットをターゲットにするためのグロブパターンの使用方法については、[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。

## タイプの最適化 {#optimizing-types}

ClickHouse のクエリパフォーマンスの秘密の1つは圧縮です。

ディスク上のデータが少ないほど、I/O が少なくなり、したがってクエリと挿入が速くなります。ほとんどのケースで、CPU に対する圧縮アルゴリズムのオーバーヘッドは、I/O の削減によって上回られます。データの圧縮を改善することが、ClickHouse クエリを速くするために取り組むべき最初の焦点となるべきです。

> ClickHouse がデータを非常に効果的に圧縮する理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をおすすめします。要約すると、列指向データベースであるため、値は列の順番で書き込まれます。これらの値がソートされている場合、同じ値は隣接して配置されます。圧縮アルゴリズムは、隣接するデータパターンを利用します。さらに、ClickHouse にはコーデックと細かいデータタイプがあり、ユーザーは圧縮技術をさらに調整できます。

ClickHouse における圧縮の効果は、主に 3 つの要因によって影響を受けます。これらは注文キー、データ型、および使用されるコーデックです。これらはすべてスキーマを介して構成されます。

圧縮とクエリパフォーマンスの最も大きな初期改善は、タイプ最適化のシンプルなプロセスを通じて得られます。スキーマを最適化するために適用できるいくつかの簡単なルールを示します：

- **厳密なタイプを使用** - 初期スキーマでは、多くのカラムに明らかに数値である String を使用しています。正しいタイプを使用することで、フィルタリングや集約時に期待される意味を保証します。同様に、Parquet ファイルに正しく提供された日付型にも当てはまります。
- **Nullable カラムを避ける** - デフォルトでは、上記のカラムは Null であると見なされています。Nullable タイプでは、クエリが空の値と Null 値の違いを判別できます。これにより、UInt8 タイプの別のカラムが作成されます。この追加のカラムは、ユーザーが Nullable カラムで作業するたびに処理される必要があります。これにより、別のストレージスペースが必要になり、クエリパフォーマンスにほぼ常に悪影響を及ぼします。Nullable を使用するのは、型のデフォルトの空の値と Null に違いがある場合に限ります。例えば、`ViewCount` カラムの空の値としての 0 は、ほとんどのクエリに対して十分であり、結果に影響を与えないでしょう。空の値を異なる扱いにすべき場合は、フィルタリングでクエリから除外することもできます。
- **数値型に対する最小限の精度を使用** - ClickHouse には、異なる数値範囲と精度のために設計された多数の数値型があります。カラムを表すために使用されるビット数を最小限に抑えることを常に目指します。異なるサイズの整数（例：Int16）に加えて、ClickHouse は最小値が 0 の符号なしバリアントを提供しています。これにより、カラムに使用されるビット数を減らすことができます。例えば、UInt16 は最大値が 65535 で、Int16 の 2 倍です。可能であれば、これらのタイプをより大きな符号付きバリアントよりも優先してください。
- **日付型に対する最小限の精度を使用** - ClickHouse は、いくつかの日付および日時型をサポートしています。Date および Date32 は純粋な日付を保存するために使用でき、後者はより多くのビットを使いますが広い日付範囲をサポートします。DateTime と DateTime64 は日時をサポートします。DateTime は秒単位の精度に制限され、32 ビットを使用します。DateTime64 は、その名の通り、64 ビットを使用しますが、ナノ秒単位の精度をサポートします。常にクエリに受け入れ可能なもっと粗いバージョンを選び、必要なビット数を最小化します。
- **LowCardinality を使用** - ユニークな値が少ない数値、文字列、日付または日時カラムは、LowCardinality タイプを使用してエンコードできる可能性があります。この辞書は値をエンコードし、ディスク上のサイズを削減します。ユニークな値が 10,000 未満のカラムに対してこれを検討します。
- **特別なケースでの FixedString** - 固定長の文字列は、FixedString タイプでエンコードできます（例：言語と通貨コード）。これは、データが正確に N バイトの長さを持っている場合に効率的です。他のすべてのケースでは、効率を低下させる可能性が高く、LowCardinality が優先されます。
- **データ検証用の Enums** - Enum タイプを使用して列挙型を効率的にエンコードできます。Enum はユニークな値の数に応じて 8 または 16 ビットです。挿入時に関連する検証を必要とする場合（未宣言の値は拒否されます）や、Enum 値の自然な順序を利用してクエリを実行したい場合にこれを検討します（例：ユーザーの反応を含むフィードバックカラムを想像してください `Enum(':(' = 1, ':|' = 2, ':)' = 3)`）。

> ヒント: すべてのカラムの範囲と異なる値の数を見つけるには、ユーザーは簡単なクエリ `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` を使用できます。これは高価な操作となり得るため、データの小さなサブセットで実行することをお勧めします。このクエリは、適切な結果を得るために数値が少なくともそのように定義されている必要があります。すなわち、文字列としてではありません。

これらのシンプルなルールを posts テーブルに適用することで、各カラムに対する最適なタイプを特定できます：

<img src={schemaDesignTypes} class="image" alt="スキーマ設計 - 最適化されたタイプ" style={{width: '1000px', background: 'none'}} />

<br />

上記は次のスキーマを提供します：

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
COMMENT '最適化されたタイプ'
```

これを、以前のテーブルからデータを読み取り、この新しいテーブルに挿入するシンプルな `INSERT INTO SELECT` で補充できます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマでは Null を保持しません。上記の挿入は、各タイプのデフォルト値（整数の 0 と文字列の空値）に暗黙的に変換します。ClickHouse は、任意の数値を目的の精度に自動的に変換します。

### ClickHouse における主キー（オーダリングキー）
OLTP データベースから来たユーザーは、ClickHouse における同等の概念を探すことがよくあります。

## オーダリングキーの選択 {#choosing-an-ordering-key}

ClickHouse がしばしば使用されるスケールでは、メモリとディスクの効率が最重要です。データは、パーツと呼ばれるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouse では、各パーツには独自の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。パーツの主インデックスは行のグループごとに 1 つのインデックスエントリを持ち、この技法はスパースインデックスと呼ばれます。

<img src={schemaDesignIndices} class="image" alt="ClickHouse におけるスパースインデックス" style={{width: '600px', background: 'none'}} />

<br />

ClickHouse で選択されたキーは、データのディスクへの書き込み順序だけでなく、インデックスも決定します。このため、圧縮レベルに劇的な影響を与えることができ、これがクエリパフォーマンスに影響を及ぼす可能性があります。ほとんどのカラムの値が連続的に書き込まれるオーダリングキーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できることを許可します。

> テーブル内のすべてのカラムは、指定されたオーダリングキーの値に基づいてソートされます。これはキー自体に含まれているかどうかにかかわらずです。たとえば、`CreationDate` がキーとして使用される場合、すべての他のカラムの値の順序は `CreationDate` カラム内の値の順序に対応します。複数のオーダリングキーを指定することができます。これにより、`SELECT` クエリの `ORDER BY` 句と同じセマンティクスでオーダリングされます。

オーダリングキーを選定するためのいくつかの簡単なルールを適用することができます。これらは時に矛盾することがあるため、順番に考慮してください。このプロセスから複数のキーを特定でき、通常は 4 ～ 5 個のキーが十分です：

- 一般的なフィルタに一致するカラムを選択します。カラムが `WHERE` 句で頻繁に使用される場合、これらをキーに優先的に含めるようにしてください。
- フィルタをかける際に、全体の行数の大きな割合を除外するのに役立つカラムを優先します。これにより、読み取る必要があるデータの量が減ります。
- テーブル内の他のカラムと高く相関している可能性のあるカラムを優先します。これにより、これらの値も連続的に保存され、圧縮が改善されるでしょう。
- オーダリングキー内のカラムに対して `GROUP BY` や `ORDER BY` 操作を行う場合、メモリ効率を向上させることができます。

オーダリングキーのカラムのサブセットを特定する際には、カラムを特定の順序で宣言します。この順序は、クエリ内のセカンダリーキーのフィルタリング効率や、テーブルのデータファイルの圧縮比に大きく影響する可能性があります。一般的には、キーをカーディナリティの昇順で並べるのが最良です。これは、オーダリングキーの後に現れるカラムでのフィルタリングが、最初に現れるタプルに比べて効率が低下することを考慮してバランスを取る必要があります。これらの挙動をバランスさせ、アクセスパターンを考慮してください（そして最も重要なことは、さまざまなバリエーションをテストしてください）。

### 例 {#example}

上記のガイドラインを posts テーブルに適用すると、ユーザーが日付と投稿タイプでフィルタリングする分析を行いたいと仮定しましょう。たとえば：

「過去 3 ヶ月で最もコメントが多かった質問はどれか？」

最適化されたタイプだがオーダリングキーのない以前の `posts_v2` テーブルを使用して、この質問のクエリは次のようになります：

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

> ここでのクエリは非常に迅速ですが、すべての 6000 万行が線形スキャンされているためです - ClickHouse は単に速いです :) TB や PB のスケールではオーダリングキーが確実に価値があることを信じてください！

`PostTypeId` と `CreationDate` をオーダリングキーとして選択しましょう。

ユーザーが常に `PostTypeId` でフィルタリングすることを期待している場合、これは 8 のカーディナリティを持ち、オーダリングキーの最初のエントリに論理的な選択を示します。日付の粒度によるフィルタリングが十分であると認識できるので（それはまだ datetime フィルタにも利益をもたらします）、キーの 2 番目のコンポーネントとして `toDate(CreationDate)` を使用します。これにより、データが 16 ビットで表現できる smaller index 再およびフィルタリングが高速化されます。最終的なキーのエントリは、最もコメントされた投稿を見つける手助けとして `CommentCount` です（最終的なソート）。

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
COMMENT 'オーダリングキー'

-- 既存のテーブルからデータを補充

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.
```

以前のクエリは、クエリ応答時間を 3 倍以上向上させます：

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

特定のタイプと適切なオーダリングキーを使用することで達成される圧縮改善に興味があるユーザーは、[ClickHouse における圧縮](/data-compression/compression-in-clickhouse)を参照してください。さらに圧縮を改善する必要がある場合は、[正しいカラム圧縮コーデックの選択](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)セクションを参考にしてください。

## 次に：データモデリング技術 {#next-data-modelling-techniques}

これまでの間に、単一のテーブルのみを移行しました。これにより、いくつかのコアな ClickHouse の概念を導入することができましたが、ほとんどのスキーマは残念ながらこのように単純ではありません。

以下の他のガイドでは、最適な ClickHouse クエリのために、より広いスキーマを再構築するためのいくつかの技術を探求します。このプロセスを通じて、`Posts` がほとんどの分析クエリが実行される中心的なテーブルとして残ることを目指します。他のテーブルも孤立してクエリできますが、ほとんどの分析は `posts` のコンテキスト内で実行されることを想定しています。

> このセクションでは、他のテーブルの最適化されたバリアントを使用します。これに関してはスキーマを提供しますが、簡潔さのために取った決定を省略します。これらは前述のルールに基づいており、決定を推測するのは読者に任せます。

以下のアプローチはすべて、クエリを最適化するために JOIN を使用する必要性を最小限に抑えることを目指しています。ClickHouse では JOIN が完全にサポートされていますが、最適なパフォーマンスを達成するためには控えめに使用することをお勧めします（JOIN クエリの 2 ～ 3 テーブルは問題ありません）。

> ClickHouse には外部キーの概念がありません。これは JOIN を禁止するものではありませんが、参照整合性はアプリケーションレベルで管理する必要があります。ClickHouse のような OLAP システムでは、データ整合性はデータの取り込みプロセス中にアプリケーションレベルで管理されることが多く、データベース自体によって強制されることはありません。これは、柔軟性と高速なデータ挿入を可能にします。ClickHouse の焦点は、大規模なデータセットに対する読み取りと挿入のクエリの速度とスケーラビリティにあります。

クエリ時に Joins の使用を最小限に抑えるために、ユーザーは複数のツール/アプローチを持っています：

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを結合し、非 1:1 リレーションシップに複雑なタイプを使用してデータを非正規化すること。これには、クエリ時に結合を取り除くことが含まれることが多いです。
- [**辞書**](/dictionary) - 直接の結合やキー値のルックアップを処理するための ClickHouse 固有の機能。
- [**インクリメンタルマテリアライズドビュー**](/materialized-view/incremental-materialized-view) - クエリ時の計算コストを挿入時に移し替える ClickHouse 機能で、集約値をインクリメンタルに計算することができます。
- [**リフレッシャブルマテリアライズドビュー**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使用されるマテリアライズドビューに似ており、クエリ結果を定期的に計算して結果をキャッシュすることができます。

これらのアプローチを各ガイドで探求し、各アプローチが適切な場面や Stack Overflow データセットに対する適用方法を示す例を紹介します。
