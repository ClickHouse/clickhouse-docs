---
description: 'MergeTree 테이블의 파트 및 컬럼 정보가 저장된 시스템 테이블입니다.'
keywords: ['system table', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns \{#systemparts_columns\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 파트와 컬럼에 대한 정보를 포함합니다.
각 행은 하나의 데이터 파트를 나타냅니다.

| Column                                  | Type     | Description                                                                                                                                       |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `partition`                             | String   | 파티션 이름입니다. 형식: 월별 자동 파티션인 경우 `YYYYMM`, 수동 파티션인 경우 `any_string`입니다.                                                                                |
| `name`                                  | String   | 데이터 파트의 이름입니다.                                                                                                                                    |
| `part_type`                             | String   | 데이터 파트의 저장 형식입니다. 값: `Wide`(각 컬럼이 별도 파일로 저장) 또는 `Compact`(모든 컬럼이 하나의 파일에 저장)입니다. `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정으로 제어됩니다. |
| `active`                                | UInt8    | 데이터 파트가 활성 상태인지 나타내는 플래그입니다. 활성 파트는 테이블에서 사용되고, 비활성 파트는 삭제되거나 머지 후에도 남을 수 있습니다.                                                                   |
| `marks`                                 | UInt64   | 마크의 개수입니다. 인덱스 그라뉼러리티(일반적으로 8192)를 곱해 대략적인 행 수를 구할 수 있습니다.                                                                                        |
| `rows`                                  | UInt64   | 행의 개수입니다.                                                                                                                                         |
| `bytes_on_disk`                         | UInt64   | 모든 데이터 파트 파일의 총 크기(바이트)입니다.                                                                                                                       |
| `data_compressed_bytes`                 | UInt64   | 데이터 파트 내 압축된 데이터의 총 크기입니다(마크와 같은 보조 파일은 제외).                                                                                                      |
| `data_uncompressed_bytes`               | UInt64   | 데이터 파트 내 압축이 해제된 데이터의 총 크기입니다(마크와 같은 보조 파일은 제외).                                                                                                  |
| `marks_bytes`                           | UInt64   | 마크 파일의 크기입니다.                                                                                                                                     |
| `modification_time`                     | DateTime | 데이터 파트가 있는 디렉터리가 수정된 시간입니다(일반적으로 생성 시간에 해당).                                                                                                      |
| `remove_time`                           | DateTime | 데이터 파트가 비활성 상태가 된 시간입니다.                                                                                                                          |
| `refcount`                              | UInt32   | 데이터 파트가 사용되는 위치 수입니다. 값이 2보다 크면 쿼리 또는 머지에 사용 중임을 나타냅니다.                                                                                           |
| `min_date`                              | Date     | 데이터 파트에 있는 날짜 키의 최소값입니다.                                                                                                                          |
| `max_date`                              | Date     | 데이터 파트에 있는 날짜 키의 최대값입니다.                                                                                                                          |
| `partition_id`                          | String   | 파티션 ID입니다.                                                                                                                                        |
| `min_block_number`                      | UInt64   | 머지 결과인 현재 파트를 구성하는 데이터 파트의 최소 번호입니다.                                                                                                              |
| `max_block_number`                      | UInt64   | 머지 결과인 현재 파트를 구성하는 데이터 파트의 최대 번호입니다.                                                                                                              |
| `level`                                 | UInt32   | 머지 트리의 깊이입니다. 0이면 머지가 아니라 INSERT로 생성되었음을 의미합니다.                                                                                                   |
| `data_version`                          | UInt64   | 어떤 뮤테이션을 적용해야 하는지 결정하는 데 사용하는 번호입니다(`data_version`보다 큰 버전의 뮤테이션이 대상이 됩니다).                                                                        |
| `primary_key_bytes_in_memory`           | UInt64   | 프라이머리 키 값에 사용되는 메모리 양(바이트)입니다.                                                                                                                    |
| `primary_key_bytes_in_memory_allocated` | UInt64   | 프라이머리 키 값을 위해 예약된 메모리 양(바이트)입니다.                                                                                                                  |
| `database`                              | String   | 데이터베이스 이름입니다.                                                                                                                                     |
| `table`                                 | String   | 테이블 이름입니다.                                                                                                                                        |
| `engine`                                | String   | 파라미터를 제외한 테이블 엔진 이름입니다.                                                                                                                           |
| `disk_name`                             | String   | 데이터 파트를 저장하는 디스크의 이름입니다.                                                                                                                          |
| `path`                                  | String   | 데이터 파트 파일이 있는 폴더의 절대 경로입니다.                                                                                                                       |
| `column`                                | String   | 컬럼 이름입니다.                                                                                                                                         |
| `type`                                  | String   | 컬럼 타입입니다.                                                                                                                                         |
| `statistics`                            | String   | 해당 컬럼에 대해 생성된 통계입니다.                                                                                                                              |
| `estimates.min`                         | String   | 컬럼의 예상 최소값입니다.                                                                                                                                    |
| `estimates.max`                         | String   | 컬럼의 예상 최대값입니다.                                                                                                                                    |
| `estimates.cardinality`                 | String   | 컬럼의 예상 카디널리티입니다.                                                                                                                                  |
| `column_position`                       | UInt64   | 테이블에서 컬럼의 순서(1부터 시작)입니다.                                                                                                                          |
| `default_kind`                          | String   | 기본값에 대한 표현식 타입입니다(`DEFAULT`, `MATERIALIZED`, `ALIAS`), 정의되지 않은 경우 빈 문자열입니다.                                                                       |
| `default_expression`                    | String   | 기본값에 대한 표현식입니다. 정의되지 않은 경우 빈 문자열입니다.                                                                                                              |
| `column_bytes_on_disk`                  | UInt64   | 컬럼의 총 크기(바이트)입니다.                                                                                                                                 |
| `column_data_compressed_bytes`          | UInt64   | 컬럼 내 압축된 데이터의 총 크기(바이트)입니다. 참고: `Compact` 파트에 대해서는 계산되지 않습니다.                                                                                     |
| `column_data_uncompressed_bytes`        | UInt64   | 컬럼 내 압축이 해제된 데이터의 총 크기(바이트)입니다. 참고: `Compact` 파트에 대해서는 계산되지 않습니다.                                                                                 |
| `column_marks_bytes`                    | UInt64   | 컬럼 내 마크의 크기(바이트)입니다.                                                                                                                              |
| `bytes`                                 | UInt64   | `bytes_on_disk`의 별칭입니다.                                                                                                                           |
| `marks_size`                            | UInt64   | `marks_bytes`의 별칭입니다.                                                                                                                             |

**예시**

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

**추가 참고**

* [MergeTree 계열](../../engines/table-engines/mergetree-family/mergetree.md)
* [compact 파트와 wide 파트 개수 및 크기 계산](/knowledgebase/count-parts-by-type)
