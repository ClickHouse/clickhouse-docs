---
'sidebar_label': 'Deepnote'
'sidebar_position': 11
'slug': '/integrations/deepnote'
'keywords':
- 'clickhouse'
- 'Deepnote'
- 'connect'
- 'integrate'
- 'notebook'
'description': '대규모 데이터셋을 효율적으로 쿼리하고, 익숙한 노트북 환경에서 분석 및 모델링합니다.'
'title': 'ClickHouse를 Deepnote에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
- 'website': 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse를 Deepnote에 연결하기

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a>는 팀이 통찰력을 발견하고 공유할 수 있도록 설계된 협업 데이터 노트북입니다. Jupyter와의 호환성 외에도 클라우드에서 작동하며 데이터 과학 프로젝트를 효율적으로 협업하고 작업할 수 있는 중앙 위치를 제공합니다.

이 가이드는 이미 Deepnote 계정이 있으며 ClickHouse 인스턴스가 실행 중이라고 가정합니다.

## 대화형 예제 {#interactive-example}
Deepnote 데이터 노트북에서 ClickHouse 쿼리를 실행하는 대화형 예제를 탐색하고 싶다면, 아래 버튼을 클릭하여 [ClickHouse 플레이그라운드](../../../getting-started/playground.md)에 연결된 템플릿 프로젝트를 시작하세요.

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnote에서 시작하기" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouse에 연결하기 {#connect-to-clickhouse}

1. Deepnote 내에서 "Integrations" 개요를 선택하고 ClickHouse 타일을 클릭합니다.

<Image size="lg" img={deepnote_01} alt="ClickHouse 통합 타일" border />

2. ClickHouse 인스턴스의 연결 세부 정보를 제공합니다:
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse 세부 정보 대화 상자" border />

   **_참고:_** ClickHouse에 대한 연결이 IP 액세스 목록으로 보호되는 경우, Deepnote의 IP 주소를 허용해야 할 수 있습니다. 이에 대한 자세한 내용은 [Deepnote의 문서](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)를 참조하세요.

3. 축하합니다! 이제 ClickHouse를 Deepnote에 통합했습니다.

## ClickHouse 통합 사용하기 {#using-clickhouse-integration}

1. 먼저, 노트북 오른쪽에서 ClickHouse 통합에 연결하세요.

   <Image size="lg" img={deepnote_03} alt="ClickHouse 세부 정보 대화 상자" border />

2. 이제 새 ClickHouse 쿼리 블록을 만들고 데이터베이스를 쿼리하세요. 쿼리 결과는 DataFrame으로 저장되며 SQL 블록에 지정된 변수에 저장됩니다.
3. 기존의 [SQL 블록](https://docs.deepnote.com/features/sql-cells)을 ClickHouse 블록으로 변환할 수도 있습니다.
