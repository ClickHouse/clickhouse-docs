import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建新表。此查询可以根据用例具有多种语法形式。

默认情况下，表仅在当前服务器上创建。分布式 DDL 查询通过 `ON CLUSTER` 子句实现，具体[单独描述](../../../sql-reference/distributed-ddl.md)。

## 语法形式 {#syntax-forms}

### 显式模式 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

在 `db` 数据库中创建一个名为 `table_name` 的表，或者如果未设置 `db`，则在当前数据库中创建，结构在括号中指定，并使用 `engine` 引擎。
表的结构是一列描述、二级索引和约束的列表。如果引擎支持[主键](#primary-key)，它将作为表引擎的参数指示。

列描述的最简单形式是 `name type`。示例：`RegionID UInt32`。

还可以为默认值定义表达式（见下文）。

如果必要，可以指定主键，包含一个或多个关键表达式。

可以为列和表添加注释。

### 类似于其他表的模式 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表结构相同的表。您可以为该表指定不同的引擎。如果未指定引擎，将使用与 `db2.name2` 表相同的引擎。

### 从另一个表克隆的模式和数据 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表结构相同的表。您可以为该表指定不同的引擎。如果未指定引擎，将使用与 `db2.name2` 表相同的引擎。新表创建后，将所有来自 `db2.name2` 的分区附加到它。换句话说，`db2.name2` 的数据在创建时克隆到 `db.table_name`。此查询等效于以下内容：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### 从表函数 {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个具有与指定的[表函数](/sql-reference/table-functions)相同结果的表。创建的表也将以与所指定的相应表函数相同的方式工作。

### 从 SELECT 查询 {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个结构与 `SELECT` 查询结果相似的表，使用 `engine` 引擎，并用来自 `SELECT` 的数据填充它。您还可以显式指定列的描述。

如果表已经存在并且指定了 `IF NOT EXISTS`，则查询将不执行任何操作。

查询中的 `ENGINE` 子句后可以有其他子句。有关如何创建表的详细文档，请参见[表引擎](/engines/table-engines)的描述。

:::tip
在 ClickHouse Cloud 中，请将此分为两步：
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

列定义中数据类型后的 `NULL` 和 `NOT NULL` 修饰符允许或不允许它为[Nullable](/sql-reference/data-types/nullable)。

如果类型不是 `Nullable`，并且指定了 `NULL`，则将其视为 `Nullable`；如果指定了 `NOT NULL`，则不会。例如，`INT NULL` 等同于 `Nullable(INT)`。如果类型是 `Nullable` 并且指定了 `NULL` 或 `NOT NULL` 修饰符，将引发异常。

另请参见设置 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable)。

## 默认值 {#default_values}

列描述可以指定默认值表达式，形式为 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr`。示例：`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略，则必须显式指定列类型，默认值将是数字列的 `0`，字符串列的 `''`（空字符串），数组列的 `[]`（空数组），日期列的 `1970-01-01`，或可为NULL列的 `NULL`。

可以省略默认值列的列类型，在这种情况下将从 `expr` 的类型推断。示例：`EventDate DEFAULT toDate(EventTime)` 的列类型将是日期。

如果指定了数据类型和默认值表达式，将插入隐式类型转换函数，将表达式转换为指定的类型。示例：`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 检查表结构的变化是否引入了表达式计算中的循环。对于 INSERT，它检查表达式是否可解析——即可以计算的所有列已被传递。

### DEFAULT {#default}

`DEFAULT expr`

正常默认值。如果在 INSERT 查询中未指定此类列的值，则从 `expr` 计算。

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

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

物化表达式。此类列的值在插入行时将根据指定的物化表达式自动计算。在 `INSERT` 中无法显式指定这些值。

此外，此类型的默认值列不包含在 `SELECT *` 的结果中。这是为了保持 `SELECT *` 的结果始终可以通过 `INSERT` 重新插入表的恒定性。此行为可以通过设置 `asterisk_include_materialized_columns` 禁用。

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

### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

短暂列。这种类型的列不存储在表中，无法从中 SELECT。短暂列的唯一目的是从中构建其他列的默认值表达式。

不显式指定列的插入将跳过这种类型的列。这是为了保持 `SELECT *` 的结果始终可以通过 `INSERT` 重新插入表的恒定性。

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

### ALIAS {#alias}

`ALIAS expr`

计算列（同义词）。这种类型的列不存储在表中，无法向其插入值。

当 SELECT 查询显式引用这种类型的列时，将在查询时间根据 `expr` 计算该值。默认情况下，`SELECT *` 排除 ALIAS 列。通过设置 `asterisk_include_alias_columns` 可以禁用此行为。

在使用 ALTER 查询添加新列时，不会写入这些列的旧数据。在读取没有新列值的旧数据时，表达式默认情况下实时计算。然而，如果运行表达式需要在查询中未指明的不同列，这些列也将被额外读取，但仅针对需要的块数据。

如果您向表添加新列，但后来更改其默认表达式，则用于旧数据的值将发生变化（对于未存储在磁盘上的值的数据）。请注意，在运行后台合并时，缺少某些合并部分的列将写入合并部分。

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

创建表时可以定义[主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)。主键可以用两种方式指定：

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

除了列描述，约束也可以被定义：

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

`boolean_expr_1` 可以是任何布尔表达式。如果为表定义了约束，则将在每个 `INSERT` 查询的每一行上检查它们。如果任何约束不满足——服务器将引发包含约束名称和检查表达式的异常。

添加大量约束可能会对大 `INSERT` 查询的性能产生负面影响。

### ASSUME {#assume}

`ASSUME` 子句用于定义假定为真的表的 `CONSTRAINT`。然后优化器可以使用该约束来提高 SQL 查询的性能。

以下示例中，`ASSUME CONSTRAINT` 在 `users_a` 表的创建中被使用：

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

在这里，`ASSUME CONSTRAINT` 用于断言 `length(name)` 函数始终等于 `name_len` 列的值。这意味着每当在查询中调用 `length(name)` 时，ClickHouse 可以用 `name_len` 替换它，因为这样会更快，因为避免了调用 `length()` 函数。

然后，在执行查询 `SELECT name FROM users_a WHERE length(name) < 5;` 时，ClickHouse 可以将其优化为 `SELECT name FROM users_a WHERE name_len < 5`；这是因为 `ASSUME CONSTRAINT`。这可能会使查询运行更快，因为它避免了计算每一行的 `name` 的长度。

`ASSUME CONSTRAINT` **不强制执行约束**，它仅通知优化器该约束成立。如果约束实际上不成立，查询的结果可能不正确。因此，只有在您确定约束成立时，才应使用 `ASSUME CONSTRAINT`。

## TTL 表达式 {#ttl-expression}

定义值的存储时间。仅可为 MergeTree 家族的表指定。有关详细描述，请参见[列和表的 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## 列压缩编解码器 {#column_compression_codec}

默认情况下，ClickHouse 在自管理版本中应用 `lz4` 压缩，在 ClickHouse Cloud 中应用 `zstd`。

对于 `MergeTree` 引擎家族，您可以在服务器配置的[压缩](/operations/server-configuration-parameters/settings#compression)部分更改默认压缩方法。

您还可以在 `CREATE TABLE` 查询中为每个单独的列定义压缩方法。

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

可以指定 `Default` 编解码器以引用可能依赖于不同设置（和数据属性）的默认压缩（在运行时）。
示例：`value UInt64 CODEC(Default)` ——与缺少编解码器的规格相同。

您还可以从列中删除当前 CODEC，并使用来自 config.xml 的默认压缩：

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

编解码器可以在管道中组合，例如 `CODEC(Delta, Default)`。

:::tip
您无法使用外部工具（如 `lz4`）解压 ClickHouse 数据库文件。相反，请使用特殊的 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) 工具。
:::

以下表引擎支持压缩：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族。支持列压缩编解码器并通过[压缩](/operations/server-configuration-parameters/settings#compression)设置选择默认压缩方法。
- [Log](../../../engines/table-engines/log-family/index.md) 家族。默认使用 `lz4` 压缩方法，并支持列压缩编解码器。
- [Set](../../../engines/table-engines/special/set.md)。仅支持默认压缩。
- [Join](../../../engines/table-engines/special/join.md)。仅支持默认压缩。

ClickHouse 支持通用编解码器和专用编解码器。

### 通用编解码器 {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 无压缩。

#### LZ4 {#lz4}

`LZ4` — 默认使用的无损[数据压缩算法](https://github.com/lz4/lz4)。应用 LZ4 快速压缩。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — LZ4 HC（高压缩）算法，具有可配置级别。默认级别：9。将 `level <= 0` 应用默认级别。可选级别：[1, 12]。建议级别范围：[4, 9]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)，具有可配置的 `level`。可选级别：[1, 22]。默认级别：1。

高压缩级别适用于不对称场景，例如压缩一次，重复解压。更高的级别意味着更好的压缩和更高的 CPU 使用。

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)，具有可配置级别，由 [Intel® QATlib](https://github.com/intel/qatlib) 和 [Intel® QAT ZSTD 插件](https://github.com/intel/QAT-ZSTD-Plugin) 实现。可选级别：[1, 12]。默认级别：1。建议级别范围：[6, 12]。适用一些限制：

- ZSTD_QAT 默认禁用，仅在启用配置设置 [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) 后使用。
- 对于压缩，ZSTD_QAT 尝试使用 Intel® QAT 卸载设备（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）。如果找不到此类设备，将回退到软件中的 ZSTD 压缩。
- 解压始终在软件中执行。

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Deflate 压缩算法](https://github.com/intel/qpl)，由 Intel® 查询处理库实现。适用一些限制：

- DEFLATE_QPL 默认禁用，仅在启用配置设置 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) 后使用。
- DEFLATE_QPL 需要使用 SSE 4.2 指令编译的 ClickHouse 构建（默认情况下，这种情况是）。有关更多详细信息，请参阅[使用 DEFLATE_QPL 编译 ClickHouse](/development/building_and_benchmarking_deflate_qpl)。
- 如果系统具有 Intel® IAA（内存分析加速器）卸载设备，DEFLATE_QPL 的效果最好。有关更多详细信息，请参阅 [加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) 和 [使用 DEFLATE_QPL 进行基准测试](/development/building_and_benchmarking_deflate_qpl)。
- DEFLATE_QPL 压缩的数据仅能在编译时启用了 SSE 4.2 的 ClickHouse 节点之间传输。

### 专用编解码器 {#specialized-codecs}

这些编解码器旨在通过利用数据的特定特征来使压缩更加有效。其中一些编解码器本身不压缩数据，而是对数据进行预处理，以使使用通用编解码器的第二个压缩阶段能够实现更高的数据压缩率。

#### Delta {#delta}

`Delta(delta_bytes)` — 一种压缩方法，其中原始值由两个相邻值的差替换，除了第一个值保持不变。最多使用 `delta_bytes` 存储增量值，因此 `delta_bytes` 是原始值的最大大小。可能的 `delta_bytes` 值：1、2、4、8。默认值为 `sizeof(type)` 如果等于 1、2、4 或 8。在所有其他情况下，它为 1。Delta 是一种数据准备编解码器，即不能单独使用。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 计算增量的增量，并以紧凑的二进制形式写入。可能的 `bytes_size` 值：1、2、4、8，默认值为 `sizeof(type)` 如果等于 1、2、4 或 8。在所有其他情况下，它为 1。对具有恒定间隔的单调序列（如时间序列数据）可以实现最佳压缩率。可以与任何固定宽度类型一起使用。实现了 Gorilla TSDB 中使用的算法，扩展以支持 64 位类型。32 位增量使用 1 位额外位：5 位前缀而不是 4 位前缀。有关额外信息，请参阅 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf) 中的压缩时间戳。DoubleDelta 是一种数据准备编解码器，即不能单独使用。

#### GCD {#gcd}

`GCD()` - 计算列中值的最大公约数 (GCD)，然后将每个值除以 GCD。可以与整数、小数和日期/时间列一起使用。该编解码器非常适合于变化（增加或减少）以 GCD 倍数变化的列，例如 24、28、16、24、8、24（GCD = 4）。GCD 是一种数据准备编解码器，即不能单独使用。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 计算当前和先前浮点值之间的 XOR，并以紧凑的二进制形式写入。连续值之间的差异越小，即序列的值变化越慢，压缩率越高。实现了 Gorilla TSDB 中使用的算法，扩展以支持 64 位类型。可能的 `bytes_size` 值：1、2、4、8，默认值为 `sizeof(type)` 如果等于 1、2、4 或 8。在所有其他情况下，它为 1。有关额外信息，请参阅 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) 中的第 4.1 节。

#### FPC {#fpc}

`FPC(level, float_size)` - 反复预测序列中的下一个浮点值，使用两个预测者中的较好者，然后将实际值与预测值进行 XOR 运算，并进行前导零压缩。与 Gorilla 类似，当存储一系列变化缓慢的浮点值时，这种方法是高效的。对于 64 位值（双精度），FPC 比 Gorilla 更快，32 位值的效果可能有所不同。可能的 `level` 值：1-28，默认值为 12。可能的 `float_size` 值：4、8，默认值为 `sizeof(type)` 如果类型为 Float。在所有其他情况下，为 4。有关算法的详细描述，请参见 [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)。

#### T64 {#t64}

`T64` — 一种压缩方法，剪裁整型数据类型（包括 `Enum`、`Date` 和 `DateTime`）中未使用的高位。在每一步的算法中，编解码器获取一个 64 值的块，将它们放入 64x64 位矩阵中，进行转置，剪裁未使用的位值并将剩余部分作为序列返回。未使用的位是当前压缩数据部分中最大和最小值之间不差异的位。

`DoubleDelta` 和 `Gorilla` 编解码器作为其压缩算法的组成部分在 Gorilla TSDB 中使用。Gorilla 方法在存在逐渐变化的值序列及其时间戳的情况下是有效的。时间戳通过 `DoubleDelta` 编解码器有效压缩，值通过 `Gorilla` 编解码器有效压缩。例如，为了获得有效存储的表，您可以按照以下配置创建它：

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 加密编解码器 {#encryption-codecs}

这些编解码器实际上不压缩数据，而是对磁盘上的数据进行加密。仅在通过[加密](/operations/server-configuration-parameters/settings#encryption)设置指定加密密钥时可用。请注意，加密仅在编解码器管道的末尾是有意义的，因为加密的数据通常无法以任何有意义的方式进行压缩。

加密编解码器：

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — 使用 AES-128 以 [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV 模式加密数据。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — 使用 AES-256 以 GCM-SIV 模式加密数据。

这些编解码器使用固定的 nonce，因此加密是确定性的。这使其与如[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)这样的去重引擎兼容，但存在一个缺陷：当相同的数据块加密两次时，生成的密文将完全相同，因此可以读取磁盘的对手可以看到这种相等性（尽管只有相等性，而不获取其内容）。

:::note
大多数引擎（包括 "*MergeTree" 家族）在不应用编解码器的情况下在磁盘上创建索引文件。这意味着如果加密列被索引，明文将出现在磁盘上。
:::

:::note
如果您执行 SELECT 查询而提及加密列中的特定值（例如在其 WHERE 子句中），该值可能会出现在 [system.query_log](../../../operations/system-tables/query_log.md) 中。您可能希望禁用日志记录。
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
如果需要应用压缩，必须显式指定。否则，仅对数据应用加密。
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
请注意，临时表不被复制。因此，无法保证插入临时表的数据将在其他副本中可用。临时表可以有用的主要用例是在单个会话中查询或连接小型外部数据集。
:::

ClickHouse 支持临时表，其具有以下特性：

- 临时表在会话结束时消失，包括连接丢失时。
- 临时表在未指定引擎时使用内存表引擎，并且可以使用除 Replicated 和 `KeeperMap` 引擎外的任何表引擎。
- 临时表无法指定数据库。它在数据库之外创建。
- 不可能在所有集群服务器上使用分布式 DDL 查询创建临时表（使用 `ON CLUSTER`）：该表仅存在于当前会话中。
- 如果临时表与另一张表同名，并且查询中指定了表名而未指定数据库，则将使用临时表。
- 对于分布式查询处理，查询中使用内存引擎的临时表会传递给远程服务器。

要创建临时表，请使用以下语法：

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

在大多数情况下，不会手动创建临时表，而是在使用外部数据进行查询或进行分布式 `(GLOBAL) IN` 时。有关更多信息，请参阅相应部分。

可以使用[ENGINE = Memory](../../../engines/table-engines/special/memory.md)的表代替临时表。

## REPLACE TABLE {#replace-table}

`REPLACE` 语句允许您[原子性](https://concepts.glossary#atomicity)地更新表。

:::note
该语句适用于 [`Atomic`](../../../engines/database-engines/atomic.md) 和 [`Replicated`](../../../engines/database-engines/replicated.md) 数据库引擎， 
它们分别是 ClickHouse 和 ClickHouse Cloud 的默认数据库引擎。
:::

通常，如果您需要从表中删除一些数据，
您可以创建一个新表，并用不检索不必要数据的 `SELECT` 语句填充它，
然后删除旧表并重命名新表。
以下示例演示了这种方法：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

除了上述方法外，您还可以使用 `REPLACE`（前提是您使用的是默认数据库引擎）来实现相同的结果：

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
`CREATE` 语句的所有语法形式也适用于此语句。调用不存在的表的 `REPLACE` 将导致错误。
:::

### 示例： {#examples}

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

或者我们可以使用 `REPLACE` 语句更改表结构：

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

考虑 ClickHouse Cloud 中的以下表： 

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

或者我们可以使用 `REPLACE` 语句更改表结构：

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

创建表时，可以向表添加注释。

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

- 博客: [通过模式和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
