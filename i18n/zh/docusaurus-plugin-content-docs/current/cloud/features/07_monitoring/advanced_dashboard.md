---
description: 'ClickHouse Cloud 中的高级仪表板'
keywords: ['监控', '可观测性', '高级仪表板', '仪表板', '可观测性仪表板']
sidebar_label: '高级仪表板'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'ClickHouse Cloud 中的高级仪表板'
doc_type: 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

在生产环境中监控数据库系统，对于了解部署的运行状况，从而预防或解决故障，至关重要。

高级仪表盘是一款轻量级工具，可为 ClickHouse 系统及其运行环境提供深度洞察，帮助你提前发现性能瓶颈、系统故障和低效问题。

高级仪表盘同时适用于 ClickHouse OSS（开源软件）和 Cloud。本文将介绍如何在 Cloud 中使用高级仪表盘。

## 访问高级仪表板 \\{#accessing-the-advanced-dashboard\\}

可以通过以下路径访问高级仪表板：

* 左侧边栏
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

## 访问原生高级仪表盘 \\{#accessing-the-native-advanced-dashboard\\}

可以通过以下路径访问原生高级仪表盘：

* 左侧面板
  * `Monitoring` → `Advanced dashboard`
  * 点击 `You can still access the native advanced dashboard.`

这将在新的浏览器标签页中打开原生高级仪表盘。您需要通过身份验证才能访问该仪表盘。

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

每个可视化视图都关联有一个用于填充数据的 SQL 查询。您可以点击铅笔图标来编辑此查询。

<Image img={EditVisualization} size="lg" alt="Advanced dashboard"/>

## 开箱即用的可视化 \\{#out-of-box-visualizations\\}

Advanced Dashboard 中的默认图表旨在帮助你实时了解 ClickHouse 系统的运行状况。下面列出了每个图表及其说明，并分为三大类，便于浏览和查找。

### ClickHouse 专用 \\{#clickhouse-specific\\}

这些指标专门用于监控 ClickHouse 实例的健康状况和性能。

| Metric                    | Description                                                                                   |
|---------------------------|-----------------------------------------------------------------------------------------------|
| Queries Per Second        | 跟踪查询的处理速率                                                                            |
| Selected Rows/Sec         | 指示查询每秒正在读取的行数                                                                    |
| Inserted Rows/Sec         | 度量每秒数据摄取速率                                                                          |
| Total MergeTree Parts     | 显示 MergeTree 表中活动分片的数量，有助于识别未批量处理的插入                                 |
| Max Parts for Partition   | 突出显示任意分区中的最大分片数量                                                              |
| Queries Running           | 显示当前正在执行的查询数量                                                                    |
| Selected Bytes Per Second | 指示查询每秒正在读取的数据量                                                                  |

### 系统健康状况专用 \\{#system-health-specific\\}

监控底层系统与监控 ClickHouse 本身同样重要。

| Metric                    | Description                                                                |
|---------------------------|----------------------------------------------------------------------------|
| IO Wait                   | 跟踪 I/O 等待时间                                                          |
| CPU Wait                  | 度量由 CPU 资源争用导致的延迟                                              |
| Read From Disk            | 跟踪从磁盘或块设备读取的字节数                                             |
| Read From Filesystem      | 跟踪从文件系统（包括页缓存）读取的字节数                                   |
| Memory (tracked, bytes)   | 显示由 ClickHouse 追踪的进程的内存使用情况                                 |
| Load Average (15 minutes) | 报告系统当前的 15 分钟平均负载值                                           |
| OS CPU Usage (Userspace)  | 运行用户态代码的 CPU 使用率                                                |
| OS CPU Usage (Kernel)     | 运行内核代码的 CPU 使用率                                                  |

## ClickHouse Cloud 特有指标 \\{#clickhouse-cloud-specific\\}

ClickHouse Cloud 使用对象存储（S3 类型）来保存数据。监控该接口有助于发现潜在问题。

| Metric                         | Description                               |
|--------------------------------|-------------------------------------------|
| S3 Read wait                   | 测量对 S3 读请求的延迟                    |
| S3 read errors per second      | 跟踪每秒发生的读取错误数                  |
| Read From S3 (bytes/sec)       | 跟踪从 S3 存储中读取数据的速率            |
| Disk S3 write req/sec          | 监控对 S3 存储执行写操作的频率            |
| Disk S3 read req/sec           | 监控对 S3 存储执行读操作的频率            |
| Page cache hit rate            | 页缓存的命中率                            |
| Filesystem cache hit rate      | 文件系统缓存的命中率                      |
| Filesystem cache size          | 当前文件系统缓存的大小                    |
| Network send bytes/sec         | 跟踪当前出站网络流量速率                  |
| Network receive bytes/sec      | 跟踪当前入站网络流量速率                  |
| Concurrent network connections | 跟踪当前并发网络连接的数量                |

## 使用高级仪表板识别问题 \\{#identifying-issues-with-the-advanced-dashboard\\}

通过这种对 ClickHouse 服务健康状况的实时视图，可以在问题影响业务之前大大
缓解或解决问题。下面是一些可以通过高级仪表板识别的问题。

### 未批量插入 \\{#unbatched-inserts\\}

如[最佳实践文档](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)中所述，推荐在可以同步执行的情况下，
始终将数据批量插入 ClickHouse。

使用合理批大小的批量插入可以减少数据摄取期间创建的 part 数量，
从而实现更高效的磁盘写入以及更少的合并操作。

识别插入策略是否不理想的关键指标是 **Inserted Rows/sec** 和
**Max Parts for Partition**。

<Image img={InsertedRowsSec} size="lg" alt="未批量的插入" />

上面的示例显示，在 13 点到 14 点之间，**Inserted Rows/sec** 和 **Max Parts for Partition**
都出现了两个峰值。这表明我们正在以一个合理的速度摄取数据。

随后在 16 点之后，我们看到 **Max Parts for Partition** 出现另一个大峰值，但
**Inserted Rows/sec** 的速度却非常慢。创建了大量 part，但生成的数据量却很少，
这表明这些 part 的大小并不理想。

### 资源密集型查询 \\{#resource-intensive-query\\}

运行会消耗大量资源（例如 CPU 或内存）的 SQL 查询是很常见的。然而，监控这些查询并了解
它们对部署整体性能的影响非常重要。

在查询吞吐量未发生变化的情况下，资源消耗突然变化可能表明正在执行代价更高的查询。
根据你正在运行的查询类型，这种情况有时是可以预期的，但能够在高级仪表板中识别到它们
是很有价值的。

下面是一个 CPU 使用率达到峰值，但每秒执行的查询数量并未发生显著变化的示例。

<Image img={ResourceIntensiveQuery} size="lg" alt="资源密集型查询" />

### 不良的主键设计 \\{#bad-primary-key-design\\}

你可以使用高级仪表板识别的另一个问题是不良的主键设计。
正如 [&quot;A practical introduction to primary indexes in ClickHouse&quot;](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)
中所描述的，为你的用例选择合适的主键，将通过减少 ClickHouse
为执行查询所需读取的行数，大幅提升性能。

用于发现主键潜在改进空间的一个指标是 **Selected Rows per second**。
选中行数的突然峰值既可能表示整体查询吞吐量的一般性增加，也可能表示存在
为了执行查询而选择了大量行的查询。

<Image img={SelectedRowsPerSecond} size="lg" alt="资源密集型查询" />

使用时间戳作为过滤条件，你可以在 `system.query_log` 表中找到峰值时刻
执行的查询。

例如，运行一个查询，显示在某一天 11 点到 11 点之间执行的所有查询，
以了解哪些查询正在读取过多的行：

```sql title="Query"
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM system.query_log
WHERE has(databases, 'default') AND (event_time >= '2024-12-23 11:20:00') AND (event_time <= '2024-12-23 11:30:00') AND (type = 'QueryFinish')
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

```response title="Response"
Row 1:
──────
type:              QueryFinish
event_time:        2024-12-23 11:22:55
query_duration_ms: 37407
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 2:
──────
type:              QueryFinish
event_time:        2024-12-23 11:26:50
query_duration_ms: 7325
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 3:
──────
type:              QueryFinish
event_time:        2024-12-23 11:24:10
query_duration_ms: 3270
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']

Row 4:
──────
type:              QueryFinish
event_time:        2024-12-23 11:28:10
query_duration_ms: 2786
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']
```

第 2 行：
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:26:50
query&#95;duration&#95;ms: 7325
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;no&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         150957260
tables:            [&#39;default.amazon&#95;reviews&#95;no&#95;pk&#39;]

第 3 行：
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:24:10
query&#95;duration&#95;ms: 3270
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

第 4 行：
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:28:10
query&#95;duration&#95;ms: 2786
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

```

在此示例中,可以看到同一查询针对 `amazon_reviews_no_pk` 和 `amazon_reviews_pk` 两个表执行。由此可以推断,有人正在测试 `amazon_reviews` 表的主键配置选项。
```
