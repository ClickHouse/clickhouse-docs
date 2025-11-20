---
'sidebar_title': 'SQL console'
'slug': '/cloud/get-started/sql-console'
'description': '쿼리를 실행하고 SQL 콘솔을 사용하여 시각화를 생성합니다.'
'keywords':
- 'sql console'
- 'sql client'
- 'cloud console'
- 'console'
'title': 'SQL 콘솔'
'doc_type': 'guide'
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


# SQL 콘솔

SQL 콘솔은 ClickHouse Cloud에서 데이터베이스를 탐색하고 쿼리하는 가장 빠르고 쉬운 방법입니다. SQL 콘솔을 사용하여 다음과 같은 작업을 수행할 수 있습니다:

- ClickHouse Cloud 서비스에 연결하기
- 테이블 데이터를 보고, 필터링하고, 정렬하기
- 몇 번의 클릭만으로 쿼리를 실행하고 결과 데이터를 시각화하기
- 팀원과 쿼리를 공유하고 더 효과적으로 협업하기.

### 테이블 탐색하기 {#exploring-tables}

### 테이블 목록 및 스키마 정보 보기 {#viewing-table-list-and-schema-info}

귀하의 ClickHouse 인스턴스에 포함된 테이블 개요는 왼쪽 사이드바 영역에서 확인할 수 있습니다. 왼쪽 바 상단의 데이터베이스 선택기를 사용하여 특정 데이터베이스의 테이블을 볼 수 있습니다.

<Image img={table_list_and_schema} size="md" alt='테이블 목록 및 스키마' />
목록의 테이블은 컬럼 및 유형을 보기 위해 확장할 수 있습니다.

<Image img={view_columns} size="md" alt='컬럼 보기' />

### 테이블 데이터 탐색하기 {#exploring-table-data}

목록에서 테이블을 클릭하여 새 탭에서 열 수 있습니다. 테이블 보기에서 데이터는 쉽게 보고, 선택하고, 복사할 수 있습니다. Microsoft Excel 및 Google Sheets와 같은 스프레드시트 응용 프로그램에 복사-붙여넣기를 할 때 구조와 형식이 유지됩니다. 풋터의 내비게이션을 사용하여 테이블 데이터 페이지(30행 단위로 페이지 매김됨) 간을 전환할 수 있습니다.

<Image img={abc} size="md" alt='abc' />

### 셀 데이터 검사하기 {#inspecting-cell-data}

Cell Inspector 도구를 사용하여 단일 셀에 포함된 대량의 데이터를 볼 수 있습니다. 이를 열려면 셀을 오른쪽 클릭하고 'Inspect Cell'을 선택합니다. 셀 검사기의 내용은 검사기 내용의 오른쪽 상단 모서리에 있는 복사 아이콘을 클릭하여 복사할 수 있습니다.

<Image img={inspecting_cell_content} size="md" alt='셀 내용 검사하기' />

## 테이블 필터링 및 정렬하기 {#filtering-and-sorting-tables}

### 테이블 정렬하기 {#sorting-a-table}

SQL 콘솔에서 테이블을 정렬하려면 테이블을 열고 도구 모음에서 'Sort' 버튼을 선택합니다. 이 버튼은 정렬 구성을 위한 메뉴를 엽니다. 정렬할 컬럼을 선택하고 정렬 순서(오름차순 또는 내림차순)를 구성할 수 있습니다. 'Apply'를 선택하거나 Enter 키를 눌러 테이블을 정렬합니다.

<Image img={sort_descending_on_column} size="md" alt='컬럼을 기준으로 내림차순 정렬하기' />

SQL 콘솔에서는 테이블에 여러 개의 정렬을 추가할 수도 있습니다. 'Sort' 버튼을 다시 클릭하여 또 다른 정렬을 추가합니다. 

:::note
정렬은 정렬 창에 나타나는 순서(위에서 아래로)에 따라 적용됩니다. 정렬을 제거하려면, 정렬 옆에 있는 'x' 버튼을 클릭하면 됩니다.
:::

### 테이블 필터링하기 {#filtering-a-table}

SQL 콘솔에서 테이블을 필터링하려면 테이블을 열고 'Filter' 버튼을 선택합니다. 정렬과 마찬가지로 이 버튼은 필터 구성을 위한 메뉴를 엽니다. 필터링할 컬럼을 선택하고 필요한 기준을 선택할 수 있습니다. SQL 콘솔은 컬럼에 포함된 데이터 유형에 따라 필터 옵션을 스마트하게 표시합니다.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='GSM과 동일한 라디오 컬럼 필터링하기' />

필터에 만족하면 'Apply'를 선택하여 데이터를 필터링할 수 있습니다. 아래와 같이 추가 필터를 추가할 수도 있습니다.

<Image img={add_more_filters} size="md" alt='2000보다 큰 범위에 필터 추가하기' />

정렬 기능과 유사하게, 필터를 제거하려면 필터 옆에 있는 'x' 버튼을 클릭합니다.

### 필터링 및 정렬 함께 사용하기 {#filtering-and-sorting-together}

SQL 콘솔을 사용하면 테이블을 동시에 필터링하고 정렬할 수 있습니다. 이렇게 하려면, 위에 설명된 단계에 따라 원하는 모든 필터와 정렬을 추가하고 'Apply' 버튼을 클릭하면 됩니다.

<Image img={filtering_and_sorting_together} size="md" alt='2000보다 큰 범위에 필터 추가하기' />

### 필터 및 정렬로 쿼리 생성하기 {#creating-a-query-from-filters-and-sorts}

SQL 콘솔은 원하는 필터 및 정렬 매개변수를 사용하여 클릭 한 번으로 곧바로 쿼리로 변환할 수 있습니다. 도구 모음에서 'Create Query' 버튼을 선택하면 됩니다. 'Create query'를 클릭하면, 테이블 보기의 데이터에 해당하는 SQL 명령이 자동으로 채워진 새 쿼리 탭이 열립니다.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='정렬 및 필터에서 쿼리 생성하기' />

:::note
'Create Query' 기능을 사용할 때 필터 및 정렬은 필수가 아닙니다.
:::

SQL 콘솔에서 쿼리하는 방법에 대해 더 배우고 싶다면 (link) 쿼리 문서를 읽어보세요.

## 쿼리 생성 및 실행 {#creating-and-running-a-query}

### 쿼리 생성하기 {#creating-a-query}

SQL 콘솔에서 새 쿼리를 생성하는 방법은 두 가지가 있습니다.

- 탭 바에서 '+' 버튼을 클릭합니다.
- 왼쪽 사이드바 쿼리 목록에서 'New Query' 버튼을 선택합니다.

<Image img={creating_a_query} size="md" alt='쿼리 생성하기' />

### 쿼리 실행하기 {#running-a-query}

쿼리를 실행하려면 SQL 에디터에 SQL 명령을 입력하고 'Run' 버튼을 클릭하거나 단축키 `cmd / ctrl + enter`를 사용합니다. 여러 명령을 순차적으로 작성하고 실행하려면 각 명령 뒤에 세미콜론을 추가해야 합니다.

쿼리 실행 옵션
기본적으로 실행 버튼을 클릭하면 SQL 에디터에 포함된 모든 명령이 실행됩니다. SQL 콘솔은 두 가지 다른 쿼리 실행 옵션을 지원합니다:

- 선택한 명령 실행
- 커서 위치에서 명령 실행

선택한 명령을 실행하려면 원하는 명령이나 명령의 시퀀스를 강조 표시하고 'Run' 버튼을 클릭합니다(또는 `cmd / ctrl + enter` 단축키를 사용). 선택이 있을 때 SQL 에디터의 컨텍스트 메뉴(에디터 내에서 오른쪽 클릭하여 열 수 있음)에서 'Run selected'를 선택할 수도 있습니다.

<Image img={run_selected_query} size="md" alt='선택한 쿼리 실행하기' />

현재 커서 위치에서 명령을 실행하는 방법은 두 가지가 있습니다:

- 확장 실행 옵션 메뉴에서 'At Cursor'를 선택합니다(또는 해당 `cmd / ctrl + shift + enter` 키보드 단축키를 사용).
  
<Image img={run_at_cursor_2} size="md" alt='커서에서 실행하기' />

- SQL 에디터의 컨텍스트 메뉴에서 'Run at cursor'를 선택합니다.

<Image img={run_at_cursor} size="md" alt='커서에서 실행하기' />

:::note
커서 위치에 있는 명령은 실행 시 노란색으로 깜박입니다.
:::

### 쿼리 취소하기 {#canceling-a-query}

쿼리가 실행되는 동안, 쿼리 에디터 도구 모음에서 'Run' 버튼은 'Cancel' 버튼으로 바뀝니다. 이 버튼을 클릭하거나 `Esc`를 눌러 쿼리를 취소하면 됩니다. 참고: 이미 반환된 결과는 취소 후에도 유지됩니다.

<Image img={cancel_a_query} size="md" alt='쿼리 취소하기' />

### 쿼리 저장하기 {#saving-a-query}

쿼리를 저장하면 나중에 쉽게 찾고 팀원과 공유할 수 있습니다. SQL 콘솔은 쿼리를 폴더로 정리할 수도 있습니다.

쿼리를 저장하려면 도구 모음에서 "Run" 버튼 바로 옆에 있는 "Save" 버튼을 클릭하면 됩니다. 원하는 이름을 입력하고 "Save Query"를 클릭합니다.

:::note
단축키 `cmd / ctrl` + s를 사용하면 현재 쿼리 탭의 작업도 저장됩니다.
:::

<Image img={sql_console_save_query} size="md" alt='쿼리 저장하기' />

또한, 도구 모음에서 "Untitled Query"를 클릭하여 동시에 쿼리의 이름을 정하고 저장할 수 있습니다. 이름을 조정하고 Enter를 누릅니다:

<Image img={sql_console_rename} size="md" alt='쿼리 이름 바꾸기' />

### 쿼리 공유하기 {#query-sharing}

SQL 콘솔을 사용하면 팀원과 쿼리를 쉽게 공유할 수 있습니다. SQL 콘솔은 글로벌 및 사용자 별로 조정할 수 있는 네 가지 액세스 수준을 지원합니다:

- 소유자(공유 옵션 조정 가능)
- 쓰기 권한
- 읽기 전용 권한
- 액세스 없음

쿼리를 저장한 후, 도구 모음에서 "Share" 버튼을 클릭합니다. 공유 옵션이 있는 모달이 나타납니다:

<Image img={sql_console_share} size="md" alt='쿼리 공유하기' />

서비스에 액세스할 수 있는 모든 조직 구성원을 위한 쿼리 액세스를 조정하려면, 상단 행의 액세스 수준 선택기를 간단하게 조정합니다:

<Image img={sql_console_edit_access} size="md" alt='액세스 조정하기' />

위의 조정을 적용한 후, 해당 쿼리는 SQL 콘솔에 접근할 수 있는 모든 팀원이 조회하고 실행할 수 있습니다.

특정 구성원에 대한 쿼리 액세스를 조정하려면 "팀원 추가" 선택기에서 원하는 팀원을 선택합니다:

<Image img={sql_console_add_team} size="md" alt='팀원 추가하기' />

팀원을 선택한 후, 액세스 수준 선택기가 있는 새 항목이 나타나야 합니다:

<Image img={sql_console_edit_member} size="md" alt='팀원 액세스 조정하기' />

### 공유 쿼리 접근하기 {#accessing-shared-queries}

쿼리가 귀하와 공유된 경우, SQL 콘솔의 "Queries" 탭에 표시됩니다:

<Image img={sql_console_access_queries} size="md" alt='쿼리 접근하기' />

### 쿼리 링크(퍼멀링크) {#linking-to-a-query-permalinks}

저장된 쿼리는 퍼멀링크가 설정되어 있으므로, 공유된 쿼리에 대한 링크를 보내고 받을 수 있으며 직접 열 수 있습니다.

쿼리 내에 존재할 수 있는 매개변수의 값은 자동으로 저장된 쿼리 URL에 쿼리 매개변수로 추가됩니다. 예를 들어, 쿼리에 `{start_date: Date}`와 `{end_date: Date}` 매개변수가 포함된 경우, 퍼멀링크는 다음과 같을 수 있습니다: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## 고급 쿼리 기능 {#advanced-querying-features}

### 쿼리 결과 검색하기 {#searching-query-results}

쿼리가 실행된 후, 결과 창의 검색 입력을 사용하여 반환된 결과 집합을 빠르게 검색할 수 있습니다. 이 기능은 추가 `WHERE` 절의 결과를 미리 보기 위해 또는 특정 데이터가 결과 집합에 포함되었는지 확인하기 위해 유용합니다. 검색 입력란에 값을 입력하면 결과 창이 업데이트되어 입력된 값과 일치하는 레코드를 반환합니다. 이번 예시에서는 `hackernews` 테이블에서 `ClickHouse`를 포함하는 댓글의 모든 `breakfast` 인스턴스를 찾겠습니다(대소문자 구분하지 않음):

<Image img={search_hn} size="md" alt='Hacker News 데이터 검색하기' />

참고: 입력된 값과 일치하는 모든 필드가 반환됩니다. 예를 들어, 위 스크린샷의 세 번째 레코드는 `by` 필드에서 'breakfast'와 일치하지 않지만, `text` 필드는 일치합니다:

<Image img={match_in_body} size="md" alt='본문에서 일치하기' />

### 페이지 매김 설정 조정하기 {#adjusting-pagination-settings}

기본적으로 쿼리 결과 창은 모든 결과 레코드를 한 페이지에 표시합니다. 더 큰 결과 집합의 경우, 더 쉽게 보기 위해 결과 페이지 매김을 하는 것이 좋습니다. 이는 결과 창의 하단 오른쪽 코너에 있는 페이지 매김 선택기를 사용하여 수행할 수 있습니다:

<Image img={pagination} size="md" alt='페이지 매김 옵션' />

페이지 크기를 선택하면 결과 집합에 즉시 페이지 매김이 적용되고 결과 창 풋터 중간에 내비게이션 옵션이 나타납니다.

<Image img={pagination_nav} size="md" alt='페이지 매김 내비게이션' />

### 쿼리 결과 데이터 내보내기 {#exporting-query-result-data}

쿼리 결과 집합은 SQL 콘솔에서 CSV 형식으로 쉽게 내보낼 수 있습니다. 이를 위해 결과 창 도구 모음의 오른쪽에 있는 `•••` 메뉴를 열고 'Download as CSV'를 선택합니다.

<Image img={download_as_csv} size="md" alt='CSV로 다운로드하기' />

## 쿼리 데이터 시각화하기 {#visualizing-query-data}

일부 데이터는 차트 형태로 해석하기 더 쉽습니다. SQL 콘솔에서 쿼리 결과 데이터로부터 빠르게 시각화를 생성할 수 있습니다. 예를 들어 NYC 택시 여행의 주간 통계를 계산하는 쿼리를 사용하겠습니다:

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

<Image img={tabular_query_results} size="md" alt='표 형식 쿼리 결과' />

시각화 없이 이러한 결과는 해석하기 어렵습니다. 이를 차트로 변환해 보겠습니다.

### 차트 생성하기 {#creating-charts}

시각화를 구축하기 위해, 쿼리 결과 창 도구 모음에서 'Chart' 옵션을 선택합니다. 차트 구성 창이 나타납니다:

<Image img={switch_from_query_to_chart} size="md" alt='쿼리에서 차트로 전환하기' />

우리는 `주별`로 `trip_total`을 추적하는 간단한 막대 차트를 생성하는 것부터 시작하겠습니다. 이를 위해, `week` 필드를 x축으로, `trip_total` 필드를 y축으로 드래그합니다:

<Image img={trip_total_by_week} size="md" alt='주별 여행 총액' />

대부분의 차트 유형은 수치 축에서 여러 필드를 지원합니다. 이를 시연하기 위해, fare_total 필드를 y축에 드래그합니다:

<Image img={bar_chart} size="md" alt='막대 차트' />

### 차트 사용자 정의하기 {#customizing-charts}

SQL 콘솔은 차트 구성 창의 차트 유형 선택기에서 선택할 수 있는 열 가지 차트 유형을 지원합니다. 예를 들어, 이전 차트 유형을 막대에서 영역으로 쉽게 변경할 수 있습니다:

<Image img={change_from_bar_to_area} size="md" alt='막대 차트에서 영역으로 변경하기' />

차트 제목은 데이터를 제공하는 쿼리의 이름과 일치합니다. 쿼리 이름을 업데이트하면 차트 제목도 업데이트됩니다:

<Image img={update_query_name} size="md" alt='쿼리 이름 업데이트하기' />

차트 구성 창의 '고급' 섹션에서 더 많은 고급 차트 특성을 조정할 수 있습니다. 우선, 다음 설정을 조정하겠습니다:

- 부제목
- 축 제목
- x축의 레이블 방향

우리의 차트는 그에 따라 업데이트됩니다:

<Image img={update_subtitle_etc} size="md" alt='부제목 등을 업데이트하기' />

일부 시나리오에서는 각 필드에 대해 축 스케일을 독립적으로 조정해야 할 수도 있습니다. 이는 '고급' 섹션에서 축 범위에 대한 최소 및 최대 값을 지정하여도 수행할 수 있습니다. 예를 들어, 위의 차트는 보기 좋지만, `trip_total`과 `fare_total` 필드 간의 상관관계를 시연하기 위해선 축 범위를 조정해야 합니다:

<Image img={adjust_axis_scale} size="md" alt='축 스케일 조정하기' />
