---
description: '在文本中快速查找搜索词。'
keywords: ['全文检索', '文本索引', '索引', '倒排索引']
sidebar_label: '使用文本索引进行全文检索'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: '使用文本索引进行全文检索'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 使用文本索引进行全文搜索

<PrivatePreviewBadge/>

ClickHouse 中的文本索引（也称为 ["倒排索引"](https://en.wikipedia.org/wiki/Inverted_index)）为字符串数据提供快速的全文搜索能力。
索引会将列中的每个 token 映射到包含该 token 的行。
这些 token 由一个称为分词（tokenization）的过程生成。
例如，ClickHouse 默认会将英文句子 "All cat like mice." 分词为 ["All", "cat", "like", "mice"]（注意末尾的句号会被忽略）。
还可以使用更高级的分词器，例如专门用于日志数据的分词器。



## 创建文本索引 {#creating-a-text-index}

要创建文本索引,首先需要启用相应的实验性设置:

```sql
SET allow_experimental_full_text_index = true;
```

可以使用以下语法在 [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md) 和 [Map](/sql-reference/data-types/map.md)(通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 和 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 映射函数)列上定义文本索引:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- 必需参数:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- 可选参数:
                                [, preprocessor = expression(str)]
                                -- 可选高级参数:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**分词器参数(必需)**。`tokenizer` 参数用于指定分词器:

- `splitByNonAlpha` 按非字母数字 ASCII 字符分割字符串(另请参阅函数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha))。
- `splitByString(S)` 按用户定义的分隔符字符串 `S` 分割字符串(另请参阅函数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString))。
  可以使用可选参数指定分隔符,例如 `tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  请注意,每个字符串可以由多个字符组成(示例中的 `', '`)。
  如果未明确指定(例如 `tokenizer = splitByString`),默认分隔符列表为单个空格 `[' ']`。
- `ngrams(N)` 将字符串分割为等长的 `N`-gram(另请参阅函数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams))。
  可以使用 2 到 8 之间的可选整数参数指定 ngram 长度,例如 `tokenizer = ngrams(3)`。
  如果未明确指定(例如 `tokenizer = ngrams`),默认 ngram 大小为 3。
- `sparseGrams(min_length, max_length, min_cutoff_length)` 将字符串分割为长度至少为 `min_length`、至多为 `max_length`(包含)个字符的可变长度 n-gram(另请参阅函数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams))。
  除非明确指定,否则 `min_length` 和 `max_length` 默认为 3 和 100。
  如果提供了参数 `min_cutoff_length`,则只有长度大于或等于 `min_cutoff_length` 的 n-gram 会存储在索引中。
  与 `ngrams(N)` 相比,`sparseGrams` 分词器生成可变长度的 N-gram,可以更灵活地表示原始文本。
  例如,`tokenizer = sparseGrams(3, 5, 4)` 内部从输入字符串生成 3-gram、4-gram、5-gram,但只有 4-gram 和 5-gram 存储在索引中。
- `array` 不执行分词,即每个行值都是一个词元(另请参阅函数 [array](/sql-reference/functions/array-functions.md/#array))。

:::note
`splitByString` 分词器从左到右应用分隔符。
这可能会产生歧义。
例如,分隔符字符串 `['%21', '%']` 会导致 `%21abc` 被分词为 `['abc']`,而交换两个分隔符字符串 `['%', '%21']` 将输出 `['21abc']`。
在大多数情况下,您希望匹配时优先使用较长的分隔符。
这通常可以通过按长度降序传递分隔符字符串来实现。
如果分隔符字符串恰好形成[前缀码](https://en.wikipedia.org/wiki/Prefix_code),则可以按任意顺序传递。
:::


:::warning
目前不建议在非西方语言文本(例如中文)上构建文本索引。
当前支持的分词器可能会导致索引体积过大和查询时间过长。
我们计划在未来添加专门的语言特定分词器,以更好地处理这些情况。
:::

要测试分词器如何分割输入字符串,可以使用 ClickHouse 的 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数:

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

1. 转换为小写或大写以实现不区分大小写的匹配,例如 [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8),参见下面的第一个示例。
2. UTF-8 规范化,例如 [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 删除或转换不需要的字符或子字符串,例如 [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

预处理器表达式必须将 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 类型的输入值转换为相同类型的值。

示例:

- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

此外,预处理器表达式只能引用定义文本索引的列。
不允许使用非确定性函数。

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 和 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 使用预处理器在分词之前先转换搜索词。

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
该值是根据经验选择的,对于大多数用例来说,它在速度和索引大小之间提供了良好的权衡。
高级用户可以指定不同的索引粒度(我们不建议这样做)。

<details markdown="1">

<summary>可选的高级参数</summary>

以下高级参数的默认值几乎在所有情况下都能很好地工作。
我们不建议更改它们。

可选参数 `dictionary_block_size`(默认值:128)指定字典块的行数大小。

可选参数 `dictionary_block_frontcoding_compression`(默认值:1)指定字典块是否使用前缀编码作为压缩方式。

可选参数 `max_cardinality_for_embedded_postings`(默认值:16)指定基数阈值,低于该阈值时倒排列表应嵌入到字典块中。


可选参数 `bloom_filter_false_positive_rate`(默认值:0.1)用于指定字典布隆过滤器的误报率。

</details>

表创建后,可以对列添加或删除文本索引:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## 使用文本索引 {#using-a-text-index}

在 SELECT 查询中使用文本索引非常简单,常见的字符串搜索函数会自动利用索引。
如果不存在索引,以下字符串搜索函数将回退到缓慢的暴力扫描。

### 支持的函数 {#functions-support}

如果在 SELECT 查询的 `WHERE` 子句中使用了文本函数,则可以使用文本索引:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` 和 `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) 和 `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) 匹配整个给定的搜索词。

示例:

```sql
SELECT * from tab WHERE str = 'Hello';
```

文本索引支持 `=` 和 `!=`,但相等和不相等搜索仅在使用 `array` 分词器时才有意义(它会使索引存储整个行值)。

#### `IN` 和 `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) 和 `NOT IN` ([notIn](/sql-reference/functions/in-functions)) 类似于 `equals` 和 `notEquals` 函数,但它们匹配所有 (`IN`) 或不匹配任何 (`NOT IN`) 搜索词。

示例:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

与 `=` 和 `!=` 相同的限制同样适用,即 `IN` 和 `NOT IN` 仅在与 `array` 分词器结合使用时才有意义。

#### `LIKE`、`NOT LIKE` 和 `match` {#functions-example-like-notlike-match}

:::note
这些函数目前仅在索引分词器为 `splitByNonAlpha` 或 `ngrams` 时才使用文本索引进行过滤。
:::

为了将 `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like))、`NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)) 和 [match](/sql-reference/functions/string-search-functions.md/#match) 函数与文本索引一起使用,ClickHouse 必须能够从搜索词中提取完整的词元。

示例:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

示例中的 `support` 可以匹配 `support`、`supports`、`supporting` 等。
这种查询是子字符串查询,无法通过文本索引加速。

要在 LIKE 查询中利用文本索引,必须按以下方式重写 LIKE 模式:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 左右两侧的空格确保该词可以作为词元提取。

#### `startsWith` 和 `endsWith` {#functions-example-startswith-endswith}

与 `LIKE` 类似,函数 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) 和 [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 只有在可以从搜索词中提取完整词元时才能使用文本索引。

示例:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

在示例中,只有 `clickhouse` 被视为词元。
`support` 不是词元,因为它可以匹配 `support`、`supports`、`supporting` 等。

要查找所有以 `clickhouse supports` 开头的行,请在搜索模式末尾添加一个尾随空格:

```sql
startsWith(comment, 'clickhouse supports ')`
```

同样,`endsWith` 应与前导空格一起使用:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` 和 `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 和 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 匹配单个给定的词元。

与前面提到的函数不同,它们不对搜索词进行分词(它们假设输入是单个词元)。

示例:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

函数 `hasToken` 和 `hasTokenOrNull` 是与 `text` 索引一起使用时性能最高的函数。

#### `hasAnyTokens` and `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}


函数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 和 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 用于匹配给定标记中的一个或全部。

这两个函数接受搜索标记的形式可以是字符串(将使用与索引列相同的分词器进行分词),也可以是已处理标记的数组(搜索前不会进行分词)。
更多信息请参阅函数文档。

示例:

```sql
-- 以字符串参数形式传递搜索标记
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- 以 Array(String) 形式传递搜索标记
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

数组函数 [has](/sql-reference/functions/array-functions#has) 用于匹配字符串数组中的单个标记。

示例:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)(`mapContainsKey` 的别名)用于匹配映射键中的单个标记。

示例:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- 或
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

访问[运算符[]](/sql-reference/operators#access-operators)可以与文本索引配合使用来过滤键和值。

示例:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

以下示例展示了如何将 `Array(T)` 和 `Map(K, V)` 类型的列与文本索引配合使用。

### `Array` 和 `Map` 列使用文本索引的示例 {#text-index-array-and-map-examples}

#### 为 Array(String) 列建立索引 {#text-index-example-array}

假设有一个博客平台,作者使用关键词对博客文章进行分类。
我们希望用户能够通过搜索或点击主题来发现相关内容。

考虑以下表定义:

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

如果没有文本索引,查找包含特定关键词(例如 `clickhouse`)的文章需要扫描所有条目:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- 缓慢的全表扫描 - 检查每篇文章中的每个关键词
```

随着平台的增长,查询速度会越来越慢,因为查询必须检查每一行中的每个关键词数组。
为了解决这个性能问题,我们为 `keywords` 列定义一个文本索引:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- 不要忘记为现有数据重建索引
```

#### 为 Map 列建立索引 {#text-index-example-map}

在许多可观测性场景中,日志消息被拆分为"组件"并存储为相应的数据类型,例如时间戳使用日期时间类型,日志级别使用枚举类型等。
指标字段最好以键值对的形式存储。
运维团队需要高效地搜索日志以进行调试、安全事件处理和监控。

Consider this logs table:

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

如果没有文本索引,搜索 [Map](/sql-reference/data-types/map.md) 数据需要全表扫描:

```sql
-- 查找所有包含速率限制数据的日志:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- 缓慢的全表扫描

-- 查找来自特定 IP 的所有日志:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- 缓慢的全表扫描
```

随着日志量的增长,这些查询会变得越来越慢。

解决方案是为 [Map](/sql-reference/data-types/map.md) 的键和值创建文本索引。
当需要按字段名称或属性类型查找日志时,使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 创建文本索引:


```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

当需要在属性的实际内容中进行搜索时，可使用 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 来创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

示例查询：

```sql
-- 查找所有受速率限制的请求：
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- 查找来自特定 IP 地址的所有日志：
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```


## 性能调优 {#performance-tuning}

### 直接读取 {#direct-read}

某些类型的文本查询可以通过一种称为"直接读取"的优化实现显著加速。
更具体地说,如果 SELECT 查询_不_对文本列进行投影,则可以应用该优化。

示例:

```sql
SELECT column_a, column_b, ... -- 不包括: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse 中的直接读取优化仅使用文本索引(即文本索引查找)来响应查询,而无需访问底层文本列。
文本索引查找读取的数据量相对较少,因此比 ClickHouse 中的常规跳数索引快得多(跳数索引需要先进行索引查找,然后加载和过滤保留的颗粒)。

直接读取由两个设置控制:

- 设置 [query_plan_direct_read_from_text_index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) 用于指定是否总体启用直接读取。
- 设置 [use_skip_indexes_on_data_read](../../../operations/settings/settings#use_skip_indexes_on_data_read) 是直接读取的另一个前提条件。请注意,在 [compatibility](../../../operations/settings/settings#compatibility) < 25.10 的 ClickHouse 数据库上,`use_skip_indexes_on_data_read` 默认是禁用的,因此您需要提高兼容性设置值或显式执行 `SET use_skip_indexes_on_data_read = 1`。

此外,文本索引必须完全物化才能使用直接读取(可使用 `ALTER TABLE ... MATERIALIZE INDEX` 来实现)。

**支持的函数**
直接读取优化支持函数 `hasToken`、`hasAllTokens` 和 `hasAnyTokens`。
这些函数还可以通过 AND、OR 和 NOT 运算符组合使用。
WHERE 子句还可以包含其他非文本搜索函数的过滤器(用于文本列或其他列) - 在这种情况下,直接读取优化仍会被使用,但效果会降低(它仅适用于支持的文本搜索函数)。

要了解查询是否使用了直接读取,请使用 `EXPLAIN PLAN actions = 1` 运行查询。
例如,禁用直接读取的查询

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- 禁用直接读取
         use_skip_indexes_on_data_read = 1;
```

返回

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

而使用 `query_plan_direct_read_from_text_index = 1` 运行的相同查询

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- 启用直接读取
         use_skip_indexes_on_data_read = 1;
```

返回

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

第二个 EXPLAIN PLAN 输出包含一个虚拟列 `__text_index_<index_name>_<function_name>_<id>`。
如果存在此列,则表示使用了直接读取。

### 缓存 {#caching}

可以使用不同的缓存在内存中缓冲文本索引的部分内容(参见[实现细节](#implementation)部分):
目前,有用于反序列化字典块、头部和文本索引倒排列表的缓存,以减少 I/O 操作。
可以通过设置 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) 和 [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache) 来启用它们。
默认情况下,所有缓存都是禁用的。

请参考以下服务器设置来配置缓存。

#### 字典块缓存设置 {#caching-dictionary}


| 设置                                                                                                                                             | 说明                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)           | 文本索引字典块缓存策略名称。                                                                |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)               | 最大缓存大小,以字节为单位。                                                                                  |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries) | 缓存中反序列化字典块的最大数量。                                                    |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)   | 文本索引字典块缓存中受保护队列大小相对于缓存总大小的比例。 |

#### 头部缓存设置 {#caching-header}

| Setting                                                                                                                         | Description                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)           | 文本索引头部缓存策略名称。                                                                |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)               | Maximum cache size in bytes.                                                                        |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries) | 缓存中反序列化头部的最大数量。                                                    |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)   | 文本索引头部缓存中受保护队列大小相对于缓存总大小的比例。 |

#### 倒排列表缓存设置 {#caching-posting-lists}

| Setting                                                                                                                             | Description                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)           | 文本索引倒排列表缓存策略名称。                                                                |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)               | Maximum cache size in bytes.                                                                          |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries) | 缓存中反序列化倒排列表的最大数量。                                                     |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)   | 文本索引倒排列表缓存中受保护队列大小相对于缓存总大小的比例。 |


## 实现细节 {#implementation}

每个文本索引由两个(抽象)数据结构组成:

- 一个将每个词元映射到倒排列表的字典,以及
- 一组倒排列表,每个列表表示一组行号。

由于文本索引是一种跳数索引,这些数据结构在逻辑上按索引粒度存在。

在索引创建期间,会创建三个文件(每个数据部分):

**字典块文件 (.dct)**

索引粒度中的词元经过排序后存储在字典块中,每个块包含 128 个词元(块大小可通过参数 `dictionary_block_size` 配置)。
字典块文件 (.dct) 包含数据部分中所有索引粒度的所有字典块。

**索引粒度文件 (.idx)**

索引粒度文件为每个字典块包含该块的第一个词元、其在字典块文件中的相对偏移量,以及该块中所有词元的布隆过滤器。
这种稀疏索引结构类似于 ClickHouse 的[稀疏主键索引](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)。
布隆过滤器允许在搜索的词元不包含在字典块中时提前跳过该字典块。

**倒排列表文件 (.pst)**

所有词元的倒排列表在倒排列表文件中按顺序排列。
为了节省空间同时仍允许快速的交集和并集操作,倒排列表以 [roaring bitmaps](https://roaringbitmap.org/) 格式存储。
如果倒排列表的基数小于 16(可通过参数 `max_cardinality_for_embedded_postings` 配置),则将其嵌入到字典中。


## 示例：Hacker News 数据集 {#hacker-news-dataset}

下面我们在一个包含大量文本的大型数据集上，考察文本索引带来的性能提升。
我们将使用来自热门网站 Hacker News 的 2870 万行评论数据。
下面是一个尚未创建文本索引的表：

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

这 2870 万行数据保存在 S3 中的一个 Parquet 文件里——我们将其导入到 `hackernews` 表中：

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

我们将使用 `ALTER TABLE` 在 comment 列上添加一个文本索引，然后对其进行物化：

```sql
-- 添加索引
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- 为已有数据物化索引
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

现在，我们使用 `hasToken`、`hasAnyTokens` 和 `hasAllTokens` 函数来执行查询。
下面的示例将展示常规索引扫描与直接读取优化之间显著的性能差异。

### 1. 使用 `hasToken` {#using-hasToken}

`hasToken` 用于检查文本中是否包含某个特定的单个词元（token）。
我们将搜索区分大小写的词元 'ClickHouse'。

**已禁用直接读取（标准扫描）**
默认情况下，ClickHouse 使用跳过索引（skip index）来过滤数据块（granule），然后再读取这些数据块的列数据。
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

**已启用直接读取（快速索引读取）**
现在，我们在启用直接读取（默认设置）的情况下运行同样的查询。

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

直接读取查询的速度快了 45 倍以上（0.362 秒 对比 0.008 秒），并且只通过读取索引即可完成过滤，处理的数据量也大幅减少（9.51 GB 对比 3.15 MB）。

### 2. 使用 `hasAnyTokens` {#using-hasAnyTokens}

`hasAnyTokens` 用于检查文本中是否至少包含给定词元中的一个。
我们将搜索包含 'love' 或 'ClickHouse' 任一词元的评论。

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

**已启用直接读取（快速索引读取）**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

```


返回 1 行。用时：0.015 秒。处理了 2799 万行，27.99 MB

````
对于这种常见的 "OR" 搜索,加速效果更加显著。
通过避免全列扫描,查询速度提升了近 89 倍(1.329 秒 vs 0.015 秒)。

### 3. 使用 `hasAllTokens` {#using-hasAllTokens}

`hasAllTokens` 检查文本是否包含所有给定的词元。
我们将搜索同时包含 'love' 和 'ClickHouse' 的评论。

**禁用直接读取(标准扫描)**
即使禁用直接读取,标准跳数索引仍然有效。
它将 2870 万行过滤到仅 14.746 万行,但仍需从列中读取 57.03 MB。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

返回 1 行。用时：0.184 秒。处理了 14.746 万行,57.03 MB
````

**启用直接读取(快速索引读取)**
直接读取通过操作索引数据来响应查询,仅读取 147.46 KB。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

返回 1 行。用时：0.007 秒。处理了 14.746 万行,147.46 KB
```

对于这种 "AND" 搜索,直接读取优化比标准跳数索引扫描快 26 倍以上(0.184 秒 vs 0.007 秒)。

### 4. 复合搜索:OR、AND、NOT 等 {#compound-search}

直接读取优化也适用于复合布尔表达式。
在这里,我们将执行不区分大小写的搜索,查找 'ClickHouse' 或 'clickhouse'。

**禁用直接读取(标准扫描)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

返回 1 行。用时：0.450 秒。处理了 2587 万行,9.58 GB
```

**启用直接读取(快速索引读取)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

返回 1 行。用时：0.013 秒。处理了 2587 万行,51.73 MB
```

通过组合索引结果,直接读取查询速度提升了 34 倍(0.450 秒 vs 0.013 秒),并避免读取 9.58 GB 的列数据。
对于这种特定情况,`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` 是更推荐、更高效的语法。


## 相关内容 {#related-content}

- 博客：[ClickHouse 倒排索引介绍](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 博客：[深入了解 ClickHouse 全文搜索：快速、原生、列式](https://clickhouse.com/blog/clickhouse-full-text-search)
- 视频：[全文索引：设计与实验](https://www.youtube.com/watch?v=O_MnyUkrIq8)
