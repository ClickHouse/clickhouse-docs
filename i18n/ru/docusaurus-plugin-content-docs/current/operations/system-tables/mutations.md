---
description: 'Системная таблица, содержащая информацию о мутациях таблиц MergeTree
  и ходе их выполнения. Каждая команда мутации отображается отдельной строкой.'
keywords: ['системная таблица', 'мутации']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations

Таблица содержит информацию о [мутациях](/sql-reference/statements/alter/index.md#mutations) таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и ходе их выполнения. Каждой команде мутации соответствует одна строка.

## Столбцы: \{#columns\}

- `database` ([String](/sql-reference/data-types/string.md)) — Имя базы данных, к которой была применена мутация.
- `table` ([String](/sql-reference/data-types/string.md)) — Имя таблицы, к которой была применена мутация.
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — Идентификатор мутации. Для реплицируемых таблиц эти идентификаторы соответствуют именам znode в каталоге `<table_path_in_clickhouse_keeper>/mutations/` в ClickHouse Keeper. Для нереплицируемых таблиц идентификаторы соответствуют именам файлов в каталоге данных таблицы.
- `command` ([String](/sql-reference/data-types/string.md)) — Строка команды мутации (часть запроса после `ALTER TABLE [db.]table`).
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время, когда команда мутации была отправлена на выполнение.
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Для мутаций реплицируемых таблиц массив содержит идентификаторы партиций (по одной записи для каждой партиции). Для мутаций нереплицируемых таблиц массив пуст.
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — Для мутаций реплицируемых таблиц массив содержит по одной записи для каждой партиции с номером блока, который был получен мутацией. В партиции будут изменены только те части, которые содержат блоки с номерами меньше этого значения. В нереплицируемых таблицах номера блоков во всех партициях образуют единую последовательность. Это означает, что для мутаций нереплицируемых таблиц столбец будет содержать одну запись с единственным номером блока, полученным мутацией.
- `parts_in_progress_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Массив имён частей данных, которые в данный момент находятся в процессе мутации.
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Массив имён частей данных, которые ещё необходимо изменить для завершения мутации.
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — Количество частей данных, которые ещё необходимо изменить для завершения мутации.
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — Показывает, была ли мутация принудительно остановлена. **Доступно только в ClickHouse Cloud.**

:::note 
`is_killed=1` не обязательно означает, что мутация полностью завершена. Возможно состояние, при котором мутация остаётся с `is_killed=1` и `is_done=0` в течение продолжительного времени. Это может происходить, если остановленную мутацию блокирует другая, долго выполняющаяся мутация. Это нормальная ситуация.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — Флаг, показывающий, завершена ли мутация. Возможные значения:
  - `1`, если мутация завершена,
  - `0`, если мутация всё ещё выполняется.

:::note
Даже если `parts_to_do = 0`, мутация реплицируемой таблицы может ещё не быть завершена из-за долго выполняющегося запроса `INSERT`, который создаст новую часть данных, подлежащую мутации.
:::

Если при мутации некоторых частей данных возникли проблемы, дополнительные сведения содержатся в следующих столбцах:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — Имя самой последней по времени части, которую не удалось изменить.
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время последнего сбоя при мутации части.
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — Сообщение исключения, вызвавшего последний сбой при мутации части.

## Мониторинг мутаций

Чтобы отслеживать ход выполнения мутаций в таблице `system.mutations`, используйте следующий запрос:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- или

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

Примечание: для этого требуются права на чтение таблиц `system.*`.

:::tip Cloud usage
В ClickHouse Cloud таблица `system.mutations` на каждом узле содержит все мутации в кластере, поэтому в `clusterAllReplicas` нет необходимости.
:::

**См. также**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* Движок таблицы [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)
* Семейство движков [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md)
