---
description: '쿼리의 외부 테이블 표현식이 반환하는 각 행마다 임의의 함수를 호출할 수 있게 해주는 APPLY 수정자를 설명하는 문서입니다.'
sidebar_label: 'APPLY'
slug: /sql-reference/statements/select/apply-modifier
title: 'APPLY 수정자'
keywords: ['APPLY', '수정자']
doc_type: 'reference'
---



# APPLY 수정자 \{#apply\}

> 쿼리의 바깥쪽 테이블 식이 반환하는 각 행에 대해 임의의 함수를 호출할 수 있도록 합니다.



## 구문 \{#syntax\}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```


## 예제 \{#example\}

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```
