---
'slug': '/integrations/prometheus'
'sidebar_label': 'Prometheus'
'title': 'Prometheus'
'description': 'Экспортировать метрики ClickHouse в Prometheus'
'keywords':
- 'prometheus'
- 'grafana'
- 'monitoring'
- 'metrics'
- 'exporter'
'doc_type': 'reference'
---
import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Интеграция с Prometheus

Эта функция поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга услуг ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через конечную точку [ClickHouse Cloud API](/cloud/manage/api/api-overview), которая позволяет пользователям безопасно подключаться и экспортировать метрики в свой сборщик метрик Prometheus. Эти метрики могут быть интегрированы с панелями мониторинга, например, Grafana, Datadog для визуализации.

Чтобы начать, [сгенерируйте ключ API](/cloud/manage/openapi).

## API конечной точки Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретной службы |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех служб в организации |

**Параметры запроса**

| Имя               | Местоположение        | Тип                |
| ---------------- | ---------------- |------------------ |
| Organization ID  | Адрес конечной точки | uuid               |
| Service ID       | Адрес конечной точки | uuid (необязательно)               |
| filtered_metrics | Параметр запроса | boolean (необязательно) |

### Аутентификация {#authentication}

Используйте свой ключ API ClickHouse Cloud для базовой аутентификации:

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

### Пример ответа {#sample-response}

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

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

| Метка | Описание |
|---|---|
| clickhouse_org | ID организации |
| clickhouse_service | ID службы |
| clickhouse_service_name | Имя службы |

Для ClickPipes метрики также будут иметь следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_id | ID ClickPipe |
| clickpipe_name | Имя ClickPipe |
| clickpipe_source | Тип источника ClickPipe |

### Информационные метрики {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является `gauge`, всегда имеющей значение `1`. Эта метрика содержит все **Метрики Меток**, а также следующие метки:

| Метка | Описание |
|---|---|
| clickhouse_cluster_status | Статус службы. Может быть одним из следующих: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
| clickhouse_version | Версия сервера ClickHouse, на котором работает служба |
| scrape | Указывает статус последнего сбора. Может быть `full` или `partial` |
| full | Указывает, что во время последнего сбора метрик не было ошибок |
| partial | Указывает, что во время последнего сбора метрик были ошибки, и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не возобновят работу службы в состоянии `idle`. В случае, если служба находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

Для ClickPipes есть аналогичная метрика `ClickPipes_Info`, `gauge`, которая, помимо **Метрик Меток**, содержит следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_state | Текущее состояние трубопровода |

### Конфигурирование Prometheus {#configuring-prometheus}

Сервер Prometheus собирает метрики с настроенных целей с определенными интервалами. Ниже приведен пример конфигурации для сервера Prometheus, использующего конечную точку ClickHouse Cloud Prometheus:

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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true`, чтобы метка экземпляра была правильно заполнена. Кроме того, `filtered_metrics` установлен в `true` в приведенном выше примере, но должен быть настроен в зависимости от предпочтений пользователя.

## Интеграция с Grafana {#integrating-with-grafana}

У пользователей есть два основных способа интеграции с Grafana:

- **Конечная точка метрик** – Этот подход имеет преимущество в том, что не требует дополнительных компонентов или инфраструктуры. Эта опция ограничена Grafana Cloud и требует только URL конечной точки ClickHouse Cloud Prometheus и учетных данных.
- **Grafana Alloy** - Grafana Alloy – это дистрибутив OpenTelemetry (OTel) Collector, не привязанный к определенному поставщику, заменяющий агент Grafana. Это можно использовать в качестве сборщика, который можно развернуть в вашей собственной инфраструктуре, и он совместим с любой конечной точкой Prometheus.

Мы предоставляем инструкции по использованию этих опций ниже, сосредоточив внимание на деталях, специфичных для конечной точки ClickHouse Cloud Prometheus.

### Grafana Cloud с конечной точкой метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в свою учетную запись Grafana Cloud
- Добавьте новое соединение, выбрав **Конечная точка метрик**
- Настройте URL для сбора, указав конечную точку Prometheus, и используйте базовую аутентификацию для настройки вашего соединения с ключом/секретом API
- Протестируйте соединение, чтобы убедиться, что вы можете подключиться

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Настройка конечной точки метрик Grafana" border/>

<br />

После настройки вы должны видеть метрики в выпадающем списке, которые вы можете выбрать для настройки панелей мониторинга:

<Image img={prometheus_grafana_dropdown} size="md" alt="Выпадающий список исследователя метрик Grafana" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="График исследователя метрик Grafana" border/>

### Grafana Cloud с Alloy {#grafana-cloud-with-alloy}

Если вы используете Grafana Cloud, Alloy может быть установлен, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

Это должно настроить Alloy с компонентом `prometheus.remote_write` для отправки данных в конечную точку Grafana Cloud с токеном аутентификации. Пользователям нужно только изменить конфигурацию Alloy (находится в `/etc/alloy/config.alloy` для Linux), чтобы включить сборщик для конечной точки ClickHouse Cloud Prometheus.

Ниже приведен пример конфигурации для Alloy с компонентом `prometheus.scrape` для сбора метрик с конечной точки ClickHouse Cloud, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что компонент конфигурации `basic_auth` содержит наш ID ключа API Cloud и секрет как имя пользователя и пароль соответственно.

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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true`, чтобы метка экземпляра была правильно заполнена.

### Grafana самостоятельно управляемая с Alloy {#grafana-self-managed-with-alloy}

Пользователи, управляющие Grafana самостоятельно, могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy для отправки метрик Prometheus в желаемое место назначения. Компонент `prometheus.scrape` ниже заставляет Alloy собирать метрики с конечной точки ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. Настройте ключ `forward_to` в соответствии с целевым местом назначения, если оно не существует.

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

После настройки вы должны видеть метрики, связанные с ClickHouse, в вашем исследователе метрик:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Исследователь метрик Grafana" border/>

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true`, чтобы метка экземпляра была правильно заполнена.

## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Агент](https://docs.datadoghq.com/agent/?tab=Linux) Datadog и интеграцию [OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик с конечной точки ClickHouse Cloud. Ниже приведена простая примерная конфигурация для этого агента и интеграции. Обратите внимание, что вы можете выбрать только те метрики, которые вам наиболее важны. Приведенный ниже всеобъемлющий пример экспортирует множество тысяч комбинаций метрик и экземпляров, которые Datadog будет считать пользовательскими метриками.

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