---
'description': '表的 文档'
'keywords':
- 'compression'
- 'codec'
- 'schema'
- 'DDL'
'sidebar_label': 'TABLE'
'sidebar_position': 36
'slug': '/sql-reference/statements/create/table'
'title': 'CREATE TABLE'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建一个新表。根据用例，此查询可以有不同的语法形式。

默认情况下，表仅在当前服务器上创建。分布式 DDL 查询作为 `ON CLUSTER` 子句实现， [另有描述](../../../sql-reference/distributed-ddl.md)。

## 语法形式 {#syntax-forms}

### 具有显式架构 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

在 `db` 数据库中创建一个名为 `table_name` 的表，如果没有设置 `db`，则在当前数据库中创建，结构在括号中指定和 `engine` 引擎。
表的结构是列描述、二级索引和约束的列表。如果引擎支持 [主键](#primary-key)，则会作为表引擎的参数指明。

列描述在最简单的情况下是 `name type`。示例：`RegionID UInt32`。

也可以为默认值定义表达式（见下文）。

如果必要，可以指定主键，一个或多个键的表达式。

可以为列和表添加注释。

### 具有类似其他表的架构 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个具有与另一个表相同结构的表。您可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。

### 具有从另一个表克隆的架构和数据 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表相同结构的表。您可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。新表创建后，将所有来自 `db2.name2` 的分区附加到它。换句话说，`db2.name2` 的数据在创建时被克隆到 `db.table_name` 中。此查询等价于以下内容：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### 从表函数 {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个与指定的 [表函数](/sql-reference/table-functions) 结果相同的表。创建的表也将在相同的方式下工作，与所指定的相应表函数相同。

### 从 SELECT 查询 {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个结构类似于 `SELECT` 查询的结果的表，使用 `engine` 引擎，并用 `SELECT` 的数据填充它。您还可以显式指定列描述。

如果表已经存在并且指定了 `IF NOT EXISTS`，那么查询将不执行任何操作。

查询中的 `ENGINE` 子句后可以有其他子句。有关如何创建表的详细文档，请参见 [表引擎](/engines/table-engines) 的描述。

:::tip
在 ClickHouse Cloud 中，请将此分为两个步骤：
1. 创建表结构

```sql
CREATE TABLE t1
ENGINE = MergeTree
ORDER BY ...
-- highlight-next-line
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

```sql
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

数据类型定义中的列定义后 `NULL` 和 `NOT NULL` 修饰符允许或不允许其为 [Nullable](/sql-reference/data-types/nullable)。

如果类型不是 `Nullable` 并且指定了 `NULL`，则将被视为 `Nullable`；如果指定了 `NOT NULL`，则不是。例如，`INT NULL` 与 `Nullable(INT)` 是相同的。如果类型是 `Nullable` 并且指定了 `NULL` 或 `NOT NULL` 修饰符，将抛出异常。

另请参见 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 设置。

## 默认值 {#default_values}

列描述可以以 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr` 的形式指定默认值表达式。示例：`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略，则必须显式指定列类型，且默认值将为数字列的 `0`、字符串列的 `''`（空字符串）、数组列的 `[]`（空数组）、日期列的 `1970-01-01` 或可空列的 `NULL`。

默认值列的列类型可以省略，在这种情况下从 `expr` 的类型推断。例如，列 `EventDate DEFAULT toDate(EventTime)` 的类型将为日期。

如果同时指定了数据类型和默认值表达式，则会插入隐式类型转换函数，将表达式转换为指定类型。例如`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 检查表结构的更改是否不会在表达式计算中引入循环。对于 INSERT，它检查表达式是否可解析 - 即它们可以计算的所有列是否已经传递。

### DEFAULT {#default}

`DEFAULT expr`

普通默认值。如果在 INSERT 查询中未指定该列的值，则从 `expr` 计算。

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

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

物化表达式。此类列的值在插入行时根据指定的物化表达式自动计算。无法在 `INSERT` 中显式指定值。

此外，此类型的默认值列不包含在 `SELECT *` 的结果中。这是为了保持 `SELECT *` 的结果可以始终通过 `INSERT` 插回表的不变性。此行为可以通过设置 `asterisk_include_materialized_columns` 禁用。

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

INSERT INTO test VALUES (1);

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

### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

短暂列。此类列不存储在表中，无法对其进行 SELECT。短暂列的唯一目的是从中构建其他列的默认值表达式。

未显式指定列的插入将跳过此类列。这是为了保持 `SELECT *` 的结果可以始终通过 `INSERT` 插回表的不变性。

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

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

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

### ALIAS {#alias}

`ALIAS expr`

计算列（同义词）。此类列不存储在表中，无法向其 INSERT 值。

当 SELECT 查询显式引用此类列时，值在查询时根据 `expr` 计算。默认情况下，`SELECT *` 排除 ALIAS 列。此行为可以通过设置 `asterisk_include_alias_columns` 禁用。

使用 ALTER 查询添加新列时，不会写入这些列的旧数据。相反，在读取未为新列提供值的旧数据时，表达式默认按需计算。然而，如果运行表达式需要查询中未指示的不同列，这些列将额外被读取，但仅针对需要它的数据块。

如果向表中添加新列，但稍后更改其默认表达式，旧数据使用的值将会更改（对于未在磁盘上存储值的数据）。请注意，运行后台合并时，对于合并部分丢失的列的数据会写入合并部分。

无法为嵌套数据结构中的元素设置默认值。

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

- 在列列表内

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- 在列列表外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
您不能在一个查询中结合这两种方式。
:::

## 约束 {#constraints}

除了列描述之外，还可以定义约束：

### CONSTRAINT {#constraint}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` 可以是任何布尔表达式。如果为表定义了约束，则在每个 `INSERT` 查询的每一行中都会检查它们。如果不满足任何约束 - 服务器将抛出异常，并附上约束名称和检查表达式。

添加大量约束可能会对大 `INSERT` 查询的性能产生负面影响。

### ASSUME {#assume}

`ASSUME` 子句用于定义被假定为真实的表上的 `CONSTRAINT`。该约束随后可以被优化器使用，以增强 SQL 查询的性能。

考虑以下示例，其中在 `users_a` 表的创建中使用了 `ASSUME CONSTRAINT`：

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

在这里，`ASSUME CONSTRAINT` 用于断言 `length(name)` 函数始终等于 `name_len` 列的值。这意味着每当在查询中调用 `length(name)` 时，ClickHouse 可以将其替换为 `name_len`，这应该更快，因为避免了调用 `length()` 函数。

然后，在执行查询 `SELECT name FROM users_a WHERE length(name) < 5;` 时，由于 `ASSUME CONSTRAINT`，ClickHouse 可以将其优化为 `SELECT name FROM users_a WHERE name_len < 5`; 因为否则将需要计算每一行的 `name` 的长度。

`ASSUME CONSTRAINT` **并不会强制约束**，它仅通知优化器该约束是成立的。如果约束实际上不成立，则查询结果可能会不正确。因此，您应仅在确定约束成立的情况下使用 `ASSUME CONSTRAINT`。

## TTL 表达式 {#ttl-expression}

定义值的存储时间。仅可为 MergeTree 家族表指定。有关详细描述，请参见 [TTL for columns and tables](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## 列压缩编码 {#column_compression_codec}

默认情况下，ClickHouse 在自管理版本中应用 `lz4` 压缩，而在 ClickHouse Cloud 中应用 `zstd`。

对于 `MergeTree` 引擎家族，您可以在服务器配置的 [compression](/operations/server-configuration-parameters/settings#compression) 部分更改默认压缩方法。

还可以在 `CREATE TABLE` 查询中为每个单独的列定义压缩方法。

```sql
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

可以指定 `Default` 编解码器来引用默认压缩，这可能在运行时依赖于不同的设置（和数据的属性）。
示例：`value UInt64 CODEC(Default)` — 与缺少编解码器指定相同。

您也可以将当前的 CODEC 从列中移除，并使用来自 config.xml 的默认压缩：

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

编码可以以管道方式组合，例如，`CODEC(Delta, Default)`。

:::tip
您无法使用外部工具（如 `lz4`）解压 ClickHouse 数据库文件。请使用专用的 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) 工具。
:::

压缩支持以下表引擎：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族。支持列压缩编码和通过 [compression](/operations/server-configuration-parameters/settings#compression) 设置选择默认压缩方法。
- [Log](../../../engines/table-engines/log-family/index.md) 家族。默认使用 `lz4` 压缩方法，并支持列压缩编码。
- [Set](../../../engines/table-engines/special/set.md)。仅支持默认压缩。
- [Join](../../../engines/table-engines/special/join.md)。仅支持默认压缩。

ClickHouse 支持通用编解码器和专用编解码器。

### 通用编解码器 {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 无压缩。

#### LZ4 {#lz4}

`LZ4` — 默认情况下使用的不失真 [数据压缩算法](https://github.com/lz4/lz4)。应用 LZ4 快速压缩。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 带有可配置级别的 LZ4 HC（高压缩）算法。默认级别：9。设置 `level <= 0` 应用默认级别。可能级别：\[1, 12\]。推荐级别范围：\[4, 9\]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 带有可配置 `level` 的 [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)。可能级别：\[1, 22\]。默认级别：1。

较高的压缩级别对于不对称场景非常有用，例如压缩一次，重复解压缩。更高的级别意味着更好的压缩效果以及更高的 CPU 使用率。

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — 带有可配置级别的 [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)，由 [Intel® QATlib](https://github.com/intel/qatlib) 和 [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin) 实现。可能级别：\[1, 12\]。默认级别：1。推荐级别范围：\[6, 12\]。一些限制适用：

- ZSTD_QAT 默认情况下被禁用，只能在启用配置设置 [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) 后使用。
- 对于压缩，ZSTD_QAT 尝试使用 Intel® QAT 协处理器（[快速协助技术](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）。如果找不到这样的设备，它将回退到软件中的 ZSTD 压缩。
- 解压缩始终在软件中执行。

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — 由 Intel® 查询处理库实现的 [Deflate 压缩算法](https://github.com/intel/qpl)。一些限制适用：

- DEFLATE_QPL 默认情况下被禁用，只能在启用配置设置 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) 后使用。
- DEFLATE_QPL 需要使用 SSE 4.2 指令编译的 ClickHouse 构建（默认情况下即为如此）。有关更多详细信息，请参阅 [使用 DEFLATE_QPL 构建 Clickhouse](/development/building_and_benchmarking_deflate_qpl)。
- 如果系统中具有 Intel® IAA（内存分析加速器）协处理器，DEFLATE_QPL 的效果最佳。有关更多详细信息，请参阅 [加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) 和 [使用 DEFLATE_QPL 进行基准测试](/development/building_and_benchmarking_deflate_qpl)。
- DEFLATE_QPL 压缩的数据只能在编译时启用了 SSE 4.2 的 ClickHouse 节点之间传输。

### 专用编解码器 {#specialized-codecs}

这些编解码器旨在利用数据的特定特性，使压缩更加有效。其中一些编解码器不实际压缩数据，它们会对数据进行预处理，以便使用通用编解码器进行的第二次压缩阶段可以实现更高的数据压缩率。

#### Delta {#delta}

`Delta(delta_bytes)` — 一种压缩方法，其中原始值被相邻两个值的差替代，第一个值保持不变。`delta_bytes` 是原始值的最大大小，默认值为 `sizeof(type)`。指定 `delta_bytes` 作为参数已被弃用，并将在将来的版本中删除。Delta 是一种数据准备编解码器，即不能单独使用。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 计算增量的增量，并以紧凑的二进制形式写入。`bytes_size` 的含义与 [Delta](#delta) 编解码器中的 `delta_bytes` 类似。对于具有恒定步幅的单调序列（如时间序列数据）可以获得最佳压缩率。可以与任何数值类型一起使用。实现了用于 Gorilla TSDB 的算法，扩展其以支持 64 位类型。对于 32 位增量，使用 1 个额外的位：使用 5 位前缀而不是 4 位前缀。有关更多信息，请参见 [Compressing Time Stamps in Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)。DoubleDelta 是一种数据准备编解码器，即不能单独使用。

#### GCD {#gcd}

`GCD()` - 计算列中值的最大公约数（GCD），然后将每个值除以 GCD。可以用于整数、十进制和日期/时间列。该编解码器非常适合值按 GCD 的倍数发生变化（增加或减少）的列，例如 24、28、16、24、8、24（GCD = 4）。GCD 是一种数据准备编解码器，即不能单独使用。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 计算当前和前一个浮点值之间的 XOR，并以紧凑的二进制形式写入。连续值之间的差异越小，即序列的值变化越慢，压缩率越好。实现了用于 Gorilla TSDB 的算法，扩展其以支持 64 位类型。可能的 `bytes_size` 值：1、2、4、8，如果为 1、2、4 或 8，则默认值为 `sizeof(type)`；在所有其他情况下，取 1。有关更多信息，请参见 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) 中的第 4.1 节。

#### FPC {#fpc}

`FPC(level, float_size)` — 反复使用两个预测器中较好的一个来预测序列中下一个浮点值，然后将实际值与预测值进行 XOR，并进行前导零压缩。类似于 Gorilla，这在存储值变化缓慢的浮点值序列时效率较高。对于 64 位值（双精度），FPC 比 Gorilla 更快，对于 32 位值效果可能有所不同。可能的 `level` 值：1-28，默认值为 12。可能的 `float_size` 值：4、8，如果类型为 Float，则默认值为 `sizeof(type)`；在所有其他情况下，取 4。有关该算法的详细描述，请参见 [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)。

#### T64 {#t64}

`T64` — 一种压缩方法，裁剪整数数据类型中值的未使用的高位（包括 `Enum`、`Date` 和 `DateTime`）。在其算法的每一步中，编解码器获取 64 个值块，将它们放入 64x64 位矩阵，转置，裁剪未使用的值位并将其余部分作为序列返回。未使用的位是在整个数据部分的最大值和最小值之间没有差异的位。

`DoubleDelta` 和 `Gorilla` 编解码器作为其压缩算法的组成部分在 Gorilla TSDB 中使用。在时间戳具有缓慢变化的值的序列场景中，Gorilla 方法非常有效。时间戳通过 `DoubleDelta` 编解码器有效压缩，而值通过 `Gorilla` 编解码器有效压缩。例如，要获得有效存储的表，可以在以下配置中创建它：

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 加密编解码器 {#encryption-codecs}

这些编解码器实际上并不压缩数据，而是对磁盘上的数据进行加密。仅在通过 [encryption](/operations/server-configuration-parameters/settings#encryption) 设置指定了加密密钥时可用。请注意，加密仅在编码管道的末尾有意义，因为加密的数据通常无法以任何有意义的方式进行压缩。

加密编解码器：

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — 使用 AES-128 加密数据，采用 [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV 模式。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — 使用 AES-256 加密数据，采用 GCM-SIV 模式。

这些编解码器使用固定的 nonce，因此加密是确定性的。这使其与能够去重的引擎（如 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md））兼容，但也有一个弱点：当相同的数据块被加密两次时，结果的密文将完全相同，因此可以读取磁盘的对手可以看到这种等价性（尽管只有等价性，而无法获取其内容）。

:::note
大多数引擎（包括 "*MergeTree" 家族）在磁盘上创建索引文件时未应用编码。这意味着如果加密列已被索引，明文将出现在磁盘上。
:::

:::note
如果您在加密列中提及特定值的 SELECT 查询（例如在其 WHERE 子句中），该值可能出现在 [system.query_log](../../../operations/system-tables/query_log.md) 中。您可能希望禁用日志记录。
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
如果需要应用压缩，必须显式指定。否则，仅会对数据应用加密。
:::

**示例**

```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

## 临时表 {#temporary-tables}

:::note
请注意，临时表不被复制。因此，无法保证插入临时表中的数据将在其他副本中可用。临时表最主要的用例是用于在单个会话期间查询或连接小型外部数据集。
:::

ClickHouse 支持以下特性临时表：

- 临时表在会话结束时消失，包括如果连接丢失时。
- 当未指定引擎时，临时表使用 Memory 表引擎，并且它可以使用除 Replicated 和 `KeeperMap` 引擎以外的任何表引擎。
- 对于临时表，无法指定数据库。它是在数据库之外创建的。
- 无法通过在所有集群服务器上使用分布式 DDL 查询（使用 `ON CLUSTER`）创建临时表：该表仅在当前会话中存在。
- 如果临时表与另一个表同名，且查询在未指定数据库时指定了表名，则将使用临时表。
- 对于分布式查询处理，查询中使用 Memory 引擎的临时表会传递到远程服务器。

要创建临时表，请使用以下语法：

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

在大多数情况下，临时表不是手动创建的，而是在查询中使用外部数据时，或用于分布式 `(GLOBAL) IN`。有关更多信息，请参见相关部分。

也可以使用 [ENGINE = Memory](../../../engines/table-engines/special/memory.md) 表替代临时表。

## REPLACE TABLE {#replace-table}

`REPLACE` 语句允许您以 [原子方式](/concepts/glossary#atomicity) 更新表。

:::note
此语句支持 [`Atomic`](../../../engines/database-engines/atomic.md) 和 [`Replicated`](../../../engines/database-engines/replicated.md) 数据库引擎，这是 ClickHouse 和 ClickHouse Cloud 的默认数据库引擎。
:::

通常，如果您需要从表中删除一些数据，
可以创建一个新表并填充它，使用 `SELECT` 语句以不检索不需要的数据，
然后删除旧表并重命名新表。
该方法在下面的示例中得以展示：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

除了上述方法外，您还可以使用 `REPLACE`（前提是您使用默认数据库引擎）来实现相同的结果：

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```

### 语法 {#syntax}

```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
所有 `CREATE` 语句的语法形式也适用于此语句。在不存在的表上调用 `REPLACE` 会导致错误。
:::

### 示例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Local" default>

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

我们可以使用 `REPLACE` 语句清除所有数据：

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

或者可以使用 `REPLACE` 语句更改表结构：

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
<TabItem value="cloud_replace_example" label="Cloud">

考虑 ClickHouse Cloud 上的以下表：

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

1    test
```

我们可以使用 `REPLACE` 语句清除所有数据：

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

或者可以使用 `REPLACE` 语句更改表结构：

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

创建表时可以为其添加注释。

**语法**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```

**示例**

查询：

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

结果：

```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```

## 相关内容 {#related-content}

- 博客：[优化 ClickHouse 的架构和编解码器](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
