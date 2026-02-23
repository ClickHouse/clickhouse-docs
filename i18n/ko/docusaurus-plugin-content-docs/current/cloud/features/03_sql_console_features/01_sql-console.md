---
sidebar_title: 'SQL 콘솔'
slug: /cloud/get-started/sql-console
description: 'SQL 콘솔을 사용해 쿼리를 실행하고 시각화를 생성합니다.'
keywords: ['sql console', 'sql client', 'cloud console', 'console']
title: 'SQL 콘솔'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import table_list_and_schema from '@site/static/images/cloud/sqlconsole/table-list-and-schema.png';
import view_columns from '@site/static/images/cloud/sqlconsole/view-columns.png';
import abc from '@site/static/images/cloud/sqlconsole/abc.png';
import inspecting_cell_content from '@site/static/images/cloud/sqlconsole/inspecting-cell-content.png';
import sort_descending_on_column from '@site/static/images/cloud/sqlconsole/sort-descending-on-column.png';
import filter_on_radio_column_equal_gsm from '@site/static/images/cloud/sqlconsole/filter-on-radio-column-equal-gsm.png';
import add_more_filters from '@site/static/images/cloud/sqlconsole/add-more-filters.png';
import filtering_and_sorting_together from '@site/static/images/cloud/sqlconsole/filtering-and-sorting-together.png';
import create_a_query_from_sorts_and_filters from '@site/static/images/cloud/sqlconsole/create-a-query-from-sorts-and-filters.png';
import creating_a_query from '@site/static/images/cloud/sqlconsole/creating-a-query.png';
import run_selected_query from '@site/static/images/cloud/sqlconsole/run-selected-query.png';
import run_at_cursor_2 from '@site/static/images/cloud/sqlconsole/run-at-cursor-2.png';
import run_at_cursor from '@site/static/images/cloud/sqlconsole/run-at-cursor.png';
import cancel_a_query from '@site/static/images/cloud/sqlconsole/cancel-a-query.png';
import sql_console_save_query from '@site/static/images/cloud/sqlconsole/sql-console-save-query.png';
import sql_console_rename from '@site/static/images/cloud/sqlconsole/sql-console-rename.png';
import sql_console_share from '@site/static/images/cloud/sqlconsole/sql-console-share.png';
import sql_console_edit_access from '@site/static/images/cloud/sqlconsole/sql-console-edit-access.png';
import sql_console_add_team from '@site/static/images/cloud/sqlconsole/sql-console-add-team.png';
import sql_console_edit_member from '@site/static/images/cloud/sqlconsole/sql-console-edit-member.png';
import sql_console_access_queries from '@site/static/images/cloud/sqlconsole/sql-console-access-queries.png';
import search_hn from '@site/static/images/cloud/sqlconsole/search-hn.png';
import match_in_body from '@site/static/images/cloud/sqlconsole/match-in-body.png';
import pagination from '@site/static/images/cloud/sqlconsole/pagination.png';
import pagination_nav from '@site/static/images/cloud/sqlconsole/pagination-nav.png';
import download_as_csv from '@site/static/images/cloud/sqlconsole/download-as-csv.png';
import tabular_query_results from '@site/static/images/cloud/sqlconsole/tabular-query-results.png';
import switch_from_query_to_chart from '@site/static/images/cloud/sqlconsole/switch-from-query-to-chart.png';
import trip_total_by_week from '@site/static/images/cloud/sqlconsole/trip-total-by-week.png';
import bar_chart from '@site/static/images/cloud/sqlconsole/bar-chart.png';
import change_from_bar_to_area from '@site/static/images/cloud/sqlconsole/change-from-bar-to-area.png';
import update_query_name from '@site/static/images/cloud/sqlconsole/update-query-name.png';
import update_subtitle_etc from '@site/static/images/cloud/sqlconsole/update-subtitle-etc.png';
import adjust_axis_scale from '@site/static/images/cloud/sqlconsole/adjust-axis-scale.png';


# SQL Console \{#sql-console\}

SQL 콘솔은 ClickHouse Cloud에서 데이터베이스를 탐색하고 쿼리를 실행하는 가장 빠르고 쉬운 방법입니다. SQL 콘솔을 사용하면 다음을 수행할 수 있습니다:

- ClickHouse Cloud 서비스에 연결합니다.
- 테이블 데이터를 조회, 필터링 및 정렬합니다.
- 몇 번의 클릭만으로 쿼리를 실행하고 결과 데이터를 시각화합니다.
- 팀 구성원과 쿼리를 공유하여 더욱 효율적으로 협업합니다.

### 테이블 살펴보기 \{#exploring-tables\}

### 테이블 목록 및 스키마 정보 보기 \{#viewing-table-list-and-schema-info\}

현재 ClickHouse 인스턴스에 포함된 테이블 개요는 왼쪽 사이드바 영역에서 확인할 수 있습니다. 왼쪽 사이드바 상단의 데이터베이스 선택기를 사용하여 특정 데이터베이스의 테이블을 확인하십시오.

<Image img={table_list_and_schema} size="md" alt="table list and schema" />

목록에 있는 테이블은 확장하여 컬럼과 데이터 타입을 확인할 수도 있습니다.

<Image img={view_columns} size="md" alt="view columns" />

### 테이블 데이터 탐색 \{#exploring-table-data\}

목록에서 테이블을 클릭하면 새 탭에서 열립니다. Table View에서는 데이터를 손쉽게 조회하고, 선택하고, 복사할 수 있습니다. Microsoft Excel, Google Sheets와 같은 스프레드시트 애플리케이션으로 복사/붙여넣기할 때 구조와 서식이 그대로 유지됩니다. 하단 내비게이션을 사용해 테이블 데이터 페이지를 이동할 수 있으며, 각 페이지는 30행 단위로 구분되어 있습니다.

<Image img={abc} size="md" alt='abc' />

### 셀 데이터 검사 \{#inspecting-cell-data\}

Cell Inspector 도구를 사용하면 단일 셀에 포함된 많은 양의 데이터를 확인할 수 있습니다. 이 도구를 열려면 셀을 마우스 오른쪽 버튼으로 클릭한 다음 「Inspect Cell」을 선택합니다. 셀 인스펙터의 내용은 오른쪽 상단에 있는 복사 아이콘을 클릭하여 복사할 수 있습니다.

<Image img={inspecting_cell_content} size="md" alt="셀 내용 검사" />

## 테이블 필터링과 정렬 \{#filtering-and-sorting-tables\}

### 테이블 정렬 \{#sorting-a-table\}

SQL 콘솔에서 테이블을 정렬하려면 테이블을 연 다음 도구 모음에서 「Sort」 버튼을 선택합니다. 이 버튼을 누르면 정렬을 설정할 수 있는 메뉴가 열립니다. 정렬 기준으로 사용할 컬럼을 선택하고, 정렬 순서(오름차순 또는 내림차순)를 지정할 수 있습니다. 「Apply」를 선택하거나 Enter 키를 눌러 테이블을 정렬합니다.

<Image img={sort_descending_on_column} size="md" alt='컬럼을 기준으로 내림차순 정렬' />

SQL 콘솔에서는 테이블에 여러 개의 정렬 조건을 추가할 수도 있습니다. 다른 정렬을 추가하려면 「Sort」 버튼을 다시 클릭합니다. 

:::note
정렬은 정렬 창에 표시된 순서(위에서 아래 순서)대로 적용됩니다. 정렬을 제거하려면 해당 정렬 옆의 「x」 버튼을 클릭하면 됩니다.
:::

### 테이블 필터링하기 \{#filtering-a-table\}

SQL 콘솔에서 테이블을 필터링하려면 테이블을 연 다음 「Filter」 버튼을 선택하십시오. 정렬과 마찬가지로 이 버튼을 선택하면 필터를 구성할 수 있는 메뉴가 열립니다. 필터링에 사용할 컬럼을 선택하고 필요한 조건을 설정할 수 있습니다. SQL 콘솔은 컬럼에 포함된 데이터 유형에 맞는 필터 옵션을 지능적으로 표시합니다.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='radio 컬럼에서 GSM과 같은 값으로 필터링' />

필터 설정이 만족스럽다면 「Apply」를 선택하여 데이터를 필터링합니다. 아래와 같이 추가 필터를 더할 수도 있습니다.

<Image img={add_more_filters} size="md" alt='2000보다 큰 범위에 대한 필터 추가' />

정렬 기능과 마찬가지로 필터를 제거하려면 필터 옆의 「x」 버튼을 클릭합니다.

### 필터링과 정렬 함께 사용하기 \{#filtering-and-sorting-together\}

SQL 콘솔에서는 테이블에 대해 필터링과 정렬을 동시에 수행할 수 있습니다. 이렇게 하려면 위에서 설명한 단계에 따라 필요한 모든 필터와 정렬을 추가한 다음 「Apply」 버튼을 클릭합니다.

<Image img={filtering_and_sorting_together} size="md" alt='2000보다 큰 범위에 필터 추가' />

### 필터와 정렬에서 쿼리 생성하기 \{#creating-a-query-from-filters-and-sorts\}

SQL 콘솔에서는 정렬 및 필터를 한 번의 클릭으로 바로 쿼리로 변환할 수 있습니다. 도구 모음에서 원하는 정렬 및 필터 매개변수를 설정한 다음 'Create Query' 버튼을 선택하십시오. 'Create query'를 클릭하면, 테이블 뷰에 포함된 데이터에 해당하는 SQL 명령으로 미리 채워진 새 쿼리 탭이 열립니다.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt="필터와 정렬에서 쿼리 생성하기" />

:::note
'Create Query' 기능을 사용할 때 필터와 정렬은 필수가 아닙니다.
:::

SQL 콘솔에서 쿼리에 대해 더 알아보려면 (link) 쿼리 관련 문서를 참조하십시오.

## 쿼리 작성 및 실행 \{#creating-and-running-a-query\}

### 쿼리 생성하기 \{#creating-a-query\}

SQL 콘솔에서 새 쿼리를 만드는 방법은 두 가지입니다.

- 탭 바에서 '+' 버튼을 클릭합니다
- 왼쪽 사이드바 쿼리 목록에서 「New Query」 버튼을 선택합니다

<Image img={creating_a_query} size="md" alt='쿼리 생성하기' />

### 쿼리 실행하기 \{#running-a-query\}

쿼리를 실행하려면 SQL Editor에 SQL 명령을 입력한 다음 「Run」 버튼을 클릭하거나 단축키 `cmd / ctrl + enter`를 사용합니다. 여러 개의 명령을 순차적으로 작성해 실행하려면 각 명령 끝에 세미콜론(;)을 추가해야 합니다.

쿼리 실행 옵션  
기본적으로 「Run」 버튼을 클릭하면 SQL Editor에 포함된 모든 명령이 실행됩니다. SQL 콘솔은 다음과 같은 두 가지 추가 쿼리 실행 옵션을 지원합니다:

- 선택한 명령 실행
- 커서 위치의 명령 실행

선택한 명령을 실행하려면 원하는 명령 또는 명령들의 연속 구문을 선택한 다음 「Run」 버튼을 클릭(또는 단축키 `cmd / ctrl + enter` 사용)합니다. 선택 영역이 있을 때 SQL Editor 컨텍스트 메뉴(에디터 안에서 마우스 오른쪽 버튼 클릭으로 열림)에서 「Run selected」를 선택할 수도 있습니다.

<Image img={run_selected_query} size="md" alt='선택한 쿼리 실행' />

현재 커서 위치의 명령을 실행하는 방법은 두 가지가 있습니다:

- 확장 Run 옵션 메뉴에서 「At Cursor」를 선택하거나, 해당 키보드 단축키 `cmd / ctrl + shift + enter`를 사용합니다

<Image img={run_at_cursor_2} size="md" alt='커서 위치에서 실행' />

- SQL Editor 컨텍스트 메뉴에서 「Run at cursor」를 선택합니다

<Image img={run_at_cursor} size="md" alt='커서 위치에서 실행' />

:::note
커서 위치에 있는 명령은 실행 시 노란색으로 깜빡입니다.
:::

### 쿼리 취소하기 \{#canceling-a-query\}

쿼리가 실행 중일 때는 Query Editor 도구 모음의 `Run` 버튼이 `Cancel` 버튼으로 바뀝니다. 이 버튼을 클릭하거나 `Esc` 키를 눌러 쿼리를 취소할 수 있습니다. 주의: 이미 반환된 결과는 쿼리를 취소한 후에도 그대로 유지됩니다.

<Image img={cancel_a_query} size="md" alt='쿼리 취소' />

### 쿼리 저장하기 \{#saving-a-query\}

쿼리를 저장해 두면 나중에 쉽게 다시 찾을 수 있고 팀원들과 공유할 수 있습니다. SQL 콘솔에서는 쿼리를 폴더로 정리할 수도 있습니다.

쿼리를 저장하려면 툴바에서 "Run" 버튼 바로 옆에 있는 "Save" 버튼을 클릭합니다. 원하는 이름을 입력한 다음 "Save Query"를 클릭합니다.

:::note
단축키 `cmd / ctrl` + s를 사용해 현재 쿼리 탭의 작업 내용을 저장할 수도 있습니다.
:::

<Image img={sql_console_save_query} size="md" alt="쿼리 저장" />

또는 툴바에서 "Untitled Query"를 클릭해 이름을 지정하면서 동시에 쿼리를 저장할 수도 있습니다. 이름을 수정한 뒤 Enter 키를 누릅니다:

<Image img={sql_console_rename} size="md" alt="쿼리 이름 변경" />

### 쿼리 공유 \{#query-sharing\}

SQL 콘솔을 사용하면 팀 구성원과 쿼리를 쉽게 공유할 수 있습니다. SQL 콘솔은 전역 수준과 사용자별 수준에서 조정할 수 있는 네 가지 접근 권한을 지원합니다:

- 소유자(공유 옵션을 조정할 수 있음)
- 쓰기 권한
- 읽기 전용 권한
- 접근 권한 없음

쿼리를 저장한 후 도구 모음에서 "Share" 버튼을 클릭합니다. 공유 옵션이 포함된 모달 창이 나타납니다:

<Image img={sql_console_share} size="md" alt="쿼리 공유" />

서비스에 접근 권한이 있는 모든 조직 구성원의 쿼리 접근 권한을 조정하려면 맨 위 줄의 접근 수준 선택기를 조정합니다:

<Image img={sql_console_edit_access} size="md" alt="접근 권한 편집" />

위 설정을 적용하면 이제 서비스의 SQL 콘솔에 접근 권한이 있는 모든 팀 구성원이 해당 쿼리를 조회(및 실행)할 수 있습니다.

특정 구성원의 쿼리 접근 권한을 조정하려면 "Add a team member" 선택기에서 원하는 팀 구성원을 선택합니다:

<Image img={sql_console_add_team} size="md" alt="팀 구성원 추가" />

팀 구성원을 선택하면 접근 수준 선택기가 포함된 새 항목이 표시됩니다:

<Image img={sql_console_edit_member} size="md" alt="팀 구성원 접근 권한 편집" />

### 공유된 쿼리 확인하기 \{#accessing-shared-queries\}

쿼리가 사용자와 공유된 경우 SQL 콘솔 왼쪽 사이드바의 「Queries」 탭에 표시됩니다:

<Image img={sql_console_access_queries} size="md" alt="공유된 쿼리 확인" />

### 쿼리 고유 링크(permalinks) \{#linking-to-a-query-permalinks\}

저장된 쿼리에는 permalink가 생성되므로, 공유된 쿼리에 대한 링크를 주고받아 해당 쿼리를 바로 열 수 있습니다.

쿼리에 존재하는 매개변수 값은 자동으로 저장된 쿼리 URL의 쿼리 매개변수로 추가됩니다. 예를 들어, 쿼리에 `{start_date: Date}` 및 `{end_date: Date}` 매개변수가 포함된 경우 permalink는 다음과 같이 표시될 수 있습니다: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## 고급 쿼리 기능 \{#advanced-querying-features\}

### 쿼리 결과 검색 \{#searching-query-results\}

쿼리가 실행된 후 결과 창의 검색 입력 필드를 사용하여 반환된 결과 집합을 빠르게 검색할 수 있습니다. 이 기능은 추가 `WHERE` 절의 결과를 미리 확인하거나, 특정 데이터가 결과 집합에 포함되어 있는지 점검하는 데 도움이 됩니다. 검색 입력 필드에 값을 입력하면 결과 창이 업데이트되어, 입력한 값과 일치하는 항목을 포함하는 레코드를 반환합니다. 다음 예에서는 `ClickHouse`가 포함된 댓글(대소문자 구분 없이)에 대해 `hackernews` 테이블에서 `breakfast`가 등장하는 모든 경우를 찾아봅니다:

<Image img={search_hn} size="md" alt="Hacker News 데이터 검색" />

주의: 입력한 값과 일치하는 필드를 가진 레코드는 모두 반환됩니다. 예를 들어, 위 스크린샷의 세 번째 레코드는 `by` 필드에는 'breakfast'가 없지만, `text` 필드에는 있습니다:

<Image img={match_in_body} size="md" alt="본문에서 일치 항목" />

### 페이지네이션 설정 조정 \{#adjusting-pagination-settings\}

기본적으로 쿼리 결과 창은 모든 결과 행을 하나의 페이지에 표시합니다. 결과 집합이 큰 경우 결과를 페이지별로 나누어 표시하는 것이 더 편리할 수 있습니다. 이를 위해 결과 창 오른쪽 하단에 있는 페이지네이션 선택기를 사용할 수 있습니다:

<Image img={pagination} size="md" alt="페이지네이션 옵션" />

페이지 크기를 선택하면 페이지네이션이 결과 집합에 즉시 적용되며, 결과 창 하단 가운데에 페이지 이동 옵션이 표시됩니다.

<Image img={pagination_nav} size="md" alt="페이지네이션 탐색" />

### 쿼리 결과 데이터 내보내기 \{#exporting-query-result-data\}

쿼리 결과 집합은 SQL 콘솔에서 CSV 형식으로 쉽게 내보낼 수 있습니다. 이를 위해 결과 창 도구 모음 오른쪽에 있는 `•••` 메뉴를 클릭한 다음 「Download as CSV」를 선택하십시오.

<Image img={download_as_csv} size="md" alt="Download as CSV" />

## 쿼리 데이터 시각화 \{#visualizing-query-data\}

일부 데이터는 차트로 시각화했을 때 더 쉽게 이해할 수 있습니다. SQL 콘솔에서 쿼리 결과를 기반으로 몇 번만 클릭하면 빠르게 시각화를 만들 수 있습니다. 예를 들어, NYC 택시 운행에 대한 주간 통계를 계산하는 쿼리를 사용하겠습니다:

```sql
SELECT
   toStartOfWeek(pickup_datetime) AS week,
   sum(total_amount) AS fare_total,
   sum(trip_distance) AS distance_total,
   count(*) AS trip_total
FROM
   nyc_taxi
GROUP BY
   1
ORDER BY
   1 ASC
```

<Image img={tabular_query_results} size="md" alt="테이블 형식 쿼리 결과" />

시각화하지 않으면 이러한 결과는 해석하기 어렵습니다. 이제 차트로 만들어 보겠습니다.


### 차트 생성 \{#creating-charts\}

시각화를 시작하려면 쿼리 결과 창의 도구 모음에서 'Chart' 옵션을 선택합니다. 그러면 차트 구성 창이 표시됩니다.

<Image img={switch_from_query_to_chart} size="md" alt='쿼리에서 차트로 전환' />

먼저 `week`별 `trip_total`을 추적하는 간단한 막대 차트를 생성하겠습니다. 이를 위해 `week` 필드를 x축으로, `trip_total` 필드를 y축으로 드래그합니다.

<Image img={trip_total_by_week} size="md" alt='주별 trip_total' />

대부분의 차트 유형에서는 숫자 축에 여러 필드를 사용할 수 있습니다. 이를 보여주기 위해 `fare_total` 필드를 y축으로 드래그하겠습니다.

<Image img={bar_chart} size="md" alt='막대 차트' />

### 차트 커스터마이징 \{#customizing-charts\}

SQL 콘솔은 차트 구성 창의 차트 유형 선택기에서 선택할 수 있는 10개의 차트 유형을 지원합니다. 예를 들어, 이전 차트 유형을 Bar에서 Area로 쉽게 변경할 수 있습니다:

<Image img={change_from_bar_to_area} size="md" alt="Bar 차트에서 Area 차트로 변경" />

차트 제목은 데이터를 제공하는 쿼리 이름과 동일합니다. 쿼리 이름을 변경하면 차트 제목도 함께 변경됩니다:

<Image img={update_query_name} size="md" alt="쿼리 이름 업데이트" />

더 고급 차트 속성은 차트 구성 창의 「Advanced」 섹션에서 조정할 수 있습니다. 먼저 다음 설정을 조정합니다:

- 부제목
- 축 제목
- x축 레이블 방향

차트는 이에 맞게 업데이트됩니다:

<Image img={update_subtitle_etc} size="md" alt="부제목 등 업데이트" />

일부 상황에서는 각 필드에 대해 축 스케일을 개별적으로 조정해야 할 수도 있습니다. 이는 차트 구성 창의 「Advanced」 섹션에서 축 범위의 최소값과 최대값을 지정하여 수행할 수 있습니다. 예를 들어, 위 차트도 충분히 좋아 보이지만, `trip_total` 및 `fare_total` 필드 간의 상관관계를 보여 주기 위해서는 축 범위를 약간 조정해야 합니다:

<Image img={adjust_axis_scale} size="md" alt="축 스케일 조정" />