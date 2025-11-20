---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'Экспорт метрик ClickHouse в Prometheus'
keywords: ['prometheus', 'grafana', 'monitoring', 'metrics', 'exporter']
doc_type: 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Интеграция с Prometheus

Эта возможность поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга сервисов ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через endpoint [ClickHouse Cloud API](/cloud/manage/api/api-overview), который позволяет пользователям безопасно подключаться и экспортировать метрики в их сборщик метрик Prometheus. Эти метрики можно использовать в дашбордах, например в Grafana или Datadog, для визуализации.

Чтобы начать, [сгенерируйте API-ключ](/cloud/manage/openapi).



## API конечной точки Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник по API {#api-reference}

| Method | Path                                                                                                                            | Description                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретного сервиса                 |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]`                     | Возвращает метрики для всех сервисов в организации         |

**Параметры запроса**

| Name             | Location         | Type                    |
| ---------------- | ---------------- | ----------------------- |
| Organization ID  | Endpoint address | uuid                    |
| Service ID       | Endpoint address | uuid (необязательно)    |
| filtered_metrics | Query param      | boolean (необязательно) |

### Аутентификация {#authentication}

Используйте ключ API ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Пример запроса
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

```


# Для всех сервисов в организации $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true



# Только для одного сервиса

export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### Пример ответа {#sample-response}


```response
# HELP ClickHouse_ServiceInfo Информация о сервисе, включая статус кластера и версию ClickHouse
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1
```


# HELP ClickHouseProfileEvents_Query Количество запросов, подлежащих интерпретации и потенциальному выполнению. Не включает запросы, которые не удалось разобрать при парсинге или которые были отклонены из‑за ограничений на размер AST, квот или ограничений на количество одновременно выполняющихся запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6



# HELP ClickHouseProfileEvents_QueriesWithSubqueries Количество запросов со всеми подзапросами
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230



# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Количество запросов SELECT с подзапросами
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224



# HELP ClickHouseProfileEvents_FileOpen Количество файлов, которые были открыты.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157



# HELP ClickHouseProfileEvents_Seek Количество вызовов функции «lseek».
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840



# HELP ClickPipes_Info Всегда равно 1. Метка "clickpipe_state" содержит текущее состояние пайпа: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1



# HELP ClickPipes_SentEvents_Total Общее количество записей, отправленных в ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250



# HELP ClickPipes_SentBytesCompressed_Total Общее количество сжатых байтов, отправленных в ClickHouse.

# TYPE ClickPipes_SentBytesCompressed_Total counter

ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total Общее количество несжатых байт, полученных из источника.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes_Errors_Total Общее количество ошибок при ingestion данных.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0



# HELP ClickPipes_SentBytes_Total Общее количество несжатых байт, отправленных в ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967



# HELP ClickPipes_FetchedBytesCompressed_Total Общее количество сжатых байт, полученных из источника. Если данные не сжаты на источнике, это значение будет равно ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes&#95;FetchedEvents&#95;Total Общее количество записей, считанных из источника.

# TYPE ClickPipes&#95;FetchedEvents&#95;Total counter

ClickPipes&#95;FetchedEvents&#95;Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376

````

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_org|Идентификатор организации|
|clickhouse_service|Идентификатор сервиса|
|clickhouse_service_name|Имя сервиса|

Для ClickPipes метрики также имеют следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_id | Идентификатор ClickPipe |
| clickpipe_name | Имя ClickPipe |
| clickpipe_source | Тип источника ClickPipe |

### Информационные метрики {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является `gauge` и всегда имеет значение `1`. Эта метрика содержит все **метки метрик**, а также следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_cluster_status|Статус сервиса. Может принимать одно из следующих значений: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Версия сервера ClickHouse, на котором работает сервис|
|scrape|Указывает статус последнего сбора метрик. Может быть `full` или `partial`|
|full|Указывает, что при последнем сборе метрик не было ошибок|
|partial|Указывает, что при последнем сборе метрик произошли ошибки и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не возобновляют работу неактивного сервиса. Если сервис находится в состоянии `idle`, возвращается только метрика `ClickHouse_ServiceInfo`.

Для ClickPipes существует аналогичная метрика `gauge` `ClickPipes_Info`, которая в дополнение к **меткам метрик** содержит следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_state | Текущее состояние конвейера |

### Настройка Prometheus {#configuring-prometheus}

Сервер Prometheus собирает метрики с настроенных целей через заданные интервалы. Ниже приведен пример конфигурации сервера Prometheus для использования конечной точки Prometheus в ClickHouse Cloud:

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
````

Обратите внимание, что для корректного заполнения метки экземпляра параметр конфигурации `honor_labels` должен быть установлен в `true`. Кроме того, в приведенном выше примере `filtered_metrics` установлено в `true`, но этот параметр следует настраивать в соответствии с предпочтениями пользователя.


## Интеграция с Grafana {#integrating-with-grafana}

У пользователей есть два основных способа интеграции с Grafana:

- **Metrics Endpoint** – преимущество этого подхода в том, что он не требует дополнительных компонентов или инфраструктуры. Он доступен только в Grafana Cloud и требует лишь URL конечной точки ClickHouse Cloud Prometheus и учетные данные.
- **Grafana Alloy** – Grafana Alloy — это независимая от поставщика дистрибуция OpenTelemetry (OTel) Collector, которая заменяет Grafana Agent. Она может использоваться как скрейпер, разворачиваться в вашей собственной инфраструктуре и совместима с любой конечной точкой Prometheus.

Ниже приведены инструкции по использованию этих вариантов с акцентом на особенностях конечной точки ClickHouse Cloud Prometheus.

### Grafana Cloud с Metrics Endpoint {#grafana-cloud-with-metrics-endpoint}

- Войдите в свою учётную запись Grafana Cloud
- Добавьте новое подключение, выбрав **Metrics Endpoint**
- Настройте Scrape URL так, чтобы он указывал на конечную точку Prometheus, и используйте базовую аутентификацию (basic auth), указав ключ/секрет API для настройки подключения
- Протестируйте подключение, чтобы убедиться, что соединение устанавливается

<Image
  img={prometheus_grafana_metrics_endpoint}
  size='md'
  alt='Настройка Grafana Metrics Endpoint'
  border
/>

<br />

После настройки вы должны увидеть метрики в раскрывающемся списке, из которого их можно выбрать для настройки дашбордов:

<Image
  img={prometheus_grafana_dropdown}
  size='md'
  alt='Раскрывающийся список Grafana Metrics Explorer'
  border
/>

<br />

<Image
  img={prometheus_grafana_chart}
  size='md'
  alt='График Grafana Metrics Explorer'
  border
/>

### Grafana Cloud с Alloy {#grafana-cloud-with-alloy}

Если вы используете Grafana Cloud, Alloy можно установить, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size='md' alt='Grafana Alloy' border />

<br />

Это настроит Alloy с компонентом `prometheus.remote_write` для отправки данных на конечную точку Grafana Cloud с использованием токена аутентификации. Затем пользователям нужно лишь изменить конфигурацию Alloy (расположенную в `/etc/alloy/config.alloy` в Linux), чтобы добавить скрейпер для конечной точки ClickHouse Cloud Prometheus.

Ниже приведён пример конфигурации Alloy с компонентом `prometheus.scrape` для сбора метрик с конечной точки ClickHouse Cloud, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что в конфигурационном компоненте `basic_auth` в качестве имени пользователя и пароля соответственно указаны идентификатор и секрет нашего Cloud API-ключа.

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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка instance заполнялась корректно.

### Самостоятельно управляемая Grafana с Alloy {#grafana-self-managed-with-alloy}

Пользователи, самостоятельно управляющие Grafana, могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy на отправку метрик Prometheus в нужное им место назначения. Ниже приведённый компонент `prometheus.scrape` заставляет Alloy собирать метрики с конечной точки ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. При необходимости измените параметр `forward_to` на целевое назначение.

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
```


forward&#95;to = [prometheus.remote&#95;write.metrics&#95;service.receiver]
// пересылать в metrics&#95;service. Замените на предпочитаемый получатель
&#125;

```

После настройки вы увидите метрики ClickHouse в обозревателе метрик:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Обозреватель метрик Grafana" border/>

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка instance заполнялась корректно.
```


## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Agent](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) от Datadog для сбора метрик из конечной точки ClickHouse Cloud. Ниже приведен простой пример конфигурации для этого агента и интеграции. Обратите внимание, что вы можете выбрать только те метрики, которые вас интересуют больше всего. Приведенный ниже универсальный пример экспортирует многие тысячи комбинаций метрик и экземпляров, которые Datadog будет обрабатывать как пользовательские метрики.

```yaml
init_config:

instances:
  - openmetrics_endpoint: "https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true"
    namespace: "clickhouse"
    metrics:
      - "^ClickHouse.*"
    username: username
    password: password
```

<br />

<Image
  img={prometheus_datadog}
  size='md'
  alt='Интеграция Prometheus с Datadog'
/>
