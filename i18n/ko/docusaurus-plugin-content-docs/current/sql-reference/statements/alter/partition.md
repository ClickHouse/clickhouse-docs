---
'description': '파티션에 대한 문서'
'sidebar_label': 'PARTITION'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': '파티션 및 파트 조작'
'doc_type': 'reference'
---

The following operations with [partitions](/engines/table-engines/mergetree-family/custom-partitioning-key.md) are available:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 지정된 파티션 또는 파트를 `detached` 디렉토리로 이동하고 잊어버립니다.
- [DROP PARTITION\|PART](#drop-partitionpart) — 파티션 또는 파트를 삭제합니다.
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - `detached`에서 파트 또는 파르의 모든 부분을 삭제합니다.
- [FORGET PARTITION](#forget-partition) — 비어있다면 zookeeper에서 파티션 메타데이터를 삭제합니다.
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` 디렉토리에서 테이블에 파티션 또는 파트를 추가합니다.
- [ATTACH PARTITION FROM](#attach-partition-from) — 한 테이블에서 다른 테이블로 데이터 파티션을 복사하여 추가합니다.
- [REPLACE PARTITION](#replace-partition) — 한 테이블에서 다른 테이블로 데이터 파티션을 복사하고 교체합니다.
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 한 테이블에서 다른 테이블로 데이터 파티션을 이동합니다.
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 파티션 내의 지정된 컬럼의 값을 리셋합니다.
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 파티션 내의 지정된 보조 인덱스를 리셋합니다.
- [FREEZE PARTITION](#freeze-partition) — 파티션의 백업을 생성합니다.
- [UNFREEZE PARTITION](#unfreeze-partition) — 파티션의 백업을 제거합니다.
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 다른 서버에서 파트 또는 파티션을 다운로드합니다.
- [MOVE PARTITION\|PART](#move-partitionpart) — 파티션/데이터 파트를 다른 디스크나 볼륨으로 이동합니다.
- [UPDATE IN PARTITION](#update-in-partition) — 조건에 따라 파티션 내의 데이터를 업데이트합니다.
- [DELETE IN PARTITION](#delete-in-partition) — 조건에 따라 파티션 내의 데이터를 삭제합니다.
- [REWRITE PARTS](#rewrite-parts) — 테이블(또는 특정 파티션)의 파트를 완전히 재작성합니다.

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

지정된 파티션에 대한 모든 데이터를 `detached` 디렉토리로 이동합니다. 서버는 이 데이터 파티션을 존재하지 않는 것처럼 잊어버립니다. 서버는 [ATTACH](#attach-partitionpart) 쿼리를 실행하기 전까지 이 데이터에 대해 알지 못할 것입니다.

예시:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

파티션 식 설정에 대한 내용을 [How to set the partition expression](#how-to-set-partition-expression) 섹션에서 읽어보세요.

쿼리가 실행된 후, `detached` 디렉토리의 데이터에 대해 원하는 모든 작업을 수행할 수 있습니다. 파일 시스템에서 삭제하거나 그냥 둘 수 있습니다.

이 쿼리는 복제되며 – 모든 복제본의 `detached` 디렉토리에 데이터를 이동합니다. 이 쿼리는 리더 복제본에서만 실행할 수 있습니다. 복제본이 리더인지 확인하려면 [system.replicas](/operations/system-tables/replicas) 테이블에 `SELECT` 쿼리를 수행하세요. 또는 모든 복제본에서 `DETACH` 쿼리를 실행하는 것이 더 쉽습니다 - 모든 복제본이 예외를 발생시켜 리더 복제본만 허용됩니다(여러 리더를 허용합니다).

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

지정된 파티션을 테이블에서 삭제합니다. 이 쿼리는 파티션을 비활성으로 표시하고 데이터를 완전히 삭제하며, 약 10분이 소요됩니다.

파티션 식 설정에 대한 내용을 [How to set the partition expression](#how-to-set-partition-expression) 섹션에서 읽어보세요.

이 쿼리는 복제되며 – 모든 복제본에서 데이터를 삭제합니다.

예시:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

`detached`에서 지정된 파트 또는 지정된 파티션의 모든 파트를 제거합니다. 파티션 식 설정에 대한 내용을 [How to set the partition expression](#how-to-set-partition-expression) 섹션에서 더 읽어보세요.

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

비어있는 파티션에 대한 모든 메타데이터를 ZooKeeper에서 제거합니다. 파티션이 비어있지 않거나 알 수 없으면 쿼리가 실패합니다. 다시는 사용되지 않을 파티션에 대해서만 실행해야 합니다.

파티션 식 설정에 관한 내용은 [How to set the partition expression](#how-to-set-partition-expression) 섹션을 읽어보세요.

예시:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

`detached` 디렉토리에서 테이블에 데이터를 추가합니다. 전체 파티션 또는 개별 파트를 추가할 수 있습니다. 예시:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

파티션 식 설정에 관한 내용은 [How to set the partition expression](#how-to-set-partition-expression) 섹션을 읽어보세요.

이 쿼리는 복제됩니다. 복제본 시작자는 `detached` 디렉토리에 데이터가 있는지 확인합니다. 데이터가 존재하면 쿼리는 무결성을 체크합니다. 모든 것이 올바르면 쿼리는 데이터를 테이블에 추가합니다.

비시작 복제본이 attach 명령을 수신했을 때, 자신의 `detached` 폴더에서 올바른 체크섬을 가진 파트를 찾으면 다른 복제본에서 다운로드하지 않고 데이터를 추가합니다. 올바른 체크섬을 가진 파트가 없으면 데이터를 파트를 가진 복제본에서 다운로드합니다.

한 복제본의 `detached` 디렉토리에 데이터를 놓고 모든 복제본 테이블에 이를 추가하기 위해 `ALTER ... ATTACH` 쿼리를 사용할 수 있습니다.

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

이 쿼리는 `table1`에서 `table2`로 데이터 파티션을 복사합니다.

다음 사항에 유의하세요:

- 데이터는 `table1`이나 `table2`에서 삭제되지 않습니다.
- `table1`은 임시 테이블일 수 있습니다.

쿼리가 성공적으로 실행되려면 다음 조건이 충족되어야 합니다:

- 두 테이블은 같은 구조여야 합니다.
- 두 테이블은 동일한 파티션 키를 가져야 하며, 동일한 정렬 기준과 동일한 기본 키를 가져야 합니다.
- 두 테이블은 동일한 저장 정책을 가져야 합니다.
- 목적지 테이블은 소스 테이블의 모든 인덱스와 프로젝션을 포함해야 합니다. 만약 목적지 테이블에서 `enforce_index_structure_match_on_partition_manipulation` 설정이 활성화 되어 있다면, 인덱스와 프로젝션은 동일해야 합니다. 그렇지 않으면, 목적지 테이블은 소스 테이블의 인덱스와 프로젝션의 슈퍼셋을 가질 수 있습니다.

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

이 쿼리는 `table1`에서 `table2`로 데이터 파티션을 복사하고 `table2`의 기존 파티션을 교체합니다. 이 작업은 원자적입니다.

다음 사항에 유의하세요:

- 데이터는 `table1`에서 삭제되지 않습니다.
- `table1`은 임시 테이블일 수 있습니다.

쿼리가 성공적으로 실행되기 위해서는 다음 조건이 충족되어야 합니다:

- 두 테이블은 같은 구조여야 합니다.
- 두 테이블은 동일한 파티션 키를 가져야 하며, 동일한 정렬 기준과 동일한 기본 키를 가져야 합니다.
- 두 테이블은 동일한 저장 정책을 가져야 합니다.
- 목적지 테이블은 소스 테이블의 모든 인덱스와 프로젝션을 포함해야 합니다. 만약 목적지 테이블에서 `enforce_index_structure_match_on_partition_manipulation` 설정이 활성화 되어 있다면, 인덱스와 프로젝션은 동일해야 합니다. 그렇지 않으면, 목적지 테이블은 소스 테이블의 인덱스와 프로젝션의 슈퍼셋을 가질 수 있습니다.

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

이 쿼리는 `table_source`에서 `table_dest`로 데이터 파티션을 이동하며 `table_source`에서 데이터를 삭제합니다.

쿼리가 성공적으로 실행되기 위해서는 다음 조건이 충족되어야 합니다:

- 두 테이블은 같은 구조여야 합니다.
- 두 테이블은 동일한 파티션 키를 가져야 하며, 동일한 정렬 기준과 동일한 기본 키를 가져야 합니다.
- 두 테이블은 동일한 저장 정책을 가져야 합니다.
- 두 테이블은 동일한 엔진 패밀리(복제 또는 비복제)여야 합니다.
- 목적지 테이블은 소스 테이블의 모든 인덱스와 프로젝션을 포함해야 합니다. 만약 목적지 테이블에서 `enforce_index_structure_match_on_partition_manipulation` 설정이 활성화 되어 있다면, 인덱스와 프로젝션은 동일해야 합니다. 그렇지 않으면, 목적지 테이블은 소스 테이블의 인덱스와 프로젝션의 슈퍼셋을 가질 수 있습니다.

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

지정된 컬럼의 모든 값을 파티션 내에서 리셋합니다. 테이블 생성 시 `DEFAULT` 절이 결정되었다면 이 쿼리는 컬럼 값을 지정된 기본 값으로 설정합니다.

예시:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

이 쿼리는 지정된 파티션의 로컬 백업을 생성합니다. `PARTITION` 절이 생략되면 쿼리는 한 번에 모든 파티션의 백업을 생성합니다.

:::note
전체 백업 프로세스는 서버를 중지하지 않고 수행됩니다.
:::

구식 테이블의 경우, 파티션 이름의 접두사를 지정할 수 있으며(예: `2019`), 이 경우 쿼리는 해당 파티션에 대한 모든 백업을 생성합니다. 파티션 식 설정에 대한 내용을 [How to set the partition expression](#how-to-set-partition-expression) 섹션에서 읽어보세요.

실행 시, 데이터 스냅샷에 대해, 쿼리는 테이블 데이터에 대한 하드 링크를 생성합니다. 하드 링크는 `/var/lib/clickhouse/shadow/N/...` 디렉토리에 배치됩니다. 여기서:

- `/var/lib/clickhouse/`는 구성 파일에 지정된 ClickHouse 작업 디렉토리입니다.
- `N`은 백업의 증분 번호입니다.
- `WITH NAME` 매개변수가 지정된 경우, 증분 번호 대신 `'backup_name'` 매개변수의 값이 사용됩니다.

:::note
테이블에서 데이터 저장을 위해 [디스크 세트를 사용하는 경우](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes), `shadow/N` 디렉토리가 모든 디스크에 나타나며, `PARTITION` 식으로 일치하는 데이터 파트를 저장합니다.
:::

백업 내 디렉토리 구조는 `/var/lib/clickhouse/` 내 구조와 동일하게 생성됩니다. 쿼리는 모든 파일에 대해 `chmod`를 수행하여 파일에 대한 쓰기를 금지합니다.

백업을 생성한 후, `/var/lib/clickhouse/shadow/`에서 원격 서버로 데이터를 복사한 다음 로컬 서버에서 삭제할 수 있습니다. `ALTER t FREEZE PARTITION` 쿼리는 복제되지 않으며 로컬 서버에서만 로컬 백업을 생성합니다.

쿼리는 거의 즉시 백업을 생성하지만, 먼저 해당 테이블의 현재 쿼리가 모두 완료될 때까지 기다립니다.

`ALTER TABLE t FREEZE PARTITION`은 데이터만 복사하고 테이블 메타데이터는 복사하지 않습니다. 테이블 메타데이터의 백업을 만들려면 `/var/lib/clickhouse/metadata/database/table.sql` 파일을 복사합니다.

백업에서 데이터를 복원하려면 다음 단계를 따르세요:

1. 테이블이 존재하지 않으면 생성하세요. 쿼리를 보려면 .sql 파일을 사용하세요(그 안의 `ATTACH`를 `CREATE`로 교체).
2. 백업 내의 `data/database/table/` 디렉토리에서 `/var/lib/clickhouse/data/database/table/detached/` 디렉토리로 데이터를 복사합니다.
3. `ALTER TABLE t ATTACH PARTITION` 쿼리를 실행하여 데이터를 테이블에 추가합니다.

백업에서 복원하는 데 서버를 중지할 필요는 없습니다.

쿼리는 부분을 병렬로 처리하며, 스레드 수는 `max_threads` 설정에 의해 조정됩니다.

백업 및 데이터 복원에 대한 더 많은 정보는 [Data Backup](/operations/backup.md) 섹션에서 확인하십시오.

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

지정된 이름을 가진 `frozen` 파티션을 디스크에서 제거합니다. `PARTITION` 절이 생략되면 쿼리는 한 번에 모든 파티션의 백업을 제거합니다.

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

이 쿼리는 `CLEAR COLUMN`과 유사하게 작동하지만, 컬럼 데이터 대신 인덱스를 리셋합니다.

## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

다른 서버에서 파티션을 다운로드합니다. 이 쿼리는 복제된 테이블에서만 작동합니다.

이 쿼리는 다음과 같이 작동합니다:

1. 지정된 샤드에서 파티션|부분을 다운로드합니다. 'path-in-zookeeper'에서 ZooKeeper의 샤드 경로를 지정해야 합니다.
2. 그런 다음 다운로드된 데이터는 `table_name` 테이블의 `detached` 디렉토리에 배치됩니다. [ATTACH PARTITION\|PART](#attach-partitionpart) 쿼리를 사용하여 데이터를 테이블에 추가하세요.

예시:

1. FETCH PARTITION
```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. FETCH PART
```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

다음 사항에 유의하세요:

- `ALTER ... FETCH PARTITION|PART` 쿼리는 복제되지 않습니다. 이는 로컬 서버의 `detached` 디렉토리에만 부분 또는 파티션을 배치합니다.
- `ALTER TABLE ... ATTACH` 쿼리는 복제됩니다. 데이터는 모든 복제본에 추가됩니다. 데이터는 `detached` 디렉토리의 한 복제본에 추가되고, 나머지 복제본으로부터는 인접 복제본에서 추가됩니다.

다운로드 전에 시스템은 파티션이 존재하는지 및 테이블 구조가 일치하는지 확인합니다. 건강한 복제본 중 가장 적합한 복제본이 자동으로 선택됩니다.

쿼리의 이름이 `ALTER TABLE`이지만, 테이블 구조를 변경하지 않으며 테이블에서 즉시 사용할 수 있는 데이터도 변경하지 않습니다.

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree` 엔진 테이블에 대해 파티션 또는 데이터 파트를 다른 볼륨이나 디스크로 이동합니다. [Using Multiple Block Devices for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)를 참조하세요.

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 쿼리는:

- 복제되지 않으며 서로 다른 복제본이 서로 다른 저장 정책을 가질 수 있습니다.
- 지정된 디스크 또는 볼륨이 구성되지 않은 경우 오류를 반환합니다. 또한 쿼리는 저장 정책에서 지정한 데이터 이동 조건이 적용될 수 없는 경우에도 오류를 반환합니다.
- 데이터가 백그라운드 프로세스, 동시 `ALTER TABLE t MOVE` 쿼리 또는 백그라운드 데이터 병합의 결과에 의해 이미 이동된 경우 오류를 반환할 수 있습니다. 이 경우 사용자에게 추가 작업을 수행하지 않도록 해야 합니다.

예시:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

지정된 필터링 표현식과 일치하는 특정 파티션 내 데이터를 조작합니다. [mutation](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

구문:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### 예시 {#example}

```sql
-- using partition name
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### 참조 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

지정된 필터링 표현식과 일치하는 특정 파티션 내 데이터를 삭제합니다. [mutation](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

구문:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### 예시 {#example-1}

```sql
-- using partition name
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

## REWRITE PARTS {#rewrite-parts}

이는 모든 새 설정을 사용하여 파트를 처음부터 다시 작성합니다. 이는 `use_const_adaptive_granularity`와 같은 테이블 수준의 설정이 기본적으로 새로 작성된 파트에만 적용되기 때문에 의미가 있습니다.

### 예시 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### 참조 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` 쿼리에서 파티션 식을 다양한 방법으로 지정할 수 있습니다:

- `system.parts` 테이블의 `partition` 컬럼에서 값으로. 예: `ALTER TABLE visits DETACH PARTITION 201901`.
- 키워드 `ALL`을 사용하여. DROP/DETACH/ATTACH/ATTACH FROM과만 함께 사용될 수 있습니다. 예: `ALTER TABLE visits ATTACH PARTITION ALL`.
- 테이블 파티셔닝 키 튜플과 일치하는 표현식 또는 상수의 튜플로. 단일 요소 파티셔닝 키의 경우, 표현식은 `tuple (...)` 함수로 감싸야 합니다. 예: `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- 파티션 ID를 사용하여. 파티션 ID는 파티션의 문자열 식별자로, 파일 시스템과 ZooKeeper에서 파티션의 이름으로 사용됩니다. 파티션 ID는 `PARTITION ID` 절에 지정해야 하며, 작은 따옴표로 감싸야 합니다. 예: `ALTER TABLE visits DETACH PARTITION ID '201901'`.
- [ALTER ATTACH PART](#attach-partitionpart) 및 [DROP DETACHED PART](#drop-detached-partitionpart) 쿼리에서 파트의 이름을 지정하려면, [system.detached_parts](/operations/system-tables/detached_parts) 테이블의 `name` 컬럼에서 값을 사용하는 문자열 리터럴을 사용하세요. 예: `ALTER TABLE visits ATTACH PART '201901_1_1_0'`.

파티션을 지정할 때 인용 부호의 사용은 파티션 표현의 유형에 따라 다릅니다. 예를 들어, `String` 유형의 경우, 이름을 인용 부호(`'`)로 지정해야 합니다. `Date` 및 `Int*` 유형의 경우 인용 부호가 필요하지 않습니다.

위의 모든 규칙은 [OPTIMIZE](/sql-reference/statements/optimize.md) 쿼리에 대해서도 동일하게 적용됩니다. 비파티셔닝 테이블을 최적화할 때 단일 파티션을 지정해야 한다면, 표현식을 `PARTITION tuple()`로 설정하세요. 예:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION`은 `UPDATE`(/sql-reference/statements/alter/update) 또는 `DELETE`(/sql-reference/statements/alter/delete) 표현식이 `ALTER TABLE` 쿼리의 결과로 적용되는 파티션을 지정합니다. 신규 파트는 지정된 파티션에서만 생성됩니다. 이렇게 `IN PARTITION`은 테이블이 여러 파티션으로 나뉘고, 데이터를 점진적으로 업데이트해야 할 때 부하를 줄이는 데 도움이 됩니다.

`ALTER ... PARTITION` 쿼리의 예시는 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 및 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) 테스트에서 시연됩니다.
