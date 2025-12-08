---
slug: /guides/developer/ttl
sidebar_label: 'TTL（生存时间）'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', '旧', '数据']
description: 'TTL（time-to-live，生存时间）指在经过一定时间间隔后，对行或列进行移动、删除或汇总的能力。'
title: '使用 TTL（生存时间）管理数据'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 使用 TTL（存活时间）管理数据 {#manage-data-with-ttl-time-to-live}

## TTL 概述 {#overview-of-ttl}

TTL（time-to-live，生存时间）指的是在经过一定时间间隔后，将行或列移动、删除或进行汇总处理的能力。尽管 “time-to-live” 这个表达听起来好像只适用于删除旧数据，但 TTL 实际上有多种用法：

- 删除旧数据：可以在指定的时间间隔之后删除行或列
- 在磁盘之间移动数据：在经过一定时间后，可以在不同的存储卷之间迁移数据——这对于部署热/温/冷分层架构非常有用
- 数据汇总：在删除旧数据之前，将其按各种有用的聚合与计算方式进行汇总（rollup）

:::note
TTL 可以应用于整张表或特定列。
:::

## TTL 语法 {#ttl-syntax}

`TTL` 子句可以出现在列定义之后和/或表定义的末尾。使用 `INTERVAL` 子句来定义一段时间（对应的数据类型需要是 `Date` 或 `DateTime`）。例如，下表中有两列带有 `TTL` 子句：

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

* x 列的生存时间为 1 个月，从 `timestamp` 列开始计算
* y 列的生存时间为 1 天，从 `timestamp` 列开始计算
* 当该时间间隔结束时，该列会过期。ClickHouse 会将该列的值替换为其数据类型的默认值。如果某个数据部分中该列的所有值都已过期，ClickHouse 会从文件系统中的该数据部分中删除这一列。

:::note
TTL 规则可以被修改或删除。更多详情请参阅 [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) 页面。
:::

## 触发 TTL 事件 {#triggering-ttl-events}

过期行的删除或聚合并不会立即进行——它只会在表合并期间发生。如果你有一张由于某种原因没有主动进行合并的表，可以通过以下两个设置来触发 TTL 事件：

* `merge_with_ttl_timeout`：再次执行带有 delete TTL 的合并前的最小延迟时间（秒）。默认值为 14400 秒（4 小时）。
* `merge_with_recompression_ttl_timeout`：再次执行带有 recompression TTL（在删除之前对数据进行汇总的规则）的合并前的最小延迟时间（秒）。默认值为 14400 秒（4 小时）。

因此，默认情况下，你的 TTL 规则至少每 4 小时会在表上应用一次。如果你需要更频繁地应用 TTL 规则，只需修改上述设置。

:::note
这不是一个很好的解决方案（也不是我们建议你经常使用的方式），但你也可以通过 `OPTIMIZE` 来强制触发表合并：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` 会对表中的各个数据分片触发一次即时合并，而当表已经只有一个分片时，`FINAL` 会强制重新执行优化。
:::

## 删除行 {#removing-rows}

要在经过一段时间后从表中删除整行，请在表级别定义 TTL 规则：

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

此外，还可以基于记录值定义 TTL 规则。
只需指定 where 条件即可轻松实现。
可以指定多个条件：

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

## 移除列 {#removing-columns}

假设你并不想删除整行数据，而是只希望 `balance` 和 `address` 两列过期。让我们修改 `customers` 表，并为这两列都添加一个 2 小时的 TTL：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 实现汇总（rollup） {#implementing-a-rollup}

假设我们希望在一定时间后删除行，但出于报表用途仍保留部分数据。我们并不需要所有明细——只需要一些历史数据的聚合结果。可以通过在 `TTL` 表达式中添加 `GROUP BY` 子句，并在表中添加一些列来存储这些聚合结果来实现这一点。

假设在下面的 `hits` 表中，我们希望删除旧行，但在删除这些行之前保留 `hits` 列的总和与最大值。我们需要一些列来存储这些值，并且需要在 `TTL` 子句中添加一个 `GROUP BY` 子句，用于将总和和最大值进行汇总：

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

* `TTL` 子句中的 `GROUP BY` 列必须是 `PRIMARY KEY` 的前缀，同时我们希望按当天起始时间对结果进行分组。因此，在主键中加入了 `toStartOfDay(timestamp)`
* 我们添加了两个字段来存储聚合结果：`max_hits` 和 `sum_hits`
* 将 `max_hits` 和 `sum_hits` 的默认值设置为 `hits` 是保证我们的逻辑生效所必需的，这取决于 `SET` 子句的定义方式

## 实现热/温/冷架构 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
如果您使用的是 ClickHouse Cloud，本课中的步骤不适用。您无需在 ClickHouse Cloud 中担心迁移旧数据。
:::

在处理海量数据时，一个常见做法是在数据变旧时对其进行迁移。下面是使用 `TTL` 命令的 `TO DISK` 和 `TO VOLUME` 子句在 ClickHouse 中实现热/温/冷架构的步骤。（顺便说一句，这里不必局限于热/冷这种模式——您可以根据自己的任意用例使用 TTL 在不同存储之间迁移数据。）

1. `TO DISK` 和 `TO VOLUME` 选项指的是在 ClickHouse 配置文件中定义的磁盘或卷的名称。创建一个名为 `my_system.xml`（或任意文件名）的新文件，在其中定义您的磁盘，然后定义使用这些磁盘的卷。将该 XML 文件放在 `/etc/clickhouse-server/config.d/` 中，使配置应用到您的系统：

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

2. 上述配置中涉及三个磁盘，每个磁盘都指向 ClickHouse 可以读写的目录。一个卷可以包含一个或多个磁盘——我们为这三个磁盘分别定义了一个卷。下面来看这些磁盘：

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

3. 接下来，我们来验证一下这些存储卷：

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

4. 现在我们将添加一个 `TTL` 规则，用于在热、温和冷存储卷之间迁移数据：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新的 `TTL` 规则应该已经生效，不过你可以手动触发以确保它确实应用：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. 使用 `system.parts` 表验证您的数据是否已迁移到预期的磁盘上：

```sql
使用 system.parts 表查看 crypto_prices 表的数据分片位于哪些磁盘上：

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

响应结果将如下所示：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
