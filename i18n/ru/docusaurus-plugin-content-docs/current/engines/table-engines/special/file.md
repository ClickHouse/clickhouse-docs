---
description: 'Движок таблиц File хранит данные в файле в одном из поддерживаемых
  форматов файлов (`TabSeparated`, `Native` и т.д.).'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'Движок таблиц File'
---


# Движок таблиц File

Движок таблиц File хранит данные в файле в одном из поддерживаемых [форматов файлов](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` и т.д.).

Сценарии использования:

- Экспорт данных из ClickHouse в файл.
- Конвертация данных из одного формата в другой.
- Обновление данных в ClickHouse путем редактирования файла на диске.

:::note
Этот движок в настоящее время недоступен в ClickHouse Cloud, пожалуйста, [используйте вместо этого табличную функцию S3](/sql-reference/table-functions/s3.md).
:::

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
File(Format)
```

Параметр `Format` указывает один из доступных форматов файлов. Для выполнения
`SELECT` запросов формат должен поддерживаться для входных данных, а для выполнения
`INSERT` запросов – для выходных данных. Доступные форматы перечислены в разделе
[Форматы](/interfaces/formats#formats-overview).

ClickHouse не позволяет указывать путь к файловой системе для `File`. Он будет использовать папку, определенную в настройке [path](../../../operations/server-configuration-parameters/settings.md) в конфигурации сервера.

При создании таблицы с использованием `File(Format)` создается пустая подкаталог в этой папке. Когда данные записываются в эту таблицу, они помещаются в файл `data.Format` в этой подкаталоге.

Вы можете вручную создать эту подпапку и файл в файловой системе сервера, а затем [ПРИКРЕПИТЬ](../../../sql-reference/statements/attach.md) его к информации о таблице с совпадающим именем, чтобы вы могли запрашивать данные из этого файла.

:::note
Будьте осторожны с этой функциональностью, потому что ClickHouse не отслеживает внешние изменения таких файлов. Результат одновременных записей через ClickHouse и вне ClickHouse неопределен.
:::

## Пример {#example}

**1.** Настройте таблицу `file_engine_table`:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

По умолчанию ClickHouse создаст папку `/var/lib/clickhouse/data/default/file_engine_table`.

**2.** Вручную создайте `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated`, содержащий:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** Запросите данные:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## Использование в ClickHouse-local {#usage-in-clickhouse-local}

В [clickhouse-local](../../../operations/utilities/clickhouse-local.md) движок File принимает путь к файлу в дополнение к `Format`. Потоки ввода/вывода по умолчанию могут быть указаны с использованием числовых или человеко-читаемых имен, таких как `0` или `stdin`, `1` или `stdout`. Можно читать и записывать сжатые файлы в зависимости от дополнительного параметра движка или расширения файла (`gz`, `br` или `xz`).

**Пример:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## Подробности реализации {#details-of-implementation}

- Несколько запросов `SELECT` могут выполняться параллельно, но запросы `INSERT` будут ждать друг друга.
- Поддерживается создание нового файла с помощью запроса `INSERT`.
- Если файл существует, `INSERT` добавит новые значения в него.
- Не поддерживается:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - Индексы
    - Репликация

## PARTITION BY {#partition-by}

`PARTITION BY` — Опционально. Вы можете создать отдельные файлы, разделив данные по ключу раздела. В большинстве случаев вам не нужен ключ раздела, а если он нужен, то обычно не нужен ключ раздела более детализированный, чем по месяцу. Разделение не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детализированное разделение. Не разделяйте ваши данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении ORDER BY).

Для разделения по месяцу используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена разделов имеют формат `"YYYYMM"`.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## Настройки {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - позволяет выбирать пустые данные из файла, который не существует. По умолчанию отключено.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - позволяет обрезать файл перед вставкой в него. По умолчанию отключено.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - позволяет создать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключено.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - позволяет пропускать пустые файлы во время чтения. По умолчанию отключено.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - метод чтения данных из файла хранилища, один из: `read`, `pread`, `mmap`. Метод mmap не применяется к clickhouse-server (предназначен для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local.
