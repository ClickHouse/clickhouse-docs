---
description: '機械生成ログデータ向けの新しい分析ベンチマーク'
sidebar_label: 'Brown University ベンチマーク'
slug: /getting-started/example-datasets/brown-benchmark
title: 'Brown University ベンチマーク'
keywords: ['Brown University Benchmark', 'MgBench', 'log data benchmark', 'machine-generated data', 'getting started']
doc_type: 'guide'
---

`MgBench` は機械生成ログデータ向けの新しい分析ベンチマークであり、[Andrew Crotty](http://cs.brown.edu/people/acrotty/) によって開発されました。

データをダウンロード:

```bash
wget https://datasets.clickhouse.com/mgbench{1..3}.csv.xz
```

データを展開します：

```bash
xz -v -d mgbench{1..3}.csv.xz
```

データベースとテーブルを作成する：

```sql
CREATE DATABASE mgbench;
```

```sql
USE mgbench;
```

```sql
CREATE TABLE mgbench.logs1 (
  log_time      DateTime,
  machine_name  LowCardinality(String),
  machine_group LowCardinality(String),
  cpu_idle      Nullable(Float32),
  cpu_nice      Nullable(Float32),
  cpu_system    Nullable(Float32),
  cpu_user      Nullable(Float32),
  cpu_wio       Nullable(Float32),
  disk_free     Nullable(Float32),
  disk_total    Nullable(Float32),
  part_max_used Nullable(Float32),
  load_fifteen  Nullable(Float32),
  load_five     Nullable(Float32),
  load_one      Nullable(Float32),
  mem_buffers   Nullable(Float32),
  mem_cached    Nullable(Float32),
  mem_free      Nullable(Float32),
  mem_shared    Nullable(Float32),
  swap_free     Nullable(Float32),
  bytes_in      Nullable(Float32),
  bytes_out     Nullable(Float32)
)
ENGINE = MergeTree()
ORDER BY (machine_group, machine_name, log_time);
```

```sql
CREATE TABLE mgbench.logs2 (
  log_time    DateTime,
  client_ip   IPv4,
  request     String,
  status_code UInt16,
  object_size UInt64
)
ENGINE = MergeTree()
ORDER BY log_time;
```

```sql
CREATE TABLE mgbench.logs3 (
  log_time     DateTime64,
  device_id    FixedString(15),
  device_name  LowCardinality(String),
  device_type  LowCardinality(String),
  device_floor UInt8,
  event_type   LowCardinality(String),
  event_unit   FixedString(1),
  event_value  Nullable(Float32)
)
ENGINE = MergeTree()
ORDER BY (event_type, log_time);
```

データの挿入：

```bash
clickhouse-client --query "INSERT INTO mgbench.logs1 FORMAT CSVWithNames" < mgbench1.csv
clickhouse-client --query "INSERT INTO mgbench.logs2 FORMAT CSVWithNames" < mgbench2.csv
clickhouse-client --query "INSERT INTO mgbench.logs3 FORMAT CSVWithNames" < mgbench3.csv
```


## ベンチマーククエリの実行 {#run-benchmark-queries}

```sql
USE mgbench;
```

```sql
-- Q1.1: 深夜0時以降の各WebサーバーにおけるCPU/ネットワーク使用率は？

SELECT machine_name,
       MIN(cpu) AS cpu_min,
       MAX(cpu) AS cpu_max,
       AVG(cpu) AS cpu_avg,
       MIN(net_in) AS net_in_min,
       MAX(net_in) AS net_in_max,
       AVG(net_in) AS net_in_avg,
       MIN(net_out) AS net_out_min,
       MAX(net_out) AS net_out_max,
       AVG(net_out) AS net_out_avg
FROM (
  SELECT machine_name,
         COALESCE(cpu_user, 0.0) AS cpu,
         COALESCE(bytes_in, 0.0) AS net_in,
         COALESCE(bytes_out, 0.0) AS net_out
  FROM logs1
  WHERE machine_name IN ('anansi','aragog','urd')
    AND log_time >= TIMESTAMP '2017-01-11 00:00:00'
) AS r
GROUP BY machine_name;
```

```sql
-- Q1.2: 過去1日間でオフラインになったコンピュータラボのマシンは？

SELECT machine_name,
       log_time
FROM logs1
WHERE (machine_name LIKE 'cslab%' OR
       machine_name LIKE 'mslab%')
  AND load_one IS NULL
  AND log_time >= TIMESTAMP '2017-01-10 00:00:00'
ORDER BY machine_name,
         log_time;
```

```sql
-- Q1.3: 特定のワークステーションにおける過去10日間の時間別平均メトリクスは？

SELECT dt,
       hr,
       AVG(load_fifteen) AS load_fifteen_avg,
       AVG(load_five) AS load_five_avg,
       AVG(load_one) AS load_one_avg,
       AVG(mem_free) AS mem_free_avg,
       AVG(swap_free) AS swap_free_avg
FROM (
  SELECT CAST(log_time AS DATE) AS dt,
         EXTRACT(HOUR FROM log_time) AS hr,
         load_fifteen,
         load_five,
         load_one,
         mem_free,
         swap_free
  FROM logs1
  WHERE machine_name = 'babbage'
    AND load_fifteen IS NOT NULL
    AND load_five IS NOT NULL
    AND load_one IS NOT NULL
    AND mem_free IS NOT NULL
    AND swap_free IS NOT NULL
    AND log_time >= TIMESTAMP '2017-01-01 00:00:00'
) AS r
GROUP BY dt,
         hr
ORDER BY dt,
         hr;
```

```sql
-- Q1.4: 1ヶ月間で各サーバーがディスクI/Oでブロックされた頻度は？

SELECT machine_name,
       COUNT(*) AS spikes
FROM logs1
WHERE machine_group = 'Servers'
  AND cpu_wio > 0.99
  AND log_time >= TIMESTAMP '2016-12-01 00:00:00'
  AND log_time < TIMESTAMP '2017-01-01 00:00:00'
GROUP BY machine_name
ORDER BY spikes DESC
LIMIT 10;
```

```sql
-- Q1.5: 外部からアクセス可能なVMのうちメモリ不足が発生したものは？

SELECT machine_name,
       dt,
       MIN(mem_free) AS mem_free_min
FROM (
  SELECT machine_name,
         CAST(log_time AS DATE) AS dt,
         mem_free
  FROM logs1
  WHERE machine_group = 'DMZ'
    AND mem_free IS NOT NULL
) AS r
GROUP BY machine_name,
         dt
HAVING MIN(mem_free) < 10000
ORDER BY machine_name,
         dt;
```

```sql
-- Q1.6: すべてのファイルサーバーにおける時間別の総ネットワークトラフィックは？

```


SELECT dt,
hr,
SUM(net&#95;in) AS net&#95;in&#95;sum,
SUM(net&#95;out) AS net&#95;out&#95;sum,
SUM(net&#95;in) + SUM(net&#95;out) AS both&#95;sum
FROM (
SELECT CAST(log&#95;time AS DATE) AS dt,
EXTRACT(HOUR FROM log&#95;time) AS hr,
COALESCE(bytes&#95;in, 0.0) / 1000000000.0 AS net&#95;in,
COALESCE(bytes&#95;out, 0.0) / 1000000000.0 AS net&#95;out
FROM logs1
WHERE machine&#95;name IN (&#39;allsorts&#39;,&#39;andes&#39;,&#39;bigred&#39;,&#39;blackjack&#39;,&#39;bonbon&#39;,
&#39;cadbury&#39;,&#39;chiclets&#39;,&#39;cotton&#39;,&#39;crows&#39;,&#39;dove&#39;,&#39;fireball&#39;,&#39;hearts&#39;,&#39;huey&#39;,
&#39;lindt&#39;,&#39;milkduds&#39;,&#39;milkyway&#39;,&#39;mnm&#39;,&#39;necco&#39;,&#39;nerds&#39;,&#39;orbit&#39;,&#39;peeps&#39;,
&#39;poprocks&#39;,&#39;razzles&#39;,&#39;runts&#39;,&#39;smarties&#39;,&#39;smuggler&#39;,&#39;spree&#39;,&#39;stride&#39;,
&#39;tootsie&#39;,&#39;trident&#39;,&#39;wrigley&#39;,&#39;york&#39;)
) AS r
GROUP BY dt,
hr
ORDER BY both&#95;sum DESC
LIMIT 10;

````

```sql
-- Q2.1: 過去2週間でサーバーエラーが発生したリクエストはどれか？

SELECT *
FROM logs2
WHERE status_code >= 500
  AND log_time >= TIMESTAMP '2012-12-18 00:00:00'
ORDER BY log_time;
````

```sql
-- Q2.2: 特定の2週間の期間中に、ユーザーパスワードファイルが漏洩したか？

SELECT *
FROM logs2
WHERE status_code >= 200
  AND status_code < 300
  AND request LIKE '%/etc/passwd%'
  AND log_time >= TIMESTAMP '2012-05-06 00:00:00'
  AND log_time < TIMESTAMP '2012-05-20 00:00:00';
```

```sql
-- Q2.3: 過去1ヶ月間のトップレベルリクエストの平均パス深度は？

SELECT top_level,
       AVG(LENGTH(request) - LENGTH(REPLACE(request, '/', ''))) AS depth_avg
FROM (
  SELECT SUBSTRING(request FROM 1 FOR len) AS top_level,
         request
  FROM (
    SELECT POSITION(SUBSTRING(request FROM 2), '/') AS len,
           request
    FROM logs2
    WHERE status_code >= 200
      AND status_code < 300
      AND log_time >= TIMESTAMP '2012-12-01 00:00:00'
  ) AS r
  WHERE len > 0
) AS s
WHERE top_level IN ('/about','/courses','/degrees','/events',
                    '/grad','/industry','/news','/people',
                    '/publications','/research','/teaching','/ugrad')
GROUP BY top_level
ORDER BY top_level;
```

```sql
-- Q2.4: 過去3ヶ月間で、過度に多くのリクエストを行ったクライアントはどれか？

SELECT client_ip,
       COUNT(*) AS num_requests
FROM logs2
WHERE log_time >= TIMESTAMP '2012-10-01 00:00:00'
GROUP BY client_ip
HAVING COUNT(*) >= 100000
ORDER BY num_requests DESC;
```

```sql
-- Q2.5: 日次のユニークビジター数は？

SELECT dt,
       COUNT(DISTINCT client_ip)
FROM (
  SELECT CAST(log_time AS DATE) AS dt,
         client_ip
  FROM logs2
) AS r
GROUP BY dt
ORDER BY dt;
```

```sql
-- Q2.6: 平均および最大データ転送速度（Gbps）は？

SELECT AVG(transfer) / 125000000.0 AS transfer_avg,
       MAX(transfer) / 125000000.0 AS transfer_max
FROM (
  SELECT log_time,
         SUM(object_size) AS transfer
  FROM logs2
  GROUP BY log_time
) AS r;
```

```sql
-- Q3.1: 週末に室内温度が氷点下に達しましたか？

SELECT *
FROM logs3
WHERE event_type = 'temperature'
  AND event_value <= 32.0
  AND log_time >= '2019-11-29 17:00:00.000';
```

```sql
-- Q3.4: 過去6ヶ月間で、各ドアが開けられた頻度は？

SELECT device_name,
       device_floor,
       COUNT(*) AS ct
FROM logs3
WHERE event_type = 'door_open'
  AND log_time >= '2019-06-01 00:00:00.000'
GROUP BY device_name,
         device_floor
ORDER BY ct DESC;
```


以下のクエリ 3.5 では `UNION` を使用します。`SELECT` クエリ結果を結合する際のモードを設定します。この設定は、`UNION ALL` または `UNION DISTINCT` を明示的に指定せずに `UNION` を使用した場合にのみ適用されます。

```sql
SET union_default_mode = 'DISTINCT'
```

```sql
-- Q3.5: 建物内で冬季と夏季に大きな温度変動が発生するのはどこか?

WITH temperature AS (
  SELECT dt,
         device_name,
         device_type,
         device_floor
  FROM (
    SELECT dt,
           hr,
           device_name,
           device_type,
           device_floor,
           AVG(event_value) AS temperature_hourly_avg
    FROM (
      SELECT CAST(log_time AS DATE) AS dt,
             EXTRACT(HOUR FROM log_time) AS hr,
             device_name,
             device_type,
             device_floor,
             event_value
      FROM logs3
      WHERE event_type = 'temperature'
    ) AS r
    GROUP BY dt,
             hr,
             device_name,
             device_type,
             device_floor
  ) AS s
  GROUP BY dt,
           device_name,
           device_type,
           device_floor
  HAVING MAX(temperature_hourly_avg) - MIN(temperature_hourly_avg) >= 25.0
)
SELECT DISTINCT device_name,
       device_type,
       device_floor,
       '冬季'
FROM temperature
WHERE dt >= DATE '2018-12-01'
  AND dt < DATE '2019-03-01'
UNION
SELECT DISTINCT device_name,
       device_type,
       device_floor,
       '夏季'
FROM temperature
WHERE dt >= DATE '2019-06-01'
  AND dt < DATE '2019-09-01';
```

```sql
-- Q3.6: 各デバイスカテゴリの月次電力消費量メトリクスは？

SELECT yr,
       mo,
       SUM(coffee_hourly_avg) AS coffee_monthly_sum,
       AVG(coffee_hourly_avg) AS coffee_monthly_avg,
       SUM(printer_hourly_avg) AS printer_monthly_sum,
       AVG(printer_hourly_avg) AS printer_monthly_avg,
       SUM(projector_hourly_avg) AS projector_monthly_sum,
       AVG(projector_hourly_avg) AS projector_monthly_avg,
       SUM(vending_hourly_avg) AS vending_monthly_sum,
       AVG(vending_hourly_avg) AS vending_monthly_avg
FROM (
  SELECT dt,
         yr,
         mo,
         hr,
         AVG(coffee) AS coffee_hourly_avg,
         AVG(printer) AS printer_hourly_avg,
         AVG(projector) AS projector_hourly_avg,
         AVG(vending) AS vending_hourly_avg
  FROM (
    SELECT CAST(log_time AS DATE) AS dt,
           EXTRACT(YEAR FROM log_time) AS yr,
           EXTRACT(MONTH FROM log_time) AS mo,
           EXTRACT(HOUR FROM log_time) AS hr,
           CASE WHEN device_name LIKE 'coffee%' THEN event_value END AS coffee,
           CASE WHEN device_name LIKE 'printer%' THEN event_value END AS printer,
           CASE WHEN device_name LIKE 'projector%' THEN event_value END AS projector,
           CASE WHEN device_name LIKE 'vending%' THEN event_value END AS vending
    FROM logs3
    WHERE device_type = 'meter'
  ) AS r
  GROUP BY dt,
           yr,
           mo,
           hr
) AS s
GROUP BY yr,
         mo
ORDER BY yr,
         mo;
```

このデータは、[Playground](https://sql.clickhouse.com) でのインタラクティブなクエリや、[example](https://sql.clickhouse.com?query_id=1MXMHASDLEQIP4P1D1STND) からも利用できます。
