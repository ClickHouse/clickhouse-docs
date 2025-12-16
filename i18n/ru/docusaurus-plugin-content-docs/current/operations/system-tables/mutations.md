---
description: 'Системная таблица, содержащая информацию о мутациях таблиц MergeTree
  и ходе их выполнения. Каждая команда мутации представлена одной строкой.'
keywords: ['system table', 'mutations']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations {#systemmutations}

Эта таблица содержит информацию о [мутациях](/sql-reference/statements/alter/index.md#mutations) таблиц семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и прогрессе их выполнения. Каждая операция мутации представлена одной строкой.

## Столбцы {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — Имя базы данных, к которой применена мутация.
- `table` ([String](/sql-reference/data-types/string.md)) — Имя таблицы, к которой применена мутация.
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — Идентификатор мутации. Для реплицируемых таблиц эти идентификаторы соответствуют именам znode в каталоге `<table_path_in_clickhouse_keeper>/mutations/` в ClickHouse Keeper. Для нереплицируемых таблиц идентификаторы соответствуют именам файлов в каталоге данных таблицы.
- `command` ([String](/sql-reference/data-types/string.md)) — Строка команды мутации (часть запроса после `ALTER TABLE [db.]table`).
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время отправки команды мутации на выполнение.
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Для мутаций реплицируемых таблиц массив содержит идентификаторы партиций (одна запись для каждой партиции). Для мутаций нереплицируемых таблиц массив пуст.
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — Для мутаций реплицируемых таблиц массив содержит одну запись для каждой партиции с номером блока, полученным мутацией. В партиции будут мутированы только куски, содержащие блоки с номерами меньше этого номера. В нереплицируемых таблицах номера блоков во всех партициях образуют единую последовательность. Это означает, что для мутаций нереплицируемых таблиц столбец будет содержать одну запись с единственным номером блока, полученным мутацией.
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Массив имён кусков данных, которые необходимо мутировать для завершения мутации.
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — Количество кусков данных, которые необходимо мутировать для завершения мутации.
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — Указывает, была ли мутация прервана. **Доступно только в ClickHouse Cloud.**

:::note
`is_killed=1` не обязательно означает, что мутация полностью завершена. Мутация может оставаться в состоянии, где `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая долго выполняющаяся мутация блокирует прерванную мутацию. Это нормальная ситуация.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — Флаг, указывающий, завершена ли мутация. Возможные значения:
  - `1` — мутация завершена,
  - `0` — мутация всё ещё выполняется.

:::note
Даже если `parts_to_do = 0`, возможно, что мутация реплицируемой таблицы ещё не завершена из-за долго выполняющегося запроса `INSERT`, который создаст новый кусок данных, требующий мутации.
:::

Если возникли проблемы с мутацией некоторых кусков данных, следующие столбцы содержат дополнительную информацию:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — Имя последнего куска, который не удалось мутировать.
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время последнего сбоя мутации куска.
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — Сообщение об исключении, вызвавшем последний сбой мутации куска.

## Мониторинг мутаций {#monitoring-mutations}

Для отслеживания прогресса мутаций в таблице `system.mutations` используйте следующий запрос:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- or

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

Примечание: для этого требуются права на чтение таблиц `system.*`.

:::tip Использование в Cloud
В ClickHouse Cloud таблица `system.mutations` на каждом узле содержит все мутации кластера, поэтому использование `clusterAllReplicas` не требуется.
:::

**См. также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- Движок таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)
- Семейство [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md)
