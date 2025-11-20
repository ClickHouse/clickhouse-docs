---
'description': 'MergeTree 테이블의 파트 및 컬럼에 대한 정보를 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'parts_columns'
'slug': '/operations/system-tables/parts_columns'
'title': 'system.parts_columns'
'doc_type': 'reference'
---


# system.parts_columns

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 파트와 컬럼에 대한 정보를 포함합니다.

각 행은 하나의 데이터 파트에 대해 설명합니다.

컬럼:

- `partition` ([String](../../sql-reference/data-types/string.md)) — 파티션 이름. 파티션이 무엇인지 알아보려면 [ALTER](/sql-reference/statements/alter) 쿼리 설명을 참조하세요.

    형식:

  - 월별 자동 파티셔닝의 경우 `YYYYMM`.
  - 수동 파티셔닝의 경우 `any_string`.

- `name` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트의 이름.

- `part_type` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트 저장 형식.

    가능한 값:

  - `Wide` — 각 컬럼이 파일 시스템의 별도 파일에 저장됩니다.
  - `Compact` — 모든 컬럼이 파일 시스템의 하나의 파일에 저장됩니다.

    데이터 저장 형식은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정에 의해 제어됩니다.

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 데이터 파트가 활성 상태인지 여부를 나타내는 플래그. 데이터 파트가 활성 상태이면 테이블에서 사용됩니다. 그렇지 않으면 삭제됩니다. 비활성 데이터 파트는 병합 후 남아 있습니다.

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 마크 수. 데이터 파트의 대략적인 행 수를 얻으려면 `marks`에 인덱스 세분화(보통 8192)를 곱하면 됩니다(이 힌트는 적응형 세분화에는 적용되지 않습니다).

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 행 수.

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이트 단위의 모든 데이터 파트 파일의 총 크기.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 파트의 압축된 데이터 총 크기. 모든 보조 파일(예: 마크가 있는 파일)은 포함되지 않습니다.

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 파트의 비압축 데이터 총 크기. 모든 보조 파일(예: 마크가 있는 파일)은 포함되지 않습니다.

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 마크 파일의 크기.

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 데이터 파트 디렉토리가 수정된 시간. 이는 일반적으로 데이터 파트 생성 시간에 해당합니다.

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 데이터 파트가 비활성 상태가 된 시간.

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 데이터 파트가 사용되는 장소의 수. 2보다 큰 값은 데이터 파트가 쿼리나 병합에 사용되고 있음을 나타냅니다.

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — 데이터 파트의 날짜 키의 최소값.

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — 데이터 파트의 날짜 키의 최대값.

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — 파티션의 ID.

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 병합 후 현재 파트를 구성하는 데이터 파트의 최소 수.

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 병합 후 현재 파트를 구성하는 데이터 파트의 최대 수.

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 머지 트리의 깊이. 0은 현재 파트가 다른 파트를 병합하여 생성된 것이 아니라 삽입으로 생성되었음을 의미합니다.

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 파트에 적용해야 하는 변형을 결정하는 데 사용되는 번호(변형이 `data_version`보다 높은 경우).

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 기본 키 값이 사용하는 메모리 양(바이트 단위).

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 기본 키 값에 대해 예약된 메모리 양(바이트 단위).

- `database` ([String](../../sql-reference/data-types/string.md)) — 데이터베이스 이름.

- `table` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름.

- `engine` ([String](../../sql-reference/data-types/string.md)) — 매개변수가 없는 테이블 엔진 이름.

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트를 저장하는 디스크의 이름.

- `path` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트 파일이 있는 폴더의 절대 경로.

- `column` ([String](../../sql-reference/data-types/string.md)) — 컬럼 이름.

- `type` ([String](../../sql-reference/data-types/string.md)) — 컬럼 유형.

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 테이블에서 컬럼의 위치, 1부터 시작.

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — 기본값에 대한 표현식 유형(`DEFAULT`, `MATERIALIZED`, `ALIAS`) 또는 정의되지 않은 경우 빈 문자열.

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — 기본값에 대한 표현식 또는 정의되지 않은 경우 빈 문자열.

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이트 단위의 컬럼 총 크기.

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이트 단위의 컬럼의 압축된 데이터 총 크기.

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이트 단위의 컬럼의 비압축된 데이터 총 크기.

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이트 단위의 마크가 있는 컬럼의 크기.

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk`의 별칭.

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes`의 별칭.

**예제**

```sql
SELECT * FROM system.parts_columns LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_2_1
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  2
bytes_on_disk:                         155
data_compressed_bytes:                 56
data_uncompressed_bytes:               4
marks_bytes:                           96
modification_time:                     2020-09-23 10:13:36
remove_time:                           2106-02-07 06:28:15
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
partition_id:                          all
min_block_number:                      1
max_block_number:                      2
level:                                 1
data_version:                          1
primary_key_bytes_in_memory:           2
primary_key_bytes_in_memory_allocated: 64
database:                              default
table:                                 53r93yleapyears
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/53r93yleapyears/all_1_2_1/
column:                                id
type:                                  Int8
column_position:                       1
default_kind:
default_expression:
column_bytes_on_disk:                  76
column_data_compressed_bytes:          28
column_data_uncompressed_bytes:        2
column_marks_bytes:                    48
```

**참고**

- [MergeTree 패밀리](../../engines/table-engines/mergetree-family/mergetree.md)
