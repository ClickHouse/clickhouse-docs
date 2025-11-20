---
'slug': '/parts'
'title': '테이블 파트'
'description': 'ClickHouse에서 데이터 파트란 무엇인가'
'keywords':
- 'part'
'doc_type': 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## ClickHouse에서 테이블 파트란 무엇인가? {#what-are-table-parts-in-clickhouse}

<br />

ClickHouse [MergeTree 엔진 패밀리](/engines/table-engines/mergetree-family)의 각 테이블에서 데이터는 불변의 `data parts` 컬렉션으로 디스크에 조직됩니다.

이를 설명하기 위해, 우리는 영국의 판매된 부동산에 대한 날짜, 도시, 거리 및 가격을 추적하는 [이](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) 테이블( [영국 도 property 가격 데이터셋](/getting-started/example-datasets/uk-price-paid)에서 수정됨)을 사용합니다:

```sql
CREATE TABLE uk.uk_price_paid_simple
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```

당신은 우리 ClickHouse SQL Playground에서 [이 테이블을 쿼리할 수 있습니다](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results).

데이터 파트는 테이블에 행 세트를 삽입할 때마다 생성됩니다. 다음 다이어그램은 이를 스케치합니다:

<Image img={part} size="lg" />

<br />

ClickHouse 서버가 위 다이어그램에 스케치된 것처럼 4개의 행을 가진 예제 삽입을 처리할 때, 여러 단계를 수행합니다:

① **정렬**: 행은 테이블의 ^^정렬 키^^ `(town, street)`에 따라 정렬되며, 정렬된 행에 대한 [스파스 기본 인덱스](/guides/best-practices/sparse-primary-indexes)가 생성됩니다.

② ** 분할**: 정렬된 데이터는 컬럼으로 분할됩니다.

③ **압축**: 각 컬럼은 [압축](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)됩니다.

④ **디스크에 쓰기**: 압축된 컬럼은 새로운 디렉토리에 이진 컬럼 파일로 저장됩니다. 이 디렉토리는 삽입의 데이터 파트를 나타냅니다. 스파스 기본 인덱스도 압축되어 동일한 디렉토리에 저장됩니다.

테이블의 특정 엔진에 따라, 정렬과 함께 [추가적인 변환](/operations/settings/settings)이 발생할 수 있습니다.

데이터 ^^parts^^는 독립적으로 포함되어 있으며, 중앙 카탈로그 없이 그 내용을 해석하는 데 필요한 모든 메타데이터를 포함합니다. 스파스 기본 인덱스 외에도, ^^parts^^는 추가 메타데이터를 포함합니다, 예를 들어, [데이터 스킵 인덱스](/optimize/skipping-indexes), [컬럼 통계](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), 체크섬, min-max 인덱스( [파티셔닝](/partitions)을 사용하는 경우) 및 [기타](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).

## 파트 병합 {#part-merges}

테이블당 ^^parts^^ 수를 관리하기 위해, [백그라운드 병합](/merges) 작업이 정기적으로 더 작은 ^^parts^^를 더 큰 것으로 결합하여 [구성 가능한](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 압축 크기(일반적으로 ~150 GB)에 도달할 때까지 지속됩니다. 병합된 ^^parts^^는 비활성으로 표시되고 [구성 가능한](/operations/settings/merge-tree-settings#old_parts_lifetime) 시간 간격 후에 삭제됩니다. 시간이 지남에 따라 이 과정은 병합된 ^^parts^^의 계층 구조를 생성하며, 이것이 ^^MergeTree^^ 테이블이라고 불리는 이유입니다:

<Image img={merges} size="lg" />

<br />

초기 ^^parts^^ 수와 병합의 오버헤드를 최소화하기 위해, 데이터베이스 클라이언트는 [권장됨](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 수의 튜플을 대량으로 삽입하도록, 예를 들어 한 번에 20,000 행으로 또는 [비동기 삽입 모드](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)를 사용하여 ClickHouse가 여러 개의 들어오는 INSERT에서 행을 버퍼링하고 버퍼 크기가 설정 가능한 임계값을 초과하면 새 파트를 만들도록 권장됩니다.

## 테이블 파트 모니터링 {#monitoring-table-parts}

[쿼리할 수 있습니다](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) 현재 존재하는 모든 활성 ^^parts^^의 리스트를 우리의 예제 테이블에서 [가상 컬럼](/engines/table-engines#table_engines-virtual_columns) `_part`를 사용하여:

```sql
SELECT _part
FROM uk.uk_price_paid_simple
GROUP BY _part
ORDER BY _part ASC;

   ┌─_part───────┐
1. │ all_0_5_1   │
2. │ all_12_17_1 │
3. │ all_18_23_1 │
4. │ all_6_11_1  │
   └─────────────┘
```
위 쿼리는 디스크의 디렉토리 이름을 검색하며, 각 디렉토리는 테이블의 활성 데이터 파트를 나타냅니다. 이 디렉토리 이름의 구성 요소는 특정 의미를 가지며, 더 탐구하고 싶은 분들을 위해 [여기](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) 문서화되어 있습니다.

또한, ClickHouse는 [system.parts](/operations/system-tables/parts) 시스템 테이블의 모든 테이블의 모든 ^^parts^^에 대한 정보를 추적하며, 다음 쿼리는 [반환합니다](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 우리의 예제 테이블에 대한 모든 현재 활성 ^^parts^^, 병합 수준 및 이러한 ^^parts^^에 저장된 행 수의 리스트:

```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;

   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```
병합 수준은 파트에 대한 추가 병합이 있을 때마다 1씩 증가합니다. 레벨 0은 병합되지 않은 새 파트임을 나타냅니다.
