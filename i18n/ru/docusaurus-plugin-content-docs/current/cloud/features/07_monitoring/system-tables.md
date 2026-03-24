---
title: 'Запросы к системным таблицам'
slug: /cloud/monitoring/system-tables
description: 'Мониторинг ClickHouse Cloud с помощью прямых запросов к системным таблицам'
keywords: ['cloud', 'мониторинг', 'системные таблицы', 'query_log', 'clusterAllReplicas', 'панель мониторинга обсервабилити']
sidebar_label: 'Системные таблицы'
sidebar_position: 5
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

# Запросы к системной базе данных ClickHouse \{#querying-clickhouses-system-database\}

Во всех экземплярах ClickHouse есть набор [системных таблиц](/operations/system-tables/overview), находящихся в базе данных `system` и содержащих информацию о:

* состояниях, процессах и окружении сервера;
* внутренних процессах сервера;
* параметрах, использованных при сборке бинарного файла ClickHouse.

Прямые запросы к этим таблицам полезны для мониторинга развертываний ClickHouse, особенно при глубоком анализе и отладке.

## Использование консоли ClickHouse Cloud \{#using-cloud-console\}

В консоли ClickHouse Cloud доступны [SQL‑консоль](/cloud/get-started/sql-console) и [инструменты для создания панелей мониторинга](/cloud/manage/dashboards), которые можно использовать для выполнения запросов к системным таблицам. Например, приведенный ниже запрос показывает, сколько новых частей создается за последние два часа и как часто это происходит:

```sql
SELECT
    count() AS new_parts,
    toStartOfMinute(event_time) AS modification_time_m,
    table,
    sum(rows) AS total_written_rows,
    formatReadableSize(sum(size_in_bytes)) AS total_bytes_on_disk
FROM clusterAllReplicas(default, system.part_log)
WHERE (event_type = 'NewPart') AND (event_time > (now() - toIntervalHour(2)))
GROUP BY
    modification_time_m,
    table
ORDER BY
    modification_time_m ASC,
    table DESC
```

:::tip[Дополнительные примеры запросов]
Дополнительные запросы для мониторинга см. в следующих материалах:

* [Полезные запросы для устранения неполадок](/knowledgebase/useful-queries-for-troubleshooting)
* [Мониторинг и устранение неполадок запросов insert](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
* [Мониторинг и устранение неполадок запросов select](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

Эти запросы также можно использовать, чтобы [создать собственную панель мониторинга](https://clickhouse.com/blog/essential-monitoring-queries-creating-a-dashboard-in-clickHouse-cloud) в Cloud Console.
:::

## Встроенная расширенная панель мониторинга обсервабилити \{#built-in-advanced-observability-dashboard\}

ClickHouse включает встроенную расширенную панель мониторинга обсервабилити, доступную по адресу `$HOST:$PORT/dashboard` (требуются имя пользователя и пароль), которая отображает метрики Cloud Overview из `system.dashboards`.

<Image img={NativeAdvancedDashboard} size="lg" alt="Встроенная расширенная панель мониторинга обсервабилити" border />

:::note
Для этой панели мониторинга требуется прямая аутентификация в экземпляре ClickHouse; она не связана с [расширенной панелью мониторинга Cloud Console](/cloud/monitoring/cloud-console#advanced-dashboard), которая доступна через UI Cloud Console без дополнительной аутентификации.
:::

Дополнительные сведения о доступных визуализациях и их использовании для troubleshooting см. в [документации по расширенной панели мониторинга](/cloud/manage/monitor/advanced-dashboard).

## Выполнение запросов по узлам и версиям \{#querying-across-nodes\}

Чтобы получить подробный обзор всего кластера, пользователи могут использовать функцию `clusterAllReplicas` в сочетании с функцией `merge`. Функция `clusterAllReplicas` позволяет выполнять запросы к системным таблицам на всех репликах в кластере &quot;default&quot;, объединяя данные отдельных узлов в единый результат. В сочетании с функцией `merge` это можно использовать для обращения ко всем системным данным конкретной таблицы в кластере.

Например, чтобы найти 5 самых длительных запросов среди всех реплик за последний час:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

Этот подход особенно полезен для мониторинга и отладки операций в масштабе всего кластера, поскольку позволяет пользователям эффективно анализировать состояние и производительность своего развертывания в ClickHouse Cloud.

Подробнее см. в разделе [выполнение запросов по всем узлам](/operations/system-tables/overview#querying-across-nodes).

## Особенности системы \{#system-considerations\}

:::warning
Прямые запросы к системным таблицам создают дополнительную нагрузку на ваш сервис в промышленной эксплуатации, не позволяют экземплярам ClickHouse Cloud переходить в режим простоя (что может повлиять на затраты) и привязывают доступность мониторинга к состоянию промышленной системы. Если промышленная система выйдет из строя, мониторинг также может быть затронут.
:::

Для мониторинга в промышленной эксплуатации в реальном времени с операционным разделением рассмотрите [совместимую с Prometheus конечную точку метрик](/integrations/prometheus) или [панели мониторинга в Cloud Console](/cloud/monitoring/cloud-console): оба варианта используют заранее собранные метрики и не выполняют запросы к базовому сервису.

## Связанные страницы \{#related\}

* [Справочник по системным таблицам](/operations/system-tables/overview) — Полный справочник по всем доступным системным таблицам
* [Мониторинг в Cloud Console](/cloud/monitoring/cloud-console) — Панели мониторинга, не требующие настройки и не влияющие на производительность сервиса
* [Конечная точка Prometheus](/integrations/prometheus) — Экспортируйте метрики во внешние инструменты мониторинга
* [Расширенная панель мониторинга](/cloud/manage/monitor/advanced-dashboard) — Подробный справочник по визуализациям на панели мониторинга