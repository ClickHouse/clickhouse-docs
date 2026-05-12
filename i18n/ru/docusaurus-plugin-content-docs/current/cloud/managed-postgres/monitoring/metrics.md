---
slug: /cloud/managed-postgres/monitoring/metrics
sidebar_label: 'Справочник по метрикам'
title: 'Справочник по метрикам Managed Postgres'
description: 'Полный список метрик, доступных через конечную точку Prometheus для Managed Postgres'
keywords: ['managed postgres', 'метрики', 'prometheus', 'справочник', 'обсервабилити']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Справочник по метрикам \{#metrics-reference\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-metrics" />

На этой странице перечислены все метрики, доступные через
[конечную точку Prometheus для Managed Postgres](/cloud/managed-postgres/monitoring/prometheus).
Сведения о настройке и аутентификации см. на странице [конечная точка Prometheus].

## Общие метки \{#common-labels\}

Каждая метрика имеет следующие метки:

| Метка                   | Описание             |
| ----------------------- | -------------------- |
| `clickhouse_org`        | ID организации       |
| `postgres_service`      | ID сервиса Postgres  |
| `postgres_service_name` | Имя сервиса Postgres |

Некоторые метрики также добавляют метку измерения, по которому они разбиваются (например,
`mode` в метриках CPU, `state` в метриках соединений, `database` в метриках размера
базы данных). Эти метки перечислены рядом с каждой метрикой.

## Информационная метрика \{#information-metric\}

`PostgresServiceInfo` — это метрика типа gauge, которая всегда равна `1` и содержит
в метках текущий статус и версию сервиса. Используйте её, чтобы добавить
статус к другим метрикам через соединение или настроить оповещение, если сервис
выходит из состояния `running`.

| Метрика               | Тип   | Дополнительные метки                  | Описание                                           |
| --------------------- | ----- | ------------------------------------- | -------------------------------------------------- |
| `PostgresServiceInfo` | gauge | `postgres_status`, `postgres_version` | Один временной ряд на сервис; значение всегда `1`. |

`postgres_status` показывает текущее состояние жизненного цикла сервиса
(например, `running`, `creating`, `stopped`). `postgres_version`
показывает основную версию Postgres (например, `17`, `18`).

## Выделенная мощность \{#capacity\}

Статические лимиты, выделенные для сервиса. Они меняются только при
изменении размера сервиса.

| Метрика                            | Тип   | Единица | Описание                             |
| ---------------------------------- | ----- | ------- | ------------------------------------ |
| `PostgresServer_CPUCores`          | gauge | cores   | Выделенные сервису ядра CPU.         |
| `PostgresServer_MemoryLimitBytes`  | gauge | bytes   | Память, выделенная сервису.          |
| `PostgresServer_StorageLimitBytes` | gauge | bytes   | Объём хранилища, выделенный сервису. |

## Использование ресурсов \{#resource-utilization\}

| Метрика                                | Тип     | Дополнительные метки | Описание                                                                                                             |
| -------------------------------------- | ------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PostgresServer_CPUSeconds_Total`      | counter | `mode`               | Затраченное CPU-время с разбивкой по режимам: `user`, `system`, `iowait`, `softirq`, `steal`, `irq`, `nice`, `idle`. |
| `PostgresServer_MemoryUsedPercent`     | gauge   |                      | Используемая память в процентах от `PostgresServer_MemoryLimitBytes`.                                                |
| `PostgresServer_MemoryCachePercent`    | gauge   |                      | Память, используемая кэшем и буферами, в процентах от общего объёма памяти.                                          |
| `PostgresServer_FilesystemUsedPercent` | gauge   |                      | Используемое пространство файловой системы в процентах от общего объёма хранилища.                                   |

Чтобы вычислить загрузку CPU в процентах, возьмите скорость изменения
`PostgresServer_CPUSeconds_Total` по интересующим вас режимам и
разделите на `PostgresServer_CPUCores`.

## Дисковый и сетевой ввод-вывод \{#io\}

| Метрика                                     | Тип     | Единица | Описание                             |
| ------------------------------------------- | ------- | ------- | ------------------------------------ |
| `PostgresServer_DiskReads_Total`            | counter | ops     | Выполненные операции чтения с диска. |
| `PostgresServer_DiskWrites_Total`           | counter | ops     | Выполненные операции записи на диск. |
| `PostgresServer_NetworkReceiveBytes_Total`  | counter | bytes   | Байты, полученные по сети.           |
| `PostgresServer_NetworkTransmitBytes_Total` | counter | bytes   | Байты, переданные по сети.           |

## Активность базы данных \{#database-activity\}

Накопительные счётчики с момента запуска сервиса. Используйте `rate()` или `irate()`, чтобы
получить значения в секунду.

| Метрика                                       | Тип     | Описание                                |
| --------------------------------------------- | ------- | --------------------------------------- |
| `PostgresServer_TuplesFetched_Total`          | counter | Строки, полученные запросами.           |
| `PostgresServer_TuplesInserted_Total`         | counter | Вставленные строки.                     |
| `PostgresServer_TuplesUpdated_Total`          | counter | Обновлённые строки.                     |
| `PostgresServer_TuplesDeleted_Total`          | counter | Удалённые строки.                       |
| `PostgresServer_TransactionsCommitted_Total`  | counter | Зафиксированные транзакции.             |
| `PostgresServer_TransactionsRolledBack_Total` | counter | Транзакции, для которых выполнен откат. |
| `PostgresServer_Deadlocks_Total`              | counter | Обнаруженные взаимоблокировки.          |

## Подключения, кэш и размер базы данных \{#connections-cache-size\}

| Метрика                            | Тип   | Дополнительные метки | Описание                                                                                                                                            |
| ---------------------------------- | ----- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PostgresServer_ActiveConnections` | gauge | `state`              | Количество подключений по состоянию (например, `active`, `idle`).                                                                                   |
| `PostgresServer_CacheHitRatio`     | gauge |                      | Доля попаданий в буферный кэш: процент блоков, отданных из кэша, от общего числа запрошенных блоков.                                                |
| `PostgresServer_DatabaseSizeBytes` | gauge | `database`           | Размер каждой базы данных на диске в байтах. Включает базу данных `postgres`, создаваемую по умолчанию, и все базы данных, созданные пользователем. |

## Связанные страницы \{#related\}

* [Конечная точка Prometheus] — настройка, аутентификация и сбор метрик
* [Дашборд](/cloud/managed-postgres/monitoring/dashboard) — встроенные графики в облачной консоли
* [Руководство по OpenAPI](/cloud/managed-postgres/openapi) — создание API-ключа
  и поиск идентификаторов организации и сервиса

[Конечная точка Prometheus]: /cloud/managed-postgres/monitoring/prometheus