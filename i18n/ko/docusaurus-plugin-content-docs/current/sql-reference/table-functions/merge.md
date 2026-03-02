---
description: '임시 Merge 테이블을 생성합니다. 하위 테이블들의 컬럼 합집합과 공통 타입을 기반으로 테이블 구조가 결정됩니다.'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
doc_type: 'reference'
---



# merge 테이블 함수 \{#merge-table-function\}

임시 [Merge](../../engines/table-engines/special/merge.md) 테이블을 생성합니다.
테이블 스키마는 기본 테이블들의 컬럼 합집합을 취하고 공통 타입을 도출하여 생성됩니다.
동일한 가상 컬럼을 [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진과 동일하게 사용할 수 있습니다.



## 구문 \{#syntax\}



```sql
merge(['db_name',] 'tables_regexp')
```

## Arguments \{#arguments\}

| Argument        | Description                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `db_name`       | 가능한 값(옵션, 기본값은 `currentDatabase()`):<br />    - 데이터베이스 이름,<br />    - 데이터베이스 이름이 포함된 문자열을 반환하는 상수 표현식(예: `currentDatabase()`),<br />    - `REGEXP(expression)` 형태의 정규 표현식. 여기서 `expression`은 DB 이름과 매칭할 정규 표현식입니다. |
| `tables_regexp` | 지정된 하나 이상의 DB에서 테이블 이름과 매칭하기 위한 정규 표현식입니다.                                                                                                                                                                         |


## 관련 항목 \{#related\}

- [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진
