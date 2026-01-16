---
description: 'Вы можете отслеживать использование аппаратных ресурсов и метрики сервера ClickHouse.'
keywords: ['мониторинг', 'наблюдаемость', 'расширенный дашборд', 'дашборд', 'дашборд наблюдаемости']
sidebar_label: 'Мониторинг'
sidebar_position: 45
slug: /operations/monitoring
title: 'Мониторинг'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';

# Мониторинг \\{#monitoring\\}

:::note
Данные мониторинга, описанные в данном руководстве, доступны в ClickHouse Cloud. Помимо отображения во встроенной панели, описанной ниже, как базовые, так и расширенные метрики производительности можно просматривать непосредственно в основной консоли сервиса.
:::

Вы можете отслеживать:

- Использование аппаратных ресурсов.
- Метрики сервера ClickHouse.

## Встроенная расширенная панель наблюдаемости \\{#built-in-advanced-observability-dashboard\\}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Screenshot 2023-11-12 at 6 08 58 PM" size="md" />

ClickHouse включает встроенную расширенную панель наблюдаемости, доступную по адресу `$HOST:$PORT/dashboard` (требуются имя пользователя и пароль). На ней отображаются следующие метрики:
- Число запросов в секунду
- Использование CPU (ядра)
- Количество выполняющихся запросов
- Количество выполняющихся слияний
- Выборка байт в секунду
- Ожидание I/O
- Ожидание CPU
- Использование CPU ОС (userspace)
- Использование CPU ОС (kernel)
- Объём чтения с диска
- Объём чтения из файловой системы
- Память (отслеживаемая)
- Число вставленных строк в секунду
- Общее количество частей MergeTree
- Максимальное количество частей на раздел

## Использование ресурсов \\{#resource-utilization\\}

ClickHouse также самостоятельно отслеживает состояние аппаратных ресурсов, таких как:

- Нагрузка и температура процессоров.
- Использование системы хранения, оперативной памяти и сети.

Эти данные собираются в таблице `system.asynchronous_metric_log`.

## Метрики сервера ClickHouse \\{#clickhouse-server-metrics\\}

Сервер ClickHouse имеет встроенные средства для мониторинга собственного состояния.

Для отслеживания событий сервера используйте журналы сервера. См. раздел [logger](../operations/server-configuration-parameters/settings.md#logger) в файле конфигурации.

ClickHouse собирает:

- Различные метрики использования сервером вычислительных ресурсов.
- Общую статистику по обработке запросов.

Вы можете найти метрики в таблицах [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events) и [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить ClickHouse на экспорт метрик в [Graphite](https://github.com/graphite-project). См. раздел [Graphite](../operations/server-configuration-parameters/settings.md#graphite) в файле конфигурации сервера ClickHouse. Перед настройкой экспорта метрик необходимо развернуть Graphite, следуя их официальному [руководству](https://graphite.readthedocs.io/en/latest/install.html).

Вы можете настроить ClickHouse на экспорт метрик в [Prometheus](https://prometheus.io). См. раздел [Prometheus](../operations/server-configuration-parameters/settings.md#prometheus) в файле конфигурации сервера ClickHouse. Перед настройкой экспорта метрик необходимо развернуть Prometheus, следуя их официальному [руководству](https://prometheus.io/docs/prometheus/latest/installation/).

Кроме того, вы можете мониторить доступность сервера через HTTP API. Отправьте запрос `HTTP GET` к `/ping`. Если сервер доступен, он отвечает `200 OK`.

Для мониторинга серверов в конфигурации кластера необходимо задать параметр [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) и использовать HTTP-ресурс `/replicas_status`. Запрос к `/replicas_status` возвращает `200 OK`, если реплика доступна и не отстаёт от других реплик. Если реплика отстаёт, возвращается `503 HTTP_SERVICE_UNAVAILABLE` с информацией о величине отставания.
