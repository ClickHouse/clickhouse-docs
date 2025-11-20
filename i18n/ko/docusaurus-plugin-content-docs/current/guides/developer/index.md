---
'slug': '/guides/developer/overview'
'sidebar_label': '고급 가이드 개요'
'description': '고급 가이드의 개요'
'title': '고급 가이드'
'keywords':
- 'ClickHouse advanced guides'
- 'developer guides'
- 'query optimization'
- 'materialized views'
- 'deduplication'
- 'time series'
- 'query execution'
'doc_type': 'guide'
---


# 고급 가이드

이 섹션은 다음과 같은 고급 가이드를 포함합니다:

| 가이드                                                                                                                  | 설명                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Alternative Query Languages](../developer/alternative-query-languages)                                         | 지원되는 대체 방언 및 사용 방법에 대한 가이드. 각 방언의 쿼리 예시를 제공합니다.                                                                                                                                                                                                                                   |
| [Cascading Materialized Views](../developer/cascading-materialized-views)                                       | 물리화된 뷰를 생성하고 이를 연결하여 여러 소스 테이블을 단일 목적지 테이블로 결합하는 방법에 대한 가이드. 도메인 이름 그룹에 대해 월 및 연도별로 데이터를 집계하기 위해 연결된 물리화된 뷰를 사용하는 예시가 포함되어 있습니다.                                                                              |
| [Debugging memory issues](../developer/debugging-memory-issues)                                                 | ClickHouse 내에서 메모리 문제를 디버깅하는 방법에 대한 가이드.                                                                                                                                                                                                                                                                                       |
| [Deduplicating Inserts on Retries](../developer/deduplicating-inserts-on-retries)                               | 실패한 삽입을 재시도할 경우의 상황을 처리하는 방법에 대한 가이드.                                                                                                                                                                                                                                                                      |
| [Deduplication strategies](../developer/deduplication)                                                          | 데이터 중복 제거에 대한 가이드로, 데이터베이스에서 중복된 행을 제거하는 기술입니다. OLTP 시스템에서의 기본 키 기반 중복 제거와 ClickHouse의 중복 제거 접근 방식, ClickHouse 쿼리 내에서 중복 데이터 시나리오를 처리하는 방법을 설명합니다.                                          |
| [Filling gaps in time-series data](../developer/time-series-filling-gaps)                                       | ClickHouse의 시간 시리즈 데이터 처리 기능에 대한 통찰을 제공하는 가이드로, 데이터의 결정을 채우기 위한 기술을 포함하여 시간 시리즈 정보의 보다 완전하고 연속적인 표현을 생성합니다.                                                                                                                |
| [Manage Data with TTL (Time-to-live)](../developer/ttl)                                                         | `WITH FILL` 절을 사용하여 시간 시리즈 데이터의 결정을 채우는 방법에 대한 가이드. 0 값으로 결정을 채우는 방법, 결정을 채우기 위한 시작점을 지정하는 방법, 특정 종료 지점까지 결정을 채우는 방법, 누적 계산을 위한 값을 보간하는 방법이 포함되어 있습니다.                                                     |
| [Stored procedures & query parameters](../developer/stored-procedures-and-prepared-statements)                  | ClickHouse가 전통적인 저장 프로시저를 지원하지 않음을 설명하고, 사용자 정의 함수(UDF), 매개변수화된 뷰, 물리화된 뷰 및 외부 오케스트레이션 등 권장 대안을 제공합니다. 안전한 매개변수화된 쿼리를 위한 쿼리 매개변수(준비된 문과 유사)에 대해서도 다룹니다.            |
| [Understanding query execution with the Analyzer](../developer/understanding-query-execution-with-the-analyzer) | 분석기 도구를 소개하여 ClickHouse 쿼리 실행을 분명하게 설명하는 가이드. 분석기가 쿼리를 일련의 단계로 나누는 방법을 설명하여 최적의 성능을 위한 전체 실행 프로세스를 시각화하고 문제를 해결할 수 있도록 합니다.                                                                               |
| [Using JOINs in ClickHouse](../joining-tables)                                                                  | ClickHouse에서 테이블을 조인하는 과정을 간소화하는 가이드. 다양한 조인 유형(`INNER`, `LEFT`, `RIGHT` 등)을 다루고, 왼쪽에 더 작은 테이블을 배치하는 것과 같은 효율적인 조인을 위한 모범 사례를 탐구하며, 복잡한 데이터 관계를 최적화하기 위한 ClickHouse의 내부 조인 알고리즘에 대한 통찰을 제공합니다. |
