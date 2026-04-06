---
description: 'Системная таблица, содержащая информацию о файлах данных, хранящихся на удалённых
  дисках, таких как S3 или Azure Blob Storage.'
keywords: ['системная таблица', 'remote_data_paths']
slug: /operations/system-tables/remote_data_paths
title: 'system.remote_data_paths'
doc_type: 'reference'
---

Содержит информацию о файлах данных, хранящихся на удалённых дисках (например, S3, Azure Blob Storage), включая соответствие между путями локальных метаданных и путями удалённых blob-объектов.

Каждая строка представляет один удалённый blob-объект, связанный с файлом данных.

Столбцы:

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — Имя удалённого диска, заданное в конфигурации хранения.
* `path` ([String](../../sql-reference/data-types/string.md)) — Корневой путь удалённого диска, настроенный в конфигурации хранения.
* `cache_base_path` ([String](../../sql-reference/data-types/string.md)) — Базовый каталог для файлов кэша, связанных с удалённым диском.
* `local_path` ([String](../../sql-reference/data-types/string.md)) — Путь к локальному файлу метаданных относительно каталога данных ClickHouse, указывающий на файл, который соответствует удалённому blob-объекту.
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — Путь blob-объекта в удалённом объектном хранилище, которому соответствует локальный файл метаданных.
* `size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Сжатый размер файла в байтах.
* `common_prefix_for_blobs` ([String](../../sql-reference/data-types/string.md)) — Общий префикс для blob-объектов в удалённом объектном хранилище; применяется, когда несколько blob-объектов имеют общий префикс пути.
* `cache_paths` ([Array(String)](../../sql-reference/data-types/array.md)) — Пути к локальным файлам кэша, соответствующим удалённому blob-объекту.

**Настройки**

* [`traverse_shadow_remote_data_paths`](../../operations/settings/settings.md#traverse_shadow_remote_data_paths) — Если параметр включён, таблица также включает данные из замороженных партиций (каталог `shadow/`, используемый командой `ALTER TABLE ... FREEZE`). Отключено по умолчанию.

**Пример**

```sql
SELECT * FROM system.remote_data_paths LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
disk_name:              s3
path:                   /var/lib/clickhouse/disks/s3/
cache_base_path:        /var/lib/clickhouse/disks/s3_cache/
local_path:             store/123/1234abcd-1234-1234-1234-1234abcd1234/all_0_0_0/data.bin
remote_path:            abc123/all_0_0_0/data.bin
size:                   1048576
common_prefix_for_blobs:
cache_paths:            ['/var/lib/clickhouse/disks/s3_cache/a1/b2/c3d4e5f6']
```

**См. также**

* [Использование внешнего хранилища для хранения данных](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-s3)
* [Настройка внешнего хранилища](/operations/storing-data.md/#configuring-external-storage)
* [system.disks](../../operations/system-tables/disks.md)
