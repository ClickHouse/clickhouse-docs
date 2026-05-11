---
title: 'ClickHouse는 어떤 SQL 구문을 지원하나요?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/sql
description: 'ClickHouse는 SQL 구문을 100% 지원합니다'
doc_type: 'reference'
keywords: ['SQL 구문', 'ANSI SQL']
---

# ClickHouse는 어떤 SQL 구문을 지원합니까? \{#what-sql-syntax-does-clickhouse-support\}

ClickHouse는 다음과 같은 기능을 포함하여 SQL 구문을 완전히 지원합니다:

* SQL/JSON 및 JSON 데이터 타입(JSON data type)(SQL-2023)
* 윈도 함수(Window functions)(SQL-2003)
* 공통 테이블 표현식(common table expressions) 및 재귀 쿼리(SQL-1999)
* ROLLUP, CUBE, GROUPING SETS(SQL-1999)
* RBAC에 대한 완전한 지원(SQL-1999)
* 상관 서브쿼리(correlated subqueries)(SQL-1992);

이 지원은 TPC-H 및 TPC-DS 벤치마크와 SQLTest를 통해 검증되었습니다.

ClickHouse는 다음과 같이 이후 ISO/IEC에서 표준화되기 전에 많은 기능을 먼저 도입했습니다:

* 조건부 집계 함수
* `any` 집계 함수
* `least` 및 `greatest`
* `GROUP BY ALL`
* 별칭(alias)의 확장된 사용
* 숫자 리터럴에서의 밑줄 사용

ClickHouse는 다음과 같은 주요 사용성 향상 기능을 도입하여 SQL을 확장합니다:

* 별칭의 제약 없는 사용
* WITH 절 내부의 별칭
* 집계 함수 결합자(aggregate function combinators)
* 매개변수화된 집계 함수
* 근사 집계 함수
* 네이티브 및 대정수형 숫자 데이터 타입, 확장 정밀도의 decimal
* 배열 조작을 위한 고차 함수(higher order functions)
* ARRAY JOIN 절 및 arrayJoin 함수
* 배열 집계
* LIMIT BY 절
* GROUP BY WITH TOTALS
* AS OF JOIN
* ANY/ALL JOIN
* JSON에 대한 자연스러운 구문
* 컬럼 목록에서의 후행 쉼표(trailing comma)
* FROM ... SELECT 절 순서
* 타입 안전 쿼리 매개변수 및 매개변수화된 뷰(parameterized views)

이들 중 일부는 향후 SQL 표준에 포함될 가능성이 있으며, 이미 ClickHouse 사용자에게 제공되고 있습니다.