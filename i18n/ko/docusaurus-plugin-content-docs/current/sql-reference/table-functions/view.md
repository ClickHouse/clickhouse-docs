---
description: '하위 쿼리 결과를 테이블로 변환합니다. 이 함수는 뷰를 구현합니다.'
sidebar_label: 'view'
sidebar_position: 210
slug: /sql-reference/table-functions/view
title: 'view'
doc_type: 'reference'
---



# view Table Function \{#view-table-function\}

서브쿼리를 테이블로 변환합니다. 이 함수는 뷰(View)를 구현합니다([CREATE VIEW](/sql-reference/statements/create/view) 참조). 결과 테이블은 데이터를 저장하지 않고, 지정된 `SELECT` 쿼리만 저장합니다. 테이블에서 데이터를 읽을 때 ClickHouse는 해당 쿼리를 실행하고 결과에서 불필요한 컬럼을 모두 제거합니다.



## 구문 \{#syntax\}

```sql
view(subquery)
```


## 인수 \{#arguments\}

- `subquery` — `SELECT` 쿼리.



## 반환 값 \{#returned_value\}

- 테이블



## 예제 \{#examples\}

입력 테이블:

```text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

쿼리:

```sql
SELECT * FROM view(SELECT name FROM months);
```

결과:

```text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

`view` 함수를 [remote](/sql-reference/table-functions/remote) 및 [cluster](/sql-reference/table-functions/cluster) 테이블 함수의 인수로 사용할 수 있습니다.

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```


## 관련 문서 \{#related\}

- [View 테이블 엔진](/engines/table-engines/special/view/)
