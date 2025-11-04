---
slug: '/operations/monitoring'
sidebar_label: Мониторинг
sidebar_position: 45
description: 'Вы можете отслеживать использование аппаратных ресурсов, а также метрики'
title: Мониторинг
keywords: ['мониторинг', 'мониторинг', 'расширенная панель мониторинга', 'панель мониторинга', 'панель мониторинга наблюдаемости']
doc_type: reference
---
import Image from '@theme/IdealImage';


# Мониторинг

:::note
Данные мониторинга, изложенные в этом руководстве, доступны в ClickHouse Cloud. Помимо отображения через встроенную панель мониторинга, описанную ниже, основные и продвинутые метрики производительности также можно просмотреть непосредственно в главной консоли сервиса.
:::

Вы можете мониторить:

- Использование аппаратных ресурсов.
- Метрики сервера ClickHouse.

## Встроенная панель продвинутого мониторинга {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Скриншот 2023-11-12 в 18:08:58" size="md" />

ClickHouse поставляется с встроенной функцией продвинутого мониторинга, доступной по адресу `$HOST:$PORT/dashboard` (требуется имя пользователя и пароль), которая отображает следующие метрики:
- Запросы/секунда
- Использование CPU (ядра)
- Запущенные запросы
- Запущенные слияния
- Выбранные байты/секунда
- Ожидание ввода-вывода
- Ожидание CPU
- Использование CPU ОС (пользовательское пространство)
- Использование CPU ОС (ядро)
- Чтение с диска
- Чтение из файловой системы
- Память (отслеживаемая)
- Вставленные строки/секунда
- Всего частей MergeTree
- Максимальные части для партиции

## Использование ресурсов {#resource-utilization}

ClickHouse также самостоятельно мониторит состояние аппаратных ресурсов, таких как:

- Нагрузка и температура на процессорах.
- Использование системы хранения, оперативной памяти и сети.

Эти данные собираются в таблице `system.asynchronous_metric_log`.

## Метрики сервера ClickHouse {#clickhouse-server-metrics}

Сервер ClickHouse имеет встроенные инструменты для мониторинга своего состояния.

Чтобы отслеживать события сервера, используйте серверные логи. См. раздел [logger](../operations/server-configuration-parameters/settings.md#logger) в файле конфигурации.

ClickHouse собирает:

- Разные метрики того, как сервер использует вычислительные ресурсы.
- Общую статистику по обработке запросов.

Вы можете найти метрики в таблицах [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events) и [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить ClickHouse для экспорта метрик в [Graphite](https://github.com/graphite-project). См. раздел [Graphite](../operations/server-configuration-parameters/settings.md#graphite) в файле конфигурации сервера ClickHouse. Перед настройкой экспорта метрик вам следует настроить Graphite, следуя их официальному [руководству](https://graphite.readthedocs.io/en/latest/install.html).

Вы можете настроить ClickHouse для экспорта метрик в [Prometheus](https://prometheus.io). См. раздел [Prometheus](../operations/server-configuration-parameters/settings.md#prometheus) в файле конфигурации сервера ClickHouse. Перед настройкой экспорта метрик вам следует настроить Prometheus, следуя их официальному [руководству](https://prometheus.io/docs/prometheus/latest/installation/).

Дополнительно вы можете мониторить доступность сервера через HTTP API. Отправьте `HTTP GET` запрос на `/ping`. Если сервер доступен, он ответит `200 OK`.

Чтобы мониторить серверы в конфигурации кластера, вам следует установить параметр [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) и использовать HTTP ресурс `/replicas_status`. Запрос к `/replicas_status` вернет `200 OK`, если реплика доступна и не отстает от других реплик. Если реплика задерживается, будет возвращен `503 HTTP_SERVICE_UNAVAILABLE` с информацией о задержке.