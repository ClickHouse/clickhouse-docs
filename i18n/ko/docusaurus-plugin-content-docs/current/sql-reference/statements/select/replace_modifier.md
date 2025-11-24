---
'description': '쿼리의 외부 테이블 표현에서 반환된 각 행에 대해 일부 함수를 호출할 수 있도록 해주는 APPLY 수정자에 대한 문서입니다.'
'sidebar_label': 'REPLACE'
'slug': '/sql-reference/statements/select/replace-modifier'
'title': '교체 수정자'
'keywords':
- 'REPLACE'
- 'modifier'
'doc_type': 'reference'
---


# Replace modifier {#replace}

> 하나 이상의 [표현식 별칭](/sql-reference/syntax#expression-aliases)을 지정할 수 있게 해줍니다.

각 별칭은 `SELECT *` 문장에서 컬럼 이름과 일치해야 합니다. 출력 컬럼 목록에서 별칭과 일치하는 컬럼은 해당 `REPLACE`의 표현식으로 대체됩니다.

이 수정자는 컬럼의 이름이나 순서를 변경하지 않습니다. 그러나 값과 값의 유형을 변경할 수 있습니다.

**구문:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**예시:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
