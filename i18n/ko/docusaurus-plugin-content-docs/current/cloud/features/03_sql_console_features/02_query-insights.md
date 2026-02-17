---
sidebar_title: '쿼리 인사이트'
slug: /cloud/get-started/query-insights
description: 'system.query_log 데이터를 시각화하여 쿼리 디버깅과 성능 최적화를 보다 쉽게 수행할 수 있도록 합니다'
keywords: ['쿼리 인사이트', '쿼리 로그', '쿼리 로그 UI', 'system.query_log 인사이트']
title: '쿼리 인사이트'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# 쿼리 인사이트 \{#query-insights\}

**쿼리 인사이트(Query Insights)** 기능은 다양한 시각화와 테이블을 통해 ClickHouse의 내장 쿼리 로그를 보다 쉽게 활용할 수 있도록 해줍니다. ClickHouse의 `system.query_log` 테이블은 쿼리 최적화, 디버깅, 전체 클러스터 상태와 성능 모니터링을 위한 주요 정보 원천입니다.



## 쿼리 개요 \{#query-overview\}

서비스를 선택하면 왼쪽 사이드바의 **Monitoring** 탐색 항목이 확장되어 새로운 **Query insights** 하위 항목이 표시됩니다. 이 옵션을 클릭하면 새로운 **Query insights** 페이지가 열립니다:

<Image img={insights_overview} size="md" alt="Query Insights UI 개요" border/>



## 최상위 메트릭 \{#top-level-metrics\}

상단의 통계 박스에는 선택한 기간 동안의 기본적인 상위 수준 쿼리 메트릭이 표시됩니다. 그 아래에는 선택한 시간 범위에 대해 쿼리 종류(select, insert, other)별로 구분된 쿼리 볼륨, 지연 시간(latency), 오류율을 보여주는 3개의 시계열 차트가 제공됩니다. 지연 시간 차트는 p50, p90, p99 지연 시간으로 표시되도록 추가로 조정할 수 있습니다:

<Image img={insights_latency} size="md" alt="Query Insights UI Latency Chart" border/>



## 최근 쿼리 \{#recent-queries\}

상위 메트릭 아래에는 선택한 시간 범위 동안의 쿼리 로그 항목을 (정규화된 쿼리 해시와 USER 기준으로 그룹화하여) 표시하는 테이블이 있습니다.

<Image img={insights_recent} size="md" alt="Query Insights UI Recent Queries Table" border/>

최근 쿼리는 사용 가능한 모든 필드를 기준으로 필터링하거나 정렬할 수 있습니다. 또한 테이블 정보, p90 및 p99 지연 시간과 같은 추가 필드를 표시하거나 숨기도록 테이블을 구성할 수 있습니다.



## Query drill-down \{#query-drill-down\}

최근 쿼리 테이블에서 쿼리를 선택하면 선택된 쿼리에 대한 메트릭과 정보가 포함된 플라이아웃 패널이 열립니다:

<Image img={insights_drilldown} size="md" alt="Query Insights UI 쿼리 드릴다운" border/>

플라이아웃에서 볼 수 있듯이, 이 특정 쿼리는 지난 24시간 동안 3000회 이상 실행되었습니다. **Query info** 탭의 모든 메트릭은 집계된 메트릭이지만, **Query history** 탭을 선택하여 개별 실행에 대한 메트릭도 확인할 수 있습니다:

<Image img={insights_query_info} size="sm" alt="Query Insights UI 쿼리 정보" border/>

<br />

이 패널에서 각 쿼리 실행에 대한 `Settings` 및 `Profile Events` 항목을 확장하여 추가 정보를 확인할 수 있습니다.
