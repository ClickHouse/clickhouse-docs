---
'sidebar_label': 'Draxlr'
'sidebar_position': 131
'slug': '/integrations/draxlr'
'keywords':
- 'clickhouse'
- 'Draxlr'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Draxlr는 데이터 시각화 및 분석을 위한 비즈니스 인텔리전스 도구입니다.'
'title': 'Draxlr를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
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


# Connecting Draxlr to ClickHouse

<CommunityMaintainedBadge/>

Draxlr는 ClickHouse 데이터베이스에 연결하기 위한 직관적인 인터페이스를 제공하여 팀이 몇 분 안에 인사이트를 탐색, 시각화 및 게시할 수 있도록 합니다. 이 가이드는 성공적인 연결을 설정하는 단계를 안내합니다.

## 1. ClickHouse 자격 증명 얻기 {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. Draxlr를 ClickHouse에 연결하기 {#2--connect-draxlr-to-clickhouse}

1. 내비게이션 바에서 **Connect a Database** 버튼을 클릭합니다.

2. 사용 가능한 데이터베이스 목록에서 **ClickHouse**를 선택하고 다음을 클릭합니다.

3. 호스팅 서비스 중 하나를 선택하고 다음을 클릭합니다.

4. **Connection Name** 필드에 원하는 이름을 입력합니다.

5. 양식에 연결 세부정보를 추가합니다.

  <Image size="md" img={draxlr_01} alt="Draxlr 연결 양식에서 ClickHouse 데이터베이스 구성 옵션 보여줌" border />

6. **Next** 버튼을 클릭하고 연결이 설정될 때까지 기다립니다. 연결이 성공적이면 테이블 페이지가 표시됩니다.

## 4. 데이터 탐색하기 {#4-explore-your-data}

1. 목록에서 테이블 중 하나를 클릭합니다.

2. 해당 테이블의 데이터를 확인할 수 있는 탐색 페이지로 이동합니다.

3. 필터를 추가하고 조인을 만들고 데이터에 정렬을 추가할 수 있습니다.

  <Image size="md" img={draxlr_02} alt="Draxlr 데이터 탐색 인터페이스에서 필터 및 정렬 옵션 보여줌" border />

4. **Graph** 버튼을 사용하여 그래프 유형을 선택해 데이터를 시각화할 수도 있습니다.

  <Image size="md" img={draxlr_05} alt="ClickHouse 데이터에 대한 Draxlr 그래프 시각화 옵션" border />

## 4. SQL 쿼리 사용하기 {#4-using-sql-queries}

1. 내비게이션 바에서 Explore 버튼을 클릭합니다.

2. **Raw Query** 버튼을 클릭하고 텍스트 영역에 쿼리를 입력합니다.

  <Image size="md" img={draxlr_03} alt="Draxlr SQL 쿼리 인터페이스 for ClickHouse" border />

3. **Execute Query** 버튼을 클릭하여 결과를 확인합니다.

## 4. 쿼리 저장하기 {#4-saving-you-query}

1. 쿼리를 실행한 후, **Save Query** 버튼을 클릭합니다.

  <Image size="md" img={draxlr_04} alt="대시보드 옵션이 있는 Draxlr 쿼리 저장 대화 상자" border />

2. **Query Name** 텍스트 상자에 쿼리 이름을 입력하고 분류를 위해 폴더를 선택할 수 있습니다.

3. 결과를 대시보드에 추가하려면 **Add to dashboard** 옵션을 사용할 수도 있습니다.

4. **Save** 버튼을 클릭하여 쿼리를 저장합니다.

## 5. 대시보드 만들기 {#5-building-dashboards}

1. 내비게이션 바에서 **Dashboards** 버튼을 클릭합니다.

  <Image size="md" img={draxlr_06} alt="Draxlr 대시보드 관리 인터페이스" border />

2. 왼쪽 사이드바에서 **Add +** 버튼을 클릭하여 새 대시보드를 추가할 수 있습니다.

3. 새 위젯을 추가하려면 오른쪽 상단 모서리의 **Add** 버튼을 클릭합니다.

4. 저장된 쿼리 목록에서 쿼리를 선택하고 시각화 유형을 선택한 후 **Add Dashboard Item** 버튼을 클릭합니다.

## Learn more {#learn-more}
Draxlr에 대한 자세한 내용을 보려면 [Draxlr documentation](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 사이트를 방문하세요.
