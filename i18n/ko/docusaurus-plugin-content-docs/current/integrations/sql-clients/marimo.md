---
'slug': '/integrations/marimo'
'sidebar_label': 'marimo'
'description': 'marimo는 데이터와 상호작용하기 위한 차세대 Python 노트북입니다.'
'title': 'ClickHouse와 marimo 사용하기'
'doc_type': 'guide'
'keywords':
- 'marimo'
- 'notebook'
- 'data analysis'
- 'python'
- 'visualization'
---

import Image from '@theme/IdealImage';
import marimo_connect from '@site/static/images/integrations/sql-clients/marimo/clickhouse-connect.gif';
import add_db_panel from '@site/static/images/integrations/sql-clients/marimo/panel-arrow.png';
import add_db_details from '@site/static/images/integrations/sql-clients/marimo/add-db-details.png';
import run_cell from '@site/static/images/integrations/sql-clients/marimo/run-cell.png';
import choose_sql_engine from '@site/static/images/integrations/sql-clients/marimo/choose-sql-engine.png';
import results from '@site/static/images/integrations/sql-clients/marimo/results.png';
import dropdown_cell_chart from '@site/static/images/integrations/sql-clients/marimo/dropdown-cell-chart.png';
import run_app_view from '@site/static/images/integrations/sql-clients/marimo/run-app-view.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse와 marimo 사용하기

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/)는 SQL이 내장된 Python의 오픈 소스 반응형 노트북입니다. 셀을 실행하거나 UI 요소와 상호작용할 때, marimo는 영향을 받는 셀을 자동으로 실행(또는 오래된 것으로 표시)하여 코드와 출력 결과의 일관성을 유지하고 버그가 발생하기 전에 예방합니다. 모든 marimo 노트북은 순수 Python으로 저장되며 스크립트로 실행할 수 있고 애플리케이션으로 배포할 수 있습니다.

<Image img={marimo_connect} size="md" border alt="ClickHouse에 연결하기" />

## 1. SQL 지원이 있는 marimo 설치하기 {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
이것은 localhost에서 실행되는 웹 브라우저를 열어야 합니다.

## 2. ClickHouse에 연결하기 {#connect-to-clickhouse}

marimo 편집기 왼쪽의 데이터 소스 패널로 이동하여 '데이터베이스 추가'를 클릭합니다.

<Image img={add_db_panel} size="sm" border alt="새 데이터베이스 추가하기" />

데이터베이스 세부 정보를 입력하라는 메시지가 표시됩니다.

<Image img={add_db_details} size="md" border alt="데이터베이스 세부 정보 입력하기" />

그런 다음 연결을 설정하기 위해 실행할 수 있는 셀이 생성됩니다.

<Image img={run_cell} size="md" border alt="ClickHouse에 연결하기 위해 셀 실행하기" />

## 3. SQL 실행하기 {#run-sql}

연결을 설정한 후에는 새 SQL 셀을 생성하고 ClickHouse 엔진을 선택할 수 있습니다.

<Image img={choose_sql_engine} size="md" border alt="SQL 엔진 선택하기" />

이 가이드에서는 뉴욕 택시 데이터셋을 사용할 것입니다.

```sql
CREATE TABLE trips (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_0.gz',
    'TabSeparatedWithNames'
);
```

```sql
SELECT * FROM trips LIMIT 1000;
```

<Image img={results} size="lg" border alt="데이터프레임의 결과" />

이제 데이터프레임에서 결과를 볼 수 있습니다. 특정 픽업 위치에서 가장 비싼 하차 지점을 시각화하고 싶습니다. marimo는 이를 도와줄 여러 UI 구성 요소를 제공합니다. 저는 위치를 선택하기 위해 드롭다운과 차트를 위한 altair를 사용할 것입니다.

<Image img={dropdown_cell_chart} size="lg" border alt="드롭다운, 테이블 및 차트의 조합" />

marimo의 반응형 실행 모델은 SQL 쿼리에도 확장되어, SQL 변경 사항이 의존하는 셀에 대한 하위 계산을 자동으로 트리거합니다(또는 비용이 많이 드는 계산을 위해 셀을 선택적으로 오래된 것으로 표시할 수 있습니다). 따라서 쿼리가 업데이트될 때 차트와 테이블이 변경됩니다.

데이터 탐색을 위한 깔끔한 인터페이스를 원할 경우 App View를 토글할 수도 있습니다.

<Image img={run_app_view} size="md" border alt="앱 뷰 실행하기" />
