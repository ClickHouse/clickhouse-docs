---
'title': 'BigQuery与ClickHouse Cloud的比较'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'BigQuery与ClickHouse Cloud之间的差异'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';

# BigQuery 与 ClickHouse Cloud：等效与不同概念

## 资源组织 {#resource-organization}

在 ClickHouse Cloud 中，资源的组织方式与 [BigQuery 的资源层次结构](https://cloud.google.com/bigquery/docs/resource-hierarchy) 相似。我们将根据以下图示描述 ClickHouse Cloud 资源层次结构的具体差异：

<Image img={bigquery_1} size="md" alt="Resource organizations"/>

### 组织 {#organizations}

类似于 BigQuery，组织是 ClickHouse Cloud 资源层次结构中的根节点。您在 ClickHouse Cloud 帐户中设置的第一个用户会自动分配到用户拥有的组织。用户可以邀请其他用户加入组织。

### BigQuery 项目 vs ClickHouse Cloud 服务 {#bigquery-projects-vs-clickhouse-cloud-services}

在组织内，您可以创建与 BigQuery 项目相对松散的服务，因为存储在 ClickHouse Cloud 中的数据与服务相关联。ClickHouse Cloud 中有 [几种服务类型可用](/cloud/manage/cloud-tiers)。每个 ClickHouse Cloud 服务都部署在特定区域，并包括：

1. 一组计算节点（当前，开发层服务为 2 个节点，生产层服务为 3 个节点）。对于这些节点，ClickHouse Cloud [支持垂直和水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，包括手动和自动扩展。
2. 一个对象存储文件夹，服务在其中存储所有数据。
3. 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点） - 用于连接到服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。

### BigQuery 数据集 vs ClickHouse Cloud 数据库 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse 将表逻辑上分组到数据库中。与 BigQuery 数据集类似，ClickHouse 数据库是用于组织和控制表数据访问的逻辑容器。

### BigQuery 文件夹 {#bigquery-folders}

ClickHouse Cloud 目前没有与 BigQuery 文件夹相当的概念。

### BigQuery 槽预约和配额 {#bigquery-slot-reservations-and-quotas}

与 BigQuery 槽预约类似，您可以在 ClickHouse Cloud 中 [配置垂直和水平自动扩展](/manage/scaling#configuring-vertical-auto-scaling)。对于垂直自动扩展，您可以设置计算节点的内存和 CPU 核心的最小和最大尺寸。服务将根据需要在这些范围内进行扩展。这些设置在初始服务创建流程中也可用。服务中的每个计算节点都具有相同的尺寸。您可以通过 [水平扩展](/manage/scaling#manual-horizontal-scaling) 更改服务中的计算节点数量。

此外，类似于 BigQuery 配额，ClickHouse Cloud 提供并发控制、内存使用限制和 I/O 调度，允许用户根据工作负载类别隔离查询。通过为特定工作负载类别设置共享资源（CPU 核心、DRAM、磁盘和网络 I/O）的限制，确保这些查询不会影响其他关键业务查询。在并发查询数量较多的情况下，并发控制防止线程过度使用。

ClickHouse 跟踪服务器、用户和查询级别的内存分配字节大小，允许灵活的内存使用限制。内存过度提交使查询能够使用超出保证内存的额外空闲内存，同时确保其他查询的内存限制。此外，可以限制聚合、排序和连接子句的内存使用，允许在超过内存限制时回退到外部算法。

最后，I/O 调度允许用户限制工作负载类别的本地和远程磁盘访问，基于最大带宽、在途请求和策略。

### 权限 {#permissions}

ClickHouse Cloud [在两个地方控制用户访问](/cloud/security/cloud-access-management)，通过 [云控制台](/cloud/get-started/sql-console) 和通过数据库。控制台访问通过 [clickhouse.cloud](https://console.clickhouse.cloud) 用户界面进行管理。数据库访问通过数据库用户账户和角色进行管理。此外，可以在数据库中授予控制台用户角色，允许控制台用户通过我们的 [SQL 控制台](/integrations/sql-clients/sql-console) 与数据库进行交互。

## 数据类型 {#data-types}

ClickHouse 在数值方面提供了更细粒度的精度。例如，BigQuery 提供的数值类型有 [`INT64`, `NUMERIC`, `BIGNUMERIC` 和 `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。与此对比，ClickHouse 为十进制、浮点数和整数提供了多种精度类型。借助这些数据类型，ClickHouse 用户可以优化存储和内存开销，从而实现更快的查询和更低的资源消耗。以下是每个 BigQuery 类型对应的 ClickHouse 类型映射：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (范围较窄) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (范围较窄，精度更高) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [通过表达式支持](/sql-reference/data-types/special-data-types/interval#usage-remarks) 或 [通过函数支持](/sql-reference/functions/date-time-functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

在呈现多个 ClickHouse 类型选项时，请考虑数据的实际范围，并选择最低的要求。此外，还可以考虑利用 [适当的编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 以进一步压缩。

## 查询加速技术 {#query-acceleration-techniques}

### 主键和外键以及主索引 {#primary-and-foreign-keys-and-primary-index}

在 BigQuery 中，表可以有 [主键和外键约束](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)。通常，主键和外键在关系数据库中用于确保数据完整性。主键值通常对每行都是唯一的，并且不能为 `NULL`。每个行的外键值必须存在于主键表的主键列中，或者为 `NULL`。在 BigQuery 中，这些约束并未强加，但查询优化器可能会使用此信息来优化查询。

在 ClickHouse 中，表也可以有一个主键。与 BigQuery 相似，ClickHouse 不会强制要表主键列值的唯一性。不像 BigQuery，表的数据在磁盘上按主键列值 [有序存储](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)。查询优化器利用此排序方案来防止重排序，以降低连接的内存使用，并启用限流子句的短路。在 ClickHouse 中，基于主键列值，自动创建 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。此索引用于加速在主键列上包含过滤条件的所有查询。ClickHouse 目前不支持外键约束。

## 次级索引（仅在 ClickHouse 中可用） {#secondary-indexes-only-available-in-clickhouse}

除了从表的主键列值创建的主索引外，ClickHouse 允许您在主键之外的列上创建次级索引。ClickHouse 提供几种类型的次级索引，每种索引都适合不同类型的查询：

- **布隆过滤器索引**：
  - 用于加速具有相等条件的查询（例如，=, IN）。
  - 使用概率数据结构来确定值是否存在于数据块中。
- **令牌布隆过滤器索引**：
  - 类似于布隆过滤器索引，但用于标记化字符串，适合全文搜索查询。
- **最小-最大索引**：
  - 维护每个数据部分列的最小值和最大值。
  - 有助于跳过读取不在指定范围内的数据部分。

## 搜索索引 {#search-indexes}

与 BigQuery 中的 [搜索索引](https://cloud.google.com/bigquery/docs/search-index) 类似，ClickHouse 表中可以在字符串值的列上创建 [全文索引](/engines/table-engines/mergetree-family/invertedindexes)。

## 向量索引 {#vector-indexes}

BigQuery 最近推出了 [向量索引](https://cloud.google.com/bigquery/docs/vector-index) 作为 Pre-GA 功能。同样，ClickHouse 对 [加速](/engines/table-engines/mergetree-family/annindexes) 向量搜索用例的索引提供实验性支持。

## 分区 {#partitioning}

与 BigQuery 一样，ClickHouse 使用表分区来提高性能并管理大型表，通过将表划分为称为分区的更小、更易管理的部分。我们详细描述 ClickHouse 分区 [在这里](/engines/table-engines/mergetree-family/custom-partitioning-key)。

## 聚类 {#clustering}

通过聚类，BigQuery 自动根据几个指定列的值对表数据进行排序，并将它们放置在大小合适的块中。聚类改善了查询性能，使 BigQuery 更好地估算运行查询的成本。通过聚类列，查询还消除了对不必要数据的扫描。

在 ClickHouse 中，数据在磁盘上基于表主键列自动 [聚类](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)，并在块中逻辑组织，这些块可以快速定位或通过利用主索引数据结构进行修剪。

## 物化视图 {#materialized-views}

BigQuery 和 ClickHouse 都支持物化视图 - 基于基本表的转换查询结果的预计算结果，以提高性能和效率。

## 查询物化视图 {#querying-materialized-views}

BigQuery 物化视图可以直接查询，或被优化器用于处理基本表的查询。如果对基本表的更改可能会使物化视图失效，则数据直接从基本表读取。如果对基本表的更改不会使物化视图失效，则从物化视图读取其余数据，只有更改的数据从基本表中读取。

在 ClickHouse 中，物化视图只能直接查询。然而，与 BigQuery（在 BigQuery 中，物化视图在对基本表的更改后 5 分钟内自动刷新，但不会比 [每 30 分钟更频繁](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)）相比，物化视图始终与基本表保持同步。

**更新物化视图**

BigQuery 定期通过对基本表运行物化视图的转换查询来完全刷新物化视图。在刷新之间，BigQuery 将物化视图的数据与新的基本表数据结合，以提供一致的查询结果，同时仍然使用物化视图。

在 ClickHouse 中，物化视图是增量更新的。这种增量更新机制提供高可扩展性和低计算成本：增量更新的物化视图专为基本表包含数十亿或万亿行的场景而设计。ClickHouse 不必为不断增长的基本表反复查询以刷新物化视图，而是简单地计算新插入的基本表行的值的部分结果。这个部分结果在后台与先前计算的部分结果进行增量合并。这与反复从整个基本表刷新物化视图相比，显著降低了计算成本。

## 事务 {#transactions}

与 ClickHouse 相比，BigQuery 支持在单个查询内或在会话中跨多个查询使用多语句事务。多语句事务允许您执行变更操作，例如在一个或多个表上插入或删除行，并原子性地提交或回滚更改。多语句事务是 [ClickHouse 2024 年的路线图](https://github.com/ClickHouse/ClickHouse/issues/58392) 上的一项内容。

## 聚合函数 {#aggregate-functions}

与 BigQuery 相比，ClickHouse 提供了显著更多的内置聚合函数：

- BigQuery 具有 [18 个聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)，以及 [4 个近似聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)。
- ClickHouse 拥有超过 [150 个预构建的聚合函数](/sql-reference/aggregate-functions/reference)，以及强大的 [聚合组合器](/sql-reference/aggregate-functions/combinators)，用于 [扩展](https://www.youtube.com/watch?v=7ApwD0cfAFI) 预构建聚合函数的行为。例如，您可以通过 [-Array 后缀](/sql-reference/aggregate-functions/combinators#-array) 将超过 150 个预构建聚合函数应用于数组，而不是表行。使用 [-Map 后缀](/sql-reference/aggregate-functions/combinators#-map)，您可以将任何聚合函数应用于映射。使用 [-ForEach 后缀](/sql-reference/aggregate-functions/combinators#-foreach)，您可以将任何聚合函数应用于嵌套数组。

## 数据源和文件格式 {#data-sources-and-file-formats}

与 BigQuery 相比，ClickHouse 支持显著更多的文件格式和数据源：

- ClickHouse 本地支持从几乎任何数据源加载 90 多种文件格式
- BigQuery 支持 5 种文件格式和 19 种数据源

## SQL 语言特性 {#sql-language-features}

ClickHouse 提供标准 SQL 以及许多扩展和改进，使其在进行分析任务时更为友好。例如，ClickHouse SQL [支持 Lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda) 和高阶函数，因此在应用变换时不必展开/爆炸数组。这比 BigQuery 等其他系统具有更大的优势。

## 数组 {#arrays}

与 BigQuery 的 8 个数组函数相比，ClickHouse 提供超过 80 个 [内置数组函数](/sql-reference/functions/array-functions)，用于优雅且简单地建模和解决广泛的问题。

ClickHouse 中的一个典型设计模式是使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数（暂时）将表的特定行值转换为数组。然后，这可以方便地通过数组函数进行处理，结果可以通过 [`arrayJoin`](/sql-reference/functions/array-join) 聚合函数转换回单个表行。

由于 ClickHouse SQL 支持 [高阶 Lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)，许多高级数组操作只需简单调用其中一个高阶内置数组函数即可实现，而不是像在 BigQuery 中常常 [要求](https://cloud.google.com/bigquery/docs/arrays)的那样暂时将数组转换回表， 例如 [过滤](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) 或 [压缩](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) 数组。在 ClickHouse 中，这些操作仅是高阶函数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) 和 [`arrayZip`](/sql-reference/functions/array-functions#arrayzip) 的简单函数调用。

以下是 BigQuery 与 ClickHouse 之间的数组操作映射：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**为子查询中的每一行创建一个元素的数组**

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

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数

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

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**过滤数组**

_BigQuery_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符暂时将数组转换回表

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

[arrayFilter](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) 函数

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

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 操作符暂时将数组转换回表

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

[arrayZip](/sql-reference/functions/array-functions#arrayzip) 函数

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

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg)、... 函数，或任何超过 90 个现有聚合函数名称作为 [arrayReduce](/sql-reference/functions/array-functions#arrayreduce) 函数的参数

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
