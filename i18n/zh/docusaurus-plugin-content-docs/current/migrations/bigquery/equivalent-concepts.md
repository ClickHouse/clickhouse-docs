---
'title': 'BigQuery vs ClickHouse Cloud'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'How BigQuery differs from ClickHouse Cloud'
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


# BigQuery 与 ClickHouse Cloud：等效和不同的概念

## 资源组织 {#resource-organization}

ClickHouse Cloud 中资源的组织方式类似于 [BigQuery 的资源层次结构](https://cloud.google.com/bigquery/docs/resource-hierarchy)。我们在下面根据以下显示 ClickHouse Cloud 资源层次结构的图表描述具体差异：

<Image img={bigquery_1} size="md" alt="资源组织"/>

### 组织 {#organizations}

与 BigQuery 类似，组织是 ClickHouse Cloud 资源层次结构中的根节点。您在 ClickHouse Cloud 帐户中设置的第一个用户会自动分配给由该用户拥有的组织。该用户可以邀请其他用户加入该组织。

### BigQuery 项目与 ClickHouse Cloud 服务 {#bigquery-projects-vs-clickhouse-cloud-services}

在组织内，您可以创建服务，这些服务与 BigQuery 项目大致相当，因为 ClickHouse Cloud 中存储的数据与服务相关联。在 ClickHouse Cloud 中有 [几种可用的服务类型](/cloud/manage/cloud-tiers)。每个 ClickHouse Cloud 服务都在特定区域中部署，并包含：

1. 一组计算节点（目前，开发等级服务为 2 个节点，生产等级服务为 3 个节点）。对于这些节点，ClickHouse Cloud [支持垂直和水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，包括手动和自动扩展。
2. 一个对象存储文件夹，其中服务存储所有数据。
3. 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点） - 一个服务 URL，您可以用来连接到服务（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery 数据集与 ClickHouse Cloud 数据库 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse 将表逻辑上分组到数据库中。与 BigQuery 数据集类似，ClickHouse 数据库是组织和控制表数据访问的逻辑容器。

### BigQuery 文件夹 {#bigquery-folders}

ClickHouse Cloud 当前没有与 BigQuery 文件夹相对应的概念。

### BigQuery 插槽预留和配额 {#bigquery-slot-reservations-and-quotas}

与 BigQuery 插槽预留类似，您可以在 ClickHouse Cloud 中 [配置垂直和水平自动扩展](/manage/scaling#configuring-vertical-auto-scaling)。对于垂直自动扩展，您可以为服务的计算节点设置内存和 CPU 核心的最小和最大大小。服务将根据需要在这些界限内进行扩展。这些设置在初始服务创建流程中也可用。服务中的每个计算节点大小相同。您可以使用 [水平扩展](/manage/scaling#manual-horizontal-scaling) 来更改服务中的计算节点数量。

此外，类似于 BigQuery 配额，ClickHouse Cloud 提供并发控制、内存使用限制和 I/O 调度，使用户能够将查询隔离到工作负载类中。通过为特定工作负载类设置共享资源（CPU 核心、DRAM、磁盘和网络 I/O）的限制，确保这些查询不会影响其他关键业务查询。并发控制防止在高并发查询的场景中线程的过度订阅。

ClickHouse 跟踪服务器、用户和查询级别的内存分配字节大小，允许灵活的内存使用限制。内存过度分配使查询能够使用超出保证内存的额外空闲内存，同时确保其他查询的内存限制。此外，聚合、排序和连接子句的内存使用可以限制，从而在内存限制超出时允许回退到外部算法。

最后，I/O 调度允许用户根据最大带宽、在途请求和策略，限制工作负载类的本地和远程磁盘访问。

### 权限 {#permissions}

ClickHouse Cloud [控制用户访问](/cloud/security/cloud-access-management)，通过 [云控制台](/cloud/get-started/sql-console) 和通过数据库。在控制台访问方面通过 [clickhouse.cloud](https://console.clickhouse.cloud) 用户界面进行管理。数据库访问通过数据库用户帐户和角色进行管理。此外，可以在数据库中授予控制台用户角色，使控制台用户可以通过我们的 [SQL 控制台](/integrations/sql-clients/sql-console) 与数据库进行交互。

## 数据类型 {#data-types}

ClickHouse 提供更细粒度的数值精度。例如，BigQuery 提供的数值类型为 [`INT64`, `NUMERIC`, `BIGNUMERIC` 和 `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。与此相比，ClickHouse 提供多种精度类型，适用于小数、浮点数和整数。使用这些数据类型，ClickHouse 用户可以优化存储和内存开销，从而实现更快的查询和更低的资源消耗。以下是每种 BigQuery 类型对应的 ClickHouse 类型的映射：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32)（范围较窄） |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64)（范围较窄，精度更高） |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | 不适用 - [作为表达式支持](/sql-reference/data-types/special-data-types/interval#usage-remarks) 或 [通过函数支持](/sql-reference/functions/date-time-functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

在选择 ClickHouse 类型时，当存在多种选项时，请考虑数据的实际范围，并选择最低要求。此外，考虑使用 [适当的编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 以进一步压缩。

## 查询加速技术 {#query-acceleration-techniques}

### 主键、外键与主索引 {#primary-and-foreign-keys-and-primary-index}

在 BigQuery 中，表可以有 [主键和外键约束](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)。通常，主键和外键用于关系数据库，以确保数据完整性。主键值通常对每一行都是唯一的，并且不为 `NULL`。每个外键值必须存在于主键表的主键列中或为 `NULL`。在 BigQuery 中，这些约束没有得到强制执行，但查询优化器可以利用这些信息来优化查询。

在 ClickHouse 中，表也可以有主键。与 BigQuery 相似，ClickHouse 不强制表的主键列值的唯一性。与 BigQuery 不同的是，表的数据是存储在磁盘上 [按主键列排序](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)。查询优化器利用这种排序来防止重新排序，从而最小化联接的内存使用，并启用限值子句的短路。与 BigQuery 不同的是，ClickHouse 会自动基于主键列值 [创建 (稀疏) 主索引](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。该索引用于加速所有包含主键列过滤的查询。ClickHouse 当前不支持外键约束。

## 二级索引（只在 ClickHouse 中可用） {#secondary-indexes-only-available-in-clickhouse}

除了主索引之外，ClickHouse 允许您在主键列以外的列上创建二级索引。ClickHouse 提供几种类型的二级索引，每种索引均适用于不同类型的查询：

- **布隆过滤器索引**：
  - 用于加速具有相等条件的查询（例如，=，IN）。
  - 使用概率数据结构来确定一个值是否存在于数据块中。
- **令牌布隆过滤器索引**：
  - 类似于布隆过滤器索引，但用于标记字符串，适用于全文搜索查询。
- **最小-最大索引**：
  - 维护每个数据部分中列的最小值和最大值。
  - 帮助跳过读取不在指定范围内的数据部分。

## 搜索索引 {#search-indexes}

与 BigQuery 中的 [搜索索引](https://cloud.google.com/bigquery/docs/search-index) 类似，可以为 ClickHouse 表中的字符串值列创建 [全文索引](/engines/table-engines/mergetree-family/invertedindexes)。

## 向量索引 {#vector-indexes}

BigQuery 最近推出了 [向量索引](https://cloud.google.com/bigquery/docs/vector-index) 作为 Pre-GA 功能。同样，ClickHouse 也对 [加速的索引](/engines/table-engines/mergetree-family/annindexes) 向量搜索用例提供实验性支持。

## 分区 {#partitioning}

与 BigQuery 类似，ClickHouse 使用表分区来提高大型表的性能和可管理性，通过将表划分为称为分区的更小、更易管理的部分。我们在 [这里](/engines/table-engines/mergetree-family/custom-partitioning-key) 详细描述 ClickHouse 分区。

## 聚类 {#clustering}

通过聚类，BigQuery 根据少数指定列的值自动对表数据进行排序，并将它们集中在最佳大小的块中。聚类提高了查询性能，使 BigQuery 更好地估算查询运行的成本。使用聚类列，查询还消除了对不必要数据的扫描。

在 ClickHouse 中，数据会基于表的主键列 [自动聚类到磁盘](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)，并在逻辑上组织成可以快速定位或通过利用主索引数据结构进行修剪的块。

## 物化视图 {#materialized-views}

BigQuery 和 ClickHouse 都支持物化视图—基于对基础表的转换查询结果的预计算结果，提高性能和效率。

## 查询物化视图 {#querying-materialized-views}

BigQuery 物化视图可以直接查询或被优化器用来处理对基础表的查询。如果对基础表的更改可能使物化视图失效，数据将直接从基础表读取。如果对基础表的更改不会使物化视图失效，则其余数据将从物化视图中读取，并且仅从基础表读取变化。

在 ClickHouse 中，物化视图只能直接查询。然而，与 BigQuery 相比（在 BigQuery 中，物化视图会在基础表更改后的 5 分钟内自动刷新，但不会频繁于 [每 30 分钟](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)），物化视图始终与基础表同步。

**更新物化视图**

BigQuery 通过在基础表上运行视图的转换查询定期完全刷新物化视图。在刷新之间，BigQuery 将物化视图的数据与新基础表数据结合，以提供一致的查询结果，同时仍使用物化视图。

在 ClickHouse 中，物化视图是增量更新的。此增量更新机制提供了高可扩展性和低计算成本：增量更新的物化视图特别针对基础表包含数十亿或万亿行的场景而设计。ClickHouse 不再需要重复查询不断增长的基础表以刷新物化视图，而是仅从（只）新插入的基础表行的值中计算一个部分结果。该部分结果与先前计算的部分结果在后台增量合并。这与从整个基础表多次刷新物化视图相比，显著降低了计算成本。

## 事务 {#transactions}

与 ClickHouse 相比，BigQuery 支持在单个查询内的多语句事务，或在使用会话的多个查询之间的多语句事务。多语句事务允许您执行变更操作，例如在一个或多个表上插入或删除行，并以原子方式提交或回滚更改。 多语句事务是在 [ClickHouse 的 2024 路线图中](https://github.com/ClickHouse/ClickHouse/issues/58392)。

## 聚合函数 {#aggregate-functions}

与 BigQuery 相比，ClickHouse 配备了显著更多的内置聚合函数：

- BigQuery 提供 [18 个聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)，以及 [4 个近似聚合函数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)。
- ClickHouse 拥有超过 [150 个预构建聚合函数](/sql-reference/aggregate-functions/reference)，以及强大的 [聚合组合器](/sql-reference/aggregate-functions/combinators)，用于 [扩展](https://www.youtube.com/watch?v=7ApwD0cfAFI) 预构建聚合函数的行为。举例来说，您可以通过调用带有 [-Array 后缀](/sql-reference/aggregate-functions/combinators#-array) 的超过 150 个预构建聚合函数适用于数组，而不是表行。借助 [-Map 后缀](/sql-reference/aggregate-functions/combinators#-map)，您可以将任何聚合函数应用于映射。而使用 [-ForEach 后缀](/sql-reference/aggregate-functions/combinators#-foreach)，则可以将任何聚合函数应用于嵌套数组。

## 数据源和文件格式 {#data-sources-and-file-formats}

与 BigQuery 相比，ClickHouse 支持显著更多的文件格式和数据源：

- ClickHouse 原生支持从几乎任何数据源加载 90 多种文件格式的数据。
- BigQuery 仅支持 5 种文件格式和 19 种数据源。

## SQL 语言特性 {#sql-language-features}

ClickHouse 提供标准 SQL，并具有许多扩展和改进，使其更适合分析任务。例如，ClickHouse SQL [支持 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda) 和高阶函数，因此在应用转换时不必对数组进行展开/展平。这相较于 BigQuery 等其他系统是一个重大优势。

## 数组 {#arrays}

与 BigQuery 的 8 个数组函数相比，ClickHouse 拥有超过 80 个 [内置数组函数](/sql-reference/functions/array-functions)，以优雅和简单的方式建模和解决各种问题。

ClickHouse 中一个典型的设计模式是使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数将表的特定行值临时转换为数组。然后，这可以通过数组函数方便地处理，结果可以通过 [`arrayJoin`](/sql-reference/functions/array-join) 聚合函数转换回单独的表行。

由于 ClickHouse SQL 支持 [高阶 lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)，许多高级数组操作可以通过简单调用内置高阶数组函数之一轻松实现，而无需像在 BigQuery 中那样临时将数组转换回表（例如，进行 [过滤](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) 或 [压缩](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) 数组）。在 ClickHouse 中，这些操作只是高阶函数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) 和 [`arrayZip`](/sql-reference/functions/array-functions#arrayzip) 的简单函数调用。

以下是 BigQuery 到 ClickHouse 的数组操作映射：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**创建一个带有子查询中每行一个元素的数组**

_大查询_

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

_点击屋_

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

_大查询_

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

_点击屋_

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

_大查询_

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

_点击屋_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**返回时间戳数组**

_大查询_

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

_点击屋_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**过滤数组**

_大查询_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组临时转换回表

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

_点击屋_

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

_大查询_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组临时转换回表

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

_点击屋_

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

_大查询_

需要通过 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 运算符将数组转换回表

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

_点击屋_

[arraySum](/sql-reference/functions/array-functions#arraysum), [arrayAvg](/sql-reference/functions/array-functions#arrayavg), ... 函数，或任何现有 90 多个聚合函数的名称作为 [arrayReduce](/sql-reference/functions/array-functions#arrayreduce) 函数的参数

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
