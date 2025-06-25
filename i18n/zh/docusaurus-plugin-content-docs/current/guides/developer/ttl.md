---
'slug': '/guides/developer/ttl'
'sidebar_label': '生存时间 (TTL)'
'sidebar_position': 2
'keywords':
- 'ttl'
- 'time to live'
- 'clickhouse'
- 'old'
- 'data'
'description': '生存时间 (TTL) 指的是在经过一定时间间隔后，可以移动、删除或汇总行或列的能力。'
'title': '使用生存时间 (TTL) 管理数据'
'show_related_blogs': true
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 使用 TTL（生存时间）管理数据

## TTL 概述 {#overview-of-ttl}

TTL（生存时间）指的是在经过一定时间段后，可以将行或列移动、删除或汇总的能力。虽然“生存时间”这个词听起来像是只适用于删除旧数据，但 TTL 有多种用例：

- 删除旧数据：不出所料，您可以在指定时间间隔后删除行或列
- 在磁盘之间移动数据：经过一段时间后，您可以在存储卷之间移动数据 - 这对于部署热/温/冷架构非常有用
- 数据汇总：在删除之前，将旧数据汇总成各种有用的聚合和计算

:::note
TTL 可以应用于整个表或特定列。
:::

## TTL 语法 {#ttl-syntax}

`TTL` 子句可以出现在列定义之后和/或表定义的末尾。使用 `INTERVAL` 子句来定义一个时间长度（需要是 `Date` 或 `DateTime` 数据类型）。例如，以下表具有两个带有 `TTL` 子句的列：

```sql
CREATE TABLE example1 (
   timestamp DateTime,
   x UInt32 TTL timestamp + INTERVAL 1 MONTH,
   y String TTL timestamp + INTERVAL 1 DAY,
   z String
)
ENGINE = MergeTree
ORDER BY tuple()
```

- x 列的生存时间为从时间戳列开始的 1 个月
- y 列的生存时间为从时间戳列开始的 1 天
- 当时间间隔到期时，列到期。ClickHouse 将列值替换为其数据类型的默认值。如果数据部分中的所有列值到期，ClickHouse 将从文件系统中的数据部分删除该列。

:::note
TTL 规则可以被更改或删除。有关更多详细信息，请参见 [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) 页面。
:::

## 触发 TTL 事件 {#triggering-ttl-events}

删除或聚合过期行不是即时的 - 只在表合并期间发生。如果您有一个没有积极合并的表（出于任何原因），则有两个设置触发 TTL 事件：

- `merge_with_ttl_timeout`：在重复合并带有删除 TTL 的表之前的最小延迟（秒）。默认值为 14400 秒（4 小时）。
- `merge_with_recompression_ttl_timeout`：在重复合并带有重新压缩 TTL（在删除之前汇总数据的规则）的表之前的最小延迟（秒）。默认值：14400 秒（4 小时）。

因此，默认情况下，您的 TTL 规则将至少每 4 小时应用于您的表。如果您需要更频繁地应用 TTL 规则，只需修改以上设置。

:::note
这不是一个很好的解决方案（或者我们推荐您经常使用的解决方案），但您仍可以使用 `OPTIMIZE` 强制合并：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` 初始化您的表部分的非调度合并，`FINAL` 则强制重新优化（如果您的表已经是单个部分）。
:::

## 删除行 {#removing-rows}

要在经过一定时间后从表中删除整行，请在表级别定义 TTL 规则：

```sql
CREATE TABLE customers (
timestamp DateTime,
name String,
balance Int32,
address String
)
ENGINE = MergeTree
ORDER BY timestamp
TTL timestamp + INTERVAL 12 HOUR
```

此外，可以基于记录的值定义 TTL 规则。这可以通过指定一个 where 条件轻松实现。允许多个条件：

```sql
CREATE TABLE events
(
    `event` String,
    `time` DateTime,
    `value` UInt64
)
ENGINE = MergeTree
ORDER BY (event, time)
TTL time + INTERVAL 1 MONTH DELETE WHERE event != 'error',
    time + INTERVAL 6 MONTH DELETE WHERE event = 'error'
```

## 删除列 {#removing-columns}

假设您不想删除整行，而只是希望余额和地址列过期。让我们修改 `customers` 表，并为这两列添加 2 小时的 TTL：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 实现汇总 {#implementing-a-rollup}

假设我们想在经过一定时间后删除行，但保留某些用于报告的数据。我们不想要所有细节 - 只需几个历史数据的聚合结果。通过在 `TTL` 表达式中添加 `GROUP BY` 子句以及一些列来存储聚合结果，可以实现这一点。

假设在以下 `hits` 表中，我们希望删除旧行，但保留 `hits` 列的总和和最大值，然后再删除这些行。我们将需要一个字段来存储这些值，并需要在汇总最大值和总和的 `TTL` 子句中添加 `GROUP BY` 子句：

```sql
CREATE TABLE hits (
   timestamp DateTime,
   id String,
   hits Int32,
   max_hits Int32 DEFAULT hits,
   sum_hits Int64 DEFAULT hits
)
ENGINE = MergeTree
PRIMARY KEY (id, toStartOfDay(timestamp), timestamp)
TTL timestamp + INTERVAL 1 DAY
    GROUP BY id, toStartOfDay(timestamp)
    SET
        max_hits = max(max_hits),
        sum_hits = sum(sum_hits);
```

关于 `hits` 表的一些说明：

- `TTL` 子句中的 `GROUP BY` 列必须是 `PRIMARY KEY` 的前缀，并且我们希望按天开始对结果进行分组。因此，将 `toStartOfDay(timestamp)` 添加到主键中
- 我们添加了两个字段来存储聚合结果：`max_hits` 和 `sum_hits`
- 为了使我们的逻辑正常工作，必须将 `max_hits` 和 `sum_hits` 的默认值设置为 `hits`，基于 `SET` 子句的定义

## 实现热/温/冷架构 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
如果您使用的是 ClickHouse Cloud，本课程中的步骤不适用。您不必担心在 ClickHouse Cloud 中移动旧数据。
:::

处理大量数据时的一个常见做法是根据数据变旧的过程移动数据。以下是在 ClickHouse 中使用 `TTL` 命令的 `TO DISK` 和 `TO VOLUME` 子句实现热/温/冷架构的步骤。（顺便说一下，这并不一定要是冷热之分 - 您可以使用 TTL 根据任何用例移动数据。）

1. `TO DISK` 和 `TO VOLUME` 选项指的是在 ClickHouse 配置文件中定义的磁盘或卷的名称。创建一个名为 `my_system.xml`（或任何文件名）的新文件，该文件定义了您的磁盘，然后定义使用您磁盘的卷。将 XML 文件放在 `/etc/clickhouse-server/config.d/` 中以使配置应用于您的系统：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <default>
            </default>
           <hot_disk>
              <path>./hot/</path>
           </hot_disk>
           <warm_disk>
              <path>./warm/</path>
           </warm_disk>
           <cold_disk>
              <path>./cold/</path>
           </cold_disk>
        </disks>
        <policies>
            <default>
                <volumes>
                    <default>
                        <disk>default</disk>
                    </default>
                    <hot_volume>
                        <disk>hot_disk</disk>
                    </hot_volume>
                    <warm_volume>
                        <disk>warm_disk</disk>
                    </warm_volume>
                    <cold_volume>
                        <disk>cold_disk</disk>
                    </cold_volume>
                </volumes>
            </default>
        </policies>
    </storage_configuration>
</clickhouse>
```

2. 上述配置引用了三个指向 ClickHouse 可以读取和写入的文件夹的磁盘。卷可以包含一个或多个磁盘 - 我们为三个磁盘各自定义了一个卷。让我们查看这些磁盘：

```sql
SELECT name, path, free_space, total_space
FROM system.disks
```

```response
┌─name────────┬─path───────────┬───free_space─┬──total_space─┐
│ cold_disk   │ ./data/cold/   │ 179143311360 │ 494384795648 │
│ default     │ ./             │ 179143311360 │ 494384795648 │
│ hot_disk    │ ./data/hot/    │ 179143311360 │ 494384795648 │
│ warm_disk   │ ./data/warm/   │ 179143311360 │ 494384795648 │
└─────────────┴────────────────┴──────────────┴──────────────┘
```

3. 并且……让我们验证这些卷：

```sql
SELECT
    volume_name,
    disks
FROM system.storage_policies
```

```response
┌─volume_name─┬─disks─────────┐
│ default     │ ['default']   │
│ hot_volume  │ ['hot_disk']  │
│ warm_volume │ ['warm_disk'] │
│ cold_volume │ ['cold_disk'] │
└─────────────┴───────────────┘
```

4. 现在我们将添加一个 `TTL` 规则，将数据在热、温和冷卷之间移动：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新的 `TTL` 规则应该体现出来，但您可以强制执行以确保：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. 使用 `system.parts` 表验证您的数据已移动到预期的磁盘：

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

响应将如下所示：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
