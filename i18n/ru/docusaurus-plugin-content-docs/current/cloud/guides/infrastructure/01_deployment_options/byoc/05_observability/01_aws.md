---
title: 'Наблюдаемость BYOC на AWS'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: 'Разверните ClickHouse в вашей собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


## Наблюдаемость

### Встроенные инструменты мониторинга

ClickHouse BYOC предоставляет несколько подходов для различных сценариев использования.

#### Панель наблюдаемости

ClickHouse Cloud включает расширенную панель наблюдаемости, которая отображает метрики, такие как использование памяти, частота запросов и операции ввода-вывода (I/O). Доступ к ней можно получить в разделе **Monitoring** веб-консоли ClickHouse Cloud.

<br />

<Image img={byoc3} size="lg" alt="Панель наблюдаемости" border />

<br />

#### Расширенная панель

Вы можете настроить панель, используя метрики из системных таблиц, таких как `system.metrics`, `system.events`, `system.asynchronous_metrics` и других, чтобы детально отслеживать производительность сервера и использование ресурсов.

<br />

<Image img={byoc4} size="lg" alt="Расширенная панель" border />

<br />

#### Доступ к стеку BYOC Prometheus

ClickHouse BYOC разворачивает стек Prometheus в вашем кластере Kubernetes. Вы можете получить к нему доступ, собирать оттуда метрики и интегрировать их со своим собственным стеком мониторинга.

Свяжитесь со службой поддержки ClickHouse, чтобы включить Private Load Balancer и запросить URL. Обратите внимание, что этот URL доступен только через частную сеть и не поддерживает аутентификацию.

**Пример URL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Интеграция с Prometheus

<DeprecatedBadge />

Вместо этого используйте интеграцию со стеком Prometheus из раздела выше. Помимо метрик ClickHouse Server, она предоставляет дополнительные метрики, включая метрики K8s и метрики от других сервисов.

ClickHouse Cloud предоставляет Prometheus-эндпоинт, который вы можете использовать для сбора метрик для мониторинга. Это позволяет интегрироваться с такими инструментами, как Grafana и Datadog, для визуализации.

**Пример запроса к HTTPS-эндпоинту /metrics&#95;all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Пример ответа**


```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes Объем данных в байтах, хранящихся на диске `s3disk` в системной базе данных
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts Количество поврежденных отсоединенных частей
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount Возраст самой старой мутации (в секундах)
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings Количество предупреждений, выданных сервером. Обычно указывает на возможные ошибки конфигурации
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors Общее количество ошибок на сервере с момента последнего перезапуска
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Аутентификация**

Для аутентификации можно использовать пару учетных данных ClickHouse (имя пользователя и пароль). Рекомендуется создать отдельного пользователя с минимальными правами для сбора метрик. Минимальное требование — право `READ` на таблицу `system.custom_metrics` на всех репликах. Например:

```sql
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

**Настройка Prometheus**

Пример конфигурации приведён ниже. Endpoint `targets` — тот же, что используется для доступа к сервису ClickHouse.

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

Также см. [эту запись в блоге](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) и [документацию по настройке Prometheus для ClickHouse](/integrations/prometheus).
