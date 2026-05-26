---
slug: /cloud/managed-postgres/monitoring/query-insights
sidebar_label: '쿼리 인사이트'
title: 'Postgres 쿼리 인사이트'
description: 'Managed Postgres용 SQL 문별 텔레메트리: 데이터베이스에서 실행되는 모든 쿼리 패턴을 영향도 기준으로 순위를 매기고, 각 패턴이 느린 이유를 보여주는 진단 카운터를 제공합니다'
keywords: ['Managed Postgres', '쿼리 인사이트', 'pg_stat_ch', '느린 쿼리', 'p99 지연 시간', '쿼리 패턴', 'Postgres 성능', '임시 블록', '병렬 worker', 'wal']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import queryInsightsOverview from '@site/static/images/managed-postgres/monitoring/query-insights-overview.png';
import queryInsightsPatterns from '@site/static/images/managed-postgres/monitoring/query-insights-patterns.png';
import queryInsightsRecentQueries from '@site/static/images/managed-postgres/monitoring/query-insights-recent-queries.png';
import queryInsightsDetailAggregate from '@site/static/images/managed-postgres/monitoring/query-insights-detail-aggregate.png';
import queryInsightsDetailRecent from '@site/static/images/managed-postgres/monitoring/query-insights-detail-recent.png';

# Postgres 쿼리 인사이트 \{#postgres-query-insights\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.query-insights-beta" />

쿼리 인사이트는 [Managed Postgres](/cloud/managed-postgres) 인스턴스에서
SQL 문별 텔레메트리를 수집하고, 영향도를 기준으로 모든 쿼리
패턴의 우선순위를 매깁니다. 따라서 Cloud Console을 벗어나지 않고도
&quot;p99가 점점 증가하고 있습니다&quot;에서 &quot;이 패턴은 디스크로 스필되고 있습니다&quot;까지
바로 파악할 수 있습니다.

데이터는 오픈소스 Postgres 확장 기능인
[`pg_stat_ch`](https://github.com/clickhouse/pg_stat_ch)에서 가져오며,
이 확장 기능은 SQL 문별 카운터를 ClickHouse Cloud로 스트리밍합니다.
텔레메트리는 데이터베이스를 벗어나기 전에 Postgres 내부에서 정규화되며,
리터럴은 제거되고 플레이스홀더로 대체되므로 실제로 쿼리한 값이
텔레메트리 스트림에 그대로 들어가지는 않습니다.

## 쿼리 인사이트 열기 \{#open\}

Cloud Console에서 Managed Postgres 인스턴스를 열고 왼쪽 사이드바에서
**쿼리 인사이트**를 클릭하십시오. 이 페이지는 실제 사용 순서에 따라
다음 네 가지 영역으로 나뉩니다:

* 데이터베이스 상태를 한 화면에서 점검할 수 있는 **개요**.
* 데이터베이스에서 실행된 모든 쿼리 패턴을 의심되는 기준에 따라 정렬해
  순위를 보여주는 **느린 패턴** 테이블.
* 개별 실행 내역을 최신순으로 나열하는 **최근 쿼리** 패널.
* 단일 패턴의 모든 Counter를 집계하는 **세부정보 플라이아웃**.

상단의 **시간 범위** 선택기를 사용해 최근 15분, 1시간, 1일, 1주 또는
1개월로 전환하십시오. 집계 버킷 크기는 자동으로 조정됩니다. 최근 15분
또는 1시간은 1분 버킷, 최근 1일은 5분 버킷, 최근 1주 또는 1개월은 1시간
버킷이 적용되므로 차트 응답성이 유지됩니다.

## 개요 \{#overview\}

개요는 6개 패널로 구성된 3×2 격자입니다.

| 패널                           | 표시 내용                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| **Queries / sec**            | 선택한 구간을 기준으로 초당 비율로 환산한 쿼리 볼륨입니다.                                           |
| **Query latency**            | 평균, p50, p95, p99를 하나의 차트에 함께 표시하여, 상위 지연 시간이 중앙값에서 언제부터 벌어지는지 확인할 수 있습니다.  |
| **Operations breakdown**     | 실제 워크로드가 `SELECT`, `INSERT`, `UPDATE` 및 기타 작업으로 어떻게 구성되어 있는지 보여주는 도넛 차트입니다. |
| **Rows returned / affected** | 선택한 구간 동안 워크로드가 처리한 총 행 수입니다.                                               |
| **Buffer hit ratio**         | 공유 블록 적중 수와 공유 블록 읽기 수를 보여주는 도넛 차트이며, 범례에는 총 CPU 시간이 표시됩니다.                 |
| **Errors**                   | 시간에 따른 총 오류 수를 보여줍니다.                                                       |

이 화면 하나만으로도 데이터베이스가 정상 상태인지 파악할 수 있습니다. 정상적인 인스턴스는
전형적인 패턴을 보입니다. 버퍼 적중률은 90%대 후반을 유지하고, 쿼리 볼륨은
애플리케이션 트래픽에 맞춰 움직이며, 오류율은 일정하거나 0에 가깝고, 백분위수
지연 시간도 서로 비슷한 흐름을 보입니다.

<Image img={queryInsightsOverview} alt="초당 쿼리 수, 쿼리 지연 시간 백분위수, 작업 구성 도넛 차트, 반환/영향받은 행 영역 차트, 95.2%의 버퍼 적중률 도넛 차트, 오류 막대 차트로 이루어진 6개의 통계 카드를 보여주는 Query Insights 개요" size="lg" border />

## 느린 패턴 \{#slow-patterns\}

개요에서 문제가 감지되면 조사는 패턴 테이블에서 시작됩니다. 정규화된 쿼리 패턴별로 한 개의 행이 있으며, 리터럴은 제거되므로 동일한 SQL 문의 실행이 같은 행에 집계됩니다.

<Image img={queryInsightsPatterns} alt="Database, User, Operation, Calls, Errors, Avg latency, P95, Max latency, Total runtime, Rows returned, Cache hit 컬럼과 함께 정규화된 쿼리별로 한 개의 행을 보여주는 느린 쿼리 패턴 테이블" size="lg" border />

### 의심되는 항목을 기준으로 정렬하기 \{#sort\}

이 표는 기본적으로 **총 실행 시간** 기준 내림차순으로 정렬됩니다. 이렇게
정렬하면 맨 위에 오는 패턴이 대개 &quot;무엇이 가장 많은 비용을 유발하는가?&quot;에
대한 답이 됩니다. 다만 이것이 개별적으로 가장 느린 패턴이라는 뜻은 아닙니다.
하루에 800만 번 실행되고 12밀리초가 걸리는 쿼리가, 3초가 걸렸지만 한 번만
실행된 쿼리보다 더 중요할 수 있습니다.

각 정렬은 서로 다른 관점을 제공합니다:

* **총 실행 시간** — 데이터베이스가 가장 많은 실제 경과 시간을 소비한 위치입니다.
* **CPU 시간** — 컴퓨트 사용량이 많은 패턴입니다.
* **호출 수** — 호출 빈도가 높은 패턴입니다.
* **오류** — 반복적으로 실패하는 패턴입니다.
* **평균 / P50 / P95 / P99 / 최대 지연 시간** — 백분위수 기준의 이상치입니다.
* **반환된 행 수**, **읽은 블록 수**, **적중한 블록 수**, **WAL 바이트 수** —
  엔진, 캐시 또는 선행 기록 로그를 통해 가장 많은 데이터를 이동시킨
  패턴입니다.

추가 컬럼을 표시하거나 숨기려면 **Columns** 버튼을 클릭하십시오.
패턴 표에는 백분위수 세부 정보, 캐시 적중률, 패턴별 CPU 시간을 포함해
총 19개의 컬럼이 있습니다.

### 테이블 범위 좁히기 \{#filters\}

조사 중인 워크로드의 원하는 범위만 보이도록 테이블을
필터링합니다:

* **데이터베이스**
* **사용자**
* **작업** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, …)
* **애플리케이션** — `connection string`의 `application_name`

&quot;orders service가 `sales` DB에서 수행하는 작업만 보여줘&quot;
라는 요청은 드롭다운 2개로 표현됩니다. 필터 값은 인스턴스에서
실제로 실행된 항목을 기준으로 자동으로 채워집니다.

## 최근 쿼리 \{#recent-queries\}

패턴 테이블 아래의 **최근 쿼리** 패널에는 개별 실행이
시간 역순으로 나열됩니다. 즉, 패턴당 한 행이 아니라 실행된
SQL 문당 한 행이 표시됩니다. 집계된 정보가 아니라 원시 이벤트
스트림이 필요할 때 사용하십시오. 예를 들어 수정 사항이
적용되었는지 확인하거나 오류가 정확히 발생한 시점을 찾는 데
유용합니다.

<Image img={queryInsightsRecentQueries} alt="Database, User, Operation, Application 필터 드롭다운과 Time, Operation, Query, Duration, Rows, Database, User, Blks read 컬럼이 있는 최근 쿼리 테이블" size="lg" border />

기본 컬럼은 Time, Operation, Query, Duration, Rows,
Database, User, Blks read입니다. **Columns** 선택기에서
Application, Blks hit, CPU user, CPU sys, PID를 추가할 수 있습니다. 이
테이블은 패턴 테이블과 동일한 Database, User, Operation, Application
필터를 지원하며, Time, Duration, Rows, Blks read, CPU time을
기준으로 정렬할 수 있습니다.

아무 행이나 클릭하면 패턴 테이블과 동일한 세부 정보 플라이아웃이 열리며,
해당 단일 실행의 패턴 범위로 한정되어 표시됩니다.

## 세부 정보 플라이아웃 \{#detail\}

패턴 또는 최근 쿼리 테이블에서 아무 행이나 클릭하면 오른쪽에 **쿼리
세부 정보** 플라이아웃이 열립니다. 이 플라이아웃은 선택한 시간 범위에서
해당 패턴의 모든 실행을 가져와, 느린 원인을 설명하는 카운터를
집계합니다.

플라이아웃은 스크롤 가능한 단일 레이아웃으로 구성되며, 5개의 섹션으로 나뉩니다:

* **쿼리 패턴** — 리터럴을 `$1`,
  `$2`, …로 대체한 정규화된 SQL과 클립보드에 복사하는 버튼입니다.
* **집계된 리소스 사용량** — 총
  호출 수, 평균/P95/P99/최대 지연 시간, 총 실행 시간, 반환된 행 수, 캐시
  적중률, 읽은 블록 수, 적중한 블록 수, CPU 시간, WAL 바이트, 오류를 포함하는
  13개의 통계 카드 그리드입니다.
* **쿼리 Context** — 이 패턴이 발생한
  데이터베이스, 사용자, 작업, 애플리케이션입니다.
* **주목할 만한 실행** — 오류, 비정상적으로 느린 실행,
  대량 결과를 반환한 실행이 전체 최근 목록보다 먼저 표시됩니다.
* **최근 실행** — 동일한 패턴의 개별 실행이며,
  실행별 카운터가 포함됩니다.

<Image img={queryInsightsDetailAggregate} alt="쿼리 패턴 코드 블록과 총 호출 수, 지연 시간 백분위수, 총 실행 시간, 반환된 행 수, 캐시 적중률, 읽은 블록 수, 적중한 블록 수, CPU 시간, WAL 바이트, 오류를 포함한 13개의 통계 카드가 있는 집계된 리소스 사용량 그리드를 보여주는 쿼리 세부 정보 플라이아웃" size="md" border />

<Image img={queryInsightsDetailRecent} alt="계속되는 쿼리 세부 정보 플라이아웃으로, 데이터베이스, 사용자, 작업, 애플리케이션이 있는 쿼리 Context 섹션과 타임스탬프, OK 상태, 서버 역할, 호스트 ID, 실행별 Duration, 행 수, 캐시 적중, CPU, 읽은 공유 블록 수, 적중한 공유 블록 수 카운터가 있는 최근 실행 카드를 보여줍니다" size="md" border />

### 실행별 카운터 \{#counters\}

최근 실행 하나를 펼치면 시간이 어디에 쓰였는지 정확히 보여주는
카운터를 확인할 수 있습니다:

* **공유 블록** — 읽기와 히트는 항상 표시되며, 쓰기와 더티 수치는
  0이 아닐 때만 표시됩니다.
* **로컬 및 임시 블록 작업** — 임시 블록 작업 값이 0이 아니면 정렬 또는
  hash가 디스크로 spill되었음을 의미합니다.
* **읽기 / 쓰기 시간** — CPU 시간과 별도로 표시되는 I/O 시간입니다.
* **CPU 시간** — 사용자 시간과 시스템 시간이 각각 따로 표시됩니다.
* **병렬 worker** — 계획된 수와 실제로 시작된 수를 보여줍니다.
* **JIT** — 전체 JIT 컴파일 시간과 함수 수입니다.
* **WAL** — 바이트 수와 레코드 수입니다.

느린 패턴을 진단하는 데 필요한 모든 정보를 한곳, 한 화면에서
확인할 수 있습니다.

## 작동 원리 \{#how-it-works\}

### 전송 전에 Postgres에서 정규화됩니다 \{#how-normalized\}

`pg_stat_ch`는 parse-analyze 단계를 가로채 각 리터럴을
플레이스홀더(`$1`, `$2`, …)로 바꾸고, 그 결과 패턴을
`queryid`를 키로 사용하는 백엔드별 LRU에 캐시합니다. 실행기(executor)가
SQL 문(statement) 실행을 마치면 이벤트에는 이 캐시된 패턴이 첨부됩니다. 값이 포함된
정확한 SQL 문(statement)은 데이터베이스 밖으로 절대 나가지 않습니다.

### 데이터베이스에 부담을 주지 않도록 \{#how-overhead\}

프로듀서는 SQL 문(statement)당 약 3%의 오버헤드를 추가합니다. enqueue 경로는
공유 메모리 링 버퍼에서 비차단 try-lock을 사용합니다. 부하가 걸리면
확장 기능은 Postgres에 백프레셔를 주는 대신 이벤트를 버리고 이를 카운터로
기록합니다.

### 집계가 아닌 원시 이벤트 \{#how-raw-events\}

`pg_stat_ch`는 샘플링이 적용되는 환경에서 실행된 각 SQL 문(최상위 및
중첩)마다 원시 이벤트 1개를 내보냅니다. UI의 모든 백분위수, 순위, 세부 분석은
모두 동일한 이벤트 스트림을 대상으로 하는 ClickHouse 쿼리입니다.

### 고객이 사용하는 것과 동일한 엔진 \{#how-engine\}

Insights 백엔드는 [ClickHouse Cloud](/cloud/overview)입니다.
활발하게 사용되는 Postgres 인스턴스에서 발생하는 쿼리별 텔레메트리는 하루에
수백만 행에 달합니다. 열 지향 압축을 통해 실행별 세부 정보를 수개월 동안
저렴하게 보관할 수 있으며, 수십억 행에 대한 1초 미만의 집계 덕분에
1주일 또는 1개월 단위로 나누어 살펴보는 동안에도 UI의 반응성이 유지됩니다.

### 오픈 소스 \{#how-open-source\}

`pg_stat_ch`는 Apache 2.0 라이선스를 따릅니다. 모든 Postgres에서 실행할 수 있으며, 모든
ClickHouse로 전송할 수 있습니다. 소스 코드와 이슈는
[github.com/clickhouse/pg&#95;stat&#95;ch](https://github.com/clickhouse/pg_stat_ch)에서 확인할 수 있습니다.

## 관련 페이지 \{#related\}

* [모니터링 대시보드](/cloud/managed-postgres/monitoring/dashboard) — 기본 제공되는 리소스 및 활동 차트
* [Prometheus 엔드포인트](/cloud/managed-postgres/monitoring/prometheus) — 호스트 수준 메트릭을 자체 관측성 스택으로 스크레이프
* [확장 기능](/cloud/managed-postgres/extensions) — Managed Postgres 인스턴스에서 사용할 수 있는 확장 기능
* [`pg_stat_ch` on GitHub](https://github.com/clickhouse/pg_stat_ch) — 쿼리 인사이트를 구동하는 오픈소스 확장 기능