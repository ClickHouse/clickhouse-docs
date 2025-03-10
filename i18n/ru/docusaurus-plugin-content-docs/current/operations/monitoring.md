---
slug: /operations/monitoring
sidebar_position: 45
sidebar_label: Мониторинг
description: Вы можете контролировать использование аппаратных ресурсов, а также метрики сервера ClickHouse.
keywords: ['мониторинг', 'наблюдаемость', 'расширенная панель', 'панель', 'панель наблюдаемости']
---


# Мониторинг

:::note
Данные мониторинга, изложенные в этом руководстве, доступны в ClickHouse Cloud. В дополнение к отображению через встроенную панель, описанную ниже, как базовые, так и расширенные метрики производительности также можно просмотреть прямо в основной консоли сервиса.
:::

Вы можете контролировать:

- Использование аппаратных ресурсов.
- Метрики сервера ClickHouse.

## Встроенная расширенная панель наблюдаемости {#built-in-advanced-observability-dashboard}

<img width="400" alt="Screenshot 2023-11-12 at 6 08 58 PM" src="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" />

ClickHouse поставляется с функцией встроенной расширенной панели наблюдаемости, доступной по адресу `$HOST:$PORT/dashboard` (требуется пользователь и пароль), которая показывает следующие метрики:
- Запросы/секунду
- Использование ЦПУ (ядра)
- Запросы в работе
- Слияния в работе
- Выбранные байты/секунду
- Ожидание ввода-вывода
- Ожидание ЦПУ
- Использование ЦПУ ОС (пользовательское пространство)
- Использование ЦПУ ОС (ядро)
- Чтение с диска
- Чтение из файловой системы
- Память (отслеживаемая)
- Вставленные строки/секунду
- Всего частей MergeTree
- Максимум частей для партиции

## Использование ресурсов {#resource-utilization}

ClickHouse также самостоятельно контролирует состояние аппаратных ресурсов, таких как:

- Нагрузка и температура на процессорах.
- Использование системы хранения, ОЗУ и сети.

Эти данные собираются в таблице `system.asynchronous_metric_log`.

## Метрики сервера ClickHouse {#clickhouse-server-metrics}

Сервер ClickHouse имеет встроенные инструменты для мониторинга собственного состояния.

Для отслеживания событий сервера используйте серверные логи. См. раздел [logger](../operations/server-configuration-parameters/settings.md#logger) конфигурационного файла.

ClickHouse собирает:

- Разные метрики того, как сервер использует вычислительные ресурсы.
- Общую статистику по обработке запросов.

Вы можете найти метрики в таблицах [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events) и [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить ClickHouse для экспорта метрик в [Graphite](https://github.com/graphite-project). См. раздел [Graphite](../operations/server-configuration-parameters/settings.md#graphite) в конфигурационном файле сервера ClickHouse. Перед настройкой экспорта метрик вам следует настроить Graphite, следуя их официальному [руководству](https://graphite.readthedocs.io/en/latest/install.html).

Вы можете настроить ClickHouse для экспорта метрик в [Prometheus](https://prometheus.io). См. раздел [Prometheus](../operations/server-configuration-parameters/settings.md#prometheus) в конфигурационном файле сервера ClickHouse. Перед настройкой экспорта метрик вам следует настроить Prometheus, следуя их официальному [руководству](https://prometheus.io/docs/prometheus/latest/installation/).

Кроме того, вы можете контролировать доступность сервера через HTTP API. Отправьте запрос `HTTP GET` на `/ping`. Если сервер доступен, он ответит `200 OK`.

Для мониторинга серверов в конфигурации кластера нужно установить параметр [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) и использовать HTTP ресурс `/replicas_status`. Запрос к `/replicas_status` возвращает `200 OK`, если реплика доступна и не отстает от других реплик. Если реплика отстает, то возвращается `503 HTTP_SERVICE_UNAVAILABLE` с информацией о разрыве.
