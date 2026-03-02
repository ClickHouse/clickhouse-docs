---
description: 'QUOTA에 대한 문서'
sidebar_label: 'QUOTA'
sidebar_position: 46
slug: /sql-reference/statements/alter/quota
title: 'ALTER QUOTA'
doc_type: 'reference'
---

QUOTA를 변경합니다.

구문:

```sql
ALTER QUOTA [IF EXISTS] name [ON CLUSTER cluster_name]
    [RENAME TO new_name]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

키 `user_name`, `ip_address`, `client_key`, `client_key, user_name`, `client_key, ip_address`는 [system.quotas](../../../operations/system-tables/quotas.md) 테이블의 필드에 해당합니다.

매개변수 `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `execution_time`는 [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md) 테이블의 필드에 해당합니다.

`ON CLUSTER` 절을 사용하면 클러스터에서 QUOTA를 생성할 수 있습니다. 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참고하십시오.

**예시**

현재 사용자에 대해 15개월 동안 최대 123개의 쿼리만 허용하도록 제약을 설정합니다:

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

기본 사용자에 대해 30분 동안 최대 실행 시간을 0.5초로 제한하고, 5쿼터(quarter) 동안 최대 쿼리 수를 321개로, 최대 오류 수를 10개로 제한하십시오.

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
