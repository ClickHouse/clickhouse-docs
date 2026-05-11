---
sidebar_label: '技术参考'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Fivetran ClickHouse 目标端的类型对照、表引擎信息、元数据列和调试查询。'
title: '技术参考'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', '技术参考']
---

# 技术参考 \{#technical-reference\}

## 配置详情 \{#setup-details\}

### 用户和角色管理 \{#user-and-role-management\}

建议不要使用 `default` 用户；请改为创建一个专用用户，仅用于此 Fivetran 目标端。以下命令需使用 `default` 用户执行，并会创建一个具有所需特权的新 `fivetran_user`。

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

此外，您可以撤销 `fivetran_user` 对某些数据库的访问权限。
例如，执行以下文后，我们将限制对 `default` 数据库的访问权限：

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

您可以在 ClickHouse SQL 控制台中执行这些语句。

### 进阶配置 \{#advanced-configuration\}

ClickHouse Cloud 目标端支持可选的 JSON 配置文件，可用于更进阶的使用场景。您可以通过覆盖控制批次大小、并行度、连接池和请求超时的默认设置，精细调整目标端行为。

:::note
此配置完全可选。如果未上传文件，目标端将使用适用于大多数使用场景的合理默认值。
:::

该文件必须是有效的 JSON，并且符合下文描述的 schema。

如果您需要在初始设置完成后修改配置，可以在 Fivetran 仪表板中编辑目标端配置并上传更新后的文件。

该配置文件包含一个顶层部分：

```json
{
  "destination_configurations": { ... }
}
```

您可以在其中指定以下配置，用于控制 ClickHouse 目标端连接器自身的内部行为。
这些配置会影响连接器在将数据发送到 ClickHouse 之前处理数据的方式。

| 设置                       | 类型 | 默认值      | 允许范围            | 描述                                                                   |
| ------------------------ | -- | -------- | --------------- | -------------------------------------------------------------------- |
| `write_batch_size`       | 整数 | `100000` | 5,000 – 100,000 | 插入、更新和替换操作中，每个批次包含的行数。                                               |
| `select_batch_size`      | 整数 | `1500`   | 200 – 1,500     | 更新期间用于 SELECT 查询的每个批次包含的行数。                                          |
| `mutation_batch_size`    | 整数 | `1500`   | 200 – 1,500     | 历史模式下，ALTER TABLE UPDATE mutation 每个批次包含的行数。如果您遇到 SQL 语句过大的情况，请调低该值。 |
| `hard_delete_batch_size` | 整数 | `1500`   | 200 – 1,500     | 普通同步和历史模式下，硬删除操作每个批次包含的行数。如果您遇到 SQL 语句过大的情况，请调低该值。                   |

所有字段均为可选项。如果未指定某个字段，则使用默认值。
如果某个值超出允许范围，目标端连接器会在同步期间报告错误。
未知字段会被静默忽略 (同时会记录一条警告) ，且不会导致错误，因此在新增设置时可保持前向兼容。

示例：

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

## 类型转换对照 \{#type-mapping\}

Fivetran ClickHouse 目标端中，[Fivetran 数据类型](https://fivetran.com/docs/destinations#datatypes)与 ClickHouse 类型的对照关系如下：

| Fivetran 类型   | ClickHouse 类型                                                        |
| ------------- | -------------------------------------------------------------------- |
| BOOLEAN       | [Bool](/sql-reference/data-types/boolean)                            |
| SHORT         | [Int16](/sql-reference/data-types/int-uint)                          |
| INT           | [Int32](/sql-reference/data-types/int-uint)                          |
| LONG          | [Int64](/sql-reference/data-types/int-uint)                          |
| BIGDECIMAL    | [Decimal(P, S)](/sql-reference/data-types/decimal)                   |
| FLOAT         | [Float32](/sql-reference/data-types/float)                           |
| DOUBLE        | [Float64](/sql-reference/data-types/float)                           |
| LOCALDATE     | [Date32](/sql-reference/data-types/date32)                           |
| LOCALDATETIME | [DateTime64(0, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| INSTANT       | [DateTime64(9, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| STRING        | [String](/sql-reference/data-types/string)                           |
| LOCALTIME     | [String](/sql-reference/data-types/string) * **                      |
| BINARY        | [String](/sql-reference/data-types/string) *                         |
| XML           | [String](/sql-reference/data-types/string) *                         |
| JSON          | [String](/sql-reference/data-types/string) *                         |

:::note

* BINARY、XML、LOCALTIME 和 JSON 会存储为 [String](/sql-reference/data-types/string)，因为 ClickHouse 的 `String` 类型可以表示任意字节序列。该目标端会添加列注释，以标明原始数据类型。ClickHouse 的 [JSON](/sql-reference/data-types/newjson) 数据类型未被使用，因为它已被标记为废弃，且从未建议用于生产环境。
  ** 注意：用于跟踪 LOCALTIME 类型支持情况的 issue：[clickhouse-fivetran-destination #15](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues/15)。
  :::

### 日期和时间值范围 \{#date-and-time-value-ranges\}

Fivetran 数据源可发送范围在 [0001-01-01, 9999-12-31](https://fivetran.com/docs/destinations#dateandtimevaluerange) 内的日期和时间值。
ClickHouse Cloud 的日期类型支持范围更窄，因此超出支持范围的值会被静默调整到最近的边界值：

| Fivetran type | ClickHouse Cloud type        | Min value           | Max value           |
| ------------- | ---------------------------- | ------------------- | ------------------- |
| LOCALDATE     | Date32                       | 1900-01-01          | 2299-12-31          |
| LOCALDATETIME | DateTime64(0, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |
| INSTANT       | DateTime64(9, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |

* INSTANT 的上限为 2262-04-11 23:47:16，因为 DateTime64(9) 将自纪元以来的纳秒数存储为 int64，而 2^63 - 1 纳秒对应的正是这个日期。
  ClickHouse 本身支持精度 &lt;= 9 的 DateTime64，最高可达 2299-12-31 23:59:59。
* LOCALDATETIME 的上限同样受限于 2262-04-11 23:47:16，这是由于 Go ClickHouse 驱动中的一个[已知 bug](https://github.com/ClickHouse/clickhouse-go/issues/1311)：在进行缩放前，所有 DateTime64 精度都会调用 `time.Time.UnixNano()`，因此即使精度为 0，超过 2262 年的日期也会导致 int64 溢出。

## 目标表 \{#table-structure\}

ClickHouse Cloud 目标表使用
[Replacing](/engines/table-engines/mergetree-family/replacingmergetree) 类型的
[SharedMergeTree](/cloud/reference/shared-merge-tree) 系列引擎
(具体为 `SharedReplacingMergeTree`) ，并以 `_fivetran_synced` 列进行版本控制。

除主键 (排序键) 和 Fivetran 元数据列外，每一列都会创建为
[Nullable(T)](/sql-reference/data-types/nullable)，其中 `T` 是基于[数据类型对照](#type-mapping)的
ClickHouse Cloud 类型。

表结构会因连接器配置的 Fivetran
[同步模式](https://fivetran.com/docs/using-fivetran/features#deletedrowhandling)
而有所不同：**软删除** (默认) 或 **历史模式** (SCD Type 2) 。

### 软删除模式 \{#soft-delete-mode\}

在软删除模式下，每个目标表都包含以下元数据列：

| 列                   | 类型                     | 说明                                                       |
| ------------------- | ---------------------- | -------------------------------------------------------- |
| `_fivetran_synced`  | `DateTime64(9, 'UTC')` | 记录由 Fivetran 同步时的时间戳。用作 `SharedReplacingMergeTree` 的版本列。 |
| `_fivetran_deleted` | `Bool`                 | 软删除标记。源记录删除时，该值设为 `true`。                                |
| `_fivetran_id`      | `String`               | 自动生成的唯一标识符。仅当源表没有主键时才会出现。                                |

#### 源表中只有一个主键 \{#single-pk\}

例如，源表 `users` 有一个主键列 `id` (`INT`) 和一个普通列 `name` (`STRING`)。
目标表定义如下：

```sql
CREATE TABLE `users`
(
    `id`                Int32,
    `name`              Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY id
SETTINGS index_granularity = 8192
```

在这种情况下，`id` 列被选作表的排序键。

#### 源表中有多个主键 \{#multiple-pks\}

如果源表有多个主键，则按它们在 Fivetran 源表定义中出现的顺序使用。

例如，存在一个源表 `items`，其主键列为 `id` (`INT`) 和 `name` (`STRING`) ，此外还有一个普通列 `description` (`STRING`) 。目标表的定义如下：

```sql
CREATE TABLE `items`
(
    `id`                Int32,
    `name`              String,
    `description`       Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name)
SETTINGS index_granularity = 8192
```

此时，选择 `id` 和 `name` 列作为表的排序键。

#### 源表中无主键 \{#no-pks\}

如果源表没有主键，Fivetran 会添加一个唯一标识符列 `_fivetran_id`。
假设源端的 `events` 表仅包含 `event` (`STRING`) 和 `timestamp` (`LOCALDATETIME`) 两列。
在这种情况下，目标表如下：

```sql
CREATE TABLE events
(
    `event`             Nullable(String),
    `timestamp`         Nullable(DateTime),
    `_fivetran_id`      String,
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY _fivetran_id
SETTINGS index_granularity = 8192
```

由于 `_fivetran_id` 具有唯一性，且没有其他主键可选，因此将其用作表的排序键。

### 历史模式 (SCD Type 2) \{#history-mode\}

启用[历史模式](https://fivetran.com/docs/using-fivetran/features#historymode)后，
目标表会保留每条记录的每个版本，而不是覆盖之前的值。
这实现了 [Slowly Changing Dimension Type 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) (SCD Type 2) ，
从而保留所有变更的完整审计记录。

在历史模式下，每个目标表都包含以下元数据列：

| 列                  | 类型                               | 说明                                                       |
| ------------------ | -------------------------------- | -------------------------------------------------------- |
| `_fivetran_synced` | `DateTime64(9, 'UTC')`           | 记录由 Fivetran 同步时的时间戳。用作 `SharedReplacingMergeTree` 的版本列。 |
| `_fivetran_start`  | `DateTime64(9, 'UTC')`           | 该记录版本开始生效时的时间戳。是表排序键的一部分。                                |
| `_fivetran_end`    | `Nullable(DateTime64(9, 'UTC'))` | 该记录版本被替代时的时间戳。对于当前生效的记录，设置为 `2262-04-11 23:47:16`。       |
| `_fivetran_active` | `Nullable(Bool)`                 | 该记录是否为当前生效的版本。                                           |
| `_fivetran_id`     | `String`                         | 自动生成的唯一标识符。仅当源表没有主键时才存在。                                 |

`_fivetran_start` 列始终作为复合排序键的最后一个元素包含在 `ORDER BY` 子句中。
这样可使同一条记录的多个版本 (具有不同的开始时间) 在表中共存。

当记录更新时：

* 先前版本的 `_fivetran_end` 会被设置为新版本 `_fivetran_start` 减去一纳秒，且 `_fivetran_active` 会被设置为 `false`。
* 插入新版本时，`_fivetran_active` 会设置为 `true`，同时 `_fivetran_end` 会设置为 `2262-04-11 23:47:16.000000000` (`DateTime64(9)` 的最大值) 。

#### 源表中只有一个主键 \{#history-single-pk\}

例如，源表 `users` 包含主键列 `id` (`INT`) ，以及普通列 `name` (`STRING`) 和 `status` (`STRING`) 。
历史模式下的目标表定义如下：

```sql
CREATE TABLE `users`
(
    `id`               Int32,
    `name`             Nullable(String),
    `status`           Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, _fivetran_start)
SETTINGS index_granularity = 8192
```

在这种情况下，`id` 和 `_fivetran_start` 组成复合排序键。

经过几次同步后，该表可能包含以下数据：

| id | name    | status | &#95;fivetran&#95;start       | &#95;fivetran&#95;end         | &#95;fivetran&#95;active |
| -- | ------- | ------ | ----------------------------- | ----------------------------- | ------------------------ |
| 1  | name 1  | TODO   | 2025-11-10 20:57:00.000000000 | 2025-11-11 20:56:59.999000000 | false                    |
| 1  | name 11 | TODO   | 2025-11-11 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |
| 2  | name 2  | TODO   | 2025-11-10 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |

记录 `id=1` 有两个版本：原始版本 (`name 1`，非活跃) 和更新后的版本 (`name 11`，活跃) 。
记录 `id=2` 只有一个版本，且当前处于活跃状态。

#### 源表中存在多个主键 \{#history-multiple-pks\}

如果源表有多个主键，这些主键都会包含在 `ORDER BY` 中，并且 `_fivetran_start` 会作为最后一个元素。

例如，源表 `items` 的主键列为 `id` (`INT`) 和 `name` (`STRING`) ，此外还有一个
普通列 `description` (`STRING`) 。在历史模式下，目标表的定义如下：

```sql
CREATE TABLE `items`
(
    `id`               Int32,
    `name`             String,
    `description`      Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name, _fivetran_start)
SETTINGS index_granularity = 8192
```

在这种情况下，`id`、`name` 和 `_fivetran_start` 组成复合排序键。

#### 源表中没有主键 \{#history-no-pks\}

如果源表没有主键，Fivetran 会添加一个名为 `_fivetran_id` 的唯一标识符列，
并将 `_fivetran_start` 追加到排序键中。
以源表中仅包含 `event` (`STRING`) 和 `timestamp` (`LOCALDATETIME`) 两列的 `events` 表为例。
历史模式下的目标表如下：

```sql
CREATE TABLE events
(
    `event`            Nullable(String),
    `timestamp`        Nullable(DateTime),
    `_fivetran_id`     String,
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (_fivetran_id, _fivetran_start)
SETTINGS index_granularity = 8192
```

由于 `_fivetran_id` 和 `_fivetran_start` 共同构成复合排序键。

### 选择无重复数据的最新版本 \{#selecting-latest-version\}

`SharedReplacingMergeTree` 会在后台执行数据去重，
[且仅在未知时间点的合并过程中](/engines/table-engines/mergetree-family/replacingmergetree)进行。
不过，也可以使用 `FINAL` 关键字临时查询无重复数据的最新版本：

```sql
SELECT *
FROM example FINAL
LIMIT 1000 
```

请参阅故障排除指南中的[优化读取查询](/integrations/fivetran/troubleshooting#optimizing-reading-queries)&quot;部分，了解查询优化技巧。

## 网络故障时的重试 \{#retries-on-network-failures\}

ClickHouse Cloud 目标端会使用指数退避算法，对瞬时性网络错误进行重试。
即使目标端已经插入数据，这样做也是安全的，因为任何可能出现的重复数据都会由
`SharedReplacingMergeTree` 表引擎处理。