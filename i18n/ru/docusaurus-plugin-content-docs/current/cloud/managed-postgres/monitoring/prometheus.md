---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'конечная точка Prometheus'
title: 'Конечная точка Prometheus для Managed Postgres'
description: 'Собирайте метрики Managed Postgres в Prometheus, Grafana, Datadog или любой коллектор, совместимый с OpenMetrics'
keywords: ['managed postgres', 'prometheus', 'grafana', 'datadog', 'метрики', 'openmetrics', 'обсервабилити']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import grafanaDashboard from '@site/static/images/managed-postgres/monitoring/grafana-dashboard.png';

# Интеграция с Prometheus \{#prometheus-integration\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-prometheus" />

Managed Postgres предоставляет две совместимые с Prometheus конечные точки метрик
в [ClickHouse Cloud API][cloud-api]:

| Конечная точка | Путь                                                   | Возвращает                                               |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Организация    | `/v1/organizations/{orgId}/postgres/prometheus`        | Метрики для всех сервисов Managed Postgres в организации |
| Экземпляр      | `/v1/organizations/{orgId}/postgres/{pgId}/prometheus` | Метрики для одного сервиса                               |

:::note
Конечная точка уровня организации возвращает метрики не более чем для 100 сервисов. Если в вашей
организации более 100 сервисов Managed Postgres, [обратитесь
в службу поддержки](https://clickhouse.com/support/program).
:::

## Аутентификация \{#authentication\}

Для этой конечной точки используются те же [API-ключи], что и для остального OpenAPI; см.
[руководство по OpenAPI](/cloud/managed-postgres/openapi), где описано, как создать
их и узнать идентификаторы вашей организации и сервиса.

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret
ORG_ID=myorgid
PG_ID=mypgid
```

## Сбор метрик со всех сервисов организации \{#scrape-org\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/prometheus"
```

## Сбор метрик с одного сервиса \{#scrape-instance\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/prometheus"
```

## Пример ответа \{#sample-response\}

```response
# HELP PostgresServiceInfo Information about PostgreSQL service, including status and version.
# TYPE PostgresServiceInfo gauge
PostgresServiceInfo{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",postgres_status="running",postgres_version="18"} 1

# HELP PostgresServer_ActiveConnections Number of active connections by state.
# TYPE PostgresServer_ActiveConnections gauge
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="active"} 1
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="idle"} 4

# HELP PostgresServer_CacheHitRatio Buffer cache hit ratio: blocks served from cache vs. total blocks accessed (%).
# TYPE PostgresServer_CacheHitRatio gauge
PostgresServer_CacheHitRatio{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres"} 100
```

Полный список метрик и их значений см. в
[справочнике по метрикам](/cloud/managed-postgres/monitoring/metrics).

## Настройка Prometheus \{#configuring-prometheus\}

Эта конфигурация собирает метрики с конечной точки уровня организации каждые 60 секунд:

```yaml
scrape_configs:
  - job_name: "managed-postgres"
    scheme: https
    metrics_path: "/v1/organizations/<ORG_ID>/postgres/prometheus"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
    scrape_interval: 60s
```

Конечная точка обновляет метрики раз в минуту. Сбор метрик чаще, чем
каждые `60s`, приводит к дублированию точек данных и ступенчатому виду графиков на панелях Gauge.

Установите `honor_labels: true`, чтобы метки `postgres_service` и
`postgres_service_name` из конечной точки сохранялись, а не
заменялись Prometheus.

Чтобы собирать метрики только для одного сервиса, добавьте `/<PG_ID>` к `metrics_path`.

## Готовая панель мониторинга Grafana \{#grafana-dashboard\}

Готовая панель мониторинга Grafana визуализирует все метрики, которые
предоставляет конечная точка: сортируемую таблицу сервисов, загрузку CPU и памяти, использование диска
с оповещениями о превышении пороговых значений, соединения по состояниям, транзакции и
долю откатов, активность кортежей, I/O, использование хранилища по базам данных и
взаимоблокировки.

<Image img={grafanaDashboard} alt="Панель мониторинга Grafana для сервисов Managed Postgres" size="md" border />

### Импорт панели мониторинга \{#import-dashboard\}

<VerticalStepper headerLevel="h4">
  #### Скачайте JSON‑файл панели мониторинга \{#download\}

  <TrackedLink href={useBaseUrl('/examples/managed-postgres-grafana-dashboard.json')} download="managed-postgres-grafana-dashboard.json" eventName="docs.managed_postgres_grafana_dashboard.download">Скачать JSON‑файл панели мониторинга</TrackedLink>.

  #### Откройте импорт в Grafana \{#open-import\}

  Перейдите в **Dashboards → New → Import**. Загрузите JSON‑файл или вставьте его содержимое.

  #### Выберите источник данных Prometheus \{#pick-datasource\}

  Когда будет предложено указать `DS_PROMETHEUS`, выберите источник данных Prometheus, который собирает данные с конечной точки, настроенной в [предыдущем разделе](#configuring-prometheus).
</VerticalStepper>

Для развертываний Grafana с provisioning поместите JSON в
путь provisioning для панелей мониторинга. Grafana сопоставит `${DS_PROMETHEUS}`
с доступным в экземпляре источником данных Prometheus.

### Переменные шаблона \{#template-variables\}

Панель мониторинга содержит три переменные:

* **Источник данных** — источник данных Prometheus, на котором основана панель мониторинга.
* **Сервис** — фильтр с множественным выбором по `postgres_service_name`.
  По умолчанию выбрано *All*; выберите один или несколько сервисов, чтобы применить их ко всем панелям.
* **Интервал сбора** — скрытая константа со значением по умолчанию `60s`. Используется
  при вычислении `$__rate_interval` в Grafana. Измените это значение в
  JSON, если у вас задан другой интервал сбора.

### Отфильтруйте по одному сервису для детального анализа \{#drill-in\}

Несколько панелей предназначены для детального анализа после
фильтрации по одному сервису с помощью переменной **Service**. Панель CPU by mode,
например, показывает режимы CPU `user`, `system`, `iowait`, `steal` и другие в виде стека,
чтобы вы могли определить, чем вызван всплеск: прикладным кодом, работой ядра,
ожиданием диска или конкуренцией за ресурсы гипервизора.

## Интеграция с Grafana и Datadog \{#third-party-integrations\}

Эта конечная точка имеет ту же структуру, что и [конечная точка ClickHouse Prometheus](/integrations/prometheus), поэтому описанные там конфигурации для Grafana Cloud, Grafana
Alloy и агента Datadog OpenMetrics
подходят и здесь. В `metrics_path` укажите путь организации или
экземпляра Managed Postgres вместо пути ClickHouse.

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "Управление API-ключами"