---
'description': '快速找到文本中的搜索词。'
'keywords':
- 'full-text search'
- 'text search'
- 'index'
- 'indices'
'sidebar_label': '全词索引'
'slug': '/engines/table-engines/mergetree-family/invertedindexes'
'title': '使用全词索引的全文搜索'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 使用全文搜索和全文索引

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

全文索引是一种实验性的 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)，它为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 列提供快速文本搜索能力。全文索引的主要思想是存储从“术语”到包含这些术语的行的映射。“术语”是字符串列的标记化单元。例如，字符串单元“I will be a little late”默认被标记化为六个术语“I”、“will”、“be”、“a”、“little”和“late”。另一种标记化器是 n-grams。例如，3-gram 标记化的结果将是 21 个术语“I w”、“ wi”、“wil”、“ill”、“ll “、“l b”、“ be”等。输入字符串标记化得越细粒度，生成的全文索引就越大，但也越有用。

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
全文索引是实验性的，尚不应在生产环境中使用。它们在未来可能会以向后不兼容的方式发生改变，例如在其 DDL/DQL 语法或性能/压缩特性方面。
:::

## 用法 {#usage}

要使用全文索引，首先在配置中启用它们：

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在字符串列上定义全文索引：

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

其中 `tokenizer` 指定标记化器：

- `default` 将标记化器设置为“tokens('default')”，即沿非字母数字字符拆分字符串。
- `ngram` 将标记化器设置为“tokens('ngram')”。即将字符串拆分为相等大小的术语。
- `noop` 将标记化器设置为“tokens('noop')”，即每个值本身就是一个术语。

可以通过 `ngram_size` 参数指定 ngram 大小。这个参数是可选的。存在以下变体：

- `ngram_size = N`：其中 `N` 在 2 到 8 之间，将标记化器设置为“tokens('ngram', N)”。
- 如果未指定：使用默认 ngram 大小，默认为 3。

每个发布列表的最大行数可以通过可选的 `max_rows_per_postings_list` 参数指定。该参数可用于控制发布列表的大小，以避免生成庞大的发布列表文件。存在以下变体：

- `max_rows_per_postings_list = 0`：发布列表的最大行数没有限制。
- `max_rows_per_postings_list = M`：其中 `M` 应至少为 8192。
- 如果未指定：使用默认最大行数，默认为 64K。

作为一种跳过索引，全文索引可以在表创建后添加或删除到列：

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(tokenizer = 'default');
```

要使用该索引，不需要特殊的函数或语法。典型的字符串搜索谓词会自动利用该索引。举个例子，考虑以下示例：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

全文索引也适用于类型为 `Array(String)`、`Array(FixedString)`、`Map(String)` 和 `Map(String)` 的列。

与其他二级索引一样，每个列部分都有自己的全文索引。此外，每个全文索引在内部被分为“段”。段的存在和大小对于用户通常是透明的，但段大小决定了在索引构建期间的内存消耗（例如，当两个部分被合并时）。配置参数“max_digestion_size_per_segment”（默认：256 MB）控制在创建新段之前从基础列读取的数据量。增加该参数会提高索引构建的中间内存消耗，但也会提高查找性能，因为在评估查询时需要检查的段数平均会减少。

## Hacker News 数据集的全文搜索 {#full-text-search-of-the-hacker-news-dataset}

让我们看看在具有大量文本的大数据集上，全文索引的性能提升。我们将使用 2870 万行对流行的 Hacker News 网站的评论。以下是没有全文索引的表：

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

2870 万行评论存储在 S3 的 Parquet 文件中 - 让我们将它们插入到 `hackernews` 表中：

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

注意执行此查询需要 3 秒：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

我们将使用 `ALTER TABLE` 并在 `comment` 列的小写版本上添加一个全文索引，然后将其物化（这可能需要一段时间 - 请等待其物化完成）：

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

...并注意查询的执行速度快了 4 倍：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

我们还可以搜索多个术语之一或所有术语，即，析取或合取：

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
与其他二级索引不同，全文索引（目前）映射到行号（行 ID）而不是颗粒 ID。这样设计的原因是性能。在实践中，用户通常会一次搜索多个术语。例如，过滤谓词 `WHERE s LIKE '%little%' OR s LIKE '%big%'` 可以通过形成“little”和“big”两个术语的行 ID 列表的并集，直接使用全文索引进行评估。这也意味着提供给索引创建的参数 `GRANULARITY` 是没有意义的（它可能会在未来的语法中被移除）。
:::

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中引入倒排索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
