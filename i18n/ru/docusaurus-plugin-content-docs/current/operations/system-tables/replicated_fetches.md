---
slug: '/operations/system-tables/replicated_fetches'
description: 'Системная таблица, содержащая информацию о текущих фондах для выборки.'
title: system.replicated_fetches
keywords: ['системная таблица', 'replicated_fetches']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.replicated_fetches

<SystemTableCloud/>

Содержит информацию о текущих фоновых загрузках.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — Время, прошедшее (в секундах) с момента начала отображения текущих фоновых загрузок.

- `progress` ([Float64](../../sql-reference/data-types/float.md)) — Процент завершенной работы от 0 до 1.

- `result_part_name` ([String](../../sql-reference/data-types/string.md)) — Название части, которая будет сформирована в результате отображения текущих фоновых загрузок.

- `result_part_path` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к части, которая будет сформирована в результате отображения текущих фоновых загрузок.

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — ID партиции.

- `total_size_bytes_compressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер (в байтах) сжатых данных в результирующей части.

- `bytes_read_compressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество сжатых байтов, прочитанных из результирующей части.

- `source_replica_path` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к исходной реплике.

- `source_replica_hostname` ([String](../../sql-reference/data-types/string.md)) — Имя хоста исходной реплики.

- `source_replica_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Номер порта исходной реплики.

- `interserver_scheme` ([String](../../sql-reference/data-types/string.md)) — Название межсерверной схемы.

- `URI` ([String](../../sql-reference/data-types/string.md)) — Уникальный идентификатор ресурса.

- `to_detached` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, выполняется ли текущая фоновая загрузка с использованием выражения `TO DETACHED`.

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока.

**Пример**

```sql
SELECT * FROM system.replicated_fetches LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:                    default
table:                       t
elapsed:                     7.243039876
progress:                    0.41832135995612835
result_part_name:            all_0_0_0
result_part_path:            /var/lib/clickhouse/store/700/70080a04-b2de-4adf-9fa5-9ea210e81766/all_0_0_0/
partition_id:                all
total_size_bytes_compressed: 1052783726
bytes_read_compressed:       440401920
source_replica_path:         /clickhouse/test/t/replicas/1
source_replica_hostname:     node1
source_replica_port:         9009
interserver_scheme:          http
URI:                         http://node1:9009/?endpoint=DataPartsExchange%3A%2Fclickhouse%2Ftest%2Ft%2Freplicas%2F1&part=all_0_0_0&client_protocol_version=4&compress=false
to_detached:                 0
thread_id:                   54
```

**См. Также**

- [Управление таблицами ReplicatedMergeTree](../../sql-reference/statements/system.md/#managing-replicatedmergetree-tables)