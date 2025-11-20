---
'sidebar_title': 'Query insights'
'slug': '/cloud/get-started/query-insights'
'description': '시스템.query_log 데이터를 시각화하여 쿼리 디버깅 및 성능 최적화를 단순화합니다.'
'keywords':
- 'query insights'
- 'query log'
- 'query log ui'
- 'system.query_log insights'
'title': '쿼리 통찰력'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# 쿼리 인사이트

**쿼리 인사이트** 기능은 ClickHouse의 내장 쿼리 로그를 다양한 시각화 및 테이블을 통해 사용하기 쉽게 만듭니다. ClickHouse의 `system.query_log` 테이블은 쿼리 최적화, 디버깅 및 전체 클러스터의 건강 상태와 성능 모니터링을 위한 주요 정보 출처입니다.

## 쿼리 개요 {#query-overview}

서비스를 선택한 후, 왼쪽 사이드바의 **모니터링** 내비게이션 항목이 확장되어 새로운 **쿼리 인사이트** 하위 항목이 표시됩니다. 이 옵션을 클릭하면 새로운 쿼리 인사이트 페이지가 열립니다:

<Image img={insights_overview} size="md" alt="쿼리 인사이트 UI 개요" border/>

## 최상위 메트릭 {#top-level-metrics}

상단의 통계 박스는 선택된 기간 동안의 기본 최상위 쿼리 메트릭을 나타냅니다. 그 아래에는 쿼리 종류(선택, 삽입, 기타)에 따라 시간 창에서 쿼리 볼륨, 대기 시간, 오류 비율을 나타내는 세 개의 시계열 차트를 노출했습니다. 대기 시간 차트는 p50, p90 및 p99 대기 시간을 표시하도록 추가로 조정할 수 있습니다:

<Image img={insights_latency} size="md" alt="쿼리 인사이트 UI 대기 시간 차트" border/>

## 최근 쿼리 {#recent-queries}

최상위 메트릭 아래에는 선택된 시간 창에 대한 쿼리 로그 항목(정규화된 쿼리 해시 및 사용자별로 그룹화됨)이 표시된 테이블이 나타납니다:

<Image img={insights_recent} size="md" alt="쿼리 인사이트 UI 최근 쿼리 테이블" border/>

최근 쿼리는 사용 가능한 모든 필드로 필터링 및 정렬할 수 있습니다. 테이블은 또한 테이블, p90 및 p99 대기 시간과 같은 추가 필드를 표시하거나 숨기도록 구성할 수 있습니다.

## 쿼리 세부 정보 {#query-drill-down}

최근 쿼리 테이블에서 쿼리를 선택하면 해당 쿼리에 대한 메트릭 및 정보를 담고 있는 플라이아웃이 열립니다:

<Image img={insights_drilldown} size="md" alt="쿼리 인사이트 UI 쿼리 세부 정보" border/>

플라이아웃에서 볼 수 있듯이, 이 특정 쿼리는 지난 24시간 동안 3000회 이상 실행되었습니다. **쿼리 정보** 탭의 모든 메트릭은 집계된 메트릭이지만, **쿼리 이력** 탭을 선택하여 개별 실행에 대한 메트릭도 볼 수 있습니다:

<Image img={insights_query_info} size="sm" alt="쿼리 인사이트 UI 쿼리 정보" border/>

<br />

이 패널에서 각 쿼리 실행에 대한 `설정` 및 `프로파일 이벤트` 항목을 확장하여 추가 정보를 확인할 수 있습니다.
