---
description: '서버가 알고 있는 각 테이블의 메타데이터를 담고 있는 시스템 테이블입니다.'
keywords: ['시스템 테이블', '테이블']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: 'reference'
---

# system.tables \{#systemtables\}

서버가 인식하고 있는 각 테이블의 메타데이터를 포함합니다.

[Detached](../../sql-reference/statements/detach.md) 테이블은 `system.tables`에 표시되지 않습니다.

[Temporary tables](../../sql-reference/statements/create/table.md#temporary-tables)는 생성된 해당 세션에서만 `system.tables`에 표시됩니다. 이러한 테이블은 `database` 필드가 비어 있으며 `is_temporary` 플래그가 켜진 상태로 표시됩니다.

컬럼:

* `database` ([String](../../sql-reference/data-types/string.md)) — 테이블이 포함된 데이터베이스 이름입니다.

* `name` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름입니다.

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 테이블 UUID(Atomic 데이터베이스).

* `engine` ([String](../../sql-reference/data-types/string.md)) — 매개변수를 포함하지 않은 테이블 엔진 이름.`

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 해당 테이블이 임시 테이블인지 여부를 나타내는 플래그입니다.

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 파일 시스템 내 테이블 데이터의 경로입니다.

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - 파일 시스템 상의 테이블 메타데이터 경로입니다.

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 테이블 메타데이터가 마지막으로 수정된 시각입니다.

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree 테이블의 메타데이터 버전이며, ReplicatedMergeTree 테이블이 아니면 0입니다.

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 데이터베이스 의존성 목록입니다.

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 테이블 종속성(현재 테이블에 의존하는 [materialized view](/sql-reference/statements/create/view#materialized-view)).

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - 테이블을 생성하는 데 사용된 쿼리입니다.

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - 테이블 엔진의 매개변수입니다.

* `as_select` ([String](../../sql-reference/data-types/string.md)) - 뷰에 대한 `SELECT` 쿼리입니다.

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 매개변수화된 VIEW에 대한 매개변수입니다.

* `partition_key` ([String](../../sql-reference/data-types/string.md)) - 테이블에 지정된 파티션 키 식입니다.

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) - 테이블에 지정된 정렬 키 표현식입니다.

* `primary_key` ([String](../../sql-reference/data-types/string.md)) - 테이블에 지정된 기본 키 식입니다.

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) - 테이블에 지정된 샘플링 키 표현식입니다.

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - 스토리지 정책:

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [Distributed](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 테이블의 정확한 행 수를 빠르게 계산할 수 있는 경우 해당 테이블의 총 행 수, 그렇지 않으면 `NULL` (`Buffer` 기반 하위 테이블 포함).

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 스토리지에서 테이블의 정확한 바이트 수를 빠르게 계산할 수 있는 경우, 인덱스와 프로젝션을 포함한 전체 바이트 수입니다. 그렇지 않은 경우에는 `NULL`이며(하위 스토리지는 포함하지 않음) 입니다.

  * 테이블이 디스크에 데이터를 저장하는 경우, 디스크에서 사용 중인 공간(압축된 크기 기준)을 반환합니다.
  * 테이블이 메모리에 데이터를 저장하는 경우, 메모리에서 사용 중인 바이트 수의 대략적인 값을 반환합니다.

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 압축 해제된 전체 바이트 수(인덱스와 프로젝션 포함)입니다. 파트 체크섬에서 스토리지에 있는 테이블의 정확한 바이트 수를 빠르게 계산할 수 있는 경우에만 이 값이 설정되며, 그렇지 않은 경우에는 `NULL`입니다(기저 스토리지(있는 경우)는 고려하지 않습니다).

* `lifetime_rows` ([널 허용](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 서버 시작 이후 INSERT된 행의 총 개수입니다 (`Buffer` 테이블에만 해당).

* `lifetime_bytes` ([널 허용](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 서버 시작 이후 INSERT된 바이트의 총량입니다 (`Buffer` 테이블에만 해당).

* `comment` ([String](../../sql-reference/data-types/string.md)) - 테이블에 대한 주석입니다.

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 테이블 자체가 디스크에 일부 데이터를 저장하는지, 아니면 다른 소스의 데이터에만 접근하는지를 나타내는 플래그입니다.

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 데이터베이스 로드 의존성(현재 객체보다 먼저 로드되어야 하는 객체 목록).

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 테이블 로딩 의존성(현재 객체보다 먼저 로드되어야 하는 객체 목록)입니다.

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 종속적으로 로드되는 데이터베이스 목록.

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 로딩이 의존하는 테이블입니다.

`system.tables` 테이블은 `SHOW TABLES` 쿼리 구현에서 사용됩니다.

**예시**

```sql
SELECT * FROM system.tables LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
name:                       t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/store/81b/81b1c20a-b7c6-4116-a2ce-7583fb6b6736/']
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
metadata_modification_time: 2021-01-25 19:14:32
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE base.t1 (`n` UInt64) ENGINE = MergeTree ORDER BY n
engine_full:                MergeTree ORDER BY n
as_select:                  SELECT database AS table_catalog
partition_key:
sorting_key:                n
primary_key:                n
sampling_key:
storage_policy:             default
total_rows:                 1
total_bytes:                99
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []

Row 2:
──────
database:                   default
name:                       53r93yleapyears
uuid:                       00000000-0000-0000-0000-000000000000
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/data/default/53r93yleapyears/']
metadata_path:              /var/lib/clickhouse/metadata/default/53r93yleapyears.sql
metadata_modification_time: 2020-09-23 09:05:36
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE default.`53r93yleapyears` (`id` Int8, `febdays` Int8) ENGINE = MergeTree ORDER BY id
engine_full:                MergeTree ORDER BY id
as_select:                  SELECT name AS catalog_name
partition_key:
sorting_key:                id
primary_key:                id
sampling_key:
storage_policy:             default
total_rows:                 2
total_bytes:                155
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []
```
