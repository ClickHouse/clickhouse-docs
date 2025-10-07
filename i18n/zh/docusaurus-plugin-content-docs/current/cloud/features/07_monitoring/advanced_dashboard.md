---
'description': 'ClickHouse Cloud 中的高级仪表板'
'keywords':
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
'sidebar_label': '高级仪表板'
'sidebar_position': 45
'slug': '/cloud/manage/monitor/advanced-dashboard'
'title': 'ClickHouse Cloud 中的高级仪表板'
'doc_type': 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';
import Image from '@theme/IdealImage';

在生产环境中监控数据库系统对于理解部署健康至关重要，以便您能够预防或解决故障。

高级仪表板是一个轻量级工具，旨在为您提供深入的 ClickHouse 系统及其环境的洞察，帮助您预先识别性能瓶颈、系统故障和效率低下的问题。

高级仪表板在 ClickHouse OSS（开源软件）和 Cloud 中均可用。本文将向您展示如何在 Cloud 中使用高级仪表板。

## 访问高级仪表板 {#accessing-the-advanced-dashboard}

可以通过导航到以下位置访问高级仪表板：

* 左侧面板
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

## 访问本地高级仪表板 {#accessing-the-native-advanced-dashboard}

可以通过导航到以下位置访问本地高级仪表板：

* 左侧面板
  * `Monitoring` → `Advanced dashboard`
  * 点击 `You can still access the native advanced dashboard.`

这将在新标签页中打开本地高级仪表板。您需要进行身份验证才能访问该仪表板。

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

每个可视化都有一个与之关联的 SQL 查询来填充它。您可以通过单击铅笔图标来编辑此查询。

<Image img={EditVisualization} size="lg" alt="Advanced dashboard"/>

## 开箱即用的可视化 {#out-of-box-visualizations}

高级仪表板中的默认图表旨在提供对 ClickHouse 系统的实时可见性。以下是每个图表的描述列表。它们分为三个类别，以帮助您导航。

### ClickHouse 特定 {#clickhouse-specific}

这些指标旨在监控 ClickHouse 实例的健康和性能。

| 指标                        | 描述                                                                                       |
|-----------------------------|--------------------------------------------------------------------------------------------|
| 每秒查询数                  | 跟踪正在处理的查询速率                                                                    |
| 每秒选定行数                | 指示被查询读取的行数                                                                      |
| 每秒插入行数                | 测量数据摄取速率                                                                           |
| MergeTree 中的总分片数      | 显示 MergeTree 表中活动分片的数量，帮助识别未批量插入                                        |
| 分区的最大分片数            | 突出显示任何分区中的最大分片数                                                              |
| 当前运行的查询              | 显示当前正在执行的查询数量                                                                  |
| 每秒选定字节数              | 指示被查询读取的数据量                                                                      |

### 系统健康特定 {#system-health-specific}

监控底层系统与观察 ClickHouse 自身一样重要。

| 指标                        | 描述                                                               |
|-----------------------------|---------------------------------------------------------------------|
| IO 等待                     | 跟踪 I/O 等待时间                                                   |
| CPU 等待                    | 测量由 CPU 资源争用引起的延迟                                       |
| 从磁盘读取                 | 跟踪从磁盘或块设备读取的字节数                                     |
| 从文件系统读取            | 跟踪从文件系统（包括页缓存）读取的字节数                           |
| 内存（跟踪，字节）         | 显示 ClickHouse 跟踪的进程的内存使用情况                           |
| 负载平均值（15分钟）      | 报告系统的当前负载平均值                                           |
| 操作系统 CPU 使用率（用户空间） | CPU 使用率运行用户空间代码                                       |
| 操作系统 CPU 使用率（内核）      | CPU 使用率运行内核代码                                          |

## ClickHouse Cloud 特定 {#clickhouse-cloud-specific}

ClickHouse Cloud 使用对象存储（S3 类型）存储数据。监控此接口可以帮助检测问题。

| 指标                          | 描述                                                      |
|-------------------------------|----------------------------------------------------------|
| S3 读取等待                   | 测量对 S3 的读取请求延迟                                 |
| 每秒 S3 读取错误数           | 跟踪读取错误的速率                                       |
| 从 S3 读取（字节/秒）         | 跟踪从 S3 存储读取数据的速率                           |
| 每秒磁盘 S3 写入请求         | 监控写入 S3 存储操作的频率                               |
| 每秒磁盘 S3 读取请求         | 监控读取 S3 存储操作的频率                               |
| 页面缓存命中率               | 页面缓存的命中率                                         |
| 文件系统缓存命中率           | 文件系统缓存的命中率                                     |
| 文件系统缓存大小             | 当前文件系统缓存大小                                     |
| 网络发送字节/秒              | 跟踪当前入站网络流量的速度                               |
| 网络接收字节/秒              | 跟踪当前出站网络流量的速度                               |
| 同时网络连接数               | 跟踪当前同时的网络连接数                                 |

## 使用高级仪表板识别问题 {#identifying-issues-with-the-advanced-dashboard}

实时查看 ClickHouse 服务的健康状态极大地帮助您在问题影响业务之前缓解这些问题或帮助解决它们。以下是一些可以通过高级仪表板发现的问题。

### 未批量插入 {#unbatched-inserts}

如 [最佳实践文档](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous) 中所述，建议始终在可能的情况下同步批量插入数据到 ClickHouse。

合理批量大小的批量插入减少了摄取过程中创建的分片数量，从而在磁盘上实现更高效的写入操作和更少的合并操作。

发现非最优插入的关键指标是 **每秒插入行数** 和 **分区的最大分片数**。

<Image img={InsertedRowsSec} size="lg" alt="Unbatched inserts"/>

上面的示例显示了 **每秒插入行数** 和 **分区的最大分片数** 在 13 时到 14 时之间的两个峰值。这表明我们以合理速度摄取数据。

然后我们看到在 16 时，**分区的最大分片数** 另一个大峰值，但 **每秒插入行数速度** 非常慢。创建了很多分片，但产生的数据显示，这些分片的大小非最优。

### 资源密集型查询 {#resource-intensive-query}

运行消耗大量资源的 SQL 查询（如 CPU 或内存）是常见现象。然而，监控这些查询并了解它们对部署整体性能的影响非常重要。

没有查询吞吐量的变化而资源消耗出现突然变化可能表明正在执行更昂贵的查询。根据您运行的查询类型，这可能是可以预期的，但通过高级仪表板发现它们是好的。

下面是 CPU 使用率峰值的示例，而每秒执行的查询数量没有显著变化。

<Image img={ResourceIntensiveQuery} size="lg" alt="Resource intensive query"/>

### 不良主键设计 {#bad-primary-key-design}

使用高级仪表板可以发现的另一个问题是不良的主键设计。如在 ["ClickHouse 中主索引的实用介绍"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 中所述，选择最适合您用例的主键将大大提高性能，减少 ClickHouse 执行查询所需读取的行数。

要跟踪主键潜在改进的指标之一是 **每秒选定行数**。选定行数突然峰值可能表明整体查询吞吐量的一般增长，以及执行查询时选择了大量行的查询。

<Image img={SelectedRowsPerSecond} size="lg" alt="Resource intensive query"/>

通过时间戳作为筛选条件，您可以在 `system.query_log` 表中找到在峰值时执行的查询。

例如，运行一个查询，显示在某一天上午 11 时到中午 11 时之间执行的所有查询，以了解哪些查询读取了过多的行：

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

在这个示例中，我们可以看到同一查询在两个表 `amazon_reviews_no_pk` 和 `amazon_reviews_pk` 上执行。可以得出结论：某人在为 `amazon_reviews` 表测试主键选项。
