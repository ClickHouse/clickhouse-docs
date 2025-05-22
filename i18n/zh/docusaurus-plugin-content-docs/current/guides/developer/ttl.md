import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 管理数据与 TTL（生存时间）

## TTL 概述 {#overview-of-ttl}

TTL（生存时间）指在经过一定时间间隔后，将行或列移动、删除或汇总的能力。尽管“生存时间”这个表达听起来似乎只适用于删除旧数据，但 TTL 有多个用例：

- 删除旧数据：毫无疑问，您可以在指定的时间间隔后删除行或列
- 在磁盘之间移动数据：经过一段时间后，您可以在存储卷之间移动数据 - 这对于部署热/温/冷架构非常有用
- 数据汇总：在删除旧数据之前，将其汇总为各种有用的聚合和计算

:::note
TTL 可以应用于整个表或特定列。
:::

## TTL 语法 {#ttl-syntax}

`TTL` 子句可以出现在列定义之后和/或表定义的末尾。使用 `INTERVAL` 子句定义时间长度（必须为 `Date` 或 `DateTime` 数据类型）。例如，以下表有两列具有 `TTL` 子句：

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

- x 列的生存时间为来自时间戳列的 1 个月
- y 列的生存时间为来自时间戳列的 1 天
- 当间隔到期时，该列将过期。ClickHouse 会用其数据类型的默认值替换列值。如果数据部分中的所有列值都过期，ClickHouse 将从文件系统中的数据部分删除该列。

:::note
TTL 规则可以被修改或删除。有关更多详细信息，请参见 [表 TTL 操作](/sql-reference/statements/alter/ttl.md) 页面。
:::

## 触发 TTL 事件 {#triggering-ttl-events}

过期行的删除或聚合不是立即发生的 - 只会在表合并期间发生。如果您有一个不积极合并的表（无论出于何种原因），有两个设置可触发 TTL 事件：

- `merge_with_ttl_timeout`：在重复执行删除 TTL 合并之前的最小延迟（秒）。默认值为 14400 秒（4 小时）。
- `merge_with_recompression_ttl_timeout`：在重复执行重压缩 TTL 合并（在删除之前汇总数据的规则）之前的最小延迟（秒）。默认值为 14400 秒（4 小时）。

因此，默认情况下，您的 TTL 规则每 4 小时至少会应用到您的表一次。如果需要更频繁地应用 TTL 规则，则只需修改上述设置。

:::note
这不是一个好的解决方案（或我们建议您频繁使用的解决方案），但您也可以使用 `OPTIMIZE` 强制合并：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` 初始化表的分区片段的非计划合并，如果您的表已经是单个分区片段，`FINAL` 强制重新优化。
:::

## 删除行 {#removing-rows}

要在经过一定时间后从表中删除整个行，请在表级别定义 TTL 规则：

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

此外，可以基于记录的值定义 TTL 规则。这可以通过指定 where 条件轻松实现。允许多个条件：

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

如果您只想让 balance 和 address 列过期，而不是删除整行。我们将修改 `customers` 表，并为两个列添加生存时间为 2 小时：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 实现汇总 {#implementing-a-rollup}
假设我们希望在经过一定时间后删除行，但保留一些数据用于报告目的。我们不需要所有细节 - 只需要一些聚合结果的历史数据。这可以通过向您的 `TTL` 表达式添加 `GROUP BY` 子句来实现，并在您的表中添加一些列以存储聚合结果。

假设在以下 `hits` 表中，我们希望删除旧行，但在删除行之前保留 `hits` 列的总和和最大值。我们需要一个字段来存储这些值，并需要向汇总 `TTL` 子句添加 `GROUP BY` 子句：

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

关于 `hits` 表的一些注释：

- `TTL` 子句中的 `GROUP BY` 列必须是 `PRIMARY KEY` 的前缀，我们希望按天的开始进行分组。因此，`toStartOfDay(timestamp)` 被添加到主键中
- 我们添加了两个字段来存储聚合结果：`max_hits` 和 `sum_hits`
- 将 `max_hits` 和 `sum_hits` 的默认值设置为 `hits` 对于我们的逻辑起作用是必要的，基于 `SET` 子句的定义

## 实现热/温/冷架构 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
如果您使用 ClickHouse Cloud，本课程中的步骤不适用。您无需担心在 ClickHouse Cloud 中移动旧数据。
:::

在处理大量数据时，一个常见的做法是随着数据变老而移动该数据。以下是在 ClickHouse 中使用 `TTL` 命令的 `TO DISK` 和 `TO VOLUME` 子句实现热/温/冷架构的步骤。（顺便说一句，这不一定是热和冷的事情 - 您可以使用 TTL 根据您的用例移动数据。）

1. `TO DISK` 和 `TO VOLUME` 选项指的是在您的 ClickHouse 配置文件中定义的磁盘或卷的名称。创建一个名为 `my_system.xml`（或任何文件名）的新文件，以定义您的磁盘，然后定义使用您磁盘的卷。将 XML 文件放在 `/etc/clickhouse-server/config.d/` 中，使配置应用于您的系统：

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

2. 上述配置指的是指向 ClickHouse 可读写的文件夹的三个磁盘。卷可以包含一个或多个磁盘 - 我们为每个磁盘定义了一个卷。让我们查看磁盘：

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

3. 然后...让我们验证一下卷：

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

4. 现在我们将添加一个 `TTL` 规则，以在热、温和冷卷之间移动数据：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新的 `TTL` 规则应该会被物化，但您可以强制它以确保：

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

## 相关内容 {#related-content}

- 博客与网络研讨会: [使用 TTL 管理 ClickHouse 中的数据生命周期](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
