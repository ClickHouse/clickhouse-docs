---
description: "Системная таблица, содержащая информацию о мутациях таблиц MergeTree и их прогрессе. Каждая команда мутации представлена одной строкой."
slug: /operations/system-tables/mutations
title: "system.mutations"
keywords: ['системная таблица', 'мутации']
---

Таблица содержит информацию о [мутациях](/sql-reference/statements/alter/index.md#mutations) таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и их прогрессе. Каждая команда мутации представлена одной строкой.

## Колонки: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — Имя базы данных, к которой была применена мутация.

- `table` ([String](/sql-reference/data-types/string.md)) — Имя таблицы, к которой была применена мутация.

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — Идентификатор мутации. Для реплицированных таблиц эти идентификаторы соответствуют именам узлов в директории `<table_path_in_clickhouse_keeper>/mutations/` в ClickHouse Keeper. Для нереплицированных таблиц идентификаторы соответствуют именам файлов в директории данных таблицы.

- `command` ([String](/sql-reference/data-types/string.md)) — Строка команды мутации (часть запроса после `ALTER TABLE [db.]table`).

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время, когда команда мутации была отправлена на выполнение.

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Для мутаций реплицированных таблиц массив содержит идентификаторы партиций (одна запись для каждой партиции). Для мутаций нереплицированных таблиц массив пуст.

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — Для мутаций реплицированных таблиц массив содержит одну запись для каждой партиции с номером блока, который был занят мутацией. Только части, которые содержат блоки с номерами, меньшими чем этот номер, будут мутированы в партиции.

    В нереплицированных таблицах номера блоков во всех партициях образуют единую последовательность. Это означает, что для мутаций нереплицированных таблиц колонка будет содержать одну запись с единственным номером блока, занятого мутацией.

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Массив имен частей данных, которые нужно мутировать для завершения мутации.

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — Количество частей данных, которые нужно мутировать для завершения мутации.

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — Указывает, была ли мутация отменена. **Доступно только в ClickHouse Cloud.**

:::note 
`is_killed=1` не обязательно означает, что мутация полностью завершена. Возможно, мутация останется в состоянии, когда `is_killed=1` и `is_done=0` в течение продолжительного времени. Это может произойти, если другая длительная мутация блокирует убитую мутацию. Это нормальная ситуация.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — Флаг, указывающий, завершена ли мутация или нет. Возможные значения:
    - `1`, если мутация завершена,
    - `0`, если мутация все еще в процессе.

:::note
Даже если `parts_to_do = 0`, возможно, что мутация реплицированной таблицы еще не завершена из-за длительного запроса `INSERT`, который создаст новую часть данных, необходимую для мутации.
:::

Если возникли проблемы с мутацией некоторых частей данных, следующие колонки содержат дополнительную информацию:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — Имя самой последней части, которую не удалось мутировать.

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время последнего сбоя мутации части.

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — Сообщение об исключении, которое вызвало последний сбой мутации части.

## Мониторинг мутаций {#monitoring-mutations}

Чтобы отслеживать прогресс таблицы system.mutations, используйте запрос, подобный следующему — это требует прав на чтение таблиц system.*:

``` sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
Замените `tmp` в `table='tmp'` на имя таблицы, для которой вы проверяете мутации.
:::

**См. также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- Табличный движок [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)
- Семейство [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md)
