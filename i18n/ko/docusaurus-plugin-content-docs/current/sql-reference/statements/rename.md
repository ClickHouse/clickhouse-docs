---
description: 'RENAME SQL 문 문서'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: /sql-reference/statements/rename
title: 'RENAME SQL 문'
doc_type: 'reference'
---

# RENAME Statement \{#rename-statement\}

데이터베이스, 테이블 또는 딕셔너리의 이름을 변경합니다. 하나의 쿼리에서 여러 개체의 이름을 변경할 수 있습니다.
여러 개체를 대상으로 하는 `RENAME` 쿼리는 원자적 연산이 아닙니다. 개체 이름을 원자적으로 교환하려면 [EXCHANGE](./exchange.md) 문을 사용하십시오.

**문법**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```

## RENAME DATABASE \{#rename-database\}

데이터베이스의 이름을 변경합니다.

**구문**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE \{#rename-table\}

하나 이상의 테이블 이름을 변경합니다.

테이블 이름 변경은 비용이 적게 드는 작업입니다. `TO` 뒤에 다른 데이터베이스를 지정하면 테이블이 해당 데이터베이스로 이동됩니다. 단, 데이터베이스 디렉터리는 동일한 파일 시스템에 있어야 합니다. 그렇지 않으면 오류가 발생합니다.
하나의 쿼리에서 여러 테이블 이름을 변경하는 경우 이 작업은 원자적(atomic)이지 않습니다. 일부만 실행될 수 있으며, 다른 세션의 쿼리는 `Table ... does not exist ...` 오류를 받을 수 있습니다.

**구문**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**예제**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

또는 더 간단한 SQL 문을 사용할 수 있습니다:

```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY \{#rename-dictionary\}

하나 또는 여러 개의 딕셔너리 이름을 변경합니다. 이 쿼리는 딕셔너리를 데이터베이스 간에 이동할 때 사용할 수 있습니다.

**구문**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**관련 문서**

* [Dictionaries](./create/dictionary/overview.md)
