---
description: 'CREATE TABLE 语句文档'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'CREATE TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建新表。根据具体用例，此查询可以采用多种语法形式。

默认情况下，表只会在当前服务器上创建。分布式 DDL 查询是通过 `ON CLUSTER` 子句实现的，该子句[单独说明](../../../sql-reference/distributed-ddl.md)。


## 语法形式

### 使用显式 Schema

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT '列的注释'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT '列的注释'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT '表的注释']
```

在 `db` 数据库中创建名为 `table_name` 的表；如果未设置 `db`，则在当前数据库中创建。表的结构在括号中指定，并使用 `engine` 引擎。

表的结构由列描述、二级索引和约束的列表组成。如果引擎支持[主键](#primary-key)，则会在表引擎的参数中指定。

在最简单的情况下，一列的描述为 `name type`。示例：`RegionID UInt32`。

还可以为默认值定义表达式（见下文）。

如有需要，可以指定主键，使用一个或多个键表达式。

可以为列和表添加注释。

### 使用与其他表类似的表结构

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一张表结构相同的表。可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。

### 使用从另一张表克隆的表结构和数据

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一张表结构相同的表。可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。新表创建完成后，会将 `db2.name2` 中的所有分区附加到该表上。换句话说，在创建时，`db2.name2` 的数据会被克隆到 `db.table_name` 中。此查询等价于以下内容：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### 通过表函数

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个表，其效果与指定的[表函数](/sql-reference/table-functions) 相同。创建的表在行为上也将与所指定的对应表函数一致。

### 通过 SELECT 查询

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个表，其结构与 `SELECT` 查询的结果相同，使用 `engine` 引擎，并将 `SELECT` 的结果数据写入该表。你也可以显式指定列的定义。

如果表已存在并且指定了 `IF NOT EXISTS`，则查询不会执行任何操作。

在查询的 `ENGINE` 子句之后还可以包含其他子句。有关如何创建表的详细文档，请参阅[表引擎](/engines/table-engines)的说明。

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

在列定义中，可以在数据类型之后使用 `NULL` 和 `NOT NULL` 修饰符，用于指定该列是否可以为 [Nullable](/sql-reference/data-types/nullable) 类型。

如果类型本身不是 `Nullable`，并且指定了 `NULL`，则该类型会被视为 `Nullable`；如果指定了 `NOT NULL`，则不会。例如，`INT NULL` 等同于 `Nullable(INT)`。如果类型已经是 `Nullable`，却仍然指定了 `NULL` 或 `NOT NULL` 修饰符，则会抛出异常。

另请参阅 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 设置。



## 默认值

列定义可以以 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr` 的形式指定默认值表达式。示例：`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略该表达式，则必须显式指定列类型，并且默认值将为：数值列为 `0`，字符串列为 `''`（空字符串），数组列为 `[]`（空数组），日期列为 `1970-01-01`，Nullable 列为 `NULL`。

默认值列的列类型可以省略，此时会从 `expr` 的类型中推断类型。例如，列 `EventDate DEFAULT toDate(EventTime)` 的类型将是 Date。

如果同时指定了数据类型和默认值表达式，则会插入一个隐式类型转换函数，将该表达式转换为指定类型。示例：`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 会检查对表结构的修改不会在表达式计算中引入循环。对于 INSERT，会检查表达式是可解析的——即所有用于计算这些表达式的列所依赖的列在 INSERT 中都已提供。

### DEFAULT

`DEFAULT expr`

普通默认值。如果在 INSERT 查询中未指定此类列的值，则会根据 `expr` 计算该值。

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

### MATERIALIZED

`MATERIALIZED expr`

物化表达式。在插入行时，此类列的值会根据指定的物化表达式自动计算。在执行 `INSERT` 时，不能显式指定这些值。

此外，此类型的默认值列不会包含在 `SELECT *` 的结果中。这样可以保持一个不变式：`SELECT *` 的结果始终可以通过 `INSERT` 重新插入到表中。可以通过设置 `asterisk_include_materialized_columns` 来禁用此行为。

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

### EPHEMERAL

`EPHEMERAL [expr]`

临时列。此类型的列不会存储在表中，也无法在 `SELECT` 查询中引用。临时列的唯一用途是基于它们构建其他列的默认值表达式。

未显式指定列名的插入操作会跳过此类型的列。这样可以保持一个不变式：`SELECT *` 的结果总是可以通过 `INSERT` 重新插入表中。

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
```


第 1 行:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714

````

### ALIAS {#alias}

`ALIAS expr`

计算列(同义词)。此类型的列不会存储在表中,且无法向其中插入(INSERT)值。

当 SELECT 查询显式引用此类型的列时,其值会在查询时根据 `expr` 计算得出。默认情况下,`SELECT *` 会排除 ALIAS 列。可以通过设置 `asterisk_include_alias_columns` 来禁用此行为。

使用 ALTER 查询添加新列时,这些列的旧数据不会被写入。相反,在读取没有新列值的旧数据时,默认情况下会即时计算表达式。但是,如果运行表达式需要查询中未指明的其他列,则这些列会被额外读取,但仅针对需要它们的数据块。

如果向表中添加新列但随后更改其默认表达式,则旧数据使用的值将发生变化(对于未在磁盘上存储值的数据)。请注意,在运行后台合并时,合并部分之一中缺失的列数据会被写入合并后的部分。

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
````


## 主键

在创建表时，可以定义[主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)。主键可以通过两种方式指定：

* 在列定义中

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

* 在列列表之外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
无法在同一个查询中同时使用这两种方式。
:::


## 约束

除了列描述之外，还可以定义约束条件：

### CONSTRAINT

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` 可以是任意布尔表达式。若为该表定义了约束，则在每条 `INSERT` 查询中，每一行都会检查所有约束。如果有任何一个约束不满足，服务器将抛出异常，并给出约束名称和检查表达式。

添加大量约束可能会对大批量 `INSERT` 查询的性能产生负面影响。

### ASSUME

`ASSUME` 子句用于在表上定义一个被假定为恒为真的 `CONSTRAINT`。优化器随后可以利用该约束来提升 SQL 查询的性能。

来看下面这个示例，其中在创建 `users_a` 表时使用了 `ASSUME CONSTRAINT`：

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

在这里，`ASSUME CONSTRAINT` 用于断言 `length(name)` 函数的结果始终等于 `name_len` 列的值。也就是说，在查询中每当调用 `length(name)` 时，ClickHouse 都可以将其替换为 `name_len`，这样会更快一些，因为可以避免实际调用 `length()` 函数。

然后，在执行查询 `SELECT name FROM users_a WHERE length(name) < 5;` 时，ClickHouse 可以因为存在 `ASSUME CONSTRAINT` 而将其优化为 `SELECT name FROM users_a WHERE name_len < 5;`。这可以让查询运行得更快，因为它避免了对每一行都计算 `name` 的长度。

`ASSUME CONSTRAINT` **并不会强制约束成立**，它只是告知优化器该约束被认为是成立的。如果该约束实际上并不成立，则查询结果可能会不正确。因此，仅当可以确定约束确实成立时，才应使用 `ASSUME CONSTRAINT`。


## TTL 表达式 {#ttl-expression}

定义值的存储时间。只能为 MergeTree 系列的表指定。有关详细说明，请参阅[列和表的 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。



## 列压缩编解码器

默认情况下，ClickHouse 在自托管版本中使用 `lz4` 压缩，在 ClickHouse Cloud 中使用 `zstd` 压缩。

对于 `MergeTree` 引擎系列，你可以在服务器配置的 [compression](/operations/server-configuration-parameters/settings#compression) 部分更改默认压缩方法。

你也可以在 `CREATE TABLE` 查询中为每一列单独定义压缩方法。

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

可以指定 `Default` 编解码器以使用默认压缩方式，该压缩方式在运行时可能取决于不同的设置（以及数据本身的属性）。
示例：`value UInt64 CODEC(Default)` — 等同于未指定编解码器。

你也可以从该列中移除当前的 CODEC，改为使用 config.xml 中配置的默认压缩方式：

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

可以将多个 codec 组合成一个管道，例如：`CODEC(Delta, Default)`。

:::tip
无法使用 `lz4` 等外部工具解压 ClickHouse 数据库文件。请改用专用的 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) 工具。
:::

以下表引擎支持压缩：

* [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列。支持列压缩 codec，并可通过 [compression](/operations/server-configuration-parameters/settings#compression) 设置选择默认压缩方法。
* [Log](../../../engines/table-engines/log-family/index.md) 系列。默认使用 `lz4` 压缩方法，并支持列压缩 codec。
* [Set](../../../engines/table-engines/special/set.md)。仅支持默认压缩。
* [Join](../../../engines/table-engines/special/join.md)。仅支持默认压缩。

ClickHouse 支持通用 codec 和专用 codec。

### 通用 Codec

#### NONE

`NONE` — 不进行压缩。

#### LZ4

`LZ4` — 默认使用的无损 [数据压缩算法](https://github.com/lz4/lz4)。采用 LZ4 快速压缩。

#### LZ4HC

`LZ4HC[(level)]` — 具有可配置级别的 LZ4 HC（高压缩率）算法。默认级别：9。设置 `level <= 0` 时使用默认级别。可选级别范围：[1, 12]。推荐级别范围：[4, 9]。

#### ZSTD

`ZSTD[(level)]` — 带可配置 `level` 的 [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)。可选级别范围：[1, 22]。默认级别：1。

较高压缩级别适用于非对称场景，例如压缩一次、多次解压。级别越高，压缩率越好，但 CPU 使用率越高。

#### ZSTD&#95;QAT

<CloudNotSupportedBadge />

`ZSTD_QAT[(level)]` — 由 [Intel® QATlib](https://github.com/intel/qatlib) 和 [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin) 实现、带可配置级别的 [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)。可选级别范围：[1, 12]。默认级别：1。推荐级别范围：[6, 12]。存在一些限制：

* ZSTD&#95;QAT 默认禁用，仅在启用配置项 [enable&#95;zstd&#95;qat&#95;codec](../../../operations/settings/settings.md#enable_zstd_qat_codec) 后才能使用。
* 对于压缩，ZSTD&#95;QAT 会尝试使用 Intel® QAT 硬件卸载设备（[QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)）。如果未找到此类设备，则会回退到软件实现的 ZSTD 压缩。
* 解压始终在软件中执行。

#### DEFLATE&#95;QPL

<CloudNotSupportedBadge />

`DEFLATE_QPL` — 由 Intel® Query Processing Library 实现的 [Deflate 压缩算法](https://github.com/intel/qpl)。存在一些限制：


- 默认情况下，DEFLATE_QPL 是禁用的，只有在启用配置项 [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec) 后才能使用。
- DEFLATE_QPL 要求 ClickHouse 在构建时启用 SSE 4.2 指令集（默认即为如此）。更多详情参见 [Build Clickhouse with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl)。
- 当系统具有 Intel® IAA（In-Memory Analytics Accelerator，内存内分析加速器）卸载设备时，DEFLATE_QPL 的效果最佳。更多详情参见 [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) 和 [Benchmark with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl)。
- 经过 DEFLATE_QPL 压缩的数据只能在启用 SSE 4.2 编译的 ClickHouse 节点之间进行传输。

### Specialized Codecs {#specialized-codecs}

这些编解码器通过利用数据的特定特性，使压缩更加高效。其中某些编解码器本身并不执行压缩，而是对数据进行预处理，从而使后续使用通用编解码器进行的第二阶段压缩能够达到更高的压缩率。

#### Delta {#delta}

`Delta(delta_bytes)` — 一种压缩方法，其中原始值被相邻两个值之间的差值所替代，只有第一个值保持不变。`delta_bytes` 是原始值的最大字节数，默认值为 `sizeof(type)`。将 `delta_bytes` 作为参数进行指定已被弃用，且在未来版本中将移除支持。Delta 是一种数据预处理编解码器，即不能单独使用。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 计算“差分的差分”，并以紧凑的二进制形式写入。`bytes_size` 的含义与 [Delta](#delta) 编解码器中的 `delta_bytes` 类似。将 `bytes_size` 作为参数进行指定已被弃用，且在未来版本中将移除支持。对于具有固定步长的单调序列（例如时间序列数据），可以达到最佳压缩率。可用于任意数值类型。实现了 Gorilla TSDB 中使用的算法，并扩展支持 64 位类型。对 32 位差分多使用 1 个额外比特：采用 5 位前缀而非 4 位前缀。更多信息参见 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf) 中的“Compressing Time Stamps”部分。DoubleDelta 是一种数据预处理编解码器，即不能单独使用。

#### GCD {#gcd}

`GCD()` — 计算列中数值的最大公约数（GCD），然后将每个数值除以该 GCD。可用于整数、十进制以及日期/时间列。该编解码器非常适合那些数值总是按 GCD 的倍数变化（增加或减少）的列，例如 24、28、16、24、8、24（GCD = 4）。GCD 是一种数据预处理编解码器，即不能单独使用。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 计算当前与前一个浮点值之间的按位异或（XOR），并以紧凑的二进制形式写入。连续值之间的差异越小，即序列值变化越缓慢，压缩率越好。实现了 Gorilla TSDB 中使用的算法，并扩展支持 64 位类型。可选的 `bytes_size` 值为：1、2、4、8，默认值为当其等于 1、2、4 或 8 时的 `sizeof(type)`；其他情况下默认为 1。更多信息参见 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) 的 4.1 节。

#### FPC {#fpc}



`FPC(level, float_size)` - 在序列中不断选择两个预测器中效果更好的一个来预测下一个浮点值，然后将实际值与预测值做 XOR，再对结果进行前导零压缩。类似于 Gorilla，当存储变化缓慢的一系列浮点值时，这种方式非常高效。对于 64 位值（double），FPC 比 Gorilla 更快；对于 32 位值，性能可能有所差异。`level` 可选值范围为 1-28，默认值为 12。`float_size` 可选值为 4、8，当类型是 Float 时默认值为 `sizeof(type)`，其他情况下为 4。关于该算法的详细描述，请参见 [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)。

#### T64

`T64` — 一种压缩方法，用于裁剪整数数据类型（包括 `Enum`、`Date` 和 `DateTime`）中未使用的高位。在其算法的每一步中，编解码器会取一个包含 64 个值的块，将其放入一个 64x64 位矩阵中，对矩阵进行转置，裁剪值中未使用的比特，并将剩余部分作为一个序列返回。未使用的比特是指：在用于压缩的整个数据部分中，在最大值与最小值之间保持不变的那些比特。

`DoubleDelta` 和 `Gorilla` 编解码器在 Gorilla TSDB 中被用作其压缩算法的组成部分。Gorilla 方法在存在一系列带时间戳的缓慢变化数值的场景中非常有效。时间戳由 `DoubleDelta` 编解码器进行高效压缩，而数值由 `Gorilla` 编解码器进行高效压缩。例如，为了获得高效存储的表，可以按如下配置来创建它：

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### 加密编解码器

这些编解码器实际上并不会压缩数据，而是对磁盘上的数据进行加密。它们仅在通过 [encryption](/operations/server-configuration-parameters/settings#encryption) 设置指定了加密密钥时可用。请注意，加密通常只在编解码器管道的末端才有意义，因为经过加密的数据通常无法再以有意义的方式进行压缩。

加密编解码器：

#### AES&#95;128&#95;GCM&#95;SIV

`CODEC('AES-128-GCM-SIV')` — 使用 [RFC 8452](https://tools.ietf.org/html/rfc8452) 中定义的 GCM-SIV 模式，通过 AES-128 对数据进行加密。

#### AES-256-GCM-SIV

`CODEC('AES-256-GCM-SIV')` — 在 GCM-SIV 模式下使用 AES-256 对数据进行加密。

这些编解码器使用固定的 nonce，因此加密是确定性的。这使得它与诸如 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 之类支持去重的引擎兼容，但也带来一个弱点：当同一个数据块被加密两次时，得到的密文将完全相同，因此能够读取磁盘的攻击者可以看出这种等价关系（尽管只能看到这种关系，而无法获取其内容）。

:::note
包括 “*MergeTree” 家族在内的大多数引擎会在磁盘上创建索引文件，而不会应用编解码器。这意味着如果某个加密列被建立索引，则其明文会出现在磁盘上。
:::

:::note
如果执行的 SELECT 查询在加密列中引用了某个特定值（例如在其 WHERE 子句中），该值可能会出现在 [system.query&#95;log](../../../operations/system-tables/query_log.md) 中。你可能需要禁用该日志记录。
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
如果需要使用压缩，必须显式指定；否则只会对数据进行加密。
:::

**示例**

```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```


## 临时表

:::note
请注意，临时表不会被复制。因此，无法保证插入到临时表中的数据在其他副本中也可用。临时表的主要使用场景是在单个会话期间用于查询或关联小规模的外部数据集。
:::

ClickHouse 支持临时表，其具有以下特性：

* 临时表在会话结束时会消失，包括连接丢失的情况。
* 当未指定引擎时，临时表使用 Memory 表引擎；此外，它可以使用除 Replicated 和 `KeeperMap` 引擎之外的任意表引擎。
* 不能为临时表指定 DB。它是在所有数据库之外创建的。
* 无法通过分布式 DDL 查询（使用 `ON CLUSTER`）在所有集群服务器上创建临时表：该表仅存在于当前会话中。
* 如果某个临时表与另一个表同名，并且查询只指定了表名而未指定 DB，则会使用临时表。
* 对于分布式查询处理，查询中使用的 Memory 引擎临时表会被传递到远程服务器。

要创建临时表，请使用以下语法：

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

在大多数情况下，临时表不是手动创建的，而是在查询中使用外部数据时，或者在执行分布式 `(GLOBAL) IN` 时自动创建。有关更多信息，请参阅相应章节。

可以使用 [ENGINE = Memory](../../../engines/table-engines/special/memory.md) 引擎的表来替代临时表。


## REPLACE TABLE

`REPLACE` 语句允许以[原子方式](/concepts/glossary#atomicity)更新一张表。

:::note
此语句适用于 [`Atomic`](../../../engines/database-engines/atomic.md) 和 [`Replicated`](../../../engines/database-engines/replicated.md) 数据库引擎，
它们分别是 ClickHouse 和 ClickHouse Cloud 的默认数据库引擎。
:::

通常，如果需要从一张表中删除某些数据，
可以创建一张新表，并使用排除不需要数据的 `SELECT` 语句来填充该表，
然后删除旧表并将新表重命名。
下面的示例演示了这种方法：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

除了上述方法以外，如果您使用的是默认数据库引擎，也可以使用 `REPLACE` 来实现相同的效果：

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```

### 语法

```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
`CREATE` 语句的所有语法形式同样适用于此语句。对不存在的表执行 `REPLACE` 会导致错误。
:::

### 示例：

<Tabs>
  <TabItem value="clickhouse_replace_example" label="本地" default>
    考虑如下表：

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

    我们可以使用 `REPLACE` 语句来清空所有数据：

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

    也可以使用 `REPLACE` 语句来更改表结构：

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
    考虑在 ClickHouse Cloud 中的如下表：

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

    我们可以使用 `REPLACE` 语句来清空所有数据：

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

    也可以使用 `REPLACE` 语句来更改表结构：

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


## COMMENT 子句

在创建表时，可以为表添加注释。

**语法**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT '备注'
```

**示例**

查询：

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '临时表';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

结果：

```text
┌─name─┬─comment─────────┐
│ t1   │ 临时表          │
└──────┴─────────────────┘
```


## 相关内容 {#related-content}

- 博客：[使用表结构和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
