import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 全文搜索使用全文索引

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

全文索引是一种实验性的 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)，为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 列提供快速文本搜索功能。全文索引的主要思想是存储从“术语”到包含这些术语的行的映射。“术语”是字符串列的分词单元。例如，字符串单元“I will be a little late” 默认被分词为六个术语“I”、“will”、“be”、“a”、“little”和“late”。另一种分词器是n-grams。例如，3-gram分词的结果将是21个术语“I w”、“ wi”、“wil”、“ill”、“ll “、“l b”、“ be”等。输入字符串的分词越细粒度，结果的全文索引将越大，但也越有用。

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
全文索引是实验性的，尚不应在生产环境中使用。它们在未来可能会以向后不兼容的方式发生变化，例如在DDL/DQL语法或性能/压缩特性方面。
:::

## 用法 {#usage}

要使用全文索引，首先在配置中启用它们：

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在字符串列上定义一个全文索引

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

其中 `tokenizer` 指定了分词器：

- `default` 将分词器设置为“tokens('default')”，即沿非字母数字字符分割字符串。
- `ngram` 将分词器设置为“tokens('ngram')”，即将字符串分割为相同大小的术语。
- `noop` 将分词器设置为“tokens('noop')”，即每个值本身就是一个术语。

ngram大小可以通过 `ngram_size` 参数指定。此参数为可选参数。存在以下变体：

- `ngram_size = N`：其中 `N` 在 2 和 8 之间，将分词器设置为“tokens('ngram', N)”。
- 如果未指定：使用默认ngram大小，默认为3。

每个发布列表最大行数可以通过可选的 `max_rows_per_postings_list` 指定。此参数可用于控制发布列表大小，以避免生成巨大的发布列表文件。存在以下变体：

- `max_rows_per_postings_list = 0`：不限制每个发布列表的最大行数。
- `max_rows_per_postings_list = M`：其中 `M` 至少应为8192。
- 如果未指定：使用默认的最大行数，默认为64K。

作为一种跳过索引，全文索引可以在表创建后添加或删除到列中：

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(tokenizer = 'default');
```

要使用该索引，无需特殊函数或语法。典型的字符串搜索谓词会自动利用索引。例如，考虑：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

全文索引也适用于类型为 `Array(String)`、`Array(FixedString)`、`Map(String)` 和 `Map(String)` 的列。

与其他二级索引一样，每个列部分都有其自己的全文索引。此外，每个全文索引在内部又分为“段”。段的存在和大小通常对用户是透明的，但段的大小决定了在索引构建过程中（例如，当两个部分合并时）的内存消耗。配置参数“max_digestion_size_per_segment”（默认：256 MB）控制从基础列读取的数据量，在创建新段之前。增加该参数会提高索引构建时的中间内存消耗，但也会改善查找性能，因为平均来看，需要检查的段数更少来评估查询。

## Hacker News 数据集的全文搜索 {#full-text-search-of-the-hacker-news-dataset}

让我们看一下在大型文本数据集上使用全文索引的性能改进。我们将使用2870万行在流行的Hacker News网站上的评论。以下是不带全文索引的表：

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

2870万行位于S3中的一个Parquet文件中 - 让我们将它们插入到 `hackernews` 表中：

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

考虑在 `comment` 列中搜索术语 `ClickHouse`（及其不同的大小写形式）：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意执行查询需要3秒：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

我们将使用 `ALTER TABLE` 并在小写的 `comment` 列上添加一个全文索引，然后对其进行物化（这可能需要一些时间 - 请等待它的物化）：

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

...并注意到查询执行速度提高了4倍：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

我们还可以搜索一个或多个术语，即，析取或合取：

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
与其他二级索引不同，全文索引（目前）映射到行号（行ID），而不是颗粒ID。这种设计的原因是性能。在实践中，用户通常会一次搜索多个术语。例如，过滤谓词 `WHERE s LIKE '%little%' OR s LIKE '%big%'` 可以通过形成“little”和“big”术语的行ID列表的并集，直接使用全文索引进行评估。这也意味着提供给索引创建的参数 `GRANULARITY` 不再有意义（未来可能会从语法中删除）。
:::

## 相关内容 {#related-content}

- 博客：[在ClickHouse中引入倒排索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
