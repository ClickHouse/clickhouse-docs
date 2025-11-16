import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse 테이블은 **MergeTree 엔진**을 사용하여 데이터를 **변경 불가능한 파트**로 디스크에 저장하며, 데이터가 삽입될 때마다 생성됩니다.

각 삽입은 정렬되고 압축된 컬럼 파일을 포함하는 새로운 파트를 생성하며, 인덱스 및 체크섬과 같은 메타데이터도 포함됩니다. 파트 구조와 형성 방법에 대한 자세한 설명은 이 [가이드](/parts)를 권장합니다.

시간이 지남에 따라 백그라운드 프로세스는 더 큰 파트로 더 작은 파트를 병합하여 조각화를 줄이고 쿼리 성능을 향상시킵니다.

<Image img={simple_merges} size="md" alt="Simple merges" />

다음과 같이 수동으로 이 병합을 트리거하고 싶을 수 있지만:

```sql
OPTIMIZE TABLE <table> FINAL;
```

**대부분의 경우 `OPTIMIZE FINAL` 작업을 피해야 합니다**. 이는 자원 집약적인 작업을 시작하여 클러스터 성능에 영향을 줄 수 있습니다.

:::note OPTIMIZE FINAL vs FINAL
`OPTIMIZE FINAL`은 `FINAL`과 다르며, 때때로 `ReplacingMergeTree`와 같은 중복 없이 결과를 얻기 위해 사용해야 할 필요가 있습니다. 일반적으로, `FINAL`은 기본 키와 동일한 컬럼에 필터링하는 쿼리의 경우 사용할 수 있습니다.
:::

## 왜 피해야 하는가?  {#why-avoid}

### 비용이 많이 듭니다 {#its-expensive}

`OPTIMIZE FINAL`을 실행하면 ClickHouse가 **모든** 활성 파트를 **단일 파트**로 병합하도록 강제합니다. 이는 이미 큰 병합이 발생했더라도 마찬가지입니다. 다음과 같은 작업을 포함합니다:

1. **모든 파트 압축 해제**
2. **데이터 병합**
3. **다시 압축**
4. **최종 파트를 디스크 또는 객체 저장소에 기록**

이 단계는 **CPU 및 I/O 집약적**이며, 특히 대량의 데이터셋이 관련된 경우 시스템에 상당한 부담을 줄 수 있습니다.

### 안전 한계를 무시합니다 {#it-ignores-safety-limits}

일반적으로 ClickHouse는 ~150 GB( [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 를 통해 구성 가능)의 파트병합을 피합니다. 하지만 `OPTIMIZE FINAL`은 **이 안전 장치를 무시**하며, 이는 다음을 의미합니다:

* **복수의 150 GB 파트**를 하나의 거대한 파트로 병합하려 할 수 있습니다.
* 이로 인해 **긴 병합 시간**, **메모리 압박**, 또는 **메모리 부족 오류**가 발생할 수 있습니다.
* 이러한 대형 파트는 병합하기 어려워질 수 있으며, 위에서 언급한 이유로 그들을 추가로 병합하려는 시도가 실패할 수 있습니다. 쿼리 시간 동작에 대한 정확한 병합이 필요한 경우, 이는 [ReplacingMergeTree](/guides/developer/deduplication#using-replacingmergetree-for-upserts)에서 중복이 축적되는 등의 원치 않는 결과를 초래할 수 있으며, 쿼리 시간 성능을 저하시킬 수 있습니다.

## 백그라운드 병합이 작업을 수행하게 하세요 {#let-background-merges-do-the-work}

ClickHouse는 이미 저장소 및 쿼리 효율성을 최적화하기 위해 스마트한 백그라운드 병합을 수행합니다. 이러한 병합은 점진적이며 자원 인식적이며 구성된 임계값을 Respect합니다. 특정한 필요가 있는 경우(예: 테이블을 동결하기 전에 데이터 마감 또는 내보내기), **ClickHouse가 스스로 병합을 관리하게 하는 것이 더 낫습니다**.
