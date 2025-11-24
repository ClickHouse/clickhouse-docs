---
'description': 'Quota에 대한 문서'
'sidebar_label': 'QUOTA'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/quota'
'title': 'ALTER QUOTA'
'doc_type': 'reference'
---

Changes quotas.

Syntax:

```sql
ALTER QUOTA [IF EXISTS] name [ON CLUSTER cluster_name]
    [RENAME TO new_name]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```
키 `user_name`, `ip_address`, `client_key`, `client_key, user_name` 및 `client_key, ip_address`는 [system.quotas](../../../operations/system-tables/quotas.md) 테이블의 필드에 해당합니다.

매개변수 `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `execution_time`은 [system.quotas_usage](../../../operations/system-tables/quotas_usage.md) 테이블의 필드에 해당합니다.

`ON CLUSTER` 절은 클러스터에서 쿼터를 생성할 수 있게 해 주며, [Distributed DDL](../../../sql-reference/distributed-ddl.md)를 참조하십시오.

**예제**

현재 사용자에 대해 15개월 제한 내에서 123개의 쿼리에 대한 최대 쿼리 수를 제한합니다:

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

기본 사용자에 대해 30분 내에 반 초의 최대 실행 시간을 제한하고, 5개 분기 내에 321개의 최대 쿼리 수와 10개의 최대 오류 수를 제한합니다:

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
