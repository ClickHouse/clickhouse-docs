---
description: 'COLUMN에 대한 문서'
sidebar_label: 'COLUMN'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: '컬럼 조작'
doc_type: 'reference'
---

테이블 구조를 변경하기 위한 일련의 쿼리입니다.

문법:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

쿼리에서 하나 이상의 작업을 쉼표로 구분된 목록으로 지정합니다.
각 작업은 컬럼에 대한 연산입니다.

다음 작업이 지원됩니다:

* [ADD COLUMN](#add-column) — 테이블에 새로운 컬럼을 추가합니다.
* [DROP COLUMN](#drop-column) — 컬럼을 삭제합니다.
* [RENAME COLUMN](#rename-column) — 기존 컬럼의 이름을 변경합니다.
* [CLEAR COLUMN](#clear-column) — 컬럼 값을 초기화합니다.
* [COMMENT COLUMN](#comment-column) — 컬럼에 텍스트 주석을 추가합니다.
* [MODIFY COLUMN](#modify-column) — 컬럼의 타입, 기본 표현식, TTL, 컬럼 설정을 변경합니다.
* [MODIFY COLUMN REMOVE](#modify-column-remove) — 컬럼 속성 중 하나를 제거합니다.
* [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - 컬럼 설정을 변경합니다.
* [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - 컬럼 설정을 초기화합니다.
* [MATERIALIZE COLUMN](#materialize-column) — 컬럼이 없는 파트에서 컬럼을 구체화합니다.
  이러한 작업은 아래에서 자세히 설명합니다.


## ADD COLUMN \{#add-column\}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

지정된 `name`, `type`, [`codec`](../create/table.md/#column_compression_codec), `default_expr`를 사용하여 테이블에 새로운 컬럼을 추가합니다(섹션 [Default expressions](/sql-reference/statements/create/table#default_values) 참고).

`IF NOT EXISTS` 절이 포함되어 있으면, 컬럼이 이미 존재하더라도 쿼리는 오류를 반환하지 않습니다. `AFTER name_after`(다른 컬럼의 이름)를 지정하면, 테이블 컬럼 목록에서 해당 컬럼 뒤에 새 컬럼이 추가됩니다. 테이블의 처음에 컬럼을 추가하려면 `FIRST` 절을 사용하십시오. 그렇지 않으면 컬럼은 테이블의 끝에 추가됩니다. 일련의 작업에서 `name_after`는 앞선 작업들 중 하나에서 추가된 컬럼의 이름일 수 있습니다.

컬럼을 추가하는 작업은 테이블 구조만 변경할 뿐이며, 데이터에 대해서는 아무 작업도 수행하지 않습니다. `ALTER` 이후에도 데이터는 디스크에 기록되지 않습니다. 테이블에서 데이터를 읽을 때 해당 컬럼의 데이터가 없으면, 기본값으로 채워집니다(기본 표현식이 있으면 이를 실행하고, 없으면 0이나 빈 문자열을 사용). 컬럼은 데이터 파트가 병합된 이후에 디스크에 나타납니다([MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 참고).

이 방식은 기존 데이터의 용량을 증가시키지 않으면서 `ALTER` 쿼리를 즉시 완료할 수 있게 해 줍니다.

예:

```sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

```text
Added1  UInt32
CounterID       UInt32
StartDate       Date
UserID  UInt32
VisitID UInt32
NestedColumn.A  Array(UInt8)
NestedColumn.S  Array(String)
Added2  UInt32
ToDrop  UInt32
Added3  UInt32
```


## DROP COLUMN \{#drop-column\}

```sql
DROP COLUMN [IF EXISTS] name
```

이름이 `name`인 컬럼을 삭제합니다. `IF EXISTS` 절이 지정된 경우, 컬럼이 존재하지 않더라도 쿼리는 오류를 반환하지 않습니다.

파일 시스템에서 데이터를 삭제합니다. 전체 파일을 삭제하므로 쿼리는 거의 즉시 완료됩니다.

:::tip
[materialized view](/sql-reference/statements/create/view)가 해당 컬럼을 참조하고 있는 경우 컬럼을 삭제할 수 없으며, 삭제를 시도하면 오류가 반환됩니다.
:::

예시:

```sql
ALTER TABLE visits DROP COLUMN browser
```


## COLUMN 이름 변경 \{#rename-column\}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

컬럼 `name`의 이름을 `new_name`으로 변경합니다. `IF EXISTS` 절을 지정하면 컬럼이 존재하지 않더라도 쿼리에서 오류를 반환하지 않습니다. 이름 변경은 기본 데이터를 수정하지 않으므로 쿼리는 거의 즉시 완료됩니다.

**NOTE**: 테이블의 키 식(`ORDER BY` 또는 `PRIMARY KEY`로 지정된 경우)에 포함된 컬럼은 이름을 변경할 수 없습니다. 이러한 컬럼을 변경하려고 하면 `SQL Error [524]`가 발생합니다.

예:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```


## CLEAR COLUMN \{#clear-column\}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

지정한 파티션에서 해당 컬럼의 모든 데이터를 초기화합니다. 파티션 이름을 설정하는 방법은 [파티션 표현식 설정 방법](../alter/partition.md/#how-to-set-partition-expression) 섹션을 참고하십시오.

`IF EXISTS` 절을 지정하면, 컬럼이 존재하지 않더라도 쿼리가 오류를 반환하지 않습니다.

예:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```


## COMMENT COLUMN \{#comment-column\}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

컬럼에 주석을 추가합니다. `IF EXISTS` 절을 지정하면 컬럼이 존재하지 않더라도 쿼리가 오류를 반환하지 않습니다.

각 컬럼에는 주석을 하나만 설정할 수 있습니다. 해당 컬럼에 이미 주석이 있는 경우 새 주석이 기존 주석을 덮어씁니다.

주석은 [DESCRIBE TABLE](/sql-reference/statements/describe-table.md) 쿼리가 반환하는 `comment_expression` 컬럼에 저장됩니다.

예제:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```


## MODIFY COLUMN \{#modify-column\}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

이 쿼리는 `name` 컬럼 속성을 변경합니다:

* 타입

* 기본 표현식

* 압축 코덱

* TTL

* 컬럼 수준 설정

컬럼 압축 코덱 변경 예시는 [Column Compression Codecs](../create/table.md/#column_compression_codec)를 참조하십시오.

컬럼 TTL 변경 예시는 [Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)을 참조하십시오.

컬럼 수준 설정 변경 예시는 [Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)을 참조하십시오.

`IF EXISTS` 절이 지정되면, 컬럼이 존재하지 않더라도 쿼리는 오류를 반환하지 않습니다.

타입을 변경할 때는 [toType](/sql-reference/functions/type-conversion-functions.md) 함수가 적용된 것처럼 값이 변환됩니다. 기본 표현식만 변경되는 경우, 쿼리는 복잡한 작업을 수행하지 않으며 거의 즉시 완료됩니다.

예시:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

컬럼 타입을 변경하는 것만이 유일하게 복잡한 작업입니다. 데이터가 들어 있는 파일의 내용을 실제로 변경하기 때문입니다. 큰 테이블에서는 이 작업에 오랜 시간이 걸릴 수 있습니다.

또한 이 쿼리는 `FIRST | AFTER` 절을 사용해 컬럼의 순서를 변경할 수도 있습니다. 자세한 내용은 [ADD COLUMN](#add-column) 설명을 참고하십시오. 단, 이 경우에는 컬럼 타입을 반드시 지정해야 합니다.

예:

```sql
CREATE TABLE users (
    c1 Int16,
    c2 String
) ENGINE = MergeTree
ORDER BY c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴

ALTER TABLE users MODIFY COLUMN c2 String FIRST;

DESCRIBE users;
┌─name─┬─type───┬
│ c2   │ String │
│ c1   │ Int16  │
└──────┴────────┴

ALTER TABLE users ALTER COLUMN c2 TYPE String AFTER c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴
```

`ALTER` 쿼리는 원자적입니다. MergeTree 테이블의 경우 잠금 없이(lock-free) 동작합니다.

컬럼을 변경하는 `ALTER` 쿼리는 복제됩니다. 명령은 ZooKeeper에 저장된 다음 각 레플리카가 이를 적용합니다. 모든 `ALTER` 쿼리는 동일한 순서로 실행됩니다. 쿼리는 다른 레플리카에서 해당 작업이 완료될 때까지 대기합니다. 그러나 복제된 테이블에서 컬럼을 변경하는 쿼리는 중단될 수 있으며, 이 경우 모든 작업은 비동기적으로 수행됩니다.

:::note
널 허용(Nullable) 컬럼을 널 비허용(Non-Nullable)으로 변경할 때는 주의해야 합니다. 해당 컬럼에 NULL 값이 존재하지 않는지 반드시 확인해야 합니다. NULL 값이 남아 있으면 이후 읽기 시 문제가 발생합니다. 이 경우에는 mutation을 중지(KILL)한 다음 컬럼을 다시 Nullable 타입으로 되돌리는 것이 하나의 우회 방법입니다.
:::


## MODIFY COLUMN REMOVE \{#modify-column-remove\}

다음 컬럼 속성 중 하나를 제거합니다: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`.

구문:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**예시**

TTL 제거:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**함께 보기**

* [REMOVE TTL](ttl.md)


## MODIFY COLUMN MODIFY SETTING \{#modify-column-modify-setting\}

컬럼 설정을 수정합니다.

구문:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**예시**

컬럼의 `max_compress_block_size`를 `1MB`로 변경하는 예시입니다:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```


## MODIFY COLUMN RESET SETTING \{#modify-column-reset-setting\}

컬럼의 SETTING을 초기화하며, 테이블 CREATE 쿼리의 컬럼 표현식에 있는 해당 SETTING 선언도 제거합니다.

구문:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**예시**

컬럼 설정 `max_compress_block_size`를 기본값으로 재설정합니다:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```


## MATERIALIZE COLUMN \{#materialize-column\}

`DEFAULT` 또는 `MATERIALIZED` 값 표현식을 가진 컬럼을 구체화합니다. `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED`를 사용하여 구체화된 컬럼을 추가하는 경우, 구체화된 값이 없는 기존 행은 자동으로 채워지지 않습니다. `MATERIALIZE COLUMN` SQL 문은 `DEFAULT` 또는 `MATERIALIZED` 표현식이 추가되거나 업데이트된 이후(이때는 메타데이터만 업데이트되고 기존 데이터는 변경되지 않음)에 기존 컬럼 데이터를 다시 쓰는 데 사용할 수 있습니다. 정렬 키에 있는 컬럼을 구체화하는 것은 정렬 순서를 깨뜨릴 수 있으므로 유효하지 않은 연산입니다.
[뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

새로 추가되었거나 업데이트된 `MATERIALIZED` 값 표현식을 가진 컬럼의 경우, 모든 기존 행이 다시 쓰입니다.

새로 추가되었거나 업데이트된 `DEFAULT` 값 표현식을 가진 컬럼의 경우, 동작은 ClickHouse 버전에 따라 다릅니다:

* ClickHouse &lt; v24.2에서는 모든 기존 행이 다시 쓰입니다.
* ClickHouse &gt;= v24.2에서는 `DEFAULT` 값 표현식을 가진 컬럼의 행 값이 삽입 시에 명시적으로 지정되었는지, 아니면 `DEFAULT` 값 표현식에서 계산되었는지를 구분합니다. 값이 명시적으로 지정된 경우 ClickHouse는 해당 값을 그대로 유지합니다. 값이 표현식에서 계산된 경우 ClickHouse는 이를 새로 추가되었거나 업데이트된 `MATERIALIZED` 값 표현식으로 변경합니다.

구문:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

* PARTITION을 지정하면, 컬럼은 지정한 파티션의 데이터만 머티리얼라이즈됩니다.

**예시**

```sql
DROP TABLE IF EXISTS tmp;
SET mutations_sync = 2;
CREATE TABLE tmp (x Int64) ENGINE = MergeTree() ORDER BY tuple() PARTITION BY tuple();
INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5;
ALTER TABLE tmp ADD COLUMN s String MATERIALIZED toString(x);

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM (select x,s from tmp order by x);

┌─groupArray(x)─┬─groupArray(s)─────────┐
│ [0,1,2,3,4]   │ ['0','1','2','3','4'] │
└───────────────┴───────────────────────┘

ALTER TABLE tmp MODIFY COLUMN s String MATERIALIZED toString(round(100/x));

INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5,5;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)──────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['0','1','2','3','4','20','17','14','12','11'] │
└───────────────────────┴────────────────────────────────────────────────┘

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)─────────────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['inf','100','50','33','25','20','17','14','12','11'] │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

**함께 보기**

* [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).


## 제한 사항 \{#limitations\}

`ALTER` 쿼리는 중첩 데이터 구조 전체가 아니라, 중첩 데이터 구조 안의 개별 요소(컬럼)를 생성하거나 삭제할 수 있습니다. 중첩 데이터 구조를 추가하려면 `name.nested_name`과 같은 이름과 `Array(T)` 타입의 컬럼을 추가하면 됩니다. 중첩 데이터 구조는 점(.) 앞부분의 접두사가 동일한 이름을 가진 여러 배열 컬럼과 동등합니다.

기본 키 또는 샘플링 키(`ENGINE` 표현식에서 사용되는 컬럼)의 컬럼 삭제는 지원되지 않습니다. 기본 키에 포함된 컬럼의 타입 변경은 이 변경이 데이터 수정으로 이어지지 않는 경우에만 가능합니다(예를 들어 Enum에 값을 추가하거나, `DateTime` 타입을 `UInt32` 타입으로 변경하는 것은 허용됩니다).

`ALTER` 쿼리만으로 필요한 테이블 변경을 수행하기 어려운 경우, 새 테이블을 생성한 다음 [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 쿼리를 사용해 데이터를 복사하고, 이후 [RENAME](/sql-reference/statements/rename.md/#rename-table) 쿼리를 사용해 테이블을 전환한 다음, 기존 테이블을 삭제할 수 있습니다.

`ALTER` 쿼리는 해당 테이블에 대한 모든 읽기와 쓰기를 차단합니다. 즉, `ALTER` 쿼리가 실행되는 시점에 긴 `SELECT` 쿼리가 실행 중이라면, `ALTER` 쿼리는 해당 쿼리가 완료될 때까지 대기합니다. 동시에 같은 테이블에 대한 새 쿼리도 이 `ALTER`가 실행되는 동안 모두 대기합니다.

자체적으로 데이터를 저장하지 않는 테이블(예: [Merge](/sql-reference/statements/alter/index.md) 및 [Distributed](/sql-reference/statements/alter/index.md))의 경우, `ALTER`는 테이블 구조만 변경하며, 하위 테이블의 구조는 변경하지 않습니다. 예를 들어 `Distributed` 테이블에 대해 ALTER를 실행하는 경우, 모든 원격 서버에 있는 테이블에 대해서도 `ALTER`를 실행해야 합니다.
