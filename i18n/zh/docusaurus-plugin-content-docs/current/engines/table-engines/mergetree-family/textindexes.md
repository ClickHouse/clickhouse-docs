---
description: '在文本中快速查找搜索词。'
keywords: ['全文搜索', '文本索引', '索引', '索引（复数）']
sidebar_label: '使用文本索引进行全文搜索'
slug: /engines/table-engines/mergetree-family/textindexes
title: '使用文本索引进行全文搜索'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 使用文本索引进行全文搜索 \{#full-text-search-using-text-indexes\}

<BetaBadge/>

ClickHouse 中的文本索引（也称为["倒排索引"](https://en.wikipedia.org/wiki/Inverted_index)）为字符串数据提供快速的全文检索能力。
该索引将列中的每个 token（词元）映射到包含该 token 的行。
这些 token（词元）是通过一个称为 tokenization（分词）的过程生成的。
例如，ClickHouse 默认会将英文句子 "All cat like mice." 分词为 ["All", "cat", "like", "mice"]（注意末尾的点号会被忽略）。
还提供了更高级的分词器，例如专用于日志数据的分词器。

## 创建文本索引 \\{#creating-a-text-index\\}

要创建文本索引，首先启用相应的实验性设置：

```sql
SET enable_full_text_index = true;
```

可以使用以下语法在 [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md) 以及 [Map](/sql-reference/data-types/map.md)（通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 和 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) map 函数）列上定义文本索引：

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
                                [, posting_list_block_size = C]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

**`tokenizer` 参数（必选）**。`tokenizer` 参数用于指定分词器：

* `splitByNonAlpha` 按非字母数字的 ASCII 字符切分字符串（参见函数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)）。
* `splitByString(S)` 按用户定义的分隔字符串 `S` 切分字符串（参见函数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)）。
  可以使用可选参数指定分隔符列表，例如 `tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  请注意，每个分隔字符串可以由多个字符组成（例如示例中的 `', '`）。
  如果未显式指定（例如 `tokenizer = splitByString`），默认的分隔符列表为单个空格 `[' ']`。
* `ngrams(N)` 将字符串切分为等长的 `N`-gram（参见函数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)）。
  ngram 的长度可以通过 1 到 8 之间的可选整数参数指定，例如 `tokenizer = ngrams(3)`。
  如果未显式指定（例如 `tokenizer = ngrams`），默认的 ngram 长度为 3。
* `sparseGrams(min_length, max_length, min_cutoff_length)` 将字符串切分为长度在 `min_length` 至 `max_length`（含）之间的可变长度 n-gram（参见函数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)）。
  如果未显式指定，`min_length` 和 `max_length` 的默认值分别为 3 和 100。
  如果提供了参数 `min_cutoff_length`，则只会返回长度大于或等于 `min_cutoff_length` 的 n-gram。
  与 `ngrams(N)` 相比，`sparseGrams` 分词器会生成可变长度的 N-gram，从而可以更灵活地表示原始文本。
  例如，`tokenizer = sparseGrams(3, 5, 4)` 在内部会从输入字符串生成 3、4、5-gram，但只会返回 4-gram 和 5-gram。
* `array` 不执行任何分词操作，即每一行的值本身就是一个 token（参见函数 [array](/sql-reference/functions/array-functions.md/#array)）。

:::note
`splitByString` 分词器按从左到右的顺序应用分隔符。
这可能会产生歧义。
例如，分隔字符串 `['%21', '%']` 会将 `%21abc` 分词为 `['abc']`，而将两个分隔字符串交换为 `['%', '%21']` 则会输出 `['21abc']`。
在大多数情况下，通常希望匹配优先选择更长的分隔符。
通常可以通过按分隔字符串长度的降序传入它们来实现这一点。
如果分隔字符串碰巧构成一个 [前缀码](https://en.wikipedia.org/wiki/Prefix_code)，则可以以任意顺序传入。
:::

:::warning
目前不建议在非西方语言（例如中文）的文本上构建文本索引。
当前支持的分词器可能会导致非常大的索引大小和较长的查询时间。
我们计划在未来添加针对特定语言的专用分词器，以更好地处理这些场景。
:::


要测试分词器如何拆分输入字符串,可以使用 ClickHouse 的 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数:

示例：

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

结果：

```result
['abc','bc ','c d',' de','def']
```

**预处理器参数(可选)**。参数 `preprocessor` 是一个表达式,用于在分词之前对输入字符串进行处理。

预处理器参数的典型使用场景包括

1. 将字符串转换为小写或大写，从而实现不区分大小写的匹配，例如 [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)，参见下面的第一个示例。
2. UTF-8 规范化，例如 [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 移除或转换不需要的字符或子串，例如 [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

预处理器表达式必须将类型为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 的输入值转换为相同类型的值。

示例：

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

此外,预处理器表达式只能引用定义文本索引的列。
不允许使用非确定性函数。

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 和 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 使用预处理器先对搜索词进行转换,然后再进行分词。

例如，

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

等价于：

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

**其他参数(可选)**。ClickHouse 中的文本索引实现为 [二级索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)。
但是，与其他跳数索引不同，文本索引具有无限粒度，即文本索引是针对整个 part 创建的，并且会忽略显式指定的索引粒度。
该值是根据经验选择的，在大多数使用场景中，它在速度和索引大小之间提供了良好的权衡。
高级用户可以指定不同的索引粒度（不建议这样做）。

<details markdown="1">

<summary>可选高级参数</summary>

以下高级参数的默认值在几乎所有情况下都能很好地运行。
不建议修改这些参数。

可选参数 `dictionary_block_size`（默认值：512）指定字典块的大小，以行数计。

可选参数 `dictionary_block_frontcoding_compression`（默认值：1）指定字典块是否使用 front coding 作为压缩方式。

可选参数 `posting_list_block_size`（默认值：1048576）指定 posting 列表块的大小，以行数计。

</details>

在创建表之后，可以向列中添加或从列中移除文本索引：

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## 使用文本索引 \\{#using-a-text-index\\}

在 SELECT 查询中使用文本索引很简单，因为常见的字符串搜索函数会自动利用该索引。
如果不存在索引，下面这些字符串搜索函数将回退为较慢的暴力扫描。

### 支持的函数 \\{#functions-support\\}

如果在 `WHERE` 或 `PREWHERE` 子句中使用了文本函数，则可以使用文本索引：

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` 和 `!=` \{#functions-example-equals-notequals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) 和 `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) 会对给定的搜索词进行完全匹配（匹配整个搜索词）。

示例：

```sql
SELECT * from tab WHERE str = 'Hello';
```

文本索引支持 `=` 和 `!=`，但只有在使用 `array` 分词器时，等值和不等值查询才有意义（因为它会让索引存储整行的值）。


#### `IN` 和 `NOT IN` \\{#functions-example-in-notin\\}

`IN`（[in](/sql-reference/functions/in-functions)）和 `NOT IN`（[notIn](/sql-reference/functions/in-functions)）与函数 `equals` 和 `notEquals` 类似，但它们分别匹配所有（`IN`）或不匹配任何（`NOT IN`）搜索词。

示例：

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

与 `=` 和 `!=` 相同的限制也适用，也就是说，只有在配合 `array` 分词器使用时，`IN` 和 `NOT IN` 才有意义。


#### `LIKE`、`NOT LIKE` 和 `match` \\{#functions-example-like-notlike-match\\}

:::note
目前只有当索引 tokenizer 为 `splitByNonAlpha`、`ngrams` 或 `sparseGrams` 时，这些函数才会使用文本索引进行过滤。
:::

要在文本索引中使用 `LIKE`（[like](/sql-reference/functions/string-search-functions.md/#like)）、`NOT LIKE`（[notLike](/sql-reference/functions/string-search-functions.md/#notLike)）以及 [match](/sql-reference/functions/string-search-functions.md/#match) 函数，ClickHouse 必须能够从搜索词中提取完整的 token（词元）。
对于使用 `ngrams` tokenizer 的索引，如果在通配符之间的待搜索字符串长度大于或等于 ngram 的长度，则可以满足这一条件。

使用 `splitByNonAlpha` tokenizer 的文本索引示例：

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

示例中的 `support` 可以匹配 `support`、`supports`、`supporting` 等。
这类查询属于子串查询，无法通过文本索引加速。

要在 LIKE 查询中利用文本索引，必须按如下方式改写 LIKE 模式：

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 两侧的空格可以确保该术语能够被单独提取为一个 token。


#### `startsWith` 和 `endsWith` \\{#functions-example-startswith-endswith\\}

与 `LIKE` 类似，当且仅当可以从搜索词中提取出完整的 token 时，函数 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) 和 [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 才能使用文本索引。
对于使用 `ngrams` 分词器的索引，如果通配符之间被搜索的字符串长度大于或等于 ngram 长度，则满足上述条件。

使用 `splitByNonAlpha` 分词器的文本索引示例：

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

在本示例中，只有 `clickhouse` 被视为一个 token。
`support` 不是 token，因为它可以匹配 `support`、`supports`、`supporting` 等。

要查找所有以 `clickhouse supports` 开头的行，请在搜索模式末尾加上一个空格字符：

```sql
startsWith(comment, 'clickhouse supports ')`
```

类似地，`endsWith` 也应与前置空格一起使用：

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` 和 `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 和 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 用于匹配给定的单个 token。

与前面提到的函数不同，它们不会对搜索词进行分词（假定输入本身就是一个 token）。

示例：

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

函数 `hasToken` 和 `hasTokenOrNull` 是在配合 `text` 索引使用时性能最优的函数。


#### `hasAnyTokens` 和 `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

[hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 和 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 函数会匹配给定 token 集合中的任意一个或全部。

这两个函数接收的搜索 token 可以是字符串（将使用与索引列相同的 tokenizer 进行分词），也可以是已处理好的 token 数组（搜索前不会再对其进行分词）。
更多信息请参阅函数文档。

示例：

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

数组函数 [has](/sql-reference/functions/array-functions#has) 会对字符串数组中的单个 token 进行匹配。

示例：

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` \\{#functions-example-mapcontains\\}

函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)（是 `mapContainsKey` 的别名）用于将从待搜索字符串中提取出的词元与 map 的键进行匹配。
其行为类似于在 `String` 列上使用 `equals` 函数。
只有在基于 `mapKeys(map)` 表达式创建了文本索引时，才会使用文本索引。

示例：

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \\{#functions-example-mapcontainsvalue\\}

函数 [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapcontainsvalue) 会将从被搜索字符串中提取出的 token 与 `map` 的值进行匹配。
其行为类似于在 `String` 列上使用 `equals` 函数。
只有在针对 `mapValues(map)` 表达式创建了文本索引时，才会使用文本索引。

示例：

```sql
SELECT count() FROM tab WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` 和 `mapContainsValueLike` \{#functions-example-mapcontainslike\}

函数 [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) 和 [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) 会针对 map 的所有键或所有值（分别）进行模式匹配。

示例：

```sql
SELECT count() FROM tab WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM tab WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \\{#functions-example-access-operator\\}

[operator[]](/sql-reference/operators#access-operators) 访问运算符可以与文本索引配合使用，以过滤键和值。只有当文本索引建立在 `mapKeys(map)` 或 `mapValues(map)` 表达式之上，或同时建立在两者之上时，文本索引才会生效。

示例：

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

以下示例演示如何在文本索引中使用 `Array(T)` 和 `Map(K, V)` 类型的列。


### 带有文本索引的 `Array` 和 `Map` 列示例 \\{#text-index-array-and-map-examples\\}

#### 为 Array(String) 列建立索引 \\{#text-index-example-array\\}

设想一个博客平台，作者使用关键词为博客文章进行分类。
我们希望用户可以通过搜索或点击这些主题来发现相关内容。

考虑下面的表定义：

```sql
CREATE TABLE posts
(
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

如果没有文本索引，要查找包含特定关键字（例如 `clickhouse`）的帖子，就必须扫描所有记录：

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

随着平台规模的扩大，这会变得越来越慢，因为查询必须扫描每一行中的 `keywords` 数组。
为了解决这一性能问题，我们为 `keywords` 列建立一个文本索引：

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### 为 Map 类型列建立索引 \\{#text-index-example-map\\}

在许多可观测性用例中，日志消息会被拆分为「组件」，并以合适的数据类型存储，例如时间戳使用 DateTime 类型，日志级别使用 Enum 类型等。
指标字段最好以键值对的形式存储。
运维团队需要能够高效地搜索日志，用于调试、安全事件分析和监控。

考虑下面这个 `logs` 表：

```sql
CREATE TABLE logs
(
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

如果没有文本索引，搜索 [Map](/sql-reference/data-types/map.md) 数据时就必须进行全表扫描：

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

随着日志量增加，这些查询会变慢。

可以通过为 [Map](/sql-reference/data-types/map.md) 的键和值创建文本索引来解决。
当需要按字段名或属性类型查找日志时，可使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 来创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

当需要在属性值的实际内容中进行搜索时，可以使用 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) 来创建文本索引：

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

-- Finds all logs where any attribute includes an error:
SELECT * FROM logs WHERE mapContainsValueLike(attributes, '% error %'); -- fast
```


## 性能优化 \\{#performance-tuning\\}

### 直接读取 \\{#direct-read\\}

某些类型的文本查询可以通过一种称为“直接读取”的优化显著提速。

示例：

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse 中的直接读取优化仅使用文本索引（即基于文本索引的查找）来响应查询，而不访问底层的文本列。
文本索引查找读取的数据量相对较少，因此通常比 ClickHouse 中常见的 skip 索引（跳过索引）要快得多（后者会先进行一次 skip 索引查找，然后再加载并过滤剩余的 granule（粒度块））。

直接读取由两个设置控制：

* 设置 [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) 指定是否启用直接读取。
* 设置 [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read) 是启用直接读取的另一项前提条件。注意，在 ClickHouse 数据库中，如果 [compatibility](../../../operations/settings/settings#compatibility) 小于 25.10，则 `use_skip_indexes_on_data_read` 被禁用，因此你要么需要提高 compatibility 设置的值，要么需要显式执行 `SET use_skip_indexes_on_data_read = 1`。

此外，文本索引必须已完全物化才能使用直接读取（为此请使用 `ALTER TABLE ... MATERIALIZE INDEX`）。

**支持的函数**

直接读取优化支持函数 `hasToken`、`hasAllTokens` 和 `hasAnyTokens`。
如果文本索引是使用 `array` tokenizer 创建的，则直接读取同样支持函数 `equals`、`has`、`mapContainsKey` 和 `mapContainsValue`。
这些函数也可以通过 `AND`、`OR` 和 `NOT` 运算符进行组合。
`WHERE` 或 `PREWHERE` 子句还可以包含额外的非文本搜索函数过滤条件（针对文本列或其他列）——在这种情况下，仍然会使用直接读取优化，但效果会弱一些（它只作用于受支持的文本搜索函数）。

要判断查询是否使用了直接读取，请使用 `EXPLAIN PLAN actions = 1` 来运行查询。
例如，在禁用直接读取的情况下，一个查询可能是这样的：

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

而当以 `query_plan_direct_read_from_text_index = 1` 运行相同的查询时

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

EXPLAIN PLAN 的第二个输出包含一个虚拟列 `__text_index_<index_name>_<function_name>_<id>`。
如果该列存在，则使用直接读取。

如果 WHERE 子句中的过滤条件仅包含文本搜索函数，查询可以完全避免读取该文本列的数据，此时直接读取带来的性能收益最大。
但是，即使在查询的其他位置也访问了文本列并且必须读取它，直接读取仍然会带来性能提升。

**作为提示的直接读取**

作为提示的直接读取遵循与普通直接读取相同的原理，但它是在不移除底层文本列的情况下，基于文本索引数据额外构建并添加一个过滤条件。
当仅从文本索引读取会产生误报时，会在这些函数中使用该机制。

支持的函数包括：`like`、`startsWith`、`endsWith`、`equals`、`has`、`mapContainsKey` 和 `mapContainsValue`。

这个额外的过滤条件可以在结合其他过滤条件时提供更多的选择性，进一步缩小结果集，从而帮助减少从其他列读取的数据量。


是否使用直接读取作为提示由设置 [query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) 控制（默认启用）。

未带提示的查询示例：

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 0
FORMAT TSV
```

返回结果

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

而在将 `query_plan_text_index_add_hint` 设为 1 后运行同一条查询时

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE col LIKE '%some-token%'
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 1
```

返回

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

在第二个 `EXPLAIN PLAN` 输出中，可以看到在过滤条件中新增了一个合取条件（`__text_index_...`）。得益于 [PREWHERE](docs/sql-reference/statements/select/prewhere) 优化，过滤条件被拆分为三个独立的合取条件，并按照计算复杂度从低到高的顺序依次应用。对于此查询，应用顺序是先 `__text_index_...`，然后是 `greaterOrEquals(...)`，最后是 `like(...)`。这种顺序使得在读取 `WHERE` 子句之后查询中所用到的那些开销较大的列之前，相比只依赖文本索引和原始过滤条件所能跳过的粒度，可以额外跳过更多数据粒度，从而进一步减少需要读取的数据量。


### 缓存 \\{#caching\\}

可以使用不同的缓存将文本索引的部分内容缓存在内存中（参见[实现细节](#implementation)一节）：
当前提供针对文本索引的反序列化字典块、头部和倒排列表的缓存，以减少 I/O。
可以通过设置 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) 和 [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache) 来启用这些缓存。
默认情况下，所有缓存均处于禁用状态。
若要清除这些缓存，请使用语句 [SYSTEM DROP TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches)。

请参考以下服务器设置来配置这些缓存。

#### 字典块缓存设置 \\{#caching-dictionary\\}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | 文本索引字典块缓存策略名称。                                                                                   |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | 缓存的最大大小（字节）。                                                                                       |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | 缓存中已反序列化字典块的最大数量。                                                                             |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | 文本索引字典块缓存中受保护队列大小相对于缓存总大小的比例。                                                     |

#### Header 缓存设置 \\{#caching-header\\}

| Setting                                                                                                                              | 描述                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | 文本索引 header 缓存策略名称。                                                                         |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | 最大缓存大小（字节）。                                                                                 |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | 缓存中已反序列化 header 的最大数量。                                                                   |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | 文本索引 header 缓存中受保护队列的大小占缓存总大小的比例。                                             |

#### 倒排列表缓存设置 \\{#caching-posting-lists\\}

| Setting                                                                                                                               | 描述                                                                                                    |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | 文本索引倒排列表缓存策略名称。                                                                         |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | 最大缓存大小（字节）。                                                                                  |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | 缓存中反序列化倒排项的最大数量。                                                                       |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | 文本索引倒排列表缓存中受保护队列占缓存总大小的比例。                                                   |

## 实现细节 \\{#implementation\\}

每个文本索引由两个（抽象的）数据结构组成：

- 一个字典，用于将每个 token 映射到一个倒排列表（postings list），以及
- 一组倒排列表，每个倒排列表表示一组行号。

文本索引是为整个分区片段构建的。
与其他跳过索引不同，文本索引在数据分区片段合并时可以通过合并的方式更新，而不需要在合并数据分区片段时重新构建（见下文）。

在创建索引期间，会为每个分区片段创建三个文件：

**字典块文件 (.dct)**

文本索引中的 token 会被排序，并按每 512 个 token 分组成字典块（块大小可通过参数 `dictionary_block_size` 配置）。
字典块文件 (.dct) 由该分区片段中所有索引粒度的字典块组成。

**索引头文件 (.idx)**

索引头文件对每个字典块存储该块的第一个 token 以及它在字典块文件中的相对偏移量。

这种稀疏索引结构类似于 ClickHouse 的 [稀疏主键索引](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)。

**倒排列表文件 (.pst)**

所有 token 的倒排列表在倒排列表文件中顺序存放。
为了节省空间，同时仍然支持快速的交集与并集运算，倒排列表以 [roaring bitmaps](https://roaringbitmap.org/) 的形式存储。
如果倒排列表的大小超过 `posting_list_block_size`，则会被拆分为多个块，并在倒排列表文件中顺序存储。

**文本索引的合并**

当数据分区片段被合并时，文本索引不需要从头重建，而是可以在合并过程的单独步骤中高效合并。
在此步骤中，会读取并合并每个输入分区片段中文本索引的已排序字典，生成新的统一字典。
倒排列表中的行号也会被重新计算，以反映它们在合并后数据分区片段中的新位置，这通过在初始合并阶段创建的旧行号到新行号的映射来完成。
这种合并文本索引的方法类似于带有 `_part_offset` 列的 [projections](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) 的合并方式。
如果源分区片段中索引尚未物化，则会先构建该索引，写入临时文件，然后与来自其他分区片段和其他临时索引文件的索引一起进行合并。

## 示例：Hacker News 数据集 \{#hacker-news-dataset\}

我们来看一下在包含大量文本的大型数据集上使用文本索引所带来的性能提升情况。
我们将使用来自知名网站 Hacker News 的 2870 万条评论数据。
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

这 2870 万行数据存放在 S3 中的一个 Parquet 文件里——让我们将它们插入到 `hackernews` 表中：

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

我们将使用 `ALTER TABLE` 在 comment 列上添加一个文本索引，并将其物化：

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

现在，让我们使用 `hasToken`、`hasAnyTokens` 和 `hasAllTokens` 函数来执行查询。
下面的示例将演示标准索引扫描与直接读取优化之间显著的性能差异。


### 1. 使用 `hasToken` \{#using-hasToken\}

`hasToken` 用于检查文本是否包含指定的单个 token。
我们将搜索区分大小写的 token &#39;ClickHouse&#39;。

**禁用直接读取（标准扫描）**
默认情况下，ClickHouse 使用跳过索引来过滤数据粒度，然后再读取这些粒度的列数据。
我们可以通过禁用直接读取来模拟这一行为。

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

**启用直接读取（快速索引读取）**
现在在启用了直接读取（默认设置）的情况下运行相同的查询。

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

直接读取查询的速度快了 45 倍以上（0.362s 对比 0.008s），并且由于只从索引中读取数据，处理的数据量也大幅减少（9.51 GB 对比 3.15 MB）。


### 2. 使用 `hasAnyTokens` \{#using-hasAnyTokens\}

`hasAnyTokens` 用于检查文本是否包含至少一个给定的 token。
我们将搜索包含 “love” 或 “ClickHouse” 的评论。

**已禁用直接读取（标准扫描）**

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

**启用直接读取（快速索引读取）**

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

对于这种常见的「OR」查询，加速效果更加显著。
通过避免对整列进行扫描，该查询几乎快了 89 倍（1.329s 对比 0.015s）。


### 3. 使用 `hasAllTokens` \{#using-hasAllTokens\}

`hasAllTokens` 会检查文本是否包含所有给定的 token（标记）。
我们将搜索同时包含 &#39;love&#39; 和 &#39;ClickHouse&#39; 的评论。

**禁用直接读取（标准扫描）**
即使禁用直接读取，标准跳过索引仍然有效。
它会将 2870 万行过滤至仅 14.746 万行，但仍然需要从该列读取 57.03 MB 的数据。

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
直接读取仅在索引数据上执行即可返回该查询结果，仅读取 147.46 KB 的数据。

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

对于这种 “AND” 组合搜索，直接读取优化比标准跳过索引扫描快了 26 倍以上（0.184s vs 0.007s）。


### 4. 复合搜索：OR、AND、NOT 等 \{#compound-search\}

直接读取优化同样适用于复合布尔表达式。
这里，我们将执行不区分大小写的搜索，匹配 “ClickHouse” 或 “clickhouse”。

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

**直接读取已启用（快速索引读取）**

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

通过结合使用索引返回的结果，直接读取的查询速度提升了 34 倍（0.450s 对比 0.013s），并且避免读取 9.58 GB 的列数据。
在这个特定场景下，`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` 是更推荐且更高效的写法。


## 相关内容 \\{#related-content\\}

- 博客：[Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 博客：[Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- 视频：[Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)