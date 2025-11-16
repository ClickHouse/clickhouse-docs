---
'sidebar_label': 'Omni'
'slug': '/integrations/omni'
'keywords':
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Omni는 BI, 데이터 애플리케이션 및 임베디드 분석을 위한 기업 플랫폼으로, 실시간으로 인사이트를 탐색하고 공유하는
  데 도움을 줍니다.'
'title': 'Omni'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Omni

<PartnerBadge/>

Omni는 공식 ClickHouse 데이터 소스를 통해 ClickHouse Cloud 또는 온프레미스 배포에 연결할 수 있습니다.

## 1. 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouse 데이터 소스 생성 {#2-create-a-clickhouse-data-source}

관리자 -> 연결로 이동한 후 오른쪽 상단 모서리의 "연결 추가" 버튼을 클릭합니다.

<Image size="lg" img={omni_01} alt="연결 섹션에서 연결 추가 버튼을 보여주는 Omni 관리자 인터페이스" border />
<br/>

`ClickHouse`를 선택합니다. 양식에 자격 증명을 입력합니다.

<Image size="lg" img={omni_02} alt="자격 증명 양식 필드를 보여주는 ClickHouse용 Omni 연결 구성 인터페이스" border />
<br/>

이제 Omni에서 ClickHouse의 데이터를 쿼리하고 시각화할 수 있어야 합니다.
