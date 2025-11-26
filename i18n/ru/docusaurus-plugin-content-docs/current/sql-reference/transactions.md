---
description: 'Страница, посвящённая поддержке транзакций (ACID) в ClickHouse'
slug: /guides/developer/transactional
title: 'Поддержка транзакций (ACID)'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Поддержка транзакционности (ACID)



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



## Транзакции, фиксация (commit) и откат (rollback)

<ExperimentalBadge />

<CloudNotSupportedBadge />

В дополнение к функциональности, описанной в начале этого документа, ClickHouse экспериментально поддерживает транзакции, фиксацию (commit) и откат (rollback).

### Требования

* Разверните ClickHouse Keeper или ZooKeeper для отслеживания транзакций
* Только база данных типа Atomic (по умолчанию)
* Только нереплицированный движок таблицы MergeTree
* Включите экспериментальную поддержку транзакций, добавив этот параметр в `config.d/transactions.xml`:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### Примечания

* Это экспериментальная функциональность, и следует ожидать изменений.
* Если во время транзакции возникает исключение, вы не можете зафиксировать транзакцию. Это относится ко всем исключениям, включая исключения `UNKNOWN_FUNCTION`, вызванные опечатками.
* Вложенные транзакции не поддерживаются; вместо этого завершите текущую транзакцию и начните новую.

### Конфигурация

Эти примеры относятся к одноузловому серверу ClickHouse с включённым ClickHouse Keeper.

#### Включение экспериментальной поддержки транзакций

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### Базовая конфигурация для одного серверного узла ClickHouse с включённым ClickHouse Keeper

:::note
См. документацию по [развертыванию](/deployment-guides/terminology.md) для получения подробной информации о развертывании сервера ClickHouse и настройке корректного кворума узлов ClickHouse Keeper. Приведённая здесь конфигурация предназначена только для экспериментального использования.
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

### Пример

#### Проверьте, что экспериментальные транзакции включены

Выполните `BEGIN TRANSACTION` или `START TRANSACTION`, а затем `ROLLBACK`, чтобы убедиться, что экспериментальные транзакции включены, а также что ClickHouse Keeper включён, поскольку он используется для отслеживания транзакций.

```sql
BEGIN TRANSACTION
```

```response
ОК.
```

:::tip
Если вы видите следующую ошибку, проверьте файл конфигурации и убедитесь, что параметр `allow_experimental_transactions` установлен в значение `1` (или любое другое значение, кроме `0` или `false`).

```response
Код: 48. DB::Exception: Получено от localhost:9000.
DB::Exception: Транзакции не поддерживаются.
(NOT_IMPLEMENTED)
```

Вы также можете проверить ClickHouse Keeper, выполнив следующую команду

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper должен вернуть ответ `imok`.
:::

```sql
ROLLBACK
```

```response
ОК.
```

#### Создание таблицы для тестирования

:::tip
Создание таблиц не является транзакционной операцией. Выполните этот DDL-запрос вне транзакции.
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

#### Начните транзакцию и добавьте строку

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
Вы можете выполнить запрос к таблице в рамках транзакции и увидеть, что строка была вставлена, даже несмотря на то, что транзакция еще не была зафиксирована.
:::

#### Откатите транзакцию и снова выполните запрос к таблице

Убедитесь, что транзакция была откатена:

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

#### Завершите транзакцию и выполните запрос к таблице ещё раз

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

### Анализ транзакций

Вы можете просматривать транзакции, выполняя запрос к таблице `system.transactions`, однако учтите, что выполнять запросы к этой таблице нельзя из сеанса, в котором уже открыта транзакция. Откройте второй сеанс `clickhouse client`, чтобы запрашивать эту таблицу.

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
