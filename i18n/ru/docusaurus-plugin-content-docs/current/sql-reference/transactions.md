---
slug: '/guides/developer/transactional'
description: 'Страница, описывающая поддержку транзакций (ACID) в ClickHouse'
title: 'Поддержка транзакций (ACID)'
doc_type: guide
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Поддержка транзакций (ACID)

## Случай 1: INSERT в одну партицию одной таблицы семейства MergeTree* {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

Это транзакционно (ACID), если вставляемые строки упакованы и вставлены как один блок (см. Заметки):
- Атомарность: INSERT либо выполняется, либо отклоняется целиком: если подтверждение отправлено клиенту, значит, все строки были вставлены; если клиенту отправлена ошибка, значит, строки не были вставлены.
- Согласованность: если нет нарушений ограничений таблицы, то все строки в INSERT вставляются и INSERT выполняется; если ограничения нарушены, строки не вставляются.
- Изоляция: параллельные клиенты наблюдают согласованный снимок таблицы - состояние таблицы либо такое, как оно было до попытки INSERT, либо после успешного INSERT; частичное состояние не видно. Клиенты внутри другой транзакции имеют [изоляцию снимков](https://en.wikipedia.org/wiki/Snapshot_isolation), в то время как клиенты вне транзакции имеют уровень изоляции [чтения непроверенных данных](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted).
- Долговечность: успешный INSERT записывается в файловую систему перед ответом клиенту, на одной реплике или нескольких репликах (контролируется настройкой `insert_quorum`), и ClickHouse может попросить ОС синхронизировать данные файловой системы на носителе (контролируется настройкой `fsync_after_insert`).
- INSERT в несколько таблиц с одним запросом возможен, если участвуют материализованные представления (INSERT от клиента идет в таблицу, у которой есть связанные материализованные представления).

## Случай 2: INSERT в несколько партиций одной таблицы семейства MergeTree* {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

То же, что и в Случае 1 выше, с этой деталью:
- Если таблица имеет много партиций и INSERT охватывает многие партиции, то вставка в каждую партицию является транзакционной сама по себе.

## Случай 3: INSERT в одну распределенную таблицу семейства MergeTree* {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

То же, что и в Случае 1 выше, с этой деталью:
- INSERT в распределенную таблицу не является транзакционным целиком, в то время как вставка в каждую шард является транзакционной.

## Случай 4: Использование буферной таблицы {#case-4-using-a-buffer-table}

- Вставка в буферные таблицы не является ни атомарной, ни изолированной, ни согласованной, ни долговечной.

## Случай 5: Использование async_insert {#case-5-using-async_insert}

То же, что и в Случае 1 выше, с этой деталью:
- атомарность обеспечивается даже если `async_insert` включен и `wait_for_async_insert` установлен в 1 (по умолчанию), но если `wait_for_async_insert` установлен в 0, то атомарность не обеспечивается.

## Заметки {#notes}
- Строки, вставленные из клиента в каком-либо формате данных, упаковываются в один блок, когда:
  - формат вставки основан на строках (например, CSV, TSV, Values, JSONEachRow и пр.) и данные содержат меньше `max_insert_block_size` строк (~1 000 000 по умолчанию) или меньше `min_chunk_bytes_for_parallel_parsing` байт (10 МБ по умолчанию) в случае использования параллельного разбора (включен по умолчанию)
  - формат вставки основан на колонках (например, Native, Parquet, ORC и пр.) и данные содержат только один блок данных
- Размер вставленного блока может зависеть от множества настроек (например: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` и т.д.)
- Если клиент не получил ответа от сервера, клиент не знает, была ли транзакция успешной, и он может повторить транзакцию, используя свойства вставки один раз.
- ClickHouse использует [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) с [изоляцией снимков](https://en.wikipedia.org/wiki/Snapshot_isolation) для параллельных транзакций.
- Все свойства ACID действительны даже в случае аварийного завершения сервера.
- Либо `insert_quorum` в разные AZ, либо `fsync` должны быть включены, чтобы обеспечить долговечные вставки в типичной настройке.
- "Согласованность" в терминах ACID не охватывает семантику распределенных систем, см. https://jepsen.io/consistency, которая контролируется различными настройками (select_sequential_consistency).
- Это объяснение не охватывает новую функциональность транзакций, которая позволяет осуществлять полнофункциональные транзакции над несколькими таблицами, материализованными представлениями для нескольких SELECT и т.д. (см. следующий раздел о транзакциях, коммитах и откатах).

## Транзакции, Коммит и Откат {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

В дополнение к функциональности, описанной в верхней части этого документа, ClickHouse имеет экспериментальную поддержку транзакций, коммитов и функциональности откатов.

### Требования {#requirements}

- Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций
- Только атомарные базы данных (по умолчанию)
- Только движок таблицы Non-Replicated MergeTree
- Включите экспериментальную поддержку транзакций, добавив эту настройку в `config.d/transactions.xml`:
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

### Заметки {#notes-1}
- Это экспериментальная функция, и изменения следует ожидать.
- Если во время транзакции происходит исключение, вы не можете зафиксировать транзакцию. Это включает все исключения, в том числе исключения `UNKNOWN_FUNCTION`, вызванные опечатками.
- Вложенные транзакции не поддерживаются; завершается текущая транзакция и начинается новая.

### Конфигурация {#configuration}

Эти примеры предназначены для одноузлового сервера ClickHouse с включенным ClickHouse Keeper.

#### Включение экспериментальной поддержки транзакций {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Основная конфигурация для одного узла сервера ClickHouse с включенным ClickHouse Keeper {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
Смотрите документацию по [развертыванию](/deployment-guides/terminology.md) для получения подробной информации о развертывании сервера ClickHouse и правильном кворуме узлов ClickHouse Keeper. Конфигурация, представленная здесь, предназначена для экспериментальных целей.
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
    <display_name>node 1</display_name>
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

Выпустите `BEGIN TRANSACTION` или `START TRANSACTION`, за которым следует `ROLLBACK`, чтобы проверить, что экспериментальные транзакции включены и что ClickHouse Keeper включен, поскольку он используется для отслеживания транзакций.

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
Если вы видите следующую ошибку, проверьте файл конфигурации, чтобы убедиться, что `allow_experimental_transactions` установлен в `1` (или любое значение, отличное от `0` или `false`).

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

Вы также можете проверить ClickHouse Keeper, выполнив

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
Вы можете выполнять запросы к таблице из транзакции и увидеть, что строка была вставлена, даже если она ещё не была зафиксирована.
:::

#### Откатить транзакцию и снова выполнить запрос к таблице {#rollback-the-transaction-and-query-the-table-again}

Убедитесь, что транзакция откатилась:

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

#### Завершите транзакцию и снова выполните запрос к таблице {#complete-a-transaction-and-query-the-table-again}

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

Вы можете исследовать транзакции, выполняя запросы к таблице `system.transactions`, но имейте в виду, что вы не можете выполнять запросы к этой таблице из сеанса, который находится в транзакции. Откройте вторую сессию `clickhouse client`, чтобы выполнить запрос к этой таблице.

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

## Подробнее {#more-details}

Смотрите этот [мета-вопрос](https://github.com/ClickHouse/ClickHouse/issues/48794), чтобы ознакомиться с более обширными тестами и быть в курсе прогресса.