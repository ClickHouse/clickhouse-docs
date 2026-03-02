---
description: '지정된 쿼리 문자열을 무작위로 변형합니다.'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---



# fuzzQuery 테이블 함수 \{#fuzzquery-table-function\}

주어진 쿼리 문자열을 무작위로 변형합니다.



## 구문 \{#syntax\}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```


## 인수 \{#arguments\}

| Argument           | Description                                                        |
|--------------------|--------------------------------------------------------------------|
| `query`            | (String) - 퍼징을 수행할 원본 쿼리입니다.                           |
| `max_query_length` | (UInt64) - 퍼징 과정에서 쿼리가 가질 수 있는 최대 길이입니다.       |
| `random_seed`      | (UInt64) - 일관된 결과를 얻기 위해 사용하는 랜덤 시드입니다.         |



## 반환 값 \{#returned_value\}

변형된 쿼리 문자열을 포함하는 단일 컬럼을 가진 테이블 객체입니다.



## 사용 예 \{#usage-example\}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
