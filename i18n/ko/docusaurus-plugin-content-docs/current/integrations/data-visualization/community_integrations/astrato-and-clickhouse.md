---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato는 분석 기능을 모든 사용자에게 제공하여 엔터프라이즈 및 데이터 비즈니스에 진정한 셀프 서비스 BI를 제공합니다. 이를 통해 사용자는 IT 도움 없이도 스스로 대시보드, 보고서 및 데이터 앱을 구축하고 데이터 관련 질문에 대한 답을 도출할 수 있습니다. Astrato는 도입을 촉진하고 의사결정 속도를 높이며, 하나의 플랫폼에서 분석, 임베디드 분석, 데이터 입력 및 데이터 앱을 통합합니다. Astrato는 실행과 분석을 하나로 결합하고, 라이브 write-back을 지원하며, ML 모델과 상호작용하고, AI로 분석을 가속화하여 단순한 대시보드를 넘어설 수 있도록 합니다. 이는 Astrato의 pushdown SQL 지원 덕분에 가능합니다.'
title: 'Astrato를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import astrato_1_dataconnection from '@site/static/images/integrations/data-visualization/astrato_1_dataconnection.png';
import astrato_2a_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2a_clickhouse_connection.png';
import astrato_2b_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2b_clickhouse_connection.png';
import astrato_3_user_access from '@site/static/images/integrations/data-visualization/astrato_3_user_access.png';
import astrato_4a_clickhouse_data_view from '@site/static/images/integrations/data-visualization/astrato_4a_clickhouse_data_view.png';
import astrato_4b_clickhouse_data_view_joins from '@site/static/images/integrations/data-visualization/astrato_4b_clickhouse_data_view_joins.png';
import astrato_4c_clickhouse_completed_data_view from '@site/static/images/integrations/data-visualization/astrato_4c_clickhouse_completed_data_view.png';
import astrato_5a_clickhouse_build_chart from '@site/static/images/integrations/data-visualization/astrato_5a_clickhouse_build_chart.png';
import astrato_5b_clickhouse_view_sql from '@site/static/images/integrations/data-visualization/astrato_5b_clickhouse_view_sql.png';
import astrato_5c_clickhouse_complete_dashboard from '@site/static/images/integrations/data-visualization/astrato_5c_clickhouse_complete_dashboard.png';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Astrato를 ClickHouse에 연결하기 \{#connecting-astrato-to-clickhouse\}

<CommunityMaintainedBadge/>

Astrato는 Pushdown SQL을 사용하여 ClickHouse Cloud 또는 온프레미스 ClickHouse 배포 환경에 직접 쿼리를 실행합니다. 즉, 업계 선도적인 ClickHouse 성능을 기반으로 필요한 모든 데이터에 자유롭게 접근할 수 있습니다.

## 필요한 연결 데이터 \{#connection-data-required\}

데이터 연결을 설정하려면 다음 정보가 필요합니다.

- 데이터 연결: 호스트 이름, 포트

- 데이터베이스 인증 정보: 사용자 이름, 비밀번호

<ConnectionDetails />

## ClickHouse에 대한 데이터 연결 생성 \{#creating-the-data-connection-to-clickhouse\}

- 사이드바에서 **Data**를 선택한 후 **Data Connection** 탭을 선택합니다
(또는 다음 링크로 이동합니다: https://app.astrato.io/data/sources)
​
- 화면 오른쪽 상단의 **New Data Connection** 버튼을 클릭합니다.

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato 데이터 연결" border />

- **ClickHouse**를 선택합니다.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse 데이터 연결" border />

- 연결 대화 상자에서 필수 필드를 모두 입력합니다.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato ClickHouse 필수 필드 연결" border />

- **Test Connection**을 클릭합니다. 연결에 성공하면 데이터 연결에 **이름**을 지정하고 **Next**를 클릭합니다.

- 데이터 연결에 대한 **user access**를 설정하고 **connect**를 클릭합니다.

<Image size="md" img={astrato_3_user_access} alt="Astrato ClickHouse User Access 연결" border />

-   연결과 데이터 뷰(dataview)가 생성됩니다.

:::note
중복 데이터 소스가 생성되면 데이터 소스 이름에 타임스탬프가 추가됩니다.
:::

## 시맨틱 모델 / 데이터 뷰 생성 \{#creating-a-semantic-model--data-view\}

Data View 편집기에서 ClickHouse에 있는 모든 테이블과 스키마를 확인할 수 있습니다. 시작하려면 사용할 항목을 선택하십시오.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato가 ClickHouse 사용자 액세스에 연결" border />

데이터를 선택했다면 이제 **데이터 뷰(data view)**를 정의합니다. 웹페이지 오른쪽 상단에 있는 「define」을 클릭하십시오.

여기에서는 데이터를 조인할 수 있을 뿐 아니라, **거버넌스가 적용된 차원과 측정값을 생성**하여 여러 팀 전반에서 비즈니스 로직의 일관성을 유지하는 데 적합합니다.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato가 ClickHouse 사용자 액세스에 연결" border />

**Astrato는 메타데이터를 활용해 조인을 지능적으로 제안**하며, 여기에는 ClickHouse의 키도 포함됩니다. 제안된 조인을 사용하면 잘 관리된 ClickHouse 데이터를 기반으로, 처음부터 다시 설계할 필요 없이 손쉽게 시작할 수 있습니다. 또한 Astrato에서 모든 제안을 자세히 검토할 수 있도록 **조인 품질**도 함께 표시합니다.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato가 ClickHouse 사용자 액세스에 연결" border />

## 대시보드 생성 \{#creating-a-dashboard\}

몇 단계만으로 Astrato에서 첫 차트를 생성할 수 있습니다.

1. Visuals 패널을 엽니다.
2. 시각화 유형을 선택합니다(예: "Column Bar Chart"부터 시작합니다).
3. 차원(Dimension)을 추가합니다.
4. 측정값(Measure)을 추가합니다.

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato에서 ClickHouse 사용자 액세스에 연결하기" border />

### 각 시각화를 위한 생성된 SQL 보기 \{#view-generated-sql-supporting-each-visualization\}

투명성과 정확성은 Astrato의 핵심 가치입니다. Astrato는 생성되는 모든 쿼리를 확인할 수 있도록 하여, 완전한 통제권을 유지할 수 있게 합니다. 모든 연산은 ClickHouse에서 직접 수행되며, 이를 통해 뛰어난 속도를 활용하면서도 강력한 보안과 거버넌스를 유지합니다.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato에서 ClickHouse 사용자 액세스에 연결" border />

### 예시로 완성된 대시보드 \{#example-completed-dashboard\}

멋진 완성형 대시보드나 데이터 앱을 만드는 일은 이제 머지않았습니다. 지금까지 구성한 내용을 더 살펴보려면 웹사이트의 데모 갤러리를 확인하십시오. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato에서 ClickHouse User Access에 연결" border />