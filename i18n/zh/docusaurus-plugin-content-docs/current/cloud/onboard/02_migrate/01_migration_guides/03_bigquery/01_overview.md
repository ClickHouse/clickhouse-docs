---
title: 'BigQuery 与 ClickHouse Cloud 对比'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQuery 与 ClickHouse Cloud 有哪些不同'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '概览'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';

# ClickHouse Cloud 与 BigQuery 对比  {#comparing-clickhouse-cloud-and-bigquery}

## 资源组织 {#resource-organization}

ClickHouse Cloud 中资源的组织方式与 [BigQuery 的资源层级结构](https://cloud.google.com/bigquery/docs/resource-hierarchy)类似。下面基于下图（展示 ClickHouse Cloud 资源层级结构）说明具体差异：

<Image img={bigquery_1} size="md" alt="Resource organizations"/>

### 组织 {#organizations}

与 BigQuery 类似，组织是 ClickHouse Cloud 资源层级结构中的根节点。你在 ClickHouse Cloud 账户中创建的第一个用户会被自动分配到一个由该用户拥有的组织中。该用户可以邀请其他用户加入该组织。

### BigQuery Projects 与 ClickHouse Cloud Services 的对比 {#bigquery-projects-vs-clickhouse-cloud-services}

在组织内，你可以创建与 BigQuery projects 大致等价的服务，因为存储在 ClickHouse Cloud 中的数据是与某个服务关联的。ClickHouse Cloud 中提供了[多种服务类型](/cloud/manage/cloud-tiers)。每个 ClickHouse Cloud 服务部署在特定区域，并包含：

1. 一组计算节点（当前 Development 层级服务为 2 个节点，Production 层级服务为 3 个节点）。对于这些节点，ClickHouse Cloud [支持纵向和横向扩缩容](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，既可手动也可自动完成。
2. 一个对象存储目录，用于保存该服务的所有数据。
3. 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点）——用于连接到该服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery Datasets 与 ClickHouse Cloud Databases 的对比 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse 以数据库的形式对表进行逻辑分组。与 BigQuery datasets 类似，ClickHouse 数据库是逻辑容器，用于组织表数据并控制对其的访问。

### BigQuery Folders {#bigquery-folders}

ClickHouse Cloud 当前没有与 BigQuery folders 等价的概念。

### BigQuery Slot reservations 和 Quotas {#bigquery-slot-reservations-and-quotas}

与 BigQuery slot reservations 类似，你可以在 ClickHouse Cloud 中[配置纵向和横向自动扩缩容](/manage/scaling#configuring-vertical-auto-scaling)。对于纵向自动扩缩容，你可以为某个服务的计算节点设置内存和 CPU 核心数的最小值和最大值。随后，服务会在这些边界内按需扩缩容。这些设置也可以在初始创建服务的流程中配置。服务中的每个计算节点规格相同。你可以通过[横向扩缩容](/manage/scaling#manual-horizontal-scaling)更改服务中的计算节点数量。

此外，与 BigQuery quotas 类似，ClickHouse Cloud 提供并发控制、内存使用限制和 I/O 调度，使用户能够将查询隔离到不同的工作负载类别中。通过对特定工作负载类别设置共享资源（CPU 核心、DRAM、磁盘和网络 I/O）的限制，可确保这些查询不会影响其他关键业务查询。并发控制可在高并发查询场景中防止线程过度订阅。

ClickHouse 会在服务器级、用户级和查询级跟踪内存分配的字节大小，从而支持灵活的内存使用限制。内存超分配允许查询在保证内存之外使用额外的空闲内存，同时仍然保证其他查询的内存限制。此外，还可以限制聚合、排序和连接子句的内存使用，在超出内存限制时回退到外部算法。

最后，I/O 调度允许用户基于最大带宽、在途请求数量和策略，对工作负载类别的本地和远程磁盘访问进行限制。

### 权限 {#permissions}

ClickHouse Cloud 在两个层面控制用户访问：通过[云控制台](/cloud/guides/sql-console/manage-sql-console-role-assignments)以及通过[数据库](/cloud/security/manage-database-users)。控制台访问通过 [clickhouse.cloud](https://console.clickhouse.cloud) 用户界面进行管理。数据库访问通过数据库用户账户和角色进行管理。此外，可以在数据库中为控制台用户授予角色，使其能够通过我们的 [SQL 控制台](/integrations/sql-clients/sql-console) 与数据库交互。

## 数据类型 {#data-types}

ClickHouse 在数值类型方面提供了更细粒度的精度控制。比如，BigQuery 提供的数值类型包括 [`INT64`、`NUMERIC`、`BIGNUMERIC` 和 `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。相比之下，ClickHouse 为小数、浮点数和整数提供了多种精度等级的类型。借助这些数据类型，ClickHouse 用户可以优化存储与内存开销，从而实现更快的查询和更低的资源消耗。下面我们为每种 BigQuery 类型给出对应的 ClickHouse 等价类型：

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32)（范围更窄）                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime)、[DateTime64](/sql-reference/data-types/datetime64)（范围较窄，精度更高）                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | 不适用（NA）— [作为表达式支持](/sql-reference/data-types/special-data-types/interval#usage-remarks) 或 [通过函数支持](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String（字节序列）](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple)、[Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

在有多种 ClickHouse 类型可选时，应根据数据的实际取值范围选择满足需求的最小类型。同时，考虑使用[合适的编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)，以进一步提高压缩效果。

## 查询加速技术 {#query-acceleration-techniques}

### 主键、外键和主索引 {#primary-and-foreign-keys-and-primary-index}

在 BigQuery 中，表可以具有[主键和外键约束](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)。通常，主键和外键在关系型数据库中用于确保数据完整性。主键值通常对每一行都是唯一的，且不为 `NULL`。一行中的每个外键值必须存在于主键表的主键列中，或为 `NULL`。在 BigQuery 中，这些约束不会被强制执行，但查询优化器可以利用这些信息更好地优化查询。

在 ClickHouse 中，表也可以具有主键。与 BigQuery 一样，ClickHouse 不会对表的主键列值强制唯一性。与 BigQuery 不同的是，表数据在磁盘上按照主键列[排序](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)进行存储。查询优化器会利用这一排序来避免重新排序、最小化连接所需的内存使用，并支持对 `LIMIT` 子句进行短路执行。与 BigQuery 不同，ClickHouse 会基于主键列值自动创建[（稀疏）主索引](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。该索引用于加速所有包含针对主键列过滤条件的查询。ClickHouse 目前不支持外键约束。

## 二级索引（仅在 ClickHouse 中可用） {#secondary-indexes-only-available-in-clickhouse}

除了基于表主键列值创建的主索引之外，ClickHouse 还允许你在非主键列上创建二级索引。ClickHouse 提供多种类型的二级索引，每种都适用于不同类型的查询：

- **Bloom 过滤器索引（Bloom Filter Index）**：
  - 用于加速带有等值条件（例如 =、IN）的查询。
  - 使用概率型数据结构来判断某个值是否存在于数据块中。
- **Token Bloom 过滤器索引（Token Bloom Filter Index）**：
  - 类似于 Bloom 过滤器索引，但用于分词后的字符串，适合全文搜索查询。
- **最小-最大索引（Min-Max Index）**：
  - 为每个数据部分维护某列的最小值和最大值。
  - 有助于跳过读取不在指定范围内的数据部分。

## 搜索索引 {#search-indexes}

类似于 BigQuery 中的[搜索索引](https://cloud.google.com/bigquery/docs/search-index)，可以在字符串类型列上为 ClickHouse 表创建[全文索引](/engines/table-engines/mergetree-family/invertedindexes)。

## 向量索引 {#vector-indexes}

BigQuery 最近以 Pre-GA 功能的形式推出了[向量索引](https://cloud.google.com/bigquery/docs/vector-index)。同样，ClickHouse 也对[用于加速向量搜索的索引](/engines/table-engines/mergetree-family/annindexes)提供了实验性支持，以满足向量搜索用例的需求。

## 分区 {#partitioning}

与 BigQuery 类似，ClickHouse 使用表分区来提升大表的性能和可管理性，它通过将表划分为更小、更易管理的部分（称为分区）来实现这一点。我们在[此处](/engines/table-engines/mergetree-family/custom-partitioning-key)对 ClickHouse 分区进行了详细说明。

## 分簇 {#clustering}

通过分簇，BigQuery 会根据若干指定列的取值自动对表数据进行排序，并将其共置在大小最优的数据块中。分簇可以提升查询性能，使 BigQuery 更好地估算运行查询的成本。使用分簇列后，查询还能避免扫描不必要的数据。

在 ClickHouse 中，数据会根据表的主键列在磁盘上自动[进行分簇](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)，并在逻辑上组织为若干块。利用主索引数据结构的查询可以快速定位或裁剪这些数据块。

## 物化视图 {#materialized-views}

BigQuery 和 ClickHouse 都支持物化视图——基于对基础表执行转换查询的预计算结果，用于提升性能和效率。

## 查询物化视图 {#querying-materialized-views}

BigQuery 的物化视图可以被直接查询，或者由优化器用于处理对基础表的查询。如果对基础表的更改可能使物化视图失效，则直接从基础表读取数据。如果对基础表的更改不会使物化视图失效，则其余数据将从物化视图中读取，只有发生更改的部分会从基础表中读取。

在 ClickHouse 中，物化视图只能被直接查询。不过，与 BigQuery 不同（在 BigQuery 中，物化视图会在基础表发生更改后 5 分钟内自动刷新，但刷新频率不会高于[每 30 分钟一次](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)），ClickHouse 中的物化视图始终与基础表保持同步。

**更新物化视图**

BigQuery 会定期通过针对基础表运行视图的转换查询来完全刷新物化视图。在两次刷新之间的时间内，BigQuery 会将物化视图中的数据与新的基础表数据进行合并，以在利用物化视图的同时提供一致的查询结果。

在 ClickHouse 中，物化视图是增量更新的。这种增量更新机制提供了高可扩展性和低计算成本：增量更新的物化视图专门为基础表包含数十亿或数万亿行数据的场景而设计。ClickHouse 无需为了刷新物化视图而反复查询不断增长的基础表，而是仅基于新插入到基础表中的行的值计算一个局部结果。这个局部结果会在后台与之前计算的局部结果进行增量合并。与反复基于整个基础表刷新物化视图相比，这种方式能显著降低计算成本。

## 事务 {#transactions}

与 ClickHouse 相比，BigQuery 支持在单个查询中使用多语句事务，或在使用会话时跨多个查询使用多语句事务。多语句事务允许你对一个或多个表执行插入或删除行等变更操作，并以原子方式提交或回滚这些更改。[ClickHouse 的 2024 年路线图](https://github.com/ClickHouse/ClickHouse/issues/58392)中包含对多语句事务的支持。

## 聚合函数 {#aggregate-functions}

与 BigQuery 相比，ClickHouse 提供了数量多得多的内置聚合函数：

- BigQuery 提供了 [18 个聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)，以及 [4 个近似聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)。
- ClickHouse 拥有超过 [150 个内置聚合函数](/sql-reference/aggregate-functions/reference)，并提供强大的 [聚合组合器（aggregation combinators）](/sql-reference/aggregate-functions/combinators)，用于[扩展](https://www.youtube.com/watch?v=7ApwD0cfAFI)这些内置聚合函数的行为。比如，你可以通过在函数名后添加 [-Array 后缀](/sql-reference/aggregate-functions/combinators#-array)，将这 150 多个内置聚合函数应用到数组而不是表的行上。使用 [-Map 后缀](/sql-reference/aggregate-functions/combinators#-map) 可以将任意聚合函数应用于 Map。使用 [-ForEach 后缀](/sql-reference/aggregate-functions/combinators#-foreach)，可以将任意聚合函数应用于嵌套数组。

## 数据源和文件格式 {#data-sources-and-file-formats}

与 BigQuery 相比，ClickHouse 在文件格式和数据源方面的支持要丰富得多：

- ClickHouse 原生支持以 90 多种文件格式从几乎任意数据源加载数据
- BigQuery 仅支持 5 种文件格式和 19 种数据源

## SQL 语言特性 {#sql-language-features}

ClickHouse 提供了标准 SQL，并在此基础上进行了大量扩展和改进，使其更适合分析型任务。例如，ClickHouse SQL [支持 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)和高阶函数，因此在进行各种转换时，你无需先对数组执行 unnest/explode 展开操作。这相较于 BigQuery 等其他系统是一个显著优势。

## 数组 {#arrays}

与 BigQuery 仅有 8 个数组函数相比，ClickHouse 提供了 80 多个[内置数组函数](/sql-reference/functions/array-functions)，可以优雅而简洁地对各种问题进行建模和求解。

在 ClickHouse 中，一个典型的设计模式是使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数，将表中某些行的值（临时）转换为数组。随后可以通过数组函数方便地进行处理，并且再通过 [`arrayJoin`](/sql-reference/functions/array-join) 聚合函数将结果转换回单独的表行。

由于 ClickHouse SQL 支持[高阶 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)，许多高级数组操作只需调用一个高阶内置数组函数即可完成，而不必像在 BigQuery 中那样，经常[需要](https://cloud.google.com/bigquery/docs/arrays)先临时将数组转换回表，例如对数组进行[过滤](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)或[拉链合并（zipping）](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)。在 ClickHouse 中，这些操作仅需简单调用高阶函数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 和 [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 即可分别完成。

下面给出了 BigQuery 与 ClickHouse 之间数组操作的对应关系：

| BigQuery                                                                                                                 | ClickHouse                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [ARRAY&#95;CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)           | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY&#95;LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)           | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY&#95;REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)         | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY&#95;TO&#95;STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)       | [range](/sql-reference/functions/array-functions#range)                                     |

**为子查询中的每一行创建一个只包含一个元素的数组**

*BigQuery*

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

*ClickHouse*

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

**将数组展开为多行数据**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符

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

*ClickHouse*

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

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 函数

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

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**过滤数组**

*BigQuery*

需要先通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组临时还原为表

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

**压缩数组（zipping arrays）**

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

**聚合数组**

*BigQuery*

需要使用 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组展开回表

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

[arraySum](/sql-reference/functions/array-functions#arraySum)、[arrayAvg](/sql-reference/functions/array-functions#arrayAvg) 等函数，或者 90 多种任一已有聚合函数的名称，作为 [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 函数的参数

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
