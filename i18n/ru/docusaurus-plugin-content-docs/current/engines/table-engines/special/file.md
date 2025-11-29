---
description: 'Табличный движок File хранит данные в файле в одном из поддерживаемых
  форматов (`TabSeparated`, `Native` и т. д.).'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'Табличный движок File'
doc_type: 'reference'
---



# Движок таблицы File {#file-table-engine}

Движок таблицы File хранит данные в файле в одном из поддерживаемых [форматов файлов](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` и т. д.).

Сценарии использования:

- Экспорт данных из ClickHouse в файл.
- Преобразование данных из одного формата в другой.
- Обновление данных в ClickHouse путём редактирования файла на диске.

:::note
Этот движок в настоящее время недоступен в ClickHouse Cloud, пожалуйста, [используйте вместо него табличную функцию S3](/sql-reference/table-functions/s3.md).
:::



## Использование на сервере ClickHouse {#usage-in-clickhouse-server}

```sql
File(Format)
```

Параметр `Format` задаёт один из доступных форматов файлов. Для выполнения
запросов `SELECT` формат должен поддерживать чтение (input), а для выполнения
запросов `INSERT` — запись (output). Доступные форматы перечислены в разделе
[Formats](/interfaces/formats#formats-overview).

ClickHouse не позволяет указывать путь в файловой системе для `File`. Будет использована папка, определённая настройкой [path](../../../operations/server-configuration-parameters/settings.md) в конфигурации сервера.

При создании таблицы с использованием `File(Format)` в этой папке создаётся пустая поддиректория. Когда данные записываются в эту таблицу, они помещаются в файл `data.Format` в этой поддиректории.

Вы можете вручную создать эту поддиректорию и файл в файловой системе сервера, а затем [ATTACH](../../../sql-reference/statements/attach.md) их к информации о таблице с совпадающим именем, чтобы иметь возможность выполнять запросы к данным в этом файле.

:::note
Будьте осторожны с этой функциональностью, так как ClickHouse не отслеживает внешние изменения таких файлов. Результат одновременной записи через ClickHouse и вне ClickHouse неопределён.
:::


## Пример {#example}

**1.** Настройте таблицу `file_engine_table`:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

По умолчанию ClickHouse создаст папку `/var/lib/clickhouse/data/default/file_engine_table`.

**2.** Вручную создайте файл `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` со следующим содержимым:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** Выполните запрос к данным:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## Использование в clickhouse-local {#usage-in-clickhouse-local}

В [clickhouse-local](../../../operations/utilities/clickhouse-local.md) движок File, помимо параметра `Format`, принимает путь к файлу. Потоки ввода/вывода по умолчанию можно указывать с помощью числовых или понятных имён, таких как `0` или `stdin`, `1` или `stdout`. Можно читать и записывать сжатые файлы, исходя из дополнительного параметра движка или расширения файла (`gz`, `br` или `xz`).

**Пример:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```


## Подробности реализации {#details-of-implementation}

- Несколько запросов `SELECT` могут выполняться одновременно, но запросы `INSERT` выполняются последовательно.
- Поддерживается создание нового файла с помощью запроса `INSERT`.
- Если файл существует, `INSERT` будет дописывать в него новые значения.
- Не поддерживаются:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - Индексы
  - Репликация



## PARTITION BY {#partition-by}

`PARTITION BY` — необязательное выражение. Можно создавать отдельные файлы, разбивая данные на партиции по ключу партиционирования (partition key). В большинстве случаев ключ партиционирования не нужен, а если он и требуется, как правило, нет необходимости делать его более детализированным, чем до уровня месяца. Партиционирование не ускоряет выполнение запросов (в отличие от выражения ORDER BY). Никогда не используйте слишком мелкое партиционирование. Не разделяйте данные на партиции по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа данных [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.



## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.



## Настройки {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) — позволяет выполнять выборку из несуществующего файла, возвращая пустой набор данных. По умолчанию отключена.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) — позволяет усекать файл перед вставкой в него данных. По умолчанию отключена.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) — позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключена.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключена.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) — метод чтения данных из файла хранилища, один из: `read`, `pread`, `mmap`. Метод `mmap` не применяется к clickhouse-server (предназначен для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local.
