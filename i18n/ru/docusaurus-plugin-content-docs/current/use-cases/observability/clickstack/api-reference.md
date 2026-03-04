---
slug: /use-cases/observability/clickstack/api-reference
title: 'Справочник API'
pagination_prev: null
pagination_next: null
description: 'Справочник API ClickStack для программного управления дашбордами, алертами и источниками'
doc_type: 'guide'
keywords: ['ClickStack', 'обсервабилити', 'API', 'REST API', 'дашборды', 'алерты', 'HyperDX']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack предоставляет REST API для программного управления дашбордами, оповещениями и источниками данных. API доступен как для **Managed ClickStack** (ClickHouse Cloud), так и для развертываний **ClickStack Open Source**, хотя их конечные точки и механизмы аутентификации различаются.


## Документация по API \{#api-docs\}

<Tabs>
<TabItem value="managed" label="Управляемый ClickStack" default>

В управляемом ClickStack доступ к API осуществляется через **ClickHouse Cloud API**. Конечные точки ClickStack доступны в [спецификации Cloud API](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickStack).

Доступны следующие конечные точки:

| Ресурс | Операции |
|---|---|
| **Dashboards** | Создание, получение списка, получение, обновление и удаление дашбордов |
| **Alerts** | Создание, получение списка, получение, обновление и удаление алертов |
| **Sources** | Получение списка источников данных |

</TabItem>
<TabItem value="oss" label="ClickStack с открытым исходным кодом">

Для ClickStack с открытым исходным кодом полная спецификация API поддерживается в [репозитории HyperDX](https://github.com/hyperdxio/hyperdx) и может быть просмотрена интерактивно или загружена как спецификация OpenAPI:

- [Интерактивная справка по API](https://www.clickhouse.com/docs/clickstack/api-reference)
- [Загрузить спецификацию OpenAPI (JSON)](https://raw.githubusercontent.com/hyperdxio/hyperdx/refs/heads/main/packages/api/openapi.json)

Доступны следующие конечные точки:

| Ресурс | Операции |
|---|---|
| **Dashboards** | Создание, получение списка, получение, обновление и удаление дашбордов |
| **Alerts** | Создание, получение списка, получение, обновление и удаление алертов |
| **Charts** | Запрос данных временных рядов (только POST-запрос) |
| **Sources** | Получение списка источников данных |
| **Webhooks** | Получение списка вебхуков |

</TabItem>
</Tabs>

## Аутентификация \{#authentication\}

<Tabs>
<TabItem value="managed" label="Управляемый ClickStack" default>

Управляемый ClickStack использует **ClickHouse Cloud API key** для аутентификации через [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). Для создания и управления ключами API см. раздел [Managing API keys](/docs/cloud/manage/openapi).

Передайте идентификатор ключа и секрет с помощью HTTP Basic Authentication:

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>

curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

</TabItem>
<TabItem value="oss" label="Open Source ClickStack">

ClickStack с открытым исходным кодом использует **токен типа Bearer** для аутентификации с помощью **персонального ключа доступа к API (Personal API Access Key)**.

Чтобы получить ключ API:

1. Откройте HyperDX по URL вашего ClickStack (например, http://localhost:8080)
2. Создайте учётную запись или войдите в систему, если это необходимо
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **Personal API Access Key**

<Image img={api_key} alt="Ключ API ClickStack"/>

:::note
Он отличается от **ключа API для приёма данных (Ingestion API Key)** в Team Settings, который используется для аутентификации телеметрических данных, отправляемых в OpenTelemetry collector.
:::

Сервер API по умолчанию работает на порту `8000` (отдельно от интерфейса на порту `8080`). При использовании универсального образа Docker all-in-one убедитесь, что вы явно пробрасываете этот порт:

```bash
docker run -p 8080:8080 -p 8000:8000 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Добавьте ключ в заголовок `Authorization`:

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

</TabItem>
</Tabs>

## Базовый URL и формат запроса \{#base-url\}

<Tabs>
<TabItem value="managed" label="Управляемый ClickStack" default>

Все запросы к API управляемого ClickStack отправляются в API ClickHouse Cloud:

```bash
https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/<resource>
```

Вы можете найти свой **Organization ID** в консоли ClickHouse Cloud в разделе **Organization → Organization details**. Ваш **Service ID** виден в URL сервиса или на странице сведений о сервисе.

### Пример: получение списка дашбордов \{#list-dashboards-managed\}

```bash
curl --user $KEY_ID:$KEY_SECRET \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickstack/dashboards
```

### Пример: создание оповещения \{#create-alert-managed\}

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

Все запросы к API Open Source ClickStack отправляются на сервер API HyperDX на порт `8000`:

```bash
http://<YOUR_HYPERDX_HOST>:8000/api/v2/<resource>
```

Например, при использовании локального развертывания по умолчанию:

```bash
http://localhost:8000/api/v2/dashboards
```

### Пример: получение списка дашбордов \{#list-dashboards-oss\}

```bash
curl -H "Authorization: Bearer <YOUR_API_KEY>" \
  http://localhost:8000/api/v2/dashboards
```

### Пример: создание оповещения \{#create-alert-oss\}

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

### Пример: запрос данных рядов диаграммы \{#query-series-data\}

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