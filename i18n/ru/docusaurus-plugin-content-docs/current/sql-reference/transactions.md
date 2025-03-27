---
description: 'Страница, описывающая поддержку транзакций (ACID) в ClickHouse'
slug: /guides/developer/transactional
title: 'Поддержка транзакций (ACID)'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Поддержка транзакций (ACID)

## Случай 1: INSERT в один раздел одной таблицы семейства MergeTree* {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

Это транзакционно (ACID), если вставленные строки упаковываются и вставляются как один блок (см. Заметки):
- Атомарность: оператор INSERT выполняется полностью или отклоняется: если подтверждение отправлено клиенту, значит, все строки были вставлены; если клиенту отправлена ошибка, значит, строки не были вставлены.
- Последовательность: если не нарушены ограничения таблицы, все строки в INSERT вставляются, и INSERT выполняется успешно; если ограничения нарушены, строки не вставляются.
- Изолированность: одновременно работающие клиенты наблюдают согласованный снимок таблицы — состояние таблицы соответствует либо состоянию до попытки INSERT, либо после успешного INSERT; частичное состояние не отображается. Клиенты внутри другой транзакции имеют [изоляцию по снимкам](https://en.wikipedia.org/wiki/Snapshot_isolation), в то время как клиенты вне транзакции имеют уровень изоляции [чтения неподтвержденных](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted).
- Долговечность: успешный INSERT записывается в файловую систему перед ответом клиенту, на одной реплике или нескольких репликах (управляется настройкой `insert_quorum`), и ClickHouse может попросить операционную систему синхронизировать данные файловой системы на носителе (управляется настройкой `fsync_after_insert`).
- INSERT в несколько таблиц с одним оператором возможен, если задействованы материализованные представления (INSERT от клиента идет в таблицу, которая имеет связанные материализованные представления).

## Случай 2: INSERT в несколько разделов одной таблицы семейства MergeTree* {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

То же, что и в Случае 1, с этой деталью:
- Если у таблицы много разделов, и INSERT охватывает много разделов, то вставка в каждый раздел транзакционна сама по себе.

## Случай 3: INSERT в одну распределенную таблицу семейства MergeTree* {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

То же, что и в Случае 1, с этой деталью:
- INSERT в распределенную таблицу не является транзакционным в целом, в то время как вставка в каждую шардированную часть является транзакционной.

## Случай 4: Использование таблицы Buffer {#case-4-using-a-buffer-table}

- вставка в таблицы Buffer не является ни атомарной, ни изолированной, ни последовательной, ни долговечной.

## Случай 5: Использование async_insert {#case-5-using-async_insert}

То же, что и в Случае 1, с этой деталью:
- атомарность гарантируется даже если включен `async_insert`, и `wait_for_async_insert` установлен в 1 (по умолчанию), но если `wait_for_async_insert` установлен в 0, то атомарность не гарантируется.

## Заметки {#notes}
- строки, вставленные клиентом в каком-либо формате данных, упаковываются в один блок, когда:
  - формат вставки основан на строках (например, CSV, TSV, Values, JSONEachRow и т. д.) и данные содержат менее `max_insert_block_size` строк (~1 000 000 по умолчанию) или менее `min_chunk_bytes_for_parallel_parsing` байт (10 МБ по умолчанию) в случае использования параллельного парсинга (включен по умолчанию)
  - формат вставки основан на столбцах (например, Native, Parquet, ORC и т. д.) и данные содержат только один блок данных.
- размер вставленного блока может зависеть от многих настроек (например: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` и т. д.)
- если клиент не получил ответа от сервера, клиент не знает, успешна ли транзакция, и он может повторить транзакцию, используя свойства вставки точно один раз.
- ClickHouse использует [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) с [изоляцией по снимкам](https://en.wikipedia.org/wiki/Snapshot_isolation) для одновременных транзакций.
- все свойства ACID действительны даже в случае аварийной остановки сервера.
- либо insert_quorum в разные AZ, либо fsync должны быть включены для обеспечения долговечных вставок в типовой настройке.
- "последовательность" в терминах ACID не охватывает семантику распределенных систем, см. https://jepsen.io/consistency, что контролируется различными настройками (select_sequential_consistency).
- это объяснение не охватывает новую функциональность транзакций, которая позволяет иметь полнофункциональные транзакции по нескольким таблицам, материализованным представлениям для нескольких SELECT и т. д. (см. следующий раздел о Транзакциях, Подтверждении и Откате).

## Транзакции, Подтверждение и Откат {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

В дополнение к функциональности, описанной в начале этого документа, ClickHouse имеет экспериментальную поддержку для транзакций, подтверждений и функциональности отката.

### Требования {#requirements}

- Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций.
- Только атомарные БД (по умолчанию).
- Только движок таблицы Non-Replicated MergeTree.
- Включите экспериментальную поддержку транзакций, добавив эту настройку в `config.d/transactions.xml`:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### Заметки {#notes-1}
- Это экспериментальная функция, и следует ожидать изменений.
- Если во время транзакции произойдет исключение, вы не можете подтвердить транзакцию. Это касается всех исключений, включая исключения `UNKNOWN_FUNCTION`, вызванные опечатками.
- Вложенные транзакции не поддерживаются; завершите текущую транзакцию и начните новую.

### Конфигурация {#configuration}

Эти примеры для сервера ClickHouse с одним узлом с включенным ClickHouse Keeper.

#### Включите экспериментальную поддержку транзакций {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Основная конфигурация для одного сервера ClickHouse с включенным ClickHouse Keeper {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
Смотрите документацию [развертывания](/deployment-guides/terminology.md) для получения подробной информации о развертывании сервера ClickHouse и правильного кворума узлов ClickHouse Keeper. Показанная здесь конфигурация предназначена для экспериментальных целей.
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

Выдайте `BEGIN TRANSACTION` или `START TRANSACTION`, за которым следует `ROLLBACK`, чтобы проверить, что экспериментальные транзакции включены, и что ClickHouse Keeper включен, так как он используется для отслеживания транзакций. 

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
Если вы видите следующее сообщение об ошибке, проверьте свой конфигурационный файл, чтобы убедиться, что `allow_experimental_transactions` установлен в `1` (или любое значение, отличное от `0` или `false`).

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
Вы можете выполнять запрос к таблице из транзакции и увидеть, что строка была вставлена, даже если она еще не была зафиксирована.
:::

#### Откатите транзакцию и снова выполните запрос к таблице {#rollback-the-transaction-and-query-the-table-again}

Проверьте, что транзакция откатена:

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

Вы можете инспектировать транзакции, выполнив запрос к таблице `system.transactions`, но обратите внимание, что вы не можете выполнять запросы к этой таблице из сессии, которая находится в транзакции. Откройте второй сеанс `clickhouse client`, чтобы выполнить запрос к этой таблице.

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

## Более подробная информация {#more-details}

Смотрите эту [главную проблему](https://github.com/ClickHouse/ClickHouse/issues/48794), чтобы найти более обширные тесты и оставаться в курсе хода работы.
