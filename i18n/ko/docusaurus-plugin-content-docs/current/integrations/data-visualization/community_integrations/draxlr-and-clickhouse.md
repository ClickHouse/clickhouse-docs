---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr는 데이터 시각화와 분석을 위한 비즈니스 인텔리전스 도구입니다.'
title: 'ClickHouse에 Draxlr를 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Draxlr를 ClickHouse에 연결하기 \{#connecting-draxlr-to-clickhouse\}

<CommunityMaintainedBadge/>

Draxlr는 ClickHouse 데이터베이스에 연결하기 위한 직관적인 인터페이스를 제공하여 팀이 몇 분 안에 데이터를 탐색하고 시각화하며 인사이트를 게시할 수 있도록 합니다. 이 가이드는 연결을 성공적으로 설정하는 방법을 단계별로 안내합니다.

## 1. ClickHouse 자격 증명 정보 확인하기 \{#1-get-your-clickhouse-credentials\}

<ConnectionDetails />

## 2.  Draxlr를 ClickHouse에 연결하기 \{#2--connect-draxlr-to-clickhouse\}

1. 상단 내비게이션 바에서 **Connect a Database** 버튼을 클릭합니다.

2. 사용 가능한 데이터베이스 목록에서 **ClickHouse**를 선택한 후 **Next**를 클릭합니다.

3. 호스팅 서비스 중 하나를 선택한 후 **Next**를 클릭합니다.

4. **Connection Name** 필드에 임의의 이름을 입력합니다.

5. 양식에 연결 정보를 입력합니다.

<Image size="md" img={draxlr_01} alt="ClickHouse 데이터베이스 구성 옵션을 보여주는 Draxlr 연결 폼" border />

6. **Next** 버튼을 클릭하고 연결이 완료될 때까지 기다립니다. 연결에 성공하면 테이블 페이지가 표시됩니다.

## 4. 데이터 탐색하기 \{#4-explore-your-data\}

1. 목록에서 테이블 중 하나를 클릭합니다.

2. 테이블의 데이터를 확인할 수 있는 탐색 페이지로 이동합니다.

3. 필터를 추가하고 조인을 수행하며 데이터를 정렬할 수 있습니다.

<Image size="md" img={draxlr_02} alt="필터와 정렬 옵션을 보여주는 Draxlr 데이터 탐색 인터페이스" border />

4. **Graph** 버튼을 사용해 그래프 유형을 선택하고 데이터를 시각화할 수도 있습니다.

<Image size="md" img={draxlr_05} alt="ClickHouse 데이터에 대한 Draxlr 그래프 시각화 옵션" border />

## 4. SQL 쿼리 사용하기 \{#4-using-sql-queries\}

1. 상단 네비게이션 바에서 Explore 버튼을 클릭합니다.

2. **Raw Query** 버튼을 클릭한 후 텍스트 영역에 쿼리를 입력합니다.

<Image size="md" img={draxlr_03} alt="ClickHouse용 Draxlr SQL 쿼리 인터페이스" border />

3. 결과를 확인하려면 **Execute Query** 버튼을 클릭합니다.

## 4. 쿼리 저장하기 \{#4-saving-you-query\}

1. 쿼리를 실행한 후 **Save Query** 버튼을 클릭합니다.

<Image size="md" img={draxlr_04} alt="대시보드 옵션이 있는 Draxlr 쿼리 저장 대화 상자" border />

2. **Query Name** 텍스트 상자에 쿼리 이름을 입력하고, 분류할 폴더를 선택합니다.

3. **Add to dashboard** 옵션을 사용하여 결과를 대시보드에 추가할 수도 있습니다.

4. **Save** 버튼을 클릭하여 쿼리를 저장합니다.

## 5. 대시보드 만들기 \{#5-building-dashboards\}

1. 내비게이션 바에서 **Dashboards** 버튼을 클릭합니다.

<Image size="md" img={draxlr_06} alt="Draxlr 대시보드 관리 인터페이스" border />

2. 왼쪽 사이드바에서 **Add +** 버튼을 클릭해 새 대시보드를 추가합니다.

3. 새 위젯을 추가하려면 오른쪽 상단에 있는 **Add** 버튼을 클릭합니다.

4. 저장된 쿼리 목록에서 쿼리를 선택하고 시각화 유형을 선택한 다음 **Add Dashboard Item** 버튼을 클릭합니다.

## 더 알아보기 \{#learn-more\}

Draxlr에 대해 더 자세히 알아보려면 [Draxlr 문서](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 사이트를 방문하십시오.