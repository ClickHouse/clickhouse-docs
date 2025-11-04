---
'title': 'BigQuery vs ClickHouse Cloud'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'BigQuery 如何与 ClickHouse Cloud 不同'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '概述'
'doc_type': 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# 比较 ClickHouse Cloud 和 BigQuery

## 资源组织 {#resource-organization}

ClickHouse Cloud 中资源的组织方式类似于 [BigQuery 的资源层次结构](https://cloud.google.com/bigquery/docs/resource-hierarchy)。我们根据下面的图示描述具体的差异，展示 ClickHouse Cloud 的资源层次结构：

<Image img={bigquery_1} size="md" alt="资源组织"/>

### 组织 {#organizations}

与 BigQuery 相似，组织是 ClickHouse Cloud 资源层次结构中的根节点。在您的 ClickHouse Cloud 账户中设置的第一个用户会自动分配到由该用户拥有的组织中。该用户可以邀请其他用户加入该组织。

### BigQuery 项目与 ClickHouse Cloud 服务 {#bigquery-projects-vs-clickhouse-cloud-services}

在组织内部，您可以创建大致相当于 BigQuery 项目的服务，因为在 ClickHouse Cloud 中存储的数据与服务相关联。ClickHouse Cloud 中有 [几种服务类型可用](/cloud/manage/cloud-tiers)。每个 ClickHouse Cloud 服务在特定区域中部署，包括：

1. 一组计算节点（当前，开发层服务为 2 个节点，生产层服务为 3 个节点）。对于这些节点，ClickHouse Cloud [支持垂直和水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，支持手动和自动扩展。
2. 一个对象存储文件夹，用于服务存储所有数据。
3. 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点） - 您用来连接服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery 数据集与 ClickHouse Cloud 数据库 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse 将表逻辑上分组到数据库中。与 BigQuery 数据集类似，ClickHouse 数据库是逻辑容器，用于组织和控制对表数据的访问。

### BigQuery 文件夹 {#bigquery-folders}

ClickHouse Cloud 当前没有与 BigQuery 文件夹相对应的概念。

### BigQuery 插槽保留和配额 {#bigquery-slot-reservations-and-quotas}

与 BigQuery 插槽保留类似，您可以在 ClickHouse Cloud 中 [配置垂直和水平自动扩展](/manage/scaling#configuring-vertical-auto-scaling)。对于垂直自动扩展，您可以设置服务的计算节点的内存和 CPU 核心的最小和最大大小。然后，服务将在这些范围内根据需要进行扩展。这些设置在初始服务创建流程中也可用。服务中的每个计算节点具有相同的大小。您可以通过 [水平扩展](/manage/scaling#manual-horizontal-scaling) 更改服务中的计算节点数量。

此外，类似于 BigQuery 配额，ClickHouse Cloud 提供并发控制、内存使用限制和 I/O 调度，允许用户将查询隔离到工作负载类别中。通过为特定工作负载类限制共享资源（CPU 核心、DRAM、磁盘和网络 I/O），确保这些查询不会影响其他关键业务查询。在并发查询数量较高的情况下，并发控制可防止线程过度分配。

ClickHouse 在服务器、用户和查询级别跟踪内存分配的字节大小，允许灵活的内存使用限制。内存过度分配使查询能够使用超出保证内存的额外空闲内存，同时确保其他查询的内存限制。此外，聚合、排序和连接子句的内存使用也可以被限制，当超过内存限制时，允许回退到外部算法。

最后，I/O 调度允许用户根据最大带宽、在途请求和策略限制工作负载类的本地和远程磁盘访问。

### 权限 {#permissions}

ClickHouse Cloud [控制用户访问](/cloud/security/cloud-access-management) 有两个地方，通过 [云控制台](/cloud/get-started/sql-console) 和通过数据库。控制台访问是通过 [clickhouse.cloud](https://console.clickhouse.cloud) 用户界面进行管理的。数据库访问是通过数据库用户账户和角色进行管理的。此外，可以在数据库中授予控制台用户角色，使其能够通过我们的 [SQL 控制台](/integrations/sql-clients/sql-console) 与数据库交互。

## 数据类型 {#data-types}

ClickHouse 在数值方面提供了更细粒度的精度。例如，BigQuery 提供的数值类型 [`INT64`，`NUMERIC`，`BIGNUMERIC` 和 `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。与此相比，ClickHouse 为小数、浮点数和整数提供了多种精度类型。利用这些数据类型，ClickHouse 用户可以优化存储和内存开销，从而实现更快的查询和较低的资源消耗。以下是 BigQuery 类型与对应的 ClickHouse 类型的映射：

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S)，Decimal32(S)，Decimal64(S)，Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) （范围更小）                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime)，[DateTime64](/sql-reference/data-types/datetime64) （范围更小，精度更高）                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo 数据类型](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8，UInt16，UInt32，UInt64，UInt128，UInt256，Int8，Int16，Int32，Int64，Int128，Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | 不适用 - [作为表达式支持](/sql-reference/data-types/special-data-types/interval#usage-remarks) 或 [通过函数支持](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple)，[Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

在 ClickHouse 类型的多个选项中，请考虑数据的实际范围并选择最低要求。此外，考虑利用 [适当的编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 进行进一步的压缩。

## 查询加速技术 {#query-acceleration-techniques}

### 主键和外键及主索引 {#primary-and-foreign-keys-and-primary-index}

在 BigQuery 中，表可以具有 [主键和外键约束](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)。通常，主键和外键用于关系型数据库以确保数据完整性。主键值通常对每一行都是唯一的，并且不能为 `NULL`。在一行中的每个外键值必须存在于主键表的主键列中或者为 `NULL`。在 BigQuery 中，这些约束不会被强制执行，但查询优化器可能使用此信息来更好地优化查询。

在 ClickHouse 中，表也可以有主键。与 BigQuery 相同，ClickHouse 并不强制执行表的主键列值的唯一性。不像 BigQuery，表的数据在磁盘上根据主键列 [有序存储](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)。查询优化器利用这种排序顺序来防止重新排序，尽量减少连接的内存使用，并启用限值子句的短路。与 BigQuery 不同，ClickHouse 自动根据主键列值创建 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。该索引用于加速所有包含对主键列的过滤条件的查询。目前，ClickHouse 不支持外键约束。

## 辅助索引（仅在 ClickHouse 可用） {#secondary-indexes-only-available-in-clickhouse}

除了根据表的主键列值创建的主索引外，ClickHouse 还允许您在主键以外的列上创建辅助索引。ClickHouse 提供几种类型的辅助索引，每种索引都适用于不同类型的查询：

- **布隆过滤器索引**：
  - 用于加速具有相等条件的查询（例如，=，IN）。
  - 使用概率数据结构来确定值是否存在于数据块中。
- **令牌布隆过滤器索引**：
  - 类似于布隆过滤器索引，但用于标记字符串并适合全文搜索查询。
- **最小-最大索引**：
  - 为每个数据部分维护列的最小和最大值。
  - 有助于跳过读取不在指定范围内的数据部分。

## 搜索索引 {#search-indexes}

类似于 BigQuery 中的 [搜索索引](https://cloud.google.com/bigquery/docs/search-index)，可以为 ClickHouse 表的字符串值列创建 [全文索引](/engines/table-engines/mergetree-family/invertedindexes)。

## 向量索引 {#vector-indexes}

BigQuery 最近推出了 [向量索引](https://cloud.google.com/bigquery/docs/vector-index) 作为预发布功能。同样，ClickHouse 也对加速 [向量搜索用例的索引](https://engines/table-engines/mergetree-family/annindexes) 提供实验性支持。

## 分区 {#partitioning}

与 BigQuery 相似，ClickHouse 使用表分区来提升大型表的性能和可管理性，通过将表分成称为分区的小块，使其更易于管理。我们在 [此处](/engines/table-engines/mergetree-family/custom-partitioning-key) 详细描述 ClickHouse 分区。

## 聚类 {#clustering}

通过聚类，BigQuery 根据指定几列的值自动对表数据进行排序，并将其放置在最佳大小的块中。聚类提高了查询性能，使 BigQuery 更好地估算运行查询的成本。使用聚类列，查询还消除了对不必要数据的扫描。

在 ClickHouse 中，数据会根据表的主键列 [自动聚类到磁盘上](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)，并在逻辑上以块组织，这些块可以通过利用主索引数据结构快速定位或修剪。

## 物化视图 {#materialized-views}

无论是 BigQuery 还是 ClickHouse，都支持物化视图 – 基于对基础表的转换查询结果的预计算结果，以提高性能和效率。

## 查询物化视图 {#querying-materialized-views}

BigQuery 物化视图可以直接查询或由优化器使用以处理对基础表的查询。如果对基础表的更改可能使物化视图失效，则数据将直接从基础表读取。如果对基础表的更改不会使物化视图失效，则其余数据将从物化视图中读取，仅更改部分将从基础表中读取。

在 ClickHouse 中，物化视图只能直接查询。然而，与 BigQuery （其中物化视图会在对基础表进行更改后在 5 分钟内自动刷新，但不会频繁于 [每 30 分钟](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)）相比，物化视图始终与基础表保持同步。

**更新物化视图**

BigQuery 定期通过对基础表运行视图的转换查询来完全刷新物化视图。在刷新之间，BigQuery 将物化视图的数据与新基础表数据结合，以提供一致的查询结果，同时仍然使用物化视图。

在 ClickHouse 中，物化视图是增量更新的。这种增量更新机制提供了高可扩展性和低计算成本：增量更新的物化视图专为基础表包含数十亿或数万亿行的场景而设计。ClickHouse 不是反复查询不断增长的基础表以刷新物化视图，而是简单计算新插入的基础表行（仅）的部分结果。这个部分结果会在后台与之前计算的部分结果增量合并。这与反复从整个基础表刷新物化视图相比，大大降低了计算成本。

## 事务 {#transactions}

与 ClickHouse 相比，BigQuery 支持在单个查询中或在使用会话时跨多个查询进行多语句事务。多语句事务允许您对一个或多个表执行更改操作，如插入或删除行，并以原子方式提交或回滚更改。多语句事务在 [ClickHouse 的 2024 年路线图](https://github.com/ClickHouse/ClickHouse/issues/58392) 中。

## 聚合函数 {#aggregate-functions}

与 BigQuery 相比，ClickHouse 提供了显著更多的内置聚合函数：

- BigQuery 提供 [18 个聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)，和 [4 个近似聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)。
- ClickHouse 具有超过 [150 个预构建的聚合函数](/sql-reference/aggregate-functions/reference)，以及强大的 [聚合组合器](/sql-reference/aggregate-functions/combinators)，用于 [扩展](https://www.youtube.com/watch?v=7ApwD0cfAFI) 预构建聚合函数的行为。例如，您可以通过调用具有 [-Array 后缀](/sql-reference/aggregate-functions/combinators#-array) 的函数将超过 150 个预构建的聚合函数应用于数组，而不是表行。使用 [-Map 后缀](/sql-reference/aggregate-functions/combinators#-map)，您可以将任何聚合函数应用于映射。使用 [-ForEach 后缀](/sql-reference/aggregate-functions/combinators#-foreach)，您可以将任何聚合函数应用于嵌套数组。

## 数据源和文件格式 {#data-sources-and-file-formats}

与 BigQuery 相比，ClickHouse 支持显著更多的文件格式和数据源：

- ClickHouse 原生支持从几乎所有数据源加载 90 多种文件格式的数据
- BigQuery 支持 5 种文件格式和 19 种数据源

## SQL 语言特性 {#sql-language-features}

ClickHouse 提供标准的 SQL 及许多扩展和改进，使其在分析任务中更加友好。例如，ClickHouse SQL [支持 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda) 和高阶函数，因此在应用转换时无需对数组进行展开。与 BigQuery 等其他系统相比，这是一个很大的优势。

## 数组 {#arrays}

与 BigQuery 的 8 个数组函数相比，ClickHouse 具有超过 80 个 [内置数组函数](/sql-reference/functions/array-functions)，可优雅且简单地建模和解决各种问题。

ClickHouse 中的典型设计模式是使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数（暂时）将表的特定行值转换为数组。然后可以通过数组函数方便地处理该数组，结果可以通过 [`arrayJoin`](/sql-reference/functions/array-join) 聚合函数转换回单独的表行。

由于 ClickHouse SQL 支持 [高阶 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)，许多高级数组操作可以通过简单调用其中一个内置的高阶数组函数来实现，而不必将数组暂时转换回表，这在 BigQuery 中经常是 [必需的](https://cloud.google.com/bigquery/docs/arrays)，例如用于 [过滤](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) 或 [压缩](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) 数组。在 ClickHouse 中，这些操作只是对高阶函数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 和 [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 的简单函数调用。

以下是 BigQuery 到 ClickHouse 的数组操作映射：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#range) |

**创建一个包含子查询中每行一个元素的数组**

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

**将数组转换为一组行**

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

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 函数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 函数

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**返回时间戳数组**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 函数

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 函数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**过滤数组**

_BigQuery_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符将数组暂时转换回表

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

_ClickHouse_

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

**压缩数组**

_BigQuery_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符将数组暂时转换回表

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

_ClickHouse_

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

_BigQuery_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符将数组转换回表

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

_ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraySum)、[arrayAvg](/sql-reference/functions/array-functions#arrayAvg) 等函数，或任何超过 90 个现有聚合函数名称作为 [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 函数的参数

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
