---
description: '쿼리의 외부 테이블 식에서 반환되는 각 행마다 임의의 함수를 호출할 수 있도록 해 주는 APPLY 수정자를 설명하는 문서입니다.'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'Replace 수정자'
keywords: ['REPLACE', '수정자']
doc_type: 'reference'
---

# Replace 수정자 \{#replace\}

> 하나 이상의 [expression aliases](/sql-reference/syntax#expression-aliases)를 지정할 수 있습니다.

각 alias는 `SELECT *` 절의 컬럼 이름과 일치해야 합니다. 출력 컬럼 목록에서 alias와 일치하는 컬럼은 해당 `REPLACE`에 지정된 expression으로 대체됩니다.

이 수정자는 컬럼의 이름이나 순서를 변경하지 않습니다. 그러나 값과 값의 타입은 변경될 수 있습니다.

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
