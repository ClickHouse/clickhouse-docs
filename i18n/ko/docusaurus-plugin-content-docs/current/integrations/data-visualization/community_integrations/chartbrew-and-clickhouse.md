---
'title': 'Chartbrew를 ClickHouse에 연결하기'
'sidebar_label': 'Chartbrew'
'sidebar_position': 131
'slug': '/integrations/chartbrew-and-clickhouse'
'keywords':
- 'ClickHouse'
- 'Chartbrew'
- 'connect'
- 'integrate'
- 'visualization'
'description': 'Chartbrew를 ClickHouse에 연결하여 실시간 대시보드 및 클라이언트 보고서를 생성합니다.'
'doc_type': 'guide'
---

import chartbrew_01 from '@site/static/images/integrations/data-visualization/chartbrew_01.png';
import chartbrew_02 from '@site/static/images/integrations/data-visualization/chartbrew_02.png';
import chartbrew_03 from '@site/static/images/integrations/data-visualization/chartbrew_03.png';
import chartbrew_04 from '@site/static/images/integrations/data-visualization/chartbrew_04.png';
import chartbrew_05 from '@site/static/images/integrations/data-visualization/chartbrew_05.png';
import chartbrew_06 from '@site/static/images/integrations/data-visualization/chartbrew_06.png';
import chartbrew_07 from '@site/static/images/integrations/data-visualization/chartbrew_07.png';
import chartbrew_08 from '@site/static/images/integrations/data-visualization/chartbrew_08.png';
import chartbrew_09 from '@site/static/images/integrations/data-visualization/chartbrew_09.png';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# Connecting Chartbrew to ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com)는 사용자가 대시보드를 생성하고 데이터를 실시간으로 모니터링할 수 있도록 하는 데이터 시각화 플랫폼입니다. ClickHouse를 포함한 여러 데이터 소스를 지원하며 차트 및 보고서를 만들기 위한 무코드 인터페이스를 제공합니다.

## Goal {#goal}

이 가이드에서는 Chartbrew를 ClickHouse에 연결하고 SQL 쿼리를 실행하며 시각화를 생성합니다. 완료 시, 귀하의 대시보드는 다음과 비슷할 수 있습니다:

<Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard" />

:::tip 데이터 추가
작업할 데이터 세트가 없는 경우 예제 중 하나를 추가할 수 있습니다. 이 가이드는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터 세트를 사용합니다.
:::

## 1. 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Chartbrew를 ClickHouse에 연결 {#2-connect-chartbrew-to-clickhouse}

1. [Chartbrew](https://chartbrew.com/login)에 로그인하고 **Connections** 탭으로 이동합니다.
2. **Create connection**을 클릭하고 사용 가능한 데이터베이스 옵션에서 **ClickHouse**를 선택합니다.

   <Image img={chartbrew_02} size="lg" alt="Select ClickHouse connection in Chartbrew" />

3. ClickHouse 데이터베이스에 대한 연결 세부정보를 입력합니다:

   - **Display Name**: Chartbrew에서 연결을 식별할 이름.
   - **Host**: ClickHouse 서버의 호스트명 또는 IP 주소.
   - **Port**: 일반적으로 HTTPS 연결에 대해 `8443`.
   - **Database Name**: 연결할 데이터베이스.
   - **Username**: ClickHouse 사용자 이름.
   - **Password**: ClickHouse 비밀번호.

   <Image img={chartbrew_03} size="lg" alt="ClickHouse connection settings in Chartbrew" />

4. **Test connection**을 클릭하여 Chartbrew가 ClickHouse에 연결할 수 있는지 확인합니다.
5. 테스트가 성공하면 **Save connection**을 클릭합니다. Chartbrew는 ClickHouse에서 스키마를 자동으로 가져옵니다.

   <Image img={chartbrew_04} size="lg" alt="ClickHouse JSON schema in Chartbrew" />

## 3. 데이터셋 생성 및 SQL 쿼리 실행 {#3-create-a-dataset-and-run-a-sql-query}

  1. **Create dataset** 버튼을 클릭하거나 **Datasets** 탭으로 이동하여 생성합니다.
  2. 이전에 만든 ClickHouse 연결을 선택합니다.

  <Image img={chartbrew_05} size="lg" alt="Select ClickHouse connection for dataset" />

  시각화하려는 데이터를 검색하기 위해 SQL 쿼리를 작성합니다. 예를 들어, 이 쿼리는 `uk_price_paid` 데이터 세트에서 연도별로 지불된 평균 가격을 계산합니다:

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

  <Image img={chartbrew_07} size="lg" alt="ClickHouse SQL query in Chartbrew" />

  **Run query**를 클릭하여 데이터를 가져옵니다.

  쿼리 작성 방법이 확실하지 않은 경우 **Chartbrew의 AI assistant**를 사용하여 데이터베이스 스키마를 기반으로 SQL 쿼리를 생성할 수 있습니다.

<Image img={chartbrew_06} size="lg" alt="ClickHouse AI SQL assistant in Chartbrew" />

데이터가 검색되면 **Configure dataset**를 클릭하여 시각화 매개변수를 설정합니다.

## 4. 시각화 생성 {#4-create-a-visualization}

  1. 시각화를 위해 메트릭(수치 값)과 차원(범주 값)을 정의합니다.
  2. 쿼리 결과가 올바르게 구조화되었는지 확인하기 위해 데이터 세트를 미리 봅니다.
  3. 차트 유형(예: 선 차트, 막대 차트, 원형 차트)을 선택하고 대시보드에 추가합니다.
  4. 설정을 완료하려면 **Complete dataset**을 클릭합니다.

  <Image img={chartbrew_08} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

  다양한 데이터의 다른 측면을 시각화하기 위해 원하는 만큼 데이터 세트를 생성할 수 있습니다. 이 데이터 세트를 사용하여 다른 메트릭을 추적하기 위해 여러 개의 대시보드를 만들 수 있습니다.

  <Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

## 5. 데이터 업데이트 자동화 {#5-automate-data-updates}

  대시보드를 최신 상태로 유지하려면 자동 데이터 업데이트를 예약할 수 있습니다:

  1. 데이터 세트 새로 고침 버튼 옆의 달력 아이콘을 클릭합니다.
  2. 업데이트 간격(예: 매시간, 매일)을 설정합니다.
  3. 자동 새로 고침을 활성화하려면 설정을 저장합니다.

  <Image img={chartbrew_09} size="lg" alt="Chartbrew dataset refresh settings" />

## Learn more {#learn-more}

자세한 내용은 [Chartbrew와 ClickHouse에 대한 블로그 글](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/)을 확인하세요.
