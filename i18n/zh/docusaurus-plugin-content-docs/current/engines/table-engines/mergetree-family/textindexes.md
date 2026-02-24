---
description: '在文本中快速查找搜索词。'
keywords: ['全文搜索', '文本索引', '索引', '索引（复数形式）']
sidebar_label: '使用文本索引的全文搜索'
slug: /engines/table-engines/mergetree-family/textindexes
title: '使用文本索引的全文搜索'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 使用文本索引进行全文搜索 \{#full-text-search-with-text-indexes\}

<BetaBadge />

文本索引（也称为[倒排索引](https://en.wikipedia.org/wiki/Inverted_index)）可以对文本数据进行快速全文搜索。
文本索引存储从词元到包含该词元的行号的映射关系。
词元由称为分词（tokenization）的过程生成。
例如，ClickHouse 的默认分词器会将英文句子 &quot;The cat likes mice.&quot; 转换为词元 [&quot;The&quot;, &quot;cat&quot;, &quot;likes&quot;, &quot;mice&quot;]。

例如，假设有一个只有一列且包含三行的表

```result
1: The cat likes mice.
2: Mice are afraid of dogs.
3: I have two dogs and a cat.
```

相应的词元为：

```result
1: The, cat, likes, mice
2: Mice, are, afraid, of, dogs
3: I, have, two, dogs, and, a, cat
```

我们通常更倾向于进行不区分大小写的搜索，因此会先将这些标记转换为小写：

```result
1: the, cat, likes, mice
2: mice, are, afraid, of, dogs
3: i, have, two, dogs, and, a, cat
```

我们还将移除诸如 &quot;I&quot;、&quot;the&quot; 和 &quot;and&quot; 之类的填充词，因为它们几乎在每一行中都会出现：

```result
1: cat, likes, mice
2: mice, afraid, dogs
3: have, two, dogs, cat
```

从概念上讲，文本索引包含以下信息：

```result
afraid : [2]
cat    : [1, 3]
dogs   : [2, 3]
have   : [3]
likes  : [1]
mice   : [1]
two    : [3]
```

在给定搜索 token 的情况下，该索引结构可以快速定位所有匹配的行。


## 创建文本索引 \{#creating-a-text-index\}

文本索引在 ClickHouse 26.2 及更高版本中已进入 GA（正式发布）阶段。
在这些版本中，无需配置任何特殊设置即可使用文本索引。
我们强烈建议在生产环境场景中使用 ClickHouse 版本 &gt;= 26.2。

:::note
如果您是从低于 26.2 的 ClickHouse 版本升级（或被升级，例如 ClickHouse Cloud），现有的 [兼容性](../../../operations/settings/settings#compatibility) 设置可能仍会导致索引被禁用，和/或使与文本索引相关的性能优化被关闭。

If query

```sql
SELECT value FROM system.settings WHERE name = 'compatibility';
```

返回值

```text
25.4
```

或者如果设置为任何小于 26.2 的值，则需要再配置三个额外的设置才能使用文本索引：

```sql
SET enable_full_text_index = true;
SET query_plan_direct_read_from_text_index = true;
SET use_skip_indexes_on_data_read = true;
```

或者，你也可以将 [compatibility](../../../operations/settings/settings#compatibility) 设置提高到 `26.2` 或更高版本，但这会影响许多设置，并且通常需要事先进行测试。
:::

可以在 [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md) 以及 [Map](/sql-reference/data-types/map.md)（通过 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 和 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) map 函数）列上定义文本索引，语法如下：

```sql
CREATE TABLE table
(
    key UInt64,
    str String,
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
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

或者，可以为现有表添加一个文本索引：

```sql
ALTER TABLE table
    ADD INDEX text_idx(str) TYPE text(
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
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )

```

如果你向已有表添加一个索引，我们建议为该表中已有的分区片段物化该索引（否则，在这些尚未建立索引的分区片段上进行搜索时，将会退回到较慢的穷举扫描）。

```sql
ALTER TABLE table MATERIALIZE INDEX text_idx SETTINGS mutations_sync = 2;
```

要删除文本索引，请运行

```sql
ALTER TABLE table DROP INDEX text_idx;
```

**Tokenizer 参数（必填）**。`tokenizer` 参数指定要使用的分词器：


* `splitByNonAlpha` 会根据非字母数字的 ASCII 字符拆分字符串（参见函数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)）。
* `splitByString(S)` 会根据某些用户自定义的分隔字符串 `S` 拆分字符串（参见函数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)）。
  可以通过可选参数指定分隔符，例如：`tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  请注意，每个分隔字符串可以由多个字符组成（示例中的 `', '`）。
  如果未显式指定（例如 `tokenizer = splitByString`），则默认的分隔符列表为单个空格 `[' ']`。
* `ngrams(N)` 将字符串拆分为长度相同的 `N`-gram（参见函数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)）。
  ngram 的长度可以通过 1 到 8 之间的可选整数参数指定，例如：`tokenizer = ngrams(3)`。
  如果未显式指定（例如 `tokenizer = ngrams`），则默认的 ngram 大小为 3。
* `sparseGrams(min_length, max_length, min_cutoff_length)` 将字符串拆分为长度在 `min_length` 到 `max_length`（含）之间的可变长度 n-gram（参见函数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)）。
  如果未显式指定，`min_length` 和 `max_length` 的默认值分别为 3 和 100。
  如果提供了参数 `min_cutoff_length`，则只返回长度大于或等于 `min_cutoff_length` 的 n-gram。
  与 `ngrams(N)` 相比，`sparseGrams` 分词器会生成可变长度的 N-gram，从而可以更灵活地表示原始文本。
  例如，`tokenizer = sparseGrams(3, 5, 4)` 在内部会从输入字符串生成长度为 3、4、5 的 n-gram，但只返回长度为 4 和 5 的 n-gram。
* `array` 不执行任何分词操作，即每一行的值都是一个 token（参见函数 [array](/sql-reference/functions/array-functions.md/#array)）。

所有可用的 tokenizer 都列在 [system.tokenizers](../../../operations/system-tables/tokenizers.md) 中。

:::note
`splitByString` tokenizer 会从左到右应用分隔符。
这可能会产生歧义。
例如，分隔字符串 `['%21', '%']` 会导致 `%21abc` 被分词为 `['abc']`，而如果交换两个分隔字符串为 `['%', '%21']`，则输出为 `['21abc']`。
在大多数情况下，通常希望匹配时优先选择更长的分隔符。
通常可以通过按分隔字符串的长度降序传递它们来实现。
如果这些分隔字符串碰巧构成一个 [prefix code](https://en.wikipedia.org/wiki/Prefix_code)，则可以以任意顺序传递。
:::

要理解 tokenizer 如何拆分输入字符串，可以使用 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数：

示例：

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

结果：

```result
['abc','bc ','c d',' de','def']
```

*处理非 ASCII 输入。*
虽然原则上可以在任何语言和字符集的文本数据上构建文本索引，但目前我们建议仅对采用扩展 ASCII 字符集（即西方语言）的输入这样做。
特别是中文、日文和韩文目前缺乏完善的索引支持，这可能会导致索引体积巨大以及查询时间较长。
我们计划在未来添加专门的、按语言定制的分词器（tokenizer），以更好地处理这些情况。
:::

**Preprocessor 参数（可选）**。Preprocessor 指的是在分词之前应用于输入字符串的一个表达式。

Preprocessor 参数的典型用例包括：


1. 转换为小写或大写以实现大小写不敏感匹配，例如 [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)（见下方第一个示例）。
2. UTF-8 归一化，例如 [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 删除或转换不需要的字符或子串，例如 [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)、[translate](./sql-reference/functions/string-replace-functions.md/#translate)。

预处理器表达式必须将类型为 [String](/sql-reference/data-types/string.md) 或 [FixedString](/sql-reference/data-types/fixedstring.md) 的输入值转换为相同类型的值。

示例：

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

此外，预处理器表达式必须只能引用定义该文本索引所基于的列或表达式。

示例：

* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = upper(lower(col)))`
* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(lower(col), lower(col)))`
* 不允许：`INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(col, col))`

不允许使用非确定性函数。

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 和 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 会使用预处理器先对搜索词进行转换，然后再进行分词。

例如，

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, 'Foo');
```

等价于：

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, lower('Foo'));
```

预处理器也可以与 [Array(String)](/sql-reference/data-types/array.md) 和 [Array(FixedString)](/sql-reference/data-types/array.md) 列配合使用。
在这种情况下，预处理器表达式会逐个转换数组元素。

示例：

```sql
CREATE TABLE table
(
    arr Array(String),
    INDEX idx arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(arr))

    -- This is not legal:
    INDEX idx_illegal arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = arraySort(arr))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(arr, 'foo');
```

要在基于 [Map](/sql-reference/data-types/map.md) 类型列的文本索引中定义预处理器，用户需要先决定该索引是建立在 Map 的键上还是值上。

示例：

```sql
CREATE TABLE table
(
    map Map(String, String),
    INDEX idx mapKeys(map)  TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(mapKeys(map)))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(mapKeys(map), 'foo');
```

**其他参数（可选）**。


<details markdown="1">
  <summary>可选高级参数</summary>

  以下高级参数的默认值在几乎所有场景下都能很好地工作。
  我们不建议修改它们。

  可选参数 `dictionary_block_size`（默认值：512）指定字典块的大小（以行数计）。

  可选参数 `dictionary_block_frontcoding_compression`（默认值：1）指定字典块是否使用 front coding 作为压缩方式。

  可选参数 `posting_list_block_size`（默认值：1048576）指定倒排列表（posting list）块的大小（以行数计）。

  可选参数 `posting_list_codec`（默认值：`none）指定倒排列表使用的编解码器：

  * `none` - 倒排列表在存储时不进行额外压缩。
  * `bitpacking` - 先应用[差分（delta）编码](https://en.wikipedia.org/wiki/Delta_encoding)，然后进行[bit-packing](https://dev.to/madhav_baby_giraffe/bit-packing-the-secret-to-optimizing-data-storage-and-transmission-m70)（均在固定大小的块内完成）。会减慢 SELECT 查询的速度，目前不推荐使用。
</details>

*索引粒度。*
文本索引在 ClickHouse 内部实现为一种[跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)类型。
但是，与其他跳过索引不同，文本索引使用“无限粒度”（1 亿）。
这一点可以从文本索引的表定义中看出。

示例：

```sql
CREATE TABLE table(
    k UInt64,
    s String,
    INDEX idx(s) TYPE text(tokenizer = ngrams(2)))
ENGINE = MergeTree()
ORDER BY k;

SHOW CREATE TABLE table;
```

结果：

```result
┌─statement──────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.table                                            ↴│
│↳(                                                                     ↴│
│↳    `k` UInt64,                                                       ↴│
│↳    `s` String,                                                       ↴│
│↳    INDEX idx s TYPE text(tokenizer = ngrams(2)) GRANULARITY 100000000↴│ <-- here
│↳)                                                                     ↴│
│↳ENGINE = MergeTree                                                    ↴│
│↳ORDER BY k                                                            ↴│
│↳SETTINGS index_granularity = 8192                                      │
└────────────────────────────────────────────────────────────────────────┘
```

较大的索引粒度可确保为整个 part 创建文本索引。
显式指定的索引粒度将被忽略。


## 使用文本索引 \{#using-a-text-index\}

在 `SELECT` 查询中使用文本索引很简单，常见的字符串搜索函数会自动利用该索引。
如果在某个列或表分片上不存在索引，这些字符串搜索函数将退化为较慢的暴力扫描。

:::note
我们建议使用 `hasAnyTokens` 和 `hasAllTokens` 函数来搜索文本索引，请参见[下文](#functions-example-hasanytokens-hasalltokens)。
这些函数适用于所有可用的分词器以及所有可能的预处理表达式。
由于其他受支持的函数早于文本索引出现，它们在许多情况下必须保留其传统行为（例如不支持预处理器）。
:::

### 支持的函数 \{#functions-support\}

当在 `WHERE` 或 `PREWHERE` 子句中使用文本函数时，可以使用文本索引：

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` 和 `!=` \{#functions-example-equals-notequals\}

`=`（[equals](/sql-reference/functions/comparison-functions.md/#equals)）和 `!=`（[notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)）会匹配整个给定的搜索词。

示例：

```sql
SELECT * from table WHERE str = 'Hello';
```

文本索引支持 `=` 和 `!=`，但等值和不等值查询只有在使用 `array` 分词器时才有意义（因为它会让索引存储整行的值）。


#### `IN` 和 `NOT IN` \{#functions-example-in-notin\}

`IN`（[in](/sql-reference/functions/in-functions)）和 `NOT IN`（[notIn](/sql-reference/functions/in-functions)）与函数 `equals` 和 `notEquals` 类似，但它们分别匹配全部（`IN`）或不匹配任何（`NOT IN`）搜索项。

示例：

```sql
SELECT * from table WHERE str IN ('Hello', 'World');
```

适用与 `=` 和 `!=` 相同的限制，也就是说，`IN` 和 `NOT IN` 只有在与 `array` 分词器配合使用时才有意义。


#### `LIKE`、`NOT LIKE` 和 `match` \{#functions-example-like-notlike-match\}

:::note
目前只有当索引的 tokenizer 为 `splitByNonAlpha`、`ngrams` 或 `sparseGrams` 时，这些函数才会使用文本索引进行过滤。
:::

要在文本索引中使用 `LIKE`（[like](/sql-reference/functions/string-search-functions.md/#like)）、`NOT LIKE`（[notLike](/sql-reference/functions/string-search-functions.md/#notLike)）以及 [match](/sql-reference/functions/string-search-functions.md/#match) 函数，ClickHouse 必须能够从搜索词中提取完整的 token。
对于使用 `ngrams` tokenizer 的索引，如果通配符之间所搜索字符串的长度大于或等于 ngram 的长度，则满足该条件。

使用 `splitByNonAlpha` tokenizer 的文本索引示例：

```sql
SELECT count() FROM table WHERE comment LIKE 'support%';
```

示例中的 `support` 可以匹配 `support`、`supports`、`supporting` 等等。
这种查询属于子串查询，无法通过文本索引加速。

要在 LIKE 查询中利用文本索引，必须将 LIKE 模式字符串按如下方式改写：

```sql
SELECT count() FROM table WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 左右的空格能够确保该词被提取为一个单独的 token。


#### `startsWith` 和 `endsWith` \{#functions-example-startswith-endswith\}

与 `LIKE` 类似，当且仅当能够从搜索词中提取出完整的 token 时，函数 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) 和 [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 才能使用文本索引。
对于使用 `ngrams` tokenizer 的索引，如果通配符之间待搜索字符串的长度大于或等于 ngram 长度，则满足这一条件。

使用 `splitByNonAlpha` tokenizer 的文本索引示例：

```sql
SELECT count() FROM table WHERE startsWith(comment, 'clickhouse support');
```

在此示例中，只有 `clickhouse` 被视为一个 token。
`support` 不算 token，因为它还可以匹配 `support`、`supports`、`supporting` 等。

要查找所有以 `clickhouse supports` 开头的行，请在搜索模式末尾添加一个尾随空格：

```sql
startsWith(comment, 'clickhouse supports ')`
```

类似地，使用 `endsWith` 时应在前面加一个空格：

```sql
SELECT count() FROM table WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` 和 `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

:::note
函数 `hasToken` 看起来使用起来很简单，但在使用非默认 tokenizer 和预处理表达式时存在一些陷阱。
我们推荐改用函数 `hasAnyTokens` 和 `hasAllTokens`。
:::

函数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 和 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 用于匹配单个给定的 token。

与前面提到的函数不同，它们不会对搜索词进行分词（假定输入本身就是单个 token）。

示例：

```sql
SELECT count() FROM table WHERE hasToken(comment, 'clickhouse');
```


#### `hasAnyTokens` 和 `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

函数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 和 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 用于匹配任意或全部给定的 token。

这两个函数接受的搜索 token 可以是字符串（将使用与索引列相同的 tokenizer 进行分词），也可以是已处理好的 token 数组（在搜索前不会再进行分词）。
更多信息请参阅函数文档。

示例：

```sql
-- Search tokens passed as string argument
SELECT count() FROM table WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM table WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM table WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM table WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

数组函数 [has](/sql-reference/functions/array-functions#has) 用于在字符串数组中匹配单个 token。

示例：

```sql
SELECT count() FROM table WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey)（`mapContainsKey` 的别名）会在 map 的键中，匹配从待搜索字符串中提取的 token。
其行为类似于在 `String` 列上使用 `equals` 函数。
只有当文本索引是基于 `mapKeys(map)` 表达式创建时，才会被使用。

示例：

```sql
SELECT count() FROM table WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM table WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

函数 [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue) 会在 map 的值中，针对从被搜索的字符串中提取出的 token 进行匹配。
其行为类似在 `String` 列上使用 `equals` 函数。
只有当文本索引是基于 `mapValues(map)` 表达式创建时才会被使用。

示例：

```sql
SELECT count() FROM table WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` 和 `mapContainsValueLike` \{#functions-example-mapcontainslike\}

函数 [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) 和 [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) 用于将给定模式分别匹配到 map 的所有键或所有值上。

示例：

```sql
SELECT count() FROM table WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM table WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

[operator[]](/sql-reference/operators#access-operators) 访问运算符可以与文本索引配合使用，用于过滤键和值。只有当文本索引建立在 `mapKeys(map)` 或 `mapValues(map)` 表达式（或二者同时）上时，才会被使用。

示例：

```sql
SELECT count() FROM table WHERE map['engine'] = 'clickhouse';
```

请参考以下示例，了解如何在文本索引中使用类型为 `Array(T)` 和 `Map(K, V)` 的列。


### 具有文本索引的 `Array` 和 `Map` 列示例 \{#text-index-array-and-map-examples\}

#### 为 Array(String) 列建立索引 \{#text-index-example-array\}

假设有一个博客平台，作者使用关键词为他们的博客文章进行分类。
我们希望用户能够通过搜索或点击主题来发现相关内容。

考虑如下表定义：

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

随着平台规模的增长，这会变得越来越慢，因为查询必须检查每一行中的 keywords 数组。
为了解决这个性能问题，我们为 `keywords` 列定义一个文本索引：

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### 为 Map 列建立索引 \{#text-index-example-map\}

在许多可观测性用例中，日志消息通常会被拆分为“组件”，并按合适的数据类型存储，例如时间戳使用日期时间类型、日志级别使用 enum 等。
指标字段通常最好存储为键值对。
运维团队需要高效地搜索日志，用于调试、安全事件分析和监控。

考虑如下日志表：

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

如果没有文本索引，对 [Map](/sql-reference/data-types/map.md) 数据的搜索需要执行全表扫描：

```sql
-- Finds all logs with rate limiting data:
SELECT * FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

随着日志量的增长，这些查询会变得很慢。

一种解决方案是为 [Map](/sql-reference/data-types/map.md) 的键和值创建文本索引。
当需要根据字段名称或属性类型查找日志时，使用 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 来创建文本索引：

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

当需要在属性的实际内容中进行搜索时，使用 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) 来创建文本索引：

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


## 性能调优 \{#performance-tuning\}

### 直接读取 \{#direct-read\}

某些类型的文本查询可以通过一种名为“直接读取”的优化显著提升性能。

示例：

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

直接读取优化会仅使用文本索引来回答查询（即通过文本索引查找），而无需访问底层文本列。
文本索引查找读取的数据量相对较少，因此比 ClickHouse 中常规的 skip 索引快得多（后者会先执行 skip 索引查找，然后再加载并过滤剩余的数据颗粒 granules）。

直接读取由两个设置控制：

* 设置 [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index)（默认值为 true），用于指定是否全局启用直接读取。
* 设置 [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read)，这是启用直接读取的另一个前提条件。在 ClickHouse 版本 &gt;= 26.1 中，该设置默认启用。在更早的版本中，需要显式执行 `SET use_skip_indexes_on_data_read = 1`。

**支持的函数**

直接读取优化支持函数 `hasToken`、`hasAllTokens` 和 `hasAnyTokens`。
如果文本索引是使用 `array` tokenizer 定义的，直接读取同样支持函数 `equals`、`has`、`mapContainsKey` 和 `mapContainsValue`。
这些函数也可以通过 `AND`、`OR` 和 `NOT` 运算符组合使用。
`WHERE` 或 `PREWHERE` 子句中还可以包含额外的非文本搜索函数过滤条件（针对文本列或其他列）——在这种情况下，仍然会使用直接读取优化，但效果会略差一些（它仅适用于受支持的文本搜索函数）。

要确认查询是否使用了直接读取，请使用 `EXPLAIN PLAN actions = 1` 来运行查询。
例如，一个禁用了直接读取的查询

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
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

而在使用 `query_plan_direct_read_from_text_index = 1` 运行相同的查询时

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
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
如果该列存在，则会使用 direct read。

如果 WHERE 过滤子句只包含文本搜索函数，则查询可以完全避免读取该列的数据，并通过 direct read 获得最大的性能收益。
不过，即使在查询的其他部分访问了该文本列，direct read 仍然可以带来性能提升。

**Direct read 作为提示**

Direct read 作为提示与普通 direct read 基于相同的原理，但会在不移除底层文本列的情况下，额外添加一个基于文本索引数据构建的过滤条件。
它用于那些如果只从文本索引中读取数据会产生误报的函数。

支持的函数有：`like`、`startsWith`、`endsWith`、`equals`、`has`、`mapContainsKey` 和 `mapContainsValue`。

这个额外的过滤条件在与其他过滤条件组合使用时，可以提供更高的选择性，进一步收缩结果集，有助于减少从其他列读取的数据量。

Direct read 作为提示可以通过设置 [query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) 来控制（默认启用）。

不使用提示的查询示例：


```sql
EXPLAIN actions = 1
SELECT count()
FROM table
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 0
FORMAT TSV
```

返回

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

而在将 `query_plan_text_index_add_hint` 设为 1 时运行相同的查询

```sql
EXPLAIN actions = 1
SELECT count()
FROM table
WHERE col LIKE '%some-token%'
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 1
```

返回

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

在第二个 EXPLAIN PLAN 输出中，你可以看到在过滤条件中被添加了一个额外的合取项（`__text_index_...`）。
得益于 [PREWHERE](/sql-reference/statements/select/prewhere) 优化，过滤条件被拆分为三个独立的合取项，并按照计算复杂度从低到高的顺序依次应用。
对于这个查询，应用顺序是先 `__text_index_...`，然后是 `greaterOrEquals(...)`，最后是 `like(...)`。
这种顺序使得在读取 `WHERE` 子句中使用的开销较大的列之前，就能在文本索引和原始过滤条件已经跳过的数据粒度基础上，进一步跳过更多数据粒度，从而减少需要读取的数据量。


### 缓存 \{#caching\}

有多种缓存可用于在内存中缓冲文本索引的部分内容（参见[实现细节](#implementation)部分）。
当前，对文本索引的反序列化字典块、头部信息以及 posting lists（倒排列表）都提供了缓存，以减少 I/O。
可以通过以下 SETTING 启用这些缓存：[use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) 和 [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache)。
默认情况下，所有缓存均为禁用状态。
要清除这些缓存，请使用语句 [SYSTEM CLEAR TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches)。

请参考以下服务端 SETTING 来配置这些缓存。

#### 字典块缓存设置 \{#caching-dictionary\}

| 设置                                                                                                                                                     | 说明                                                                                                           |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | 文本索引字典块缓存策略名称。                                                                                   |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | 最大缓存大小（以字节为单位）。                                                                                 |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | 缓存中反序列化的字典块最大数量。                                                                               |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | 文本索引字典块缓存中受保护队列相对于缓存总大小的比例。                                                         |

#### 头部缓存设置 \{#caching-header\}

| Setting                                                                                                                              | 描述                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | 文本索引头部缓存策略名称。                                                                           |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | 最大缓存大小（字节）。                                                                               |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | 缓存中反序列化头部的最大数量。                                                                       |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | 文本索引头部缓存中受保护队列占缓存总大小的比例。                                                     |

#### Posting 列表缓存设置 \{#caching-posting-lists\}

| Setting                                                                                                                               | Description                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | 文本索引 posting 列表缓存策略的名称。                                                                   |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | 最大缓存大小（以字节为单位）。                                                                          |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | 缓存中已反序列化 posting 的最大数量。                                                                   |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | 文本索引 posting 列表缓存中受保护队列大小相对于缓存总大小的比例。                                      |

## 限制 \{#limitations\}

当前文本索引具有以下限制：

- 对包含大量 tokens（例如 100 亿 tokens）的文本索引进行物化时，可能会消耗大量内存。文本索引的物化可以直接进行（`ALTER TABLE <table> MATERIALIZE INDEX <index>`），也可以在分区片段合并时通过间接方式发生。
- 无法在包含超过 4.294.967.296（= 2^32 ≈ 42 亿）行的分区片段上物化文本索引。如果没有物化的文本索引，查询会退回到在该分区片段内执行低效的暴力搜索。作为一种最坏情况的估算，假设某个分区片段只包含一个类型为 String 的列，并且 MergeTree 设置 `max_bytes_to_merge_at_max_space_in_pool`（默认值：150 GB）未被修改。在这种假设下，只要该列平均每行少于 29.5 个字符，就会出现上述情况。实际上，表中通常还包含其他列，因此阈值通常会小好几倍（具体取决于其他列的数量、类型和大小）。

## 文本索引 vs 基于 Bloom Filter 的索引 \{#text-index-vs-bloom-filter-indexes\}

可以通过使用文本索引和基于 Bloom Filter 的索引（索引类型 `bloom_filter`、`ngrambf_v1`、`tokenbf_v1`、`sparse_grams`）来加速字符串谓词，但两者在设计和预期使用场景上从根本上是不同的：

**Bloom Filter 索引**

- 基于可能产生假阳性的概率型数据结构。
- 只能回答集合成员关系问题，即：该列可能包含 token X，或可以确定不包含 X。
- 存储粒度级信息，以便在查询执行期间跳过粗粒度范围。
- 难以正确调优（示例参见[此处](mergetree#n-gram-bloom-filter)）。
- 相对紧凑（每个 part 通常只有几 KB 或几 MB）。

**文本索引**

- 在 token 之上构建确定性的倒排索引，索引本身不会产生假阳性。
- 专门针对文本搜索类工作负载进行了优化。
- 存储行级信息，从而支持高效的词项查找。
- 体积相对较大（每个 part 通常为数十到数百 MB）。

基于 Bloom Filter 的索引对全文搜索的支持只是一种“副作用”：

- 不支持高级分词和预处理。
- 不支持多 token 搜索。
- 无法提供倒排索引所期望的性能特征。

相比之下，文本索引是为全文搜索专门构建的：

- 提供分词和预处理能力。
- 高效支持 `hasAllTokens`、`LIKE`、`match` 以及类似的文本搜索函数。
- 在处理大型文本语料库时具有显著更好的可扩展性。

## Implementation Details \{#implementation\}

每个文本索引由两个（抽象的）数据结构组成：

- 一个字典，将每个 token 映射到一个倒排列表（postings list），以及
- 一组倒排列表，每个倒排列表表示一组行号。

文本索引是针对整个分区片段构建的。
与其他跳过索引不同，在合并数据分区片段时，文本索引可以通过合并来处理，而无需重新构建（见下文）。

在创建索引期间，会创建三个文件（每个分区片段一个）：

**Dictionary blocks file (.dct)**

文本索引中的 token 会被排序，并以每 512 个 token 为一组存储到字典块中（块大小可通过参数 `dictionary_block_size` 配置）。
字典块文件（.dct）由某个分区片段内所有索引粒度（granule）的全部字典块组成。

**Index header file (.idx)**

索引头文件为每个字典块存储该块的第一个 token 以及它在字典块文件中的相对偏移量。

这种稀疏索引结构类似于 ClickHouse 的 [稀疏主键索引](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)。

**Postings lists file (.pst)**

所有 token 的倒排列表按顺序存储在倒排列表文件（.pst）中。
为了节省空间，同时仍然支持快速的交集和并集操作，倒排列表以 [roaring bitmaps](https://roaringbitmap.org/) 的形式存储。
如果某个倒排列表大于 `posting_list_block_size`，则会被拆分为多个块，并按顺序写入倒排列表文件。

**Merging of text indexes**

当数据分区片段被合并时，无需从头重建文本索引；相反，可以在合并流程的单独步骤中高效地对其进行合并。
在该步骤中，会读取并合并每个输入分区片段中文本索引的有序字典，生成一个新的统一字典。
倒排列表中的行号也会被重新计算，以反映它们在合并后数据分区片段中的新位置，这个过程使用在初始合并阶段创建的旧行号到新行号的映射。
这种合并文本索引的方法类似于带有 `_part_offset` 列的 [projections](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) 的合并方式。
如果源分区片段中索引尚未物化（materialized），则会先构建该索引，将其写入一个临时文件，然后与来自其他分区片段和其他临时索引文件的索引一起合并。

## 示例：Hacker News 数据集 \{#hacker-news-dataset\}

我们来看一下在包含大量文本的大型数据集上，使用文本索引带来的性能提升。
我们将使用来自知名网站 Hacker News 的 2870 万行评论数据。
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

这 2870 万行数据位于 S3 上的一个 Parquet 文件中——让我们将它们插入到 `hackernews` 表中：

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

我们将使用 `ALTER TABLE`，在评论列上添加一个文本索引，然后将其物化：

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

现在，让我们运行一些使用 `hasToken`、`hasAnyTokens` 和 `hasAllTokens` 函数的查询。
下面的示例将展示标准索引扫描与直接读取优化之间巨大的性能差异。


### 1. 使用 `hasToken` \{#using-hasToken\}

`hasToken` 用于检查文本中是否包含某个特定的单个 token。
我们将在搜索中查找区分大小写的 token &#39;ClickHouse&#39;。

**禁用直接读取（标准扫描）**
默认情况下，ClickHouse 使用跳过索引（skip index）来过滤 granule，然后读取这些 granule 的列数据。
我们可以通过禁用直接读取来模拟这种行为。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**已启用直接读取（快速索引读取）**
现在我们在启用直接读取（默认启用）的情况下运行相同的查询。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```

直接读取的查询速度快了 45 倍以上（0.362s 对比 0.008s），并且由于仅从索引中读取数据，处理的数据量大幅减少（9.51 GB 对比 3.15 MB）。


### 2. 使用 `hasAnyTokens` \{#using-hasAnyTokens\}

`hasAnyTokens` 用于检查文本是否至少包含任意一个指定的 token。
我们将搜索包含 &#39;love&#39; 或 &#39;ClickHouse&#39; 的评论。

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

1 row in set. Elapsed: 0.015 sec. Processed 27.99 million rows, 27.99 MB
```

对于这种常见的“OR”搜索，加速效果更加显著。
通过避免对整列进行扫描，该查询速度提升了近 89 倍（1.329s vs 0.015s）。


### 3. 使用 `hasAllTokens` \{#using-hasAllTokens\}

`hasAllTokens` 会检查文本是否包含给定的所有 token。
我们将搜索同时包含 &#39;love&#39; 和 &#39;ClickHouse&#39; 的评论。

**禁用直接读取（标准扫描）**
即使禁用了直接读取，标准跳过索引依然有效。
它将 2870 万行过滤到仅 14.746 万行，但仍然必须从列中读取 57.03 MB 的数据。

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
直接读取通过仅操作索引数据来完成该查询，只需读取 147.46 KB 的数据。

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

对于这种“AND”搜索，直接读取优化比标准跳过索引的扫描快 26 倍以上（0.184 秒 vs 0.007 秒）。


### 4. 复合搜索：OR、AND、NOT 等 \{#compound-search\}

直接读取优化同样适用于复合布尔表达式。
在这里，我们将执行对 &#39;ClickHouse&#39; 或 &#39;clickhouse&#39; 的不区分大小写的搜索。

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

通过结合索引过滤的结果，直接读取的查询快了 34 倍（0.450s 对比 0.013s），并且避免了读取 9.58 GB 的列数据。
对于这个特定场景，`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` 将是更推荐使用的、更高效的写法。


## 相关内容 \{#related-content\}

- 演示文稿：https://github.com/ClickHouse/clickhouse-presentations/blob/master/2025-tumuchdata-munich/ClickHouse_%20full-text%20search%20-%2011.11.2025%20Munich%20Database%20Meetup.pdf
- 演示文稿：https://presentations.clickhouse.com/2026-fosdem-inverted-index/Inverted_indexes_the_what_the_why_the_how.pdf

**已过时的内容**

- 博客：[Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 博客：[Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- 视频：[Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)