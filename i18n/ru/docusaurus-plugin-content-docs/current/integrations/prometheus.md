---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: 'Экспорт метрик ClickHouse в Prometheus'
keywords: ['prometheus', 'grafana', 'мониторинг', 'метрики', 'экспортер']
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';



# Интеграция с Prometheus

Эта функция поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга сервисов ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через [ClickHouse Cloud API](/cloud/manage/api/api-overview), который позволяет пользователям безопасно подключаться и экспортировать метрики в их сборщик метрик Prometheus. Эти метрики могут быть интегрированы с панелями управления, например, Grafana, Datadog для визуализации.

Чтобы начать, [сгенерируйте ключ API](/cloud/manage/openapi).

## API конечной точки Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретного сервиса |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех сервисов в организации |

**Параметры запроса**

| Имя                | Местоположение          | Тип                |
| ------------------ | ------------------ |------------------ |
| Organization ID    | Адрес конечной точки | uuid               |
| Service ID         | Адрес конечной точки | uuid (необязательный)               |
| filtered_metrics   | Параметр запроса | boolean (необязательный) |


### Аутентификация {#authentication}

Используйте ваш ключ API ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
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
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query Количество запросов, которые будут интерпретированы и потенциально выполнены. Не включает запросы, которые не удалось разобрать или были отклонены из-за ограничений по размеру AST, лимитов квоты или лимитов на количество одновременно запущенных запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries Количество запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Количество SELECT-запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen Количество открытых файлов.

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek Количество вызовов функции 'lseek'.

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовый сервис",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840


# HELP ClickPipes_Info Всегда равно 1. Метка "clickpipe_state" содержит текущее состояние трубы: Остановлено/Подготовка/Работа/Приостановлено/Неудача

# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent",clickpipe_status="Работа"} 1


# HELP ClickPipes_SentEvents_Total Общее количество записей, отправленных в ClickHouse

# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 5534250


# HELP ClickPipes_SentBytesCompressed_Total Общее количество сжатых байт, отправленных в ClickHouse.

# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total Общее количество не сжатых байт, полученных из источника.

# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_Errors_Total Общее количество ошибок при приеме данных.

# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 0


# HELP ClickPipes_SentBytes_Total Общее количество не сжатых байт, отправленных в ClickHouse.

# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 477187967


# HELP ClickPipes_FetchedBytesCompressed_Total Общее количество сжатых байт, полученных из источника. Если данные не сжимаются на источнике, это будет равно ClickPipes_FetchedBytes_Total

# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_FetchedEvents_Total Общее количество записей, извлеченных из источника.

# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="демонстрационный экземпляр ClickPipes",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Демо труба Confluent",clickpipe_source="confluent"} 5535376
```

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

| Метка                     | Описание                      |
|---------------------------|-------------------------------|
| clickhouse_org            | ID организации                |
| clickhouse_service         | ID сервиса                   |
| clickhouse_service_name    | Имя сервиса                  |

Для ClickPipes метрики также будут иметь следующие метки:

| Метка         | Описание                   |
|---------------|----------------------------|
| clickpipe_id  | ID ClickPipe               |
| clickpipe_name | Имя ClickPipe              |
| clickpipe_source | Тип источника ClickPipe  |

### Информационные метрики {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является `gauge`, всегда имеющим значение `1`. Эта метрика содержит все **Метки метрик**, а также следующие метки:

| Метка                     | Описание                      |
|---------------------------|-------------------------------|
| clickhouse_cluster_status  | Статус сервиса. Может быть одним из следующих: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version         | Версия сервера ClickHouse, на котором работает сервис |
| scrape                     | Указывает статус последнего получения метрик. Может быть либо `full`, либо `partial` |
| full                       | Указывает, что во время последнего получения метрик не было ошибок |
| partial                    | Указывает, что во время последнего получения метрик были некоторые ошибки, и была возвращена только метрика `ClickHouse_ServiceInfo`. |

Запросы на получение метрик не возобновят состояние простоя сервиса. В случае, если сервис находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

Для ClickPipes существует аналогичная метрика `ClickPipes_Info` - `gauge`, которая дополнительно к **Меткам метрик** содержит следующие метки:

| Метка            | Описание                   |
|-------------------|----------------------------|
| clickpipe_state    | Текущее состояние трубы    |

### Конфигурирование Prometheus {#configuring-prometheus}

Сервер Prometheus собирает метрики от настроенных объектов через заданные интервалы. Ниже приведен пример конфигурации для сервера Prometheus для использования конечной точки Prometheus ClickHouse Cloud:

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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true` для корректного заполнения метки экземпляра. Кроме того, `filtered_metrics` установлен на `true` в приведенном выше примере, но должен быть настроен в зависимости от предпочтений пользователя.

## Интеграция с Grafana {#integrating-with-grafana}

У пользователей есть два основных способа интеграции с Grafana:

- **Конечная точка метрик** – Этот подход имеет преимущества в том, что не требует дополнительных компонентов или инфраструктуры. Это предложение ограничено Grafana Cloud и требует только URL-адреса конечной точки Prometheus ClickHouse Cloud и учетных данных.
- **Grafana Alloy** - Grafana Alloy является независимым от поставщика дистрибутивом сборщика OpenTelemetry (OTel), заменяющим агент Grafana. Это может быть использовано как скребок, его можно развернуть в вашей собственной инфраструктуре и оно совместимо с любой конечной точкой Prometheus.

Мы предоставляем инструкции по использованию этих вариантов ниже, сосредотачиваясь на деталях, специфичных для конечной точки Prometheus ClickHouse Cloud.

### Grafana Cloud с конечной точкой метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в вашу учетную запись Grafana Cloud
- Добавьте новое соединение, выбрав **Конечная точка метрик**
- Настройте URL-адрес получения, чтобы указать на конечную точку Prometheus и используйте базовую аутентификацию для настройки вашего соединения с ключом/секретом API
- Проверьте соединение, чтобы убедиться, что вы можете подключиться

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Настройка конечной точки метрик Grafana" border/>

<br />

После настройки вы должны увидеть метрики в выпадающем списке, которые вы можете выбрать для настройки панелей управления:

<Image img={prometheus_grafana_dropdown} size="md" alt="Выпадающее меню исследователя метрик Grafana" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="График исследователя метрик Grafana" border/>

### Grafana Cloud с Alloy {#grafana-cloud-with-alloy}

Если вы используете Grafana Cloud, Alloy можно установить, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

Это должно настроить Alloy с компонентом `prometheus.remote_write` для отправки данных на конечную точку Grafana Cloud с токеном аутентификации. Пользователям нужно будет только изменить конфигурацию Alloy (находится в `/etc/alloy/config.alloy` для Linux), чтобы включить скребок для конечной точки Prometheus ClickHouse Cloud.

Ниже показан пример конфигурации для Alloy с компонентом `prometheus.scrape` для сканирования метрик из конечной точки ClickHouse Cloud, а также автоматически настроенным компонентом `prometheus.remote_write`. Обратите внимание, что компонент конфигурации `basic_auth` содержит наш идентификатор и секрет ключа API Cloud в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Сбор метрик с адреса по умолчанию.
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
  // перенаправление на metrics_service ниже
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Имя пользователя Grafana API>"
          password = "<токен API grafana>"
    }
  }
}
```

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true` для корректного заполнения метки экземпляра.

### Grafana, управляемая самостоятельно, с Alloy {#grafana-self-managed-with-alloy}

Пользователи Grafana, управляющейся самостоятельно, могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy для отправки метрик Prometheus в нужное им место назначения. Компонент `prometheus.scrape` ниже заставляет Alloy сканировать конечную точку ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. Измените ключ `forward_to`, если это необходимо.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Сбор метрик с адреса по умолчанию.
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
  // перенаправление на metrics_service. Измените на ваш предпочтительный приемник
}
```

После настройки вы должны увидеть метрики, относящиеся к ClickHouse, в вашем исследователе метрик:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Исследователь метрик Grafana" border/>

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в `true` для корректного заполнения метки экземпляра.

## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Агент Datadog](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик с конечной точки ClickHouse Cloud. Ниже представлена простая примерная конфигурация для этого агента и интеграции. Обратите внимание, что вам может понадобиться выбирать только те метрики, которые вас наиболее интересуют. Всеобъемлющий пример ниже экспортирует множество тысяч комбинаций метрик и экземпляров, которые Datadog будет воспринимать как пользовательские метрики.

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

