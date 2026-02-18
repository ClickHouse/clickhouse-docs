---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable는 애플리케이션에 직접 빠르고 인터랙티브하며 완전히 커스터마이징 가능한 분석 경험을 구축하기 위한 개발자 툴킷입니다.'
title: 'Embeddable을 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Embeddable를 ClickHouse에 연결하기 \{#connecting-embeddable-to-clickhouse\}

<CommunityMaintainedBadge/>

[Embeddable](https://embeddable.com/)에서는 [Data Models](https://docs.embeddable.com/data-modeling/introduction)과 [Components](https://docs.embeddable.com/development/introduction)를 코드로 정의하고(해당 코드는 사용자의 코드 저장소에 저장됨), **SDK**를 사용하여 이를 Embeddable의 강력한 **no-code builder**에서 팀이 사용할 수 있도록 합니다.

그 결과, 제품 팀이 설계하고 엔지니어링 팀이 구축하며 고객 대응 및 데이터 팀이 유지 관리하는, 제품 내에 직접 포함된 빠르고 인터랙티브한 고객용 분석 기능을 제공할 수 있게 됩니다. 마땅히 그래야 하는 방식 그대로입니다.

내장된 행 수준 보안(row-level security)을 통해 각 사용자는 자신에게 허용된 데이터만 정확히 보게 됩니다. 또한 두 단계의 완전히 구성 가능한 캐싱을 통해, 대규모 환경에서도 빠르고 실시간에 가까운 분석을 제공할 수 있습니다.

## 1. 연결 정보 준비하기 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse 연결 유형 생성 \{#2-create-a-clickhouse-connection-type\}

Embeddable API를 사용하여 데이터베이스 연결을 추가합니다. 이 연결은 ClickHouse 서비스에 연결하는 데 사용됩니다. 다음 API 호출을 사용하여 연결을 추가할 수 있습니다.

```javascript
// for security reasons, this must *never* be called from your client-side
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* keep your API Key secure */,
  },
  body: JSON.stringify({
    name: 'my-clickhouse-db',
    type: 'clickhouse',
    credentials: {
      host: 'my.clickhouse.host',
      user: 'clickhouse_user',
      port: 8443,
      password: '*****',
    },
  }),
});

Response:
Status 201 { errorMessage: null }
```

위 예시는 `CREATE` 작업을 나타내지만, 모든 `CRUD` 작업을 사용할 수 있습니다.

`apiKey`는 Embeddable 대시보드 중 하나에서 &quot;**Publish**&quot;를 클릭하면 확인할 수 있습니다.

`name`은 이 연결을 식별하기 위한 고유한 이름입니다.

* 기본적으로 데이터 모델은 &quot;default&quot;라는 이름의 연결을 찾지만, 서로 다른 데이터 모델을 서로 다른 연결에 매핑할 수 있도록 모델에 다른 `data_source` 이름을 지정할 수 있습니다(모델에서 data&#95;source 이름을 명시하면 됩니다).

`type`은 Embeddable이 어떤 드라이버를 사용할지 나타냅니다.

* 여기에서는 `clickhouse`를 사용하면 되지만, 하나의 Embeddable 워크스페이스에 여러 다른 데이터 소스를 연결할 수 있으므로 `postgres`, `bigquery`, `mongodb` 등 다른 드라이버를 사용할 수도 있습니다.

`credentials`는 드라이버가 필요로 하는 필수 자격 증명이 포함된 JavaScript 객체입니다.

* 이 값들은 안전하게 암호화되며, 데이터 모델에서 정의한 정확한 데이터만 조회하는 데 사용됩니다.
  Embeddable은 각 연결마다 읽기 전용 데이터베이스 USER를 생성할 것을 강력히 권장합니다(Embeddable은 데이터베이스에서 읽기만 하고, 쓰기는 수행하지 않습니다).

운영(prod), QA, 테스트(test) 등 서로 다른 데이터베이스에 연결하거나(또는 서로 다른 고객에 대해 서로 다른 데이터베이스를 사용하도록) 지원하기 위해, 각 연결을 하나의 환경에 할당할 수 있습니다([Environments API](https://docs.embeddable.com/data/environments) 참조).
