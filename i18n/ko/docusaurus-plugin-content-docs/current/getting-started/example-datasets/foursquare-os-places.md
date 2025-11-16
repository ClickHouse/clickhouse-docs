---
'description': '지도에 있는 장소에 대한 정보를 포함하는 1억 개 이상의 기록이 포함된 데이터셋으로, 상점, 식당, 공원, 놀이터 및
  기념물이 포함됩니다.'
'sidebar_label': 'Foursquare 장소'
'slug': '/getting-started/example-datasets/foursquare-places'
'title': 'Foursquare 장소'
'keywords':
- 'visualizing'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## Dataset {#dataset}

이 데이터셋은 Foursquare에서 제공하며 [다운로드](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)할 수 있으며 Apache 2.0 라이선스 하에 무료로 사용할 수 있습니다.

이 데이터셋은 상업적 관심 지점(POI)에 대한 1억 개 이상의 레코드를 포함하고 있으며, 상점, 레스토랑, 공원, 놀이터, 기념물과 같은 항목들이 포함되어 있습니다. 또한 해당 장소에 대한 추가 메타데이터, 예를 들어 카테고리 및 소셜 미디어 정보도 포함되어 있습니다.

## Data exploration {#data-exploration}

데이터 탐색을 위해 [`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)를 사용합니다. 이는 전체 ClickHouse 엔진을 제공하는 작은 명령줄 도구이지만 ClickHouse Cloud, `clickhouse-client` 또는 `chDB`를 사용할 수도 있습니다.

데이터가 저장된 s3 버킷에서 데이터를 선택하기 위해 다음 쿼리를 실행합니다:

```sql title="Query"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*') LIMIT 1
```

```response title="Response"
Row 1:
──────
fsq_place_id:        4e1ef76cae60cd553dec233f
name:                @VirginAmerica In-flight Via @Gogo
latitude:            37.62120111687914
longitude:           -122.39003793803701
address:             ᴺᵁᴸᴸ
locality:            ᴺᵁᴸᴸ
region:              ᴺᵁᴸᴸ
postcode:            ᴺᵁᴸᴸ
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             US
date_created:        2011-07-14
date_refreshed:      2018-07-05
date_closed:         2018-07-05
tel:                 ᴺᵁᴸᴸ
website:             ᴺᵁᴸᴸ
email:               ᴺᵁᴸᴸ
facebook_id:         ᴺᵁᴸᴸ
instagram:           ᴺᵁᴸᴸ
twitter:             ᴺᵁᴸᴸ
fsq_category_ids:    ['4bf58dd8d48988d1f7931735']
fsq_category_labels: ['Travel and Transportation > Transport Hub > Airport > Plane']
placemaker_url:      https://foursquare.com/placemakers/review-place/4e1ef76cae60cd553dec233f
geom:                �^��a�^@Bσ���
bbox:                (-122.39003793803701,37.62120111687914,-122.39003793803701,37.62120111687914)
```

여러 필드에 `ᴺᵁᴸᴸ` 값이 있는 것을 볼 수 있으므로, 쿼리에 추가 조건을 추가하여 더 사용 가능한 데이터를 반환받습니다:

```sql title="Query"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
   WHERE address IS NOT NULL AND postcode IS NOT NULL AND instagram IS NOT NULL LIMIT 1
```

```response
Row 1:
──────
fsq_place_id:        59b2c754b54618784f259654
name:                Villa 722
latitude:            ᴺᵁᴸᴸ
longitude:           ᴺᵁᴸᴸ
address:             Gijzenveldstraat 75
locality:            Zutendaal
region:              Limburg
postcode:            3690
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             ᴺᵁᴸᴸ
date_created:        2017-09-08
date_refreshed:      2020-01-25
date_closed:         ᴺᵁᴸᴸ
tel:                 ᴺᵁᴸᴸ
website:             https://www.landal.be
email:               ᴺᵁᴸᴸ
facebook_id:         522698844570949 -- 522.70 trillion
instagram:           landalmooizutendaal
twitter:             landalzdl
fsq_category_ids:    ['56aa371be4b08b9a8d5734e1']
fsq_category_labels: ['Travel and Transportation > Lodging > Vacation Rental']
placemaker_url:      https://foursquare.com/placemakers/review-place/59b2c754b54618784f259654
geom:                ᴺᵁᴸᴸ
bbox:                (NULL,NULL,NULL,NULL)
```

자동으로 추론된 데이터 스키마를 `DESCRIBE`를 사용하여 보기 위해 다음 쿼리를 실행합니다:

```sql title="Query"
DESCRIBE s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

```response title="Response"
    ┌─name────────────────┬─type────────────────────────┬
 1. │ fsq_place_id        │ Nullable(String)            │
 2. │ name                │ Nullable(String)            │
 3. │ latitude            │ Nullable(Float64)           │
 4. │ longitude           │ Nullable(Float64)           │
 5. │ address             │ Nullable(String)            │
 6. │ locality            │ Nullable(String)            │
 7. │ region              │ Nullable(String)            │
 8. │ postcode            │ Nullable(String)            │
 9. │ admin_region        │ Nullable(String)            │
10. │ post_town           │ Nullable(String)            │
11. │ po_box              │ Nullable(String)            │
12. │ country             │ Nullable(String)            │
13. │ date_created        │ Nullable(String)            │
14. │ date_refreshed      │ Nullable(String)            │
15. │ date_closed         │ Nullable(String)            │
16. │ tel                 │ Nullable(String)            │
17. │ website             │ Nullable(String)            │
18. │ email               │ Nullable(String)            │
19. │ facebook_id         │ Nullable(Int64)             │
20. │ instagram           │ Nullable(String)            │
21. │ twitter             │ Nullable(String)            │
22. │ fsq_category_ids    │ Array(Nullable(String))     │
23. │ fsq_category_labels │ Array(Nullable(String))     │
24. │ placemaker_url      │ Nullable(String)            │
25. │ geom                │ Nullable(String)            │
26. │ bbox                │ Tuple(                     ↴│
    │                     │↳    xmin Nullable(Float64),↴│
    │                     │↳    ymin Nullable(Float64),↴│
    │                     │↳    xmax Nullable(Float64),↴│
    │                     │↳    ymax Nullable(Float64)) │
    └─────────────────────┴─────────────────────────────┘
```

## Loading the data into ClickHouse {#loading-the-data}

디스크에 데이터를 저장하려면 `clickhouse-server` 또는 ClickHouse Cloud를 사용할 수 있습니다.

테이블을 생성하려면 다음 명령을 실행합니다:

```sql title="Query"
CREATE TABLE foursquare_mercator
(
    fsq_place_id String,
    name String,
    latitude Float64,
    longitude Float64,
    address String,
    locality String,
    region LowCardinality(String),
    postcode LowCardinality(String),
    admin_region LowCardinality(String),
    post_town LowCardinality(String),
    po_box LowCardinality(String),
    country LowCardinality(String),
    date_created Nullable(Date),
    date_refreshed Nullable(Date),
    date_closed Nullable(Date),
    tel String,
    website String,
    email String,
    facebook_id String,
    instagram String,
    twitter String,
    fsq_category_ids Array(String),
    fsq_category_labels Array(String),
    placemaker_url String,
    geom String,
    bbox Tuple(
        xmin Nullable(Float64),
        ymin Nullable(Float64),
        xmax Nullable(Float64),
        ymax Nullable(Float64)
    ),
    category LowCardinality(String) ALIAS fsq_category_labels[1],
    mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
    mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
    INDEX idx_x mercator_x TYPE minmax,
    INDEX idx_y mercator_y TYPE minmax
)
ORDER BY mortonEncode(mercator_x, mercator_y)
```

여러 컬럼에 대해 [`LowCardinality`](/sql-reference/data-types/lowcardinality) 데이터 타입을 사용한다는 점에 유의하십시오. 이 데이터 타입은 데이터의 내부 표현을 딕셔너리 인코딩으로 변경합니다. 딕셔너리 인코딩된 데이터로 작업하면 많은 응용 프로그램에 대해 `SELECT` 쿼리의 성능이 크게 향상됩니다.

또한 `mercator_x`와 `mercator_y`라는 두 개의 `UInt32` `MATERIALIZED` 컬럼이 생성되어, 위도/경도 좌표를 [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)으로 매핑하여 지도를 타일로 쉽게 세분화할 수 있습니다:

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

위에서 각 컬럼에 대해 일어나는 일을 나누어 보겠습니다.

**mercator_x**

이 컬럼은 경도 값을 머카토르 투영의 X 좌표로 변환합니다:

- `longitude + 180`은 경도 범위를 [-180, 180]에서 [0, 360]으로 이동시킵니다.
- 360으로 나누어 이 값을 0과 1 사이의 값으로 정규화합니다.
- `0xFFFFFFFF` (최대 32비트 부호 없는 정수의 16진수)를 곱하여 이 정규화된 값을 32비트 정수의 전체 범위로 확장합니다.

**mercator_y**

이 컬럼은 위도 값을 머카토르 투영의 Y 좌표로 변환합니다:

- `latitude + 90`은 위도를 [-90, 90]에서 [0, 180]으로 이동시킵니다.
- 360으로 나누고 pi()와 곱하여 삼각 함수에 대한 라디안으로 변환합니다.
- `log(tan(...))` 부분은 머카토르 투영 공식의 핵심입니다.
- `0xFFFFFFFF`와 곱하여 전체 32비트 정수 범위로 확장합니다.

`MATERIALIZED`를 지정하면 ClickHouse가 `INSERT` 시 데이터 컬럼에 대한 값을 계산하도록 보장합니다. (이 컬럼들은 원래 데이터 스키마의 일부가 아닙니다.)

테이블은 `mortonEncode(mercator_x, mercator_y)`에 따라 정렬되며, 이는 `mercator_x`, `mercator_y`의 Z-순서 공간 채우기 곡선을 생성하여 지리 공간 쿼리 성능을 크게 개선합니다. 이 Z-순서 곡선 정렬은 데이터가 공간적 근접성에 따라 물리적으로 조직되도록 보장합니다:

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

더 빠른 검색을 위한 두 개의 `minmax` 인덱스도 생성됩니다:

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

보시다시피 ClickHouse는 실시간 매핑 응용 프로그램에 필요한 모든 것을 갖추고 있습니다!

데이터를 로드하기 위해 다음 쿼리를 실행합니다:

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## Visualizing the data {#data-visualization}

이 데이터셋으로 무엇이 가능한지 보려면 [adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219)를 확인해 보세요. adsb.exposed는 공동 창립자이자 CTO인 Alexey Milovidov가 ADS-B (Automatic Dependent Surveillance-Broadcast) 비행 데이터를 시각화하기 위해 처음 구축하였으며, 이는 1000배 더 큰 데이터입니다. 회사 해커톤 중에 Alexey는 도구에 Foursquare 데이터를 추가했습니다.

아래에는 여러분이 즐길 수 있도록 제작된 몇 가지 저희의 좋아하는 시각화를 보여 드립니다.

<Image img={visualization_1} size="md" alt="유럽의 관심 지점 밀집 지도"/>

<Image img={visualization_2} size="md" alt="일본의 사케 바"/>

<Image img={visualization_3} size="md" alt="ATM"/>

<Image img={visualization_4} size="md" alt="국가별로 분류된 유럽의 관심 지점 지도"/>
