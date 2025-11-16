---
'sidebar_label': 'Astrato'
'sidebar_position': 131
'slug': '/integrations/astrato'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
- 'data apps'
- 'data viz'
- 'embedded analytics'
- 'Astrato'
'description': 'Astrato는 모든 사용자가 자신의 대시보드, 보고서 및 데이터 앱을 구축할 수 있도록 하여 데이터 질문에 대해 IT
  도움 없이 답변할 수 있게 해줍니다. 이는 기업 및 데이터 비즈니스에 진정한 자체 서비스 BI를 제공합니다. Astrato는 채택을 가속화하고
  의사 결정을 빠르게 하며 분석, 임베디드 분석, 데이터 입력 및 데이터 앱을 하나의 플랫폼에서 통합합니다. Astrato는 행동과 분석을 하나로
  통합하며, 실시간 쓰기 및 ML 모델과의 상호 작용을 도입하고, AI를 통한 분석을 가속화하며, 대시보드 이상의 것으로 나아가도록 해줍니다. 이는
  Astrato의 pushdown SQL 지원 덕분입니다.'
'title': 'Connecting Astrato to ClickHouse'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
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


# Astrato를 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

Astrato는 Pushdown SQL을 사용하여 ClickHouse Cloud 또는 온프레미스 배포를 직접 쿼리합니다. 이는 ClickHouse의 업계 선도 성능으로 지원되는 필요한 모든 데이터에 접근할 수 있음을 의미합니다.

## 연결에 필요한 데이터 {#connection-data-required}

데이터 연결을 설정할 때 알아야 할 사항은 다음과 같습니다:

- 데이터 연결: 호스트 이름, 포트

- 데이터베이스 자격 증명: 사용자 이름, 비밀번호

<ConnectionDetails />

## ClickHouse에 대한 데이터 연결 생성 {#creating-the-data-connection-to-clickhouse}

- 사이드바에서 **데이터**를 선택하고 **데이터 연결** 탭을 선택합니다.  
(또는, 다음 링크로 이동하십시오: https://app.astrato.io/data/sources)

- 화면 오른쪽 상단의 **새 데이터 연결** 버튼을 클릭합니다.

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato 데이터 연결" border />

- **ClickHouse**를 선택합니다.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse 데이터 연결" border />

- 연결 대화 상자의 필수 필드를 완료합니다.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato ClickHouse에 연결 시 필요한 필드" border />

- **연결 테스트**를 클릭합니다. 연결이 성공하면 데이터 연결에 **이름**을 지정하고 **다음**을 클릭합니다.

- 데이터 연결에 대한 **사용자 접근**을 설정하고 **연결**을 클릭합니다.

<Image size="md" img={astrato_3_user_access} alt="Astrato ClickHouse 사용자 접근 연결" border />

- 연결이 생성되고 데이터 뷰가 만들어집니다.

:::note  
중복 항목이 생성되면 데이터 소스 이름에 타임스탬프가 추가됩니다.  
:::

## 의미 모델 / 데이터 뷰 생성 {#creating-a-semantic-model--data-view}

Data View 편집기에서 ClickHouse의 모든 테이블과 스키마를 볼 수 있으며, 시작할 테이블을 선택하세요.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato ClickHouse 데이터 뷰 연결" border />

데이터를 선택했으면 **데이터 뷰**를 정의합니다. 웹 페이지 오른쪽 상단에서 정의를 클릭하십시오.

여기서 데이터를 조인할 수 있으며, **거버넌스 차원 및 측정항목 생성**도 가능하여 다양한 팀 간의 비즈니스 논리 일관성을 유지하는 데 이상적입니다.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato ClickHouse 데이터 뷰 조인" border />

**Astrato는 메타 데이터를 사용하여 조인을 지능적으로 제안합니다**. ClickHouse의 키를 활용하는 등, 제안된 조인은 잘 관리된 ClickHouse 데이터를 기반으로 시작할 수 있도록 도와줍니다. 모든 제안을 자세히 검토할 선택권이 있는 **조인 품질**도 보여줍니다.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato ClickHouse 완료된 데이터 뷰" border />

## 대시보드 생성 {#creating-a-dashboard}

 몇 가지 단계만으로 Astrato에서 첫 번째 차트를 생성할 수 있습니다.
1. 시각화 패널 열기
2. 시각화 선택 (컬럼 바 차트로 시작해 봅시다)
3. 차원 추가
4. 측정 항목 추가

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato ClickHouse 차트 생성" border />

### 각 시각화를 지원하는 생성된 SQL 보기 {#view-generated-sql-supporting-each-visualization}

투명성과 정확성은 Astrato의 핵심입니다. 생성된 모든 쿼리를 볼 수 있게 하여 완전한 제어를 유지할 수 있도록 합니다. 모든 컴퓨팅은 ClickHouse에서 직접 수행되어 속도를 활용하면서도 강력한 보안 및 거버넌스를 유지합니다.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato ClickHouse SQL 보기" border />

### 예제 완료된 대시보드 {#example-completed-dashboard}

아름답게 완성된 대시보드 또는 데이터 앱은 이제 멀지 않습니다. 우리가 만든 것에 대해 더 알고 싶으시면 웹사이트의 데모 갤러리에 방문하세요. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato ClickHouse 완료된 대시보드" border />
