---
title: 'Chartbrew를 ClickHouse에 연결하기'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', '연결', '통합', '시각화']
description: 'Chartbrew를 ClickHouse에 연결하여 실시간 대시보드와 클라이언트 보고서를 만들 수 있습니다.'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
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


# Chartbrew를 ClickHouse에 연결하기 \{#connecting-chartbrew-to-clickhouse\}

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com)는 대시보드를 생성하고 데이터를 실시간으로 모니터링할 수 있는 데이터 시각화 플랫폼입니다. 여러 데이터 소스(ClickHouse 포함)를 지원하며, 차트와 보고서를 생성할 수 있는 노코드 인터페이스를 제공합니다.

## 목표 \{#goal\}

이 가이드에서는 Chartbrew를 ClickHouse에 연결하고, SQL 쿼리를 실행한 다음 시각화를 생성합니다. 완료하면 아래와 비슷한 대시보드를 확인할 수 있습니다.

<Image img={chartbrew_01} size="lg" alt="Chartbrew 대시보드" />

:::tip 데이터를 추가하세요
사용할 데이터셋이 없는 경우 예제 데이터 중 하나를 추가할 수 있습니다. 이 가이드에서는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터셋을 사용합니다.
:::

## 1. 연결 세부 정보 수집 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Chartbrew를 ClickHouse에 연결하기 \{#2-connect-chartbrew-to-clickhouse\}

1. [Chartbrew](https://chartbrew.com/login)에 로그인한 후 **Connections** 탭으로 이동합니다.
2. **Create connection**을 클릭하고, 사용 가능한 데이터베이스 옵션에서 **ClickHouse**를 선택합니다.

   <Image img={chartbrew_02} size="lg" alt="Chartbrew에서 ClickHouse 연결 선택" />

3. ClickHouse 데이터베이스에 대한 연결 정보를 입력합니다.

   - **Display Name**: Chartbrew에서 이 연결을 구분하기 위한 이름입니다.
   - **Host**: ClickHouse 서버의 호스트명 또는 IP 주소입니다.
   - **Port**: HTTPS 연결의 기본 포트는 보통 `8443`입니다.
   - **Database Name**: 연결하려는 데이터베이스입니다.
   - **Username**: ClickHouse 사용자 이름입니다.
   - **Password**: ClickHouse 비밀번호입니다.

   <Image img={chartbrew_03} size="lg" alt="Chartbrew의 ClickHouse 연결 설정" />

4. **Test connection**을 클릭하여 Chartbrew가 ClickHouse에 연결할 수 있는지 확인합니다.
5. 테스트가 성공하면 **Save connection**을 클릭합니다. 그러면 Chartbrew가 ClickHouse에서 스키마를 자동으로 가져옵니다.

   <Image img={chartbrew_04} size="lg" alt="Chartbrew의 ClickHouse JSON 스키마" />

## 3. 데이터 세트 생성 및 SQL 쿼리 실행 \{#3-create-a-dataset-and-run-a-sql-query\}

1. **Create dataset** 버튼을 클릭하거나 **Datasets** 탭으로 이동하여 데이터 세트를 생성합니다.
2. 이전에 생성한 ClickHouse 연결을 선택합니다.

<Image img={chartbrew_05} size="lg" alt="데이터 세트를 위한 ClickHouse 연결 선택" />

시각화하려는 데이터를 조회하기 위한 SQL 쿼리를 작성합니다. 예를 들어, 다음 쿼리는 `uk_price_paid` 데이터 세트에서 연도별로 지불된 평균 가격을 계산합니다.

```sql
  SELECT toYear(date) AS year, avg(price) AS avg_price
  FROM uk_price_paid
  GROUP BY year
  ORDER BY year;
```

<Image img={chartbrew_07} size="lg" alt="Chartbrew에서 ClickHouse SQL 쿼리 실행 화면" />

데이터를 조회하려면 **Run query**를 클릭합니다.

쿼리를 어떻게 작성해야 할지 잘 모르겠다면, 데이터베이스 스키마를 기반으로 SQL 쿼리를 생성해 주는 **Chartbrew의 AI assistant**를 사용할 수 있습니다.

<Image img={chartbrew_06} size="lg" alt="Chartbrew에서 ClickHouse AI SQL assistant 사용 화면" />

데이터가 조회되면 시각화 옵션을 설정하기 위해 **Configure dataset**을 클릭합니다.


## 4. 시각화 생성 \{#4-create-a-visualization\}

1. 시각화를 위해 메트릭(수치 값)과 차원(범주형 값)을 정의합니다.
  2. 데이터셋을 미리 확인하여 쿼리 결과의 구조가 올바르게 구성되었는지 검증합니다.
  3. 차트 유형(예: 꺾은선형 차트, 막대 차트, 파이 차트)을 선택하고 대시보드에 추가합니다.
  4. **Complete dataset** 버튼을 클릭하여 구성을 완료합니다.

<Image img={chartbrew_08} size="lg" alt="ClickHouse 데이터가 포함된 Chartbrew 대시보드" />

데이터의 다양한 측면을 시각화하기 위해 원하는 만큼 데이터셋을 생성할 수 있습니다. 이러한 데이터셋을 사용하여 여러 개의 대시보드를 만들고 서로 다른 메트릭을 추적할 수 있습니다.

<Image img={chartbrew_01} size="lg" alt="ClickHouse 데이터가 포함된 Chartbrew 대시보드" />

## 5. 데이터 업데이트 자동화 \{#5-automate-data-updates\}

대시보드를 최신 상태로 유지하려면 데이터가 자동으로 업데이트되도록 예약할 수 있습니다:

1. 데이터셋 새로고침 버튼 옆의 캘린더 아이콘을 클릭합니다.
  2. 업데이트 간격을 설정합니다(예: 매시간, 매일).
  3. 자동 새로고침을 활성화하려면 설정을 저장합니다.

<Image img={chartbrew_09} size="lg" alt="Chartbrew 데이터셋 새로고침 설정" />

## 더 알아보기 \{#learn-more\}

자세한 내용은 [Chartbrew와 ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/)에 대한 블로그 게시글을 참고하십시오.