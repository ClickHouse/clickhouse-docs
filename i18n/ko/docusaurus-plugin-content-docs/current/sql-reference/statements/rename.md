---
'description': 'RENAME 문에 대한 문서'
'sidebar_label': 'RENAME'
'sidebar_position': 48
'slug': '/sql-reference/statements/rename'
'title': 'RENAME 문'
'doc_type': 'reference'
---


# RENAME 문

데이터베이스, 테이블 또는 딕셔너리의 이름을 변경합니다. 여러 엔티티를 단일 쿼리에서 이름을 변경할 수 있습니다. 
여러 엔티티와 함께 `RENAME` 쿼리는 비원자적 작업임을 유의하십시오. 엔티티 이름을 원자적으로 스왑하려면 [EXCHANGE](./exchange.md) 문을 사용하십시오.

**구문**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```

## RENAME DATABASE {#rename-database}

데이터베이스의 이름을 변경합니다.

**구문**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE {#rename-table}

하나 이상의 테이블의 이름을 변경합니다.

테이블 이름 변경은 경량 작업입니다. `TO` 뒤에 다른 데이터베이스를 지정하면, 해당 테이블은 이 데이터베이스로 이동합니다. 그러나 데이터베이스가 있는 디렉토리는 동일한 파일 시스템 내에 있어야 합니다. 그렇지 않으면 오류가 반환됩니다. 
하나의 쿼리에서 여러 테이블의 이름을 변경하면, 작업은 원자적이지 않습니다. 부분적으로 실행될 수 있으며, 다른 세션의 쿼리는 `Table ... does not exist ...` 오류를 받을 수 있습니다.

**구문**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**예제**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

더 간단한 SQL을 사용할 수도 있습니다:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

하나 또는 여러 개의 딕셔너리의 이름을 변경합니다. 이 쿼리는 딕셔너리를 데이터베이스 간에 이동하는 데 사용할 수 있습니다.

**구문**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**참고**

- [Dictionaries](../../sql-reference/dictionaries/index.md)
