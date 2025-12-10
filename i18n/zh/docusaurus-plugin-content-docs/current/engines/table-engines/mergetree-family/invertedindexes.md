---
description: '快速在文本中查找搜索词。'
keywords: ['全文搜索', '文本索引', '索引', '索引']
sidebar_label: '使用文本索引实现全文搜索'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: '使用文本索引实现全文搜索'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 使用文本索引进行全文搜索 {#full-text-search-using-text-indexes}

<PrivatePreviewBadge/>

ClickHouse 中的文本索引（也称为 ["倒排索引"](https://en.wikipedia.org/wiki/Inverted_index)）为字符串数据提供快速的全文检索能力。
索引会将列中的每个标记（token）映射到包含该标记的行。
这些标记由称为分词（tokenization）的过程生成。
例如，ClickHouse 默认会将英文句子 "All cat like mice." 分词为 ["All", "cat", "like", "mice"]（注意末尾的句点会被忽略）。
还可以使用更高级的分词器，例如针对日志数据的分词器。

## 创建文本索引 {#creating-a-text-index}

要创建文本索引，首先启用相应的实验性设置：

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在 [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md) 以及 [Map](/sql-reference/data-types/map.md) 列（通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 和 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 映射函数）上定义文本索引：

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**分词器参数（必需）**。`tokenizer` 参数用于指定分词器：

* `splitByNonAlpha` 按非字母数字的 ASCII 字符拆分字符串（另见函数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)）。
* `splitByString(S)` 按用户自定义的分隔字符串 `S` 拆分字符串（另见函数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)）。
  可以通过可选参数指定分隔符，例如：`tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  注意，每个分隔字符串可以由多个字符组成（如示例中的 `', '`）。
  如果未显式指定（例如 `tokenizer = splitByString`），默认的分隔符列表是单个空格 `[' ']`。
* `ngrams(N)` 将字符串拆分为等长的 `N`-gram（另见函数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)）。
  N-gram 的长度可以通过 1 到 8 之间的可选整数参数指定，例如：`tokenizer = ngrams(3)`。
  如果未显式指定（例如 `tokenizer = ngrams`），默认的 N-gram 大小为 3。
* `sparseGrams(min_length, max_length, min_cutoff_length)` 将字符串拆分为长度在 `min_length` 到 `max_length`（含）之间的可变长度 N-gram（另见函数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)）。
  如果未显式指定，`min_length` 和 `max_length` 的默认值分别为 3 和 100。
  如果提供参数 `min_cutoff_length`，则索引中仅存储长度大于等于 `min_cutoff_length` 的 N-gram。
  与 `ngrams(N)` 相比，`sparseGrams` 分词器会生成可变长度的 N-gram，从而对原始文本提供更灵活的表示。
  例如，`tokenizer = sparseGrams(3, 5, 4)` 在内部会从输入字符串生成长度为 3、4、5 的 N-gram，但索引中仅存储长度为 4 和 5 的 N-gram。
* `array` 不执行任何分词，即每一行的取值本身就是一个词元（另见函数 [array](/sql-reference/functions/array-functions.md/#array)）。

:::note
`splitByString` 分词器会按从左到右的顺序应用分隔符。
这可能会产生歧义。
例如，分隔字符串 `['%21', '%']` 会将 `%21abc` 分词为 `['abc']`，而将分隔字符串顺序交换为 `['%', '%21']` 时，会输出 `['21abc']`。
在大多数情况下，应当优先匹配更长的分隔符。
通常可以通过按分隔字符串长度递减的顺序传入来实现这一点。
如果分隔字符串碰巧构成一个[前缀码](https://en.wikipedia.org/wiki/Prefix_code)，则可以以任意顺序传入。
:::


:::warning
目前不建议在非西方语言文本(例如中文)上构建文本索引。
当前支持的分词器可能导致索引体积过大和查询时间过长。
我们计划在未来添加专门的语言特定分词器,以更好地处理这些情况。
:::

要测试分词器如何拆分输入字符串,可以使用 ClickHouse 的 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数:

示例:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

结果:

```result
['abc','bc ','c d',' de','def']
```

**预处理器参数(可选)**。`preprocessor` 参数是在分词之前应用于输入字符串的表达式。

预处理器参数的典型用例包括

1. 转换为小写或大写以实现不区分大小写的匹配，例如 [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)，参见下方的第一个示例。
2. UTF-8 规范化，例如 [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 删除或转换不需要的字符或子字符串,例如 [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

预处理器表达式必须将 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 类型的输入值转换为相同类型的值。

示例:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

此外,预处理器表达式只能引用定义文本索引的列。
不允许使用非确定性函数。

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 和 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 使用预处理器在分词之前首先转换搜索词。

例如,

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, 'Foo');
```

等价于:

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, lower('Foo'));
```

**其他参数(可选)**。ClickHouse 中的文本索引实现为[二级索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)。
但是,与其他跳数索引不同,文本索引的默认索引粒度(GRANULARITY)为 64。
该值是根据经验选择的,对于大多数用例,它在速度和索引大小之间提供了良好的平衡。
高级用户可以指定不同的索引粒度(我们不建议这样做)。

<details markdown="1">
  <summary>可选高级参数</summary>

  以下高级参数的默认值几乎在所有情况下都能很好地工作。
  我们不建议更改它们。

  可选参数 `dictionary_block_size`(默认值:128)指定字典块的行数大小。

  可选参数 `dictionary_block_frontcoding_compression`(默认值:1)指定字典块是否使用前缀编码作为压缩方式。

  可选参数 `max_cardinality_for_embedded_postings`(默认值:16)指定基数阈值,低于该阈值时倒排列表应嵌入到字典块中。

  可选参数 `bloom_filter_false_positive_rate`(默认值:0.1)指定字典 Bloom 过滤器的误报率。
</details>

表创建后，可以在列上添加或删除文本索引：

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## 使用文本索引 {#using-a-text-index}

在 SELECT 查询中使用文本索引非常简单，常见的字符串搜索函数会自动使用该索引。
如果不存在索引，以下这些字符串搜索函数将会回退到较慢的暴力扫描。

### 支持的函数 {#functions-support}

当在 SELECT 查询的 `WHERE` 子句中使用文本函数时，即可使用文本索引：

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` 和 `!=` {#functions-example-equals-notequals}

`=`（[`equals`](/sql-reference/functions/comparison-functions.md/#equals)）和 `!=`（[`notEquals`](/sql-reference/functions/comparison-functions.md/#notEquals)）会匹配整个给定的搜索词。

示例：

```sql
SELECT * from tab WHERE str = 'Hello';
```

文本索引支持 `=` 和 `!=`，但只有在使用 `array` 分词器时，等值和不等值查询才有意义（这会使索引存储整行的值）。


#### `IN` 和 `NOT IN` {#functions-example-in-notin}

`IN`（[in](/sql-reference/functions/in-functions)）和 `NOT IN`（[notIn](/sql-reference/functions/in-functions)）类似于函数 `equals` 和 `notEquals`，但它们分别匹配任一搜索词（`IN`）或不匹配任何搜索词（`NOT IN`）。

示例：

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

适用的限制与 `=` 和 `!=` 相同，也就是说，只有在配合 `array` 分词器使用时，`IN` 和 `NOT IN` 才有意义。


#### `LIKE`、`NOT LIKE` 和 `match` {#functions-example-like-notlike-match}

:::note
这些函数目前仅在索引 tokenizer 为 `splitByNonAlpha` 或 `ngrams` 时才会使用文本索引进行过滤。
:::

要在文本索引中使用 `LIKE`（[like](/sql-reference/functions/string-search-functions.md/#like)）、`NOT LIKE`（[notLike](/sql-reference/functions/string-search-functions.md/#notLike)）以及 [match](/sql-reference/functions/string-search-functions.md/#match) 函数，ClickHouse 必须能够从搜索词中提取完整的 token。

示例：

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

示例中的 `support` 可以匹配 `support`、`supports`、`supporting` 等。
这类查询属于子串查询，无法利用文本索引加速。

要在 LIKE 查询中使用文本索引，必须按如下方式改写 LIKE 模式：

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 两侧的空格可以确保能够将该搜索词提取为一个 token。


#### `startsWith` 和 `endsWith` {#functions-example-startswith-endswith}

与 `LIKE` 类似，[startsWith](/sql-reference/functions/string-functions.md/#startsWith) 和 [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 函数只有在能从搜索词中提取出完整的 token 时，才能使用文本索引。

示例：

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

在这个示例中，只有 `clickhouse` 被视为一个 token。
`support` 不是一个 token，因为它可以匹配 `support`、`supports`、`supporting` 等。

要查找所有以 `clickhouse supports` 开头的行，请在搜索模式的末尾保留一个空格：

```sql
startsWith(comment, 'clickhouse supports ')`
```

同样地，使用 `endsWith` 时也应在前面加上一个空格：

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` 和 `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 和 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 用于匹配单个指定的 token。

与前面提到的函数不同，它们不会对搜索词进行分词（假定输入本身就是单个 token）。

示例：

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

函数 `hasToken` 和 `hasTokenOrNull` 是与 `text` 索引配合使用时代价最低、性能最优的函数。


#### `hasAnyTokens` 和 `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

函数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 和 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 分别用于匹配给定 token 中的任意一个或全部。

这两个函数接受的搜索 token 可以是一个字符串（将使用与索引列相同的 tokenizer 进行分词），也可以是一个已处理好的 token 数组（在搜索前不会再进行分词）。
有关更多信息，请参阅函数文档。

示例：

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` {#functions-example-has}

数组函数 [has](/sql-reference/functions/array-functions#has) 用于判断字符串数组中是否包含某个单个 token。

示例：

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` {#functions-example-mapcontains}

函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)（`mapContainsKey` 的别名）用于判断 map 的键中是否包含某个单独的 token。

示例：

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `operator[]` {#functions-example-access-operator}

可以将访问运算符 [operator[]](/sql-reference/operators#access-operators) 与文本索引配合使用，以过滤键和值。

示例：

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

请参阅以下示例，了解如何配合文本索引使用 `Array(T)` 和 `Map(K, V)` 类型的列。


### 带有文本索引的 `Array` 和 `Map` 列示例 {#text-index-array-and-map-examples}

#### 为 Array(String) 列建立索引 {#text-index-example-array}

想象一个博客平台，作者会使用关键词为他们的博文打标签并进行分类。
我们希望用户能够通过搜索或点击主题来发现相关内容。

考虑如下数据表定义：

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

在没有文本索引的情况下，要查找包含特定关键词（例如 `clickhouse`）的博文，就需要扫描所有记录：

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

随着平台规模扩大，这种查询会变得越来越慢，因为必须检查每一行中的 `keywords` 数组。
为解决这一性能问题，我们为 `keywords` 列定义一个文本索引：

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### 为 Map 列建立索引 {#text-index-example-map}

在许多可观测性场景中，日志消息会被拆分为「组件」，并按合适的数据类型存储，例如时间戳使用 DateTime 类型、日志级别使用 Enum 类型等。
指标字段最好以键值对的形式存储。
运维团队需要高效地搜索日志，以用于调试、安全事件排查和监控。

请看如下日志表：

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

若没有文本索引，搜索 [Map](/sql-reference/data-types/map.md) 数据时需要进行全表扫描：

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

随着日志量增长，这些查询会变慢。

解决方案是为 [Map](/sql-reference/data-types/map.md) 的键和值创建文本索引。
当需要按字段名或属性类型检索日志时，可以使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

当需要在属性值的实际内容中进行搜索时，可以使用 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

查询示例：

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```


## 性能调优 {#performance-tuning}

### 直接读取 {#direct-read}

某些类型的文本查询可以通过一种称为“直接读取”（direct read）的优化显著提速。
更具体地说，当 SELECT 查询中 *没有* 从文本列进行投影时，可以应用此优化。

示例：

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse 中的直接读取（direct read）优化仅使用文本索引（即通过文本索引查找）来回答查询，而无需访问底层文本列。
文本索引查找读取的数据量相对较少，因此比 ClickHouse 中通常的 skip 索引（skip index）要快得多（后者会先进行 skip 索引查找，然后再加载并过滤存活的数据粒度（granule））。

直接读取由两个设置控制：

* 设置 [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index)，用于指定是否启用直接读取。
* 设置 [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read)，这是启用直接读取的另一个前提条件。注意，在 ClickHouse 数据库上如果 [compatibility](../../../operations/settings/settings#compatibility) &lt; 25.10，则 `use_skip_indexes_on_data_read` 被禁用，因此你要么需要提升 `compatibility` 设置的值，要么显式执行 `SET use_skip_indexes_on_data_read = 1`。

此外，要使用直接读取，文本索引必须已完全物化（为此可使用 `ALTER TABLE ... MATERIALIZE INDEX`）。

**支持的函数**
直接读取优化支持函数 `hasToken`、`hasAllTokens` 和 `hasAnyTokens`。
这些函数也可以通过 AND、OR 和 NOT 运算符组合使用。
WHERE 子句还可以包含额外的非文本搜索函数过滤条件（针对文本列或其他列）——在这种情况下，仍会使用直接读取优化，但效果会较差一些（它只应用于受支持的文本搜索函数）。

要判断查询是否使用了直接读取，请使用 `EXPLAIN PLAN actions = 1` 来运行该查询。
例如，一个禁用直接读取的查询如下所示：

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
         use_skip_indexes_on_data_read = 1;
```

返回结果

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

而在将 `query_plan_direct_read_from_text_index` 设置为 `1` 时运行相同的查询

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
         use_skip_indexes_on_data_read = 1;
```

返回值

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

第二个 EXPLAIN PLAN 输出中包含一个虚拟列 `__text_index_<index_name>_<function_name>_<id>`。
如果存在该列，则说明使用了直接读取。


### 缓存 {#caching}

可以使用不同的缓存将文本索引的部分内容缓存在内存中（参见[实现细节](#implementation)部分）：
目前，对文本索引的反序列化字典块、头信息和倒排列表都提供了缓存，以减少 I/O。
可以通过以下设置启用这些缓存：[use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) 和 [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache)。
默认情况下，所有缓存均为禁用状态。

有关配置这些缓存，请参阅以下服务器设置。

#### 字典块缓存设置 {#caching-dictionary}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | 文本索引字典块缓存策略名称。                                                                                   |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | 最大缓存大小（字节）。                                                                                        |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | 缓存中反序列化字典块的最大数量。                                                                               |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | 文本索引字典块缓存中受保护队列大小占缓存总大小的比例。                                                        |

#### Header cache settings {#caching-header}

| Setting                                                                                                                              | Description                                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | 文本索引头部缓存策略名称。                                                                          |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | 最大缓存大小（字节）。                                                                               |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | 缓存中反序列化头部的最大数量。                                                                       |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | 文本索引头部缓存中受保护队列大小占缓存总大小的比例。                                                |

#### Posting lists cache settings {#caching-posting-lists}

| Setting                                                                                                                               | Description                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | 文本索引倒排列表缓存策略名称。                                                                          |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | 最大缓存大小（字节）。                                                                                  |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | 缓存中反序列化倒排列表项的最大数量。                                                                    |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | 文本索引倒排列表缓存中受保护队列大小占缓存总大小的比例。                                               |

## 实现细节 {#implementation}

每个文本索引由两个（抽象）数据结构组成：
- 一个将每个 token 映射到倒排列表（postings list）的字典，和
- 一组倒排列表，每个倒排列表表示一组行号。

由于文本索引是一种跳跃索引（skip index），这些数据结构在逻辑上是按索引粒度（index granule）划分的。

在创建索引时，会创建三个文件（每个 part 一个）：

**字典块文件 (.dct)**

索引粒度中的 token 会被排序，并以每 128 个 token 为一组存储在字典块中（块大小可通过参数 `dictionary_block_size` 配置）。
字典块文件 (.dct) 由某个 part 中所有索引粒度的全部字典块组成。

**索引粒度文件 (.idx)**

索引粒度文件中，对于每个字典块，存储该块的第一个 token、它在字典块文件中的相对偏移量，以及该块中所有 token 的 Bloom 过滤器。
这种稀疏索引结构类似于 ClickHouse 的 [稀疏主键索引](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)。
Bloom 过滤器可以在待查询的 token 不包含在某个字典块中时提前跳过该字典块。

**倒排列表文件 (.pst)**

所有 token 的倒排列表顺序存储在倒排列表文件中。
为了节省空间，同时仍然支持快速的交集与并集操作，倒排列表被存储为 [roaring bitmaps](https://roaringbitmap.org/)。
如果某个倒排列表的基数小于 16（可通过参数 `max_cardinality_for_embedded_postings` 配置），则会将其内嵌到字典中。

## 示例：Hacker News 数据集 {#hacker-news-dataset}

来看一下在包含大量文本的大型数据集上，使用文本索引带来的性能提升。
我们将使用来自热门网站 Hacker News 的 2870 万行评论数据。
下面是未使用文本索引的表：

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

这 2870 万行数据存储在 S3 的一个 Parquet 文件中——让我们将它们插入到 `hackernews` 表中：

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

我们将使用 `ALTER TABLE` 在 comment 列上添加文本索引，然后对其进行物化：

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

现在，让我们使用 `hasToken`、`hasAnyTokens` 和 `hasAllTokens` 函数来运行查询。
下面的示例将展示标准索引扫描与直接读取优化之间巨大的性能差异。


### 1. 使用 `hasToken` {#using-hasToken}

`hasToken` 会检查文本是否包含某个特定的单一 token。
我们将搜索区分大小写的 token &#39;ClickHouse&#39;。

**禁用直接读取（标准扫描）**
默认情况下，ClickHouse 使用跳过索引（skip index）来过滤 granule，然后读取这些 granule 的列数据。
我们可以通过禁用直接读取来模拟这种行为。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**已启用直接读取（快速索引读取）**
现在我们在启用直接读取（默认行为）的情况下运行同一个查询。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```

直接读取的查询速度快了 45 倍以上（0.362s 对比 0.008s），并且仅通过从索引读取就能将处理的数据量大幅减少（9.51 GB 对比 3.15 MB）。


### 2. 使用 `hasAnyTokens` {#using-hasAnyTokens}

`hasAnyTokens` 会检查文本是否包含至少一个给定的 token。
我们将搜索包含 “love” 或 “ClickHouse” 的评论。

**禁用直接读取（标准扫描）**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 1.329 sec. Processed 28.74 million rows, 9.72 GB
```

**已启用直接读取（快速索引读取）**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 0.015 sec. Processed 27.99 million rows, 27.99 MB
```

对于这种常见的 OR 搜索，提速更加显著。
该查询因为避免了对整列的全量扫描，速度快了将近 89 倍（1.329s 对比 0.015s）。


### 3. 使用 `hasAllTokens` {#using-hasAllTokens}

`hasAllTokens` 用于检查文本是否包含所有给定的词元。
我们将搜索同时包含 &#39;love&#39; 和 &#39;ClickHouse&#39; 的评论。

**禁用直接读取(标准扫描)**
即使禁用直接读取,标准跳数索引仍然有效。
它将2870万行过滤至仅14.746万行,但仍需从列中读取57.03 MB数据。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.184 sec. Processed 147.46 thousand rows, 57.03 MB
```

**已启用直接读取（快速索引读取）**
直接读取通过仅在索引数据上操作即可返回查询结果，仅读取 147.46 KB 数据。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.007 sec. Processed 147.46 thousand rows, 147.46 KB
```

对于这个 &quot;AND&quot; 搜索，直接读取优化相比标准的跳数索引扫描快超过 26 倍（0.184 秒 对比 0.007 秒）。


### 4. 复合搜索：OR、AND、NOT，… {#compound-search}

直接读取优化同样适用于复合布尔表达式。
在这里，我们将执行一次不区分大小写的搜索：&#39;ClickHouse&#39; OR &#39;clickhouse&#39;。

**已禁用直接读取（标准扫描）**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.450 sec. Processed 25.87 million rows, 9.58 GB
```

**已启用直接读取（快速索引读取）**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.013 sec. Processed 25.87 million rows, 51.73 MB
```

通过结合索引查询结果，直接读取的查询速度快了 34 倍（0.450s 对比 0.013s），并且避免读取 9.58 GB 的列数据。
在这个特定场景下，`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` 是首选且更高效的写法。


## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中引入倒排索引](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 博客：[ClickHouse 全文搜索内部解析：快速、原生、列式](https://clickhouse.com/blog/clickhouse-full-text-search)
- 视频：[全文索引：设计与实验](https://www.youtube.com/watch?v=O_MnyUkrIq8)