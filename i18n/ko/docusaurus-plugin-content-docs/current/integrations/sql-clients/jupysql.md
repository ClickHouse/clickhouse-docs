---
'slug': '/integrations/jupysql'
'sidebar_label': 'Jupyter 노트북'
'description': 'JupySQL은 Jupyter를 위한 다중 플랫폼 DATABASE 도구입니다.'
'title': 'JupySQL을 ClickHouse와 함께 사용하기'
'keywords':
- 'JupySQL'
- 'Jupyter notebook'
- 'Python'
- 'data analysis'
- 'interactive SQL'
'doc_type': 'guide'
'integration':
- 'support_level': 'community'
- 'category': 'sql_client'
---

import Image from '@theme/IdealImage';
import jupysql_plot_1 from '@site/static/images/integrations/sql-clients/jupysql-plot-1.png';
import jupysql_plot_2 from '@site/static/images/integrations/sql-clients/jupysql-plot-2.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse와 함께 JupySQL 사용하기

<CommunityMaintainedBadge/>

이 가이드에서는 ClickHouse와의 통합을 보여줍니다.

JupySQL을 사용하여 ClickHouse 위에서 쿼리를 실행할 것입니다. 데이터가 로드되면 SQL 플로팅을 통해 시각화할 것입니다.

JupySQL과 ClickHouse 간의 통합은 clickhouse_sqlalchemy 라이브러리를 사용함으로써 가능해집니다. 이 라이브러리는 두 시스템 간의 원활한 통신을 가능하게 하며, 사용자가 ClickHouse에 연결하고 SQL 방언을 전달할 수 있게 해줍니다. 연결되면 사용자는 ClickHouse의 기본 UI에서 직접 SQL 쿼리를 실행하거나 Jupyter 노트북에서 직접 실행할 수 있습니다.

```python

# Install required packages
%pip install --quiet jupysql clickhouse_sqlalchemy
```

    참고: 업데이트된 패키지를 사용하려면 커널을 재시작해야 할 수 있습니다.

```python
import pandas as pd
from sklearn_evaluation import plot


# Import jupysql Jupyter extension to create SQL cells
%load_ext sql
%config SqlMagic.autocommit=False
```

**다음 단계에 대해 ClickHouse가 활성화되고 도달 가능하도록 해야 합니다. 로컬 버전 또는 클라우드 버전을 사용할 수 있습니다.**

**참고:** 연결하려는 인스턴스 유형에 따라 연결 문자열을 조정해야 합니다 (url, user, password). 아래 예시에서는 로컬 인스턴스를 사용했습니다. 이에 대한 자세한 내용은 [이 가이드](/get-started/quick-start)를 확인해 주세요.

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

    *  clickhouse://default:***@localhost:8123/default
    완료.

<table>
    <tr>
    </tr>
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

    *  clickhouse://default:***@localhost:8123/default
    완료.

<table>
    <tr>
    </tr>
</table>

```python
%sql SELECT count() FROM trips limit 5;
```

    *  clickhouse://default:***@localhost:8123/default
    완료.

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

    *  clickhouse://default:***@localhost:8123/default
    완료.

<table>
    <tr>
        <th>pickup_ntaname</th>
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

    *  clickhouse://default:***@localhost:8123/default
    완료.

<table>
    <tr>
        <th>round(avg(tip_amount), 2)</th>
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

    *  clickhouse://default:***@localhost:8123/default
    완료.

<table>
    <tr>
        <th>passenger_count</th>
        <th>average_total_amount</th>
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

*  clickhouse://default:***@localhost:8123/default
완료.

<table>
    <tr>
        <th>pickup_date</th>
        <th>pickup_ntaname</th>
        <th>number_of_trips</th>
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

    *  clickhouse://default:***@localhost:8123/default
    실행 건너뛰기...

```python
%sqlplot histogram --table short-trips --column trip_distance --bins 10 --with short-trips
```

```response
<AxesSubplot: title={'center': "'trip_distance' from 'short-trips'"}, xlabel='trip_distance', ylabel='Count'>
```
<Image img={jupysql_plot_1} size="md" alt="짧은 여행 데이터셋에서 10개의 빈을 가진 여행 거리의 분포를 나타내는 히스토그램" border />

```python
ax = %sqlplot histogram --table short-trips --column trip_distance --bins 50 --with short-trips
ax.grid()
ax.set_title("Trip distance from trips < 6.3")
_ = ax.set_xlabel("Trip distance")
```

<Image img={jupysql_plot_2} size="md" alt="50개의 빈과 격자를 가진 여행 거리의 분포를 나타내는 히스토그램, 제목은 '여행 < 6.3의 여행 거리'" border />
