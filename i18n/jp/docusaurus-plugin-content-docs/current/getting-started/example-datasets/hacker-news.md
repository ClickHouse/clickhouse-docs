---
'description': 'ハッカーニュースデータを含む28百万行のデータセット。'
'sidebar_label': 'Hacker News'
'slug': '/getting-started/example-datasets/hacker-news'
'title': 'ハッカーニュースデータセット'
'doc_type': 'reference'
---



# Hacker Newsデータセット

> このチュートリアルでは、28百万行のHacker NewsデータをCSVおよびParquetフォーマットからClickHouseテーブルに挿入し、データを探索するための簡単なクエリを実行します。

## CSV {#csv}

<VerticalStepper headerLevel="h3">

### CSVのダウンロード {#download}

データセットのCSV版は、公開の[S3バケット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz)からダウンロードするか、次のコマンドを実行することで取得できます。

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

4.6GBで、28百万行のこの圧縮ファイルは、ダウンロードに5〜10分かかるはずです。

### データのサンプリング {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/)を使用すると、ClickHouseサーバーを展開および設定することなく、ローカルファイルに対して迅速な処理を行うことができます。

ClickHouseにデータを保存する前に、clickhouse-localを使用してファイルをサンプリングしましょう。コンソールから次のコマンドを実行します。

```bash
clickhouse-local
```

次に、データを探索するために以下のコマンドを実行します。

```sql title="Query"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="Response"
Row 1:
──────
id:          344065
deleted:     0
type:        comment
by:          callmeed
time:        2008-10-26 05:06:58
text:        What kind of reports do you need?<p>ActiveMerchant just connects your app to a gateway for cc approval and processing.<p>Braintree has very nice reports on transactions and it's very easy to refund a payment.<p>Beyond that, you are dealing with Rails after all–it's pretty easy to scaffold out some reports from your subscriber base.
dead:        0
parent:      344038
poll:        0
kids:        []
url:
score:       0
title:
parts:       []
descendants: 0

Row 2:
──────
id:          344066
deleted:     0
type:        story
by:          acangiano
time:        2008-10-26 05:07:59
text:
dead:        0
parent:      0
poll:        0
kids:        [344111,344202,344329,344606]
url:         http://antoniocangiano.com/2008/10/26/what-arc-should-learn-from-ruby/
score:       33
title:       What Arc should learn from Ruby
parts:       []
descendants: 10
```

このコマンドにはさまざまな微妙な機能があります。[`file`](/sql-reference/functions/files/#file)オペレーターは、ローカルディスクからファイルを読み取ることができ、フォーマット`CSVWithNames`のみを指定します。最も重要なことは、スキーマが自動的にファイルの内容から推測されることです。また、`clickhouse-local`が拡張子からgzipフォーマットを推測して圧縮ファイルを読み取ることができることにも注意してください。`Vertical`フォーマットは、各カラムのデータをより簡単に見るために使用されます。

### スキーマ推測によるデータの読み込み {#loading-the-data}

データ読み込みのための最もシンプルで強力なツールは`clickhouse-client`です。機能豊富なネイティブコマンドラインクライアントです。データを読み込むには、再度スキーマ推測を活用し、ClickHouseにカラムのタイプを決定させることができます。

次のコマンドを実行してテーブルを作成し、リモートCSVファイルから直接データを挿入します。内容には[`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url)関数を使用してアクセスします。スキーマは自動的に推測されます。

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

これにより、データから推測されたスキーマを使用して空のテーブルが作成されます。[`DESCRIBE TABLE`](/sql-reference/statements/describe-table)コマンドを使用すると、これらの割り当てられたタイプを理解することができます。

```sql title="Query"
DESCRIBE TABLE hackernews
```

```text title="Response"
┌─name────────┬─type─────────────────────┬
│ id          │ Nullable(Float64)        │
│ deleted     │ Nullable(Float64)        │
│ type        │ Nullable(String)         │
│ by          │ Nullable(String)         │
│ time        │ Nullable(String)         │
│ text        │ Nullable(String)         │
│ dead        │ Nullable(Float64)        │
│ parent      │ Nullable(Float64)        │
│ poll        │ Nullable(Float64)        │
│ kids        │ Array(Nullable(Float64)) │
│ url         │ Nullable(String)         │
│ score       │ Nullable(Float64)        │
│ title       │ Nullable(String)         │
│ parts       │ Array(Nullable(Float64)) │
│ descendants │ Nullable(Float64)        │
└─────────────┴──────────────────────────┴
```

このテーブルにデータを挿入するには、`INSERT INTO, SELECT`コマンドを使用します。`url`関数と合わせて、データはURLから直接ストリーミングされます。

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

これで、1つのコマンドで28百万行をClickHouseに成功裏に挿入しました！

### データを探索する {#explore}

以下のクエリを実行して、Hacker Newsのストーリーおよび特定のカラムをサンプリングします。

```sql title="Query"
SELECT
    id,
    title,
    type,
    by,
    time,
    url,
    score
FROM hackernews
WHERE type = 'story'
LIMIT 3
FORMAT Vertical
```

```response title="Response"
Row 1:
──────
id:    2596866
title:
type:  story
by:
time:  1306685152
url:
score: 0

Row 2:
──────
id:    2596870
title: WordPress capture users last login date and time
type:  story
by:    wpsnipp
time:  1306685252
url:   http://wpsnipp.com/index.php/date/capture-users-last-login-date-and-time/
score: 1

Row 3:
──────
id:    2596872
title: Recent college graduates get some startup wisdom
type:  story
by:    whenimgone
time:  1306685352
url:   http://articles.chicagotribune.com/2011-05-27/business/sc-cons-0526-started-20110527_1_business-plan-recession-college-graduates
score: 1
```

スキーマ推測は初期データ探索のための優れたツールですが、それは「最善の努力」であり、データの最適スキーマを定義するための長期的な代替品ではありません。

### スキーマを定義する {#define-a-schema}

明らかな最初の最適化は、各フィールドのタイプを定義することです。時間フィールドを`DateTime`型として宣言するだけでなく、次のフィールドに適切なタイプを定義します。ClickHouseでは、データの主キーidは`ORDER BY`句を介して定義されます。

適切なタイプを選択し、`ORDER BY`句に含めるカラムを選択することは、クエリの速度と圧縮を改善するのに役立ちます。

古いスキーマを削除し、改善されたスキーマを作成する以下のクエリを実行します。

```sql title="Query"
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
    ENGINE = MergeTree
ORDER BY id
```

最適化されたスキーマを持つことで、ローカルファイルシステムからデータを今すぐ挿入できます。再び`clickhouse-client`を使用して、明示的な`INSERT INTO`を使用してファイルを挿入します。

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### サンプルクエリを実行する {#run-sample-queries}

以下にいくつかのサンプルクエリを示し、独自のクエリを作成するためのインスピレーションを提供します。

#### Hacker Newsでの「ClickHouse」トピックの広がりはどのくらいか？ {#how-pervasive}

スコアフィールドはストーリーの人気を測る指標を提供し、`id`フィールドと`||`連結演算子を使用して元の投稿へのリンクを生成できます。

```sql title="Query"
SELECT
    time,
    score,
    descendants,
    title,
    url,
    'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url
FROM hackernews
WHERE (type = 'story') AND (title ILIKE '%ClickHouse%')
ORDER BY score DESC
LIMIT 5 FORMAT Vertical
```

```response title="Response"
Row 1:
──────
time:        1632154428
score:       519
descendants: 159
title:       ClickHouse, Inc.
url:         https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md
hn_url:      https://news.ycombinator.com/item?id=28595419

Row 2:
──────
time:        1614699632
score:       383
descendants: 134
title:       ClickHouse as an alternative to Elasticsearch for log storage and analysis
url:         https://pixeljets.com/blog/clickhouse-vs-elasticsearch/
hn_url:      https://news.ycombinator.com/item?id=26316401

Row 3:
──────
time:        1465985177
score:       243
descendants: 70
title:       ClickHouse – high-performance open-source distributed column-oriented DBMS
url:         https://clickhouse.yandex/reference_en.html
hn_url:      https://news.ycombinator.com/item?id=11908254

Row 4:
──────
time:        1578331410
score:       216
descendants: 86
title:       ClickHouse cost-efficiency in action: analyzing 500B rows on an Intel NUC
url:         https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc
hn_url:      https://news.ycombinator.com/item?id=21970952

Row 5:
──────
time:        1622160768
score:       198
descendants: 55
title:       ClickHouse: An open-source column-oriented database management system
url:         https://github.com/ClickHouse/ClickHouse
hn_url:      https://news.ycombinator.com/item?id=27310247
```

ClickHouseは時間の経過とともにより多くのノイズを生成しているのでしょうか？ここで、`time`フィールドを`DateTime`として定義することの有用性が示されています。適切なデータ型を使用することで、`toYYYYMM()`関数を使用できます。

```sql title="Query"
SELECT
   toYYYYMM(time) AS monthYear,
   bar(count(), 0, 120, 20)
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY monthYear
ORDER BY monthYear ASC
```

```response title="Response"
┌─monthYear─┬─bar(count(), 0, 120, 20)─┐
│    201606 │ ██▎                      │
│    201607 │ ▏                        │
│    201610 │ ▎                        │
│    201612 │ ▏                        │
│    201701 │ ▎                        │
│    201702 │ █                        │
│    201703 │ ▋                        │
│    201704 │ █                        │
│    201705 │ ██                       │
│    201706 │ ▎                        │
│    201707 │ ▎                        │
│    201708 │ ▏                        │
│    201709 │ ▎                        │
│    201710 │ █▌                       │
│    201711 │ █▌                       │
│    201712 │ ▌                        │
│    201801 │ █▌                       │
│    201802 │ ▋                        │
│    201803 │ ███▏                     │
│    201804 │ ██▏                      │
│    201805 │ ▋                        │
│    201806 │ █▏                       │
│    201807 │ █▌                       │
│    201808 │ ▋                        │
│    201809 │ █▌                       │
│    201810 │ ███▌                     │
│    201811 │ ████                     │
│    201812 │ █▌                       │
│    201901 │ ████▋                    │
│    201902 │ ███                      │
│    201903 │ ▋                        │
│    201904 │ █                        │
│    201905 │ ███▋                     │
│    201906 │ █▏                       │
│    201907 │ ██▎                      │
│    201908 │ ██▋                      │
│    201909 │ █▋                       │
│    201910 │ █                        │
│    201911 │ ███                      │
│    201912 │ █▎                       │
│    202001 │ ███████████▋             │
│    202002 │ ██████▌                  │
│    202003 │ ███████████▋             │
│    202004 │ ███████▎                 │
│    202005 │ ██████▏                  │
│    202006 │ ██████▏                  │
│    202007 │ ███████▋                 │
│    202008 │ ███▋                     │
│    202009 │ ████                     │
│    202010 │ ████▌                    │
│    202011 │ █████▏                   │
│    202012 │ ███▋                     │
│    202101 │ ███▏                     │
│    202102 │ █████████                │
│    202103 │ █████████████▋           │
│    202104 │ ███▏                     │
│    202105 │ ████████████▋            │
│    202106 │ ███                      │
│    202107 │ █████▏                   │
│    202108 │ ████▎                    │
│    202109 │ ██████████████████▎      │
│    202110 │ ▏                        │
└───────────┴──────────────────────────┘
```

「ClickHouse」は時間の経過とともに人気が高まっているようです。

#### ClickHouse関連の記事のトップコメント者は誰か？ {#top-commenters}

```sql title="Query"
SELECT
   by,
   count() AS comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY comments DESC
LIMIT 5
```

```response title="Response"
┌─by──────────┬─comments─┐
│ hodgesrm    │       78 │
│ zX41ZdbW    │       45 │
│ manigandham │       39 │
│ pachico     │       35 │
│ valyala     │       27 │
└─────────────┴──────────┘
```

#### どのコメントが最も関心を引くか？ {#comments-by-most-interest}

```sql title="Query"
SELECT
  by,
  sum(score) AS total_score,
  sum(length(kids)) AS total_sub_comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY total_score DESC
LIMIT 5
```

```response title="Response"
┌─by───────┬─total_score─┬─total_sub_comments─┐
│ zX41ZdbW │        571  │              50    │
│ jetter   │        386  │              30    │
│ hodgesrm │        312  │              50    │
│ mechmind │        243  │              16    │
│ tosh     │        198  │              12    │
└──────────┴─────────────┴────────────────────┘
```

</VerticalStepper>

## Parquet {#parquet}

ClickHouseの強みの1つは、あらゆる数の[フォーマット](/interfaces/formats)を扱う能力です。CSVは理想的な使用例を示し、データ交換に最も効率的ではありません。

次に、効率的な列指向フォーマットであるParquetファイルからデータを読み込みます。

Parquetには最小限のタイプがあり、ClickHouseはこれを尊重する必要があります。このタイプ情報はフォーマット自体にエンコードされています。Parquetファイルのタイプ推測は、CSVファイル用のスキーマとは必然的に少し異なる結果になります。

<VerticalStepper headerLevel="h3">

### データを挿入する {#insert-the-data}

次のクエリを実行して、Parquetフォーマットで同じデータを読み取ります。再び、url関数を使用してリモートデータを読み取ります。

```sql
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
ENGINE = MergeTree
ORDER BY id
SETTINGS allow_nullable_key = 1 EMPTY AS
SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')

INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')
```

:::note ParquetでのNullキー
Parquetフォーマットの条件として、キーが`NULL`である可能性を受け入れなければなりません。
データには含まれていないにもかかわらず。
:::

次のコマンドを実行して、推測されたスキーマを表示します。

```sql title="Query"
┌─name────────┬─type───────────────────┬
│ id          │ Nullable(Int64)        │
│ deleted     │ Nullable(UInt8)        │
│ type        │ Nullable(String)       │
│ time        │ Nullable(Int64)        │
│ text        │ Nullable(String)       │
│ dead        │ Nullable(UInt8)        │
│ parent      │ Nullable(Int64)        │
│ poll        │ Nullable(Int64)        │
│ kids        │ Array(Nullable(Int64)) │
│ url         │ Nullable(String)       │
│ score       │ Nullable(Int32)        │
│ title       │ Nullable(String)       │
│ parts       │ Array(Nullable(Int64)) │
│ descendants │ Nullable(Int32)        │
└─────────────┴────────────────────────┴
```

CSVファイルと同様に、選択したタイプに対するより高い制御を得るためにスキーマを手動で指定し、データをs3から直接挿入できます。

```sql
CREATE TABLE hackernews
(
    `id` UInt64,
    `deleted` UInt8,
    `type` String,
    `author` String,
    `timestamp` DateTime,
    `comment` String,
    `dead` UInt8,
    `parent` UInt64,
    `poll` UInt64,
    `children` Array(UInt32),
    `url` String,
    `score` UInt32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);

INSERT INTO hackernews
SELECT * FROM s3(
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        'id UInt64,
         deleted UInt8,
         type String,
         by String,
         time DateTime,
         text String,
         dead UInt8,
         parent UInt64,
         poll UInt64,
         kids Array(UInt32),
         url String,
         score UInt32,
         title String,
         parts Array(UInt32),
         descendants UInt32');
```

### クエリを高速化するためにスキッピングインデックスを追加する {#add-skipping-index}

「ClickHouse」を言及しているコメントの数を見つけるには、次のクエリを実行します。

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'ClickHouse');
```

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.843 sec. Processed 28.74 million rows, 9.75 GB (34.08 million rows/s., 11.57 GB/s.)
┌─count()─┐
│     516 │
└─────────┘
```

次に、「comment」カラムに反転[インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成して、このクエリを高速化します。小文字のコメントは、ケースに依存せずに用語を見つけるためにインデックスされることに注意してください。

次のコマンドを実行してインデックスを作成します。

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```

インデックスのマテリアライズにはしばらくかかります（インデックスが作成されたか確認するには、システムテーブル`system.data_skipping_indices`を使用します）。

インデックスが作成されたら、再度クエリを実行します。

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

インデックスを使用して、クエリの実行時間が0.843秒から0.248秒になったことに注意してください。

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

[`EXPLAIN`](/sql-reference/statements/explain)句を使用すると、このインデックスの追加がクエリを約3.4倍改善した理由を理解できます。

```response text="Query"
EXPLAIN indexes = 1
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

```response title="Response"
┌─explain─────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))     │
│   Aggregating                                   │
│     Expression (Before GROUP BY)                │
│       Filter (WHERE)                            │
│         ReadFromMergeTree (default.hackernews)  │
│         Indexes:                                │
│           PrimaryKey                            │
│             Condition: true                     │
│             Parts: 4/4                          │
│             Granules: 3528/3528                 │
│           Skip                                  │
│             Name: comment_idx                   │
│             Description: inverted GRANULARITY 1 │
│             Parts: 4/4                          │
│             Granules: 554/3528                  │
└─────────────────────────────────────────────────┘
```

インデックスがクエリの高速化のために大規模なグラニュールのスキップを可能にしたことに注意してください。

さらに、一つまたは複数の用語を効率的に検索することも可能です。

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);
```

```response title="Response"
┌─count()─┐
│    2177 │
└─────────┘
```

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

```response
┌─count()─┐
│      22 │
└─────────┘
```

</VerticalStepper>
