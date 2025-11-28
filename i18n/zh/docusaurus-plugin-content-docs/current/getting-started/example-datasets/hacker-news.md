---
description: '包含 2800 万条 Hacker News 数据记录的数据集。'
sidebar_label: 'Hacker News'
slug: /getting-started/example-datasets/hacker-news
title: 'Hacker News 数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'Hacker News', '样本数据', '文本分析', '向量搜索']
---

# Hacker News 数据集

> 在本教程中，你将把 2800 万行 Hacker News 数据（来自 CSV 和 Parquet 两种格式）插入到一个 ClickHouse 表中，并运行一些简单的查询来探索这些数据。

## CSV {#csv}

<VerticalStepper headerLevel="h3">
  ### 下载 CSV

  该数据集的 CSV 版本可从我们的公共 [S3 存储桶](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz)下载,或通过运行以下命令获取:

  ```bash
  wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
  ```

  该压缩文件大小为 4.6GB,包含 2800 万行数据,下载需要 5-10 分钟。

  ### 数据采样

  [`clickhouse-local`](/operations/utilities/clickhouse-local/) 允许用户对本地文件进行快速处理,而无需部署和配置 ClickHouse 服务器。

  在将任何数据存储到 ClickHouse 之前,先使用 clickhouse-local 对文件进行采样。
  在控制台中运行:

  ```bash
  clickhouse-local
  ```

  接下来,运行以下命令以浏览数据:

  ```sql title="Query"
  SELECT *
  FROM file('hacknernews.csv.gz', CSVWithNames)
  LIMIT 2
  SETTINGS input_format_try_infer_datetimes = 0
  FORMAT Vertical
  ```

  ```response title="Response"
  第 1 行:
  ──────
  id:          344065
  deleted:     0
  type:        comment
  by:          callmeed
  time:        2008-10-26 05:06:58
  text:        您需要什么类型的报告?<p>ActiveMerchant 只是将您的应用程序连接到网关以进行信用卡批准和处理。<p>Braintree 提供非常完善的交易报告,并且退款操作非常简便。<p>此外,您使用的毕竟是 Rails——从订阅者基础生成一些报告是相当容易的。
  dead:        0
  parent:      344038
  poll:        0
  kids:        []
  url:
  score:       0
  title:
  parts:       []
  descendants: 0

  第 2 行:
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
  title:       Arc 应该从 Ruby 学习什么
  parts:       []
  descendants: 10
  ```

  该命令包含许多强大的功能。
  [`file`](/sql-reference/functions/files/#file) 操作符允许您从本地磁盘读取文件,只需指定 `CSVWithNames` 格式即可。
  最重要的是,系统会根据文件内容自动推断数据模式。
  另外请注意,`clickhouse-local` 能够读取压缩文件,并根据扩展名自动识别 gzip 格式。
  使用 `Vertical` 格式可以更方便地查看每列的数据。

  ### 使用架构推断加载数据

  用于数据加载的最简单且最强大的工具是 `clickhouse-client`:一个功能丰富的原生命令行客户端。
  加载数据时,您可以再次利用模式推断功能,由 ClickHouse 自动确定列的类型。

  运行以下命令创建表并直接从远程 CSV 文件插入数据,通过 [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url) 函数访问文件内容。
  架构会自动推断:

  ```sql
  CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
  (
  ) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
  ```

  这将根据从数据中推断出的模式创建一个空表。
  使用 [`DESCRIBE TABLE`](/sql-reference/statements/describe-table) 命令可以查看这些分配的类型。

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

  要将数据插入此表,请使用 `INSERT INTO, SELECT` 命令。
  配合 `url` 函数,数据将直接从 URL 流式传输:

  ```sql
  INSERT INTO hackernews SELECT *
  FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
  ```

  您已成功使用单条命令向 ClickHouse 插入了 2800 万行数据!

  ### 探索数据

  通过运行以下查询对 Hacker News 数据的特定列进行采样：

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
  行 1:
  ──────
  id:    2596866
  title:
  type:  story
  by:
  time:  1306685152
  url:
  score: 0

  行 2:
  ──────
  id:    2596870
  title: WordPress 记录用户最后登录日期和时间
  type:  story
  by:    wpsnipp
  time:  1306685252
  url:   http://wpsnipp.com/index.php/date/capture-users-last-login-date-and-time/
  score: 1

  行 3:
  ──────
  id:    2596872
  title: 应届大学毕业生获得创业建议
  type:  story
  by:    whenimgone
  time:  1306685352
  url:   http://articles.chicagotribune.com/2011-05-27/business/sc-cons-0526-started-20110527_1_business-plan-recession-college-graduates
  score: 1
  ```

  虽然模式推断是初步数据探索的实用工具,但它采用&quot;尽力而为&quot;的方式,不应作为定义最优数据模式的长期替代方案。

  ### 定义架构

  一个显而易见的优化方法是为每个字段定义类型。
  除了将时间字段声明为 `DateTime` 类型外,在删除现有数据集后,我们还需为下列各字段定义相应的类型。
  在 ClickHouse 中,数据的主键通过 `ORDER BY` 子句定义。

  选择合适的数据类型并确定 `ORDER BY` 子句中应包含哪些列,有助于提升查询速度和压缩率。

  运行以下查询以删除旧模式并创建改进的模式：

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

  优化模式后,现在可以从本地文件系统插入数据。
  继续使用 `clickhouse-client`,通过 `INFILE` 子句配合显式 `INSERT INTO` 语句插入文件。

  ```sql title="Query"
  INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
  ```

  ### 运行示例查询

  下面提供了一些示例查询，供您在编写自定义查询时参考。

  #### &quot;ClickHouse&quot;这一话题在 Hacker News 上有多普遍？

  score 字段提供了故事热度的度量指标,而 `id` 字段和 `||` 连接运算符可用于生成原始帖子的链接。

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
  行 1:
  ──────
  time:        1632154428
  score:       519
  descendants: 159
  title:       ClickHouse, Inc.
  url:         https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md
  hn_url:      https://news.ycombinator.com/item?id=28595419

  行 2:
  ──────
  time:        1614699632
  score:       383
  descendants: 134
  title:       ClickHouse 作为 Elasticsearch 日志存储与分析的替代方案
  url:         https://pixeljets.com/blog/clickhouse-vs-elasticsearch/
  hn_url:      https://news.ycombinator.com/item?id=26316401

  行 3:
  ──────
  time:        1465985177
  score:       243
  descendants: 70
  title:       ClickHouse – 高性能开源分布式列式数据库管理系统
  url:         https://clickhouse.yandex/reference_en.html
  hn_url:      https://news.ycombinator.com/item?id=11908254

  行 4:
  ──────
  time:        1578331410
  score:       216
  descendants: 86
  title:       ClickHouse 成本效益实战:在 Intel NUC 上分析 5000 亿行数据
  url:         https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc
  hn_url:      https://news.ycombinator.com/item?id=21970952

  行 5:
  ──────
  time:        1622160768
  score:       198
  descendants: 55
  title:       ClickHouse:开源列式数据库管理系统
  url:         https://github.com/ClickHouse/ClickHouse
  hn_url:      https://news.ycombinator.com/item?id=27310247
  ```

  ClickHouse 是否随时间推移产生了更多噪声？这里展示了将 `time` 字段定义为 `DateTime` 类型的优势，使用正确的数据类型可以让您调用 `toYYYYMM()` 函数：

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

  看起来 &quot;ClickHouse&quot; 的受欢迎程度正在不断提升。

  #### 谁是 ClickHouse 相关文章的热门评论者?

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

  #### 哪些评论获得了最多关注？

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

ClickHouse 的优势之一是它能够处理任意数量的[格式](/interfaces/formats)。
CSV 是一个相当理想的用例，但在数据交换方面并不是最高效的。

接下来，将从一个 Parquet 文件中加载数据，它是一种高效的列式格式。

Parquet 仅支持少量数据类型，ClickHouse 需要遵循这些类型，而这些类型信息被编码在格式本身中。
对 Parquet 文件进行类型推断通常会得到一个与 CSV 文件所使用的表结构（schema）略有不同的结果。

<VerticalStepper headerLevel="h3">
  ### 插入数据

  运行以下查询以 Parquet 格式读取相同的数据，再次使用 `url` 函数读取远程数据：

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

  :::note Parquet 格式中的空键
  由于 Parquet 格式的条件限制,我们必须接受键可能为 `NULL`,
  即使数据中实际上并不包含空值。
  :::

  运行以下命令查看推断的架构:

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

  与之前处理 CSV 文件时一样,您可以手动指定模式以更精确地控制所选类型,并直接从 S3 插入数据:

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

  ### 添加跳跃索引以加速查询

  要查找提到&quot;ClickHouse&quot;的评论数量,请运行以下查询:

  ```sql title="Query"
  SELECT count(*)
  FROM hackernews
  WHERE hasToken(lower(comment), 'ClickHouse');
  ```

  ```response title="Response"
  #highlight-next-line
  返回 1 行。用时:0.843 秒。已处理 2874 万行,9.75 GB(3408 万行/秒,11.57 GB/秒)
  ┌─count()─┐
  │     516 │
  └─────────┘
  ```

  接下来,您将在 &quot;comment&quot; 列上创建一个倒排[索引](/engines/table-engines/mergetree-family/invertedindexes),以加快查询速度。
  请注意,评论内容将以小写形式建立索引,从而实现不区分大小写的词条查找。

  运行以下命令以创建索引：

  ```sql
  ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
  ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
  ```

  索引的物化需要一段时间(若要检查索引是否已创建,请使用系统表 `system.data_skipping_indices`)。

  索引创建完成后,再次运行查询:

  ```sql title="Query"
  SELECT count(*)
  FROM hackernews
  WHERE hasToken(lower(comment), 'clickhouse');
  ```

  注意查询在使用索引后仅需 0.248 秒,相比之前未使用索引时的 0.843 秒有显著提升:

  ```response title="Response"
  #highlight-next-line
  返回 1 行。用时:0.248 秒。已处理 454 万行,1.79 GB(1834 万行/秒,7.24 GB/秒)
  ┌─count()─┐
  │    1145 │
  └─────────┘
  ```

  可以使用 [`EXPLAIN`](/sql-reference/statements/explain) 子句来了解添加此索引后查询性能提升约 3.4 倍的原因。

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

  注意索引如何通过跳过大量数据颗粒来加速查询。

  现在还可以高效地搜索单个术语或所有多个术语:

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