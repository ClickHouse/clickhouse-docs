---
'sidebar_label': 'Embeddable'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddable은 당신의 앱에 직접 빠르고 상호작용이 가능한 완전 맞춤형 분석 경험을 구축하기 위한 개발자 도구 키트입니다.'
'title': 'ClickHouse에 Embeddable 연결하기'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting Embeddable to ClickHouse

<CommunityMaintainedBadge/>

In [Embeddable](https://embeddable.com/)에서는 코드에서 [데이터 모델](https://docs.embeddable.com/data-modeling/introduction)과 [컴포넌트](https://docs.embeddable.com/development/introduction)를 정의하고 (자신의 코드 저장소에 저장됨) 우리 **SDK**를 사용하여 강력한 Embeddable **노코드 빌더**에서 팀이 이를 사용할 수 있도록 합니다.

최종 결과는 제품에 직접 빠르고 상호작용이 가능한 고객 맞춤형 분석을 제공할 수 있는 능력입니다. 이는 귀하의 제품 팀에서 설계하고, 엔지니어링 팀에서 구축하며, 고객과 데이터 팀에서 유지 관리합니다. 정확히 그렇게 되어야 합니다.

내장된 행 수준 보안은 모든 사용자가 자신이 볼 수 있는 데이터만을 정확히 보게 합니다. 그리고 두 수준의 완전 구성 가능한 캐시는 대규모로 빠른 실시간 분석을 제공할 수 있음을 의미합니다.

## 1. 연결 세부정보 수집 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse 연결 유형 생성 {#2-create-a-clickhouse-connection-type}

Embeddable API를 사용하여 데이터베이스 연결을 추가합니다. 이 연결은 ClickHouse 서비스에 연결하는 데 사용됩니다. 다음 API 호출을 사용하여 연결을 추가할 수 있습니다:

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

위 내용은 `CREATE` 작업을 나타내지만 모든 `CRUD` 작업을 사용할 수 있습니다.

`apiKey`는 Embeddable 대시보드 중 하나에서 "**Publish**"를 클릭하여 찾을 수 있습니다.

`name`은 이 연결을 식별하기 위한 고유한 이름입니다.
- 기본적으로 데이터 모델은 "default"라는 이름의 연결을 찾지만, 다른 `data_source` 이름을 제공하여 서로 다른 데이터 모델을 서로 다른 연결에 연결할 수 있습니다 (모델에 data_source 이름을 지정하기만 하면 됩니다).

`type`은 Embeddable에 어떤 드라이버를 사용할지 지시합니다.

- 여기서는 `clickhouse`를 사용해야 하지만, 여러 서로 다른 데이터 소스를 하나의 Embeddable 작업 공간에 연결할 수 있으므로 `postgres`, `bigquery`, `mongodb` 등과 같은 다른 소스를 사용할 수 있습니다.

`credentials`는 드라이버가 예상하는 필요한 자격 증명을 포함하는 JavaScript 객체입니다.
- 이러한 자격 증명은 안전하게 암호화되며 오직 데이터 모델에 설명된 데이터만을 검색하는 데 사용됩니다. Embeddable은 각 연결에 대해 읽기 전용 데이터베이스 사용자를 생성할 것을 강력히 권장합니다 (Embeddable은 데이터베이스에서 읽기만 하고 쓰지 않습니다).

프로덕션, QA, 테스트 등에서 서로 다른 데이터베이스에 연결을 지원하거나 서로 다른 고객을 위해 다른 데이터베이스를 지원하기 위해 각 연결을 환경에 할당할 수 있습니다 (자세한 내용은 [Environments API](https://docs.embeddable.com/data/environments) 참조).
