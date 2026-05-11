---
description: 'DROP SQL 문 문서'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'DROP SQL 문'
doc_type: 'reference'
---

# DROP SQL 문 \{#drop-statements\}

기존 엔터티를 삭제합니다. `IF EXISTS` 절을 지정하면, 엔터티가 존재하지 않아도 해당 쿼리는 오류를 반환하지 않습니다. `SYNC` 수정자를 지정하면, 엔터티는 지연 없이 바로 삭제됩니다.

## DROP DATABASE \{#drop-database\}

`db` 데이터베이스 내의 모든 테이블을 삭제한 후 `db` 데이터베이스 자체를 삭제합니다.

구문:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE \{#drop-table\}

하나 이상의 테이블을 삭제합니다.

:::tip
삭제한 테이블을 되돌리려면 [UNDROP TABLE](/sql-reference/statements/undrop.md)을(를) 참조하십시오.
:::

구문:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

제한 사항:

* `IF EMPTY` 절이 지정된 경우, 서버는 쿼리를 수신한 레플리카에서만 해당 테이블이 비어 있는지 확인합니다.
* 여러 테이블을 한 번에 삭제하는 작업은 원자적 연산이 아닙니다. 즉, 어떤 테이블의 삭제가 실패하면 이후 테이블들은 삭제되지 않습니다.

## DROP DICTIONARY \{#drop-dictionary\}

딕셔너리를 삭제합니다.

구문:

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER \{#drop-user\}

사용자를 삭제합니다.

구문:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE \{#drop-role\}

역할(ROLE)을 삭제합니다. 삭제된 역할은 할당되어 있던 모든 개체에서 취소(revoke)됩니다.

구문:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY \{#drop-row-policy\}

ROW POLICY를 삭제합니다. 삭제된 ROW POLICY는 더 이상 할당되어 있던 어떤 엔터티에도 적용되지 않습니다.

구문:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP MASKING POLICY \{#drop-masking-policy\}

마스킹 정책을 삭제합니다.

구문은 다음과 같습니다:

```sql
DROP MASKING POLICY [IF EXISTS] name ON [database.]table [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA \{#drop-quota\}

QUOTA를 삭제합니다. 삭제된 QUOTA는 할당되어 있던 모든 개체에서 해제됩니다.

구문:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE \{#drop-settings-profile\}

`SETTINGS PROFILE`을 삭제합니다. 삭제된 `SETTINGS PROFILE`은 할당되어 있던 모든 엔터티에서 제거됩니다.

구문:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW \{#drop-view\}

뷰를 삭제합니다. 뷰는 `DROP TABLE` 명령으로도 삭제할 수 있지만, `DROP VIEW` 명령은 `[db.]name`이 뷰인지 확인합니다.

구문:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION \{#drop-function\}

[CREATE FUNCTION](./create/function.md)으로 생성한 사용자 정의 FUNCTION을 삭제합니다.
시스템 FUNCTION은 삭제할 수 없습니다.

**구문**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**예제**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION \{#drop-named-collection\}

Named Collection(네임드 컬렉션)을 삭제합니다.

**구문**

```sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**예제**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
