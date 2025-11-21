---
slug: /guides/developer/ttl
sidebar_label: 'TTL（生存时间）'
sidebar_position: 2
keywords: ['ttl', '生存时间', 'clickhouse', '历史', '数据']
description: 'TTL（生存时间）指的是在经过一定时间间隔后，自动对行或列进行移动、删除或汇总的功能。'
title: '使用 TTL（生存时间）管理数据'
show_related_blogs: true
doc_type: '指南'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 使用 TTL（存活时间）管理数据



## TTL 概述 {#overview-of-ttl}

TTL(Time-to-Live,生存时间)是指在经过指定时间间隔后,对行或列进行移动、删除或汇总的功能。虽然"生存时间"这个表述听起来似乎只适用于删除旧数据,但 TTL 实际上有多种应用场景:

- 删除旧数据:顾名思义,您可以在指定的时间间隔后删除行或列
- 在磁盘之间移动数据:经过一定时间后,您可以在存储卷之间移动数据——这对于部署热/温/冷存储架构非常有用
- 数据汇总:在删除旧数据之前,将其汇总为各种有用的聚合和计算结果

:::note
TTL 可以应用于整个表或特定列。
:::


## TTL 语法 {#ttl-syntax}

`TTL` 子句可以出现在列定义之后和/或表定义的末尾。使用 `INTERVAL` 子句定义时间长度(需要是 `Date` 或 `DateTime` 数据类型)。例如,以下表有两个带有 `TTL` 子句的列:

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

- x 列的存活时间为从 timestamp 列起 1 个月
- y 列的存活时间为从 timestamp 列起 1 天
- 当时间间隔到期时,列将过期。ClickHouse 会将列值替换为其数据类型的默认值。如果数据部分中的所有列值都已过期,ClickHouse 将从文件系统的数据部分中删除该列。

:::note
TTL 规则可以被修改或删除。有关更多详细信息,请参阅[表 TTL 操作](/sql-reference/statements/alter/ttl.md)页面。
:::


## 触发 TTL 事件 {#triggering-ttl-events}

删除或聚合过期行的操作不会立即执行——它仅在表合并期间发生。如果您的表由于某种原因没有主动进行合并,可以通过以下两个设置来触发 TTL 事件:

- `merge_with_ttl_timeout`: 重复执行带有删除 TTL 的合并之前的最小延迟秒数。默认值为 14400 秒(4 小时)。
- `merge_with_recompression_ttl_timeout`: 重复执行带有重压缩 TTL 的合并之前的最小延迟秒数(在删除之前汇总数据的规则)。默认值:14400 秒(4 小时)。

因此,默认情况下,您的 TTL 规则将至少每 4 小时应用到表一次。如果需要更频繁地应用 TTL 规则,只需修改上述设置即可。

:::note
虽然这不是一个理想的解决方案(我们也不建议频繁使用),但您也可以使用 `OPTIMIZE` 强制执行合并:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` 会初始化表分区的非计划合并,而 `FINAL` 会在表已经是单个分区时强制重新优化。
:::


## 删除行 {#removing-rows}

要在一定时间后从表中删除整行,请在表级别定义 TTL 规则:

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

此外,还可以根据记录值定义 TTL 规则。
通过指定 WHERE 条件即可轻松实现。
支持使用多个条件:

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

如果不想删除整行数据,而只想让 balance 和 address 列过期,可以修改 `customers` 表,为这两列添加 2 小时的 TTL:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```


## 实现汇总 {#implementing-a-rollup}

假设我们希望在一定时间后删除行,但为了报告目的需要保留部分数据。我们不需要所有细节——只需要历史数据的一些聚合结果。这可以通过在 `TTL` 表达式中添加 `GROUP BY` 子句来实现,同时在表中添加一些列来存储聚合结果。

假设在以下 `hits` 表中,我们希望删除旧行,但在删除行之前保留 `hits` 列的总和和最大值。我们需要字段来存储这些值,并且需要在 `TTL` 子句中添加 `GROUP BY` 子句来汇总总和和最大值:

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

关于 `hits` 表的一些说明:

- `TTL` 子句中的 `GROUP BY` 列必须是 `PRIMARY KEY` 的前缀,并且我们希望按每天的开始时间对结果进行分组。因此,将 `toStartOfDay(timestamp)` 添加到主键中
- 我们添加了两个字段来存储聚合结果:`max_hits` 和 `sum_hits`
- 根据 `SET` 子句的定义方式,将 `max_hits` 和 `sum_hits` 的默认值设置为 `hits` 是逻辑正常工作的必要条件


## 实现热/温/冷架构 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
如果您使用的是 ClickHouse Cloud,本课程中的步骤不适用。您无需担心在 ClickHouse Cloud 中移动旧数据的问题。
:::

在处理大量数据时,一个常见的做法是随着数据老化而移动数据。以下是使用 `TTL` 命令的 `TO DISK` 和 `TO VOLUME` 子句在 ClickHouse 中实现热/温/冷架构的步骤。(顺便说一句,这不一定非要是热冷架构 - 您可以根据任何使用场景使用 TTL 来移动数据。)

1. `TO DISK` 和 `TO VOLUME` 选项引用在 ClickHouse 配置文件中定义的磁盘或卷的名称。创建一个名为 `my_system.xml`(或任何文件名)的新文件来定义您的磁盘,然后定义使用这些磁盘的卷。将 XML 文件放置在 `/etc/clickhouse-server/config.d/` 目录中,以便将配置应用到您的系统:

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

2. 上述配置引用了三个磁盘,它们指向 ClickHouse 可以读取和写入的文件夹。卷可以包含一个或多个磁盘 - 我们为这三个磁盘分别定义了一个卷。让我们查看这些磁盘:

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

3. 然后...让我们验证这些卷:

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

4. 现在我们将添加一个 `TTL` 规则,用于在热、温和冷卷之间移动数据:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新的 `TTL` 规则应该会自动物化,但您可以强制执行以确保:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. 使用 `system.parts` 表验证您的数据已移动到预期的磁盘:

```sql
使用 system.parts 表,查看 crypto_prices 表的数据部分位于哪些磁盘上:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

响应将如下所示:


```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
