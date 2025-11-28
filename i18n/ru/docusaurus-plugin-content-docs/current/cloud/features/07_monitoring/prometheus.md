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

Данная возможность поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга сервисов ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через endpoint [ClickHouse Cloud API](/cloud/manage/api/api-overview), который позволяет пользователям безопасно подключаться и экспортировать метрики в свой сборщик метрик Prometheus. Эти метрики можно интегрировать с дашбордами, например, Grafana и Datadog, для визуализации.

Для начала работы [создайте API-ключ](/cloud/manage/openapi).

## API эндпоинта Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретного сервиса |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех сервисов в организации |

**Параметры запроса**

| Имя             | Расположение          | Тип               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | Адрес endpoint’а | UUID               |
| Service ID       | Адрес endpoint’а | UUID (необязательный)               |
| filtered_metrics | Параметр строки запроса | boolean (необязательный) |

### Аутентификация

Используйте API-ключ ClickHouse Cloud для базовой аутентификации:

```bash
Имя пользователя: <KEY_ID>
Пароль: <KEY_SECRET>
Пример запроса
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

# Для всех сервисов в $ORG_ID
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

# HELP ClickHouseProfileEvents_Query Количество запросов для интерпретации и потенциального выполнения. Не включает запросы, которые не удалось разобрать или которые были отклонены из-за ограничений размера AST, квот или ограничений на количество одновременно выполняемых запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries Подсчёт запросов со всеми подзапросами
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Подсчёт SELECT-запросов со всеми подзапросами
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen Количество открытых файлов.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek Количество вызовов функции 'lseek'.
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840

# HELP ClickPipes_Info Всегда равно 1. Метка "clickpipe_state" содержит текущее состояние конвейера: Stopped/Provisioning/Running/Paused/Failed
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

# HELP ClickPipes_FetchedBytes_Total Общее количество несжатых байтов, полученных из источника.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_Errors_Total Общее количество ошибок при приёме данных.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_SentBytes_Total Общее количество несжатых байтов, отправленных в ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_FetchedBytesCompressed_Total Общее количество сжатых байтов, полученных из источника. Если данные не сжаты в источнике, это значение будет равно ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_FetchedEvents_Total Общее количество записей, полученных из источника.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="Демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демонстрационный пайплайн Confluent",clickpipe_source="confluent"} 5535376
```

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_org|Идентификатор организации|
|clickhouse_service|Идентификатор сервиса|
|clickhouse_service_name|Имя сервиса|

Для ClickPipes метрики дополнительно содержат следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_id | Идентификатор ClickPipe |
| clickpipe_name | Имя ClickPipe |
| clickpipe_source | Тип источника ClickPipe |

### Информационные метрики {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является метрикой типа `gauge` и всегда имеет значение `1`. Эта метрика содержит все **Metric Labels**, а также следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_cluster_status|Статус сервиса. Может принимать одно из следующих значений: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Версия сервера ClickHouse, на котором работает сервис|
|scrape|Указывает статус последнего сбора метрик. Может быть `full` или `partial`|
|full|Указывает, что во время последнего сбора метрик не было ошибок|
|partial|Указывает, что во время последнего сбора метрик были ошибки и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не выводят сервис из состояния `idle`. Если сервис находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

Для ClickPipes существует аналогичная метрика `ClickPipes_Info` типа `gauge`, которая помимо **Metric Labels** содержит следующие метки:

| Метка | Описание |
| --- | --- |
| clickpipe_state | Текущее состояние конвейера |

### Настройка Prometheus

Сервер Prometheus собирает метрики с настроенных таргетов с заданным интервалом. Ниже приведён пример конфигурации сервера Prometheus для использования endpoint&#39;а Prometheus в ClickHouse Cloud:

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

Обратите внимание, что для корректного заполнения метки `instance` параметр конфигурации `honor_labels` должен быть установлен в значение `true`. Кроме того, в приведённом выше примере `filtered_metrics` установлено в `true`, однако это значение следует настраивать в соответствии с предпочтениями пользователя.


## Интеграция с Grafana {#integrating-with-grafana}

Существует два основных способа интеграции с Grafana:

- **Metrics Endpoint** – этот подход не требует дополнительных компонентов или инфраструктуры. Он доступен только в Grafana Cloud и требует лишь URL-адреса ClickHouse Cloud Prometheus Endpoint и учетных данных.
- **Grafana Alloy** – Grafana Alloy — это вендорно-нейтральная дистрибуция OpenTelemetry (OTel) Collector, заменяющая Grafana Agent. Ее можно использовать как скрейпер, развертывать в собственной инфраструктуре, и она совместима с любым Prometheus endpoint.

Ниже приведены инструкции по использованию этих вариантов, с акцентом на детали, специфичные для ClickHouse Cloud Prometheus Endpoint.

### Grafana Cloud с endpointом метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в учетную запись Grafana Cloud
- Добавьте новое подключение, выбрав **Metrics Endpoint**
- Настройте Scrape URL так, чтобы он указывал на endpoint Prometheus, и используйте базовую аутентификацию (basic auth) с ключом API и секретом для настройки подключения
- Протестируйте подключение, чтобы убедиться, что оно успешно устанавливается

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Настройка Grafana Metrics Endpoint" border/>

<br />

После настройки вы должны увидеть метрики в выпадающем списке и сможете выбрать их для конфигурации дашбордов:

<Image img={prometheus_grafana_dropdown} size="md" alt="Выпадающий список Grafana Metrics Explorer" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="График в Grafana Metrics Explorer" border/>

### Grafana Cloud с Alloy

Если вы используете Grafana Cloud, Alloy можно установить, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

В результате Alloy будет настроен с компонентом `prometheus.remote_write` для отправки данных в конечную точку Grafana Cloud с использованием токена аутентификации. После этого пользователям нужно только изменить конфигурацию Alloy (она находится в `/etc/alloy/config.alloy` в Linux), чтобы добавить скрейпер для ClickHouse Cloud Prometheus Endpoint.

Ниже приведён пример конфигурации Alloy с компонентом `prometheus.scrape` для сбора метрик с ClickHouse Cloud Endpoint, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что конфигурационный компонент `basic_auth` содержит идентификатор и секрет нашего Cloud API-ключа в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Сбор метрик с адреса прослушивания по умолчанию.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// например: https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // перенаправить в metrics_service ниже
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

Обратите внимание: чтобы метка `instance` заполнялась корректно, параметр конфигурации `honor_labels` должен иметь значение `true`.


### Самостоятельно управляемая Grafana с Alloy

Пользователи, развернувшие Grafana самостоятельно, могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что Alloy настроен на отправку метрик Prometheus в нужное целевое назначение. Компонент `prometheus.scrape` ниже настраивает Alloy на опрос конечной точки ClickHouse Cloud Endpoint. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. При необходимости измените значение ключа `forward_to` на нужное целевое назначение.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Сбор метрик с адреса прослушивания по умолчанию.
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// например: https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // Перенаправление в metrics_service. Измените на нужный получатель
}
```

После завершения настройки вы должны увидеть метрики, связанные с ClickHouse, в обозревателе метрик:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana Metrics Explorer" border />

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка `instance` заполнялась корректно.


## Интеграция с Datadog

Вы можете использовать агент [Datadog Agent](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик с endpoint ClickHouse Cloud. Ниже приведён простой пример конфигурации для этого агента и интеграции. Обратите внимание, что, возможно, имеет смысл отбирать только те метрики, которые представляют для вас наибольший интерес. Приведённый ниже универсальный пример будет экспортировать тысячи комбинаций «метрика–экземпляр», которые Datadog будет рассматривать как пользовательские метрики.

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

<Image img={prometheus_datadog} size="md" alt="Интеграция Prometheus и Datadog" />
