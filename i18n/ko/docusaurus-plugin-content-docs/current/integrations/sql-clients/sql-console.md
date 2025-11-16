---
'sidebar_label': 'SQL 콘솔'
'sidebar_position': 1
'title': 'SQL 콘솔'
'slug': '/integrations/sql-clients/sql-console'
'description': 'SQL 콘솔에 대해 배우기'
'doc_type': 'guide'
'keywords':
- 'sql console'
- 'query interface'
- 'web ui'
- 'sql editor'
- 'cloud console'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
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
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png'
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png'



# SQL 콘솔

SQL 콘솔은 ClickHouse Cloud에서 데이터베이스를 탐색하고 쿼리하는 가장 빠르고 쉬운 방법입니다. SQL 콘솔을 사용하여 다음을 수행할 수 있습니다:

- ClickHouse Cloud Services에 연결
- 테이블 데이터 보기, 필터링 및 정렬
- 쿼리 실행 및 결과 데이터 시각화
- 팀원과 쿼리 공유 및 보다 효과적인 협업

## 테이블 탐색 {#exploring-tables}

### 테이블 목록 및 스키마 정보 보기 {#viewing-table-list-and-schema-info}

귀하의 ClickHouse 인스턴스에 포함된 테이블의 개요는 왼쪽 사이드바 영역에서 확인할 수 있습니다. 왼쪽 바 상단의 데이터베이스 선택기를 사용하여 특정 데이터베이스의 테이블을 볼 수 있습니다.

<Image img={table_list_and_schema} size="lg" border alt="왼쪽 사이드바에 데이터베이스 테이블이 표시된 테이블 목록 및 스키마 뷰"/>

목록의 테이블을 확장하여 컬럼 및 타입을 볼 수도 있습니다.

<Image img={view_columns} size="lg" border alt="컬럼 이름 및 데이터 타입을 보여주는 확장된 테이블 보기"/>

### 테이블 데이터 탐색 {#exploring-table-data}

목록에서 테이블을 클릭하여 새 탭에서 열 수 있습니다. 테이블 뷰에서는 데이터를 쉽게 보고 선택하고 복사할 수 있습니다. Microsoft Excel 및 Google Sheets와 같은 스프레드시트 애플리케이션에 복사-붙여넣기를 할 때 구조와 형식이 유지됩니다. 푸터의 탐색을 사용하여 테이블 데이터의 페이지를 넘어갈 수 있습니다 (30행 단위로 페이지 매김됨).

<Image img={abc} size="lg" border alt="선택하고 복사할 수 있는 데이터를 보여주는 테이블 보기"/>

### 셀 데이터 검사 {#inspecting-cell-data}

셀 검사기 도구를 사용하여 단일 셀에 포함된 대량의 데이터를 볼 수 있습니다. 이를 열기 위해 셀을 마우스 오른쪽 버튼으로 클릭하고 '셀 검사'를 선택합니다. 셀 검사기 내용의 복사 아이콘을 클릭하여 셀 검사기의 내용을 복사할 수 있습니다.

<Image img={inspecting_cell_content} size="lg" border alt="선택한 셀의 내용을 보여주는 셀 검사기 대화상자"/>

## 테이블 필터링 및 정렬 {#filtering-and-sorting-tables}

### 테이블 정렬 {#sorting-a-table}

SQL 콘솔에서 테이블을 정렬하려면, 테이블을 열고 툴바에서 '정렬' 버튼을 선택합니다. 이 버튼을 클릭하면 정렬을 구성할 수 있는 메뉴가 열립니다. 정렬할 컬럼을 선택하고 정렬 순서(오름차순 또는 내림차순)를 구성할 수 있습니다. '적용'을 선택하거나 Enter를 눌러 테이블을 정렬합니다.

<Image img={sort_descending_on_column} size="lg" border alt="컬럼에 대한 내림차순 정렬 구성을 보여주는 정렬 대화상자"/>

SQL 콘솔은 테이블에 여러 정렬을 추가할 수 있도록 합니다. 정렬을 추가하려면 '정렬' 버튼을 다시 클릭합니다. 참고: 정렬은 정렬 창에 나타나는 순서(상단에서 하단)로 적용됩니다. 정렬을 제거하려면 정렬 옆의 'x' 버튼을 클릭하면 됩니다.

### 테이블 필터링 {#filtering-a-table}

SQL 콘솔에서 테이블을 필터링하려면, 테이블을 열고 '필터' 버튼을 선택합니다. 정렬과 마찬가지로, 이 버튼은 필터를 구성할 수 있는 메뉴를 열어줍니다. 필터링할 컬럼과 필요한 기준을 선택할 수 있습니다. SQL 콘솔은 컬럼에 포함된 데이터 유형에 맞는 필터 옵션을 지능적으로 표시합니다.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="GSM과 동일한 라디오 컬럼을 필터링하는 필터 구성 대화상자"/>

필터링이 완료되면 '적용'을 선택하여 데이터를 필터링할 수 있습니다. 아래와 같이 추가 필터를 추가할 수도 있습니다.

<Image img={add_more_filters} size="lg" border alt="2000보다 큰 범위에서 추가 필터를 추가하는 방법을 보여주는 대화상자"/>

정렬 기능과 유사하게, 필터를 제거하려면 필터 옆의 'x' 버튼을 클릭합니다.

### 필터링 및 정렬 동시에 사용하기 {#filtering-and-sorting-together}

SQL 콘솔에서는 테이블을 동시에 필터링하고 정렬할 수 있습니다. 이를 위해 위에서 설명한 단계에 따라 원하는 필터와 정렬을 모두 추가한 후 '적용' 버튼을 클릭합니다.

<Image img={filtering_and_sorting_together} size="lg" border alt="동시에 필터링 및 정렬이 적용된 인터페이스"/>

### 필터 및 정렬로부터 쿼리 생성하기 {#creating-a-query-from-filters-and-sorts}

SQL 콘솔은 정렬과 필터를 클릭 한 번으로 쿼리로 변환할 수 있습니다. 선택한 정렬 및 필터 매개변수로 툴바에서 '쿼리 생성' 버튼을 선택하기만 하면 됩니다. '쿼리 생성'을 클릭하면, 테이블 뷰에 포함된 데이터에 해당하는 SQL 명령으로 미리 채워진 새 쿼리 탭이 열립니다.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="필터와 정렬로부터 SQL을 생성하는 Create Query 버튼을 보여주는 인터페이스"/>

:::note
'쿼리 생성' 기능을 사용할 때 필터와 정렬은 필수가 아닙니다.
:::

SQL 콘솔에서 쿼리에 대한 더 많은 정보를 보려면 (link) 쿼리 문서를 읽어보세요.

## 쿼리 생성 및 실행 {#creating-and-running-a-query}

### 쿼리 생성하기 {#creating-a-query}

SQL 콘솔에서 새 쿼리를 생성하는 방법은 두 가지가 있습니다.

- 탭 바에서 '+' 버튼을 클릭합니다.
- 왼쪽 사이드바의 쿼리 목록에서 '새 쿼리' 버튼을 선택합니다.

<Image img={creating_a_query} size="lg" border alt="새 쿼리를 만드는 방법을 보여주는 인터페이스( + 버튼 또는 새 쿼리 버튼 사용)"/>

### 쿼리 실행하기 {#running-a-query}

쿼리를 실행하려면 SQL 편집기에 SQL 명령을 입력하고 '실행' 버튼을 클릭하거나 단축키 `cmd / ctrl + enter`를 사용합니다. 여러 명령을 순차적으로 작성하고 실행하려면 각 명령 뒤에 세미콜론을 추가해야 합니다.

쿼리 실행 옵션
기본적으로 실행 버튼을 클릭하면 SQL 편집기에 포함된 모든 명령이 실행됩니다. SQL 콘솔은 두 가지 다른 쿼리 실행 옵션을 지원합니다:

- 선택한 명령 실행
- 커서에 있는 명령 실행

선택한 명령을 실행하려면 원하는 명령이나 명령 시퀀스를 강조 표시하고 '실행' 버튼을 클릭합니다(또는 `cmd / ctrl + enter` 단축키를 사용합니다). 선택이 있는 경우 SQL 편집기 컨텍스트 메뉴(편집기 내에서 마우스 오른쪽 버튼 클릭 시 열림)에서 '선택한 항목 실행'을 선택할 수도 있습니다.

<Image img={run_selected_query} size="lg" border alt="SQL 쿼리의 선택된 부분을 실행하는 방법을 보여주는 인터페이스"/>

현재 커서 위치에서 명령을 실행하는 방법은 두 가지입니다:

- 확장된 실행 옵션 메뉴에서 '커서에서'를 선택합니다(또는 해당 `cmd / ctrl + shift + enter` 키보드 단축키 사용)

<Image img={run_at_cursor_2} size="lg" border alt="확장된 실행 옵션 메뉴의 커서에서 실행 옵션"/>

- SQL 편집기 컨텍스트 메뉴에서 '커서에서 실행' 선택

<Image img={run_at_cursor} size="lg" border alt="SQL 편집기 컨텍스트 메뉴의 커서에서 실행 옵션"/>

:::note
커서 위치에 있는 명령은 실행 시 노란색으로 깜박입니다.
:::

### 쿼리 취소하기 {#canceling-a-query}

쿼리가 실행되는 동안 쿼리 편집기 툴바의 '실행' 버튼이 '취소' 버튼으로 바뀝니다. 이 버튼을 클릭하거나 `Esc`를 눌러 쿼리를 취소합니다. 참고: 이미 반환된 결과는 취소 후에도 유지됩니다.

<Image img={cancel_a_query} size="lg" border alt="쿼리 실행 중에 나타나는 취소 버튼"/>

### 쿼리 저장하기 {#saving-a-query}

이전 이름이 없는 경우 귀하의 쿼리는 'Untitled Query'라고 불립니다. 쿼리 이름을 클릭하여 변경할 수 있습니다. 쿼리 이름을 바꾸면 쿼리가 저장됩니다.

<Image img={give_a_query_a_name} size="lg" border alt="Untitled Query에서 쿼리 이름을 바꾸는 방법을 보여주는 인터페이스"/>

저장 버튼이나 `cmd / ctrl + s` 키보드 단축키를 사용하여 쿼리를 저장할 수도 있습니다.

<Image img={save_the_query} size="lg" border alt="쿼리 편집기 툴바의 저장 버튼"/>

## 쿼리 관리를 위한 GenAI 사용하기 {#using-genai-to-manage-queries}

이 기능을 사용하면 사용자가 자연어 질문으로 쿼리를 작성하고 쿼리 콘솔에서 사용 가능한 테이블의 컨텍스트에 따라 SQL 쿼리를 생성할 수 있습니다. GenAI는 또한 사용자가 쿼리를 디버깅하는 데 도움이 될 수 있습니다.

GenAI에 대한 자세한 정보는 [ClickHouse Cloud 블로그 게시물에서 GenAI 기반 쿼리 제안 발표](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)를 참조하세요.

### 테이블 설정 {#table-setup}

UK Price Paid 예제 데이터셋을 가져와서 GenAI 쿼리를 생성하는 데 사용해 보겠습니다.

1. ClickHouse Cloud 서비스를 엽니다.
1. _+_ 아이콘을 클릭하여 새 쿼리를 생성합니다.
1. 다음 코드를 붙여넣고 실행합니다:

```sql
CREATE TABLE uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

   이 쿼리는 완료하는 데 약 1초 정도 소요됩니다. 완료되면 `uk_price_paid`라는 빈 테이블이 생성됩니다.

1. 새 쿼리를 만들고 다음 쿼리를 붙여넣습니다:

```sql
INSERT INTO uk_price_paid
WITH
   splitByChar(' ', postcode) AS p
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    p[1] AS postcode1,
    p[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

이 쿼리는 `gov.uk` 웹사이트에서 데이터셋을 가져옵니다. 이 파일은 약 4GB이며, 쿼리 완료에는 몇 분이 소요됩니다. ClickHouse가 쿼리를 처리한 후, `uk_price_paid` 테이블 내에서 전체 데이터셋을 갖게 됩니다.

#### 쿼리 생성 {#query-creation}

자연어를 사용하여 쿼리를 만듭니다.

1. **uk_price_paid** 테이블을 선택한 후 **쿼리 생성**을 클릭합니다.
1. **SQL 생성**을 클릭합니다. 쿼리가 Chat-GPT로 전송된다는 사실을 받아들이라는 요청이 있을 수 있습니다. 계속 진행하려면 **동의합니다**를 선택해야 합니다.
1. 이제 Prompt를 사용하여 자연어 쿼리를 입력하고 ChatGPT가 이를 SQL 쿼리로 변환하도록 할 수 있습니다. 이번 예에서는 다음을 입력할 것입니다:

   > 연도별로 모든 uk_price_paid 거래의 총 가격과 총 수를 보여주세요.

1. 콘솔은 우리가 원하는 쿼리를 생성하고 새 탭에 표시합니다. 이번 예에서는 GenAI가 다음 쿼리를 생성했습니다:

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. 쿼리가 올바른지 확인한 후 **실행**을 클릭하여 실행합니다.

### 디버깅 {#debugging}

이제 GenAI의 쿼리 디버깅 기능을 테스트해 보겠습니다.

1. _+_ 아이콘을 클릭하여 새 쿼리를 만들고 다음 코드를 붙여넣습니다:

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. **실행**을 클릭합니다. 쿼리는 `pricee`에서 값을 가져오려고 하므로 실패합니다.
1. **쿼리 수정**을 클릭합니다.
1. GenAI는 쿼리를 수정하려고 시도합니다. 이 경우 `pricee`를 `price`로 변경했습니다. 상황에 따라 `toYear`가 더 적합한 함수라는 것을 인식했습니다.
1. **적용**을 선택하여 쿼리에 제안된 변경 사항을 추가하고 **실행**을 클릭합니다.

GenAI는 실험적인 기능임을 염두에 두세요. GenAI가 생성한 쿼리를 어떤 데이터셋에 대해서나 실행할 때는 주의가 필요합니다.

## 고급 쿼리 기능 {#advanced-querying-features}

### 쿼리 결과 검색 {#searching-query-results}

쿼리를 실행한 후 반환된 결과 집합을 결과 창의 검색 입력을 사용하여 빠르게 검색할 수 있습니다. 이 기능은 추가적인 `WHERE` 절의 결과를 미리 보기 위해 또는 특정 데이터가 결과 집합에 포함되어 있는지 확인하기 위해 도움이 됩니다. 검색 입력에 값을 입력한 후 결과 창이 업데이트되고 입력된 값과 일치하는 항목을 포함하는 레코드를 반환합니다. 이번 예에서는 `hackernews` 테이블에서 `ClickHouse`를 포함한 댓글에 대한 모든 `breakfast` 인스턴스를 찾아보겠습니다(대소문자 구분 없음):

<Image img={search_hn} size="lg" border alt="Hacker News 데이터 검색"/>

참고: 입력된 값과 일치하는 모든 필드가 반환됩니다. 예를 들어, 위 스크린샷의 세 번째 레코드는 `by` 필드에서 'breakfast'와 일치하지 않지만 `text` 필드는 일치합니다:

<Image img={match_in_body} size="lg" border alt="본문에서의 일치"/>

### 페이지 매김 설정 조정 {#adjusting-pagination-settings}

기본적으로 쿼리 결과 창은 모든 결과 레코드를 단일 페이지에 표시합니다. 더 큰 결과 집합의 경우, 보기 편리하게 결과를 페이지 매김하는 것이 바람직할 수 있습니다. 이는 결과 창 툴바의 오른쪽 하단에 있는 페이지 매김 선택기를 사용하여 수행할 수 있습니다:

<Image img={pagination} size="lg" border alt="페이지 매김 옵션"/>

페이지 크기를 선택하면 결과 집합에 즉시 페이지 매김이 적용되고 내비게이션 옵션이 결과 창 풋터 중앙에 나타납니다.

<Image img={pagination_nav} size="lg" border alt="페이지 매김 내비게이션"/>

### 쿼리 결과 데이터 내보내기 {#exporting-query-result-data}

쿼리 결과 집합은 SQL 콘솔에서 CSV 형식으로 쉽게 내보낼 수 있습니다. 그렇게 하려면 결과 창 툴바의 `•••` 메뉴를 열고 'CSV로 다운로드'를 선택합니다.

<Image img={download_as_csv} size="lg" border alt="CSV로 다운로드"/>

## 쿼리 데이터 시각화 {#visualizing-query-data}

일부 데이터는 차트 형식으로 해석하기가 더 용이할 수 있습니다. SQL 콘솔에서 쿼리 결과 데이터를 기반으로 시각화를 빠르게 생성할 수 있습니다. 예를 들어 NYC 택시 여행의 주간 통계를 계산하는 쿼리를 사용하겠습니다:

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

<Image img={tabular_query_results} size="lg" border alt="표 형태의 쿼리 결과"/>

시각화 없이 이러한 결과는 이해하기 어렵습니다. 이를 차트로 변환해 보겠습니다.

### 차트 만들기 {#creating-charts}

시각화를 구축하기 시작하려면 쿼리 결과 창 툴바에서 '차트' 옵션을 선택합니다. 차트 구성 패널이 나타납니다:

<Image img={switch_from_query_to_chart} size="lg" border alt="쿼리에서 차트로 전환"/>

`주`에 따라 `총 여행 비용`을 추적하는 간단한 막대 차트를 생성하겠습니다. 이를 위해 `주` 필드를 x축으로 드래그하고 `총 여행 비용` 필드를 y축으로 드래그합니다:

<Image img={trip_total_by_week} size="lg" border alt="주별 총 여행 비용"/>

대부분의 차트 유형은 수치 축에 여러 필드를 지원합니다. 이를 보여주기 위해 `fare_total` 필드를 y축에 추가합니다:

<Image img={bar_chart} size="lg" border alt="막대 차트"/>

### 차트 사용자 정의 {#customizing-charts}

SQL 콘솔은 차트 구성 패널의 차트 유형 선택기에서 선택할 수 있는 10가지 차트 유형을 지원합니다. 예를 들어, 이전 차트 유형을 막대 차트에서 영역 차트로 쉽게 변경할 수 있습니다:

<Image img={change_from_bar_to_area} size="lg" border alt="막대 차트에서 영역 차트로 변경"/>

차트 제목은 데이터를 제공하는 쿼리의 이름과 일치합니다. 쿼리의 이름을 업데이트하면 차트 제목도 함께 업데이트됩니다:

<Image img={update_query_name} size="lg" border alt="쿼리 이름 업데이트"/>

'고급' 섹션에서 차트 구성 패널의 여러 고급 차트 특성도 조정할 수 있습니다. 시작하면서 다음 설정을 조정하겠습니다:

- 부제
- 축 제목
- x축에 대한 레이블 방향

차트가 그에 따라 업데이트됩니다:

<Image img={update_subtitle_etc} size="lg" border alt="부제 등 업데이트"/>

일부 시나리오에서는 각 필드의 축 척도를 독립적으로 조정해야 할 필요가 있을 수 있습니다. 이는 축 범위에 대해 최소 및 최대 값을 지정하여 '고급' 섹션에서도 수행할 수 있습니다. 예를 들어, 위의 차트는 좋아 보이지만, 우리의 `총 여행 비용`과 `fare_total` 필드 간의 상관 관계를 보여주기 위해 축 범위를 약간 조정해야 합니다:

<Image img={adjust_axis_scale} size="lg" border alt="축 척도 조정"/>

## 쿼리 공유하기 {#sharing-queries}

SQL 콘솔을 사용하면 팀과 쿼리를 공유할 수 있습니다. 쿼리가 공유되면 팀의 모든 구성원이 쿼리를 보고 수정할 수 있습니다. 공유된 쿼리는 팀과 협업하는 훌륭한 방법입니다.

쿼리를 공유하려면 쿼리 툴바에서 '공유' 버튼을 클릭합니다.

<Image img={sql_console_share} size="lg" border alt="쿼리 툴바의 공유 버튼"/>

대화상자가 열리며, 팀의 모든 구성원과 쿼리를 공유할 수 있게 됩니다. 여러 팀이 있는 경우, 쿼리를 공유할 팀을 선택할 수 있습니다.

<Image img={sql_console_edit_access} size="lg" border alt="공유 쿼리에 대한 편집 접근을 위한 대화상자"/>

<Image img={sql_console_add_team} size="lg" border alt="공유 쿼리에 팀 추가 인터페이스"/>

<Image img={sql_console_edit_member} size="lg" border alt="공유 쿼리에 대한 구성원 접근을 편집하는 인터페이스"/>

일부 시나리오에서는 각 필드의 축 척도를 독립적으로 조정해야 할 필요가 있을 수 있습니다. 이는 차트 구성 패널의 '고급' 섹션에서도 최소 및 최대 값을 지정하여 수행할 수 있습니다. 예를 들어, 위의 차트는 좋아 보이지만, 우리의 `총 여행 비용`과 `fare_total` 필드 간의 상관 관계를 보여주기 위해 축 범위를 약간 조정해야 합니다:

<Image img={sql_console_access_queries} size="lg" border alt="쿼리 목록의 내게 공유된 섹션"/>
