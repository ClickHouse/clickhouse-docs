---
'description': '快速在文本中找到搜索词。'
'keywords':
- 'full-text search'
- 'text index'
- 'index'
- 'indices'
'sidebar_label': '使用文本索引的全文搜索'
'slug': '/engines/table-engines/mergetree-family/invertedindexes'
'title': '使用文本索引的全文搜索'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 使用文本索引的全文搜索

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

ClickHouse中的文本索引（也称为 ["倒排索引"](https://en.wikipedia.org/wiki/Inverted_index)）为字符串数据提供了快速的全文搜索能力。
该索引将列中的每个标记映射到包含该标记的行。
标记是通过一种称为标记化的过程生成的。
例如，ClickHouse默认将英语句子 "All cat like mice." 标记化为 ["All", "cat", "like", "mice"]（请注意，尾随的句点被忽略）。
可用更高级的标记器，例如用于日志数据的标记器。

## 创建文本索引 {#creating-a-text-index}

要创建文本索引，首先启用相应的实验设置：

```sql
SET allow_experimental_full_text_index = true;
```

文本索引可以在 [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md) 和 [Map](/sql-reference/data-types/map.md) 列上定义（通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 和 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 映射函数），使用以下语法：

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha|splitByString(S)|ngrams(N)|array
                                -- Optional parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

`tokenizer` 参数指定标记器：

- `splitByNonAlpha` 沿非字母数字ASCII字符拆分字符串（另请参见函数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitbynonalpha)）。
- `splitByString(S)` 沿某些用户定义的分隔符字符串 `S` 拆分字符串（另请参见函数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitbystring)）。
  分隔符可以通过可选参数指定，例如，`tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  请注意，每个字符串可以包含多个字符（例如示例中的 `', '`）。
  如果没有明确指定默认分隔符列表（例如，`tokenizer = splitByString`），则为单个空格 `[' ']`。
- `ngrams(N)` 将字符串拆分为大小相等的 `N`-grams（另请参见函数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)）。
  ngram长度可以使用可选整数参数指定，范围在2到8之间，例如，`tokenizer = ngrams(3)`。
  如果没有明确指定默认ngram大小（例如，`tokenizer = ngrams`），则为3。
- `array` 不执行任何标记化，即每个行值是一个标记（另请参见函数 [array](/sql-reference/functions/array-functions.md/#array)）。

:::note
`splitByString` 标记器按从左到右的顺序应用拆分分隔符。
这可能会导致歧义。
例如，分隔符字符串 `['%21', '%']` 将导致 `%21abc` 被标记为 `['abc']`，而交换这两个分隔符字符串 `['%', '%21']` 将输出 `['21abc']`。
在大多数情况下，您希望匹配更长的分隔符优先。
这通常可以通过以递减长度的顺序传递分隔符字符串来实现。
如果分隔符字符串恰好形成 [前缀码](https://en.wikipedia.org/wiki/Prefix_code)，则可以以任意顺序传递。
:::

要测试标记器如何拆分输入字符串，可以使用ClickHouse的 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数：

作为示例，

```sql
SELECT tokens('abc def', 'ngrams', 3) AS tokens;
```

返回

```result
+-tokens--------------------------+
| ['abc','bc ','c d',' de','def'] |
+---------------------------------+
```

ClickHouse中的文本索引作为 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types) 实现。
然而，与其他跳过索引不同，文本索引的默认索引 GRANULARITY 为64。
这个值是经验性选择的，对于大多数用例，它在速度和索引大小之间提供了良好的折衷。
高级用户可以指定不同的索引粒度（我们不推荐这样做）。

<details markdown="1">

<summary>高级参数</summary>

以下高级参数的默认值在几乎所有情况下都能良好工作。
我们不建议更改它们。

可选参数 `dictionary_block_size`（默认值：128）指定字典块的行数。

可选参数 `dictionary_block_frontcoding_compression`（默认值：1）指定字典块是否使用前缀编码作为压缩。

可选参数 `max_cardinality_for_embedded_postings`（默认值：16）指定应该嵌入到字典块中的发布列表的基数阈值。

可选参数 `bloom_filter_false_positive_rate`（默认值：0.1）指定字典布隆过滤器的假阳性率。
</details>

文本索引可以在创建表后向列中添加或移除：

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```

## 使用文本索引 {#using-a-text-index}

在SELECT查询中使用文本索引非常简单，因为常见的字符串搜索函数会自动利用索引。
如果不存在索引，以下字符串搜索函数将回退到缓慢的暴力扫描。

### 支持的函数 {#functions-support}

如果在SELECT查询的 `WHERE` 子句中使用文本函数，则可以使用文本索引：

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` 和 `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) 和 `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) 匹配整个给定的搜索词。

示例：

```sql
SELECT * from tab WHERE str = 'Hello';
```

文本索引支持 `=` 和 `!=`，但相等和不等搜索仅与 `array` 标记器有意义（这导致索引存储整个行值）。

#### `IN` 和 `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) 和 `NOT IN` ([notIn](/sql-reference/functions/in-functions)) 类似于函数 `equals` 和 `notEquals`，但它们匹配所有（`IN`）或都不匹配（`NOT IN`）搜索词。

示例：

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

与 `=` 和 `!=` 的限制相同，即 `IN` 和 `NOT IN` 仅与 `array` 标记器结合使用才有意义。

#### `LIKE`、`NOT LIKE` 和 `match` {#functions-example-like-notlike-match}

:::note
这些函数目前仅在索引标记器为 `splitByNonAlpha` 或 `ngrams` 时使用文本索引进行过滤。
:::

为了使用 `LIKE` [like](/sql-reference/functions/string-search-functions.md/#like)、`NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notlike)) 和 [match](/sql-reference/functions/string-search-functions.md/#match) 函数与文本索引，ClickHouse必须能够从搜索词中提取完整的标记。

示例：

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

示例中的 `support` 可以匹配 `support`、`supports`、`supporting` 等等。
这种查询是子字符串查询，文本索引无法加速。

为了利用文本索引进行LIKE查询，LIKE模式必须以以下方式重写：

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 左右的空格确保该术语可以被提取为标记。

#### `startsWith` 和 `endsWith` {#functions-example-startswith-endswith}

类似于 `LIKE`，函数 [startsWith](/sql-reference/functions/string-functions.md/#startswith) 和 [endsWith](/sql-reference/functions/string-functions.md/#endswith) 仅在能够从搜索词中提取完整标记时才能使用文本索引。

示例：

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

在此示例中，仅 `clickhouse` 被视为标记。
`support` 不是标记，因为它可以匹配 `support`、`supports`、`supporting` 等。

要查找以 `clickhouse supports` 开头的所有行，请确保在搜索模式后面加一个尾随空格：

```sql
startsWith(comment, 'clickhouse supports ')`
```

同样，`endsWith` 应该在前面加一个空格使用：

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` 和 `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken) 和 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull) 匹配单个给定标记。

与先前提到的函数不同，它们不对搜索词进行标记化（它们假设输入是单个标记）。

示例：

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

函数 `hasToken` 和 `hasTokenOrNull` 是与 `text` 索引配合使用的性能最好的函数。

#### `hasAnyTokens` 和 `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

函数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens) 和 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens) 匹配给定标记中的一个或多个。

与 `hasToken` 一样，搜索词不会经过标记化。

示例：

```sql
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);

SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

数组函数 [has](/sql-reference/functions/array-functions#has) 在字符串数组中匹配单个标记。

示例：

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)(别名为: `mapContainsKey`) 在映射的键中与单个标记匹配。

示例：

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

可以使用访问 [operator[]](/sql-reference/operators#access-operators) 和文本索引过滤键和值。

示例：

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse'; -- will use the text index if defined
```

查看以下示例以了解 `Array(T)` 和 `Map(K, V)` 与文本索引的使用。

### 文本索引 `Array` 和 `Map` 支持的示例。 {#text-index-array-and-map-examples}

#### 为 Array(String) 建立索引 {#text-indexi-example-array}

在一个简单的博客平台上，作者为他们的文章分配关键词以对内容进行分类。
一个常见的功能允许用户通过点击关键词或搜索主题来发现相关内容。

考虑以下表定义：

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String) COMMENT 'Author-defined keywords'
)
ENGINE = MergeTree
ORDER BY (post_id);
```

没有文本索引，要找到具有特定关键词（例如 `clickhouse`）的帖子需要扫描所有条目：

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

随着平台的发展，这项工作变得越来越缓慢，因为查询必须检查每一行中的每个关键词数组。

为了解决这个性能问题，我们可以为 `keywords` 定义一个文本索引，这样它可以创建一个搜索优化结构，预处理所有关键词，从而实现即时查找：

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
```

:::note
重要提示：添加文本索引后，必须为现有数据重建索引：

```sql
ALTER TABLE posts MATERIALIZE INDEX keywords_idx;
```
:::

#### 为 Map 建立索引 {#text-index-example-map}

在日志系统中，服务器请求通常以键值对的形式存储元数据。运营团队需要高效地搜索日志进行调试、安全事件和监控。

考虑以下日志表：

```sql
CREATE TABLE logs (
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

没有文本索引，搜索 [Map](/sql-reference/data-types/map.md) 数据需要全表扫描：

1. 查找所有限制速率的日志：

```sql
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan
```

2. 查找来自特定IP的所有日志：

```sql
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

随着日志量的增加，这些查询变得缓慢。

解决方案是为 [Map](/sql-reference/data-types/map.md) 的键和值创建文本索引。

使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 在需要按字段名或属性类型查找日志时创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
```

使用 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 在需要在属性的实际内容中进行搜索时创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
```

:::note
重要提示：添加文本索引后，必须为现有数据重建索引：

```sql
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```
:::

1. 查找所有限制速率的请求：

```sql
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast
```

2. 查找来自特定IP的所有日志：

```sql
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```

## 实现 {#implementation}

### 索引布局 {#index-layout}

每个文本索引由两个（抽象）数据结构组成：
- 一个字典，它将每个标记映射到一个发布列表，以及
- 一组发布列表，每个列表代表一组行号。

由于文本索引是跳过索引，因此这些数据结构在逻辑上存在于每个索引粒度内。

在创建索引时（每个分片），会创建三个文件：

**字典块文件 (.dct)**

索引粒度中的标记按顺序排列并存储在每128个标记的字典块中（块大小可以通过参数 `dictionary_block_size` 配置）。
字典块文件 (.dct) 包含分片中所有索引粒度的所有字典块。

**索引粒度文件 (.idx)**

索引粒度文件为每个字典块包含块的第一个标记、其在字典块文件中的相对偏移量，以及该块中所有标记的布隆过滤器。
这种稀疏索引结构类似于ClickHouse的 [稀疏主键索引](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)。
布隆过滤器允许在搜索的标记不包含在字典块中时，提前跳过字典块。

**发布列表文件 (.pst)**

所有标记的发布列表按顺序排列在发布列表文件中。
为了节省空间，同时允许快速的交集和并集操作，发布列表以 [roaring bitmaps](https://roaringbitmap.org/) 的形式存储。
如果发布列表的基数小于16（可以通过参数 `max_cardinality_for_embedded_postings` 配置），则将其嵌入字典中。

### 直接读取 {#direct-read}

某些类型的文本查询可以通过一种称为 "直接读取" 的优化显著加速。
更具体地说，如果SELECT查询不是从文本列进行投影，则可以应用该优化。

示例：

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse中的直接读取优化仅使用文本索引（即文本索引查找）回答查询，而无需访问底层文本列。
文本索引查找相对读取的数据较少，因此比ClickHouse中常规的跳过索引（先执行跳过索引查找，然后加载和过滤存活的粒度）要快得多。

**支持的函数**
直接读取优化支持函数 `hasToken`、`searchAll` 和 `searchAny`。
这些函数还可以通过AND、OR和NOT运算符组合。
WHERE子句也可以包含额外的非文本搜索函数过滤器（针对文本列或其他列）——在这种情况下，仍将使用直接读取优化，但效果较差（它仅适用于支持的文本搜索函数）。

## 示例：Hackernews 数据集 {#hacker-news-dataset}

让我们看看文本索引在具有大量文本的大型数据集上带来的性能改进。
我们将使用2800万行来自流行的Hacker News网站的评论。以下是没有文本索引的表：

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

这2800万行的数据在S3中的一个Parquet文件中——让我们将它们插入到 `hackernews` 表中：

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

考虑在 `comment` 列中搜索术语 `ClickHouse`（及其各种大小写）：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

注意，执行查询需要3秒：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

我们将使用 `ALTER TABLE` 并在 `comment` 列的小写上添加文本索引，然后将其物化（这可能需要一段时间——等待它物化）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

我们运行相同的查询...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...并注意到查询执行速度提升了4倍：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

我们还可以搜索一个或多个条款，即析取或合取：

```sql
-- multiple OR'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') OR hasToken(lower(comment), 'sve');

-- multiple AND'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

## 相关内容 {#related-content}

- 博客: [在ClickHouse中引入倒排索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 博客: [ClickHouse全文搜索内部: 快速、原生、列式](https://clickhouse.com/blog/clickhouse-full-text-search)
- 视频: [全文索引：设计与实验](https://www.youtube.com/watch?v=O_MnyUkrIq8)
