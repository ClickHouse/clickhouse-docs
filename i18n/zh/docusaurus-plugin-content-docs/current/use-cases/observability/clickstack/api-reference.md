---
slug: /use-cases/observability/clickstack/api-reference
title: 'API 参考'
pagination_prev: null
pagination_next: null
description: 'ClickStack API 参考文档，用于以编程方式管理仪表板、告警和数据源'
doc_type: 'guide'
keywords: ['ClickStack', '可观测性', 'API', 'REST API', 'dashboards', 'alerts', 'HyperDX']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack 提供了一个 REST API，用于以编程方式管理仪表盘、告警和数据源。该 API 既适用于 **Managed ClickStack**（ClickHouse Cloud），也适用于 **ClickStack Open Source** 部署，但二者在端点和认证方式上有所不同。


## API 参考文档 \{#api-docs\}

<Tabs>
<TabItem value="managed" label="托管 ClickStack" default>

对于托管 ClickStack，可以通过 **ClickHouse Cloud API** 访问 API。ClickStack 的端点定义见 [Cloud API 规范](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickStack)。

提供以下 API 端点：

| 资源 | 操作 |
|---|---|
| **Dashboards** | 创建、列出、获取、更新和删除仪表盘 |
| **Alerts** | 创建、列出、获取、更新和删除告警 |
| **Sources** | 列出数据源 |

</TabItem>
<TabItem value="oss" label="开源 ClickStack">

对于开源版 ClickStack，完整的 API 规范维护在 [HyperDX 仓库](https://github.com/hyperdxio/hyperdx) 中，可通过交互式界面查看或下载为 OpenAPI 规范：

- [交互式 API 参考](https://www.clickhouse.com/docs/clickstack/api-reference)
- [下载 OpenAPI 规范（JSON）](https://raw.githubusercontent.com/hyperdxio/hyperdx/refs/heads/main/packages/api/openapi.json)

提供以下 API 端点：

| 资源 | 操作 |
|---|---|
| **Dashboards** | 创建、列出、获取、更新和删除仪表盘 |
| **Alerts** | 创建、列出、获取、更新和删除告警 |
| **Charts** | 查询时间序列数据（仅支持 POST） |
| **Sources** | 列出数据源 |
| **Webhooks** | 列出 Webhook |

</TabItem>
</Tabs>

## 身份验证 \{#authentication\}

<Tabs>
<TabItem value="managed" label="托管 ClickStack" default>

托管 ClickStack 通过 [HTTP 基本身份验证](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)使用 **ClickHouse Cloud API key** 进行身份验证。要创建和管理 API key，请参阅[管理 API key](/docs/cloud/manage/openapi)。

通过 HTTP 基本身份验证传递 key ID 和 secret：

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>

curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

</TabItem>
<TabItem value="oss" label="开源 ClickStack">

开源 ClickStack 通过 **Bearer token** 和 **Personal API Access Key** 进行身份验证。

获取 API key：

1. 在你的 ClickStack URL 打开 HyperDX（例如：http://localhost:8080）
2. 如有需要，创建账号或登录
3. 前往 **Team Settings → API Keys**
4. 复制你的 **Personal API Access Key**

<Image img={api_key} alt="ClickStack API Key"/>

:::note
这与 Team Settings 中的 **摄取 API key** 不同，后者用于对发送到 OpenTelemetry collector 的遥测数据进行身份验证。
:::

API 服务器默认运行在端口 `8000`（与运行在端口 `8080` 的 UI 分离）。使用一体化 Docker 镜像时，请确保显式映射该端口：

```bash
docker run -p 8080:8080 -p 8000:8000 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

在 `Authorization` 请求头中包含该 key：

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

</TabItem>
</Tabs>

## 基础 URL 和请求格式 \{#base-url\}

<Tabs>
<TabItem value="managed" label="Managed ClickStack" default>

所有 Managed ClickStack API 请求都会发送到 ClickHouse Cloud 的 API：

```bash
https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/<resource>
```

可以在 ClickHouse Cloud 控制台的 **Organization → Organization details** 中找到 **Organization ID**。**Service ID** 可以在服务 URL 中或服务详情页上看到。

### 示例：列出仪表盘 \{#list-dashboards-managed\}

```bash
curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

### 示例：创建告警 \{#create-alert-managed\}

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

所有 Open Source ClickStack API 请求都会发送到运行在端口 `8000` 上的 HyperDX API 服务器：

```bash
http://<YOUR_HYPERDX_HOST>:8000/api/v2/<resource>
```

例如，对于默认的本地部署：

```bash
http://localhost:8000/api/v2/dashboards
```

### 示例：列出仪表盘 \{#list-dashboards-oss\}

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

### 示例：创建告警 \{#create-alert-oss\}

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

### 示例：查询图表序列数据 \{#query-series-data\}

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