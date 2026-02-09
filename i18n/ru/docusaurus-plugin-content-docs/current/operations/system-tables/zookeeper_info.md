---
description: 'Системная таблица, предоставляющая информацию обо всех доступных узлах Keeper.'
keywords: ['системная таблица', 'zookeeper_info']
slug: /operations/system-tables/zookeeper_info
title: 'system.zookeeper_info'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_info \{#systemzookeeper_info\}

<SystemTableCloud />

Эта таблица выводит агрегированную диагностическую информацию о ZooKeeper; сведения об узлах берутся из конфигурации.

Столбцы:

* `zookeeper_cluster_name` ([String](../../sql-reference/data-types/string.md)) — имя кластера ZooKeeper.
* `host` ([String](../../sql-reference/data-types/string.md)) — имя хоста или IP-адрес узла ZooKeeper, к которому подключён ClickHouse.
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт узла ZooKeeper, к которому подключён ClickHouse.
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — Индекс узла ZooKeeper, к которому подключён ClickHouse. Индекс получен из конфигурации ZooKeeper. Если подключения нет, этот столбец имеет значение NULL.
* `is_connected` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — Показывает, установлено ли соединение с ZooKeeper.
* `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Признак «только для чтения».
* `version` ([String](../../sql-reference/data-types/string.md)) — версия ZooKeeper.
* `avg_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — средняя задержка.
* `max_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — максимальная задержка.
* `min_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — минимальная задержка.
* `packets_received` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество полученных пакетов.
* `packets_sent` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество отправленных пакетов.
* `outstanding_requests` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество незавершенных запросов.
* `server_state` ([String](../../sql-reference/data-types/string.md)) — состояние сервера.
* `is_leader` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Является ли этот узел лидером ZooKeeper.
* `znode_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Число znode.
* `watch_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество вотчей.
* `ephemerals_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество эфемерных узлов
* `approximate_data_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — приблизительный размер данных.
* `followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Ведомые узлы лидера. Это поле доступно только на лидере.
* `synced_followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество синхронизированных реплик (followers) у лидера. Это поле отображается только для лидера.
* `pending_syncs` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Число ожидающих синхронизаций у лидера. Это поле выводится только для лидера.
* `open_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Число открытых файловых дескрипторов. Доступно только на платформах Unix.
* `max_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальное число файловых дескрипторов. Только на платформах Unix.
* `connections` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество подключений к ZooKeeper.
* `outstanding` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество необработанных запросов в ZooKeeper.
* `zxid` ([UInt64](../../sql-reference/data-types/int-uint.md)) — zxid в ZooKeeper.
* `node_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Число узлов ZooKeeper.
* `snapshot_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — размер каталога со снимками ZooKeeper.
* `log_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — размер каталога журналов ZooKeeper.
* `first_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — первый индекс журнала ZooKeeper.
* `first_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Терм первой записи журнала ZooKeeper.
* `last_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — индекс последнего журнала ZooKeeper.
* `last_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — терм последней записи в журнале ZooKeeper.
* `last_committed_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — последний зафиксированный индекс в ZooKeeper.
* `leader_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — индекс журнала, подтверждённого лидером ZooKeeper.
* `target_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — целевой индекс зафиксированного журнала ZooKeeper.
* `last_snapshot_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — индекс последнего снимка в ZooKeeper.
  g