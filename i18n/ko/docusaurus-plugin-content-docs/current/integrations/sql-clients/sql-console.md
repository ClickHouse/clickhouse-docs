---
sidebar_label: 'SQL 콘솔'
sidebar_position: 1
title: 'SQL 콘솔'
slug: /integrations/sql-clients/sql-console
description: 'SQL 콘솔 알아보기'
doc_type: 'guide'
keywords: ['SQL 콘솔', '쿼리 인터페이스', '웹 UI', 'SQL 에디터', 'Cloud 콘솔']
integration:
   - support_level: 'community'
   - category: 'sql_client'
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


# SQL Console \{#sql-console\}

SQL Console은 ClickHouse Cloud에서 데이터베이스를 탐색하고 쿼리하는 가장 빠르고 쉬운 방법입니다. SQL Console을 사용하면 다음을 수행할 수 있습니다:

- ClickHouse Cloud 서비스에 연결할 수 있습니다.
- 테이블 데이터를 조회, 필터링 및 정렬할 수 있습니다.
- 몇 번의 클릭만으로 쿼리를 실행하고 결과 데이터를 시각화할 수 있습니다.
- 팀 구성원과 쿼리를 공유하여 보다 효율적으로 협업할 수 있습니다.

## 테이블 살펴보기 \{#exploring-tables\}

### 테이블 목록 및 스키마 정보 보기 \{#viewing-table-list-and-schema-info\}

ClickHouse 인스턴스에 포함된 테이블 개요는 왼쪽 사이드바 영역에서 확인할 수 있습니다. 왼쪽 사이드바 상단의 데이터베이스 선택기를 사용하여 특정 데이터베이스의 테이블을 조회하십시오.

<Image img={table_list_and_schema} size="lg" border alt="왼쪽 사이드바에 데이터베이스 테이블을 표시하는 테이블 목록 및 스키마 뷰"/>

목록의 테이블은 확장하여 컬럼과 데이터 타입을 확인할 수도 있습니다.

<Image img={view_columns} size="lg" border alt="컬럼 이름과 데이터 타입을 표시하도록 확장된 테이블 뷰"/>

### 테이블 데이터 탐색 \{#exploring-table-data\}

목록에서 테이블을 클릭하면 새 탭에서 열립니다. Table View에서는 데이터를 손쉽게 확인하고, 선택하고, 복사할 수 있습니다. Microsoft Excel, Google Sheets와 같은 스프레드시트 애플리케이션으로 복사·붙여넣기할 때 구조와 서식이 그대로 유지됩니다. 페이지 하단의 탐색 기능을 사용하여 테이블 데이터 페이지를 이동할 수 있으며, 페이지는 30행 단위로 구분됩니다.

<Image img={abc} size="lg" border alt="데이터를 선택하고 복사할 수 있는 Table View 화면"/>

### 셀 데이터 검사 \{#inspecting-cell-data\}

Cell Inspector 도구를 사용하면 하나의 셀에 포함된 대량의 데이터를 확인할 수 있습니다. 셀을 마우스 오른쪽 버튼으로 클릭한 후 「Inspect Cell」을 선택하면 셀 인스펙터가 열립니다. 셀 인스펙터에 표시된 내용은 오른쪽 상단에 있는 복사 아이콘을 클릭하여 복사할 수 있습니다.

<Image img={inspecting_cell_content} size="lg" border alt="선택한 셀의 내용을 표시하는 셀 인스펙터 대화 상자"/>

## 테이블 필터링과 정렬 \{#filtering-and-sorting-tables\}

### 테이블 정렬하기 \{#sorting-a-table\}

SQL 콘솔에서 테이블을 정렬하려면 테이블을 연 다음 도구 모음에서 'Sort' 버튼을 클릭합니다. 이 버튼을 클릭하면 정렬을 구성할 수 있는 메뉴가 열립니다. 정렬 기준이 될 컬럼을 선택하고 정렬 순서(오름차순 또는 내림차순)를 설정할 수 있습니다. 'Apply'를 선택하거나 Enter 키를 눌러 테이블을 정렬합니다.

<Image img={sort_descending_on_column} size="lg" border alt="컬럼에 대해 내림차순 정렬 구성을 보여 주는 정렬 대화 상자"/>

SQL 콘솔에서는 하나의 테이블에 여러 정렬 조건을 추가할 수도 있습니다. 다른 정렬 조건을 추가하려면 'Sort' 버튼을 한 번 더 클릭합니다. 참고: 정렬은 정렬 패널에 표시된 순서(위에서 아래 순서)대로 적용됩니다. 정렬 조건을 제거하려면 해당 정렬 옆에 있는 'x' 버튼을 클릭하면 됩니다.

### 테이블 필터링 \{#filtering-a-table\}

SQL 콘솔에서 테이블을 필터링하려면 테이블을 연 후 'Filter' 버튼을 클릭합니다. 정렬과 마찬가지로 이 버튼을 클릭하면 필터를 구성할 수 있는 메뉴가 열립니다. 필터링에 사용할 컬럼을 선택하고 필요한 조건을 지정할 수 있습니다. SQL 콘솔은 해당 컬럼에 포함된 데이터 유형에 맞는 필터 옵션을 지능적으로 표시합니다.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="라디오 컬럼이 GSM과 같은 값으로 필터링되도록 구성된 필터 대화 상자"/>

필터 구성이 완료되면 'Apply'를 선택하여 데이터를 필터링합니다. 아래 예시와 같이 추가 필터를 설정할 수도 있습니다.

<Image img={add_more_filters} size="lg" border alt="범위가 2000보다 큰 값으로 추가 필터를 구성하는 방법을 보여주는 대화 상자"/>

정렬 기능과 마찬가지로 필터를 제거하려면 필터 옆의 'x' 버튼을 클릭합니다.

### 필터링과 정렬을 함께 사용하기 \{#filtering-and-sorting-together\}

SQL 콘솔에서는 테이블에 필터를 적용하고 정렬을 동시에 수행할 수 있습니다. 이렇게 하려면 위에서 설명한 단계에 따라 원하는 모든 필터와 정렬을 추가한 다음 「Apply」 버튼을 클릭합니다.

<Image img={filtering_and_sorting_together} size="lg" border alt="필터링과 정렬이 동시에 적용된 인터페이스 화면"/>

### 필터와 정렬에서 쿼리 생성하기 \{#creating-a-query-from-filters-and-sorts\}

SQL 콘솔은 한 번의 클릭으로 정렬과 필터를 직접 쿼리로 변환할 수 있습니다. 원하는 정렬 및 필터 매개변수를 설정한 뒤, 도구 모음에서 「Create Query」 버튼을 선택하십시오. 「Create Query」를 클릭하면, 테이블 뷰에 포함된 데이터에 해당하는 SQL 명령이 미리 채워진 새로운 쿼리 탭이 열립니다.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="필터와 정렬에서 SQL을 생성하는 Create Query 버튼을 보여주는 인터페이스"/>

:::note
「Create Query」 기능을 사용할 때 필터와 정렬은 필수가 아닙니다.
:::

SQL 콘솔에서 쿼리를 실행하는 방법에 대한 더 자세한 내용은 (link)에 있는 쿼리 문서를 참고하십시오.

## 쿼리 작성 및 실행 \{#creating-and-running-a-query\}

### 쿼리 생성하기 \{#creating-a-query\}

SQL 콘솔에서 새 쿼리를 생성하는 방법은 두 가지가 있습니다.

- 탭 바에서 '+' 버튼을 클릭합니다.
- 왼쪽 사이드바의 쿼리 목록에서 'New Query' 버튼을 선택합니다.

<Image img={creating_a_query} size="lg" border alt="＋ 버튼 또는 New Query 버튼을 사용하여 새 쿼리를 생성하는 방법을 보여주는 인터페이스"/>

### 쿼리 실행 \{#running-a-query\}

쿼리를 실행하려면 SQL Editor에 SQL 명령을 입력한 후 「Run」 버튼을 클릭하거나 `cmd / ctrl + enter` 단축키를 사용합니다. 여러 명령을 순차적으로 작성하고 실행하려면 각 명령 뒤에 세미콜론을 추가해야 합니다.

쿼리 실행 옵션  
기본적으로 Run 버튼을 클릭하면 SQL Editor에 포함된 모든 명령이 실행됩니다. SQL 콘솔은 다음과 같은 두 가지 추가 쿼리 실행 옵션을 지원합니다:

- 선택한 명령 실행
- 커서 위치의 명령 실행

선택한 명령을 실행하려면 실행하려는 명령 또는 명령들의 순서를 선택한 후 「Run」 버튼을 클릭하거나 `cmd / ctrl + enter` 단축키를 사용합니다. 선택 영역이 있을 때는 SQL Editor 컨텍스트 메뉴(에디터 영역에서 마우스 오른쪽 버튼 클릭으로 열기)에서 「Run selected」를 선택할 수도 있습니다.

<Image img={run_selected_query} size="lg" border alt="SQL 쿼리에서 선택한 부분만 실행하는 방법을 보여주는 화면"/>

현재 커서 위치의 명령을 실행하는 방법은 두 가지입니다:

- 확장 Run 옵션 메뉴에서 「At Cursor」를 선택하거나 해당 `cmd / ctrl + shift + enter` 키보드 단축키를 사용합니다

<Image img={run_at_cursor_2} size="lg" border alt="확장 Run 옵션 메뉴의 Run at cursor 옵션"/>

- SQL Editor 컨텍스트 메뉴에서 「Run at cursor」를 선택합니다

<Image img={run_at_cursor} size="lg" border alt="SQL Editor 컨텍스트 메뉴의 Run at cursor 옵션"/>

:::note
커서 위치에 있는 명령은 실행 시 노란색으로 깜빡입니다.
:::

### 쿼리 취소하기 \{#canceling-a-query\}

쿼리가 실행 중일 때 Query Editor 도구 모음의 "Run" 버튼은 "Cancel" 버튼으로 바뀝니다. 이 버튼을 클릭하거나 `Esc` 키를 눌러 쿼리를 취소하면 됩니다. 참고: 이미 반환된 결과는 취소 후에도 유지됩니다.

<Image img={cancel_a_query} size="lg" border alt="쿼리 실행 중에 표시되는 Cancel 버튼"/>

### 쿼리 저장하기 \{#saving-a-query\}

이전에 이름을 지정하지 않았다면 쿼리 이름은 'Untitled Query'로 표시됩니다. 쿼리 이름을 클릭하여 변경할 수 있습니다. 쿼리 이름을 변경하면 쿼리가 저장됩니다.

<Image img={give_a_query_a_name} size="lg" border alt="Untitled Query에서 쿼리 이름을 변경하는 방법을 보여주는 인터페이스"/>

저장 버튼이나 `cmd / ctrl + s` 키보드 단축키를 사용해 쿼리를 저장할 수도 있습니다.

<Image img={save_the_query} size="lg" border alt="쿼리 편집기 도구 모음에 있는 저장 버튼"/>

## GenAI를 사용하여 쿼리 관리하기 \{#using-genai-to-manage-queries\}

이 기능을 사용하면 자연어 질문으로 쿼리를 작성하고, 사용 가능한 테이블 컨텍스트를 기반으로 쿼리 콘솔에서 SQL 쿼리를 생성하도록 할 수 있습니다. GenAI는 쿼리 디버깅에도 도움이 됩니다.

GenAI에 대한 자세한 내용은 [「Announcing GenAI powered query suggestions in ClickHouse Cloud」 블로그 게시글](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)을 참고하십시오.

### Table setup \{#table-setup\}

UK Price Paid 예제 데이터셋을 가져와서 GenAI 쿼리를 만드는 데 사용합니다.

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

   이 쿼리는 약 1초 정도면 완료됩니다. 완료되면 `uk_price_paid`라는 비어 있는 테이블이 생성됩니다.

1. 새 쿼리를 생성한 뒤 다음 쿼리를 붙여넣습니다:

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

이 쿼리는 `gov.uk` 웹사이트에서 데이터셋을 가져옵니다. 이 파일은 약 4GB이므로 이 쿼리가 완료되는 데 몇 분 정도 소요됩니다. ClickHouse가 쿼리 처리를 마치면 `uk_price_paid` 테이블에 전체 데이터셋이 저장됩니다.

#### 쿼리 생성 \{#query-creation\}

자연어로 쿼리를 생성해 보겠습니다.

1. **uk_price_paid** 테이블을 선택한 다음 **Create Query**를 클릭합니다.
1. **Generate SQL**을 클릭합니다. 쿼리가 ChatGPT로 전송된다는 내용에 동의하라는 요청이 표시될 수 있습니다. 계속하려면 **I agree**를 선택해야 합니다.
1. 이제 이 프롬프트를 사용하여 자연어 쿼리를 입력하면 ChatGPT가 이를 SQL 쿼리로 변환합니다. 이 예제에서는 다음 내용을 입력합니다:

   > 연도별로 모든 uk_price_paid 트랜잭션의 총 가격과 총 개수를 보여 주세요.

1. 콘솔에서 원하는 쿼리가 생성되어 새 탭에 표시됩니다. 이 예제에서 GenAI가 생성한 쿼리는 다음과 같습니다:

   ```sql
   -- 연도별로 모든 uk_price_paid 트랜잭션의 총 가격과 총 개수를 보여 줍니다.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 쿼리가 올바른지 확인했다면 **Run**을 클릭하여 실행합니다.

### 디버깅 \{#debugging\}

이제 GenAI의 쿼리 디버깅 기능을 테스트해 보겠습니다.

1. _+_ 아이콘을 클릭하여 새 쿼리를 생성한 다음, 다음 코드를 붙여넣습니다.

   ```sql
   -- 연도별로 모든 uk_price_paid 트랜잭션의 총 가격과 총 개수를 보여 주세요.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **Run**을 클릭합니다. `price` 대신 `pricee`에서 값을 가져오려고 하기 때문에 쿼리가 실패합니다.
1. **Fix Query**를 클릭합니다.
1. GenAI가 쿼리를 수정하려고 시도합니다. 이 경우 `pricee`를 `price`로 변경했습니다. 또한 이 상황에서는 `toYear`가 더 적합한 함수라는 점을 인식했습니다.
1. 제안된 변경 내용을 쿼리에 적용하려면 **Apply**를 선택한 후 **Run**을 클릭합니다.

GenAI는 실험적인 기능입니다. 모든 데이터셋에서 GenAI가 생성한 쿼리를 실행할 때는 주의해야 합니다.

## 고급 쿼리 기능 \{#advanced-querying-features\}

### 쿼리 결과 검색 \{#searching-query-results\}

쿼리가 실행된 후 결과 패널의 검색 입력 필드를 사용하여 반환된 결과 집합을 빠르게 검색할 수 있습니다. 이 기능은 추가 `WHERE` 절의 결과를 미리 살펴보거나 특정 데이터가 결과 집합에 포함되어 있는지 확인하는 데 도움이 됩니다. 검색 입력 필드에 값을 입력하면 결과 패널이 업데이트되고, 입력한 값과 일치하는 항목을 포함하는 레코드를 반환합니다. 이 예에서는 `ClickHouse`가 포함된 댓글 중 `hackernews` 테이블에서 `breakfast`가 등장하는 모든 사례를 찾아보겠습니다(대소문자를 구분하지 않습니다).

<Image img={search_hn} size="lg" border alt="Hacker News 데이터 검색"/>

참고: 입력한 값과 일치하는 필드를 가진 레코드는 모두 반환됩니다. 예를 들어, 위 스크린샷의 세 번째 레코드는 `by` 필드에는 `breakfast`가 없지만 `text` 필드에는 포함되어 있습니다.

<Image img={match_in_body} size="lg" border alt="본문에서의 일치 항목"/>

### 페이지네이션 설정 조정 \{#adjusting-pagination-settings\}

기본적으로 쿼리 결과 창은 모든 결과 레코드를 단일 페이지에 표시합니다. 결과 집합이 큰 경우 결과를 더 쉽게 확인할 수 있도록 페이지네이션을 적용하는 것이 더 적합할 수 있습니다. 이는 결과 창 오른쪽 하단에 있는 페이지네이션 선택기를 사용하여 설정할 수 있습니다:

<Image img={pagination} size="lg" border alt="페이지네이션 옵션"/>

페이지 크기를 선택하면 페이지네이션이 즉시 결과 집합에 적용되고, 결과 창 하단 가운데에 탐색 옵션이 표시됩니다.

<Image img={pagination_nav} size="lg" border alt="페이지네이션 탐색"/>

### 쿼리 결과 데이터 내보내기 \{#exporting-query-result-data\}

쿼리 결과 집합은 SQL 콘솔에서 직접 CSV 형식으로 쉽게 내보낼 수 있습니다. 이 작업을 하려면 결과 창 도구 모음의 오른쪽에 있는 `•••` 메뉴를 열고 「Download as CSV」를 선택합니다.

<Image img={download_as_csv} size="lg" border alt="Download as CSV 기능"/>

## 쿼리 데이터 시각화 \{#visualizing-query-data\}

일부 데이터는 차트 형태로 표현했을 때 더 쉽게 해석할 수 있습니다. SQL 콘솔에서 쿼리 결과 데이터를 기반으로 몇 번의 클릭만으로 빠르게 시각화를 생성할 수 있습니다. 예를 들어, NYC 택시 운행에 대한 주간 통계를 계산하는 쿼리를 사용합니다.

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

<Image img={tabular_query_results} size="lg" border alt="표 형식 쿼리 결과" />

시각화되지 않은 상태에서는 이러한 결과를 해석하기가 어렵습니다. 이제 이를 차트로 시각화해 보겠습니다.


### 차트 생성 \{#creating-charts\}

시각화 구성을 시작하려면 쿼리 결과 창 도구 모음에서 「Chart」 옵션을 선택합니다. 그러면 차트 구성 창이 표시됩니다:

<Image img={switch_from_query_to_chart} size="lg" border alt="쿼리에서 차트로 전환"/>

`week`별 `trip_total`을 추적하는 간단한 막대 차트를 만들어 보겠습니다. 이를 위해 `week` 필드를 x축으로, `trip_total` 필드를 y축으로 끌어옵니다:

<Image img={trip_total_by_week} size="lg" border alt="주별 trip_total"/>

대부분의 차트 유형은 수치 축에 여러 필드를 올릴 수 있습니다. 이를 보여주기 위해 fare_total 필드를 y축으로 끌어오겠습니다:

<Image img={bar_chart} size="lg" border alt="막대 차트"/>

### 차트 사용자 지정 \{#customizing-charts\}

SQL 콘솔은 차트 구성 패널의 차트 유형 선택기에서 선택할 수 있는 10개의 차트 유형을 지원합니다. 예를 들어, 이전 차트 유형을 Bar에서 Area로 쉽게 변경할 수 있습니다:

<Image img={change_from_bar_to_area} size="lg" border alt="Bar 차트에서 Area 차트로 변경"/>

차트 제목은 데이터를 제공하는 쿼리 이름과 동일합니다. 쿼리 이름을 변경하면 차트 제목도 함께 변경됩니다:

<Image img={update_query_name} size="lg" border alt="쿼리 이름 업데이트"/>

보다 고급 차트 속성은 차트 구성 패널의 「Advanced」 섹션에서 조정할 수 있습니다. 먼저 다음 설정을 조정해 보겠습니다:

- 부제목
- 축 제목
- x축 레이블 방향

차트는 이에 맞게 업데이트됩니다:

<Image img={update_subtitle_etc} size="lg" border alt="부제목 등 업데이트"/>

일부 상황에서는 각 필드에 대해 축 스케일을 개별적으로 조정해야 할 수도 있습니다. 이는 축 범위에 대한 최소값과 최대값을 지정하여 차트 구성 패널의 「Advanced」 섹션에서 수행할 수 있습니다. 예를 들어, 위 차트는 보기에는 좋지만 `trip_total` 및 `fare_total` 필드 간의 상관관계를 보여 주기 위해서는 축 범위를 약간 조정해야 합니다:

<Image img={adjust_axis_scale} size="lg" border alt="축 스케일 조정"/>

## 쿼리 공유 \{#sharing-queries\}

SQL 콘솔을 사용하면 팀과 쿼리를 공유할 수 있습니다. 쿼리를 공유하면 팀의 모든 구성원이 해당 쿼리를 보고 수정할 수 있습니다. 공유 쿼리는 팀과 협업하는 데 매우 유용합니다.

쿼리를 공유하려면 쿼리 도구 모음에서 「Share」 버튼을 클릭하십시오.

<Image img={sql_console_share} size="lg" border alt="쿼리 도구 모음의 Share 버튼"/>

대화 상자가 열리며, 여기에서 팀의 모든 구성원과 쿼리를 공유할 수 있습니다. 여러 팀이 있는 경우 어떤 팀과 쿼리를 공유할지 선택할 수 있습니다.

<Image img={sql_console_edit_access} size="lg" border alt="공유된 쿼리에 대한 접근 권한을 편집하는 대화 상자"/>

<Image img={sql_console_add_team} size="lg" border alt="공유된 쿼리에 팀을 추가하는 인터페이스"/>

<Image img={sql_console_edit_member} size="lg" border alt="공유된 쿼리에 대한 구성원 접근 권한을 편집하는 인터페이스"/>

일부 상황에서는 각 필드에 대해 축 스케일을 개별적으로 조정해야 할 수 있습니다. 이것은 차트 구성 창의 「Advanced」 섹션에서 축 범위의 최소값과 최대값을 지정하여 수행할 수 있습니다. 예를 들어, 위 차트는 전반적으로는 적절해 보이지만, `trip_total` 및 `fare_total` 필드 간의 상관관계를 보여 주기 위해서는 축 범위를 약간 조정할 필요가 있습니다:

<Image img={sql_console_access_queries} size="lg" border alt="쿼리 목록의 Shared with me 영역"/>