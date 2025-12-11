---
slug: /optimize/skipping-indexes
sidebar_label: '数据跳过索引'
sidebar_position: 2
description: '跳过索引使 ClickHouse 能够在确定没有匹配值时跳过读取大块数据。'
title: '了解 ClickHouse 数据跳过索引'
doc_type: 'guide'
keywords: ['跳过索引', '数据跳过', '性能', '索引', '最佳实践']
---

import simple_skip from '@site/static/images/guides/best-practices/simple_skip.png';
import bad_skip from '@site/static/images/guides/best-practices/bad_skip.png';
import Image from '@theme/IdealImage';

# 深入了解 ClickHouse 数据跳过索引 {#understanding-clickhouse-data-skipping-indexes}

## 简介 {#introduction}

影响 ClickHouse 查询性能的因素有很多。在大多数场景中，关键因素是 ClickHouse 在评估查询的 WHERE 子句条件时，能否利用主键。因此，为最常见的查询模式选择合适的主键，对实现高效的表设计至关重要。

然而，即使主键经过非常细致的调优，仍然难以避免存在一些查询场景无法高效利用它。用户通常会使用 ClickHouse 存储时序数据，但往往希望按照其他业务维度（例如客户 ID、网站 URL 或产品编号）来分析同一批数据。在这种情况下，查询性能可能会明显变差，因为为了应用 WHERE 子句条件，可能需要对每一列的值进行全量扫描。虽然在这些场景下 ClickHouse 依然相对较快，但对数百万甚至数十亿个单独值进行评估，会导致这类未利用索引的查询相比基于主键的查询慢得多。

在传统关系型数据库中，解决这一问题的一种方法是为表添加一个或多个“二级”索引。这是一种 b-tree 结构，使数据库可以在 O(log(n)) 时间内在磁盘上找到所有匹配的行，而不是 O(n) 时间（表扫描），其中 n 是行数。然而，这种类型的二级索引不适用于 ClickHouse（或其他列式数据库），因为磁盘上并不存在可添加到索引中的单独行。

为此，ClickHouse 提供了一种不同类型的索引，在特定情况下可以显著提升查询速度。这些结构被称为“跳过（Skip）索引”，因为它们使 ClickHouse 能够跳过读取那些可以确定不包含任何匹配值的大块数据。

## 基本操作 {#basic-operation}

用户只能在 MergeTree 系列的表上使用数据跳过索引（Data Skipping Indexes）。每个数据跳过索引有四个主要参数：

* 索引名称。索引名称用于在每个分区中创建索引文件。同时，在删除或物化该索引时，它也必须作为参数提供。
* 索引表达式。索引表达式用于计算存储在索引中的值集合。它可以是列、简单运算符和/或由索引类型决定的一部分函数的组合。
* TYPE。索引类型决定用于判断是否可以跳过读取和计算各索引块的计算方式。
* GRANULARITY。每个被索引的块由 GRANULARITY 个粒度（granule）组成。例如，如果主表索引的粒度是 8192 行，而索引粒度是 4，那么每个被索引的“块”将是 32768 行。

当用户创建一个数据跳过索引时，在该表的每个数据部分目录中会新增两个文件。

* `skp_idx_{index_name}.idx`，其中包含有序的表达式值
* `skp_idx_{index_name}.mrk2`，其中包含指向关联数据列文件的对应偏移量。

如果在执行查询并读取相关列文件时，WHERE 子句中过滤条件的某一部分与跳过索引表达式匹配，ClickHouse 将使用索引文件中的数据来判断是否必须处理每个相关的数据块，或可以跳过该数据块（假定该数据块尚未因应用主键而被排除）。为了给出一个高度简化的示例，请考虑下面这个填充了可预测数据的表。

```sql
CREATE TABLE skip_table
(
  my_key UInt64,
  my_value UInt64
)
ENGINE MergeTree primary key my_key
SETTINGS index_granularity=8192;

INSERT INTO skip_table SELECT number, intDiv(number,4096) FROM numbers(100000000);
```

当执行未使用主键的简单查询时，`my_value` 列中的全部 1 亿条记录都会被扫描：

```sql
SELECT * FROM skip_table WHERE my_value IN (125, 700)

┌─my_key─┬─my_value─┐
│ 512000 │      125 │
│ 512001 │      125 │
│    ... |      ... |
└────────┴──────────┘

返回 8192 行。用时:0.079 秒。已处理 1 亿行,800.10 MB(12.6 亿行/秒,10.10 GB/秒)。
```

现在添加一个非常简单的跳过索引（skip index）：

```sql
ALTER TABLE skip_table ADD INDEX vix my_value TYPE set(100) GRANULARITY 2;
```

通常情况下，skip index 只会应用于新插入的数据，因此仅添加该索引不会对上述查询产生影响。

要为已有数据建立索引，请使用以下语句：

```sql
ALTER TABLE skip_table MATERIALIZE INDEX vix;
```

使用新建的索引重新执行查询：

```sql
SELECT * FROM skip_table WHERE my_value IN (125, 700)

┌─my_key─┬─my_value─┐
│ 512000 │      125 │
│ 512001 │      125 │
│    ... |      ... |
└────────┴──────────┘

返回 8192 行。用时:0.051 秒。已处理 32.77 千行,360.45 KB(643.75 千行/秒,7.08 MB/秒)
```

相比处理 1 亿行、800 兆字节的数据，ClickHouse 只读取并分析了 32768 行、360 千字节的数据——
也就是四个 granule，每个 granule 包含 8192 行。

用更直观的方式表示，这展示了如何读取并选中 `my_value` 等于 125 的那 4096 行，
以及后续的行是如何在不从磁盘读取的情况下被跳过的：

<Image img={simple_skip} size="md" alt="Simple Skip" />

用户可以在执行查询时启用 trace，以查看跳过索引使用情况的详细信息。
在 clickhouse-client 中，设置 `send_logs_level`：

```sql
SET send_logs_level='trace';
```

在调优查询 SQL 和表索引时，这将提供有用的调试信息。根据上面的示例，调试日志显示跳过索引过滤掉了除两个 granule 以外的所有 granule：

```sql
<Debug> default.skip_table (933d4b2c-8cea-4bf9-8c93-c56e900eefd1) (SelectExecutor): 索引 `vix` 已丢弃 6102/6104 个颗粒。
```

## 跳过索引类型 {#skip-index-types}

{/* vale off */ }

### minmax {#minmax}

{/* vale on */ }

这种轻量级索引类型不需要任何参数。它为每个数据块存储索引表达式的最小值和最大值（如果表达式是一个 `tuple`，则分别存储该 `tuple` 中每个元素的取值）。这种类型非常适合值大致有序排列的列。在查询处理过程中，这类索引通常是开销最低的一种。

这种索引类型仅在标量或 `tuple` 表达式上才能正确工作——不会应用于返回数组或 `map` 数据类型的表达式。

{/* vale off */ }

### set {#set}

{/* vale on */ }

这种轻量级索引类型接受一个参数，即每个数据块中值集合的最大大小 `max_size`（0 表示允许无限数量的离散值）。该集合包含数据块中的所有值（如果值的数量超过 `max_size`，则集合为空）。这种索引类型非常适合在每组 granule 内基数较低（本质上是“聚在一起”），但整体基数较高的列。

此索引的成本、性能和有效性取决于数据块内部的基数。如果每个数据块包含大量唯一值，要么针对一个很大的索引集合评估查询条件会非常昂贵，要么由于超过 `max_size` 导致索引为空而无法应用索引。

### Bloom filter 类型 {#bloom-filter-types}

*Bloom filter*（布隆过滤器）是一种数据结构，它以极高的空间效率实现集合成员测试，但代价是存在一定概率的误报。对于跳过索引而言，误报并不是一个重要问题，因为唯一的劣势是会多读取一些不必要的数据块。然而，存在误报的可能性也意味着被索引的表达式通常应当为 true，否则可能会跳过有效数据。

由于 Bloom filter 能够更高效地处理大量离散值的成员测试，它适用于会产生较多待测试值的条件表达式。特别是，Bloom filter 索引可以应用于数组（数组中的每个值都会被测试），以及映射（通过使用 `mapKeys` 或 `mapValues` 函数将键或值转换为数组）。

基于 Bloom filter 的数据跳过索引类型有三种：

* 基本的 **bloom&#95;filter**，它接受一个可选参数，用于指定允许的“误报率”（false positive rate），在 0 到 1 之间（如果未指定，则使用 0.025）。

* 专用的 **tokenbf&#95;v1**。它接受三个参数，全部与所使用的 Bloom filter 调优相关：(1) 过滤器的大小（字节数，过滤器越大，误报越少，但存储成本更高），(2) 应用的哈希函数数量（同样，更多的哈希函数可以减少误报），(3) Bloom filter 哈希函数的种子。有关这些参数如何影响 Bloom filter 功能的更多细节，请参见[此处](https://hur.st/bloomfilter/)的计算器。
  该索引仅适用于 String、FixedString 和 Map 数据类型。输入表达式会按非字母数字字符进行拆分，分成多个字符序列。例如，列值 `This is a candidate for a "full text" search` 将包含标记 `This` `is` `a` `candidate` `for` `full` `text` `search`。它旨在用于 LIKE、EQUALS、IN、`hasToken()` 以及类似的在较长字符串中搜索单词和其他值的查询。例如，一个可能的用例是在包含自由格式应用日志行的列中，搜索少量类名或行号。

* 专用的 **ngrambf&#95;v1**。此索引的工作方式与 token 索引相同。它在 Bloom filter 设置之前额外接受一个参数，即要索引的 ngram 大小。ngram 是长度为 `n` 的任意字符字符串，因此，对于字符串 `A short string`，在 ngram 大小为 4 时，会被索引为：
  ```text
  'A sh', ' sho', 'shor', 'hort', 'ort ', 'rt s', 't st', ' str', 'stri', 'trin', 'ring'
  ```

该索引同样可用于文本搜索，特别是对于没有单词间空格分隔的语言，例如中文。

## 跳过索引函数 {#skip-index-functions}

数据跳过索引的核心目的是减少常用查询需要扫描和分析的数据量。鉴于 ClickHouse 数据的分析型特征，这些查询在大多数情况下都会包含函数表达式。因此，要想高效，跳过索引必须能够与常见函数正确配合。这可以在以下任一情况下实现：
* 插入数据时，将索引定义为函数表达式（表达式的结果存储在索引文件中），或
* 处理查询时，将表达式应用于已存储的索引值，以确定是否排除该数据块。

每种类型的跳过索引都只适用于部分 ClickHouse 函数，具体取决于索引的实现，如
[此处](/engines/table-engines/mergetree-family/mergetree/#functions-support)所列。一般来说，集合索引和基于 Bloom filter 的索引（另一种集合索引）都是无序的，因此不支持范围查询。相比之下，minmax 索引在处理范围时表现尤为出色，因为判断范围是否相交的速度非常快。部分匹配函数 LIKE、startsWith、endsWith 和 hasToken 的效果取决于所用的索引类型、索引表达式以及数据本身的分布特征。

## 跳过索引设置 {#skip-index-settings}

有两个适用于跳过索引的设置。

* **use_skip_indexes**（0 或 1，默认 1）。并非所有查询都能高效使用跳过索引。如果某个特定过滤条件很可能命中大多数数据粒度（granule），那么应用数据跳过索引会带来不必要、有时甚至相当可观的开销。对于不太可能从任何跳过索引中获益的查询，将该值设置为 0。
* **force_data_skipping_indices**（以逗号分隔的索引名称列表）。此设置可用于防止某些低效查询。在某些情况下，如果不使用跳过索引，对表进行查询的代价过高，那么使用此设置并指定一个或多个索引名称时，对于任何未使用所列索引的查询都会返回异常。这样可以防止设计不良的查询消耗服务器资源。

## Skip 索引最佳实践 {#skip-best-practices}

Skip 索引并不直观，尤其是对于那些习惯于关系型数据库（RDBMS）中的行式二级索引，或文档存储中的倒排索引的用户而言。要真正获益，在应用 ClickHouse 数据跳过索引时，必须跳过足够多的 granule 读取，以抵消计算索引本身的开销。关键在于，如果某个值在一个已建立索引的数据块（block）中哪怕只出现一次，就意味着整个 block 都必须被读入内存并进行评估，而索引的计算成本在这种情况下就成了多余的开销。

考虑下面的数据分布：

<Image img={bad_skip} size="md" alt="不佳的 Skip 索引示例" />

假设 primary/ORDER BY 键是 `timestamp`，并且在 `visitor_id` 上建立了索引。考虑下面这个查询：

```sql
SELECT timestamp, url FROM table WHERE visitor_id = 1001`
```

对于这种数据分布，传统的二级索引会非常有优势。与其读取全部 32768 行来找到
5 行符合请求 visitor&#95;id 的记录，不如让二级索引只包含这五行所在的位置，这样就只会从磁盘读取这五行。对于 ClickHouse 的数据跳过索引来说，情况则完全相反。无论使用哪种跳过索引类型，
`visitor_id` 列中的全部 32768 个值都会被测试。

因此，试图通过简单地在关键列上添加索引来加速 ClickHouse 查询这一本能做法，往往是错误的。只有在调查其他备选方案之后（例如修改主键（参见 [如何选择主键](../best-practices/sparse-primary-indexes.md)）、使用 projection，或使用物化视图），才应考虑使用这一高级功能。即使在适合使用数据跳过索引的场景中，通常也需要对索引和表本身进行仔细调优。

在大多数情况下，一个有用的跳过索引要求主键与目标的非主键列/表达式之间具有较强的相关性。
如果没有相关性（如上图所示），则在包含几千个值的数据块中，至少有一行满足过滤条件的概率很高，能够被跳过的块就很少。相比之下，如果某个主键取值范围（例如一天中的时间）
与潜在索引列中的值（例如电视观众年龄）之间具有很强的关联，那么 minmax 类型的索引
往往会带来明显收益。需要注意的是，在插入数据时，可以通过在排序/ORDER BY 键中包含额外列，或通过按批次插入、使与主键相关的值在插入时成组聚集等方式，
来提高这种相关性。例如，某个特定 site&#95;id 的所有事件可以在摄取流程中进行分组并一起插入，即便主键是一个包含大量站点事件的时间戳。
这样会产生许多仅包含少量 site&#95;id 的 granule，因此在按特定 site&#95;id 值搜索时，就可以跳过大量数据块。

另一个适合作为跳过索引的场景是高基数表达式，并且任一具体取值在数据中都相对稀疏。一个示例
是用于跟踪 API 请求错误码的可观测性平台。某些错误码虽然在数据中较为罕见，但对查询而言却特别
重要。在 error&#95;code 列上创建一个 set 跳过索引，可以绕过绝大多数不包含
错误的数据块，从而显著提升以错误为中心的查询性能。

最后，最重要的最佳实践是：测试、测试、再测试。与用于文档搜索的 b-tree 二级索引或倒排索引不同，
数据跳过索引的行为并不容易预测。将它们添加到表中，会在数据摄取以及那些由于各种原因
无法从索引中获益的查询中引入不小的开销。始终应在真实世界类型的数据上进行测试，并且测试应当
涵盖索引类型、granule 大小以及其他参数的不同配置。测试往往会暴露出仅凭思维实验无法轻易看出的模式和陷阱。

## 相关文档 {#related-docs}
- [最佳实践指南](/best-practices/use-data-skipping-indices-where-appropriate)
- [数据跳过索引示例](/optimize/skipping-indexes/examples)
- [管理数据跳过索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
