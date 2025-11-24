---
'description': '주어진 쿼리 문자열을 무작위 변형으로 섞습니다.'
'sidebar_label': 'fuzzQuery'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzQuery'
'title': 'fuzzQuery'
'doc_type': 'reference'
---


# fuzzQuery 테이블 함수

주어진 쿼리 문자열을 무작위 변형으로 방해합니다.

## 문법 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 인수 {#arguments}

| 인수                | 설명                                                                     |
|---------------------|--------------------------------------------------------------------------|
| `query`             | (문자열) - 퍼지 처리할 소스 쿼리입니다.                                     |
| `max_query_length`  | (UInt64) - 퍼지 처리 과정에서 쿼리가 가질 수 있는 최대 길이입니다.         |
| `random_seed`       | (UInt64) - 안정적인 결과를 생성하기 위한 무작위 시드입니다.                  |

## 반환 값 {#returned_value}

변형된 쿼리 문자열이 포함된 단일 컬럼을 가진 테이블 객체입니다.

## 사용 예제 {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
