---
slug: /integrations/prometheus
sidebar_label: Prometheus
title: Prometheus
description: Экспорт метрик ClickHouse в Prometheus
keywords: [prometheus, grafana, мониторинг, метрики, экспортёр]
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';



# Интеграция с Prometheus

Функция поддерживает интеграцию с [Prometheus](https://prometheus.io/) для мониторинга служб ClickHouse Cloud. Доступ к метрикам Prometheus предоставляется через конечную точку [ClickHouse Cloud API](/cloud/manage/api/api-overview), которая позволяет пользователям безопасно подключаться и экспортировать метрики в свой сборщик метрик Prometheus. Эти метрики могут быть интегрированы с панелями мониторинга, такими как Grafana, Datadog для визуализации.

Чтобы начать, [создайте API-ключ](/cloud/manage/openapi).

## API конечной точки Prometheus для получения метрик ClickHouse Cloud {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### Справочник API {#api-reference}

| Метод | Путь                                                                                                               | Описание                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для конкретной службы |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | Возвращает метрики для всех служб в организации |

**Параметры запроса**

| Название             | Расположение               | Тип               |
| --------------------- | ------------------ |------------------ |
| Organization ID  | Адрес конечной точки | uuid               |
| Service ID       | Адрес конечной точки | uuid (необязательно)               |
| filtered_metrics | Параметр запроса | boolean (необязательно) |


### Аутентификация {#authentication}

Используйте свой API-ключ ClickHouse Cloud для базовой аутентификации:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Пример запроса
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# Для всех служб в $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# Только для одной службы
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### Пример ответа {#sample-response}

```response

# HELP ClickHouse_ServiceInfo Информация о службе, включая статус кластера и версию ClickHouse

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",clickhouse_cluster_status="работает",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query Число запросов, подлежащих интерпретации и потенциальному выполнению. Не включает запросы, которые не удалось разобрать или были отклонены из-за ограничений размера AST, квоты или количества одновременно выполняемых запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries Количество запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Количество SELECT-запросов со всеми подзапросами

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen Число открытых файлов.

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek Количество вызовов функции 'lseek'.

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="тестовая служба",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### Метки метрик {#metric-labels}

Все метрики имеют следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_org|ID организации|
|clickhouse_service|ID службы|
|clickhouse_service_name|Имя службы|

### Метрики информации {#information-metrics}

ClickHouse Cloud предоставляет специальную метрику `ClickHouse_ServiceInfo`, которая является `gauge` и всегда имеет значение `1`. Эта метрика содержит все **Метки метрик** а также следующие метки:

|Метка|Описание|
|---|---|
|clickhouse_cluster_status|Статус службы. Может быть одним из следующих: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Версия сервера ClickHouse, на которой работает служба|
|scrape|Указывает статус последнего сбора. Может быть либо `full`, либо `partial`|
|full|Указывает, что во время последнего сбора метрик не было ошибок|
|partial|Указывает, что во время последнего сбора метрик были некоторые ошибки, и была возвращена только метрика `ClickHouse_ServiceInfo`.|

Запросы на получение метрик не возобновят неактивную службу. Если служба находится в состоянии `idle`, будет возвращена только метрика `ClickHouse_ServiceInfo`.

### Настройка Prometheus {#configuring-prometheus}

Сервер Prometheus собирает метрики с заданных целей через определенные интервалы. Ниже приведен пример конфигурации для сервера Prometheus с использованием конечной точки Prometheus ClickHouse Cloud:

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

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка экземпляра была правильно заполнена. Кроме того, `filtered_metrics` установлено в `true` в приведенном выше примере, но должно быть настроено в зависимости от предпочтений пользователя.

## Интеграция с Grafana {#integrating-with-grafana}

У пользователей есть два основных способа интеграции с Grafana:

- **Конечная точка метрик** – Этот подход имеет преимущество в том, что не требует дополнительных компонентов или инфраструктуры. Это предложение ограничено Grafana Cloud и требует только URL конечной точки Prometheus ClickHouse Cloud и учетных данных.
- **Grafana Alloy** - Grafana Alloy является независимым от поставщиков дистрибутивом OpenTelemetry (OTel) Collector, заменяющим агент Grafana. Это может использоваться в качестве сборщика, разворачивается в вашей собственной инфраструктуре и совместимо с любой конечной точкой Prometheus.

Мы предоставляем инструкции по использованию этих вариантов ниже, сосредотачиваясь на деталях, специфичных для конечной точки Prometheus ClickHouse Cloud.

### Grafana Cloud с конечной точкой метрик {#grafana-cloud-with-metrics-endpoint}

- Войдите в свой аккаунт Grafana Cloud
- Добавьте новое подключение, выбрав **Конечную точку метрик**
- Настройте URL сбора, чтобы указать на конечную точку Prometheus и используйте базовую аутентификацию для настройки подключения с API-ключом/секретом
- Протестируйте подключение, чтобы убедиться, что вы можете подключиться

<img src={prometheus_grafana_metrics_endpoint}
  class='image'
  alt='Настройка конечной точки метрик Grafana'
  style={{width: '600px'}} />

<br />

После настройки вы должны увидеть метрики в выпадающем меню, которые вы можете выбрать для настройки панелей мониторинга:

<img src={prometheus_grafana_dropdown}
  class='image'
  alt='Выпадающее меню для исследователя метрик Grafana'
  style={{width: '400px'}} />

<br />

<img src={prometheus_grafana_chart}
  class='image'
  alt='График исследователя метрик Grafana'
  style={{width: '800px'}} />

### Grafana Cloud с Alloy {#grafana-cloud-with-alloy}

Если вы используете Grafana Cloud, Alloy можно установить, перейдя в меню Alloy в Grafana и следуя инструкциям на экране:

<img src={prometheus_grafana_alloy}
  class='image'
  alt='Grafana Alloy'
  style={{width: '600px'}} />

<br />

Это должно настроить Alloy с компонентом `prometheus.remote_write` для отправки данных в конечную точку Grafana Cloud с токеном аутентификации. Пользователям затем нужно только изменить конфигурацию Alloy (которая находится в `/etc/alloy/config.alloy` для Linux), чтобы включить скрепер для конечной точки Prometheus ClickHouse Cloud.

Ниже приведен пример конфигурации для Alloy с компонентом `prometheus.scrape` для сбора метрик из конечной точки ClickHouse Cloud, а также автоматически сконфигурированным компонентом `prometheus.remote_write`. Обратите внимание, что компонент конфигурации `basic_auth` содержит наш ID ключа API Cloud и секрет в качестве имени пользователя и пароля соответственно.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Собирать метрики с адреса по умолчанию.
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
  // перенаправить в metrics_service ниже
}

prometheus.remote_write "metrics_service" {
  endpoint {
	url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
	basic_auth {
  	  username = "<Имя пользователя API Grafana>"
  	  password = "<Токен API grafana>"
    }
  }
}
```

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка экземпляра была правильно заполнена.

### Grafana self-managed с Alloy {#grafana-self-managed-with-alloy}

Пользователи, управляющие Grafana самостоятельно, могут найти инструкции по установке агента Alloy [здесь](https://grafana.com/docs/alloy/latest/get-started/install/). Мы предполагаем, что пользователи настроили Alloy для отправки метрик Prometheus в желаемое место назначения. Компонент `prometheus.scrape` ниже заставляет Alloy собирать метрики с конечной точки ClickHouse Cloud. Мы предполагаем, что `prometheus.remote_write` получает собранные метрики. Измените ключ `forward_to` на целевое место назначения, если это не произойдет.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Собирать метрики с адреса по умолчанию.
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
  // перенаправить в metrics_service. Измените на ваш предпочтительный получатель
}
```

После настройки вы должны увидеть метрики, связанные с ClickHouse, в своем исследователе метрик:

<img src={prometheus_grafana_metrics_explorer}
  class='image'
  alt='Исследователь метрик Grafana'
  style={{width: '800px'}} />

<br />

Обратите внимание, что параметр конфигурации `honor_labels` должен быть установлен в значение `true`, чтобы метка экземпляра была правильно заполнена.

## Интеграция с Datadog {#integrating-with-datadog}

Вы можете использовать [Agent](https://docs.datadoghq.com/agent/?tab=Linux) и [интеграцию OpenMetrics](https://docs.datadoghq.com/integrations/openmetrics/) Datadog для сбора метрик с конечной точки ClickHouse Cloud. Ниже приведен простой пример конфигурации для этого агента и интеграции. Обратите внимание, что вы можете выбрать только те метрики, которые вам наиболее важны. Пример, приведенный ниже, экспортирует множество тысяч комбинаций метрик и экземпляров, которые Datadog будет считать пользовательскими метриками.

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

<img src={prometheus_datadog}
  class='image'
  alt='Интеграция Prometheus с Datadog'
  style={{width: '600px'}} />

