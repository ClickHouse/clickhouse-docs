---
slug: /engines/table-engines/mergetree-family/invertedindexes
sidebar_label: 全文索引
description: 快速查找文本中的搜索词。
keywords: ['全文搜索', '文本搜索', '索引', '索引']
title: "使用全文索引的全文搜索"
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 使用全文索引的全文搜索

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

全文索引是一种实验性的 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)，为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 列提供快速的文本搜索功能。全文索引的主要思想是存储“术语”到包含这些术语的行的映射。“术语”是字符串列的标记单元。例如，字符串单元“I will be a little late”默认被标记为六个术语“I”、“will”、“be”、“a”、“little”和“late”。另一种标记器是 n-gram。例如，3-gram 标记化的结果将是 21 个术语“I w”、“ wi”、“wil”、“ill”、“ll “、 “l b”、“ be”等。输入字符串被标记的粒度越细，生成的全文索引就越大，但也越有用。

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
全文索引是实验性的，目前不应在生产环境中使用。将来可能会以向后不兼容的方式进行更改，例如在 DDL/DQL 语法或性能/压缩特性方面。
:::

## 使用 {#usage}

要使用全文索引，首先在配置中启用它们：

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在字符串列上定义全文索引：

``` sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE full_text(0) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

:::note
在早期版本的 ClickHouse 中，对应的索引类型名称为 `inverted`。
:::

其中 `N` 指定标记器：

- `full_text(0)`（或更短的 `full_text()`）将标记器设置为“tokens”，即沿着空格拆分字符串，
- `full_text(N)` 其中 `N` 介于 2 和 8 之间将标记器设置为 “ngrams(N)”

每个发布列表的最大行数可以作为第二个参数指定。该参数可用于控制发布列表的大小，以避免生成巨大的发布列表文件。存在以下变体：

- `full_text(ngrams, max_rows_per_postings_list)`：使用给定的 max_rows_per_postings_list（假设不为 0）
- `full_text(ngrams, 0)`：发布列表的最大行数没有限制
- `full_text(ngrams)`：使用默认的最大行数，默认为 64K。

作为一种跳过索引，全文索引可以在创建表后添加或删除到列中：

``` sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

使用索引时，不需要特殊的函数或语法。典型的字符串搜索谓词会自动利用该索引。举例来说，考虑以下示例：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

该全文索引还适用于类型为 `Array(String)`、`Array(FixedString)`、`Map(String)` 和 `Map(String)` 的列。

如同其他二级索引，每个列部分都有其自己的全文索引。此外，每个全文索引在内部分为“段”。段的存在和大小通常对用户是透明的，但段的大小决定了在索引构建期间的内存消耗（例如，当两个部分合并时）。配置参数“max_digestion_size_per_segment”（默认：256 MB）控制在创建新段之前从基础列中读取的消耗数据量。增加该参数提高了索引构建过程中间内存消耗，但也改善了查找性能，因为通常需要检查的段更少，从而评估查询。

## Hacker News 数据集的全文搜索 {#full-text-search-of-the-hacker-news-dataset}

让我们看看在一个包含大量文本的大型数据集上，全文索引的性能提升。我们将使用热门 Hacker News 网站上 2870 万行评论。以下是没有全文索引的表：

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

2870 万行数据位于 S3 的 Parquet 文件中 - 让我们将它们插入到 `hackernews` 表中：

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

考虑在 `comment` 列中寻找术语 `ClickHouse`（及其多种大小写）的简单查询：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意执行该查询需要 3 秒：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

我们将使用 `ALTER TABLE` 并在小写的 `comment` 列上添加一个全文索引，然后使其物化（这可能需要一些时间 - 等待它物化）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE full_text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

我们运行相同的查询……

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

……发现查询执行速度快了 4 倍：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

我们还可以搜索一个或多个术语，即，析取或合取：

```sql
-- 多个 OR 连接的术语
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- 多个 AND 连接的术语
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
与其他二级索引不同，全文索引（目前）映射到行号（行 ID）而不是颗粒 ID。此设计的原因是性能。在实践中，用户经常同时搜索多个术语。例如，筛选谓词 `WHERE s LIKE '%little%' OR s LIKE '%big%'` 可以直接使用全文索引通过形成术语“little”和“big”的行 ID 列的并集来评估。这也意味着提供给索引创建的参数 `GRANULARITY` 没有意义（它可能会在未来从语法中移除）。
:::

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中引入倒排索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
