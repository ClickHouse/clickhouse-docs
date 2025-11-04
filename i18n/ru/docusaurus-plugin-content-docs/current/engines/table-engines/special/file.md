---
slug: '/engines/table-engines/special/file'
sidebar_label: File
sidebar_position: 40
description: 'Движок таблиц File хранит данные в файле в одном из поддерживаемых'
title: 'Движок Таблицы File'
doc_type: reference
---
# Движок таблиц `File`

Движок таблиц File сохраняет данные в файле в одном из поддерживаемых [форматов файлов](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` и др.).

Сценарии использования:

- Экспорт данных из ClickHouse в файл.
- Преобразование данных из одного формата в другой.
- Обновление данных в ClickHouse путём редактирования файла на диске.

:::note
Этот движок в настоящее время недоступен в ClickHouse Cloud, пожалуйста, [используйте табличную функцию S3 вместо этого](/sql-reference/table-functions/s3.md).
:::

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
File(Format)
```

Параметр `Format` указывает один из доступных форматов файлов. Для выполнения запросов `SELECT` формат должен поддерживаться для ввода, а для выполнения запросов `INSERT` — для вывода. Доступные форматы перечислены в разделе [Форматы](/interfaces/formats#formats-overview).

ClickHouse не позволяет указывать путь к файловой системе для `File`. Он использует папку, определённую настройкой [path](../../../operations/server-configuration-parameters/settings.md) в конфигурации сервера.

При создании таблицы с использованием `File(Format)` она создаёт пустую подпапку в этой папке. Когда данные записываются в эту таблицу, они помещаются в файл `data.Format` в этой подпапке.

Вы можете вручную создать эту подпапку и файл в файловой системе сервера, а затем [ПРИКРЕПИТЬ](../../../sql-reference/statements/attach.md) его к информации о таблице с совпадающим именем, чтобы вы могли запрашивать данные из этого файла.

:::note
Будьте осторожны с этой функциональностью, так как ClickHouse не отслеживает внешние изменения таких файлов. Результат одновременных записей через ClickHouse и извне ClickHouse неопределён.
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

В [clickhouse-local](../../../operations/utilities/clickhouse-local.md) движок File принимает путь к файлу помимо `Format`. Потоки ввода/вывода по умолчанию могут быть указаны с использованием числовых или читаемых человеком названий, таких как `0` или `stdin`, `1` или `stdout`. Возможна работа с сжатыми файлами на основе дополнительного параметра движка или расширения файла (`gz`, `br` или `xz`).

**Пример:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## Детали реализации {#details-of-implementation}

- Несколько запросов `SELECT` могут выполняться одновременно, но запросы `INSERT` будут ждать друг друга.
- Поддерживается создание нового файла запросом `INSERT`.
- Если файл существует, `INSERT` добавит в него новые значения.
- Не поддерживается:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - Индексы
  - Репликация

## PARTITION BY {#partition-by}

`PARTITION BY` — необязательный. Возможно создание отдельных файлов путём партиционирования данных по ключу партиционирования. В большинстве случаев ключ партиционирования не нужен, и если он нужен, чаще всего не нужен ключ партиционирования более детальный, чем по месяцу. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детализированное партиционирование. Не партиционируйте свои данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это колонка с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций имеют формат `"YYYYMM"`.

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## Настройки {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - позволяет выбирать пустые данные из файла, который не существует. Отключено по умолчанию.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - позволяет обрезать файл перед вставкой в него. Отключено по умолчанию.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. Отключено по умолчанию.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - метод чтения данных из файла хранилища, один из: `read`, `pread`, `mmap`. Метод mmap не применяется к clickhouse-server (он предназначен для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local.