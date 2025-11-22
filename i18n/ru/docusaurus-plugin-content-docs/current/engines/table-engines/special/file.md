---
description: 'Движок таблицы File хранит данные в файле в одном из поддерживаемых форматов (`TabSeparated`, `Native` и т. д.).'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'Движок таблицы File'
doc_type: 'reference'
---



# Движок таблицы File

Движок таблицы File хранит данные в файле в одном из поддерживаемых [форматов файлов](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` и т. д.).

Сценарии использования:

- Экспорт данных из ClickHouse в файл.
- Преобразование данных из одного формата в другой.
- Обновление данных в ClickHouse посредством редактирования файла на диске.

:::note
В настоящее время этот движок недоступен в ClickHouse Cloud, вместо него [используйте табличную функцию S3](/sql-reference/table-functions/s3.md).
:::



## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
File(Format)
```

Параметр `Format` указывает один из доступных форматов файлов. Для выполнения
запросов `SELECT` формат должен поддерживать ввод данных, а для выполнения
запросов `INSERT` — вывод данных. Доступные форматы перечислены в разделе
[Форматы](/interfaces/formats#formats-overview).

ClickHouse не позволяет указывать путь в файловой системе для `File`. Используется папка, определённая параметром [path](../../../operations/server-configuration-parameters/settings.md) в конфигурации сервера.

При создании таблицы с помощью `File(Format)` в этой папке создаётся пустой подкаталог. Когда данные записываются в таблицу, они помещаются в файл `data.Format` в этом подкаталоге.

Вы можете вручную создать этот подкаталог и файл в файловой системе сервера, а затем [присоединить](../../../sql-reference/statements/attach.md) их к таблице с соответствующим именем, чтобы можно было запрашивать данные из этого файла.

:::note
Будьте осторожны с этой функциональностью, поскольку ClickHouse не отслеживает внешние изменения в таких файлах. Результат одновременной записи через ClickHouse и вне ClickHouse не определён.
:::


## Пример {#example}

**1.** Создайте таблицу `file_engine_table`:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

По умолчанию ClickHouse создаст директорию `/var/lib/clickhouse/data/default/file_engine_table`.

**2.** Вручную создайте файл `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` со следующим содержимым:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** Выполните запрос данных:

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

В [clickhouse-local](../../../operations/utilities/clickhouse-local.md) движок File принимает путь к файлу в дополнение к параметру `Format`. Стандартные потоки ввода/вывода можно указать, используя числовые или понятные имена, такие как `0` или `stdin`, `1` или `stdout`. Возможно чтение и запись сжатых файлов на основе дополнительного параметра движка или расширения файла (`gz`, `br` или `xz`).

**Пример:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```


## Детали реализации {#details-of-implementation}

- Несколько запросов `SELECT` могут выполняться одновременно, но запросы `INSERT` будут ожидать друг друга.
- Поддерживается создание нового файла запросом `INSERT`.
- Если файл существует, `INSERT` добавляет в него новые значения.
- Не поддерживается:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - Индексы
  - Репликация


## PARTITION BY {#partition-by}

`PARTITION BY` — необязательный параметр. Позволяет создавать отдельные файлы путём разбиения данных по ключу партиционирования. В большинстве случаев ключ партиционирования не требуется, а если он необходим, то обычно достаточно партиционирования по месяцам. Партиционирование не ускоряет выполнение запросов (в отличие от выражения ORDER BY). Не следует использовать слишком детальное партиционирование. Не разбивайте данные по идентификаторам или именам клиентов (вместо этого укажите идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.


## Настройки {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) — позволяет выбирать пустые данные из несуществующего файла. По умолчанию отключена.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) — позволяет очищать файл перед вставкой данных. По умолчанию отключена.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) — позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключена.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключена.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) — метод чтения данных из файла хранилища, один из: `read`, `pread`, `mmap`. Метод mmap не применяется к clickhouse-server (он предназначен для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local.
