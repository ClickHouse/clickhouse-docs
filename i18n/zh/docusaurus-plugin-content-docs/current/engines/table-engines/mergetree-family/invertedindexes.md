---
'description': '快速在文本中查找搜索词。'
'keywords':
- 'full-text search'
- 'text search'
- 'index'
- 'indices'
'sidebar_label': '全文索引'
'slug': '/engines/table-engines/mergetree-family/invertedindexes'
'title': '使用全文索引进行全文搜索'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 全文搜索使用全文索引

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

全文索引是一种实验性类型的 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)，为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 列提供快速文本搜索能力。全文索引的主要思想是存储“术语”到包含这些术语的行的映射。“术语”是字符串列的标记单元。例如，字符串单元“我会稍微晚一点”默认被标记为六个术语“我”、“会”、“稍微”、“晚”、“一点”。另一种标记器是 n-grams。例如，3-gram 标记化的结果将是 21 个术语“我 w”，“ w”，“ wil”，“ ill”，“ ll “，“ l b”，“ be”等。输入字符串的标记越细粒度，生成的全文索引就越大，但也更有用。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/O_MnyUkrIq8"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

:::note
全文索引是实验性的，尚不应在生产环境中使用。未来它们的 DDL/DQL 语法或性能/压缩特征可能会发生向后不兼容的变化。
:::

## 使用方法 {#usage}

要使用全文索引，首先在配置中启用它们：

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在字符串列上定义全文索引

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE gin(tokenizer = 'default|ngram|noop' [, ngram_size = N] [, max_rows_per_postings_list = M]) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

其中 `tokenizer` 指定标记器：

- `default` 将标记器设置为 "tokens('default')"，即沿非字母数字字符拆分字符串。
- `ngram` 将标记器设置为 "tokens('ngram')"，即将字符串拆分为等大小的术语。
- `noop` 将标记器设置为 "tokens('noop')"，即每个值本身就是一个术语。

可以通过 `ngram_size` 参数指定 ngram 的大小。这是一个可选参数。存在以下变体：

- `ngram_size = N`：`N` 在 2 到 8 之间将标记器设置为 "tokens('ngram', N)"。
- 如果未指定：使用默认的 ngram 大小 3。

可以通过一个可选的 `max_rows_per_postings_list` 指定每个发布列表的最大行数。此参数可用于控制发布列表的大小，以避免生成巨大的发布列表文件。存在以下变体：

- `max_rows_per_postings_list = 0`：每个发布列表的最大行数没有限制。
- `max_rows_per_postings_list = M`：`M` 应至少为 8192。
- 如果未指定：使用默认最大行数 64K。

作为一种跳过索引，全文索引可以在创建表之后删除或添加到列中：

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(tokenizer = 'default');
```

要使用该索引，无需特殊函数或语法。典型的字符串搜索谓词会自动利用该索引。例如，可以考虑以下内容：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

全文索引也适用于类型为 `Array(String)`、`Array(FixedString)`、`Map(String)` 和 `Map(String)` 的列。

与其他二级索引一样，每个列部分都有其自己的全文索引。此外，每个全文索引在内部被划分为“段”。段的存在和大小对用户通常是透明的，但段的大小决定了索引构建期间的内存消耗（例如，当两个部分合并时）。配置参数 "max_digestion_size_per_segment"（默认：256 MB）控制从基础列中读取的数据量，直到创建新的段。增加该参数会提高索引构建过程中的中间内存消耗，但也会提高查找性能，因为在计算查询时平均需要检查的段数更少。

## Hacker News 数据集的全文搜索 {#full-text-search-of-the-hacker-news-dataset}

让我们看看大型数据集上全文索引的性能改进，这些数据集包含大量文本。我们将使用来自受欢迎的 Hacker News 网站的 2870 万行评论。以下是没有全文索引的表：

```sql
CREATE TABLE hackernews (
    id UInt64,
    deleted UInt8,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    children Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);
```

2870 万行评论位于 S3 的 Parquet 文件中——让我们将它们插入到 `hackernews` 表中：

```sql
INSERT INTO hackernews
    SELECT * FROM s3Cluster(
        'default',
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        '
    id UInt64,
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

考虑在 `comment` 列中搜索术语 `ClickHouse`（及其各种大小写）的简单搜索：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意，执行此查询需要 3 秒：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

我们将使用 `ALTER TABLE` 并在 `comment` 列的小写形式上添加全文索引，然后对其进行物化（这可能需要一段时间——请耐心等待）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE gin;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

我们运行相同的查询...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...并注意查询执行速度快了 4 倍：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

我们还可以搜索多个术语中的一个或全部术语，即，析取或合取：

```sql
-- multiple OR'ed terms
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- multiple AND'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
与其他二级索引不同，全文索引（目前）映射到行号（行 ID）而不是粒度 ID。此设计的原因是性能。在实践中，用户通常会同时搜索多个术语。例如，过滤谓词 `WHERE s LIKE '%little%' OR s LIKE '%big%'` 可以通过形成术语“little”和“big”的行 ID 列表的并集，使用全文索引直接进行评估。这也意味着提供给索引创建的参数 `GRANULARITY` 没有意义（未来可能会从语法中移除）。
:::

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中介绍反向索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
