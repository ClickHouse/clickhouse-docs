---
slug: /engines/table-engines/special/file
sidebar_position: 40
sidebar_label:  Файл
title: "Двигатель таблиц Файл"
description: "Двигатель таблиц Файл хранит данные в файле в одном из поддерживаемых форматов файлов (`TabSeparated`, `Native` и т.д.)."
---


# Двигатель таблиц Файл

Двигатель таблиц Файл хранит данные в файле в одном из поддерживаемых [форматов файлов](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` и т.д.).

Сценарии использования:

- Экспорт данных из ClickHouse в файл.
- Преобразование данных из одного формата в другой.
- Обновление данных в ClickHouse путем редактирования файла на диске.

:::note
Этот механизм в настоящее время недоступен в ClickHouse Cloud, пожалуйста, [используйте функцию таблицы S3 вместо этого](/sql-reference/table-functions/s3.md).
:::

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

``` sql
File(Format)
```

Параметр `Format` указывает один из доступных форматов файлов. Для выполнения
`SELECT` запросов формат должен поддерживаться для ввода, а для выполнения
`INSERT` запросов – для вывода. Доступные форматы перечислены в разделе
[Форматы](/interfaces/formats#formats-overview).

ClickHouse не позволяет указывать путь файловой системы для `File`. Он будет использовать папку, определенную настройкой [path](../../../operations/server-configuration-parameters/settings.md) в конфигурации сервера.

При создании таблицы с использованием `File(Format)` создается пустая подкаталог в этой папке. Когда данные записываются в эту таблицу, они помещаются в файл `data.Format` в этой подкаталоге.

Вы можете вручную создать эту подкаталог и файл в файловой системе сервера, а затем [ПРИКРЕПИТЬ](../../../sql-reference/statements/attach.md) его к информации о таблице с соответствующим именем, чтобы вы могли выполнять запросы к данным из этого файла.

:::note
Будьте осторожны с этой функциональностью, так как ClickHouse не отслеживает внешние изменения таких файлов. Результат одновременных записей через ClickHouse и вне ClickHouse неопределен.
:::

## Пример {#example}

**1.** Настройте таблицу `file_engine_table`:

``` sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

По умолчанию ClickHouse создаст папку `/var/lib/clickhouse/data/default/file_engine_table`.

**2.** Вручную создайте файл `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` с содержимым:

``` bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** Выполните запрос к данным:

``` sql
SELECT * FROM file_engine_table
```

``` text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## Использование в ClickHouse-local {#usage-in-clickhouse-local}

В [clickhouse-local](../../../operations/utilities/clickhouse-local.md) механизм File принимает путь к файлу в дополнение к `Format`. Входные/выходные потоки могут быть указаны с помощью числовых или понятных имен, таких как `0` или `stdin`, `1` или `stdout`. Возможна работа с сжатыми файлами на основе дополнительного параметра механизма или расширения файла (`gz`, `br` или `xz`).

**Пример:**

``` bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## Подробности реализации {#details-of-implementation}

- Несколько запросов `SELECT` могут выполняться одновременно, но запросы `INSERT` будут ждать друг друга.
- Поддерживается создание нового файла с помощью запроса `INSERT`.
- Если файл существует, `INSERT` добавит новые значения в него.
- Не поддерживаются:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - Индексы
    - Репликация

## PARTITION BY {#partition-by}

`PARTITION BY` — необязательно. Можно создать отдельные файлы путем разделения данных по ключу партиции. В большинстве случаев ключ партиции не нужен, и если он нужен, вам, как правило, не нужен ключ партиции более детализированный, чем по месяцу. Разделение не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детализированное разбиение. Не разбивайте данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первой колонкой в выражении ORDER BY).

Для разделения по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` – это колонка с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций здесь имеют формат `"YYYYMM"`.

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение `NULL`.

## Настройки {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - позволяет выбирать пустые данные из несуществующего файла. Отключено по умолчанию.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - позволяет усекать файл перед вставкой в него. Отключено по умолчанию.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. Отключено по умолчанию.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - метод чтения данных из файла хранения, один из: `read`, `pread`, `mmap`. Метод mmap не применяется к clickhouse-server (он предназначен для clickhouse-local). Значение по умолчанию: `pread` для clickhouse-server, `mmap` для clickhouse-local.
