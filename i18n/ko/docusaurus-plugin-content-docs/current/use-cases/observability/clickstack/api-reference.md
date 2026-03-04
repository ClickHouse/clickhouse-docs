---
slug: /use-cases/observability/clickstack/api-reference
title: 'API 참조'
pagination_prev: null
pagination_next: null
description: '대시보드, 알림 및 소스를 프로그래밍 방식으로 관리하기 위한 ClickStack API 참조'
doc_type: 'guide'
keywords: ['ClickStack', '관측성', 'API', 'REST API', '대시보드', '알림', 'HyperDX']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack은 대시보드, 알림, 데이터 소스를 프로그램으로 관리할 수 있는 REST API를 제공합니다. 이 API는 **Managed ClickStack**(ClickHouse Cloud)과 **ClickStack Open Source** 배포 모두에서 사용할 수 있지만, 두 환경 간에 엔드포인트와 인증 방식이 다릅니다.


## API 참조 문서 \{#api-docs\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

Managed ClickStack의 경우 API는 **ClickHouse Cloud API**를 통해 사용할 수 있습니다. ClickStack 엔드포인트는 [Cloud API 명세](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickStack)에서 확인할 수 있습니다.

다음 엔드포인트를 제공합니다:

| 리소스 | 작업 |
|---|---|
| **Dashboards** | 대시보드 생성, 목록 조회, 조회, 업데이트 및 삭제 |
| **Alerts** | 알림 생성, 목록 조회, 조회, 업데이트 및 삭제 |
| **Sources** | 데이터 소스 목록 조회 |

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

ClickStack 오픈 소스 버전의 경우 전체 API 명세는 [HyperDX 저장소](https://github.com/hyperdxio/hyperdx)에서 관리되며, 대화형으로 열람하거나 OpenAPI 명세로 다운로드할 수 있습니다:

- [대화형 API 참조](https://www.clickhouse.com/docs/clickstack/api-reference)
- [OpenAPI 명세(JSON) 다운로드](https://raw.githubusercontent.com/hyperdxio/hyperdx/refs/heads/main/packages/api/openapi.json)

다음 엔드포인트를 제공합니다:

| 리소스 | 작업 |
|---|---|
| **Dashboards** | 대시보드 생성, 목록 조회, 조회, 업데이트 및 삭제 |
| **Alerts** | 알림 생성, 목록 조회, 조회, 업데이트 및 삭제 |
| **Charts** | 시계열 데이터 쿼리(POST 전용) |
| **Sources** | 데이터 소스 목록 조회 |
| **Webhooks** | 웹훅 목록 조회 |

</TabItem>
</Tabs>

## 인증 \{#authentication\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

Managed ClickStack는 [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)을 통해 인증을 수행하기 위해 **ClickHouse Cloud API key**를 사용합니다. API key를 생성하고 관리하는 방법은 [Managing API keys](/docs/cloud/manage/openapi)를 참조하십시오.

HTTP Basic Authentication을 사용하여 key ID와 secret을 포함하십시오:

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>

curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

ClickStack Open Source는 **Personal API Access Key**를 이용한 인증을 위해 **Bearer token**을 사용합니다.

API key를 발급받으려면:

1. ClickStack URL에서 HyperDX를 엽니다(예: http://localhost:8080).
2. 필요하다면 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Personal API Access Key**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

:::note
이는 Team Settings에 있는 **Ingestion API Key(수집 API key)**와는 다르며, Ingestion API Key는 OpenTelemetry collector로 전송되는 텔레메트리 데이터를 인증하는 데 사용됩니다.
:::

API 서버는 기본적으로 포트 `8000`에서 실행되며, UI는 별도의 포트 `8080`에서 실행됩니다. all-in-one Docker 이미지를 사용할 때는 이 포트를 명시적으로 매핑해야 합니다:

```bash
docker run -p 8080:8080 -p 8000:8000 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`Authorization` 헤더에 key를 포함하십시오:

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

</TabItem>
</Tabs>

## 기본 URL 및 요청 형식 \{#base-url\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

모든 Managed ClickStack API 요청은 ClickHouse Cloud API로 전송됩니다:

```bash
https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/<resource>
```

**Organization ID**는 ClickHouse Cloud 콘솔의 **Organization → Organization details** 메뉴에서 확인할 수 있습니다. **Service ID**는 서비스 URL 또는 서비스 세부 정보 페이지에서 확인할 수 있습니다.

### 예시: 대시보드 목록 조회 \{#list-dashboards-managed\}

```bash
curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

### 예시: 알림 생성 \{#create-alert-managed\}

```bash
curl -X POST --user $KEY_ID:$KEY_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "dashboardId": "<DASHBOARD_ID>",
    "tileId": "<TILE_ID>",
    "threshold": 100,
    "interval": "1h",
    "source": "tile",
    "thresholdType": "above",
    "channel": {
      "type": "webhook",
      "webhookId": "<WEBHOOK_ID>"
    },
    "name": "Error Spike Alert",
    "message": "Error rate exceeded 100 in the last hour"
  }' \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/alerts
```

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

모든 Open Source ClickStack API 요청은 포트 `8000`에서 HyperDX API 서버로 전송됩니다:

```bash
http://<YOUR_HYPERDX_HOST>:8000/api/v2/<resource>
```

예를 들어, 기본 로컬 배포를 사용하는 경우:

```bash
http://localhost:8000/api/v2/dashboards
```

### 예시: 대시보드 목록 조회 \{#list-dashboards-oss\}

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

### 예시: 알림 생성 \{#create-alert-oss\}

```bash
curl -X POST \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboardId": "<DASHBOARD_ID>",
    "tileId": "<TILE_ID>",
    "threshold": 100,
    "interval": "1h",
    "source": "tile",
    "thresholdType": "above",
    "channel": {
      "type": "webhook",
      "webhookId": "<WEBHOOK_ID>"
    },
    "name": "Error Spike Alert",
    "message": "Error rate exceeded 100 in the last hour"
  }' \
  http://localhost:8000/api/v2/alerts
```

### 예시: 차트 시계열 데이터 쿼리 \{#query-series-data\}

```bash
curl -X POST \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": 1647014400000,
    "endTime": 1647100800000,
    "granularity": "1h",
    "series": [
      {
        "sourceId": "<SOURCE_ID>",
        "aggFn": "count",
        "where": "SeverityText:error",
        "groupBy": []
      }
    ]
  }' \
  http://localhost:8000/api/v2/charts/series
```

</TabItem>
</Tabs>