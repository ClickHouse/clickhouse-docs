---
description: '表的文档'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建一个新表。根据使用场景,此查询可以有各种语法形式。

默认情况下,表仅在当前服务器上创建。分布式 DDL 查询以 `ON CLUSTER` 子句实现,该子句在[单独描述](../../../sql-reference/distributed-ddl.md)。


## 语法形式 {#syntax-forms}

### 使用显式架构 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

在 `db` 数据库中创建一个名为 `table_name` 的表,如果未设置 `db`,则在当前数据库中创建,表结构在括号中指定,使用 `engine` 引擎。
表的结构是列描述、二级索引、投影和约束的列表。如果引擎支持[主键](#primary-key),它将被指定为表引擎的参数。

在最简单的情况下,列描述为 `name type`。示例:`RegionID UInt32`。

也可以为默认值定义表达式(见下文)。

如有必要,可以指定主键,包含一个或多个键表达式。

可以为列和表添加注释。


### 使用与另一张表类似的架构 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表具有相同结构的表。您可以为表指定不同的引擎。如果未指定引擎,将使用与 `db2.name2` 表相同的引擎。


### 使用从另一个表克隆的架构和数据 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一个表具有相同结构的表。您可以为表指定不同的引擎。如果未指定引擎,将使用与 `db2.name2` 表相同的引擎。创建新表后,`db2.name2` 的所有分区都会附加到该表。换句话说,在创建时会将 `db2.name2` 的数据克隆到 `db.table_name` 中。此查询等效于以下内容:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```


### 从表函数 {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个结果与指定的[表函数](/sql-reference/table-functions)相同的表。创建的表在行为上也与所指定的相应表函数相同。


### 从 SELECT 查询 {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个结构类似于 `SELECT` 查询结果的表,使用 `engine` 引擎,并用来自 `SELECT` 的数据填充它。您还可以显式指定列描述。

如果表已存在且指定了 `IF NOT EXISTS`,则查询不会执行任何操作。

查询中 `ENGINE` 子句之后可以有其他子句。请参阅[表引擎](/engines/table-engines)描述中有关如何创建表的详细文档。

**示例**

查询:

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

列定义中数据类型后的 `NULL` 和 `NOT NULL` 修饰符允许或不允许它为 [Nullable](/sql-reference/data-types/nullable)。

如果类型不是 `Nullable` 且指定了 `NULL`,它将被视为 `Nullable`;如果指定了 `NOT NULL`,则不会。例如,`INT NULL` 与 `Nullable(INT)` 相同。如果类型是 `Nullable` 且指定了 `NULL` 或 `NOT NULL` 修饰符,将抛出异常。

另请参阅 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 设置。

## 默认值 {#default_values}

列描述可以以 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr` 的形式指定默认值表达式。示例:`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略它,必须显式指定列类型,默认值对于数字列为 `0`,对于字符串列为 `''`(空字符串),对于数组列为 `[]`(空数组),对于日期列为 `1970-01-01`,对于可空列为 `NULL`。

默认值列的列类型可以省略,在这种情况下,它从 `expr` 的类型推断。例如,列 `EventDate DEFAULT toDate(EventTime)` 的类型将是 date。

如果同时指定了数据类型和默认值表达式,将插入一个隐式类型转换函数,将表达式转换为指定的类型。示例:`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 检查表结构的更改不会在表达式计算中引入循环。对于 INSERT,它检查表达式是否可解析 - 即可以从中计算的所有列都已传递。

### DEFAULT {#default}

`DEFAULT expr`

普通默认值。如果在 INSERT 查询中未指定此列的值,它将从 `expr` 计算。

示例:

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

物化表达式。插入行时,此类列的值会根据指定的物化表达式自动计算。在 `INSERT` 期间无法显式指定值。

此外,此类型的默认值列不包含在 `SELECT *` 的结果中。这是为了保持 `SELECT *` 的结果始终可以使用 `INSERT` 插入回表中的不变性。可以使用设置 `asterisk_include_materialized_columns` 禁用此行为。

示例:

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

临时列。此类型的列不存储在表中,无法从中 SELECT。临时列的唯一目的是从中构建其他列的默认值表达式。

未显式指定列的插入将跳过此类型的列。这是为了保持 `SELECT *` 的结果始终可以使用 `INSERT` 插入回表中的不变性。

示例:

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

计算列(同义词)。此类型的列不存储在表中,无法向其中 INSERT 值。

当 SELECT 查询显式引用此类型的列时,该值在查询时从 `expr` 计算。默认情况下,`SELECT *` 排除 ALIAS 列。可以使用设置 `asterisk_include_alias_columns` 禁用此行为。

使用 ALTER 查询添加新列时,不会写入这些列的旧数据。相反,在读取没有新列值的旧数据时,默认情况下会动态计算表达式。但是,如果运行表达式需要查询中未指示的不同列,则将额外读取这些列,但仅针对需要它的数据块。

如果您向表中添加了新列但后来更改了其默认表达式,则用于旧数据的值将更改(对于未将值存储在磁盘上的数据)。请注意,在运行后台合并时,缺少在其中一个合并部分中的列的数据将写入合并部分。

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

您可以在创建表时定义[主键](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)。主键可以通过两种方式指定:

* 在列列表内

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

* 在列列表外

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
您不能在一个查询中组合两种方式。
:::


## 约束 {#constraints}

除了列描述外,还可以定义约束:

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

`boolean_expr_1` 可以是任何布尔表达式。如果为表定义了约束,`INSERT` 查询中的每一行都将检查每个约束。如果不满足任何约束,服务器将引发包含约束名称和检查表达式的异常。

添加大量约束会对大型 `INSERT` 查询的性能产生负面影响。


### ASSUME {#assume}

`ASSUME` 子句用于在表上定义假定为真的 `CONSTRAINT`。然后优化器可以使用此约束来增强 SQL 查询的性能。

以下示例在创建 `users_a` 表时使用了 `ASSUME CONSTRAINT`:

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

这里,`ASSUME CONSTRAINT` 用于断言 `length(name)` 函数始终等于 `name_len` 列的值。这意味着每当在查询中调用 `length(name)` 时,ClickHouse 可以用 `name_len` 替换它,这应该更快,因为它避免了调用 `length()` 函数。

然后,在执行查询 `SELECT name FROM users_a WHERE length(name) < 5;` 时,ClickHouse 可以将其优化为 `SELECT name FROM users_a WHERE name_len < 5`;因为 `ASSUME CONSTRAINT`。这可以使查询运行得更快,因为它避免了为每一行计算 `name` 的长度。

`ASSUME CONSTRAINT` **不强制执行约束**,它只是告知优化器约束为真。如果约束实际上不为真,查询的结果可能不正确。因此,只有在确定约束为真时才应使用 `ASSUME CONSTRAINT`。


## TTL 表达式 {#ttl-expression}

定义值的存储时间。只能为 MergeTree 系列表指定。有关详细说明，请参阅 [列和表的 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## 列压缩编解码器 {#column_compression_codec}

默认情况下,ClickHouse 在自管理版本中应用 `lz4` 压缩,在 ClickHouse Cloud 中应用 `zstd`。

对于 `MergeTree` 引擎系列,您可以在服务器配置的 [compression](/operations/server-configuration-parameters/settings#compression) 部分中更改默认压缩方法。

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

可以指定 `Default` 编解码器来引用默认压缩,这可能取决于运行时的不同设置(和数据的属性)。
示例:`value UInt64 CODEC(Default)` — 与缺少编解码器规范相同。

您还可以从列中删除当前的 CODEC 并使用 config.xml 中的默认压缩:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

编解码器可以在流水线中组合使用,例如 `CODEC(Delta, Default)`。

:::tip
您无法使用 `lz4` 等外部工具解压缩 ClickHouse 数据库文件。请改用专用的 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor) 工具。
:::

以下表引擎支持压缩:

* [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列。支持列压缩编解码器,并可以通过 [compression](/operations/server-configuration-parameters/settings#compression) 设置选择默认压缩方法。
* [Log](../../../engines/table-engines/log-family/index.md) 系列。默认使用 `lz4` 压缩方法,并支持列压缩编解码器。
* [Set](../../../engines/table-engines/special/set.md)。仅支持默认压缩。
* [Join](../../../engines/table-engines/special/join.md)。仅支持默认压缩。

ClickHouse 支持通用编解码器和专用编解码器。


### 通用编解码器 {#general-purpose-codecs}

#### NONE {#none}

`NONE` — 无压缩。

#### LZ4 {#lz4}

`LZ4` — 默认使用的无损[数据压缩算法](https://github.com/lz4/lz4)。使用 LZ4 快速压缩。

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — 具有可配置压缩级别的 LZ4 HC（高压缩）算法。默认级别：9。当 `level <= 0` 时使用默认级别。可选级别范围：[1, 12]。推荐级别范围：[4, 9]。

#### ZSTD {#zstd}

`ZSTD[(level)]` — 具有可配置 `level` 的 [ZSTD 压缩算法](https://en.wikipedia.org/wiki/Zstandard)。可能的级别:\[1, 22\]。默认级别:1。

高压缩级别对于不对称场景很有用,例如压缩一次,重复解压缩。更高的级别意味着更好的压缩和更高的 CPU 使用率。

#### 已弃用：ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

#### 已弃用：DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

### 专用编解码器 {#specialized-codecs}

这些编解码器旨在通过利用数据的特定特征使压缩更有效。其中一些编解码器本身不压缩数据,而是预处理数据,以便使用通用编解码器的第二压缩阶段可以实现更高的数据压缩率。

#### Delta {#delta}

`Delta(delta_bytes)` — 压缩方法,其中原始值被两个相邻值的差值替换,除了保持不变的第一个值。`delta_bytes` 是原始值的最大大小,默认值为 `sizeof(type)`。将 `delta_bytes` 指定为参数已弃用,将在未来版本中删除支持。Delta 是数据准备编解码器,即它不能单独使用。

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — 计算增量的增量并以紧凑的二进制形式写入。`bytes_size` 与 [Delta](#delta) 编解码器中的 `delta_bytes` 具有类似的含义。将 `bytes_size` 指定为参数已弃用,将在未来版本中删除支持。对于具有恒定步长的单调序列(如时间序列数据),可以实现最佳压缩率。可用于任何数字类型。实现 Gorilla TSDB 中使用的算法,将其扩展为支持 64 位类型。对 32 位增量使用 1 个额外位:5 位前缀而不是 4 位前缀。有关更多信息,请参阅 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf) 中的压缩时间戳。DoubleDelta 是数据准备编解码器,即它不能单独使用。

#### GCD {#gcd}

`GCD()` - 计算列中值的最大公约数(GCD),然后将每个值除以 GCD。可用于整数、小数和日期/时间列。该编解码器非常适合值以 GCD 的倍数变化(增加或减少)的列,例如 24、28、16、24、8、24(GCD = 4)。GCD 是数据准备编解码器,即它不能单独使用。

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — 计算当前和前一个浮点值之间的按位异或 (XOR),并以紧凑的二进制形式写入。连续值之间的差异越小,即序列的值变化越慢,压缩率越好。实现 Gorilla TSDB 中使用的算法,将其扩展为支持 64 位类型。可能的 `bytes_size` 值:1、2、4、8,如果等于 1、2、4 或 8,默认值为 `sizeof(type)`。在所有其他情况下,默认为 1。有关更多信息,请参阅 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078) 中的第 4.1 节。

#### FPC {#fpc}

`FPC(level, float_size)` - 使用两个预测器中较好的一个重复预测序列中的下一个浮点值,然后 XOR 实际值与预测值,并对结果进行前导零压缩。与 Gorilla 类似,这在存储缓慢变化的浮点值序列时很有效。对于 64 位值(double),FPC 比 Gorilla 快,对于 32 位值,您的结果可能会有所不同。可能的 `level` 值:1-28,默认值为 12。可能的 `float_size` 值:4、8,如果类型为 Float,默认值为 `sizeof(type)`。在所有其他情况下,它是 4。有关算法的详细说明,请参阅 [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)。

#### T64 {#t64}

`T64` — 一种压缩方法,用于裁剪整数数据类型(包括 `Enum`、`Date` 和 `DateTime`)中值的未使用高位。在其算法的每一步,编解码器获取一个包含 64 个值的块,将它们放入 64x64 位矩阵中,对矩阵进行转置,裁剪值的未使用位,并将剩余部分作为序列返回。未使用的位是指在应用该压缩的整个数据分片中,在最大值和最小值之间没有差异的那些比特位。

`DoubleDelta` 和 `Gorilla` 编解码器在 Gorilla TSDB 中用作其压缩算法的组件。当存在值及其时间戳随时间缓慢变化的序列时,Gorilla 方法非常有效。时间戳由 `DoubleDelta` 编解码器高效压缩,数值由 `Gorilla` 编解码器高效压缩。例如,要获得高效存储的表,您可以按以下配置创建它:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```


### 加密编解码器 {#encryption-codecs}

这些编解码器实际上不压缩数据,而是加密磁盘上的数据。只有在 [encryption](/operations/server-configuration-parameters/settings#encryption) 设置指定加密密钥时,这些才可用。请注意,加密只在编解码器管道的末尾有意义,因为加密数据通常无法以任何有意义的方式压缩。

加密编解码器:

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — 使用 AES-128 以 [RFC 8452](https://tools.ietf.org/html/rfc8452) 中定义的 GCM-SIV 模式加密数据。

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — 在 GCM-SIV 模式下使用 AES-256 加密数据。

这些编解码器使用固定的 nonce,因此加密是确定性的。这使其与 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 等去重引擎兼容,但有一个弱点:当同一数据块被加密两次时,生成的密文将完全相同,因此可以读取磁盘的对手可以看到这种等价性(尽管只是等价性,而不获取其内容)。

:::note
包括 &quot;*MergeTree&quot; 系列在内的大多数引擎在磁盘上创建索引文件时不应用编解码器。这意味着如果对加密列建立索引,明文将出现在磁盘上。
:::

:::note
如果您执行在加密列中提到特定值的 SELECT 查询(例如在其 WHERE 子句中),该值可能会出现在 [system.query&#95;log](../../../operations/system-tables/query_log.md) 中。您可能希望禁用日志记录。
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
如果需要进行压缩,则必须显式指定。否则将只对数据进行加密。
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
请注意，临时表不会被复制。因此，无法保证插入临时表的数据在其他副本中可用。临时表的主要使用场景是在单个会话期间查询或关联小型外部数据集。
:::

ClickHouse 支持具有以下特征的临时表：

* 会话结束时临时表会消失，即使连接丢失也是如此。
* 未指定引擎时，临时表使用 Memory 表引擎，并且可以使用除 Replicated 和 `KeeperMap` 引擎之外的任何表引擎。
* 不能为临时表指定数据库。它是在数据库之外创建的。
* 无法使用分布式 DDL 查询在所有集群服务器上创建临时表（使用 `ON CLUSTER`）：此表仅存在于当前会话中。
* 如果临时表与另一个表同名，并且查询仅指定表名而未指定数据库，则将使用该临时表。
* 对于分布式查询处理，查询中使用的、具有 Memory 引擎的临时表会被传递到远程服务器。

要创建临时表，请使用以下语法：

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

在大多数情况下,临时表不是手动创建的,而是在使用外部数据进行查询时或用于分布式 `(GLOBAL) IN` 时才会创建。有关更多信息,请参阅相应的部分。

可以使用 [ENGINE = Memory](../../../engines/table-engines/special/memory.md) 引擎的表代替临时表。


## REPLACE TABLE {#replace-table}

`REPLACE` 语句允许您[原子地](/concepts/glossary#atomicity)更新表。

:::note
此语句支持 [`Atomic`](../../../engines/database-engines/atomic.md) 和 [`Replicated`](../../../engines/database-engines/replicated.md) 数据库引擎，
这分别是 ClickHouse 和 ClickHouse Cloud 的默认数据库引擎。
:::

通常情况下，如果您需要从表中删除某些数据，可以创建一个新表，并使用一个不会检索不需要数据的 `SELECT` 语句将其填充，然后删除旧表并重命名新表。下面的示例演示了这种方法：

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

除了上述方法外，在使用默认数据库引擎的情况下，还可以使用 `REPLACE` 来达到同样的效果：

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
`CREATE` 语句的所有语法形式也适用于此语句。对不存在的表调用 `REPLACE` 将会报错。
:::


### 示例: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Local" default>

考虑以下表:

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

我们可以使用 `REPLACE` 语句清除所有数据:

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

或者我们可以使用 `REPLACE` 语句更改表结构:

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

考虑 ClickHouse Cloud 上的以下表:

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

我们可以使用 `REPLACE` 语句清除所有数据:

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

或者我们可以使用 `REPLACE` 语句更改表结构:

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

您可以在创建表时为表添加注释。

**语法**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```

:::note
`COMMENT` 子句必须在任何存储相关子句之后指定，例如 `PARTITION BY`、`ORDER BY` 和存储相关的 `SETTINGS`。

在 `COMMENT` 子句之后，只会解析查询相关的 `SETTINGS`（例如 `max_threads` 等），而不会解析与存储相关的 `SETTINGS`。

这意味着正确的子句顺序是：

* `ENGINE`
* 存储子句
* `COMMENT`
* 查询设置（如果有）
  :::

**示例**

查询:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

结果:

```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```


## 相关内容 {#related-content}

- 博客: [使用 Schema 和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)