---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo는 소프트웨어 및 SaaS 애플리케이션을 위해 설계된, ClickHouse와의 네이티브 연동을 제공하는 임베디드 애널리틱스 플랫폼입니다.'
title: 'Luzmo를 ClickHouse와 통합하기'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse와 Luzmo 통합 \{#integrating-luzmo-with-clickhouse\}

<CommunityMaintainedBadge/>

## 1. ClickHouse 연결 설정 \{#1-setup-a-clickhouse-connection\}

ClickHouse에 연결하려면 **Connections page**로 이동한 후 **New Connection**을 선택하고, 표시되는 New Connection 모달에서 ClickHouse를 선택합니다.

<Image img={luzmo_01} size="md" alt="ClickHouse가 선택된 상태로 새 연결 생성 대화 상자를 보여주는 Luzmo 인터페이스" border />

**host**, **username**, **password**를 입력해야 합니다:

<Image img={luzmo_02} size="md" alt="ClickHouse host, username, password 필드를 보여주는 Luzmo 연결 구성 폼" border />

*   **Host**: ClickHouse 데이터베이스가 외부에 노출된 호스트입니다. 전송 중 데이터를 안전하게 보호하기 위해 이 값은 `https`만 허용됩니다. host URL의 형식은 `https://url-to-clickhouse-db:port/database`여야 합니다.
    기본적으로 플러그인은 'default' 데이터베이스와 443 포트에 연결합니다. '/' 뒤에 데이터베이스 이름을 지정하면 어느 데이터베이스에 연결할지 설정할 수 있습니다.
*   **Username**: ClickHouse 클러스터에 연결할 때 사용할 사용자 이름입니다.
*   **Password**: ClickHouse 클러스터에 연결할 때 사용할 비밀번호입니다.

API를 통해 [ClickHouse에 대한 연결을 생성](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)하는 방법은 개발자 문서의 예제를 참고하십시오.

## 2. 데이터셋 추가 \{#2-add-datasets\}

ClickHouse 연결을 마쳤다면, [여기](https://academy.luzmo.com/article/ldx3iltg)에 설명된 방법대로 데이터셋을 추가할 수 있습니다. ClickHouse에 있는 하나 이상의 데이터셋을 선택한 뒤 Luzmo에서 이를 [연결](https://academy.luzmo.com/article/gkrx48x5)하여 대시보드에서 함께 사용할 수 있도록 하십시오. 또한 [분석을 위한 데이터 준비](https://academy.luzmo.com/article/u492qov0)에 관한 이 문서도 꼭 확인하십시오.

API를 사용해 데이터셋을 추가하는 방법은 [개발자 문서의 이 예시](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)를 참고하십시오.

이제 데이터셋을 사용해 고급스러운 (임베디드) 대시보드를 구성하거나, 고객의 질문에 답변할 수 있는 AI Data Analyst([Luzmo IQ](https://luzmo.com/iq))를 구동하는 데 활용할 수 있습니다.

<Image img={luzmo_03} size="md" alt="ClickHouse 데이터를 여러 가지 시각화로 보여주는 Luzmo 대시보드 예시" border />

## 사용 시 참고 사항 \{#usage-notes\}

1. Luzmo ClickHouse 커넥터는 연결을 위해 HTTP API 인터페이스(일반적으로 포트 8123에서 실행됨)를 사용합니다.
2. `Distributed` 테이블 엔진을 사용하는 테이블을 사용하는 경우, `distributed_product_mode`가 `deny`로 설정되어 있으면 일부 Luzmo 차트가 동작하지 않을 수 있습니다. 다만 이는 해당 테이블을 다른 테이블에 연결한 뒤, 그 링크를 차트에서 사용하는 경우에만 발생합니다. 이 경우 ClickHouse 클러스터 환경에 적합한 다른 옵션으로 `distributed_product_mode`를 설정해야 합니다. ClickHouse Cloud를 사용하는 경우 이 설정은 무시해도 안전합니다.
3. 예를 들어 Luzmo 애플리케이션만 ClickHouse 인스턴스에 액세스하도록 하려면, [Luzmo 고정 IP 주소 범위](https://academy.luzmo.com/article/u9on8gbm)를 **허용 목록(whitelist)에 추가**할 것을 강력히 권장합니다. 또한 전용 읽기 전용 사용자 계정을 사용하는 것도 권장합니다.
4. ClickHouse 커넥터는 현재 다음 데이터 타입을 지원합니다:

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