---
description: '값 0을 가진 `dummy` UInt8 컬럼 1개와 행 1개만 포함하는 시스템 테이블입니다. 다른 DBMS에서 제공되는 `DUAL` 테이블과 유사합니다.'
keywords: ['system table', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one \{#systemone\}

이 테이블에는 값 0이 들어 있는 `dummy` UInt8 컬럼 하나를 가진 단일 행이 포함되어 있습니다.

이 테이블은 `SELECT` 쿼리에 `FROM` 절이 지정되지 않은 경우 사용됩니다.

이는 다른 DBMS에서 사용되는 `DUAL` 테이블과 유사합니다.

**예시**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 rows in set. Elapsed: 0.001 sec.
```
