---
description: 'Системная таблица, содержащая информацию о мутациях таблиц MergeTree и их прогрессе. Каждая команда мутации представлена одной строкой.'
keywords: ['системная таблица', 'мутации']
slug: /operations/system-tables/mutations
title: 'system.mutations'
---


# system.mutations

Таблица содержит информацию о [мутациях](/sql-reference/statements/alter/index.md#mutations) таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и их прогрессе. Каждая команда мутации представлена одной строкой.

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — Имя базы данных, к которой применена мутация.

- `table` ([String](/sql-reference/data-types/string.md)) — Имя таблицы, к которой применена мутация.

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — ID мутации. Для реплицированных таблиц эти ID соответствуют именам znode в директории `<table_path_in_clickhouse_keeper>/mutations/` в ClickHouse Keeper. Для нереплицированных таблиц ID соответствуют именам файлов в директории данных таблицы.

- `command` ([String](/sql-reference/data-types/string.md)) — Строка команды мутации (часть запроса после `ALTER TABLE [db.]table`).

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время, когда команда мутации была отправлена на выполнение.

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Для мутаций реплицированных таблиц массив содержит ID разделов (одна запись для каждого раздела). Для мутаций нереплицированных таблиц массив пуст.

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — Для мутаций реплицированных таблиц массив содержит одну запись для каждого раздела с номером блока, полученным через мутацию. Только части, содержащие блоки с номерами, меньшими этого числа, будут мутированы в разделе.

    В нереплицированных таблицах номера блоков во всех разделах формируют единую последовательность. Это означает, что для мутаций нереплицированных таблиц колонка будет содержать одну запись с единственным номером блока, полученным через мутацию.

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — Массив имен частей данных, которые необходимо мутировать для завершения мутации.

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — Количество частей данных, которые необходимо мутировать для завершения мутации.

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — Указывает, была ли убита мутация. **Доступно только в ClickHouse Cloud.**

:::note 
`is_killed=1` не обязательно означает, что мутация полностью завершена. Возможно, что мутация остается в состоянии, когда `is_killed=1` и `is_done=0` в течение длительного времени. Это может произойти, если другая длительная мутация блокирует убитую мутацию. Это нормальная ситуация.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — Флаг, указывающий, завершена ли мутация или нет. Возможные значения:
    - `1`, если мутация завершена,
    - `0`, если мутация еще в процессе.

:::note
Даже если `parts_to_do = 0`, возможно, что мутация реплицированной таблицы еще не завершена из-за долгого запроса `INSERT`, который создаст новую часть данных, которую нужно мутировать.
:::

Если были проблемы с мутацией некоторых частей данных, следующие столбцы содержат дополнительную информацию:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — Имя последней части, которую не удалось мутировать.

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Дата и время последнего сбоя мутации части.

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — Сообщение исключения, которое вызвало последний сбой мутации части.

## Monitoring Mutations {#monitoring-mutations}

Чтобы отслеживать прогресс в таблице system.mutations, используйте запрос, подобный следующему - это требует разрешений на чтение в таблицах system.*:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
замените `tmp` в `table='tmp'` на имя таблицы, по которой вы проверяете мутации.
:::

**См. также**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- Движок таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)
- Семейство [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md)
