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

Эта возможность поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга сервисов ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через конечную точку [ClickHouse Cloud API](/cloud/manage/api/api-overview), которая позволяет пользователям безопасно подключаться и экспортировать метрики в их сборщик метрик Prometheus. Эти метрики можно интегрировать с дашбордами, например, в Grafana или Datadog, для визуализации.

Чтобы начать работу, [создайте ключ API](/cloud/manage/openapi).



## API конечной точки Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                                            | Описание                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретного сервиса              |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]`                     | Возвращает метрики для всех сервисов в организации |

**Параметры запроса**

| Название             | Расположение         | Тип               |
| ---------------- | ---------------- | ------------------ |
| ID организации  | Адрес конечной точки | uuid               |
| ID сервиса       | Адрес конечной точки | uuid (необязательный)    |
| filtered_metrics | Параметр запроса      | boolean (необязательный) |

### Аутентификация {#authentication}

Используйте ваш API-ключ ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
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
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1
```


# HELP ClickHouseProfileEvents_Query Количество запросов, подлежащих интерпретации и потенциальному выполнению. Не включает запросы, которые не удалось разобрать или которые были отклонены из‑за ограничений на размер AST, квот или числа одновременно выполняющихся запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Подзапросы не учитываются.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6



# HELP ClickHouseProfileEvents_QueriesWithSubqueries Количество запросов с подзапросами (включая все подзапросы)
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230



# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Количество запросов SELECT с подзапросами
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224



# HELP ClickHouseProfileEvents_FileOpen Количество открытых файлов.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157



# HELP ClickHouseProfileEvents_Seek Число вызовов системной функции «lseek».
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840



# HELP ClickPipes_Info всегда равно 1. Метка "clickpipe_state" содержит текущее состояние конвейера: Stopped/Provisioning/Running/Paused/Failed
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


# HELP ClickPipes_FetchedBytes_Total Общее количество несжатых байт, полученных от источника.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="Демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демонстрационный конвейер Confluent",clickpipe_source="confluent"} 873286202



# HELP ClickPipes_Errors_Total Общее число ошибок при загрузке данных.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="Демонстрационный инстанс ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демонстрационный конвейер Confluent",clickpipe_source="confluent"} 0



# HELP ClickPipes_SentBytes_Total Общий объем несжатых данных (в байтах), отправленных в ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967



# HELP ClickPipes_FetchedBytesCompressed_Total Общее количество сжатых байт, полученных из источника. Если данные в источнике хранятся в несжатом виде, это значение будет равно ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="Демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демонстрационный конвейер Confluent",clickpipe_source="confluent"} 873286202



# HELP ClickPipes&#95;FetchedEvents&#95;Total Общее количество записей, полученных из источника.

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
|full|Указывает, что при последнем сборе метрик ошибок не было|
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

Обратите внимание, что параметр конфигурации `honor_labels` должен иметь значение `true`, чтобы метка экземпляра заполнялась корректно. Кроме того, в приведённом выше примере для `filtered_metrics` установлено значение `true`, но этот параметр следует настраивать в соответствии с предпочтениями пользователя.


## Интеграция с Grafana {#integrating-with-grafana}

Существует два основных способа интеграции с Grafana:

- **Metrics Endpoint** – Преимущество этого подхода заключается в том, что он не требует дополнительных компонентов или инфраструктуры. Это решение доступно только для Grafana Cloud и требует лишь URL конечной точки Prometheus ClickHouse Cloud и учетные данные.
- **Grafana Alloy** - Grafana Alloy — это вендоронезависимый дистрибутив OpenTelemetry (OTel) Collector, пришедший на смену Grafana Agent. Может использоваться в качестве скрейпера, развертывается в вашей собственной инфраструктуре и совместим с любой конечной точкой Prometheus.

Ниже приведены инструкции по использованию этих вариантов с акцентом на особенности конечной точки Prometheus ClickHouse Cloud.

### Grafana Cloud с конечной точкой метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в учетную запись Grafana Cloud
- Добавьте новое подключение, выбрав **Metrics Endpoint**
- Настройте Scrape URL так, чтобы он указывал на конечную точку Prometheus, и используйте базовую аутентификацию для настройки подключения с помощью API key/secret
- Протестируйте подключение, чтобы убедиться в возможности соединения

<Image
  img={prometheus_grafana_metrics_endpoint}
  size='md'
  alt='Настройка конечной точки метрик Grafana'
  border
/>

<br />

После настройки вы увидите метрики в выпадающем списке, которые можно выбрать для настройки дашбордов:

<Image
  img={prometheus_grafana_dropdown}
  size='md'
  alt='Выпадающий список Grafana Metrics Explorer'
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

Это настроит Alloy с компонентом `prometheus.remote_write` для отправки данных в конечную точку Grafana Cloud с токеном аутентификации. Пользователям остается только изменить конфигурацию Alloy (находится в `/etc/alloy/config.alloy` для Linux), чтобы добавить скрейпер для конечной точки Prometheus ClickHouse Cloud.

Ниже показан пример конфигурации Alloy с компонентом `prometheus.scrape` для сбора метрик из конечной точки ClickHouse Cloud, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что компонент конфигурации `basic_auth` содержит идентификатор API-ключа Cloud и секрет в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
// Сбор метрик с адреса прослушивания по умолчанию.
targets = [{
__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// например, https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
}]

honor_labels = true

basic_auth {
username = "KEY_ID"
password = "KEY_SECRET"
}

forward_to = [prometheus.remote_write.metrics_service.receiver]
// перенаправление в metrics_service ниже
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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true` для корректного заполнения метки instance.

### Самостоятельно управляемая Grafana с Alloy {#grafana-self-managed-with-alloy}

Пользователи самостоятельно управляемой Grafana могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Предполагается, что пользователи настроили Alloy для отправки метрик Prometheus в желаемое место назначения. Компонент `prometheus.scrape` ниже обеспечивает сбор данных Alloy из конечной точки ClickHouse Cloud. Предполагается, что `prometheus.remote_write` получает собранные метрики. Если этот компонент отсутствует, настройте `forward_to key` на целевое место назначения.

```yaml
prometheus.scrape "clickhouse_cloud" {
// Сбор метрик с адреса прослушивания по умолчанию.
targets = [{
__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// например, https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
}]

honor_labels = true

basic_auth {
username = "KEY_ID"
password = "KEY_SECRET"
}
```


forward&#95;to = [prometheus.remote&#95;write.metrics&#95;service.receiver]
// пересылать в metrics&#95;service. Измените на предпочтительный получатель
&#125;

```

После настройки в обозревателе метрик должны отобразиться метрики ClickHouse:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Обозреватель метрик Grafana" border/>

<br />

Обратите внимание: для корректного заполнения метки instance параметр конфигурации `honor_labels` должен иметь значение `true`.
```


## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Agent](https://docs.datadoghq.com/agent/?tab=Linux) Datadog и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик из конечной точки ClickHouse Cloud. Ниже приведен простой пример конфигурации для этого агента и интеграции. Обратите внимание, что вы можете выбрать только те метрики, которые вас интересуют больше всего. Приведенный ниже универсальный пример экспортирует тысячи комбинаций метрик и экземпляров, которые Datadog будет обрабатывать как пользовательские метрики.

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
