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

Данная функция поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга услуг ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через [ClickHouse Cloud API](/cloud/manage/api/api-overview), который позволяет пользователям безопасно подключаться и экспортировать метрики в их сборщик метрик Prometheus. Эти метрики можно интегрировать с панелями мониторинга, например, Grafana, Datadog для визуализации.

Чтобы начать, [сгенерируйте ключ API](/cloud/manage/openapi).

## API Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретной услуги |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех услуг в организации |

**Параметры запроса**

| Имя              | Местоположение        | Тип               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | Адрес конечной точки | uuid               |
| Service ID       | Адрес конечной точки | uuid (необязательный)               |
| filtered_metrics | Параметр запроса     | boolean (необязательный) |


### Аутентификация {#authentication}

Используйте ваш ключ API ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Пример запроса
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# Для всех услуг в $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# Только для одной услуги
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### Пример ответа {#sample-response}

```response

# HELP ClickHouse_ServiceInfo Информация о службе, включая статус кластера и версию ClickHouse

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query Количество запросов для интерпретации и потенциального выполнения. Не включает запросы, которые не удалось разобрать или были отклонены из-за ограничений размера AST, квот или ограничений на количество одновременно выполняемых запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries Количество запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Количество SELECT запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen Количество открытых файлов.

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek Количество вызовов функции 'lseek'.

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

|Label|Описание|
|---|---|
|clickhouse_org|ID организации|
|clickhouse_service|ID услуги|
|clickhouse_service_name|Имя услуги|

### Информационные метрики {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является `gauge`, всегда имеющая значение `1`. Эта метрика содержит все **Метки метрик**, а также следующие метки:

|Label|Описание|
|---|---|
|clickhouse_cluster_status|Статус службы. Может принимать одно из следующих значений: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Версия сервера ClickHouse, на котором работает служба|
|scrape|Указывает статус последнего сбора. Может быть либо `full`, либо `partial`|
|full|Указывает, что при последнем сборе метрик не было ошибок|
|partial|Указывает, что при последнем сборе метрик были некоторые ошибки, и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не восстановят приостановленную службу. Если служба находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

### Настройка Prometheus {#configuring-prometheus}

Сервер Prometheus собирает метрики с настроенных целей с заданными интервалами. Ниже приведен пример конфигурации для сервера Prometheus с использованием конечной точки Prometheus ClickHouse Cloud:

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

Обратите внимание, что параметр конфигурации `honor_labels` необходимо установить в значение `true`, чтобы метка экземпляра была правильно заполнена. Дополнительно, `filtered_metrics` установлен в значение `true` в приведенном выше примере, но должен быть настроен в зависимости от предпочтений пользователя.

## Интеграция с Grafana {#integrating-with-grafana}

Пользователи имеют два основных способа интеграции с Grafana:

- **Конечная точка метрик** – Этот подход имеет преимущество в отсутствии необходимости в дополнительных компонентах или инфраструктуре. Это предложение ограничивается Grafana Cloud и требует только URL конечной точки Prometheus ClickHouse Cloud и учетных данных.
- **Grafana Alloy** - Grafana Alloy является нейтральным к вендорам распространением OpenTelemetry (OTel) Collector, заменяющим Grafana Agent. Его можно использовать как сборщик, он развертывается в вашей собственной инфраструктуре и совместим с любой конечной точкой Prometheus.

Мы предоставляем инструкции по использованию этих опций ниже, сосредоточив внимание на деталях, специфичных для конечной точки Prometheus ClickHouse Cloud.

### Grafana Cloud с конечной точкой метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в свою учетную запись Grafana Cloud
- Добавьте новое подключение, выбрав **Конечная точка метрик**
- Настройте URL для сбора, чтобы указать конечную точку Prometheus, и используйте базовую аутентификацию для настройки вашего подключения с ключом/секретом API
- Проверьте подключение, чтобы убедиться, что вы можете подключиться

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="Настройка конечной точки метрик Grafana" border/>

<br />

После настройки вы должны увидеть метрики в выпадающем списке, которые вы можете выбрать для настройки панелей мониторинга:

<Image img={prometheus_grafana_dropdown} size="md" alt="Выпадающий список исследователя метрик Grafana" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="График исследователя метрик Grafana" border/>

### Grafana Cloud с Alloy {#grafana-cloud-with-alloy}

Если вы используете Grafana Cloud, Alloy можно установить, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

Это должно настроить Alloy с компонентом `prometheus.remote_write` для отправки данных на конечную точку Grafana Cloud с токеном аутентификации. Пользователям затем нужно только изменить конфигурацию Alloy (которая находится в `/etc/alloy/config.alloy` для Linux), чтобы включить сборщик для конечной точки Prometheus ClickHouse Cloud.

Следующий пример показывает конфигурацию для Alloy с компонентом `prometheus.scrape` для сбора метрик из конечной точки ClickHouse Cloud, а также автоматически настроенный компонент `prometheus.remote_write`. Обратите внимание, что компонент конфигурации `basic_auth` содержит наш ключ ID API Cloud и секрет в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Собирайте метрики с адреса по умолчанию.
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
  // перенаправить на metrics_service ниже
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

Обратите внимание, что параметр конфигурации `honor_labels` необходимо установить в значение `true`, чтобы метка экземпляра была правильно заполнена.

### Grafana с самоуправлением и Alloy {#grafana-self-managed-with-alloy}

Пользователи с самоуправляемым Grafana могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy для отправки метрик Prometheus в желаемое назначение. Компонент `prometheus.scrape` ниже заставляет Alloy собирать метрики из конечной точки ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. Измените ключ `forward_to` на целевое назначение, если оно не существует.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Собирайте метрики с адреса по умолчанию.
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
  // перенаправить на metrics_service. Измените на ваш предпочтительный получатель
}
```

После настройки вы должны увидеть связанные с ClickHouse метрики в вашем исследователе метрик:

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Исследователь метрик Grafana" border/>

<br />

Обратите внимание, что параметр конфигурации `honor_labels` необходимо установить в значение `true`, чтобы метка экземпляра была правильно заполнена.

## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Агент Datadog](https://docs.datadoghq.com/agent/?tab=Linux) и интеграцию [OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) для сбора метрик из конечной точки ClickHouse Cloud. Ниже приведен простой пример конфигурации для этого агента и интеграции. Обратите внимание, что вы можете захотеть выбрать только те метрики, которые вам больше всего интересны. Пример ниже будет экспортировать тысячи комбинаций метрик и экземпляров, которые Datadog будет считать пользовательскими метриками.

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
