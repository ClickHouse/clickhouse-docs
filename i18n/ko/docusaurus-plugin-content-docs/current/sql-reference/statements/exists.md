---
description: 'EXISTS SQL 문 문서'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'EXISTS SQL 문'
doc_type: 'reference'
---

# EXISTS 문 \{#exists-statement\}

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

단일 `UInt8` 타입의 컬럼을 하나 반환하며, 지정된 데이터베이스에서 테이블이나 데이터베이스가 존재하지 않으면 값 `0`을, 해당 데이터베이스에 테이블이 존재하면 값 `1`을 포함합니다.
