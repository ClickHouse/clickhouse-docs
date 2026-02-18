---
description: 'MergeTree 파트 정보를 포함하는 system 테이블'
keywords: ['system 테이블', '파트']
slug: /operations/system-tables/parts
title: 'system.parts'
doc_type: 'reference'
---

# system.parts \{#systemparts\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 파트에 대한 정보가 포함됩니다.

각 행은 하나의 데이터 파트를 나타냅니다.

컬럼:

* `partition` ([String](../../sql-reference/data-types/string.md)) – 파티션 이름입니다. 파티션에 대한 자세한 내용은 [ALTER](/sql-reference/statements/alter) 쿼리 설명을 참조하십시오.

  형식:

  * 월별 자동 파티션의 경우 `YYYYMM`.
  * 수동으로 파티션을 나누는 경우 `any_string`.

* `name` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트 이름입니다. 파트 이름 구조를 통해 데이터, 수집, 머지 패턴과 관련된 다양한 특성을 파악할 수 있습니다. 파트 이름 형식은 다음과 같습니다.

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 정의:
  * `partition_id` - 파티션 키를 식별합니다
  * `minimum_block_number` - 파트에서 최소 블록 번호를 식별합니다. ClickHouse는 항상 연속된 블록을 머지(merge)합니다
  * `maximum_block_number` - 파트에서 최대 블록 번호를 식별합니다
  * `level` - 파트에 대해 머지가 일어날 때마다 1씩 증가합니다. 레벨이 0이면 아직 머지되지 않은 새로운 파트임을 나타냅니다. ClickHouse의 모든 파트는 항상 변경 불가능(immutable)하다는 점이 중요합니다
  * `data_version` - 선택적 값으로, 파트에 뮤테이션(mutation)이 발생할 때 증가합니다. 파트는 변경 불가능하므로, 뮤테이션된 데이터 역시 항상 새로운 파트에만 기록됩니다

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) -  데이터 파트의 UUID입니다.

* `part_type` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트를 저장하는 형식입니다.

  가능한 값:

  * `Wide` — 각 컬럼이 파일 시스템의 개별 파일에 저장됩니다.
  * `Compact` — 모든 컬럼이 파일 시스템의 하나의 파일에 저장됩니다.

    데이터 저장 형식은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정으로 제어됩니다.

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 데이터 파트가 활성 상태인지 나타내는 플래그입니다. 데이터 파트가 활성 상태이면 테이블에서 사용되며, 그렇지 않으면 삭제됩니다. 비활성 데이터 파트는 머지 작업 후에도 남아 있습니다.

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 마크 수입니다. 데이터 파트의 대략적인 행 수를 구하려면 `marks` 값에 인덱스 그레뉼러리티(index granularity, 일반적으로 8192)를 곱합니다(이 힌트는 adaptive granularity에는 적용되지 않습니다).

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 행 수입니다.

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 모든 데이터 파트 파일의 크기를 바이트 단위로 합한 값입니다.

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트의 압축된 데이터 전체 크기입니다. 모든 보조 파일(예: 마크 파일)은 포함되지 않습니다.

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트 내 압축되지 않은 데이터의 전체 크기입니다. 마크 파일과 같은 모든 보조 파일은 포함되지 않습니다.

* `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 디스크의 primary.idx/cidx 파일에서 기본 키 값이 사용하는 메모리 크기(바이트 단위)입니다.

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 마크 파일의 크기입니다.

* `files` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트에 포함된 파일 수입니다.

* `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트에서 세컨더리 인덱스의 압축된 데이터 총 크기입니다. 마크가 포함된 파일과 같은 모든 보조 파일은 포함되지 않습니다.

* `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트에서 보조 인덱스용 비압축 데이터의 전체 크기입니다. 모든 부가 파일(예: 마크 파일)은 포함되지 않습니다.

* `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 보조 인덱스용 마크가 포함된 파일의 크기입니다.

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트가 있는 디렉터리가 수정된 시각입니다. 일반적으로 데이터 파트가 생성된 시각에 해당합니다.

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트가 비활성화된 시각입니다.

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 데이터 파트가 참조되는 횟수입니다. 값이 2보다 크면 데이터 파트가 쿼리나 머지에서 사용되고 있음을 나타냅니다.

* `min_date` ([Date](../../sql-reference/data-types/date.md)) – 데이터 파트에서 날짜 키가 갖는 최소값입니다.

* `max_date` ([Date](../../sql-reference/data-types/date.md)) – 데이터 파트에서 날짜 키의 최댓값입니다.

* `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트 내 날짜 및 시간 키의 최소값입니다.

* `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – 데이터 파트 내에서 날짜/시간 키의 최댓값입니다.

* `partition_id` ([String](../../sql-reference/data-types/string.md)) – 파티션 ID입니다.

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 머지 후 현재 파트를 구성하는 데이터 블록들 가운데 가장 작은 번호입니다.

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 병합 후 현재 파트를 구성하는 데이터 블록 번호 가운데 가장 큰 값입니다.

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 머지 트리의 깊이입니다. 값이 0이면 현재 파트는 다른 파트를 머지한 것이 아니라 insert로 생성되었음을 의미합니다.

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 데이터 파트에 어떤 뮤테이션을 적용해야 하는지 결정하는 데 사용되는 값입니다 (`data_version`보다 높은 버전을 가진 뮤테이션).

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 기본 키 값이 사용하는 메모리 크기(바이트 단위)입니다 (`primary_key_lazy_load=1`이고 `use_primary_key_cache=1`인 경우 `0`입니다).

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 기본 키 값에 대해 예약된 메모리의 크기(바이트 단위)입니다 (`primary_key_lazy_load=1` 이고 `use_primary_key_cache=1`인 경우 `0`입니다).

* `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 파티션 데이터 백업이 존재하는지를 나타내는 플래그입니다. 1이면 백업이 존재하고, 0이면 백업이 존재하지 않습니다. 자세한 내용은 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)을 참조하십시오.

* `database` ([String](../../sql-reference/data-types/string.md)) – 데이터베이스의 이름입니다.

* `table` ([String](../../sql-reference/data-types/string.md)) – 테이블의 이름입니다.

* `engine` ([String](../../sql-reference/data-types/string.md)) – 파라미터를 포함하지 않은 테이블 엔진의 이름입니다.

* `path` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트 파일이 저장된 폴더의 절대 경로입니다.

* `disk_name` ([String](../../sql-reference/data-types/string.md)) – 데이터 파트를 저장하는 디스크 이름입니다.

* `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – 압축된 모든 파일에 대한 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 해시 값입니다.

* `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – 비압축 파일(마크 파일, 인덱스 파일 등)의 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 해시 값입니다.

* `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 압축된 파일을 비압축 상태라고 가정하고 그 데이터에 대해 계산한 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 값입니다.

* `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)에 사용되는 날짜-시간 키의 최소값입니다.

* `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE rule](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)의 날짜 및 시간 키 최댓값입니다.

* `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 표현식 배열입니다. 각 표현식은 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)을 정의합니다.

:::note
`move_ttl_info.expression` 배열은 주로 이전 버전과의 호환성을 위해 유지되며, 현재 `TTL MOVE` 규칙을 확인하는 가장 간단한 방법은 `move_ttl_info.min` 및 `move_ttl_info.max` 필드를 사용하는 것입니다.
:::

* `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 날짜 및 시간 값의 배열입니다. 각 요소는 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)에 대한 최소 키 값을 나타냅니다.

* `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 날짜 및 시간 값의 배열입니다. 각 요소는 [TTL MOVE 규칙](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)에 대한 최대 키 값을 나타냅니다.

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk`의 별칭입니다.

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes`의 별칭입니다.

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

**함께 보기**

* [MergeTree 패밀리](../../engines/table-engines/mergetree-family/mergetree.md)
* [컬럼 및 테이블에 대한 TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
