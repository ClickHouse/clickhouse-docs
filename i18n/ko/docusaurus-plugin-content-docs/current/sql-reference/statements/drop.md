---
'description': 'DROP 문에 대한 문서'
'sidebar_label': 'DROP'
'sidebar_position': 44
'slug': '/sql-reference/statements/drop'
'title': 'DROP 문'
'doc_type': 'reference'
---


# DROP 문

기존 엔터티를 삭제합니다. `IF EXISTS` 절이 지정된 경우, 엔터티가 존재하지 않으면 오류를 반환하지 않습니다. `SYNC` 수정자가 지정된 경우, 엔터티는 지체 없이 삭제됩니다.

## DROP DATABASE {#drop-database}

`db` 데이터베이스 내의 모든 테이블을 삭제한 후, `db` 데이터베이스 자체를 삭제합니다.

구문:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

하나 이상의 테이블을 삭제합니다.

:::tip
테이블 삭제를 취소하려면 [UNDROP TABLE](/sql-reference/statements/undrop.md)를 참조하세요.
:::

구문:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

제한 사항:
- `IF EMPTY` 절이 지정된 경우, 서버는 쿼리를 받은 복제본에서만 테이블의 비어있음을 확인합니다.
- 여러 테이블을 동시에 삭제하는 것은 원자적 작업이 아니므로, 테이블 삭제가 실패할 경우 이후의 테이블은 삭제되지 않습니다.

## DROP DICTIONARY {#drop-dictionary}

딕셔너리를 삭제합니다.

구문:

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

사용자를 삭제합니다.

구문:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

역할을 삭제합니다. 삭제된 역할은 할당된 모든 엔터티에서 취소됩니다.

구문:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

행 정책을 삭제합니다. 삭제된 행 정책은 할당된 모든 엔터티에서 취소됩니다.

구문:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

쿼터를 삭제합니다. 삭제된 쿼터는 할당된 모든 엔터티에서 취소됩니다.

구문:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

설정 프로파일을 삭제합니다. 삭제된 설정 프로파일은 할당된 모든 엔터티에서 취소됩니다.

구문:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

뷰를 삭제합니다. 뷰는 `DROP TABLE` 명령으로도 삭제할 수 있지만, `DROP VIEW`는 `[db.]name`이 뷰인지 확인합니다.

구문:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

[CREATE FUNCTION](./create/function.md)으로 생성된 사용자 정의 함수를 삭제합니다. 시스템 함수는 삭제할 수 없습니다.

**구문**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**예제**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION {#drop-named-collection}

명명된 컬렉션을 삭제합니다.

**구문**

```sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**예제**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
