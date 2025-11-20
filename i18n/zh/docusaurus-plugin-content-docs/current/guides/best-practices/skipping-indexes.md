---
slug: /optimize/skipping-indexes
sidebar_label: '数据跳过索引'
sidebar_position: 2
description: '跳过索引使 ClickHouse 能够跳过读取那些可以确定不包含匹配值的大块数据。'
title: '深入理解 ClickHouse 数据跳过索引'
doc_type: 'guide'
keywords: ['skipping indexes', 'data skipping', 'performance', 'indexing', 'best practices']
---

import simple_skip from '@site/static/images/guides/best-practices/simple_skip.png';
import bad_skip from '@site/static/images/guides/best-practices/bad_skip.png';
import Image from '@theme/IdealImage';


# 了解 ClickHouse 数据跳过索引



## Introduction {#introduction}

影响 ClickHouse 查询性能的因素有很多。在大多数场景中,关键因素是 ClickHouse 在评估查询 WHERE 子句条件时能否使用主键。因此,选择适用于最常见查询模式的主键对于有效的表设计至关重要。

然而,无论主键调优得多么仔细,都不可避免地会出现无法高效使用主键的查询场景。用户通常依赖 ClickHouse 处理时间序列类型的数据,但他们往往希望根据其他业务维度(如客户 ID、网站 URL 或产品编号)来分析这些数据。在这种情况下,查询性能可能会显著下降,因为应用 WHERE 子句条件可能需要对每个列值进行全扫描。虽然 ClickHouse 在这些情况下仍然相对较快,但评估数百万或数十亿个单独的值会导致"非索引"查询的执行速度远慢于基于主键的查询。

在传统的关系型数据库中,解决此问题的一种方法是为表附加一个或多个"二级"索引。这是一种 B 树结构,允许数据库在 O(log(n)) 时间内而非 O(n) 时间(表扫描)内找到磁盘上所有匹配的行,其中 n 是行数。然而,这种类型的二级索引不适用于 ClickHouse(或其他列式数据库),因为磁盘上没有可添加到索引的单独行。

相反,ClickHouse 提供了一种不同类型的索引,在特定情况下可以显著提高查询速度。这些结构被称为"跳数索引"(Skip Index),因为它们使 ClickHouse 能够跳过读取那些确保不包含匹配值的大块数据。


## 基本操作 {#basic-operation}

用户只能在 MergeTree 系列表上使用数据跳过索引。每个数据跳过索引有四个主要参数:

- 索引名称。索引名称用于在每个分区中创建索引文件。此外,在删除或物化索引时也需要将其作为参数。
- 索引表达式。索引表达式用于计算存储在索引中的值集合。它可以是列、简单运算符和/或由索引类型决定的函数子集的组合。
- TYPE。索引类型控制计算逻辑,用于确定是否可以跳过读取和评估每个索引块。
- GRANULARITY。每个索引块由 GRANULARITY 个颗粒组成。例如,如果主表索引的粒度为 8192 行,索引粒度为 4,则每个索引"块"将包含 32768 行。

当用户创建数据跳过索引时,表的每个数据部分目录中将生成两个额外的文件。

- `skp_idx_{index_name}.idx`,包含有序的表达式值
- `skp_idx_{index_name}.mrk2`,包含关联数据列文件的相应偏移量。

在执行查询并读取相关列文件时,如果 WHERE 子句过滤条件的某部分与跳过索引表达式匹配,ClickHouse 将使用索引文件数据来确定每个相关数据块是必须处理还是可以跳过(假设该块尚未被主键排除)。下面通过一个简化的示例来说明,该示例使用了一个加载了可预测数据的表。

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

执行不使用主键的简单查询时,`my_value` 列中的所有 1 亿条记录都会被扫描:

```sql
SELECT * FROM skip_table WHERE my_value IN (125, 700)

┌─my_key─┬─my_value─┐
│ 512000 │      125 │
│ 512001 │      125 │
│    ... |      ... |
└────────┴──────────┘

8192 rows in set. Elapsed: 0.079 sec. Processed 100.00 million rows, 800.10 MB (1.26 billion rows/s., 10.10 GB/s.
```

现在添加一个非常基本的跳过索引:

```sql
ALTER TABLE skip_table ADD INDEX vix my_value TYPE set(100) GRANULARITY 2;
```

通常跳过索引仅应用于新插入的数据,因此仅添加索引不会影响上述查询。

要为已存在的数据建立索引,请使用以下语句:

```sql
ALTER TABLE skip_table MATERIALIZE INDEX vix;
```

使用新创建的索引重新运行查询:

```sql
SELECT * FROM skip_table WHERE my_value IN (125, 700)

┌─my_key─┬─my_value─┐
│ 512000 │      125 │
│ 512001 │      125 │
│    ... |      ... |
└────────┴──────────┘

8192 rows in set. Elapsed: 0.051 sec. Processed 32.77 thousand rows, 360.45 KB (643.75 thousand rows/s., 7.08 MB/s.)
```

ClickHouse 没有处理 1 亿行共 800 兆字节的数据,而是只读取和分析了 32768 行共 360 千字节的数据——即 4 个颗粒,每个颗粒 8192 行。

以更直观的形式展示,下图显示了 `my_value` 为 125 的 4096 行是如何被读取和选择的,以及后续行是如何在不从磁盘读取的情况下被跳过的:

<Image img={simple_skip} size='md' alt='Simple Skip' />

用户可以通过在执行查询时启用跟踪来访问有关跳过索引使用情况的详细信息。在 clickhouse-client 中,设置 `send_logs_level`:

```sql
SET send_logs_level='trace';
```

这将在尝试调优查询 SQL 和表索引时提供有用的调试信息。从上面的示例中,调试日志显示跳过索引丢弃了除两个颗粒之外的所有颗粒:


```sql
<Debug> default.skip_table (933d4b2c-8cea-4bf9-8c93-c56e900eefd1) (SelectExecutor): Index `vix` has dropped 6102/6104 granules.
```

## 跳数索引类型 {#skip-index-types}

<!-- vale off -->

### minmax {#minmax}

<!-- vale on -->

这种轻量级索引类型不需要参数。它为每个数据块存储索引表达式的最小值和最大值(如果表达式是元组,则分别存储元组中每个元素成员的值)。这种类型非常适合按值进行松散排序的列。这种索引类型通常是查询处理期间应用成本最低的。

这种类型的索引仅适用于标量或元组表达式——该索引永远不会应用于返回数组或映射数据类型的表达式。

<!-- vale off -->

### set {#set}

<!-- vale on -->

这种轻量级索引类型接受一个参数,即每个数据块的值集合的最大大小 max_size(0 表示允许无限数量的离散值)。该集合包含数据块中的所有值(如果值的数量超过 max_size 则为空)。这种索引类型适用于在每组颗粒内基数较低(本质上是"聚集在一起")但整体基数较高的列。

此索引的成本、性能和有效性取决于数据块内的基数。如果每个数据块包含大量唯一值,那么针对大型索引集评估查询条件将非常昂贵,或者由于超过 max_size 导致索引为空而无法应用索引。

### 布隆过滤器类型 {#bloom-filter-types}

_布隆过滤器_是一种数据结构,它允许以空间高效的方式测试集合成员资格,代价是存在轻微的误报可能性。在跳数索引的情况下,误报不是一个重大问题,因为唯一的缺点是读取一些不必要的数据块。然而,误报的可能性确实意味着索引表达式应该预期为真,否则有效数据可能会被跳过。

由于布隆过滤器可以更高效地处理大量离散值的测试,因此它们适用于产生更多待测试值的条件表达式。特别是,布隆过滤器索引可以应用于数组(测试数组的每个值),以及通过使用 mapKeys 或 mapValues 函数将键或值转换为数组来应用于映射。

基于布隆过滤器的数据跳数索引有三种类型:

- 基本的 **bloom_filter**,它接受一个可选参数,即允许的"误报"率,范围在 0 到 1 之间(如果未指定,则使用 .025)。

- 专用的 **tokenbf_v1**。它接受三个参数,都与调优所使用的布隆过滤器有关:(1) 过滤器的字节大小(更大的过滤器误报更少,但存储成本更高),(2) 应用的哈希函数数量(同样,更多的哈希函数可减少误报),以及 (3) 布隆过滤器哈希函数的种子。有关这些参数如何影响布隆过滤器功能的更多详细信息,请参阅[此处](https://hur.st/bloomfilter/)的计算器。
  此索引仅适用于 String、FixedString 和 Map 数据类型。输入表达式被分割为由非字母数字字符分隔的字符序列。例如,列值 `This is a candidate for a "full text" search` 将包含标记 `This` `is` `a` `candidate` `for` `full` `text` `search`。它旨在用于 LIKE、EQUALS、IN、hasToken() 以及在较长字符串中搜索单词和其他值的类似操作。例如,一种可能的用途是在自由格式应用程序日志行的列中搜索少量类名或行号。

- 专用的 **ngrambf_v1**。此索引的功能与标记索引相同。它在布隆过滤器设置之前接受一个额外的参数,即要索引的 ngram 的大小。ngram 是长度为 `n` 的任意字符的字符串,因此字符串 `A short string` 在 ngram 大小为 4 时将被索引为:
  ```text
  'A sh', ' sho', 'shor', 'hort', 'ort ', 'rt s', 't st', ' str', 'stri', 'trin', 'ring'
  ```
  此索引对于文本搜索也很有用,特别是对于没有分词的语言,例如中文。


## 跳数索引函数 {#skip-index-functions}

数据跳数索引的核心目的是限制常用查询需要分析的数据量。鉴于 ClickHouse 数据的分析特性,这些查询的模式在大多数情况下包含函数表达式。因此,跳数索引必须与常用函数正确交互才能实现高效运行。这种交互可能发生在以下情况:

- 插入数据时,索引被定义为函数表达式(表达式的结果存储在索引文件中),或
- 处理查询时,将表达式应用于存储的索引值以确定是否排除该数据块。

每种类型的跳数索引都适用于 ClickHouse 可用函数的一个子集,具体取决于[此处](/engines/table-engines/mergetree-family/mergetree/#functions-support)列出的索引实现。一般来说,集合索引和基于 Bloom filter 的索引(另一种集合索引类型)都是无序的,因此不适用于范围查询。相比之下,minmax 索引特别适合处理范围查询,因为判断范围是否相交的速度非常快。部分匹配函数 LIKE、startsWith、endsWith 和 hasToken 的效果取决于所使用的索引类型、索引表达式以及数据的具体形态。


## 跳数索引设置 {#skip-index-settings}

有两个可用的设置适用于跳数索引。

- **use_skip_indexes** (0 或 1,默认值为 1)。并非所有查询都能高效使用跳数索引。如果某个特定的过滤条件
  可能包含大部分颗粒,应用数据跳数索引会产生不必要的开销,有时甚至是显著的开销。对于不太可能从任何跳数索引中受益的查询,
  请将该值设置为 0。
- **force_data_skipping_indices** (以逗号分隔的索引名称列表)。此设置可用于防止某些类型的低效
  查询。在除非使用跳数索引否则查询表的开销过高的情况下,将此设置与一个或多个索引
  名称一起使用时,任何未使用所列索引的查询都会返回异常。这可以防止编写不当的查询
  消耗服务器资源。


## 跳数索引最佳实践 {#skip-best-practices}

跳数索引并不直观,特别是对于习惯了关系型数据库管理系统中基于行的二级索引或文档存储中倒排索引的用户。要获得任何收益,应用 ClickHouse 数据跳数索引必须避免足够多的颗粒读取,以抵消计算索引的成本。关键在于,如果一个值在索引块中哪怕只出现一次,就意味着整个块必须被读入内存并进行评估,索引成本就会被不必要地产生。

考虑以下数据分布:

<Image img={bad_skip} size='md' alt='Bad Skip' />

假设主键/排序键是 `timestamp`,并且在 `visitor_id` 上有一个索引。考虑以下查询:

```sql
SELECT timestamp, url FROM table WHERE visitor_id = 1001`
```

对于这种数据分布,传统的二级索引会非常有利。无需读取全部 32768 行来查找具有请求的 visitor_id 的 5 行,二级索引只会包含五个行位置,并且只有这五行会从磁盘读取。而对于 ClickHouse 数据跳数索引来说,情况恰恰相反。无论跳数索引的类型如何,`visitor_id` 列中的全部 32768 个值都将被测试。

因此,试图通过简单地为关键列添加索引来加速 ClickHouse 查询的自然想法往往是错误的。这一高级功能应该只在研究了其他替代方案之后才使用,例如修改主键(参见[如何选择主键](../best-practices/sparse-primary-indexes.md))、使用投影或使用物化视图。即使数据跳数索引是合适的,通常也需要对索引和表进行仔细调优。

在大多数情况下,有用的跳数索引需要主键与目标非主键列/表达式之间存在强相关性。如果没有相关性(如上图所示),那么包含数千个值的块中至少有一行满足过滤条件的可能性很高,很少有块会被跳过。相反,如果主键的值范围(如一天中的时间)与潜在索引列中的值(如电视观众年龄)强相关,那么 minmax 类型的索引可能会有益。请注意,在插入数据时可以通过在排序/ORDER BY 键中包含额外的列,或者以与主键关联的值在插入时分组的方式批量插入来增加这种相关性。例如,即使主键是包含来自大量站点的事件的时间戳,摄取过程也可以将特定 site_id 的所有事件分组并一起插入。这将导致许多颗粒只包含少数几个 site id,因此在按特定 site_id 值搜索时可以跳过许多块。

跳数索引的另一个良好候选场景是高基数表达式,其中任何单个值在数据中相对稀疏。一个例子可能是跟踪 API 请求中错误代码的可观测性平台。某些错误代码虽然在数据中很少见,但对于搜索可能特别重要。在 error_code 列上建立集合跳数索引可以绕过绝大多数不包含错误的块,从而显著改善以错误为重点的查询。

最后,关键的最佳实践是测试、测试、再测试。再次强调,与 B 树二级索引或用于搜索文档的倒排索引不同,数据跳数索引的行为不容易预测。将它们添加到表中会在数据摄取和查询上产生显著成本,而这些查询可能由于各种原因无法从索引中受益。应该始终在真实世界类型的数据上进行测试,测试应该包括类型、颗粒大小和其他参数的变化。测试通常会揭示仅凭理论分析无法发现的模式和陷阱。


## 相关文档 {#related-docs}

- [最佳实践指南](/best-practices/use-data-skipping-indices-where-appropriate)
- [数据跳数索引示例](/optimize/skipping-indexes/examples)
- [操作数据跳数索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
