---
'slug': '/data-modeling/projections'
'title': '프로젝션'
'description': '페이지는 프로젝션이 무엇인지, 쿼리 성능을 개선하기 위해 어떻게 사용할 수 있는지, 물리화된 뷰와 어떻게 다른지 설명합니다.'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
'sidebar_order': 1
'doc_type': 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';



# 프로젝션

## 소개 {#introduction}

ClickHouse는 대량의 데이터에 대한 분석 쿼리를 실시간 시나리오에서 가속화하기 위한 다양한 메커니즘을 제공합니다. 쿼리 속도를 높이기 위한 이러한 메커니즘 중 하나는 _프로젝션_의 사용입니다. 프로젝션은 관심 속성별로 데이터의 재정렬을 통해 쿼리를 최적화하는 데 도움을 줍니다. 이는 다음과 같을 수 있습니다:

1. 완전한 재정렬
2. 다른 순서의 원본 테이블의 하위 집합
3. 집계에 맞춘 정렬이 포함된 미리 계산된 집계 (물리화된 뷰와 유사)

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 프로젝션은 어떻게 작동하나요? {#how-do-projections-work}

실질적으로, 프로젝션은 원본 테이블에 대한 추가적인 숨겨진 테이블로 생각할 수 있습니다. 프로젝션은 다른 행 순서를 가질 수 있으며, 따라서 원본 테이블과는 다른 기본 인덱스를 가질 수 있으며, 자동으로 점진적으로 집계 값을 미리 계산할 수 있습니다. 그 결과, 프로젝션을 사용하는 것은 쿼리 실행 속도를 높이기 위한 두 가지 "조정 나사"를 제공합니다:

- **기본 인덱스를 적절히 사용하기**
- **집계를 미리 계산하기**

프로젝션은 여러 행 순서를 가질 수 있고 삽입 시 집계를 미리 계산할 수 있는 [물리화된 뷰](/materialized-views)와 몇 가지 면에서 유사합니다. 프로젝션은 자동으로 업데이트되며 원본 테이블과 동기화되며, 이는 물리화된 뷰가 명시적으로 업데이트되는 것과는 다릅니다. 쿼리가 원본 테이블을 대상으로 할 때, ClickHouse는 자동으로 기본 키를 샘플링하고 동일한 정확한 결과를 생성할 수 있는 테이블을 선택하지만 읽어야 하는 데이터 양이 가장 적도록 합니다. 아래 그림과 같이:

<Image img={projections_1} size="md" alt="ClickHouse의 프로젝션"/>

### `_part_offset`으로 더 스마트한 저장 {#smarter_storage_with_part_offset}

버전 25.5부터, ClickHouse는 프로젝션에서 가상의 컬럼 `_part_offset`을 지원하여 프로젝션을 정의하는 새로운 방법을 제공합니다.

프로젝션을 정의하는 방법에는 이제 두 가지가 있습니다:

- **전체 컬럼 저장 (원본 동작)**: 프로젝션은 전체 데이터를 포함하며 직접 읽을 수 있어, 필터가 프로젝션의 정렬 순서와 일치할 때 더 빠른 성능을 제공합니다.

- **정렬 키 + `_part_offset`만 저장**: 프로젝션은 인덱스처럼 작동합니다. ClickHouse는 프로젝션의 기본 인덱스를 사용하여 일치하는 행을 찾지만, 실제 데이터는 기본 테이블에서 읽습니다. 이는 쿼리 시간에 약간 더 많은 I/O 비용을 발생시키는 대신 저장 오버헤드를 줄입니다.

위의 접근 방식은 혼합되어 일부 컬럼은 프로젝션에 저장하고 다른 컬럼은 `_part_offset`을 통해 간접적으로 저장할 수도 있습니다.

## 프로젝션을 언제 사용하나요? {#when-to-use-projections}

프로젝션은 데이터가 삽입될 때 자동으로 유지보수되기 때문에 새로운 사용자에게 매력적인 기능입니다. 게다가, 쿼리는 응답 시간을 줄이기 위해 가능한 한 프로젝션이 활용되는 단일 테이블로 전송될 수 있습니다.

이는 사용자가 적절한 최적화된 대상 테이블을 선택하거나 필터에 따라 쿼리를 재작성해야 하는 물리화된 뷰와 대조됩니다. 이는 사용자 애플리케이션에 더 큰 비중을 두며 클라이언트 측 복잡성을 증가시킵니다.

이러한 장점에도 불구하고 프로젝션에는 사용자가 알아야 할 몇 가지 고유한 제한 사항이 있으며, 따라서 신중하게 배포해야 합니다.

- 프로젝션은 소스 테이블과 (숨겨진) 대상 테이블에 대해 서로 다른 TTL을 사용할 수 없습니다. 물리화된 뷰는 서로 다른 TTL을 허용합니다.
- 프로젝션이 있는 테이블에 대해서는 경량 업데이트 및 삭제가 지원되지 않습니다.
- 물리화된 뷰는 체인할 수 있습니다: 하나의 물리화된 뷰의 대상 테이블이 다른 물리화된 뷰의 소스 테이블이 될 수 있습니다. 이는 프로젝션으로는 불가능합니다.
- 프로젝션은 조인을 지원하지 않지만 물리화된 뷰는 지원합니다.
- 프로젝션은 필터(`WHERE` 절)를 지원하지 않지만 물리화된 뷰는 지원합니다.

다음의 경우 프로젝션을 사용하는 것이 좋습니다:

- 데이터의 완전한 재정렬이 필요한 경우. 프로젝션의 표현식은 이론적으로 `GROUP BY`를 사용할 수 있지만, 집계를 유지하는 데 물리화된 뷰가 더 효과적입니다. 쿼리 최적화기는 간단한 재정렬을 사용하는 프로젝션을 활용할 가능성이 더 높습니다, 즉 `SELECT * ORDER BY x`. 사용자들은 이 표현식에서 컬럼의 하위 집합을 선택하여 저장소 발자국을 줄일 수 있습니다.
- 사용자가 잠재적으로 저장소 발자국 증가와 데이터를 두 번 쓰는 것에 대한 오버헤드에 대해 편안한 경우. 삽입 속도에 미치는 영향을 테스트하고 [저장소 오버헤드 평가하기](/data-compression/compression-in-clickhouse).

## 예제 {#examples}

### 기본 키에 없는 컬럼 필터링 {#filtering-without-using-primary-keys}

이번 예제에서는 테이블에 프로젝션을 추가하는 방법을 보여드리겠습니다. 또한 기본 키에 없는 컬럼에 대한 필터링 쿼리를 가속화하는 데 프로젝션이 어떻게 사용될 수 있는지도 살펴보겠습니다.

이번 예제에서는 `pickup_datetime`으로 정렬된 New York Taxi Data 데이터세트를 사용할 것입니다. 데이터는 [sql.clickhouse.com](https://sql.clickhouse.com/)에서 사용할 수 있습니다.

승객이 기사에게 $200보다 더 많은 팁을 준 모든 여행 ID를 찾기 위해 간단한 쿼리를 작성해 보겠습니다:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`ORDER BY`에 포함되지 않은 `tip_amount`에 필터링을 하기 때문에 ClickHouse는 전체 테이블 스캔을 수행해야 했다는 것을 유의하세요. 이 쿼리를 가속화해 보겠습니다.

원본 테이블과 결과를 보존하기 위해 새로운 테이블을 만들고 `INSERT INTO SELECT`를 사용하여 데이터를 복사하겠습니다:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

프로젝션을 추가하려면 `ALTER TABLE` 문과 함께 `ADD PROJECTION` 문을 사용합니다:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

프로젝션을 추가한 후에는 `MATERIALIZE PROJECTION` 문을 사용하여 위에서 지정한 쿼리에 따라 데이터를 물리적으로 정렬하고 다시 작성해야 합니다:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

프로젝션을 추가한 후에 쿼리를 다시 실행해 보겠습니다:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

쿼리 시간을 상당히 줄일 수 있었고 스캔한 행 수가 감소한 것을 확인하세요.

위의 쿼리가 실제로 우리가 만든 프로젝션을 사용했음을 확인하기 위해 `system.query_log` 테이블을 조회해 보겠습니다:

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='<query_id>'
```

```response
┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
│ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
│↳  tip_amount,                                                                ↴│                                  │
│↳  trip_id,                                                                   ↴│                                  │
│↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
│↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
└───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### 프로젝션을 사용하여 영국 가격 쿼리 가속화 {#using-projections-to-speed-up-UK-price-paid}

프로젝션이 쿼리 성능을 가속화하는 데 어떻게 사용될 수 있는지 보여주기 위해, 실제 데이터세트를 사용하는 예제를 살펴보겠습니다. 이번 예제에서는 30.03백만 행을 가진 [영국 부동산 가격 데이터](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 테이블을 사용할 것입니다. 이 데이터세트는 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 환경에서도 사용할 수 있습니다.

테이블이 어떻게 생성되었고 데이터가 삽입되었는지 보려면 ["영국 부동산 가격 데이터셋"](/getting-started/example-datasets/uk-price-paid) 페이지를 참조하세요.

이 데이터세트에서 두 개의 간단한 쿼리를 실행할 수 있습니다. 첫 번째 쿼리는 런던에서 가장 높은 가격이 지불된 카운티를 나열하고, 두 번째 쿼리는 카운티의 평균 가격을 계산합니다:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

모든 30.03백만 행에 대한 전체 테이블 스캔이 발생한 것을 주의하세요. 이는 `town`이나 `price`가 테이블을 생성할 때 `ORDER BY` 문에 포함되지 않았기 때문입니다:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

프로젝션을 사용하여 이 쿼리를 가속화할 수 있는지 봅시다.

원본 테이블과 결과를 보존하기 위해 새로운 테이블을 만들고 `INSERT INTO SELECT`를 사용하여 데이터를 복사하겠습니다:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

우리는 `town` 및 `price`별로 정렬된 추가 (숨겨진) 테이블을 생성하고 채우는 프로젝션 `prj_oby_town_price`를 만듭니다. 이는 특정 도시에서 가장 높은 가격이 지불된 카운티를 나열하는 쿼리를 최적화합니다:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

[`mutations_sync`](/operations/settings/settings#mutations_sync) 설정은 동기 실행을 강제하는 데 사용됩니다.

기존 130개의 영국 카운티에 대해 avg(price) 집계 값을 점진적으로 미리 계산하는 추가 (숨겨진) 테이블 `prj_gby_county`를 생성하고 채웁니다:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_gby_county)
SETTINGS mutations_sync = 1
```

:::note
프로젝션에서 `GROUP BY` 절을 사용하는 경우, 즉 `prj_gby_county` 프로젝션에서 하위 테이블의 스토리지 엔진이 `AggregatingMergeTree`로 변경되며, 모든 집계 함수는 `AggregateFunction`으로 변환됩니다. 이것은 적절한 점진적 데이터 집계를 보장합니다.
:::

아래 그림은 메인 테이블 `uk_price_paid_with_projections`와 그 두 프로젝션의 시각화입니다:

<Image img={projections_2} size="md" alt="메인 테이블 uk_price_paid_with_projections 및 두 프로젝션의 시각화"/>

이제 런던에서 세 가지 가장 높은 가격이 지불된 카운티를 나열하는 쿼리를 다시 실행하면 쿼리 성능이 향상된 것을 볼 수 있습니다:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

마찬가지로, 세 가지 평균 지불 가격이 가장 높은 영국 카운티를 나열하는 쿼리에 대해서도:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

두 쿼리 모두 원래 테이블을 대상으로 하며, 테이블을 생성하기 전에는 두 쿼리 모두 전체 테이블 스캔을 수행했다는 점에 주목하세요 (모든 30.03백만 행이 디스크에서 스트리밍되었습니다).

또한, 런던에서 가장 높은 가격이 지불된 카운티를 나열하는 쿼리가 2.17백만 행을 스트리밍하고 있다는 점을 언급해야 합니다. 이 쿼리 최적화를 위해 직접 사용한 두 번째 테이블로 인해서 오직 81.92천 행만이 디스크에서 스트리밍되었습니다.

그 차이의 이유는 현재 위에서 언급한 `optimize_read_in_order` 최적화가 프로젝션에 대해 지원되지 않기 때문입니다.

`system.query_log` 테이블을 조사하여 ClickHouse가 위의 두 쿼리에 대해 두 개의 프로젝션을 자동으로 사용했음을 확인할 수 있습니다 (아래의 프로젝션 열을 참조하세요):

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' ms' AS query_duration,
        formatReadableQuantity(read_rows) AS read_rows,
  projections
FROM clusterAllReplicas(default, system.query_log)
WHERE (type = 'QueryFinish') AND (tables = ['default.uk_price_paid_with_projections'])
ORDER BY initial_query_start_time DESC
  LIMIT 2
FORMAT Vertical
```

```response
Row 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 ms
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

Row 2:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
query_duration: 11 ms
read_rows:      2.29 million
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2 rows in set. Elapsed: 0.006 sec.
```

### 추가 예제 {#further-examples}

다음 예제는 동일한 영국 가격 데이터 세트를 사용하여 프로젝션이 있는 쿼리와 프로젝션이 없는 쿼리를 대조합니다.

원래 테이블(및 성능)을 보존하기 위해 이전과 같이 `CREATE AS` 및 `INSERT INTO SELECT`를 사용하여 테이블의 복사본을 다시 생성합니다.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### 프로젝션 생성 {#build-projection}

`toYear(date)`, `district`, `town` 치수를 기준으로 집계 프로젝션을 만듭니다:

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

기존 데이터에 대해 프로젝션을 채웁니다. (물리화하지 않으면 프로젝션은 새로 삽입된 데이터에 대해서만 생성됩니다):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

다음 쿼리는 프로젝션이 있는 경우와 없는 경우의 성능을 대조합니다. 프로젝션 사용을 비활성화하려면 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections) 설정을 사용하여 기본적으로 활성화되어 있습니다.

#### 쿼리 1. 연도별 평균 가격 {#average-price-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC

```
결과는 동일해야 하지만, 후자의 예제에서 성능이 더 좋습니다!

#### 쿼리 2. 런던의 연도별 평균 가격 {#average-price-london-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

#### 쿼리 3. 가장 비싼 동네 {#most-expensive-neighborhoods-projections}

조건 (date >= '2020-01-01')을 프로젝션 차원 (`toYear(date) >= 2020`)에 맞도록 수정해야 합니다:

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

다시 한번 결과는 동일하지만, 두 번째 쿼리의 쿼리 성능 개선에 유의하세요.

### 하나의 쿼리에서 프로젝션 결합 {#combining-projections}

버전 25.6부터, 이전 버전에서 도입된 `_part_offset` 지원을 기반으로 ClickHouse는 이제 여러 프로젝션을 사용하여 여러 필터를 가진 단일 쿼리를 가속화할 수 있습니다.

중요하게도, ClickHouse는 여전히 데이터는 단 하나의 프로젝션(또는 기본 테이블)에서만 읽지만, 불필요한 파트를 읽기 전에 다른 프로젝션의 기본 인덱스를 사용하여 억제할 수 있습니다. 이는 여러 열에 대해 필터링되는 쿼리에서 특히 유용하며, 각 열이 서로 다른 프로젝션과 잠재적으로 일치할 수 있습니다.

> 현재 이 메커니즘은 전체 파트만 억제합니다. 그라뉼 수준의 억제는 아직 지원되지 않습니다.

이것을 demonstration하기 위해, 우리는 테이블 (프로젝션을 사용하는 `_part_offset` 열 포함)을 정의하고 위의 다이어그램에 맞는 다섯 개의 예제 행을 삽입합니다.

```sql
CREATE TABLE page_views
(
    id UInt64,
    event_date Date,
    user_id UInt32,
    url String,
    region String,
    PROJECTION region_proj
    (
        SELECT _part_offset ORDER BY region
    ),
    PROJECTION user_id_proj
    (
        SELECT _part_offset ORDER BY user_id
    )
)
ENGINE = MergeTree
ORDER BY (event_date, id)
SETTINGS
  index_granularity = 1, -- one row per granule
  max_bytes_to_merge_at_max_space_in_pool = 1; -- disable merge
```

그런 다음 테이블에 데이터를 삽입합니다:

```sql
INSERT INTO page_views VALUES (
1, '2025-07-01', 101, 'https://example.com/page1', 'europe');
INSERT INTO page_views VALUES (
2, '2025-07-01', 102, 'https://example.com/page2', 'us_west');
INSERT INTO page_views VALUES (
3, '2025-07-02', 106, 'https://example.com/page3', 'us_west');
INSERT INTO page_views VALUES (
4, '2025-07-02', 107, 'https://example.com/page4', 'us_west');
INSERT INTO page_views VALUES (
5, '2025-07-03', 104, 'https://example.com/page5', 'asia');
```

:::note
참고: 이 테이블은 설명을 위해 사용자 정의 설정을 사용하며, 레코드 단위의 그라뉼 및 파트 병합이 비활성화되어 있습니다. 이는 프로덕션 사용에 권장되지 않습니다.
:::

이 설정은 다음과 같은 결과를 생성합니다:
- 다섯 개의 개별 파트 (삽입된 행당 하나씩)
- 각 행당 하나의 기본 인덱스 항목 (기본 테이블 및 각 프로젝션)
- 각 파트는 정확히 하나의 행을 포함합니다.

이 설정으로 우리는 `region`과 `user_id` 모두에 대한 필터링 쿼리를 실행합니다. 기본 테이블의 기본 인덱스가 `event_date` 및 `id`에서 구축되기 때문에 여기에서는 유용하지 않으며, ClickHouse는 따라서 다음을 사용합니다:

- `region_proj`를 사용하여 지역별로 파트를 억제합니다.
- `user_id_proj`를 사용하여 `user_id`로 추가 억제를 실시합니다.

이러한 동작은 `EXPLAIN projections = 1`을 사용하여 ClickHouse가 프로젝션을 선택하고 적용하는 방법을 보여줍니다.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```

```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Projections:                                                                       │
 5. │       Name: region_proj                                                                │
 6. │         Description: Projection has been analyzed and is used for part-level filtering │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         Search Algorithm: binary search                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         Filtered Parts: 2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         Description: Projection has been analyzed and is used for part-level filtering │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         Search Algorithm: binary search                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         Filtered Parts: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

`EXPLAIN` 출력(위에 표시됨)은 논리적 쿼리 계획을 위에서 아래로 보여줍니다:

| 행 번호 | 설명                                                                                              |
|----------|---------------------------------------------------------------------------------------------------|
| 3        | `page_views` 기본 테이블에서 읽을 계획                                                                   |
| 5-13     | `region_proj`를 사용하여 지역 = 'us_west'인 3개의 파트를 찾아 5개의 파트 중 2개를 억제합니다         |
| 14-22    | `user_id_proj`를 사용하여 `user_id = 107`인 1개의 파트를 찾아 3개의 남은 파트 중 2개를 추가로 억제합니다 |

결국, 기본 테이블에서 **5개 중 1개 파트**만 읽힙니다. 여러 프로젝션의 인덱스 분석을 결합하여 ClickHouse는 스캔되는 데이터 양을 크게 줄이고 성능을 개선하면서 저장소 오버헤드를 낮춥니다.

## 관련 콘텐츠 {#related-content}
- [ClickHouse의 기본 인덱스에 대한 실용적인 소개](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [물리화된 뷰](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
