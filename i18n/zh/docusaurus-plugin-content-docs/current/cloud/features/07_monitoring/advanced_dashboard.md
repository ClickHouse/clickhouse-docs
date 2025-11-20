---
description: 'ClickHouse Cloud 中的高级仪表板'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
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

在生产环境中监控数据库系统，对于了解部署的健康状况，从而预防或解决故障至关重要。

高级仪表板是一款轻量级工具，旨在为你提供对 ClickHouse 系统及其运行环境的深入洞察，帮助你提前发现性能瓶颈、系统故障和低效问题。

高级仪表板同时适用于 ClickHouse OSS（开源软件）和 Cloud。本文将向你介绍如何在 Cloud 中使用高级仪表板。


## 访问高级仪表板 {#accessing-the-advanced-dashboard}

通过以下路径访问高级仪表板:

- 左侧面板
  - `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size='lg' alt='高级仪表板' />


## 访问原生高级仪表板 {#accessing-the-native-advanced-dashboard}

可以通过以下方式访问原生高级仪表板:

- 左侧面板
  - `监控` → `高级仪表板`
  - 点击 `您仍可以访问原生高级仪表板。`

这将在新标签页中打开原生高级仪表板。您需要进行身份验证才能访问仪表板。

<Image img={NativeAdvancedDashboard} size='lg' alt='高级仪表板' />

每个可视化图表都关联了一个用于填充数据的 SQL 查询。您可以点击笔形图标来编辑该查询。

<Image img={EditVisualization} size='lg' alt='高级仪表板' />


## 开箱即用的可视化 {#out-of-box-visualizations}

高级仪表板中的默认图表旨在实时展示 ClickHouse 系统的运行状态。以下列出了每个图表的说明,并按三个类别进行分组,便于您查找。

### ClickHouse 专用指标 {#clickhouse-specific}

这些指标专门用于监控 ClickHouse 实例的健康状况和性能。

| 指标                      | 描述                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Queries Per Second        | 跟踪查询处理速率                                               |
| Selected Rows/Sec         | 显示查询读取的行数                                       |
| Inserted Rows/Sec         | 衡量数据摄取速率                                                         |
| Total MergeTree Parts     | 显示 MergeTree 表中活跃分片的数量,有助于识别未批量处理的插入操作 |
| Max Parts for Partition   | 显示任意分区中的最大分片数                                  |
| Queries Running           | 显示当前正在执行的查询数量                                       |
| Selected Bytes Per Second | 显示查询读取的数据量                                       |

### 系统健康专用指标 {#system-health-specific}

监控底层系统与监控 ClickHouse 本身同样重要。

| Metric                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| IO Wait                   | 跟踪 I/O 等待时间                                                     |
| CPU Wait                  | 衡量 CPU 资源争用导致的延迟                         |
| Read From Disk            | 跟踪从磁盘或块设备读取的字节数               |
| Read From Filesystem      | 跟踪从文件系统读取的字节数(包括页面缓存) |
| Memory (tracked, bytes)   | 显示 ClickHouse 跟踪的进程内存使用情况                    |
| Load Average (15 minutes) | 报告系统当前的 15 分钟平均负载                        |
| OS CPU Usage (Userspace)  | 用户空间代码的 CPU 使用率                                          |
| OS CPU Usage (Kernel)     | 内核代码的 CPU 使用率                                             |


## ClickHouse Cloud 专属指标 {#clickhouse-cloud-specific}

ClickHouse Cloud 使用对象存储(S3 类型)来存储数据。监控此接口有助于及时发现问题。

| 指标                           | 描述                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| S3 读取等待时间                | 测量 S3 读取请求的延迟                                      |
| S3 每秒读取错误数              | 跟踪读取错误率                                              |
| 从 S3 读取速率(字节/秒)        | 跟踪从 S3 存储读取数据的速率                                |
| 磁盘 S3 写入请求数/秒          | 监控 S3 存储写入操作的频率                                  |
| 磁盘 S3 读取请求数/秒          | 监控 S3 存储读取操作的频率                                  |
| 页面缓存命中率                 | 页面缓存的命中率                                            |
| 文件系统缓存命中率             | 文件系统缓存的命中率                                        |
| 文件系统缓存大小               | 文件系统缓存的当前大小                                      |
| 网络发送字节数/秒              | 跟踪出站网络流量的当前速度                                  |
| 网络接收字节数/秒              | 跟踪入站网络流量的当前速度                                  |
| 并发网络连接数                 | 跟踪当前并发网络连接的数量                                  |


## 使用高级仪表板识别问题 {#identifying-issues-with-the-advanced-dashboard}

实时查看 ClickHouse 服务的健康状况可以极大地帮助您在问题影响业务之前进行缓解或解决。以下是您可以使用高级仪表板发现的一些问题。

### 非批量插入 {#unbatched-inserts}

如[最佳实践文档](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)中所述,如果能够同步执行,建议始终批量插入数据到 ClickHouse。

使用合理批次大小的批量插入可以减少数据摄取期间创建的数据分片数量,从而提高磁盘写入效率并减少合并操作。

发现次优插入的关键指标是 **Inserted Rows/sec**(每秒插入行数)和 **Max Parts for Partition**(分区最大分片数)

<Image img={InsertedRowsSec} size='lg' alt='非批量插入' />

上面的示例显示在 13 点到 14 点之间,**Inserted Rows/sec** 和 **Max Parts for Partition** 出现了两次峰值。这表明我们以合理的速度摄取数据。

然后我们看到 16 点之后 **Max Parts for Partition** 出现另一个大峰值,但 **Inserted Rows/sec speed**(每秒插入行数速度)非常慢。创建了大量分片但生成的数据很少,这表明分片大小不是最优的。

### 资源密集型查询 {#resource-intensive-query}

运行消耗大量资源(如 CPU 或内存)的 SQL 查询是很常见的。但是,监控这些查询并了解它们对部署整体性能的影响非常重要。

在查询吞吐量没有变化的情况下资源消耗突然变化,可能表明正在执行更昂贵的查询。根据您运行的查询类型,这可能是预期的,但从高级仪表板中发现它们是有益的。

以下是 CPU 使用率达到峰值但每秒执行的查询数量没有显著变化的示例。

<Image img={ResourceIntensiveQuery} size='lg' alt='资源密集型查询' />

### 不良的主键设计 {#bad-primary-key-design}

使用高级仪表板可以发现的另一个问题是不良的主键设计。如["ClickHouse 主索引实用介绍"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)中所述,选择最适合您用例的主键将通过减少 ClickHouse 执行查询时需要读取的行数来大大提高性能。

您可以关注的用于发现主键潜在改进的指标之一是 **Selected Rows per second**(每秒选择行数)。选择行数的突然峰值可能表明整体查询吞吐量的普遍增加,以及选择大量行来执行查询的查询。

<Image img={SelectedRowsPerSecond} size='lg' alt='资源密集型查询' />

使用时间戳作为过滤器,您可以在 `system.query_log` 表中找到峰值时刻执行的查询。

例如,运行一个查询来显示某一天上午 11 点到 11 点 30 分之间执行的所有查询,以了解哪些查询读取了过多的行:

```sql title="查询"
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

```response title="响应"
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

```


行 2：
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

行 3：
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

行 4：
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

在此示例中,可以看到同一查询分别在两个表 `amazon_reviews_no_pk` 和 `amazon_reviews_pk` 上执行。由此可以推断,有人正在为表 `amazon_reviews` 测试主键配置选项。
```
