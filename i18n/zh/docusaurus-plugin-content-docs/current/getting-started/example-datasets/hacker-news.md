---
'description': '数据集包含 2800 万行的 hacker news 数据。'
'sidebar_label': 'Hacker News'
'slug': '/getting-started/example-datasets/hacker-news'
'title': 'Hacker News 数据集'
'doc_type': 'reference'
---


# Hacker News 数据集

> 在本教程中，您将从 CSV 和 Parquet 格式中向 ClickHouse 表插入 2800 万行 Hacker News 数据，并运行一些简单的查询来探索数据。

## CSV {#csv}

<VerticalStepper headerLevel="h3">

### 下载 CSV {#download}

数据集的 CSV 版本可以从我们的公共 [S3 bucket](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz) 下载，或者通过运行以下命令来获取：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

这个压缩文件大小为 4.6GB，包含 2800 万行，下载需要大约 5-10 分钟。

### 采样数据 {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/) 允许用户对本地文件进行快速处理，而无需部署和配置 ClickHouse 服务器。

在将任何数据存储到 ClickHouse 之前，让我们使用 clickhouse-local 对文件进行采样。
从控制台运行：

```bash
clickhouse-local
```

接下来，运行以下命令来探索数据：

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

此命令中有许多微妙的能力。
[`file`](/sql-reference/functions/files/#file) 操作符允许您从本地磁盘读取文件，仅指定格式为 `CSVWithNames`。
最重要的是，架构将从文件内容中自动推断出。
另外注意 `clickhouse-local` 如何能够读取压缩文件，并根据扩展名推断 gzip 格式。
`Vertical` 格式用于更轻松地查看每一列的数据。

### 使用模式推断加载数据 {#loading-the-data}

加载数据最简单且功能最强大的工具是 `clickhouse-client`：这是一个功能丰富的本地命令行客户端。
要加载数据，您可以再次利用模式推断，依赖 ClickHouse 来确定列的数据类型。

运行以下命令以创建一个表并直接从远程 CSV 文件插入数据，通过 [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url) 函数访问内容。
架构将自动推断：

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

这将创建一个空表，使用从数据推断出的架构。
[`DESCRIBE TABLE`](/sql-reference/statements/describe-table) 命令允许我们理解这些分配的类型。

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

要将数据插入此表中，请使用 `INSERT INTO, SELECT` 命令。
结合 `url` 函数，数据将直接从 URL 流式传输：

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

您已经成功使用一条命令将 2800 万行插入到 ClickHouse 中！

### 探索数据 {#explore}

通过运行以下查询，对 Hacker News 故事和特定列进行采样：

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

虽然模式推断是初始数据探索的一个优秀工具，但它是“最佳努力”的，不能替代为您的数据定义最佳架构的长期方案。

### 定义架构 {#define-a-schema}

显而易见的立即优化是为每个字段定义类型。
除了将时间字段声明为 `DateTime` 类型外，我们在删除现有数据集后为下方的每个字段定义适当的类型。
在 ClickHouse 中，数据的主键 id 通过 `ORDER BY` 子句定义。

选择适当的类型和决定在 `ORDER BY` 子句中包含哪些列将有助于提高查询速度和压缩效果。

运行下面的查询以删除旧架构并创建改进的架构：

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

使用优化后的架构，您现在可以从本地文件系统插入数据。
同样使用 `clickhouse-client`，通过显式的 `INSERT INTO` 使用 `INFILE` 子句插入文件。

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### 运行示例查询 {#run-sample-queries}

以下是一些示例查询，以激励您编写自己的查询。

#### “ClickHouse” 在 Hacker News 中的传播程度如何？ {#how-pervasive}

得分字段提供了故事的流行度指标，而 `id` 字段和 `||` 
连接操作符可用于生成指向原始帖子的链接。

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

ClickHouse 的噪声是否随着时间的推移而增加？这里展示了将 `time` 字段定义为 `DateTime` 的重要性，因为使用适当的数据类型允许您使用 `toYYYYMM()` 函数：

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

看起来“ClickHouse”的受欢迎程度随着时间的推移而增长。

#### 谁是 ClickHouse 相关文章的顶级评论者？ {#top-commenters}

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

#### 哪些评论产生了最多的兴趣？ {#comments-by-most-interest}

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

ClickHouse 的一个优势是能够处理任意数量的 [格式](/interfaces/formats)。
CSV 代表了一个相当理想的用例，但并不是数据交换中最有效的格式。

接下来，您将从 Parquet 文件中加载数据，这是一个高效的列式格式。

Parquet 拥有最小的数据类型，ClickHouse 需要遵循这些类型信息，并且这些类型信息编码在格式本身中。
对 Parquet 文件的类型推断必然会导致与 CSV 文件的架构略有不同。

<VerticalStepper headerLevel="h3">

### 插入数据 {#insert-the-data}

运行以下查询以读取相同的 Parquet 格式数据，同样使用 url 函数读取远程数据：

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

:::note Parquet 的 Null 键
作为 Parquet 格式的条件，我们必须接受键可能为 `NULL`，
即使它们不在数据中。
:::

运行以下命令以查看推断的架构：

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

与 CSV 文件一样，您可以手动指定架构，以更好地控制所选择的类型，并直接从 s3 插入数据：

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

### 添加跳过索引以加速查询 {#add-skipping-index}

要找出有多少评论提及“ClickHouse”，请运行以下查询：

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

接下来，您将创建一个反向 [索引](/engines/table-engines/mergetree-family/invertedindexes) 在“comment” 列上，以加速此查询。
请注意，小写评论将被索引，以独立于大小写查找术语。

运行以下命令以创建索引：

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```

索引的生成会花费一些时间（要检查索引是否已创建，请使用系统表 `system.data_skipping_indices`）。

一旦索引创建完成，再次运行查询：

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意查询现在只需 0.248 秒，而之前没有索引时为 0.843 秒：

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

可以使用 [`EXPLAIN`](/sql-reference/statements/explain) 子句了解为什么添加此索引使查询速度提升约 3.4 倍。

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

注意到索引允许跳过大量粒度，以加速查询。

现在还可以高效地搜索一个或多个术语：

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
