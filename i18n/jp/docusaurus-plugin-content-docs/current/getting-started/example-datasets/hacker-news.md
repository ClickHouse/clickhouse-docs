---
description: 'Hacker News のデータ2,800万行を含むデータセット。'
sidebar_label: 'Hacker News'
slug: /getting-started/example-datasets/hacker-news
title: 'Hacker News データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'Hacker News', 'サンプルデータ', 'テキスト分析', 'ベクトル検索']
---

# Hacker News データセット {#hacker-news-dataset}

> このチュートリアルでは、Hacker News のデータ 2,800 万行を、CSV および Parquet 形式から ClickHouse
> のテーブルに挿入し、そのデータを探索するための簡単なクエリを実行します。

## CSV {#csv}

<VerticalStepper headerLevel="h3">
  ### CSVのダウンロード

  データセットのCSV版は、公開[S3バケット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz)からダウンロードするか、以下のコマンドを実行することで取得できます:

  ```bash
  wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
  ```

  この圧縮ファイルは4.6GB、2800万行で、ダウンロードには5〜10分程度かかります。

  ### データをサンプリングする

  [`clickhouse-local`](/operations/utilities/clickhouse-local/)を使用すると、ClickHouseサーバーのデプロイや設定を行うことなく、ローカルファイルに対して高速処理を実行できます。

  ClickHouseにデータを保存する前に、clickhouse-localを使用してファイルをサンプリングします。
  コンソールから以下を実行します:

  ```bash
  clickhouse-local
  ```

  次に、以下のコマンドを実行してデータを探索します:

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

  このコマンドには多くの便利な機能があります。
  [`file`](/sql-reference/functions/files/#file)演算子を使用すると、`CSVWithNames`形式を指定するだけでローカルディスクからファイルを読み取ることができます。
  最も重要な点として、スキーマはファイルの内容から自動的に推論されます。
  また、`clickhouse-local`が拡張子からgzip形式を推論して圧縮ファイルを読み取ることができる点にも注目してください。
  `Vertical`形式は、各カラムのデータをより見やすく表示するために使用されます。

  ### スキーマ推論によるデータの読み込み

  データ読み込みに最もシンプルかつ強力なツールは`clickhouse-client`です。これは機能豊富なネイティブコマンドラインクライアントです。
  To load data, you can again exploit schema inference, relying on ClickHouse to determine the types of the columns.

  以下のコマンドを実行して、テーブルを作成し、リモートCSVファイルから直接データを挿入します。ファイルの内容には[`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url)関数を使用してアクセスします。
  スキーマは自動的に推論されます：

  ```sql
  CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
  (
  ) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
  ```

  This creates an empty table using the schema inferred from the data.
  [`DESCRIBE TABLE`](/sql-reference/statements/describe-table)コマンドを使用することで、割り当てられた型を確認できます。

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

  このテーブルにデータを挿入するには、`INSERT INTO, SELECT`コマンドを使用します。
  `url`関数と組み合わせることで、URLから直接データがストリーミングされます:

  ```sql
  INSERT INTO hackernews SELECT *
  FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
  ```

  単一のコマンドで2800万行をClickHouseに正常に挿入しました！

  ### データを探索する

  以下のクエリを実行して、Hacker Newsのストーリーと特定のカラムをサンプリングします:

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

  スキーマ推論は初期のデータ探索には有用なツールですが、「ベストエフォート」型の機能であり、データに最適なスキーマを定義することの長期的な代替手段にはなりません。

  ### スキーマを定義する

  明らかな即時最適化として、各フィールドに型を定義することが挙げられます。
  時刻フィールドを`DateTime`型として宣言することに加えて、既存のデータセットを削除した後、以下の各フィールドに適切な型を定義します。
  ClickHouseでは、データのプライマリキーは`ORDER BY`句によって定義されます。

  適切なデータ型を選択し、`ORDER BY`句に含めるカラムを選定することで、クエリ速度と圧縮率を向上させることができます。

  以下のクエリを実行して、既存のスキーマを削除し、改善されたスキーマを作成します:

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

  最適化されたスキーマを使用することで、ローカルファイルシステムからデータを挿入できるようになります。
  再び`clickhouse-client`を使用して、明示的な`INSERT INTO`と`INFILE`句でファイルを挿入します。

  ```sql title="Query"
  INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
  ```

  ### サンプルクエリを実行する

  以下にサンプルクエリを示します。独自のクエリを記述する際の参考にしてください。

  #### Hacker Newsにおいて「ClickHouse」はどの程度話題になっているか？

  scoreフィールドはストーリーの人気度の指標を提供し、`id`フィールドと`||`連結演算子を使用して元の投稿へのリンクを生成できます。

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

  ClickHouseは時間の経過とともにより多くの話題を生成しているでしょうか？ここでは、`time`フィールドを`DateTime`として定義することの有用性が示されています。適切なデータ型を使用することで、`toYYYYMM()`関数を利用できます：

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

  &quot;ClickHouse&quot;の人気が時間とともに高まっているようです。

  #### ClickHouse関連記事のトップコメント投稿者は誰か？

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

  #### どのコメントが最も関心を集めているか？

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

ClickHouse の強みの 1 つは、任意の数の[フォーマット](/interfaces/formats)を扱えることです。
CSV は典型的なユースケースを表しますが、データ交換の観点では最も効率的というわけではありません。

次に、効率的なカラム指向フォーマットである Parquet ファイルからデータをロードします。

Parquet には最小限の型しかなく、ClickHouse はそれに準拠する必要があり、この型情報はフォーマット自体にエンコードされています。
Parquet ファイルに対する型推論では、CSV ファイルのスキーマとは必ずわずかに異なるスキーマが得られます。

<VerticalStepper headerLevel="h3">
  ### データを挿入する

  以下のクエリを実行して、同じデータをParquet形式で読み取ります。ここでも`url`関数を使用してリモートデータを読み取ります:

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
  Parquet形式の仕様上、実際のデータには存在しない場合でも、キーが`NULL`になる可能性を考慮する必要があります。
  :::

  推論されたスキーマを表示するには、次のコマンドを実行します:

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

  CSV ファイルの場合と同様に、選択する型をより細かく制御するためにスキーマを手動で指定し、S3 から直接データを挿入できます:

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

  ### クエリを高速化するスキッピングインデックスの追加

  「ClickHouse」に言及しているコメント数を確認するには、以下のクエリを実行します：

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

  次に、このクエリを高速化するために、「comment」列に転置[索引](/engines/table-engines/mergetree-family/textindexes)を作成します。
  なお、コメントは小文字に変換されてインデックス化されるため、大文字小文字を区別せずに用語を検索できます。

  以下のコマンドを実行してインデックスを作成します:

  ```sql
  ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
  ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
  ```

  インデックスのマテリアライゼーションには時間がかかります（インデックスが作成されたかどうかを確認するには、システムテーブル `system.data_skipping_indices` を使用します）。

  インデックスの作成後、クエリを再実行してください：

  ```sql title="Query"
  SELECT count(*)
  FROM hackernews
  WHERE hasToken(lower(comment), 'clickhouse');
  ```

  インデックスを使用することで、クエリの実行時間が0.843秒から0.248秒に短縮されました:

  ```response title="Response"
  #highlight-next-line
  1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
  ┌─count()─┐
  │    1145 │
  └─────────┘
  ```

  [`EXPLAIN`](/sql-reference/statements/explain)句を使用して、このインデックスの追加によりクエリのパフォーマンスが約3.4倍向上した理由を確認できます。

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

  インデックスによって大量のグラニュールがスキップされ、クエリが高速化されていることに注目してください。

  1つまたは複数の用語すべてを効率的に検索することも可能になりました:

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