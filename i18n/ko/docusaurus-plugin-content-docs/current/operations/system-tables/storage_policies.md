---
'description': '서버 구성에서 정의된 저장 정책 및 볼륨에 대한 정보를 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'storage_policies'
'slug': '/operations/system-tables/storage_policies'
'title': 'system.storage_policies'
'doc_type': 'reference'
---


# system.storage_policies

저장 정책 및 [서버 구성](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)에서 정의된 볼륨에 대한 정보를 포함합니다.

열:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — 저장 정책의 이름.
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — 저장 정책에서 정의된 볼륨 이름.
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 구성에서의 볼륨 순서 번호. 데이터는 이 우선순위에 따라 볼륨에 채워지며, 즉 삽입 및 병합 시 데이터는 더 낮은 우선순위의 볼륨에 기록됩니다 (기타 규칙: TTL, `max_data_part_size`, `move_factor`를 고려).
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — 저장 정책에서 정의된 디스크 이름.
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 볼륨의 유형. 다음 값 중 하나일 수 있습니다:
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 볼륨 디스크에 저장할 수 있는 데이터 파트의 최대 크기 (0 — 제한 없음).
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 여유 디스크 공간의 비율. 이 비율이 구성 매개변수의 값을 초과할 때 ClickHouse는 순서에 따라 다음 볼륨으로 데이터를 이동하기 시작합니다.
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 설정의 값. 항상 false여야 합니다. 이 설정이 활성화되면 실수가 발생한 것입니다.
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 설정의 값. — 데이터 파트 INSERT 시 TTL 이동을 비활성화합니다. 기본적으로 TTL 이동 규칙에 의해 이미 만료된 데이터 파트를 삽입하면 즉시 이동 규칙에 선언된 볼륨/디스크로 이동합니다. 이는 대상 볼륨/디스크가 느린 경우 삽입 속도를 크게 저하시킬 수 있습니다 (예: S3).
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md)) — 디스크 부하 분산 정책. 다음 값 중 하나일 수 있습니다:
  - `ROUND_ROBIN`
  - `LEAST_USED`

저장 정책에 하나 이상의 볼륨이 포함되어 있는 경우 각 볼륨에 대한 정보는 테이블의 개별 행에 저장됩니다.
