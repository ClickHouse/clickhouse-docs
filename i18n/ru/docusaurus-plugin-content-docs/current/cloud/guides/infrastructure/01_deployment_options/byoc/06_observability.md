---
title: 'Обсервабилити BYOC'
slug: /cloud/reference/byoc/observability
sidebar_label: 'Обсервабилити'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'observability', 'monitoring', 'Prometheus', 'Grafana']
description: 'Мониторьте и обеспечивайте обсервабилити вашего развертывания BYOC ClickHouse с помощью встроенных дашбордов и метрик Prometheus'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_mixin_1 from '@site/static/images/cloud/reference/byoc-mixin-1.png';
import byoc_mixin_2 from '@site/static/images/cloud/reference/byoc-mixin-2.png';
import byoc_mixin_3 from '@site/static/images/cloud/reference/byoc-mixin-3.png';
import byoc_mixin_4 from '@site/static/images/cloud/reference/byoc-mixin-4.png';
import byoc_mixin_5 from '@site/static/images/cloud/reference/byoc-mixin-5.png';

Развертывания BYOC включают в себя полноценные возможности обсервабилити, позволяя отслеживать сервисы ClickHouse с помощью выделенного стека мониторинга Prometheus, а также напрямую через метрические endpoints ClickHouse Servers. Все данные обсервабилити остаются в вашей облачной учетной записи, что дает вам полный контроль над инфраструктурой мониторинга.


## Подходы к мониторингу с использованием Prometheus \{#prometheus-monitoring\}

BYOC предлагает два основных способа сбора и визуализации метрик с помощью Prometheus:

1. **Подключиться к встроенному стеку Prometheus**: получить доступ к централизованному, предварительно установленному экземпляру Prometheus, запущенному внутри вашего Kubernetes-кластера BYOC.
2. **Собирать метрики ClickHouse напрямую**: направить ваше собственное Развертывание Prometheus на endpoint `/metrics_all`, который открывает каждый сервис ClickHouse.

### Сравнение методов мониторинга \{#monitoring-approaches-comparison\}

| Возможность             | Встроенный стек Prometheus                                        | Прямой сбор метрик с сервисов ClickHouse                   |
|-------------------------|-------------------------------------------------------------------|------------------------------------------------------------|
| **Область метрик**      | Консолидирует метрики из ClickHouse, Kubernetes и вспомогательных сервисов (полная видимость кластера) | Метрики только от отдельных серверов ClickHouse            |
| **Процесс настройки**   | Требуется настроить приватный сетевой доступ (например, через приватный балансировщик нагрузки) | Достаточно настроить Prometheus на сбор метрик с публичного или приватного endpoint-а ClickHouse |
| **Как вы подключаетесь** | Через приватный балансировщик нагрузки внутри вашей VPC/сети   | Тот же endpoint, который вы используете для доступа к базе данных |
| **Аутентификация**      | Не требуется (ограничение доступом по приватной сети)            | Использует учетные данные сервиса ClickHouse               |
| **Сетевые требования**  | Приватный балансировщик нагрузки и соответствующая сетевая связность | Доступен из любой сети, имеющей доступ к вашему endpoint-у ClickHouse |
| **Наиболее подходит для** | Комплексного мониторинга инфраструктуры и сервисов           | Мониторинга и интеграции на уровне отдельных сервисов      |
| **Как интегрировать**   | Настройте федерацию во внешнем Prometheus для приёма метрик кластера | Добавьте endpoint-ы метрик ClickHouse напрямую в конфигурацию Prometheus |

**Рекомендуемый подход**: В большинстве случаев рекомендуется интегрироваться со встроенным стеком Prometheus, так как он предоставляет комплексные метрики по всем компонентам вашего BYOC-развертывания (сервисы ClickHouse, кластер Kubernetes и вспомогательные сервисы), а не только по серверам ClickHouse. 

## Встроенный стек Prometheus для BYOC \{#builtin-prometheus-stack\}

ClickHouse BYOC разворачивает полный стек мониторинга Prometheus внутри вашего кластера Kubernetes, включая Prometheus, Grafana, Alertmanager и, при необходимости, Thanos для долгосрочного хранения метрик. Этот стек собирает метрики от:

- серверов ClickHouse и ClickHouse Keeper
- кластера Kubernetes и системных компонентов
- основных инфраструктурных узлов

### Доступ к стеку Prometheus \{#accessing-prometheus-stack\}

Чтобы подключиться к встроенному стеку Prometheus:

1. **Свяжитесь со службой поддержки ClickHouse**, чтобы включить частный балансировщик нагрузки для вашей среды BYOC.
2. **Запросите URL конечной точки Prometheus (endpoint)** у службы поддержки ClickHouse.
3. **Проверьте подключение к конечной точке Prometheus по частной сети** — как правило, через пиринг VPC или другую конфигурацию частной сети.

Конечная точка Prometheus будет иметь следующий формат:

```bash
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com
```

:::note
URL стека Prometheus доступен только по частным сетевым подключениям и не требует аутентификации. Доступ ограничен сетями, которые имеют подключение к вашему BYOC VPC через пиринг VPC или другие варианты частного сетевого соединения.
:::


### Интеграция с вашими инструментами мониторинга \{#prometheus-stack-integration\}

Вы можете использовать стек BYOC Prometheus в вашей экосистеме мониторинга несколькими способами:

**Вариант 1: Запросы к Prometheus API**

* Обращайтесь к endpoint&#39;у Prometheus API напрямую из используемой платформы мониторинга или пользовательских дашбордов.
* Используйте запросы PromQL для извлечения, агрегирования и визуализации нужных метрик.
* Подходит для создания индивидуальных дашбордов или конвейеров оповещений.

Endpoint запросов Prometheus:

```text
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com/query
```

**Вариант 2: Федерация метрик в собственный Prometheus**

* Настройте внешний экземпляр Prometheus для федерации (pull) метрик из стека ClickHouse BYOC Prometheus.
* Это позволит объединить и централизовать сбор метрик из нескольких окружений или кластеров.
* Пример конфигурации федерации Prometheus:

```yaml
scrape_configs:
  - job_name: 'federate-clickhouse-byoc'
    scrape_interval: 15s
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job="clickhouse"}'
        - '{job="kubernetes"}'
    static_configs:
      - targets:
        - 'prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com'
```


## Интеграция сервиса ClickHouse с Prometheus \{#direct-prometheus-integration\}

Сервисы ClickHouse предоставляют совместимую с Prometheus конечную точку метрик, которую вы можете опрашивать напрямую, используя собственный экземпляр Prometheus. Этот подход предоставляет метрики, специфичные для ClickHouse, но не включает метрики Kubernetes или вспомогательных сервисов.

### Доступ к конечной точке метрик \{#metrics-endpoint\}

Конечная точка метрик доступна по пути `/metrics_all` у сервиса ClickHouse:

```bash
curl --user <username>:<password> https://<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443/metrics_all
```

**Пример ответа:**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```


### Аутентификация \{#authentication\}

Для доступа к endpoint&#39;у метрик требуется аутентификация с использованием учетных данных ClickHouse. Рекомендуется использовать пользователя `default` или создать отдельного пользователя с минимально необходимыми правами специально для снятия метрик.

**Необходимые привилегии:**

* привилегия `REMOTE` для подключения к сервису
* привилегия `SELECT` для соответствующих системных таблиц

**Пример настройки пользователя:**

```sql
CREATE USER scrapping_user IDENTIFIED BY 'secure_password';
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```


### Настройка Prometheus \{#configuring-prometheus\}

Настройте Prometheus для опроса эндпоинта метрик ClickHouse:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443"]
    scheme: https
    metrics_path: "/metrics_all"
    basic_auth:
      username: <username>
      password: <password>
    honor_labels: true
```

Замените:

* `<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443` на конечную точку вашего сервиса
* `<username>` и `<password>` на учётные данные пользователя, выполняющего сбор (scraping)


## ClickHouse Mixin \{#clickhouse-mixin\}

Для команд, которым нужен готовый комплект дашбордов, ClickHouse предоставляет Prometheus **ClickHouse Mixin**. Это предварительно настроенный дашборд Grafana, разработанный специально для мониторинга кластеров ClickHouse.

### Настройка Grafana и импорт ClickHouse Mix-in \{#setup-grafana-mixin\}

После того как экземпляр Prometheus интегрирован с вашим стеком мониторинга ClickHouse, вы можете визуализировать метрики в Grafana, выполнив следующие шаги:

1. **Добавьте Prometheus как источник данных в Grafana**  
   Перейдите в раздел "Data sources" в боковой панели Grafana, нажмите "Add data source" и выберите "Prometheus". Укажите URL вашего экземпляра Prometheus и необходимые учетные данные для подключения.

<Image img={byoc_mixin_1} size="lg" alt="BYOC Mixin 1" background='black'/>

<Image img={byoc_mixin_2} size="lg" alt="BYOC Mixin 2" background='black'/>

<Image img={byoc_mixin_3} size="lg" alt="BYOC Mixin 3" background='black'/>

2. **Импортируйте дашборд ClickHouse**  
   В Grafana перейдите в раздел дашбордов и выберите "Import". Вы можете либо загрузить JSON-файл дашборда, либо вставить его содержимое напрямую. Получите JSON-файл из репозитория ClickHouse Mix-in:  
   [ClickHouse Mix-in Dashboard JSON](https://github.com/ClickHouse/clickhouse-mixin/blob/main/dashboard_byoc.json)

<Image img={byoc_mixin_4} size="lg" alt="BYOC Mixin 4" background='black'/>

3. **Изучайте метрики**  
   После импорта дашборда и его привязки к вашему источнику данных Prometheus вы сможете видеть метрики в реальном времени от ваших сервисов ClickHouse Cloud.

<Image img={byoc_mixin_5} size="lg" alt="BYOC Mixin 5" background='black'/>