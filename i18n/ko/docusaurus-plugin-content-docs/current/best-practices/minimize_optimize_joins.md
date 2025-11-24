---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': 'JOIN을 최소화하고 최적화하기'
'title': 'JOIN을 최소화하고 최적화하기'
'description': 'JOIN에 대한 모범 사례를 설명하는 페이지'
'keywords':
- 'JOIN'
- 'Parallel Hash JOIN'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse는 다양한 JOIN 유형과 알고리즘을 지원하며, 최근 릴리스에서는 JOIN 성능이 크게 향상되었습니다. 그러나 JOIN은 본질적으로 단일 비정규화 테이블에서 쿼리하는 것보다 비용이 더 비쌉니다. 비정규화는 쿼리 시간 대신 삽입 또는 전처리 시간으로 계산 작업을 이동시켜 런타임에서 상당히 낮은 대기 시간을 발생시킵니다. 실시간 또는 지연에 민감한 분석 쿼리의 경우, **비정규화가 강력히 권장됩니다**.

일반적으로 비정규화가 필요할 때는 다음과 같습니다:

- 테이블이 드물게 변경되거나 배치 갱신이 허용되는 경우.
- 관계가 다대다 관계가 아니거나 과도한 카디널성을 가지지 않는 경우.
- 쿼리할 컬럼의 하위 집합만 필요한 경우, 즉 특정 컬럼은 비정규화에서 제외할 수 있는 경우.
- 실시간 풍부화 또는 평탄화가 관리될 수 있는 Flink와 같은 업스트림 시스템으로 처리를 이동할 수 있는 능력이 있는 경우.

모든 데이터가 비정규화될 필요는 없으며, 자주 쿼리되는 속성에 집중해야 합니다. 또한 전체 서브 테이블을 복제하는 대신 점진적으로 집계를 계산하기 위해 [물리화된 뷰](/best-practices/use-materialized-views)를 고려하십시오. 스키마 업데이트가 드물고 대기 시간이 중요한 경우, 비정규화가 최고의 성능 트레이드 오프를 제공합니다.

ClickHouse에서 데이터 비정규화에 대한 전체 가이드는 [여기](/data-modeling/denormalization)를 참조하십시오.

## JOIN이 필요한 경우 {#when-joins-are-required}

JOIN이 필요한 경우, **최소 24.12 버전을 사용하고 가능하면 최신 버전을 사용**하고 있는지 확인하세요. 각 새로운 릴리스마다 JOIN 성능이 개선되고 있습니다. ClickHouse 24.12부터는 쿼리 계획자가 자동으로 더 작은 테이블을 조인의 오른쪽에 배치하여 최적의 성능을 보장합니다 — 이는 이전에는 수동으로 수행해야 했던 작업입니다. 더 공격적인 필터 푸시다운 및 다중 조인의 자동 재배치와 같은 더욱 향상된 기능이 곧 포함될 예정입니다.

JOIN 성능을 개선하기 위한 모범 사례를 따르십시오:

* **카르테시안 곱을 피하십시오**: 왼쪽 측의 값이 오른쪽 측의 여러 값과 일치하는 경우, JOIN은 여러 행을 반환합니다 — 소위 카르테시안 곱입니다. 사용 사례에서 오른쪽 측의 모든 일치를 필요로 하지 않고 단일 일치만 필요한 경우 `ANY` JOIN(예: `LEFT ANY JOIN`)을 사용할 수 있습니다. 이들은 일반 JOIN보다 더 빠르고 메모리를 적게 사용합니다.
* **JOIN된 테이블의 크기를 줄이십시오**: JOIN의 실행 시간과 메모리 소비는 왼쪽 및 오른쪽 테이블의 크기에 비례하여 증가합니다. JOIN에서 처리되는 데이터의 양을 줄이기 위해 쿼리의 `WHERE` 또는 `JOIN ON` 절에 추가 필터 조건을 추가하십시오. ClickHouse는 필터 조건을 쿼리 계획에서 가능한 한 깊게 푸시합니다. 필터가 자동으로 푸시되지 않는 경우(JOIN의 한쪽을 서브 쿼리로 재작성하여 푸시를 강제해야 함) 이 방법을 사용하십시오.
* **필요한 경우 딕셔너리를 통한 직접 JOIN을 사용하십시오**: ClickHouse의 표준 JOIN은 두 단계로 실행됩니다: 해시 테이블을 구축하기 위해 오른쪽 측을 반복하는 빌드 단계와 해시 테이블 조회를 통해 일치하는 JOIN 파트너를 찾기 위해 왼쪽 측을 반복하는 프로브 단계입니다. 오른쪽 측이 [딕셔너리](/dictionary) 또는 키-값 특성이 있는 다른 테이블 엔진(예: [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 또는 [JOIN 테이블 엔진](/engines/table-engines/special/join))인 경우, ClickHouse는 해시 테이블 구축이 필요 없는 "직접" JOIN 알고리즘을 사용할 수 있어 쿼리 처리 속도를 높입니다. 이 알고리즘은 `INNER` 및 `LEFT OUTER` JOIN에 대해 작동하며 실시간 분석 워크로드에 적합합니다.
* **JOIN을 위한 테이블 정렬 활용하기**: ClickHouse의 각 테이블은 테이블의 기본 키 컬럼에 따라 정렬됩니다. `full_sorting_merge` 및 `partial_merge`와 같은 소위 정렬-병합 JOIN 알고리즘을 사용하여 테이블의 정렬을 활용할 수 있습니다. 해시 테이블 기반의 표준 JOIN 알고리즘(아래 `parallel_hash`, `hash`, `grace_hash` 참조)과 달리, 정렬-병합 JOIN 알고리즘은 먼저 정렬하고 두 테이블을 병합합니다. 쿼리가 각 테이블의 기본 키 컬럼으로 JOIN되면, 정렬 단계가 생략되는 최적화가 있어 처리 시간과 오버헤드를 절약할 수 있습니다.
* **디스크 스필 JOIN을 피하십시오**: JOIN의 중간 상태(예: 해시 테이블)가 너무 커져서 메인 메모리에 더 이상 맞지 않게 됩니다. 이 경우, ClickHouse는 기본적으로 메모리 부족 오류를 반환합니다. 일부 JOIN 알고리즘(아래 참조) 예: [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2), [`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 및 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)는 중간 상태를 디스크로 스필하고 쿼리 실행을 계속할 수 있습니다. 그러나 디스크 접근이 JOIN 처리 속도를 크게 저하시킬 수 있으므로 이러한 JOIN 알고리즘은 신중하게 사용해야 합니다. 대신 중간 상태의 크기를 줄이기 위해 JOIN 쿼리를 다른 방법으로 최적화하는 것이 좋습니다.
* **외부 JOIN에서의 기본값을 비 일치 마커로 사용**: 왼쪽/오른쪽/전체 외부 JOIN은 왼쪽/오른쪽/두 테이블의 모든 값을 포함합니다. 다른 테이블에서 어떤 값의 JOIN 파트너가 발견되지 않으면 ClickHouse는 JOIN 파트너를 특별한 마커로 대체합니다. SQL 표준에서는 데이터베이스가 NULL을 이러한 마커로 사용하도록 규정하고 있습니다. ClickHouse에서 이를 위해서는 결과 컬럼을 Nullable로 래핑해야 하며, 추가적인 메모리와 성능 오버헤드가 발생합니다. 대안으로, 설정 `join_use_nulls = 0`을 구성하고 결과 컬럼 데이터 타입의 기본값을 마커로 사용할 수 있습니다.

:::note 딕셔너리를 신중하게 사용하세요
ClickHouse에서 JOIN을 위해 딕셔너리를 사용할 때, 설계상 딕셔너리가 중복 키를 허용하지 않음을 이해하는 것이 중요합니다. 데이터 로딩 중에 모든 중복 키는 조용히 제거되며 — 주어진 키에 대한 마지막 로드된 값만 유지됩니다. 이러한 동작은 딕셔너리를 일대일 또는 다대일 관계에 이상적으로 만듭니다. 그런데 하나의 키가 여러 번 일치하는 다대다 관계(예: 하나의 배우가 여러 역할을 가질 수 있는 경우)에 대한 JOIN에 딕셔너리를 사용할 경우, 모든 일치하는 행 중 하나를 제외한 나머지 행이 삭제되면서 데이터 손실이 발생하게 됩니다. 따라서 딕셔너리는 다수의 일치에서 완전한 관계적 충실도가 필요한 시나리오에는 적합하지 않습니다.
:::

## 올바른 JOIN 알고리즘 선택 {#choosing-the-right-join-algorithm}

ClickHouse는 속도와 메모리 간의 균형을 맞추는 몇 가지 JOIN 알고리즘을 지원합니다:

* **병렬 해시 JOIN (기본값)**: 메모리에 맞는 소형에서 중형의 오른쪽 테이블에 빠릅니다.
* **직접 JOIN**: `INNER` 또는 `LEFT ANY JOIN`에서 딕셔너리(또는 다른 키-값 특성을 가진 테이블 엔진)를 사용하는 경우 이상적입니다 — 해시 테이블을 빌드할 필요가 없어 포인트 조회에 가장 빠른 방법입니다.
* **전체 정렬 병합 JOIN**: 두 테이블이 JOIN 키를 기준으로 정렬된 경우 효율적입니다.
* **부분 병합 JOIN**: 메모리를 최소화하지만 느립니다 — 메모리가 제한된 대형 테이블을 조인할 때 가장 적합합니다.
* **그레이스 해시 JOIN**: 유연하고 메모리 조정 가능, 조정 가능한 성능 특성을 가진 대용량 데이터 세트에 적합합니다.

<Image img={joins} size="md" alt="Joins — speed vs memory"/>

:::note
각 알고리즘은 다양한 JOIN 유형에 대한 지원이 다릅니다. 각 알고리즘의 지원되는 JOIN 유형의 전체 목록은 [여기](/guides/joining-tables#choosing-a-join-algorithm)에서 확인할 수 있습니다.
:::

ClickHouse가 최적의 알고리즘을 선택하게 하려면 `join_algorithm = 'auto'`(기본값)를 설정하거나 워크로드에 따라 명시적으로 제어할 수 있습니다. 성능 또는 메모리 오버헤드를 최적화하기 위해 JOIN 알고리즘을 선택해야 하는 경우, [이 가이드](/guides/joining-tables#choosing-a-join-algorithm)를 추천합니다.

최적의 성능을 위해:

* 고성능 워크로드에서 JOIN을 최소한으로 유지하십시오.
* 쿼리당 3~4개의 JOIN을 초과하지 않도록 하십시오.
* 실제 데이터에서 서로 다른 알고리즘을 벤치마킹하십시오 — 성능은 JOIN 키 분포 및 데이터 크기에 따라 달라집니다.

JOIN 최적화 전략, JOIN 알고리즘 및 조정 방법에 대한 자세한 내용은 [ClickHouse 문서](/guides/joining-tables)와 이 [블로그 시리즈](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)를 참조하십시오.
