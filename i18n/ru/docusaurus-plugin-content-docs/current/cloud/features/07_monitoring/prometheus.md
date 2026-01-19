---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'Экспорт метрик ClickHouse в Prometheus'
keywords: ['prometheus', 'grafana', 'мониторинг', 'метрики', 'экспортер']
doc_type: 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Интеграция с Prometheus \{#prometheus-integration\}

Данная возможность поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга сервисов ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через конечную точку [ClickHouse Cloud API](/cloud/manage/api/api-overview), которая позволяет безопасно подключаться и экспортировать метрики в ваш сборщик метрик Prometheus. Эти метрики могут быть интегрированы с дашбордами, например Grafana или Datadog, для визуализации.

Чтобы начать, [создайте API-ключ](/cloud/manage/openapi).

## API конечной точки Prometheus для доступа к метрикам ClickHouse Cloud \{#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics\}

### Справочник API \{#api-reference\}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретного сервиса |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех сервисов в организации |

**Параметры запроса**

| Имя             | Расположение               | Тип               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | URL конечной точки | uuid               |
| Service ID       | URL конечной точки | uuid (необязательный)               |
| filtered_metrics | Параметр запроса | boolean (необязательный) |

### Аутентификация \{#authentication\}

Используйте ваш API-ключ ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

# For all services in $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true

# For a single service only
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```


### Пример ответа \{#sample-response\}

```response
# HELP ClickHouse_ServiceInfo Information about service, including cluster status and ClickHouse version
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1

# HELP ClickHouseProfileEvents_Query Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries Count queries with all subqueries
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Count SELECT queries with all subqueries
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen Number of files opened.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek Number of times the 'lseek' function was called.
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840

# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1

# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_SentBytesCompressed_Total Total compressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name

# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_Errors_Total Total errors ingesting data.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_FetchedBytesCompressed_Total Total compressed bytes fetched from the source. If data is uncompressed at the source, this will equal ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### Метки метрик \{#metric-labels\}

Все метрики имеют следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_org|ID организации|
|clickhouse_service|ID сервиса|
|clickhouse_service_name|Имя сервиса|

Для ClickPipes метрики также будут иметь следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_id | ID ClickPipe |
| clickpipe_name | Имя ClickPipe |
| clickpipe_source | Тип источника ClickPipe |

### Информационные метрики \{#information-metrics\}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo` типа `gauge`, которая всегда имеет значение `1`. Эта метрика содержит все **Metric Labels**, а также следующие метки:

|Label|Description|
|---|---|
|clickhouse_cluster_status|Состояние сервиса. Может принимать одно из следующих значений: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Версия сервера ClickHouse, на котором запущен сервис|
|scrape|Показывает статус последнего сбора метрик. Может быть `full` или `partial`|
|full|Показывает, что во время последнего сбора метрик не было ошибок|
|partial|Показывает, что во время последнего сбора метрик возникли ошибки и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не выведут простаивающий сервис из режима простоя. Если сервис находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

Для ClickPipes существует похожая метрика `ClickPipes_Info` типа `gauge`, которая, помимо **Metric Labels**, содержит следующие метки:

| Label | Description |
| --- | --- |
| clickpipe_state | Текущее состояние конвейера |

### Настройка Prometheus \{#configuring-prometheus\}

Сервер Prometheus собирает метрики с настроенных таргетов с заданным интервалом. Ниже приведён пример конфигурации сервера Prometheus для использования эндпоинта Prometheus в ClickHouse Cloud:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "clickhouse"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    scheme: https
    params:
      filtered_metrics: ["true"]
    metrics_path: "/v1/organizations/<ORG_ID>/prometheus"
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
```

Обратите внимание, что конфигурационный параметр `honor_labels` должен быть установлен в `true`, чтобы метка `instance` корректно заполнялась. Кроме того, в приведённом выше примере параметр `filtered_metrics` установлен в `true`, но его следует настраивать в соответствии с предпочтениями пользователя.


## Интеграция с Grafana \{#integrating-with-grafana\}

У пользователей есть два основных способа интеграции с Grafana:

- **Metrics Endpoint** – преимущество этого подхода в том, что он не требует дополнительных компонентов или инфраструктуры. Это решение доступно только в Grafana Cloud и требует лишь URL‑адреса и учетных данных ClickHouse Cloud Prometheus Endpoint.
- **Grafana Alloy** – Grafana Alloy — это вендорно-нейтральный дистрибутив OpenTelemetry (OTel) Collector, который заменяет Grafana Agent. Его можно использовать как скрейпер, развертывать в собственной инфраструктуре и использовать с любой конечной точкой Prometheus.

Ниже приведены инструкции по использованию этих вариантов с акцентом на деталях, специфичных для ClickHouse Cloud Prometheus Endpoint.

### Grafana Cloud с endpoint'ом метрик \{#grafana-cloud-with-metrics-endpoint\}

- Войдите в свою учетную запись Grafana Cloud
- Добавьте новое подключение, выбрав **Metrics Endpoint**
- Настройте Scrape URL, указывающий на Prometheus endpoint, и используйте basic auth для настройки подключения с API-ключом и секретом
- Протестируйте подключение, чтобы убедиться, что оно успешно устанавливается

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Настройка Grafana Metrics Endpoint" border/>

<br />

После настройки в раскрывающемся списке должны появиться метрики, которые можно выбрать для настройки дашбордов:

<Image img={prometheus_grafana_dropdown} size="md" alt="Раскрывающееся меню Grafana Metrics Explorer" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="График Grafana Metrics Explorer" border/>

### Grafana Cloud с Alloy \{#grafana-cloud-with-alloy\}

Если вы используете Grafana Cloud, Alloy можно установить, открыв меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

Это автоматически настроит Alloy с компонентом `prometheus.remote_write` для отправки данных на конечную точку Grafana Cloud с использованием токена аутентификации. Пользователям затем нужно только изменить конфигурацию Alloy (расположена в `/etc/alloy/config.alloy` для Linux), чтобы добавить скрейпер для Prometheus-эндпойнта ClickHouse Cloud.

Ниже приведён пример конфигурации Alloy с компонентом `prometheus.scrape` для сбора метрик с эндпойнта ClickHouse Cloud, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что конфигурационный компонент `basic_auth` содержит идентификатор и секрет нашего Cloud API-ключа в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service below
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana API username>"
          password = "<grafana API token>"
    }
  }
}
```

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true`, чтобы лейбл `instance` корректно заполнялся.


### Самоуправляемая Grafana с Alloy \{#grafana-self-managed-with-alloy\}

Пользователи самоуправляемой установки Grafana могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy для отправки метрик Prometheus в нужную целевую систему. Компонент `prometheus.scrape` ниже заставляет Alloy опрашивать конечную точку ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. Если такого компонента нет, измените значение ключа `forward_to`, указав нужную целевую систему.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service. Modify to your preferred receiver
}
```

После настройки вы должны увидеть метрики, связанные с ClickHouse, в обозревателе метрик (Metrics Explorer):

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana Metrics Explorer" border />

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true`, чтобы метка `instance` была корректно заполнена.


## Интеграция с Datadog \{#integrating-with-datadog\}

Вы можете использовать агент [Datadog Agent](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик с конечной точки ClickHouse Cloud. Ниже приведён простой пример конфигурации для этого агента и интеграции. Обратите внимание, что, возможно, имеет смысл выбрать только те метрики, которые для вас наиболее важны. Приведённый ниже универсальный пример будет экспортировать многие тысячи комбинаций метрик и их экземпляров, которые Datadog будет считать пользовательскими метриками.

```yaml
init_config:

instances:
   - openmetrics_endpoint: 'https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true'
     namespace: 'clickhouse'
     metrics:
         - '^ClickHouse.*'
     username: username
     password: password
```

<br />

<Image img={prometheus_datadog} size="md" alt="Интеграция Prometheus с Datadog" />
