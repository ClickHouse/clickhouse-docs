---
description: 'Страница, посвящённая поддержке транзакций (ACID) в ClickHouse'
slug: /guides/developer/transactional
title: 'Поддержка транзакций (ACID)'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Поддержка транзакций (ACID)



## Случай 1: INSERT в одну партицию одной таблицы семейства MergeTree\* {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

Это транзакционная операция (ACID), если вставляемые строки упакованы и вставлены как единый блок (см. Примечания):

- Атомарность: операция INSERT либо выполняется успешно, либо отклоняется целиком: если клиенту отправлено подтверждение, то все строки были вставлены; если клиенту отправлена ошибка, то ни одна строка не была вставлена.
- Согласованность: если ограничения таблицы не нарушены, то все строки в операции INSERT вставляются и INSERT выполняется успешно; если ограничения нарушены, то ни одна строка не вставляется.
- Изолированность: параллельные клиенты наблюдают согласованный снимок таблицы — состояние таблицы либо до попытки INSERT, либо после успешного INSERT; промежуточное состояние не видно. Клиенты внутри другой транзакции имеют [изоляцию снимков](https://en.wikipedia.org/wiki/Snapshot_isolation), в то время как клиенты вне транзакции имеют уровень изоляции [read uncommitted](<https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted>).
- Долговечность: успешная операция INSERT записывается в файловую систему перед отправкой ответа клиенту на одной реплике или нескольких репликах (управляется настройкой `insert_quorum`), и ClickHouse может запросить у ОС синхронизацию данных файловой системы на носителе (управляется настройкой `fsync_after_insert`).
- INSERT в несколько таблиц одним запросом возможен при использовании материализованных представлений (INSERT от клиента выполняется в таблицу, к которой привязаны материализованные представления).


## Случай 2: INSERT в несколько партиций одной таблицы семейства MergeTree\* {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

Аналогично случаю 1 выше, с одной особенностью:

- Если таблица содержит много партиций и INSERT затрагивает несколько партиций, то вставка в каждую партицию является транзакционной независимо


## Случай 3: INSERT в одну распределённую таблицу семейства MergeTree\* {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

Аналогично случаю 1 выше, с одним уточнением:

- INSERT в распределённую таблицу (Distributed) не является транзакционным в целом, тогда как вставка в каждый отдельный шард транзакционна


## Случай 4: Использование таблицы Buffer {#case-4-using-a-buffer-table}

- вставка данных в таблицы Buffer не является ни атомарной, ни изолированной, ни согласованной, ни долговечной


## Случай 5: Использование async_insert {#case-5-using-async_insert}

Аналогично Случаю 1 выше, с этой деталью:

- атомарность обеспечивается, даже если `async_insert` включён и `wait_for_async_insert` установлен в 1 (по умолчанию), но если `wait_for_async_insert` установлен в 0, то атомарность не обеспечивается.


## Примечания {#notes}

- строки, вставляемые клиентом в определённом формате данных, упаковываются в один блок, когда:
  - формат вставки построчный (например, CSV, TSV, Values, JSONEachRow и т.д.), и данные содержат менее `max_insert_block_size` строк (~1 000 000 по умолчанию) или менее `min_chunk_bytes_for_parallel_parsing` байт (10 МБ по умолчанию) при использовании параллельного парсинга (включён по умолчанию)
  - формат вставки колоночный (например, Native, Parquet, ORC и т.д.), и данные содержат только один блок данных
- размер вставляемого блока в целом может зависеть от множества настроек (например: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` и т.д.)
- если клиент не получил ответ от сервера, он не знает, успешно ли завершилась транзакция, и может повторить транзакцию, используя свойства вставки ровно один раз
- ClickHouse использует [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) с [изоляцией снимков](https://en.wikipedia.org/wiki/Snapshot_isolation) для обработки параллельных транзакций
- все свойства ACID сохраняются даже в случае принудительного завершения работы или сбоя сервера
- для обеспечения надёжных вставок в типичной конфигурации должен быть включён либо insert_quorum в разные зоны доступности, либо fsync
- «согласованность» в терминах ACID не охватывает семантику распределённых систем, см. https://jepsen.io/consistency, которая управляется различными настройками (select_sequential_consistency)
- это объяснение не охватывает новую функциональность транзакций, которая позволяет выполнять полнофункциональные транзакции над несколькими таблицами, материализованными представлениями, множественными SELECT и т.д. (см. следующий раздел о транзакциях, фиксации и откате)


## Транзакции, фиксация и откат {#transactions-commit-and-rollback}

<ExperimentalBadge />
<CloudNotSupportedBadge />

Помимо функциональности, описанной в начале этого документа, ClickHouse имеет экспериментальную поддержку транзакций, фиксации и функциональности отката.

### Требования {#requirements}

- Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций
- Только база данных Atomic (по умолчанию)
- Только нереплицируемый движок таблиц MergeTree
- Включите экспериментальную поддержку транзакций, добавив эту настройку в `config.d/transactions.xml`:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### Примечания {#notes-1}

- Это экспериментальная функция, следует ожидать изменений.
- Если во время транзакции возникает исключение, вы не можете зафиксировать транзакцию. Это относится ко всем исключениям, включая исключения `UNKNOWN_FUNCTION`, вызванные опечатками.
- Вложенные транзакции не поддерживаются; завершите текущую транзакцию и начните новую

### Конфигурация {#configuration}

Эти примеры приведены для однонодового сервера ClickHouse с включенным ClickHouse Keeper.

#### Включение экспериментальной поддержки транзакций {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Базовая конфигурация для однонодового сервера ClickHouse с включенным ClickHouse Keeper {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
Подробную информацию о развертывании сервера ClickHouse и надлежащего кворума узлов ClickHouse Keeper см. в документации по [развертыванию](/deployment-guides/terminology.md). Конфигурация, показанная здесь, предназначена для экспериментальных целей.
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

#### Проверка включения экспериментальных транзакций {#verify-that-experimental-transactions-are-enabled}

Выполните `BEGIN TRANSACTION` или `START TRANSACTION`, а затем `ROLLBACK`, чтобы убедиться, что экспериментальные транзакции включены и что ClickHouse Keeper включен, так как он используется для отслеживания транзакций.

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

:::tip
Если вы видите следующую ошибку, проверьте ваш конфигурационный файл, чтобы убедиться, что `allow_experimental_transactions` установлен в `1` (или любое значение, отличное от `0` или `false`).

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

#### Создание таблицы для тестирования {#create-a-table-for-testing}

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

#### Начать транзакцию и вставить строку {#begin-a-transaction-and-insert-a-row}

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
Вы можете выполнить запрос к таблице внутри транзакции и увидеть, что строка была вставлена, даже если она ещё не зафиксирована.
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

#### Завершить транзакцию и снова выполнить запрос к таблице {#complete-a-transaction-and-query-the-table-again}

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

### Интроспекция транзакций {#transactions-introspection}

Вы можете проверить транзакции, выполнив запрос к таблице `system.transactions`, но обратите внимание, что вы не можете выполнить запрос к этой таблице из сеанса, находящегося в транзакции. Откройте второй сеанс `clickhouse client` для выполнения запроса к этой таблице.

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


## Дополнительная информация {#more-details}

См. этот [мета-issue](https://github.com/ClickHouse/ClickHouse/issues/48794) для получения более подробных тестов и отслеживания прогресса.
