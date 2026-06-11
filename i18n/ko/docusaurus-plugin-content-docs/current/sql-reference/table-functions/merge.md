---
description: '임시 Merge 테이블을 생성합니다. 구조는 기본 테이블들의 컬럼 합집합을 사용하고 공통 타입을 도출하여 생성됩니다.'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
doc_type: 'reference'
---

임시 [Merge](../../engines/table-engines/special/merge.md) 테이블을 생성합니다.
테이블 스키마는 기본 테이블들의 컬럼 합집합을 취하고 공통 타입을 도출하여 생성됩니다.
동일한 가상 컬럼을 [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진과 동일하게 사용할 수 있습니다.

## 구문 \{#syntax\}

```sql
merge(['db_name',] 'tables_regexp')
```

## 인수 \{#arguments\}

| 인수              | 설명                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `db_name`       | 가능한 값(선택 사항, 기본값은 `currentDatabase()`):<br />    - 데이터베이스 이름,<br />    - 예를 들어 `currentDatabase()``와` 같이 데이터베이스 이름 문자열을 반환하는 상수 표현식,<br />    - `REGEXP(expression)`: 여기서 `expression`은 DB 이름과 일치시키기 위한 정규 표현식입니다. |
| `tables_regexp` | 지정된 하나 이상의 DB에서 테이블 이름과 일치시키기 위한 정규 표현식입니다.                                                                                                                                                                        |

## 관련 항목 \{#related\}

* [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진