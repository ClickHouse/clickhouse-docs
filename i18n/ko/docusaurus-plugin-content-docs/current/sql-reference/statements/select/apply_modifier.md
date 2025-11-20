---
'description': '쿼리의 외부 테이블 표현식에 의해 반환된 각 행에 대해 일부 함수를 호출할 수 있게 해주는 APPLY 수정자에 대한 문서.'
'sidebar_label': 'APPLY'
'slug': '/sql-reference/statements/select/apply-modifier'
'title': 'APPLY 수정자'
'keywords':
- 'APPLY'
- 'modifier'
'doc_type': 'reference'
---


# APPLY modifier {#apply}

> 쿼리의 외부 테이블 표현식으로 반환된 각 행에 대해 일부 함수를 호출할 수 있습니다.

## Syntax {#syntax}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

## Example {#example}

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
