---
title: 'BigQuery 与 ClickHouse Cloud'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQuery 与 ClickHouse Cloud 之间的区别'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '概览'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud 与 BigQuery 对比 



## 资源组织 {#resource-organization}

ClickHouse Cloud 中的资源组织方式类似于 [BigQuery 的资源层次结构](https://cloud.google.com/bigquery/docs/resource-hierarchy)。下图展示了 ClickHouse Cloud 的资源层次结构,我们将基于此图说明具体差异:

<Image img={bigquery_1} size='md' alt='资源组织' />

### 组织 {#organizations}

与 BigQuery 类似,组织是 ClickHouse Cloud 资源层次结构中的根节点。您在 ClickHouse Cloud 账户中创建的第一个用户会自动分配到该用户所拥有的组织。该用户可以邀请其他用户加入组织。

### BigQuery 项目与 ClickHouse Cloud 服务 {#bigquery-projects-vs-clickhouse-cloud-services}

在组织内,您可以创建服务,这些服务大致相当于 BigQuery 项目,因为 ClickHouse Cloud 中存储的数据与服务关联。ClickHouse Cloud 提供[多种服务类型](/cloud/manage/cloud-tiers)。每个 ClickHouse Cloud 服务都部署在特定区域中,包含以下内容:

1. 一组计算节点(目前开发层服务为 2 个节点,生产层服务为 3 个节点)。对于这些节点,ClickHouse Cloud [支持垂直和水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud),支持手动和自动两种方式。
2. 一个对象存储文件夹,用于存储服务的所有数据。
3. 一个端点(或通过 ClickHouse Cloud UI 控制台创建的多个端点)——用于连接服务的 URL(例如 `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQuery 数据集与 ClickHouse Cloud 数据库 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse 将表按逻辑分组到数据库中。与 BigQuery 数据集类似,ClickHouse 数据库是用于组织和控制表数据访问的逻辑容器。

### BigQuery 文件夹 {#bigquery-folders}

ClickHouse Cloud 目前没有与 BigQuery 文件夹对应的概念。

### BigQuery 插槽预留和配额 {#bigquery-slot-reservations-and-quotas}

与 BigQuery 插槽预留类似,您可以在 ClickHouse Cloud 中[配置垂直和水平自动扩展](/manage/scaling#configuring-vertical-auto-scaling)。对于垂直自动扩展,您可以为服务的计算节点设置内存和 CPU 核心数的最小值和最大值。服务将在这些范围内根据需要自动扩展。这些设置在初始服务创建流程中也可配置。服务中的每个计算节点具有相同的规格。您可以通过[水平扩展](/manage/scaling#manual-horizontal-scaling)调整服务中计算节点的数量。

此外,与 BigQuery 配额类似,ClickHouse Cloud 提供并发控制、内存使用限制和 I/O 调度功能,使用户能够将查询隔离到不同的工作负载类别中。通过为特定工作负载类别设置共享资源(CPU 核心、DRAM、磁盘和网络 I/O)的限制,可以确保这些查询不会影响其他关键业务查询。并发控制可防止在高并发查询场景中出现线程过度订阅的情况。

ClickHouse 在服务器、用户和查询级别跟踪内存分配的字节大小,支持灵活的内存使用限制。内存超额分配功能允许查询使用超出保证内存的额外空闲内存,同时确保其他查询的内存限制不受影响。此外,可以限制聚合、排序和连接子句的内存使用量,当超出内存限制时允许回退到外部算法。

最后,I/O 调度功能允许用户根据最大带宽、进行中的请求数量和策略来限制工作负载类别对本地和远程磁盘的访问。

### 权限 {#permissions}

ClickHouse Cloud 在两个位置控制用户访问:通过[云控制台](/cloud/guides/sql-console/manage-sql-console-role-assignments)和通过[数据库](/cloud/security/manage-database-users)。控制台访问通过 [clickhouse.cloud](https://console.clickhouse.cloud) 用户界面进行管理。数据库访问通过数据库用户账户和角色进行管理。此外,可以为控制台用户授予数据库中的角色,使控制台用户能够通过我们的 [SQL 控制台](/integrations/sql-clients/sql-console)与数据库进行交互。


## 数据类型 {#data-types}

ClickHouse 在数值类型方面提供了更精细的精度控制。例如,BigQuery 提供了数值类型 [`INT64`、`NUMERIC`、`BIGNUMERIC` 和 `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。相比之下,ClickHouse 为十进制数、浮点数和整数提供了多种精度类型。通过这些数据类型,ClickHouse 用户可以优化存储和内存开销,从而实现更快的查询速度和更低的资源消耗。下表列出了每种 BigQuery 类型对应的 ClickHouse 等效类型:

| BigQuery                                                                                                 | ClickHouse                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)             | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)        | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)    | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)            | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)             | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)               | [Date32](/sql-reference/data-types/date32)(范围更窄)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)       | [DateTime](/sql-reference/data-types/datetime)、[DateTime64](/sql-reference/data-types/datetime64)(范围更窄,精度更高)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types) | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type)     | [地理数据类型](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)          | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)       | 不适用 - [支持作为表达式](/sql-reference/data-types/special-data-types/interval#usage-remarks)或[通过函数](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)               | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)           | [String(字节)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct) | [Tuple](/sql-reference/data-types/tuple)、[Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)               | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

当 ClickHouse 类型有多个选项时,请根据数据的实际范围选择所需的最小类型。此外,还应考虑使用[适当的编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)以进一步压缩数据。


## 查询加速技术 {#query-acceleration-techniques}

### 主键、外键和主索引 {#primary-and-foreign-keys-and-primary-index}

在 BigQuery 中,表可以具有[主键和外键约束](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)。通常,主键和外键在关系数据库中用于确保数据完整性。主键值通常对每一行都是唯一的,且不为 `NULL`。行中的每个外键值必须存在于主键表的主键列中,或者为 `NULL`。在 BigQuery 中,这些约束不会被强制执行,但查询优化器可能会利用这些信息来更好地优化查询。

在 ClickHouse 中,表也可以具有主键。与 BigQuery 类似,ClickHouse 不会强制要求表的主键列值具有唯一性。与 BigQuery 不同的是,表的数据在磁盘上按主键列[有序](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)存储。查询优化器利用这种排序顺序来避免重新排序、最小化连接操作的内存使用,并为 limit 子句启用短路优化。与 BigQuery 不同,ClickHouse 会根据主键列值自动创建[一个(稀疏)主索引](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。该索引用于加速所有包含主键列过滤条件的查询。ClickHouse 目前不支持外键约束。


## 二级索引(仅在 ClickHouse 中可用) {#secondary-indexes-only-available-in-clickhouse}

除了根据表的主键列值创建的主索引外,ClickHouse 还允许您在主键以外的列上创建二级索引。ClickHouse 提供了多种类型的二级索引,每种索引都适用于不同类型的查询:

- **布隆过滤器索引**:
  - 用于加速等值条件查询(例如 =、IN)。
  - 使用概率数据结构来判断数据块中是否存在某个值。
- **分词布隆过滤器索引**:
  - 与布隆过滤器索引类似,但用于分词字符串,适用于全文搜索查询。
- **最小-最大索引**:
  - 为每个数据部分维护列的最小值和最大值。
  - 有助于跳过不在指定范围内的数据部分的读取。


## 搜索索引 {#search-indexes}

与 BigQuery 中的[搜索索引](https://cloud.google.com/bigquery/docs/search-index)类似,ClickHouse 支持为字符串类型列创建[全文索引](/engines/table-engines/mergetree-family/invertedindexes)。


## 向量索引 {#vector-indexes}

BigQuery 最近推出了[向量索引](https://cloud.google.com/bigquery/docs/vector-index)作为 Pre-GA 功能。同样,ClickHouse 也提供了实验性的[索引支持来加速](/engines/table-engines/mergetree-family/annindexes)向量搜索场景。


## 分区 {#partitioning}

与 BigQuery 类似,ClickHouse 通过表分区来提升大型表的性能和可管理性,将表划分为更小、更易于管理的片段(称为分区)。关于 ClickHouse 分区的详细说明,请参阅[此处](/engines/table-engines/mergetree-family/custom-partitioning-key)。


## 聚簇 {#clustering}

通过聚簇功能,BigQuery 会根据指定列的值自动对表数据进行排序,并将其存放在大小优化的数据块中。聚簇可以提升查询性能,使 BigQuery 能够更准确地估算查询执行成本。使用聚簇列后,查询还可以避免扫描不必要的数据。

在 ClickHouse 中,数据会根据表的主键列自动[在磁盘上进行聚簇](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files),并在逻辑上组织成数据块,查询可以利用主索引数据结构快速定位或剪枝这些数据块。


## 物化视图 {#materialized-views}

BigQuery 和 ClickHouse 都支持物化视图——通过对基础表执行转换查询并预先计算结果,从而提高性能和效率。


## 查询物化视图 {#querying-materialized-views}

BigQuery 物化视图可以直接查询，也可以由优化器用于处理基表查询。如果基表的更改可能导致物化视图失效，则直接从基表读取数据。如果基表的更改不会导致物化视图失效，则从物化视图读取其余数据,仅从基表读取变更部分。

在 ClickHouse 中，物化视图只能直接查询。但是，与 BigQuery 相比(BigQuery 的物化视图在基表发生更改后 5 分钟内自动刷新，但刷新频率不超过[每 30 分钟](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)一次)，ClickHouse 的物化视图始终与基表保持同步。

**更新物化视图**

BigQuery 通过对基表执行视图的转换查询来定期完全刷新物化视图。在两次刷新之间，BigQuery 将物化视图的数据与基表的新数据结合，从而在继续使用物化视图的同时提供一致的查询结果。

在 ClickHouse 中，物化视图采用增量更新方式。这种增量更新机制具有高可扩展性和低计算成本的特点：增量更新的物化视图专为基表包含数十亿或数万亿行数据的场景而设计。ClickHouse 不需要反复查询不断增长的基表来刷新物化视图，而是仅根据新插入基表行的值计算部分结果。该部分结果会在后台与之前计算的部分结果进行增量合并。与从整个基表反复刷新物化视图相比，这种方式显著降低了计算成本。


## 事务 {#transactions}

与 ClickHouse 不同,BigQuery 支持在单个查询内或跨多个查询(使用会话时)的多语句事务。多语句事务允许您执行变更操作,例如在一个或多个表上插入或删除行,并以原子方式提交或回滚这些更改。多语句事务已列入 [ClickHouse 2024 年路线图](https://github.com/ClickHouse/ClickHouse/issues/58392)。


## 聚合函数 {#aggregate-functions}

与 BigQuery 相比,ClickHouse 内置了更多的聚合函数:

- BigQuery 提供了 [18 个聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)和 [4 个近似聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)。
- ClickHouse 拥有超过 [150 个预置聚合函数](/sql-reference/aggregate-functions/reference),以及强大的[聚合组合器](/sql-reference/aggregate-functions/combinators),可用于[扩展](https://www.youtube.com/watch?v=7ApwD0cfAFI)预置聚合函数的行为。例如,只需在调用时添加 [-Array 后缀](/sql-reference/aggregate-functions/combinators#-array),即可将这 150 多个预置聚合函数应用于数组而非表行。使用 [-Map 后缀](/sql-reference/aggregate-functions/combinators#-map)可以将任何聚合函数应用于映射。使用 [-ForEach 后缀](/sql-reference/aggregate-functions/combinators#-foreach)可以将任何聚合函数应用于嵌套数组。


## 数据源和文件格式 {#data-sources-and-file-formats}

与 BigQuery 相比,ClickHouse 支持的文件格式和数据源显著更多:

- ClickHouse 原生支持从几乎任何数据源加载 90 多种文件格式的数据
- BigQuery 支持 5 种文件格式和 19 种数据源


## SQL 语言特性 {#sql-language-features}

ClickHouse 提供标准 SQL 以及众多扩展和改进,使其更适合分析任务。例如,ClickHouse SQL [支持 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)和高阶函数,因此在应用转换时无需对数组进行 unnest/explode 操作。与 BigQuery 等其他系统相比,这是一个显著优势。


## 数组 {#arrays}

与 BigQuery 的 8 个数组函数相比,ClickHouse 拥有超过 80 个[内置数组函数](/sql-reference/functions/array-functions),能够优雅简洁地建模和解决各种问题。

ClickHouse 中的一个典型设计模式是使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数将表的特定行值(临时)转换为数组。然后可以通过数组函数方便地处理该数组,并通过 [`arrayJoin`](/sql-reference/functions/array-join) 聚合函数将结果转换回单独的表行。

由于 ClickHouse SQL 支持[高阶 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda),许多高级数组操作可以通过简单调用其中一个高阶内置数组函数来实现,而无需像 BigQuery 中经常[需要](https://cloud.google.com/bigquery/docs/arrays)的那样临时将数组转换回表,例如用于[过滤](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)或[合并](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)数组。在 ClickHouse 中,这些操作只需分别调用高阶函数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 和 [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 即可。

下面提供了从 BigQuery 到 ClickHouse 的数组操作映射:

| BigQuery                                                                                                         | ClickHouse                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)       | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)       | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)     | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)   | [range](/sql-reference/functions/array-functions#range)                                     |

**为子查询中的每一行创建包含一个元素的数组**

_BigQuery_

[ARRAY 函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

```sql
SELECT ARRAY
  (SELECT 1 UNION  ALL
   SELECT 2 UNION ALL
   SELECT 3) AS new_array;

/*-----------*
 | new_array |
 +-----------+
 | [1, 2, 3] |
 *-----------*/
```

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数

```sql
SELECT groupArray(*) AS new_array
FROM
(
    SELECT 1
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
)
   ┌─new_array─┐
1. │ [1,2,3]   │
   └───────────┘
```

**将数组转换为行集合**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符

```sql
SELECT *
FROM UNNEST(['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'])
  AS element
WITH OFFSET AS offset
ORDER BY offset;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

_ClickHouse_

[ARRAY JOIN](/sql-reference/statements/select/array-join) 子句


```sql
WITH ['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'] AS values
SELECT element, num-1 AS offset
FROM (SELECT values AS element) AS subquery
ARRAY JOIN element, arrayEnumerate(element) AS num;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

**返回日期数组**

*BigQuery*

[GENERATE&#95;DATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 函数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 函数组合

*ClickHouse*

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**返回时间戳数组**

*BigQuery*

[GENERATE&#95;TIMESTAMP&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 函数

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

*ClickHouse*

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 函数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

查询 id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**筛选数组**

*BigQuery*

需要先通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符，将数组临时转换回表

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT
  ARRAY(SELECT x * 2
        FROM UNNEST(some_numbers) AS x
        WHERE x < 5) AS doubled_less_than_five
FROM Sequences;

/*------------------------*
 | doubled_less_than_five |
 +------------------------+
 | [0, 2, 2, 4, 6]        |
 | [4, 8]                 |
 | []                     |
 *------------------------*/
```

*ClickHouse*


[arrayFilter](/sql-reference/functions/array-functions#arrayFilter) 函数

```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT arrayMap(x -> (x * 2), arrayFilter(x -> (x < 5), some_numbers)) AS doubled_less_than_five
FROM Sequences;
   ┌─doubled_less_than_five─┐
1. │ [0,2,2,4,6]            │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
2. │ []                     │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
3. │ [4,8]                  │
   └────────────────────────┘
```

**数组拉链操作（Zipping arrays）**

*BigQuery*

需要先通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组临时转换回表

```sql
WITH
  Combinations AS (
    SELECT
      ['a', 'b'] AS letters,
      [1, 2, 3] AS numbers
  )
SELECT
  ARRAY(
    SELECT AS STRUCT
      letters[SAFE_OFFSET(index)] AS letter,
      numbers[SAFE_OFFSET(index)] AS number
    FROM Combinations
    CROSS JOIN
      UNNEST(
        GENERATE_ARRAY(
          0,
          LEAST(ARRAY_LENGTH(letters), ARRAY_LENGTH(numbers)) - 1)) AS index
    ORDER BY index
  );

/*------------------------------*
 | pairs                        |
 +------------------------------+
 | [{ letter: "a", number: 1 }, |
 |  { letter: "b", number: 2 }] |
 *------------------------------*/
```

*ClickHouse*

[arrayZip](/sql-reference/functions/array-functions#arrayZip) 函数

```sql
WITH Combinations AS
    (
        SELECT
            ['a', 'b'] AS letters,
            [1, 2, 3] AS numbers
    )
SELECT arrayZip(letters, arrayResize(numbers, length(letters))) AS pairs
FROM Combinations;
   ┌─pairs─────────────┐
1. │ [('a',1),('b',2)] │
   └───────────────────┘
```

**数组聚合**

*BigQuery*

需要先通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组展开/转换回表

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT some_numbers,
  (SELECT SUM(x)
   FROM UNNEST(s.some_numbers) AS x) AS sums
FROM Sequences AS s;

/*--------------------+------*
 | some_numbers       | sums |
 +--------------------+------+
 | [0, 1, 1, 2, 3, 5] | 12   |
 | [2, 4, 8, 16, 32]  | 62   |
 | [5, 10]            | 15   |
 *--------------------+------*/
```

*ClickHouse*

[arraySum](/sql-reference/functions/array-functions#arraySum)、[arrayAvg](/sql-reference/functions/array-functions#arrayAvg) 等函数，或者现有的 90 多种聚合函数中的任意一个名称，作为 [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 函数的参数


```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT
    some_numbers,
    arraySum(some_numbers) AS sums
FROM Sequences;
   ┌─some_numbers──┬─sums─┐
1. │ [0,1,1,2,3,5] │   12 │
   └───────────────┴──────┘
   ┌─some_numbers──┬─sums─┐
2. │ [2,4,8,16,32] │   62 │
   └───────────────┴──────┘
   ┌─some_numbers─┬─sums─┐
3. │ [5,10]       │   15 │
   └──────────────┴──────┘
```
