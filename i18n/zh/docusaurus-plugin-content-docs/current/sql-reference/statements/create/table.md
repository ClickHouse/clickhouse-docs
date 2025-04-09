---
slug: /sql-reference/statements/create/table
sidebar_position: 36
sidebar_label: 表
title: '创建表'
keywords: ['compression', 'codec', 'schema', 'DDL']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建一个新表。此查询可以根据使用案例有多种语法形式。

默认情况下，表仅在当前服务器上创建。分布式 DDL 查询通过 `ON CLUSTER` 子句实现，具体内容[另有说明](../../../sql-reference/distributed-ddl.md)。
## 语法形式 {#syntax-forms}
### 带显式模式 {#with-explicit-schema}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

在 `db` 数据库中创建名为 `table_name` 的表，或者如果未设置 `db`，则在当前数据库中创建，结构根据括号中指定的内容和 `engine` 引擎确定。
表的结构是列描述、二级索引和约束的列表。如果引擎支持[主键](#primary-key)，则会在表引擎的参数中指明。

列的描述在最简单的情况下为 `name type`。示例：`RegionID UInt32`。

也可以为默认值定义表达式（见下文）。

如有必要，可以指定主键，使用一个或多个键表达式。

可以为列和表添加注释。
### 与其他表相似的模式 {#with-a-schema-similar-to-other-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表具有相同结构的表。可以为此表指定不同的引擎。如果未指定引擎，则使用 `db2.name2` 表的相同引擎。
### 从另一个表克隆模式和数据 {#with-a-schema-and-data-cloned-from-another-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表具有相同结构的表。可以为此表指定不同的引擎。如果未指定引擎，则使用 `db2.name2` 表的相同引擎。新表创建后，所有来自 `db2.name2` 的分区将被附加到它。换句话说，`db2.name2` 的数据在创建时被克隆到 `db.table_name`。此查询等同于以下内容：

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```
### 从表函数 {#from-a-table-function}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个与所指定的[表函数](/sql-reference/table-functions) 结果相同的表。创建的表也将以与所指定的相应表函数相同的方式工作。
### 从 SELECT 查询 {#from-select-query}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个具有与 `SELECT` 查询结果相似结构的表，使用 `engine` 引擎，并从 `SELECT` 中填充数据。还可以显式指定列描述。

如果表已存在且指定了 `IF NOT EXISTS`，则查询不会执行任何操作。

查询中 `ENGINE` 子句后可以有其他子句。有关如何创建表的详细文档，请参见[表引擎](/engines/table-engines)的描述。

:::tip
在 ClickHouse Cloud 中，请将此分为两个步骤：
1. 创建表结构

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  # highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. 填充表

  ```sql
  INSERT INTO t1
  SELECT ...
  ```

:::

**示例**

查询：

``` sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

结果：

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```
## NULL 或 NOT NULL 修饰符 {#null-or-not-null-modifiers}

列定义中的 `NULL` 和 `NOT NULL` 修饰符允许或不允许其[可空](/sql-reference/data-types/nullable)。

如果类型不是 `Nullable` 并且指定了 `NULL`，则将被视为 `Nullable`；如果指定了 `NOT NULL`，则不允许。例如，`INT NULL` 与 `Nullable(INT)` 相同。如果类型是 `Nullable` 并且指定了 `NULL` 或 `NOT NULL` 修饰符，则会抛出异常。

另见 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 设置。
## 默认值 {#default_values}

列描述可以在 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr` 形式中指定默认值表达式。示例：`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略，列类型必须明确指定，默认值将为数值列的 `0`，字符串列的 `''`（空字符串），数组列的 `[]`（空数组），日期列的 `1970-01-01`，或可空列的 `NULL`。

默认值列的列类型可以省略，在这种情况下它将会从 `expr` 的类型中推断。举例来说，列 `EventDate DEFAULT toDate(EventTime)` 的类型将为日期。

如果同时指定数据类型和默认值表达式，则会插入一个隐式类型转换函数，将表达式转换为指定类型。示例：`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 会检查表结构的变化不会在表达式计算中引入循环。对于 INSERT，它检查表达式是否可以解析——所有可以从中计算的列都已传递。
### 默认值 {#default}

`DEFAULT expr`

正常的默认值。如果在 INSERT 查询中未指定此类列的值，则从 `expr` 中计算。

示例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) Values (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```
### 物化 {#materialized}

`MATERIALIZED expr`

物化表达式。这类列的值会根据指定的物化表达式在插入行时自动计算。值不能在 `INSERT` 时显式指定。

此外，这类默认值列不会包含在 `SELECT *` 的结果中。这样做是为了保持 `SELECT *` 的结果总是可以使用 `INSERT` 插入回表中的不变性。可以通过设置 `asterisk_include_materialized_columns` 禁用此行为。

示例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test Values (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```
### 瞬态 {#ephemeral}

`EPHEMERAL [expr]`

瞬态列。这类类型的列不会存储在表中，无法从中 `SELECT`。瞬态列的唯一目的是为其他列构建默认值表达式。

未显式指定列时的插入将跳过此类列。这是为了保持 `SELECT *` 的结果总是可以使用 `INSERT` 插入回表中的不变性。

示例：

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) Values (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```
### 别名 {#alias}

`ALIAS expr`

计算列（同义词）。此类列不会存储在表中，无法在其中插入值。

当 SELECT 查询明确引用此类列时，值在查询时根据 `expr` 计算。默认情况下，`SELECT *` 会排除 ALIAS 列。可以通过设置 `asterisk_include_alias_columns` 禁用此行为。

在使用 ALTER 查询添加新列时，旧数据将不会写入这些列。相反，当读取没有新列值的旧数据时，默认情况下会动态计算表达式。然而，如果运行表达式需要在查询中未指明的不同列，则这些列也会被读取，但仅针对需要读取的数据块。

如果在表中添加新列但之后更改其默认表达式，旧数据使用的值将会改变（对于在磁盘上未存储的值）。需要注意的是，当运行后台合并时，缺少列的数据将被写入合并部分。

不可能为嵌套数据结构中的元素设置默认值。

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```
## 主键 {#primary-key}

创建表时可以定义 [主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)。主键可以通过两种方式指定：

- 在列列表中

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- 在列列表外部

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
你不能在一个查询中组合两种方式。
:::
## 约束 {#constraints}

除了列描述外，还可以定义约束：
### 约束 {#constraint}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` 可以是任何布尔表达式。如果为表定义了约束，则在每个 INSERT 查询中都会检查它们。如果任何约束不满足，服务器将抛出带有约束名称和检查表达式的异常。

添加大量约束可能会对大规模 `INSERT` 查询的性能产生负面影响。
### 假设 {#assume}

`ASSUME` 子句用于在假设为真的表上定义 `CONSTRAINT`。此约束可供优化器使用，以提高 SQL 查询的性能。

以下示例中使用 `ASSUME CONSTRAINT` 创建 `users_a` 表：

```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```

在这里，`ASSUME CONSTRAINT` 用于断言 `length(name)` 函数始终等于 `name_len` 列的值。这意味着在查询中调用 `length(name)` 时，ClickHouse 可以将其替换为 `name_len`，这样可以更快地执行，因为它避免了调用 `length()` 函数。

然后，在执行查询 `SELECT name FROM users_a WHERE length(name) < 5;` 时，由于 `ASSUME CONSTRAINT` ，ClickHouse 可以优化为 `SELECT name FROM users_a WHERE name_len < 5`；因为避免了计算每行的 `name` 的长度，这可以使查询运行得更快。

`ASSUME CONSTRAINT` **不会强制执行约束**，它只是告知优化器该约束成立。如果该约束实际上不成立，则查询结果可能不正确。因此，只有在确保约束成立的情况下才应使用 `ASSUME CONSTRAINT`。
## TTL 表达式 {#ttl-expression}

定义值的存储时间。仅可为 MergeTree 家族表指定。有关详细描述，请参见[列和表的 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。
## 列压缩编码 {#column_compression_codec}

默认情况下，ClickHouse 在自管理版本中应用 `lz4` 压缩，在 ClickHouse Cloud 中应用 `zstd`。

对于 `MergeTree` 引擎系列，你可以在服务器配置的[压缩](/operations/server-configuration-parameters/settings#compression)部分更改默认压缩方法。

你还可以在 `CREATE TABLE` 查询中为每个单独的列定义压缩方法。

``` sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```

可以指定 `Default` 编解码器以引用默认压缩，这可能依赖于运行时的不同设置（和数据属性）。
示例：`value UInt64 CODEC(Default)` — 等同于缺少编解码器的规范。

你还可以从列中删除当前的 CODEC 并使用 config.xml 中的默认压缩：

``` sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

可以将多个编解码器组合成管道，例如，`CODEC(Delta, Default)`。

:::tip
你无法使用外部工具如 `lz4` 解压 ClickHouse 数据库文件。相反，请使用专用的 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) 实用程序。
:::

支持以下表引擎的压缩：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族。支持列压缩编码和使用 [压缩](/operations/server-configuration-parameters/settings#compression) 设置选择默认压缩方法。
- [Log](../../../engines/table-engines/log-family/index.md) 家族。默认使用 `lz4` 压缩方法，支持列压缩编码。
- [Set](../../../engines/table-engines/special/set.md)。仅支持默认压缩。
- [Join](../../../engines/table-engines/special/join.md)。仅支持默认压缩。

ClickHouse 支持通用编码和专用编码。
### 通用编码 {#general-purpose-codecs}
#### NONE {#none}

`NONE` — 无压缩。
#### LZ4 {#lz4}

`LZ4` — 默认的无损[数据压缩算法](https://github.com/lz4/lz4)。应用 LZ4 快速压缩。
#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — LZ4 HC（高压缩）算法，具有可配置的级别。默认级别：9。设置 `level <= 0` 应用默认级别。可能的级别：\[1, 12\]。推荐级别范围：\[4, 9\]。
#### ZSTD {#zstd}

`ZSTD[(level)]` — 可配置级别的[ZSTD压缩算法](https://en.wikipedia.org/wiki/Zstandard)。可能的级别：\[1, 22\]。默认级别：1。

高压缩级别对于不对称场景很有用，例如压缩一次，重复解压。更高的级别意味着更好的压缩率和更高的 CPU 使用率。
#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — 由 [Intel® QATlib](https://github.com/intel/qatlib) 和 [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin) 实现的[ZSTD压缩算法](https://en.wikipedia.org/wiki/Zstandard)，具有可配置级别。可能的级别：\[1, 12\]。默认级别：1。推荐级别范围：\[6, 12\]。一些限制适用：

- ZSTD_QAT 默认禁用，只有在启用配置设置 [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) 后才能使用。
- 对于压缩，ZSTD_QAT 尝试使用 Intel® QAT  offloading 设备（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）。如果未找到此类设备，则会回退到 ZSTD 软件压缩。
- 解压总是在软件中执行。
#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate压缩算法](https://github.com/intel/qpl)，由 Intel® Query Processing Library 实现。一些限制适用：

- DEFLATE_QPL 默认禁用，只有在启用配置设置 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) 后才能使用。
- DEFLATE_QPL 需要一个使用 SSE 4.2 指令编译的 ClickHouse 构建（默认情况下是这样的）。有关更多详细信息，请参见[使用 DEFLATE_QPL 构建 ClickHouse](/development/building_and_benchmarking_deflate_qpl)。
- 如果系统具有 Intel® IAA（In-Memory Analytics Accelerator）offloading 设备，则 DEFLATE_QPL 工作最佳。有关更多详细信息，请参阅[加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) 和 [使用 DEFLATE_QPL 基准](https://development/building_and_benchmarking_deflate_qpl)。
- DEFLATE_QPL 压缩的数据只能在编译了 SSE 4.2 的 ClickHouse 节点之间传输。
### 专用编码 {#specialized-codecs}

这些编码旨在通过利用数据的特定特征来提高压缩效果。其中一些编码本身并不压缩数据，而是对数据进行预处理，以便使用通用编码的第二阶段可以实现更高的数据压缩率。
#### Delta {#delta}

`Delta(delta_bytes)` — 一种压缩方法，其中原始值被相邻两个值的差替代，除了第一个值保持不变。最多 `delta_bytes` 用于存储增量值，因此 `delta_bytes` 是原始值的最大大小。可能的 `delta_bytes` 值：1、2、4、8。默认值为 `delta_bytes` 是 `sizeof(type)`（如果等于 1、2、4 或 8）。在所有其他情况下为 1。Delta 是一种数据准备编码，即不能单独使用。
#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 计算增量的增量并以紧凑的二进制形式写入。可能的 `bytes_size` 值：1、2、4、8，默认值为 `sizeof(type)`（如果等于 1、2、4 或 8）。在所有其他情况下为 1。对于具有常量步幅的单调序列（例如时间序列数据），可以实现最佳压缩率。可以与任何定长类型一起使用。实现了 Gorilla TSDB 中使用的算法，并扩展以支持 64 位类型。对于 32 位增量，使用 1 个额外比特：5 位前缀而不是 4 位前缀。有关更多信息，请参见压缩时间戳在[《Gorilla: A Fast, Scalable, In-Memory Time Series Database》](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf) 中的描述。DoubleDelta 是一种数据准备编码，即不能单独使用。
#### GCD {#gcd}

`GCD()` — 计算列中值的最大公约数（GCD），然后将每个值除以 GCD。可以与整数、十进制和日期/时间列一起使用。该编码非常适合值以 GCD 的倍数变化（增加或减少）的列，例如 24、28、16、24、8、24（GCD = 4）。GCD 是一种数据准备编码，即不能单独使用。
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 计算当前和前一个浮点值之间的 XOR，并以紧凑的二进制形式写入。连续值之间的差异越小，即序列值变化的速度越慢，压缩率越好。实现了 Gorilla TSDB 中使用的算法，并扩展以支持 64 位类型。可能的 `bytes_size` 值：1、2、4、8，默认值为 `sizeof(type)`（如果等于 1、2、4 或 8）。在所有其他情况下为 1。有关更多信息，请参见[《Gorilla: A Fast, Scalable, In-Memory Time Series Database》](https://doi.org/10.14778/2824032.2824078)第 4.1 节。
#### FPC {#fpc}

`FPC(level, float_size)` — 通过更好的两个预测器重复预测序列中的下一个浮点值，然后将实际值与预测值进行 XOR，并进行前导零压缩。与 Gorilla 类似，当存储一系列缓慢变化的浮点值时，这种方法是有效的。对于 64 位值（双精度），FPC 比 Gorilla 更快，对于 32 位值，效果可能有所不同。可能的 `level` 值：1-28，默认值为 12。可能的 `float_size` 值：4、8，默认值为 `sizeof(type)`（如果类型为 Float）。在所有其他情况下为 4。有关算法的详细描述，请参见[《High Throughput Compression of Double-Precision Floating-Point Data》](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)。
#### T64 {#t64}

`T64` — 一种压缩方法，在整数数据类型（包括 `Enum`、`Date` 和 `DateTime`）中裁剪未使用的高位。在其算法的每一步中，编码器获取 64 个值的块，将其放入 64x64 位矩阵中，转置，裁剪未使用的值位，并将剩余部分作为序列返回。

`DoubleDelta` 和 `Gorilla` 编码在 Gorilla TSDB 中用作其压缩算法的组成部分。在序列中存在缓慢变化的值及其时间戳的场景中，Gorilla 方法是有效的。时间戳通过 `DoubleDelta` 编码得到有效压缩，而值通过 `Gorilla` 编码得到有效压缩。例如，要获得有效存储的表，你可以在以下配置中创建它：

``` sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### 加密编码 {#encryption-codecs}

这些编码实际上不会压缩数据，而是对磁盘上的数据进行加密。仅在通过[加密](/operations/server-configuration-parameters/settings#encryption)设置指定了加密密钥时可用。请注意，加密仅在编码管道的末尾有意义，因为加密的数据通常无法以任何有意义的方式进行压缩。

加密编码：
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — 使用 AES-128 以 [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV 模式加密数据。
#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — 使用 AES-256 以 GCM-SIV 模式加密数据。

这些编码使用固定的随机数，因此加密是确定性的。这使其与像 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 这样的去重引擎相兼容，但有一个弱点：当同一数据块被加密两次时，生成的密文将完全相同，因此可以查看磁盘的对手可以看到这种等价关系（尽管仅是等价关系，而不获取其内容）。

:::note
大多数引擎（包括“*MergeTree”家族）在磁盘上创建索引文件时不会应用编码。这意味着如果加密列被索引，明文将出现在磁盘上。
:::

:::note
如果你在 SELECT 查询中提到加密列中的特定值（例如在其 WHERE 子句中），该值可能会出现在 [system.query_log](../../../operations/system-tables/query_log.md) 中。你可能想禁用日志记录。
:::

**示例**

```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

:::note
如果需要应用压缩，必须明确指定它。否则，仅会对数据应用加密。
:::

**示例**

```sql
CREATE TABLE mytable
(
    x String Codec(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```
## 临时表 {#temporary-tables}

:::note
请注意，临时表不会被复制。因此，无法保证插入临时表中的数据将在其他副本中可用。临时表可能有用的主要用例是在单个会话中查询或连接小的外部数据集。
:::

ClickHouse 支持具有以下特征的临时表：

- 临时表在会话结束时消失，包括连接丢失的情况。
- 当未指定引擎时，临时表使用 Memory 表引擎，并且可以使用任何其他表引擎，除了 Replicated 和 `KeeperMap` 引擎。
- 无法为临时表指定数据库。它是在数据库外创建的。
- 不可能在所有集群服务器上使用分布式 DDL 查询创建临时表（使用 `ON CLUSTER`）：此表仅存在于当前会话中。
- 如果临时表与另一个表同名且查询指定了表名而未指定数据库，则将使用临时表。
- 在分布式查询处理时，查询中使用内存引擎的临时表会传递给远程服务器。

要创建临时表，请使用以下语法：

``` sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

在大多数情况下，临时表不是手动创建的，而是在查询中使用外部数据时或者用于分布式 `(GLOBAL) IN`。有关详细信息，请参见适当的部分。

可以使用 [ENGINE = Memory](../../../engines/table-engines/special/memory.md) 的表来替代临时表。
## 替换表 {#replace-table}

`REPLACE` 语句允许你以[原子性](/concepts/glossary#atomicity)更新表。

:::note
此语句适用于 [`Atomic`](../../../engines/database-engines/atomic.md) 和 [`Replicated`](../../../engines/database-engines/replicated.md) 数据库引擎，
这两个是 ClickHouse 和 ClickHouse Cloud 的默认数据库引擎。
:::

通常，如果你需要从表中删除一些数据，
可以创建一个新表，并用不检索不需要数据的 `SELECT` 查询填充该表，
然后删除旧表并将新表重命名。
这种方法在下面的示例中进行演示：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

除了上述方法外，如果你使用默认数据库引擎，还可以使用 `REPLACE` 达到相同的效果：

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```
### 语法 {#syntax}

``` sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
所有用于 `CREATE` 语句的语法形式也适用于此语句。在非存在的表上调用 `REPLACE` 将导致错误。
:::
### 示例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="本地" default>

考虑以下表：

```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```

我们可以使用 `REPLACE` 语句来清除所有数据：

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```

或者我们可以使用 `REPLACE` 语句来更改表结构：

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```  
</TabItem>
<TabItem value="cloud_replace_example" label="云端">

考虑以下在 ClickHouse Cloud 上的表：

```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1	test
```

我们可以使用 `REPLACE` 语句来清除所有数据：

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2	
```

或者我们可以使用 `REPLACE` 语句来更改表结构：

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```    
</TabItem>
</Tabs>
## COMMENT 子句 {#comment-clause}

您可以在创建表时添加注释。

**语法**

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT '注释'
```

**示例**

查询：

``` sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '临时表';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

结果：

```text
┌─name─┬─comment─────────────┐
│ t1   │ 临时表              │
└──────┴─────────────────────┘
```
## 相关内容 {#related-content}

- 博客: [使用模式和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
