---
description: 'USE SQL 문에 대한 문서'
sidebar_label: 'USE'
sidebar_position: 53
slug: /sql-reference/statements/use
title: 'USE SQL 문'
doc_type: 'reference'
---

# USE 문 \{#use-statement\}

```sql
USE [DATABASE] db
```

세션의 현재 데이터베이스를 설정합니다.

현재 데이터베이스는 쿼리에서 `database.table` 형식으로 테이블 이름 앞에 점(.)을 사용해 데이터베이스가 명시적으로 지정되지 않은 경우 테이블을 검색할 때 사용됩니다.

HTTP 프로토콜에서는 세션 개념이 없으므로 이 쿼리를 실행할 수 없습니다.
