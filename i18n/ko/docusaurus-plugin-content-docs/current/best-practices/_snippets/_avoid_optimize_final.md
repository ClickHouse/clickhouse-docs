import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

**MergeTree 엔진**을 사용하는 ClickHouse 테이블은 데이터를 디스크에 **불변 파트**로 저장하며, 데이터가 삽입될 때마다 새로운 파트가 생성됩니다.

각 insert 작업은 정렬되고 압축된 컬럼 파일과 인덱스, 체크섬과 같은 메타데이터를 포함하는 새로운 파트를 생성합니다. 파트 구조와 생성 방식에 대한 자세한 설명은 이 [가이드](/parts)를 참고하기 바랍니다.

시간이 지나면서 백그라운드 프로세스가 작은 파트를 더 큰 파트로 병합하여 단편화를 줄이고 쿼리 성능을 향상시킵니다.

<Image img={simple_merges} size="md" alt="단순 병합" />

다음 명령으로 이 병합을 수동으로 실행하고 싶은 유혹을 느낄 수 있지만:

```sql
OPTIMIZE TABLE <table> FINAL;
```

**대부분의 경우 `OPTIMIZE FINAL` 연산은 사용을 피하는 것이 좋습니다.** 이 연산은 클러스터 성능에 영향을 줄 수 있는, 리소스를 많이 사용하는 작업을 시작하기 때문입니다.

:::note OPTIMIZE FINAL vs FINAL
`OPTIMIZE FINAL`은 `FINAL`과 동일하지 않습니다. `ReplacingMergeTree`와 같이 중복된 데이터가 없는 결과를 얻기 위해 `FINAL`을 사용해야 하는 경우가 있습니다. 일반적으로, 쿼리가 기본 키에 포함된 컬럼과 동일한 컬럼을 기준으로 필터링하는 경우에는 `FINAL`을 사용해도 괜찮습니다.
:::


## 피해야 하는 이유 \{#why-avoid\}

### 비용이 많이 듭니다 \{#its-expensive\}

`OPTIMIZE FINAL`을 실행하면, 이미 대규모 병합이 수행된 상태라도 ClickHouse가 **모든** 활성 파트를 **단일 파트**로 병합하도록 강제합니다. 이 과정에는 다음 단계가 포함됩니다:

1. 모든 파트를 **압축 해제**합니다
2. 데이터를 **병합**합니다
3. 다시 **압축**합니다
4. 최종 파트를 디스크 또는 객체 스토리지에 **저장**합니다

이 단계는 **CPU 및 I/O 집약적**이며, 특히 대규모 데이터셋이 포함된 경우 시스템에 상당한 부담을 줄 수 있습니다.

### 안전 제한을 무시합니다 \{#it-ignores-safety-limits\}

일반적으로 ClickHouse는 약 150 GB보다 큰 파트는 머지하지 않습니다([max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)로 설정 가능). 하지만 `OPTIMIZE FINAL`은 **이 안전장치를 무시**하므로, 다음과 같은 일이 발생할 수 있습니다:

* **여러 개의 150 GB 파트**를 하나의 매우 큰 파트로 머지하려 시도할 수 있습니다
* 그 결과 **머지 시간이 매우 길어지거나**, **메모리 사용 압박**이 커지며, 심지어 **out-of-memory 오류**가 발생할 수 있습니다
* 이렇게 커진 파트는 이후 머지 작업이 어려워질 수 있으며, 즉 위에서 언급한 이유로 추가 머지 시도가 실패할 수 있습니다. 쿼리가 올바르게 동작하려면 머지가 필요한 경우, 이는 [ReplacingMergeTree에 중복이 누적되는 것](/guides/developer/deduplication#using-replacingmergetree-for-upserts)과 같은 바람직하지 않은 결과를 초래하여 쿼리 시간 성능을 저하시킬 수 있습니다.

## 백그라운드 머지에 맡기기 \{#let-background-merges-do-the-work\}

ClickHouse는 이미 스토리지와 쿼리 효율을 최적화하기 위해 스마트한 백그라운드 머지를 수행합니다. 이러한 머지는 점진적으로 실행되며, 리소스 사용량을 고려하고 구성된 임계값을 준수합니다. 테이블을 동결하거나 내보내기 전에 데이터를 확정해야 하는 것처럼 아주 특수한 필요가 있는 경우가 아니라면, **머지는 ClickHouse가 알아서 관리하도록 두는 편이 좋습니다**.