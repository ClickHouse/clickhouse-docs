---
description: 'Страница, посвящённая поддержке транзакций (ACID) в ClickHouse'
slug: /guides/developer/transactional
title: 'Поддержка транзакций (ACID)'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Поддержка транзакционности (ACID) {#transactional-acid-support}

## Случай 1: INSERT в один раздел одной таблицы семейства MergeTree* {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

Операция является транзакционной (ACID), если вставляемые строки упакованы и вставляются одним блоком (см. примечания):
- Atomic (атомарность): операция INSERT либо полностью завершается успешно, либо полностью отклоняется: если клиенту отправлено подтверждение, то вставлены все строки; если клиенту отправлена ошибка, то ни одна строка не вставлена.
- Consistent (согласованность): если не нарушены ограничения таблицы, то все строки в операции INSERT вставляются и INSERT завершается успешно; если ограничения нарушены, то ни одна строка не вставляется.
- Isolated (изолированность): параллельные клиенты наблюдают согласованный снимок таблицы — состояние таблицы либо таким, каким оно было до попытки INSERT, либо после успешного INSERT; промежуточное состояние не видно. Клиенты, работающие внутри транзакции, используют уровень изоляции [snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation), а клиенты вне транзакции — уровень изоляции [read uncommitted](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted).
- Durable (долговечность): успешный INSERT записывается в файловую систему до ответа клиенту, на одну реплику или несколько реплик (управляется настройкой `insert_quorum`), и ClickHouse может попросить ОС синхронизировать данные файловой системы с носителем (управляется настройкой `fsync_after_insert`).
- INSERT в несколько таблиц одним оператором возможен, если задействованы материализованные представления (INSERT от клиента выполняется в таблицу, у которой есть связанные материализованные представления).

## Случай 2: INSERT в несколько партиций одной таблицы семейства MergeTree* {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

Аналогично случаю 1 выше, с таким уточнением:
- Если таблица имеет много партиций и INSERT затрагивает многие из них, то вставка в каждую партицию является самостоятельной транзакцией

## Случай 3: INSERT в одну распределённую таблицу семейства MergeTree* {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

Аналогичен случаю 1 выше, но с одной особенностью:
- операция INSERT в таблицу движка Distributed не является транзакционной в целом, тогда как вставка в каждый шард — транзакционная

## Случай 4: Использование таблицы Buffer {#case-4-using-a-buffer-table}

- вставка в таблицы Buffer не обладает свойствами атомарности, изолированности, согласованности и долговечности

## Случай 5: Использование async_insert {#case-5-using-async_insert}

То же, что и в случае 1 выше, со следующим уточнением:
- атомарность обеспечивается даже если `async_insert` включён и `wait_for_async_insert` установлен в 1 (значение по умолчанию), но если `wait_for_async_insert` установлен в 0, то атомарность не гарантируется.

## Примечания {#notes}
- строки, вставленные клиентом в некотором формате данных, упаковываются в один блок, когда:
  - формат вставки построчный (например, CSV, TSV, Values, JSONEachRow и т. д.), а данные содержат меньше, чем `max_insert_block_size` строк (~1 000 000 по умолчанию) или меньше, чем `min_chunk_bytes_for_parallel_parsing` байт (10 МБ по умолчанию), если используется параллельный разбор (он включён по умолчанию)
  - формат вставки столбцовый (например, Native, Parquet, ORC и т. д.), а данные содержат только один блок
- размер вставляемого блока в общем случае может зависеть от множества настроек (например: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` и т. д.)
- если клиент не получил ответ от сервера, он не знает, была ли транзакция успешной, и может повторить её, используя свойства вставки с гарантией «ровно один раз»
- ClickHouse внутренне использует [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) с [snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation) для конкурентных транзакций
- все ACID-свойства сохраняются даже в случае принудительного завершения или сбоя сервера
- для обеспечения надёжной фиксации вставок в типовой конфигурации должно быть включено либо insert_quorum для разных зон доступности (AZ), либо fsync
- «согласованность» в терминах ACID не охватывает семантику распределённых систем, см. https://jepsen.io/consistency; она управляется другими настройками (select_sequential_consistency)
- это объяснение не охватывает новую функциональность транзакций, которая позволяет использовать полнофункциональные транзакции над несколькими таблицами, материализованными представлениями, для нескольких SELECT и т. д. (см. следующий раздел о Transactions, Commit и Rollback)

## Транзакции, фиксация (commit) и откат (rollback) {#transactions-commit-and-rollback}

<ExperimentalBadge />

<CloudNotSupportedBadge />

В дополнение к функциональности, описанной в начале этого документа, ClickHouse экспериментально поддерживает транзакции, фиксацию (commit) и откат (rollback).

### Требования {#requirements}

* Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций
* Только база данных типа Atomic (по умолчанию)
* Только нереплицированный движок таблицы MergeTree
* Включите экспериментальную поддержку транзакций, добавив этот параметр в `config.d/transactions.xml`:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### Примечания {#notes-1}

* Это экспериментальная функциональность, и следует ожидать изменений.
* Если во время транзакции возникает исключение, вы не можете зафиксировать транзакцию. Это относится ко всем исключениям, включая исключения `UNKNOWN_FUNCTION`, вызванные опечатками.
* Вложенные транзакции не поддерживаются; вместо этого завершите текущую транзакцию и начните новую.

### Конфигурация {#configuration}

Эти примеры относятся к одноузловому серверу ClickHouse с включённым ClickHouse Keeper.

#### Включение экспериментальной поддержки транзакций {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Basic configuration for a single ClickHouse server node with ClickHouse Keeper enabled {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
See the [deployment](/deployment-guides/terminology.md) documentation for details on deploying ClickHouse server and a proper quorum of ClickHouse Keeper nodes.  The configuration shown here is for experimental purposes.
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

### Example {#example}

#### Verify that experimental transactions are enabled {#verify-that-experimental-transactions-are-enabled}

Issue a `BEGIN TRANSACTION` or `START TRANSACTION` followed by a `ROLLBACK` to verify that experimental transactions are enabled, and that ClickHouse Keeper is enabled as it is used to track transactions. 

```sql
BEGIN TRANSACTION
```
```response
ОК.
```

:::tip
If you see the following error, then check your configuration file to make sure that `allow_experimental_transactions` is set to `1` (or any value other than `0` or `false`).

```response
Код: 48. DB::Exception: Получено от localhost:9000.
DB::Exception: Транзакции не поддерживаются.
(NOT_IMPLEMENTED)
```

You can also check ClickHouse Keeper by issuing

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper should respond with `imok`.
:::

```sql
ROLLBACK
```

```response
ОК.
```

#### Create a table for testing {#create-a-table-for-testing}

:::tip
Creation of tables is not transactional.  Run this DDL query outside of a transaction.
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

#### Begin a transaction and insert a row {#begin-a-transaction-and-insert-a-row}

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
You can query the table from within a transaction and see that the row was inserted even though it has not yet been committed.
:::

#### Rollback the transaction, and query the table again {#rollback-the-transaction-and-query-the-table-again}

Verify that the transaction is rolled back:

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

0 строк в наборе. Прошло: 0.002 сек.
```

#### Complete a transaction and query the table again {#complete-a-transaction-and-query-the-table-again}

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

### Transactions introspection {#transactions-introspection}

You can inspect transactions by querying the `system.transactions` table, but note that you cannot query that
table from a session that is in a transaction. Open a second `clickhouse client` session to query that table.

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
Строка 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## Подробности {#more-details}

Ознакомьтесь с этой [мета‑задачей](https://github.com/ClickHouse/ClickHouse/issues/48794), чтобы найти гораздо более обширные тесты и быть в курсе прогресса.
