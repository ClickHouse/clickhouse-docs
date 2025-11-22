---
description: 'Системная таблица, содержащая записи журнала с информацией о различных операциях blob-хранилища, таких как загрузки и удаления.'
keywords: ['system table', 'blob_storage_log']
slug: /operations/system-tables/blob_storage_log
title: 'system.blob_storage_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

Содержит записи журнала с информацией о различных операциях с blob‑хранилищем, таких как загрузка и удаление объектов.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с точностью до микросекунд.
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип события. Возможные значения:
  * `'Upload'`
  * `'Delete'`
  * `'MultiPartUploadCreate'`
  * `'MultiPartUploadWrite'`
  * `'MultiPartUploadComplete'`
  * `'MultiPartUploadAbort'`
* `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса, связанного с событием, если он есть.
* `thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Идентификатор потока, выполняющего операцию.
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — Имя потока, выполняющего операцию.
* `disk_name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Имя связанного диска.
* `bucket` ([String](../../sql-reference/data-types/string.md)) — Имя бакета.
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — Путь к удалённому ресурсу.
* `local_path` ([String](../../sql-reference/data-types/string.md)) — Путь к файлу метаданных в локальной системе, который ссылается на удалённый ресурс.
* `data_size` ([UInt32](/sql-reference/data-types/int-uint#integer-ranges)) — Размер данных, задействованных в событии загрузки.
* `error` ([String](../../sql-reference/data-types/string.md)) — Сообщение об ошибке, связанное с событием, если оно есть.

**Пример**

Предположим, выполняется операция загрузки файла в blob‑хранилище, и событие записывается в журнал:

```sql
SELECT * FROM system.blob_storage_log WHERE query_id = '7afe0450-504d-4e4b-9a80-cd9826047972' ORDER BY event_date, event_time_microseconds \G
```

```text
Строка 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-10-31
event_time:              2023-10-31 16:03:40
event_time_microseconds: 2023-10-31 16:03:40.481437
event_type:              Upload
query_id:                7afe0450-504d-4e4b-9a80-cd9826047972
thread_id:               2381740
disk_name:               disk_s3
bucket:                  bucket1
remote_path:             rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe
local_path:              store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt
data_size:               259
error:
```

В этом примере операция загрузки была связана с запросом `INSERT` с идентификатором `7afe0450-504d-4e4b-9a80-cd9826047972`. Локальный файл метаданных `store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt` ссылается на удалённый путь `rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe` в бакете `bucket1` на диске `disk_s3`, при этом его размер составляет 259 байт.

**См. также**

* [Внешние диски для хранения данных](../../operations/storing-data.md)
