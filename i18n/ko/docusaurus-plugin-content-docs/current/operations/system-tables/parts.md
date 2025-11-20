---
'description': 'MergeTree의 파트에 대한 정보를 포함하는 시스템 테이블'
'keywords':
- 'system table'
- 'parts'
'slug': '/operations/system-tables/parts'
'title': 'system.parts'
'doc_type': 'reference'
---


# system.parts

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 파트에 대한 정보를 포함합니다.

각 행은 하나의 데이터 파트를 설명합니다.

열:

- `partition` ([String](../../sql-reference/data-types/string.md)) – 파티션 이름. 파티션이 무엇인지 학습하려면 [ALTER](/sql-reference/statements/alter) 쿼리 설명을 참조하십시오.

    형식:

  - 월별 자동 파티셔닝의 경우 `YYYYMM`.
  - 수동으로 파티셔닝할 경우 `any_string`.

- `name` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트 이름. 파트 명명 구조는 데이터, 수집 및 병합 패턴의 많은 측면을 결정하는 데 사용할 수 있습니다. 파트 명명 형식은 다음과 같습니다:

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 정의:
  - `partition_id` - 파티션 키를 식별합니다.
  - `minimum_block_number` - 파트의 최소 블록 번호를 식별합니다. ClickHouse는 항상 연속 블록을 병합합니다.
  - `maximum_block_number` - 파트의 최대 블록 번호를 식별합니다.
  - `level` - 파트에 대한 각 추가 병합 시 1씩 증가합니다. 레벨 0은 병합되지 않은 새로운 파트를 나타냅니다. ClickHouse의 모든 파트는 항상 불변임을 기억하는 것이 중요합니다.
  - `data_version` - 선택적 값으로, 파트가 수정될 때 증가합니다 (다시 말해, 수정된 데이터는 항상 새로운 파트에만 기록됩니다. 파트는 불변입니다).

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - 데이터 파트의 UUID입니다.

- `part_type` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트 저장 형식입니다.

    가능한 값:

  - `Wide` — 각 컬럼이 파일 시스템의 별도 파일에 저장됩니다.
  - `Compact` — 모든 컬럼이 파일 시스템의 하나의 파일에 저장됩니다.

    데이터 저장 형식은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정에 의해 제어됩니다.

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 데이터 파트 활성 상태를 나타내는 플래그입니다. 데이터 파트가 활성 상태면 테이블에서 사용됩니다. 그렇지 않으면 삭제됩니다. 비활성 데이터 파트는 병합 후 남아 있습니다.

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 마크 수. 데이터 파트의 대략적인 행 수를 얻으려면 `marks`에 인덱스 세분화(일반적으로 8192)를 곱하세요 (이 힌트는 적응형 세분화에 대해 작동하지 않습니다).

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 행 수입니다.

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 바이트 단위의 모든 데이터 파트 파일의 총 크기입니다.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트의 압축된 데이터 총 크기입니다. 모든 보조 파일(예: 마크가 포함된 파일)은 포함되지 않습니다.

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트의 압축되지 않은 데이터 총 크기입니다. 모든 보조 파일(예: 마크가 포함된 파일)은 포함되지 않습니다.

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 디스크의 primary.idx/cidx 파일에서 기본 키 값에 사용되는 메모리 양(바이트 단위)입니다.

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 마크 파일의 크기입니다.

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트의 보조 인덱스에 대한 압축 데이터 총 크기입니다. 모든 보조 파일(예: 마크가 포함된 파일)은 포함되지 않습니다.

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트의 보조 인덱스에 대한 압축되지 않은 데이터 총 크기입니다. 모든 보조 파일(예: 마크가 포함된 파일)은 포함되지 않습니다.

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 보조 인덱스를 위한 마크 파일의 크기입니다.

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트가 수정된 디렉터리의 시간입니다. 이는 일반적으로 데이터 파트 생성 시간과 일치합니다.

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트가 비활성 상태가 된 시간입니다.

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 데이터 파트가 사용되는 장소의 수입니다. 값이 2보다 크면 데이터 파트가 쿼리 또는 병합에 사용되고 있음을 나타냅니다.

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – 데이터 파트의 날짜 키의 최소값입니다.

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – 데이터 파트의 날짜 키의 최대값입니다.

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트의 날짜 및 시간 키의 최소값입니다.

- `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트의 날짜 및 시간 키의 최대값입니다.

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – 파티션의 ID입니다.

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 병합 이후 현재 파트를 구성하는 최소 데이터 블록 번호입니다.

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 병합 이후 현재 파트를 구성하는 최대 데이터 블록 번호입니다.

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 병합 트리의 깊이입니다. 0은 현재 파트가 다른 파트를 병합하여 생성된 것이 아니라 삽입에 의해 생성되었음을 의미합니다.

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트에 적용해야 하는 변형을 결정하는 데 사용되는 숫자입니다 (변형의 버전이 `data_version`보다 높습니다).

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 기본 키 값에 사용되는 메모리 양(바이트 단위)입니다 ( `primary_key_lazy_load=1` 및 `use_primary_key_cache=1`인 경우 `0`이 됩니다).

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 기본 키 값에 예약된 메모리 양(바이트 단위)입니다 ( `primary_key_lazy_load=1` 및 `use_primary_key_cache=1`인 경우 `0`이 됩니다).

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 파티션 데이터 백업이 존재함을 나타내는 플래그입니다. 1이면 백업이 존재하며, 0이면 백업이 존재하지 않습니다. 더 자세한 내용은 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)을 참조하십시오.

- `database` ([String](../../sql-reference/data-types/string.md)) – 데이터베이스 이름입니다.

- `table` ([String](../../sql-reference/data-types/string.md)) – 테이블 이름입니다.

- `engine` ([String](../../sql-reference/data-types/string.md)) – 매개변수가 없는 테이블 엔진의 이름입니다.

- `path` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트 파일이 있는 폴더의 절대 경로입니다.

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트를 저장하는 디스크의 이름입니다.

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128)로 압축된 파일의 해시입니다.

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – 압축되지 않은 파일의 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) (마크가 포함된 파일, 인덱스 파일 등).

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 압축 파일 내 데이터의 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) (압축 해제된 것으로 가정할 경우).

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)의 날짜 및 시간 키의 최소값입니다.

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)의 날짜 및 시간 키의 최대값입니다.

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 표현식 배열입니다. 각 표현식은 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)을 정의합니다.

:::note
`move_ttl_info.expression` 배열은 주로 이전 호환성을 위해 유지됩니다. 이제 'TTL MOVE' 규칙을 확인하는 가장 간단한 방법은 `move_ttl_info.min` 및 `move_ttl_info.max` 필드를 사용하는 것입니다.
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 날짜 및 시간 값 배열입니다. 각 요소는 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)의 최소 키 값을 설명합니다.

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 날짜 및 시간 값 배열입니다. 각 요소는 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)의 최대 키 값을 설명합니다.

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk`의 별칭입니다.

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes`의 별칭입니다.

**예제**

```sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_4_1_6
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  6
bytes_on_disk:                         310
data_compressed_bytes:                 157
data_uncompressed_bytes:               91
secondary_indices_compressed_bytes:    58
secondary_indices_uncompressed_bytes:  6
secondary_indices_marks_bytes:         48
marks_bytes:                           144
modification_time:                     2020-06-18 13:01:49
remove_time:                           1970-01-01 00:00:00
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
min_time:                              1970-01-01 00:00:00
max_time:                              1970-01-01 00:00:00
partition_id:                          all
min_block_number:                      1
max_block_number:                      4
level:                                 1
data_version:                          6
primary_key_bytes_in_memory:           8
primary_key_bytes_in_memory_allocated: 64
is_frozen:                             0
database:                              default
table:                                 months
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/months/all_1_4_1_6/
hash_of_all_files:                     2d0657a16d9430824d35e327fcbd87bf
hash_of_uncompressed_files:            84950cc30ba867c77a408ae21332ba29
uncompressed_hash_of_compressed_files: 1ad78f1c6843bbfb99a2c931abe7df7d
delete_ttl_info_min:                   1970-01-01 00:00:00
delete_ttl_info_max:                   1970-01-01 00:00:00
move_ttl_info.expression:              []
move_ttl_info.min:                     []
move_ttl_info.max:                     []
```

**참고하세요**

- [MergeTree 계열](../../engines/table-engines/mergetree-family/mergetree.md)
- [컬럼 및 테이블에 대한 TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
