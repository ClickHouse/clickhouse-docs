---
description: 'Страница, описывающая поддержку транзакций (ACID) в ClickHouse'
slug: /guides/developer/transactional
title: 'Поддержка транзакций (ACID)'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Поддержка транзакций (ACID)

## Случай 1: INSERT в одну партицию одной таблицы семейства MergeTree* {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

Это транзакционно (ACID), если вставленные строки упаковываются и вставляются как единый блок (см. Заметки):
- Атомарность: команда INSERT выполняется успешно или отклоняется целиком: если подтверждение отправлено клиенту, то все строки были вставлены; если ошибка отправлена клиенту, то ни одна строка не была вставлена.
- Согласованность: если не нарушены ограничения таблицы, то все строки в INSERT вставлены и команда INSERT завершена успешно; если ограничения нарушены, то ни одна строка не вставлена.
- Изолированность: параллельные клиенты наблюдают последовательный снимок таблицы - состояние таблицы либо до попытки INSERT, либо после успешного INSERT; никакое частичное состояние не видно. Клиенты внутри другой транзакции имеют [изоляцию снимка](https://en.wikipedia.org/wiki/Snapshot_isolation), в то время как клиенты вне транзакции находятся на уровне изоляции [чтения неподтверждённых данных](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted).
- Долговечность: успешный INSERT записывается в файловую систему до ответа клиенту, на одной реплике или нескольких репликах (контролируется настройкой `insert_quorum`), и ClickHouse может попросить операционную систему синхронизировать данные файловой системы на носителе (контролируется настройкой `fsync_after_insert`).
- INSERT в несколько таблиц с одной командой возможен, если участвуют материализованные представления (INSERT от клиента идет в таблицу, которая имеет связанные материализованные представления).

## Случай 2: INSERT в несколько партиций одной таблицы семейства MergeTree* {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

То же самое, что и в Случае 1, с этой деталью:
- Если таблица имеет много партиций, и INSERT охватывает много партиций, то вставка в каждую партицию транзакционна сама по себе.

## Случай 3: INSERT в одну распределённую таблицу семейства MergeTree* {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

То же самое, что и в Случае 1, с этой деталью:
- INSERT в распределённую таблицу не является транзакционным в целом, хотя вставка в каждую шарду является транзакционной.

## Случай 4: Использование таблицы Buffer {#case-4-using-a-buffer-table}

- Вставка в таблицы Buffer не является ни атомарной, ни изолированной, ни согласованной, ни долговечной.

## Случай 5: Использование async_insert {#case-5-using-async_insert}

То же самое, что и в Случае 1, с этой деталью:
- Атомарность обеспечивается даже если `async_insert` включен и `wait_for_async_insert` установлен в 1 (по умолчанию), но если `wait_for_async_insert` установлен в 0, то атомарность не обеспечивается.

## Заметки {#notes}
- Строки, вставленные клиентом в некотором формате данных, упаковываются в единый блок, когда:
  - формат вставки основан на строках (например, CSV, TSV, Values, JSONEachRow и т.д.) и данные содержат меньше чем `max_insert_block_size` строк (~1 000 000 по умолчанию) или меньше чем `min_chunk_bytes_for_parallel_parsing` байт (10 МБ по умолчанию), если используется параллельный разбор (включен по умолчанию).
  - формат вставки основан на колонках (например, Native, Parquet, ORC и т.д.) и данные содержат только один блок данных.
- Размер вставленного блока в общем может зависеть от многих настроек (например: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` и т.д.).
- Если клиент не получил ответа от сервера, он не знает, удалось ли выполнение транзакции, и может повторить транзакцию, используя свойства вставки "точно один раз".
- ClickHouse использует [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) с [изоляцией снимка](https://en.wikipedia.org/wiki/Snapshot_isolation) внутри для параллельных транзакций.
- Все свойства ACID действительны даже в случае отключения/сбоя сервера.
- Либо insert_quorum в разных AZ, либо fsync должны быть включены для обеспечения долговечных вставок в типичной настройке.
- "Согласованность" в терминах ACID не охватывает семантику распределённых систем, см. https://jepsen.io/consistency, над которой контролируются разные настройки (select_sequential_consistency).
- Это объяснение не охватывает новую функциональность транзакций, позволяющую иметь полнофункциональные транзакции на нескольких таблицах, материализованных представлениях, для нескольких SELECT и т.д. (см. следующий раздел о Транзакциях, Коммитах и Откатах).

## Транзакции, Коммиты и Откаты {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

В дополнение к функциональности, описанной в начале этого документа, ClickHouse имеет экспериментальную поддержку транзакций, коммитов и функциональности откатов.

### Требования {#requirements}

- Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций.
- Только атомарные базы данных (по умолчанию).
- Только движок таблиц Non-Replicated MergeTree.
- Включите экспериментальную поддержку транзакций, добавив эту настройку в `config.d/transactions.xml`:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### Заметки {#notes-1}
- Это экспериментальная функция, и ожидаются изменения.
- Если происходит исключение в процессе транзакции, вы не можете выполнить коммит транзакции. Это включает все исключения, в том числе исключения `UNKNOWN_FUNCTION`, вызванные опечатками.  
- Вложенные транзакции не поддерживаются; завершите текущую транзакцию и начните новую.

### Конфигурация {#configuration}

Эти примеры для одноузлового сервера ClickHouse с включённым ClickHouse Keeper.

#### Включите экспериментальную поддержку транзакций {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Основная конфигурация для одноузлового сервера ClickHouse с включённым ClickHouse Keeper {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
Смотрите документацию по [развёртыванию](/deployment-guides/terminology.md) для получения подробностей о развертывании сервера ClickHouse и правильном кворуме узлов ClickHouse Keeper. Показанная здесь конфигурация предназначена для экспериментальных целей.
:::

```xml title=/etc/clickhouse-server/config.d/config.xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>узел 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <zookeeper>
        <node>
            <host>clickhouse-01</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>information</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### Пример {#example}

#### Проверьте, что экспериментальные транзакции включены {#verify-that-experimental-transactions-are-enabled}

Выдайте `BEGIN TRANSACTION` или `START TRANSACTION`, затем `ROLLBACK`, чтобы проверить, что экспериментальные транзакции включены и что ClickHouse Keeper включён, так как он используется для отслеживания транзакций.

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
Если вы видите следующую ошибку, то проверьте ваш конфигурационный файл, чтобы убедиться, что `allow_experimental_transactions` установлен в `1` (или любое значение, кроме `0` или `false`).

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

Вы также можете проверить ClickHouse Keeper, выдав

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper должен ответить `imok`.
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### Создайте таблицу для тестирования {#create-a-table-for-testing}

:::tip
Создание таблиц не является транзакционным. Выполните этот DDL-запрос вне транзакции.
:::

```sql
CREATE TABLE mergetree_table
(
    `n` Int64
)
ENGINE = MergeTree
ORDER BY n
```

```response
Ok.
```

#### Начните транзакцию и вставьте строку {#begin-a-transaction-and-insert-a-row}

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (10)
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 10 │
└────┘
```

:::note
Вы можете запрашивать таблицу изнутри транзакции и увидеть, что строка была вставлена, даже если она ещё не была зафиксирована.
:::

#### Откатите транзакцию и снова запросите таблицу {#rollback-the-transaction-and-query-the-table-again}

Проверьте, что транзакция откатилась:

```sql
ROLLBACK
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```
```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

#### Завершите транзакцию и снова запросите таблицу {#complete-a-transaction-and-query-the-table-again}

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (42)
```

```response
Ok.
```

```sql
COMMIT
```

```response
Ok. Elapsed: 0.002 sec.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 42 │
└────┘
```

### Инспекция транзакций {#transactions-introspection}

Вы можете просматривать транзакции, выполняя запрос к таблице `system.transactions`, но имейте в виду, что вы не можете запрашивать эту таблицу из сессии, находящейся в транзакции. Откройте вторую сессию `clickhouse client`, чтобы выполнить запрос к этой таблице.

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
Row 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## Дополнительные детали {#more-details}

Смотрите этот [мета-вопрос](https://github.com/ClickHouse/ClickHouse/issues/48794), чтобы увидеть гораздо более обширные тесты и быть в курсе прогресса.
