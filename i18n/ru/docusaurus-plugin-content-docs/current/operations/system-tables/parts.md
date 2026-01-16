---
description: 'Системная таблица, содержащая информацию о частях таблиц MergeTree'
keywords: ['системная таблица', 'части']
slug: /operations/system-tables/parts
title: 'system.parts'
doc_type: 'reference'
---

# system.parts \\{#systemparts\\}

Содержит информацию о частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Каждая строка описывает одну часть данных.

Столбцы:

* `partition` ([String](../../sql-reference/data-types/string.md)) – Имя партиции. Чтобы узнать, что такое партиция, см. описание запроса [ALTER](/sql-reference/statements/alter).

  Форматы:

  * `YYYYMM` для автоматического партиционирования по месяцам.
  * `any_string` при ручном партиционировании.

* `name` ([String](../../sql-reference/data-types/string.md)) – Имя части данных. Структура имени части может использоваться для определения многих аспектов данных, приёма и шаблонов слияния. Формат имени части следующий:

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* Определения:
  * `partition_id` — идентификатор ключа партиционирования
  * `minimum_block_number` — минимальный номер блока в части. ClickHouse всегда объединяет последовательные блоки
  * `maximum_block_number` — максимальный номер блока в части
  * `level` — увеличивается на единицу при каждом дополнительном объединении части. Уровень 0 означает, что это новая часть, которая ещё не была объединена. Важно помнить, что все части в ClickHouse всегда неизменяемы
  * `data_version` — необязательное значение, увеличивается, когда часть изменяется (при этом изменённые данные всегда записываются только в новую часть, так как части неизменяемы)

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID части данных.

* `part_type` ([String](../../sql-reference/data-types/string.md)) — Формат хранения части данных.

  Допустимые значения:

  * `Wide` — Каждый столбец хранится в отдельном файле в файловой системе.
  * `Compact` — Все столбцы хранятся в одном файле в файловой системе.

    Формат хранения данных определяется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` для таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – Флаг, показывающий, активна ли часть данных. Если часть данных активна, она используется в таблице. В противном случае она удаляется. Неактивные части данных остаются после слияния.

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – количество меток. Чтобы получить примерное количество строк в части данных, умножьте `marks` на гранулярность индекса (обычно 8192) (эта оценка не работает для адаптивной гранулярности).

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Количество строк.

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер всех файлов частей данных в байтах.

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер сжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер несжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объем памяти (в байтах), используемый значениями первичного ключа в файле primary.idx/cidx на диске.

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – размер файла меток.

* `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – общий размер сжатых данных вторичных индексов в части данных. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер несжатых данных для вторичных индексов в части данных. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Размер файла с метками для вторичных индексов.

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – Время изменения каталога с частью данных. Обычно соответствует времени создания части данных.

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – время, когда часть данных стала неактивной.

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – Количество мест, в которых используется часть данных. Значение больше 2 указывает, что часть данных используется в запросах или слияниях.

* `min_date` ([Date](../../sql-reference/data-types/date.md)) – минимальное значение ключа даты в части данных.

* `max_date` ([Date](../../sql-reference/data-types/date.md)) – максимальное значение ключа даты в части данных.

* `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – минимальное значение ключа даты и времени в части данных.

* `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – максимальное значение ключа даты и времени в части данных.

* `partition_id` ([String](../../sql-reference/data-types/string.md)) – идентификатор партиции.

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – минимальный номер блока данных, который входит в состав текущей части после слияния.

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Максимальный номер блока данных, входящего в состав текущей части после слияния.

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – Глубина дерева MergeTree. Ноль означает, что текущая часть была создана операцией INSERT, а не в результате слияния других частей.

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – число, которое используется для определения, какие мутации следует применить к части данных (мутации с версией, большей, чем `data_version`).

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объём памяти (в байтах), занимаемый значениями первичного ключа (будет равен `0` при `primary_key_lazy_load=1` и `use_primary_key_cache=1`).

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объем памяти (в байтах), зарезервированный для значений первичного ключа (будет `0` при `primary_key_lazy_load=1` и `use_primary_key_cache=1`).

* `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – Флаг, показывающий, что существует резервная копия данных партиции. 1 — резервная копия существует. 0 — резервная копия не существует. Подробнее см. в разделе [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)

* `database` ([String](../../sql-reference/data-types/string.md)) – имя базы данных.

* `table` ([String](../../sql-reference/data-types/string.md)) – имя таблицы.

* `engine` ([String](../../sql-reference/data-types/string.md)) – Имя движка таблицы без параметров.

* `path` ([String](../../sql-reference/data-types/string.md)) – Абсолютный путь к каталогу с файлами частей данных.

* `disk_name` ([String](../../sql-reference/data-types/string.md)) – Имя диска, на котором хранится часть данных.

* `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – значение [sipHash128](/sql-reference/functions/hash-functions#sipHash128) от сжатых файлов.

* `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) от несжатых файлов (файлов с метками, файла индекса и т. д.).

* `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – значение [sipHash128](/sql-reference/functions/hash-functions#sipHash128) данных в сжатых файлах, вычисленное так, как если бы они были несжаты.

* `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — минимальное значение ключа даты и времени для [правила TTL DELETE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

* `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — максимальное значение ключа даты и времени для [правила TTL DELETE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

* `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — массив выражений. Каждое выражение определяет [правило TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

:::note
Массив `move_ttl_info.expression` в основном сохраняется для обратной совместимости, а сейчас самый простой способ проверить правило `TTL MOVE` — использовать поля `move_ttl_info.min` и `move_ttl_info.max`.
:::

* `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Массив значений даты и времени. Каждый элемент задаёт минимальное значение ключа для [правила TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

* `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Массив значений даты и времени. Каждый элемент задаёт максимальное значение ключа для [правила TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Псевдоним для `bytes_on_disk`.

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Псевдоним для `marks_bytes`.

**Пример**

```sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_4_1_6
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  6
bytes_on_disk:                         310
data_compressed_bytes:                 157
data_uncompressed_bytes:               91
secondary_indices_compressed_bytes:    58
secondary_indices_uncompressed_bytes:  6
secondary_indices_marks_bytes:         48
marks_bytes:                           144
modification_time:                     2020-06-18 13:01:49
remove_time:                           1970-01-01 00:00:00
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
min_time:                              1970-01-01 00:00:00
max_time:                              1970-01-01 00:00:00
partition_id:                          all
min_block_number:                      1
max_block_number:                      4
level:                                 1
data_version:                          6
primary_key_bytes_in_memory:           8
primary_key_bytes_in_memory_allocated: 64
is_frozen:                             0
database:                              default
table:                                 months
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/months/all_1_4_1_6/
hash_of_all_files:                     2d0657a16d9430824d35e327fcbd87bf
hash_of_uncompressed_files:            84950cc30ba867c77a408ae21332ba29
uncompressed_hash_of_compressed_files: 1ad78f1c6843bbfb99a2c931abe7df7d
delete_ttl_info_min:                   1970-01-01 00:00:00
delete_ttl_info_max:                   1970-01-01 00:00:00
move_ttl_info.expression:              []
move_ttl_info.min:                     []
move_ttl_info.max:                     []
```

**См. также**

* [Семейство движков MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)
* [TTL для столбцов и таблиц](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
