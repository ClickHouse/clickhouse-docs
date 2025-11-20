---
description: 'Hacker News のデータ 2,800 万行を含むデータセット。'
sidebar_label: 'Hacker News'
slug: /getting-started/example-datasets/hacker-news
title: 'Hacker News データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'hacker news', 'サンプルデータ', 'テキスト分析', 'ベクトル検索']
---



# Hacker News データセット

> このチュートリアルでは、CSV と Parquet の両方の形式から 2,800 万行の Hacker News データを ClickHouse のテーブルに取り込み、いくつかの簡単なクエリを実行してデータを探索します。



## CSV {#csv}

<VerticalStepper headerLevel="h3">

### CSVのダウンロード {#download}

データセットのCSV版は、公開[S3バケット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz)からダウンロードできます。または、次のコマンドを実行してダウンロードすることもできます:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

4.6GB、2800万行のこの圧縮ファイルは、ダウンロードに5〜10分かかります。

### データのサンプリング {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/)を使用すると、ClickHouseサーバーをデプロイおよび設定することなく、ローカルファイルに対して高速な処理を実行できます。

ClickHouseにデータを保存する前に、clickhouse-localを使用してファイルをサンプリングしましょう。
コンソールから次のコマンドを実行します:

```bash
clickhouse-local
```

次に、以下のコマンドを実行してデータを確認します:

```sql title="クエリ"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="レスポンス"
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

このコマンドには多くの便利な機能があります。
[`file`](/sql-reference/functions/files/#file)演算子を使用すると、`CSVWithNames`形式のみを指定してローカルディスクからファイルを読み取ることができます。
最も重要なのは、ファイルの内容からスキーマが自動的に推論されることです。
また、`clickhouse-local`が拡張子からgzip形式を推論して圧縮ファイルを読み取れることにも注目してください。
`Vertical`形式は、各カラムのデータをより見やすく表示するために使用されています。

### スキーマ推論を使用したデータの読み込み {#loading-the-data}

データ読み込みのための最もシンプルかつ強力なツールは`clickhouse-client`です。これは機能豊富なネイティブコマンドラインクライアントです。
データを読み込む際には、再びスキーマ推論を活用し、ClickHouseにカラムの型を判定させることができます。

次のコマンドを実行してテーブルを作成し、リモートCSVファイルから直接データを挿入します。[`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url)関数を介してコンテンツにアクセスします。
スキーマは自動的に推論されます:

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

これにより、データから推論されたスキーマを使用して空のテーブルが作成されます。
[`DESCRIBE TABLE`](/sql-reference/statements/describe-table)コマンドを使用すると、割り当てられた型を確認できます。

```sql title="クエリ"
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

このテーブルにデータを挿入するには、`INSERT INTO, SELECT` コマンドを使用します。
`url` 関数と組み合わせることで、URL から直接データがストリーミングされます:

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

単一のコマンドで ClickHouse に 2,800 万行の挿入が完了しました!

### データの探索 {#explore}

次のクエリを実行して、Hacker News のストーリーと特定のカラムをサンプリングします:

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

スキーマ推論は初期のデータ探索には優れたツールですが、「ベストエフォート」であり、データに最適なスキーマを定義する長期的な代替手段にはなりません。

### スキーマの定義 {#define-a-schema}

最初の最適化として、各フィールドに型を定義することが挙げられます。
time フィールドを `DateTime` 型として宣言することに加えて、既存のデータセットを削除した後、以下の各フィールドに適切な型を定義します。
ClickHouse では、データのプライマリキー id は `ORDER BY` 句で定義されます。

適切な型を選択し、`ORDER BY` 句に含めるカラムを選択することで、クエリ速度と圧縮率の向上に役立ちます。

以下のクエリを実行して、古いスキーマを削除し、改善されたスキーマを作成します:

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

最適化されたスキーマにより、ローカルファイルシステムからデータを挿入できるようになりました。
再び `clickhouse-client` を使用して、明示的な `INSERT INTO` と `INFILE` 句を使用してファイルを挿入します。

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### サンプルクエリの実行 {#run-sample-queries}

独自のクエリを作成する際の参考として、以下にいくつかのサンプルクエリを示します。


#### Hacker Newsにおいて「ClickHouse」はどの程度話題になっているか？ {#how-pervasive}

`score`フィールドはストーリーの人気度を示す指標を提供し、`id`フィールドと`||`連結演算子を使用して元の投稿へのリンクを生成できます。

```sql title="クエリ"
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

```response title="レスポンス"
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

ClickHouseは時間の経過とともにより多く言及されるようになっているのでしょうか？ここでは、`time`フィールドを`DateTime`として定義することの有用性が示されています。適切なデータ型を使用することで、`toYYYYMM()`関数を使用できるようになります。

```sql title="クエリ"
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

時間の経過とともにClickHouseの人気が高まっていることがわかります。

#### ClickHouse関連記事で最も多くコメントしているのは誰か？ {#top-commenters}

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

#### 最も関心を集めているコメントは？ {#comments-by-most-interest}


```sql title="クエリ"
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

```response title="応答"
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

ClickHouseの強みの一つは、多数の[フォーマット](/interfaces/formats)を扱える能力です。
CSVは比較的理想的なユースケースを表していますが、データ交換において最も効率的というわけではありません。

次に、効率的なカラム指向フォーマットであるParquetファイルからデータを読み込みます。

Parquetは最小限の型を持ち、ClickHouseはこれを尊重する必要があります。この型情報はフォーマット自体にエンコードされています。
Parquetファイルに対する型推論は、必然的にCSVファイルとは若干異なるスキーマになります。

<VerticalStepper headerLevel="h3">

### データの挿入 {#insert-the-data}

次のクエリを実行して、同じデータをParquetフォーマットで読み込みます。再度url関数を使用してリモートデータを読み込みます:

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

:::note ParquetにおけるNullキー
Parquetフォーマットの条件として、データ内に実際には存在しない場合でも、キーが`NULL`である可能性を受け入れる必要があります。
:::

次のコマンドを実行して、推論されたスキーマを表示します:

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

CSVファイルの場合と同様に、選択する型をより細かく制御するためにスキーマを手動で指定し、s3から直接データを挿入できます:

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

### クエリを高速化するためのスキッピングインデックスの追加 {#add-skipping-index}

「ClickHouse」に言及しているコメントの数を調べるには、次のクエリを実行します:

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

次に、このクエリを高速化するために、「comment」カラムに転置[インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成します。
大文字小文字に関係なく用語を検索できるように、小文字化されたコメントがインデックス化されることに注意してください。

次のコマンドを実行してインデックスを作成します:

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```


インデックスの実体化には時間がかかります（インデックスが作成されたかどうかを確認するには、システムテーブル `system.data_skipping_indices` を使用してください）。

インデックスが作成されたら、クエリを再実行します：

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

インデックスを使用することで、クエリの実行時間がインデックスなしの0.843秒から0.248秒に短縮されたことに注目してください：

```response title="Response"
#highlight-next-line
1行を返しました。経過時間：0.248秒。処理行数：454万行、1.79 GB（1834万行/秒、7.24 GB/秒）
┌─count()─┐
│    1145 │
└─────────┘
```

[`EXPLAIN`](/sql-reference/statements/explain) 句を使用することで、このインデックスの追加によってクエリが約3.4倍高速化された理由を理解できます。

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

インデックスによって大量のグラニュールをスキップできるようになり、クエリが高速化されたことに注目してください。

また、単一の用語、または複数の用語すべてを効率的に検索することも可能になりました：

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
