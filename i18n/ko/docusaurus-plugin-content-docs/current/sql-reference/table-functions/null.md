---
description: 'Null 테이블 엔진을 사용하여 지정한 구조의 임시 테이블을 생성합니다. 이 함수는 테스트 작성 및 데모를 보다 편리하게 하기 위해 사용됩니다.'
sidebar_label: 'null 함수'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---



# null Table Function \{#null-table-function\}

지정된 구조를 가진 [Null](../../engines/table-engines/special/null.md) 테이블 엔진을 사용하는 임시 테이블을 생성합니다. `Null` 엔진의 속성상 테이블 데이터는 무시되며, 쿼리 실행 직후 테이블 자체가 즉시 삭제됩니다. 이 함수는 테스트 작성 및 데모를 보다 편리하게 수행하기 위해 사용됩니다.



## 구문 \{#syntax\}

```sql
null('structure')
```


## 인수 \{#argument\}

- `structure` — 컬럼 및 컬럼 타입 목록입니다. [String](../../sql-reference/data-types/string.md).



## 반환 값 \{#returned_value\}

지정된 구조의 임시 `Null` 엔진 테이블입니다.



## 예시 \{#example\}

`null` 함수를 사용한 쿼리:

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```

세 가지 쿼리를 대체할 수 있습니다:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```


## 관련 항목 \{#related\}

- [Null 테이블 엔진](../../engines/table-engines/special/null.md)
