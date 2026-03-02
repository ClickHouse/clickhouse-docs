---
slug: /parts
title: '테이블 파트'
description: 'ClickHouse의 데이터 파트란 무엇인지'
keywords: ['파트']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouse에서 테이블 파트는 무엇입니까? \{#what-are-table-parts-in-clickhouse\}

<br />

ClickHouse의 각 MergeTree 계열 테이블의 데이터는 디스크에서 변경 불가능한 `data parts`(데이터 파트) 집합으로 구성됩니다.

이를 설명하기 위해, [MergeTree engine family](/engines/table-engines/mergetree-family)에 속하는 테이블의 데이터가 디스크에 어떻게 구성되는지를 보여주기 위해, 영국에서 판매된 부동산의 거래일, 도시, 거리, 가격을 추적하는 [UK property prices 데이터셋](/getting-started/example-datasets/uk-price-paid)에서 가져온 [이](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU\&run_query=true\&tab=results) 테이블을 사용합니다.

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

우리 ClickHouse SQL Playground에서 [이 테이블을 쿼리](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs\&run_query=true\&tab=results)할 수 있습니다.

테이블에 여러 행이 삽입될 때마다 데이터 파트가 생성됩니다. 다음 다이어그램은 이를 개략적으로 보여 줍니다:

<Image img={part} size="lg" />

<br />

ClickHouse 서버가 위 다이어그램에 나온 것처럼 4개의 행을 가진 예제 INSERT(예: [INSERT INTO 문](/sql-reference/statements/insert-into)을 통해)를 처리할 때, 다음과 같은 여러 단계를 수행합니다:

① **정렬**: 테이블의 ^^sorting key^^ `(town, street)` 기준으로 행을 정렬하고, 정렬된 행에 대해 [희소 기본 키 인덱스(sparse primary index)](/guides/best-practices/sparse-primary-indexes)를 생성합니다.

② **분할**: 정렬된 데이터를 컬럼 단위로 분할합니다.

③ **압축**: 각 컬럼을 [압축](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)합니다.

④ **디스크에 기록**: 압축된 컬럼을 INSERT의 데이터 파트를 나타내는 새 디렉터리 내 바이너리 컬럼 파일로 저장합니다. 희소 기본 키 인덱스도 압축되어 같은 디렉터리에 저장됩니다.

테이블이 사용하는 구체적인 엔진에 따라, 정렬과 함께 추가 변환이 [수행될 수 있습니다](/operations/settings/settings).

데이터 ^^parts^^는 자체 완결적(self-contained)이며, 중앙 카탈로그 없이도 내용을 해석하는 데 필요한 모든 메타데이터를 포함합니다. 희소 기본 키 인덱스 외에도 ^^parts^^에는 보조 [데이터 스키핑 인덱스(data skipping indexes)](/optimize/skipping-indexes), [컬럼 통계](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), 체크섬, ( [파티션(partitioning)](/partitions)을 사용하는 경우) 최소-최대 인덱스, 그리고 [기타 정보](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)가 포함됩니다.


## 파트 병합 \{#part-merges\}

테이블당 ^^parts^^(파트) 개수를 관리하기 위해, [백그라운드 병합](/merges) 작업이 주기적으로 더 작은 ^^parts^^를 더 큰 파트로 병합하여, [설정 가능한](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 압축된 크기(일반적으로 약 150 GB)에 도달할 때까지 진행합니다. 병합된 ^^parts^^는 비활성 상태로 표시되고, [설정 가능한](/operations/settings/merge-tree-settings#old_parts_lifetime) 시간 간격 후에 삭제됩니다. 시간이 지나면서 이 과정은 병합된 ^^parts^^의 계층적 구조를 만들며, 이러한 이유로 이를 ^^MergeTree^^ 테이블이라고 합니다:

<Image img={merges} size="lg" />

<br />

초기 ^^parts^^ 개수와 병합 오버헤드를 최소화하기 위해, 데이터베이스 클라이언트는 예를 들어 한 번에 20,000개의 행을 삽입하는 대량 튜플 삽입 방식을 사용하거나, [비동기 삽입 모드](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)를 사용하도록 [권장됩니다](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance). 비동기 삽입 모드에서는 ClickHouse가 동일한 테이블로 들어오는 여러 INSERT로부터 행을 버퍼링하고, 버퍼 크기가 설정 가능한 임계값을 초과하거나 타임아웃이 만료된 이후에만 새로운 파트를 생성합니다.

## 테이블 파트 모니터링 \{#monitoring-table-parts\}

[가상 컬럼(virtual column)](/engines/table-engines#table_engines-virtual_columns) `_part`를 사용하여 예제 테이블에서 현재 존재하는 모든 활성 ^^파트^^의 목록을 [쿼리](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw\&run_query=true\&tab=results)할 수 있습니다.

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

위 쿼리는 디스크에 있는 디렉터리 이름을 조회하며, 각 디렉터리는 테이블의 활성 데이터 파트를 나타냅니다. 이러한 디렉터리 이름을 구성하는 요소에는 각각 특정 의미가 있으며, 자세한 내용은 더 알아보고자 하는 경우 [여기](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)에 문서화되어 있습니다.

또한 ClickHouse는 모든 테이블의 모든 ^^parts^^에 대한 정보를 [system.parts](/operations/system-tables/parts) 시스템 테이블에 저장하며, 다음 쿼리는 위의 예시 테이블에 대해 현재 활성 상태인 모든 ^^parts^^ 목록과 각 파트의 머지 수준, 그리고 이들 ^^parts^^에 저장된 행 수를 [반환합니다](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7\&run_query=true\&tab=results):

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

머지 레벨은 해당 파트에 머지가 추가로 수행될 때마다 1씩 증가합니다. 레벨이 0이면 아직 한 번도 머지되지 않은 새 파트임을 의미합니다.
