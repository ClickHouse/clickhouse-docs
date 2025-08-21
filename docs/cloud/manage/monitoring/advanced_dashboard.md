---
description: 'Advanced dashboard in ClickHouse Cloud'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: 'Advanced dashboard'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'Advanced dashboard in ClickHouse Cloud'
doc_type: reference
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

Monitoring your database system in a production environment is vital to
understanding your deployment health so that you can prevent or solve outages.

The advanced dashboard is a lightweight tool designed to give you deep insights 
into your ClickHouse system and its environment, helping you stay ahead of 
performance bottlenecks, system failures, and inefficiencies.

The advanced dashboard is available in both ClickHouse OSS (Open Source Software)
and Cloud. In this article we will show you how to use the advanced dashboard in
Cloud.

## Accessing the advanced dashboard {#accessing-the-advanced-dashboard}

The advanced dashboard can be accessed by navigating to:

* Left side panel
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

## Accessing the native advanced dashboard {#accessing-the-native-advanced-dashboard}

The native advanced dashboard can be accessed by navigating to:

* Left side panel
  * `Monitoring` → `Advanced dashboard`
  * Clicking `You can still access the native advanced dashboard.`

This will open the native advanced dashboard in a new tab. You will need to 
authenticate to access the dashboard.

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

Each visualization has a SQL query associated with it that populates it. You can
edit this query by clicking on the pen icon.

<Image img={EditVisualization} size="lg" alt="Advanced dashboard"/>

## Out-of-box visualizations {#out-of-box-visualizations}

The default charts in the Advanced Dashboard are designed to provide real-time 
visibility into your ClickHouse system. Below is a list with descriptions for 
each chart. They are grouped into three categories to help you navigate them.

### ClickHouse specific {#clickhouse-specific}

These metrics are tailored to monitor the health and performance of your 
ClickHouse instance.

| Metric                    | Description                                                                              |
|---------------------------|------------------------------------------------------------------------------------------|
| Queries Per Second        | Tracks the rate of queries being processed                                               |
| Selected Rows/Sec         | Indicates the number of rows being read by queries                                       |
| Inserted Rows/Sec         | Measures the data ingestion rate                                                         |
| Total MergeTree Parts     | Shows the number of active parts in MergeTree tables, helping identify unbatched inserts |
| Max Parts for Partition   | Highlights the maximum number of parts in any partition                                  |
| Queries Running           | Displays the number of queries currently executing                                       |
| Selected Bytes Per Second | Indicates the volume of data being read by queries                                       |

### System health specific {#system-health-specific}

Monitoring the underlying system is just as important as watching ClickHouse itself.

| Metric                    | Description                                                               |
|---------------------------|---------------------------------------------------------------------------|
| IO Wait                   | Tracks I/O wait times                                                     |
| CPU Wait                  | Measures delays caused by CPU resource contention                         |
| Read From Disk            | Tracks the number of bytes read from disks or block devices               |
| Read From Filesystem      | Tracks the number of bytes read from the filesystem, including page cache |
| Memory (tracked, bytes)   | Shows memory usage for processes tracked by ClickHouse                    |
| Load Average (15 minutes) | Report the current load average 15 from the system                        |
| OS CPU Usage (Userspace)  | CPU Usage running userspace code                                          |
| OS CPU Usage (Kernel)     | CPU Usage running kernel code                                             |

## ClickHouse Cloud specific {#clickhouse-cloud-specific}

ClickHouse Cloud stores data using object storage (S3 type). Monitoring this 
interface can help detect issues.

| Metric                         | Description                                                 |
|--------------------------------|-------------------------------------------------------------|
| S3 Read wait                   | Measures the latency of read requests to S3                 |
| S3 read errors per second      | Tracks the read errors rate                                 |
| Read From S3 (bytes/sec)       | Tracks the rate data is read from S3 storage                |
| Disk S3 write req/sec          | Monitors the frequency of write operations to S3 storage    |
| Disk S3 read req/sec           | Monitors the frequency of read operations to S3 storage     |
| Page cache hit rate            | The hit rate of the page cache                              |
| Filesystem cache hit rate      | Hit rate of the filesystem cache                            |
| Filesystem cache size          | The current size of the filesystem cache                    |
| Network send bytes/sec         | Tracks the current speed of incoming network traffic        |
| Network receive bytes/sec      | Tracks the current speed of outbound network traffic        |
| Concurrent network connections | Tracks the number of current concurrent network connections |

## Identifying issues with the Advanced dashboard {#identifying-issues-with-the-advanced-dashboard}

Having this real-time view of the health of your ClickHouse service greatly helps
mitigate issues before they impact your business or help solve them. Below are a
few issues you can spot using the advanced dashboard.

### Unbatched inserts {#unbatched-inserts}

As described in the [best practices documentation](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous), it is recommended to always
bulk insert data into ClickHouse if able to do so synchronously.

A bulk insert with a reasonable batch size reduces the number of parts created 
during ingestion, resulting in more efficient write-on disks and fewer merge 
operations.

The key metrics to spot sub-optimized insert are **Inserted Rows/sec** and 
**Max Parts for Partition**

<Image img={InsertedRowsSec} size="lg" alt="Unbatched inserts"/>

The example above shows two spikes in **Inserted Rows/sec** and **Max Parts for Partition**
between 13h and 14h. This indicates that we ingest data at a reasonable speed.

Then we see another big spike on **Max Parts for Partition** after 16h but a 
very slow **Inserted Rows/sec speed**. A lot of parts are being created with 
very little data generated, which indicates that the size of the parts is 
sub-optimal.

### Resource intensive query {#resource-intensive-query}

It is common to run SQL queries that consume a large amount of resources, such as
CPU or memory. However, it is important to monitor these queries and understand 
their impact on your deployment's overall performance.

A sudden change in resource consumption without a change in query throughput can
indicate more expensive queries being executed. Depending on the type of queries
you are running, this can be expected, but spotting them from the advanced 
dashboard is good.

Below is an example of CPU usage peaking without significantly changing the 
number of queries per second executed.

<Image img={ResourceIntensiveQuery} size="lg" alt="Resource intensive query"/>

### Bad primary key design {#bad-primary-key-design}

Another issue you can spot using the advanced dashboard is a bad primary key design.
As described in ["A practical introduction to primary indexes in ClickHouse"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key),
choosing the primary key to fit best your use case will greatly improve performance
by reducing the number of rows ClickHouse needs to read to execute your query.

One of the metrics you can follow to spot potential improvements in primary keys
is **Selected Rows per second**. A sudden peak in the number of selected rows can
indicate both a general increase in overall query throughput, and queries that 
select a large number of rows to execute their query.

<Image img={SelectedRowsPerSecond} size="lg" alt="Resource intensive query"/>

Using the timestamp as a filter, you can find the queries executed at the time 
of the peak in the table `system.query_log`.

For example, running a query that shows all the queries executed between 11 am 
and 11 am on a certain day to understand what queries are reading too many rows:

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

In this example, we can see the same query being executed against two 
tables `amazon_reviews_no_pk` and `amazon_reviews_pk`. It can be concluded that 
someone was testing a primary key option for the table `amazon_reviews`.
