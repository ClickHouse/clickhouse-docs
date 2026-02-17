---
description: '서버 구성에서 정의된 스토리지 정책과 볼륨에 대한 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage_policies \{#systemstorage_policies\}

[서버 설정](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)에 정의된 스토리지 정책 및 볼륨에 대한 정보를 포함합니다.

컬럼:

* `policy_name` ([String](../../sql-reference/data-types/string.md)) — 스토리지 정책 이름.
* `volume_name` ([String](../../sql-reference/data-types/string.md)) — 스토리지 정책에 정의된 볼륨 이름.
* `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 설정에서의 볼륨 순서 번호입니다. 데이터는 이 우선순위에 따라 볼륨에 채워집니다. 즉, INSERT 및 merge 작업 시 다른 규칙(TTL, `max_data_part_size`, `move_factor`)을 고려하여 더 낮은 우선순위를 가진 볼륨에 데이터가 기록됩니다.
* `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — 스토리지 정책에 정의된 디스크 이름.
* `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — 볼륨 유형입니다. 다음 값 중 하나를 가질 수 있습니다:
  * `JBOD`
  * `SINGLE_DISK`
  * `UNKNOWN`
* `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 볼륨 디스크에 저장할 수 있는 데이터 파트의 최대 크기(0 — 제한 없음).
* `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 남은 디스크 공간 비율입니다. 이 비율이 구성 파라미터의 값을 초과하면 ClickHouse는 순서상 다음 볼륨으로 데이터를 이동하기 시작합니다.
* `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 설정의 값입니다. 항상 false여야 합니다. 이 설정이 활성화되어 있다면 잘못 설정한 것입니다.
* `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 설정의 값입니다. — 데이터 파트 INSERT 시 TTL move를 비활성화합니다. 기본적으로 TTL move 규칙에 따라 이미 만료된 데이터 파트를 INSERT하는 경우, 해당 파트는 즉시 move 규칙에 지정된 볼륨/디스크로 이동합니다. 대상 볼륨/디스크가 느린 경우(예: S3) INSERT가 크게 느려질 수 있습니다.
* `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — 디스크 로드 밸런싱 정책입니다. 다음 값 중 하나를 가질 수 있습니다:
  * `ROUND_ROBIN`
  * `LEAST_USED`

스토리지 정책에 2개 이상의 볼륨이 포함되어 있으면, 각 볼륨에 대한 정보는 테이블의 개별 행에 저장됩니다.