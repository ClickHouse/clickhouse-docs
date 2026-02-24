---
description: 'QUOTA에 대한 문서'
sidebar_label: 'QUOTA'
sidebar_position: 42
slug: /sql-reference/statements/create/quota
title: 'CREATE QUOTA'
doc_type: 'reference'
---

사용자 또는 역할에 할당할 수 있는 [QUOTA](../../../guides/sre/user-management/index.md#quotas-management)를 생성합니다.

구문:

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | written_bytes | execution_time | failed_sequential_authentications} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

키 `user_name`, `ip_address`, `client_key`, `client_key, user_name`, `client_key, ip_address` 는 [system.quotas](../../../operations/system-tables/quotas.md) 테이블의 필드에 해당합니다.

매개변수 `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `written_bytes`, `execution_time`, `failed_sequential_authentications` 는 [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md) 테이블의 필드에 해당합니다.

`ON CLUSTER` 절을 사용하면 클러스터 수준에서 QUOTA를 생성할 수 있습니다. 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참조하십시오.

**예시**

현재 사용자에 대해 15개월 동안 최대 123개의 쿼리만 허용하는 제약을 설정합니다:

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

기본 사용자에 대해 30분 동안의 최대 실행 시간을 0.5초로 제한하고, 최대 쿼리 수는 321개로, 5쿼터(5 quarters) 동안 허용되는 최대 오류 수는 10개로 제한합니다:

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

XML 구성(ClickHouse Cloud에서는 지원되지 않음)을 사용하는 추가 예시는 [Quotas 가이드](/operations/quotas)에서 확인할 수 있습니다.


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse로 싱글 페이지 애플리케이션 구축하기](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
