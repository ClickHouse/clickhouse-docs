---
description: '包含 2800 万行 Hacker News 数据的数据集。'
sidebar_label: 'Hacker News'
slug: /getting-started/example-datasets/hacker-news
title: 'Hacker News 数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'Hacker News', '示例数据', '文本分析', '向量搜索']
---



# Hacker News 数据集

> 本教程将演示如何从 CSV 和 Parquet 两种格式向一个 ClickHouse
> 表中插入 2800 万行 Hacker News 数据，并运行一些简单的查询来探索这些数据。



## CSV {#csv}

<VerticalStepper headerLevel="h3">

### 下载 CSV {#download}

可以从我们的公共 [S3 存储桶](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz) 下载数据集的 CSV 版本,或运行以下命令:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

该压缩文件大小为 4.6GB,包含 2800 万行数据,下载时间约为 5-10 分钟。

### 数据采样 {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/) 允许用户对本地文件执行快速处理,无需部署和配置 ClickHouse 服务器。

在将数据存储到 ClickHouse 之前,先使用 clickhouse-local 对文件进行采样。
在控制台中运行:

```bash
clickhouse-local
```

接下来,运行以下命令探索数据:

```sql title="查询"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="响应"
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

此命令具有许多强大的功能。
[`file`](/sql-reference/functions/files/#file) 操作符允许您从本地磁盘读取文件,仅需指定格式 `CSVWithNames`。
最重要的是,模式会根据文件内容自动推断。
还要注意 `clickhouse-local` 能够读取压缩文件,从扩展名推断出 gzip 格式。
使用 `Vertical` 格式可以更清晰地查看每列的数据。

### 使用模式推断加载数据 {#loading-the-data}

用于数据加载的最简单且最强大的工具是 `clickhouse-client`:一个功能丰富的原生命令行客户端。
要加载数据,您可以再次利用模式推断,由 ClickHouse 自动确定列的类型。

运行以下命令创建表并直接从远程 CSV 文件插入数据,通过 [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url) 函数访问内容。
模式会自动推断:

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

这将使用从数据推断出的模式创建一个空表。
[`DESCRIBE TABLE`](/sql-reference/statements/describe-table) 命令允许我们查看这些分配的类型。

```sql title="查询"
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

要向此表中插入数据，请使用 `INSERT INTO ... SELECT` 命令。
配合 `url` 函数使用时，数据将会以流式方式直接从该 URL 读取：

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

你已经使用一条命令成功向 ClickHouse 插入了 2800 万行数据！

### 探索数据

运行以下查询来抽样查看 Hacker News 的帖子及特定列：

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
第 1 行:
──────
id:    2596866
title:
type:  story
by:
time:  1306685152
url:
score: 0

第 2 行:
──────
id:    2596870
title: WordPress 记录用户最后登录日期和时间
type:  story
by:    wpsnipp
time:  1306685252
url:   http://wpsnipp.com/index.php/date/capture-users-last-login-date-and-time/
score: 1

第 3 行:
──────
id:    2596872
title: 应届大学毕业生获取创业经验
type:  story
by:    whenimgone
time:  1306685352
url:   http://articles.chicagotribune.com/2011-05-27/business/sc-cons-0526-started-20110527_1_business-plan-recession-college-graduates
score: 1
```

虽然模式推断是进行初始数据探索的有力工具，但它只是“尽力而为”，无法在长期内替代为你的数据定义一个最优的 schema。

### 定义 schema

一个显而易见且立竿见影的优化是为每个字段定义类型。
除了将时间字段声明为 `DateTime` 类型之外，在删除现有的数据集后，我们还为下面每个字段定义了合适的类型。
在 ClickHouse 中，数据的主键 ID 是通过 `ORDER BY` 子句定义的。

选择合适的类型，并决定哪些列要包含在 `ORDER BY` 子句中，将有助于提升查询性能和压缩效果。

运行下面的查询来删除旧的 schema 并创建改进后的 schema：

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

在完成 schema 优化后，你现在可以从本地文件系统插入数据。
同样使用 `clickhouse-client`，通过显式的 `INSERT INTO` 语句配合 `INFILE` 子句来插入该文件。

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### 运行示例查询

下面提供了一些示例查询，帮助你为编写自己的查询提供灵感。


#### 在 Hacker News 上，“ClickHouse” 这一话题有多常见？

`score` 字段提供了一个用于衡量故事热度的指标，而通过 `id` 字段与 `||` 连接运算符可以生成指向原始帖子的链接。

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
title:       ClickHouse 公司
url:         https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md
hn_url:      https://news.ycombinator.com/item?id=28595419

Row 2:
──────
time:        1614699632
score:       383
descendants: 134
title:       使用 ClickHouse 替代 Elasticsearch 进行日志存储和分析
url:         https://pixeljets.com/blog/clickhouse-vs-elasticsearch/
hn_url:      https://news.ycombinator.com/item?id=26316401

Row 3:
──────
time:        1465985177
score:       243
descendants: 70
title:       ClickHouse——高性能开源分布式列式数据库管理系统
url:         https://clickhouse.yandex/reference_en.html
hn_url:      https://news.ycombinator.com/item?id=11908254

Row 4:
──────
time:        1578331410
score:       216
descendants: 86
title:       ClickHouse 成本效益实战：在 Intel NUC 上分析 5000 亿行数据
url:         https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc
hn_url:      https://news.ycombinator.com/item?id=21970952

Row 5:
──────
time:        1622160768
score:       198
descendants: 55
title:       ClickHouse：开源列式数据库管理系统
url:         https://github.com/ClickHouse/ClickHouse
hn_url:      https://news.ycombinator.com/item?id=27310247
```

ClickHouse 产生的噪声是否在随时间增加？这里展示了将 `time` 字段定义为 `DateTime` 的用处，由于使用合适的数据类型，你可以使用 `toYYYYMM()` 函数：

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

看起来 ClickHouse 的受欢迎程度正在随着时间推移而提升。

#### 在与 ClickHouse 相关的文章中，哪些用户的评论最多？

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

#### 哪类评论最受关注？


```sql title="查询"
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

```response title="响应"
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

ClickHouse 的优势之一是能够处理任意数量的[格式](/interfaces/formats)。
CSV 是一个相当理想的用例,但并非数据交换的最高效格式。

接下来,您将从 Parquet 文件加载数据,这是一种高效的列式存储格式。

Parquet 具有精简的类型系统,ClickHouse 需要遵循这些类型,且类型信息已编码在格式本身中。
对 Parquet 文件进行类型推断必然会导致与 CSV 文件略有不同的模式。

<VerticalStepper headerLevel="h3">

### 插入数据 {#insert-the-data}

运行以下查询以 Parquet 格式读取相同的数据,再次使用 url 函数读取远程数据:

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
作为 Parquet 格式的要求,我们必须接受键可能为 `NULL`,
即使数据中实际上不存在 NULL 值。
:::

运行以下命令查看推断的模式:

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

与之前处理 CSV 文件一样,您可以手动指定模式以更好地控制所选类型,并直接从 S3 插入数据:

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

### 添加跳数索引以加速查询 {#add-skipping-index}

要查找有多少评论提到了 "ClickHouse",请运行以下查询:

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

接下来,您将在 "comment" 列上创建一个倒排[索引](/engines/table-engines/mergetree-family/invertedindexes)以加速此查询。
请注意,将对小写评论进行索引,以便不区分大小写地查找术语。

运行以下命令创建索引:

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```


索引的物化需要一段时间(要检查索引是否已创建,请使用系统表 `system.data_skipping_indices`)。

索引创建完成后,再次运行查询:

```sql title="查询"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意使用索引后查询仅需 0.248 秒,相比之前未使用索引时的 0.843 秒有显著提升:

```response title="响应"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

可以使用 [`EXPLAIN`](/sql-reference/statements/explain) 子句来了解为什么添加此索引将查询性能提升了约 3.4 倍。

```response text="查询"
EXPLAIN indexes = 1
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

```response title="响应"
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

注意索引通过跳过大量颗粒来加速查询。

现在还可以高效地搜索单个术语或多个术语:

```sql title="查询"
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);
```

```response title="响应"
┌─count()─┐
│    2177 │
└─────────┘
```

```sql title="查询"
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
