---
description: 'Вы можете отслеживать загрузку аппаратных ресурсов, а также метрики сервера ClickHouse.'
keywords: ['мониторинг', 'наблюдаемость', 'расширенная панель мониторинга', 'панель мониторинга', 'панель наблюдаемости']
sidebar_label: 'Мониторинг'
sidebar_position: 45
slug: /operations/monitoring
title: 'Мониторинг'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';


# Мониторинг

:::note
Данные мониторинга, описанные в этом руководстве, доступны в ClickHouse Cloud. Помимо отображения во встроенной панели мониторинга, описанной ниже, как базовые, так и расширенные метрики производительности можно просматривать напрямую в основной консоли сервиса.
:::

Вы можете отслеживать:

- Использование аппаратных ресурсов.
- Метрики сервера ClickHouse.



## Встроенная расширенная панель наблюдаемости {#built-in-advanced-observability-dashboard}

<Image
  img='https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1'
  alt='Screenshot 2023-11-12 at 6 08 58 PM'
  size='md'
/>

ClickHouse включает встроенную расширенную панель наблюдаемости, доступную по адресу `$HOST:$PORT/dashboard` (требуется имя пользователя и пароль), которая отображает следующие метрики:

- Запросов в секунду
- Использование CPU (ядра)
- Выполняющиеся запросы
- Выполняющиеся слияния
- Выбранных байт в секунду
- Ожидание ввода-вывода
- Ожидание CPU
- Использование CPU ОС (пользовательское пространство)
- Использование CPU ОС (ядро)
- Чтение с диска
- Чтение из файловой системы
- Память (отслеживаемая)
- Вставленных строк в секунду
- Всего частей MergeTree
- Максимум частей на партицию


## Использование ресурсов {#resource-utilization}

ClickHouse также самостоятельно отслеживает состояние аппаратных ресурсов, таких как:

- Нагрузка и температура процессоров.
- Использование системы хранения данных, оперативной памяти и сети.

Эти данные собираются в таблице `system.asynchronous_metric_log`.


## Метрики сервера ClickHouse {#clickhouse-server-metrics}

Сервер ClickHouse имеет встроенные инструменты для мониторинга собственного состояния.

Для отслеживания событий сервера используйте журналы сервера. См. раздел [logger](../operations/server-configuration-parameters/settings.md#logger) конфигурационного файла.

ClickHouse собирает:

- Различные метрики использования сервером вычислительных ресурсов.
- Общую статистику обработки запросов.

Метрики можно найти в таблицах [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events) и [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить ClickHouse для экспорта метрик в [Graphite](https://github.com/graphite-project). См. раздел [Graphite](../operations/server-configuration-parameters/settings.md#graphite) в конфигурационном файле сервера ClickHouse. Перед настройкой экспорта метрик необходимо установить Graphite, следуя официальному [руководству](https://graphite.readthedocs.io/en/latest/install.html).

Можно настроить ClickHouse для экспорта метрик в [Prometheus](https://prometheus.io). См. раздел [Prometheus](../operations/server-configuration-parameters/settings.md#prometheus) в конфигурационном файле сервера ClickHouse. Перед настройкой экспорта метрик необходимо установить Prometheus, следуя официальному [руководству](https://prometheus.io/docs/prometheus/latest/installation/).

Кроме того, можно отслеживать доступность сервера через HTTP API. Отправьте запрос `HTTP GET` на `/ping`. Если сервер доступен, он отвечает `200 OK`.

Для мониторинга серверов в кластерной конфигурации необходимо установить параметр [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) и использовать HTTP-ресурс `/replicas_status`. Запрос к `/replicas_status` возвращает `200 OK`, если реплика доступна и не отстаёт от других реплик. Если реплика отстаёт, возвращается `503 HTTP_SERVICE_UNAVAILABLE` с информацией о величине отставания.
