---
'sidebar_label': 'Luzmo'
'slug': '/integrations/luzmo'
'keywords':
- 'clickhouse'
- 'Luzmo'
- 'connect'
- 'integrate'
- 'ui'
- 'embedded'
'description': 'Luzmo는 Software 및 SaaS 응용 프로그램을 위해 특별히 제작된 내장 분석 플랫폼으로, 원주율 ClickHouse
  통합을 제공합니다.'
'title': 'Luzmo와 ClickHouse 통합'
'sidebar': 'integrations'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Luzmo와 ClickHouse 통합

<CommunityMaintainedBadge/>

## 1. ClickHouse 연결 설정 {#1-setup-a-clickhouse-connection}

ClickHouse에 연결하려면 **Connections page**로 이동하여 **New Connection**을 선택한 다음 New Connection 모달에서 ClickHouse를 선택합니다.

<Image img={luzmo_01} size="md" alt="ClickHouse가 선택된 새 연결 대화 상자를 보여주는 Luzmo 인터페이스" border />

필요한 **host**, **username**, **password**를 제공해야 합니다:

<Image img={luzmo_02} size="md" alt="ClickHouse 호스트, 사용자 이름 및 비밀번호 필드가 표시된 Luzmo 연결 구성 양식" border />

*   **Host**: ClickHouse 데이터베이스가 노출된 호스트입니다. 데이터가 안전하게 전달될 수 있도록 오직 `https`만 허용됩니다. 호스트 URL의 구조는 다음과 같이 되어야 합니다: `https://url-to-clickhouse-db:port/database`
    기본적으로, 플러그인은 'default' 데이터베이스와 443 포트에 연결됩니다. '/' 뒤에 데이터베이스를 제공함으로써 연결할 데이터베이스를 설정할 수 있습니다.
*   **Username**: ClickHouse 클러스터에 연결하는 데 사용되는 사용자 이름입니다.
*   **Password**: ClickHouse 클러스터에 연결하는 데 필요한 비밀번호입니다.

당사의 API를 통해 ClickHouse에 [연결을 생성하는 방법](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)에 대한 예제를 확인하려면 개발자 문서를 참조하십시오.

## 2. 데이터셋 추가 {#2-add-datasets}

ClickHouse에 연결한 후에는 [여기](https://academy.luzmo.com/article/ldx3iltg)에서 설명한 대로 데이터셋을 추가할 수 있습니다. ClickHouse에서 사용 가능한 하나 이상의 데이터셋을 선택하고 Luzmo에 [링크](https://academy.luzmo.com/article/gkrx48x5)하여 대시보드에서 함께 사용할 수 있도록 해야 합니다. 또한 [데이터 분석을 위한 데이터 준비](https://academy.luzmo.com/article/u492qov0)에 대한 이 기사를 반드시 확인하십시오.

API를 사용하여 데이터셋을 추가하는 방법에 대한 자세한 내용은 [개발자 문서의 이 예제](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)를 참조하십시오.

이제 데이터셋을 사용하여 아름다운 (임베디드) 대시보드를 구축하거나 고객의 질문에 답할 수 있는 AI 데이터 분석가 ([Luzmo IQ](https://luzmo.com/iq))를 지원할 수 있습니다.

<Image img={luzmo_03} size="md" alt="ClickHouse에서 가져온 다양한 데이터 시각화를 보여주는 Luzmo 대시보드 예제" border />

## 사용 주의사항 {#usage-notes}

1. Luzmo ClickHouse 커넥터는 HTTP API 인터페이스(일반적으로 8123 포트에서 실행됨)를 사용하여 연결합니다.
2. `Distributed` 테이블 엔진이 있는 테이블을 사용하는 경우, `distributed_product_mode`가 `deny`일 때 일부 Luzmo 차트가 실패할 수 있습니다. 이는 차트에서 다른 테이블에 링크할 때만 발생해야 합니다. 그 경우 ClickHouse 클러스터 내에서 적절한 다른 옵션으로 `distributed_product_mode`를 설정해야 합니다. ClickHouse Cloud를 사용하는 경우 이 설정을 무시해도 안전합니다.
3. 예를 들어, Luzmo 애플리케이션만 ClickHouse 인스턴스에 접근할 수 있도록 하려면 [Luzmo의 정적 IP 주소 범위](https://academy.luzmo.com/article/u9on8gbm)를 **화이트리스트**에 추가하는 것이 강력히 권장됩니다. 기술적인 읽기 전용 사용자 사용도 권장합니다.
4. ClickHouse 커넥터는 현재 다음과 같은 데이터 유형을 지원합니다:

    | ClickHouse Type | Luzmo Type |
    | --- | --- |
    | UInt | numeric |
    | Int | numeric |
    | Float | numeric |
    | Decimal | numeric |
    | Date | datetime |
    | DateTime | datetime |
    | String | hierarchy |
    | Enum | hierarchy |
    | FixedString | hierarchy |
    | UUID | hierarchy |
    | Bool | hierarchy |
