---
slug: /integrations/jupysql
sidebar_label: 'Jupyter ノートブック'
description: 'JupySQL は Jupyter 向けのマルチプラットフォーム対応データベースツールです。'
title: 'ClickHouse で JupySQL を使用する'
keywords: ['JupySQL', 'Jupyter ノートブック', 'Python', 'データ分析', '対話型 SQL']
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import jupysql_plot_1 from '@site/static/images/integrations/sql-clients/jupysql-plot-1.png';
import jupysql_plot_2 from '@site/static/images/integrations/sql-clients/jupysql-plot-2.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# ClickHouse で JupySQL を使用する {#using-jupysql-with-clickhouse}

<CommunityMaintainedBadge />

このガイドでは、ClickHouse との連携方法を紹介します。

JupySQL を使って ClickHouse 上でクエリを実行します。
データがロードされたら、SQL プロットを使って可視化します。

JupySQL と ClickHouse の統合は、`clickhouse_sqlalchemy` ライブラリによって実現されています。このライブラリにより、両システム間の通信が容易になり、ユーザーは ClickHouse に接続して SQL 方言を指定できます。接続が確立されると、ユーザーは ClickHouse のネイティブ UI から、または Jupyter Notebook から直接 SQL クエリを実行できます。

```python
# Install required packages
%pip install --quiet jupysql clickhouse_sqlalchemy
```

注意：更新したパッケージを使用するには、カーネルを再起動する必要がある場合があります。

```python
import pandas as pd
from sklearn_evaluation import plot

# Import jupysql Jupyter extension to create SQL cells
%load_ext sql
%config SqlMagic.autocommit=False
```

**次のステップに進む前に、ClickHouse が稼働しており、接続可能であることを必ず確認してください。ローカル環境版でもクラウド版でも、どちらを使用しても構いません。**

**注意:** 接続先のインスタンスの種類（URL、ユーザー、パスワード）に応じて、接続文字列を調整する必要があります。以下の例ではローカルインスタンスを使用しています。詳細については、[このガイド](/get-started/quick-start)を参照してください。

```python
%sql clickhouse://default:@localhost:8123/default
```

```sql
%%sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime;
```

* clickhouse://default:***@localhost:8123/default
  完了しました。

<table>
  <tr />
</table>

```sql
%%sql
INSERT INTO trips
SELECT * FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
    'TabSeparatedWithNames', "
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
") SETTINGS input_format_try_infer_datetimes = 0
```

* clickhouse://default:***@localhost:8123/default
  完了。

<table>
  <tr />
</table>

```python
%sql SELECT count() FROM trips limit 5;
```

* clickhouse://default:***@localhost:8123/default
  完了しました。

<table>
  <tr>
    <th>count()</th>
  </tr>

  <tr>
    <td>1999657</td>
  </tr>
</table>

```python
%sql SELECT DISTINCT(pickup_ntaname) FROM trips limit 5;
```

* clickhouse://default:***@localhost:8123/default
  完了。

<table>
  <tr>
    <th>pickup&#95;ntaname</th>
  </tr>

  <tr>
    <td>Morningside Heights</td>
  </tr>

  <tr>
    <td>Hudson Yards-Chelsea-Flatiron-Union Square</td>
  </tr>

  <tr>
    <td>Midtown-Midtown South</td>
  </tr>

  <tr>
    <td>SoHo-Tribeca-Civic Center-Little Italy</td>
  </tr>

  <tr>
    <td>Murray Hill-Kips Bay</td>
  </tr>
</table>

```python
%sql SELECT round(avg(tip_amount), 2) FROM trips
```

* clickhouse://default:***@localhost:8123/default
  完了しました。

<table>
  <tr>
    <th>round(avg(tip&#95;amount), 2)</th>
  </tr>

  <tr>
    <td>1.68</td>
  </tr>
</table>

```sql
%%sql
SELECT
    passenger_count,
    ceil(avg(total_amount),2) AS average_total_amount
FROM trips
GROUP BY passenger_count
```

* clickhouse://default:***@localhost:8123/default
  完了しました。

<table>
  <tr>
    <th>passenger&#95;count</th>
    <th>average&#95;total&#95;amount</th>
  </tr>

  <tr>
    <td>0</td>
    <td>22.69</td>
  </tr>

  <tr>
    <td>1</td>
    <td>15.97</td>
  </tr>

  <tr>
    <td>2</td>
    <td>17.15</td>
  </tr>

  <tr>
    <td>3</td>
    <td>16.76</td>
  </tr>

  <tr>
    <td>4</td>
    <td>17.33</td>
  </tr>

  <tr>
    <td>5</td>
    <td>16.35</td>
  </tr>

  <tr>
    <td>6</td>
    <td>16.04</td>
  </tr>

  <tr>
    <td>7</td>
    <td>59.8</td>
  </tr>

  <tr>
    <td>8</td>
    <td>36.41</td>
  </tr>

  <tr>
    <td>9</td>
    <td>9.81</td>
  </tr>
</table>

```sql
%%sql
SELECT
    pickup_date,
    pickup_ntaname,
    SUM(1) AS number_of_trips
FROM trips
GROUP BY pickup_date, pickup_ntaname
ORDER BY pickup_date ASC
limit 5;
```

* clickhouse://default:***@localhost:8123/default
  完了しました。

<table>
  <tr>
    <th>pickup&#95;date</th>
    <th>pickup&#95;ntaname</th>
    <th>number&#95;of&#95;trips</th>
  </tr>

  <tr>
    <td>2015-07-01</td>
    <td>Bushwick North</td>
    <td>2</td>
  </tr>

  <tr>
    <td>2015-07-01</td>
    <td>Brighton Beach</td>
    <td>1</td>
  </tr>

  <tr>
    <td>2015-07-01</td>
    <td>Briarwood-Jamaica Hills</td>
    <td>3</td>
  </tr>

  <tr>
    <td>2015-07-01</td>
    <td>Williamsburg</td>
    <td>1</td>
  </tr>

  <tr>
    <td>2015-07-01</td>
    <td>Queensbridge-Ravenswood-Long Island City</td>
    <td>9</td>
  </tr>
</table>

```python
# %sql DESCRIBE trips;
```

```python
# %sql SELECT DISTINCT(trip_distance) FROM trips limit 50;
```

```sql
%%sql --save short-trips --no-execute
SELECT *
FROM trips
WHERE trip_distance < 6.3
```

* clickhouse://default:***@localhost:8123/default
  実行をスキップします...

```python
%sqlplot histogram --table short-trips --column trip_distance --bins 10 --with short-trips
```

```response
<AxesSubplot: title={'center': "'trip_distance' from 'short-trips'"}, xlabel='trip_distance', ylabel='件数'>
```

<Image img={jupysql_plot_1} size="md" alt="short-trips データセットの乗車距離の分布を 10 個のビンで示したヒストグラム" border />

```python
ax = %sqlplot histogram --table short-trips --column trip_distance --bins 50 --with short-trips
ax.grid()
ax.set_title("6.3未満の移動における移動距離")
_ = ax.set_xlabel("移動距離")
```

<Image img={jupysql_plot_2} size="md" alt="50 個のビンとグリッド線付きで乗車距離の分布を示したヒストグラム。タイトルは『Trip distance from trips < 6.3』" border />
