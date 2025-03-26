---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'Предоставляет описание утилиты clickhouse-static-files-disk-uploader'
---


# clickhouse-static-files-disk-uploader

Выводит каталог данных, содержащий метаданные для указанной таблицы ClickHouse. Эти метаданные могут быть использованы для создания таблицы ClickHouse на другом сервере, содержащей набор данных только для чтения, основанный на диске `web`.

Не используйте этот инструмент для миграции данных. Вместо этого используйте [`BACKUP` и `RESTORE` команды](/operations/backup).

## Использование {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## Команды {#commands}

|Команда|Описание|
|---|---|
|`-h`, `--help`|Выводит справочную информацию|
|`--metadata-path [path]`|Путь к метаданным для указанной таблицы|
|`--test-mode`|Включает режим `test`, который отправляет PUT-запрос по указанному URL с метаданными таблицы|
|`--link`|Создает символические ссылки вместо копирования файлов в выходной каталог|
|`--url [url]`|URL веб-сервера для режима `test`|
|`--output-dir [dir]`|Каталог для вывода файлов в режиме `non-test`|

## Получение пути к метаданным для указанной таблицы {#retrieve-metadata-path-for-the-specified-table}

При использовании `clickhouse-static-files-disk-uploader` вы должны получить путь к метаданным для вашей желаемой таблицы.

1. Выполните следующий запрос, указывая вашу целевую таблицу и базу данных:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. Это должно вернуть путь к каталогу данных для указанной таблицы:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## Вывод метаданных таблицы в локальную файловую систему {#output-table-metadata-directory-to-the-local-filesystem}

Используя целевой выходной каталог `output` и указанный путь к метаданным, выполните следующую команду:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

Если команда выполнена успешно, вы должны увидеть следующее сообщение, и каталог `output` должен содержать метаданные для указанной таблицы:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## Вывод метаданных таблицы на внешний URL {#output-table-metadata-directory-to-an-external-url}

Этот шаг аналогичен выводу каталога данных в локальную файловую систему, но с добавлением флага `--test-mode`. Вместо указания выходного каталога вы должны указать целевой URL с помощью флага `--url`.

С включенным режимом `test` каталог метаданных таблицы загружается на указанный URL с помощью PUT-запроса.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## Использование каталога метаданных таблицы для создания таблицы ClickHouse {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

Когда у вас есть каталог метаданных таблицы, вы можете использовать его для создания таблицы ClickHouse на другом сервере.

Пожалуйста, посмотрите [этот репозиторий на GitHub](https://github.com/ClickHouse/web-tables-demo), где показан демонстрационный пример. В примере мы создаем таблицу с использованием диска `web`, который позволяет нам подключить таблицу к набору данных на другом сервере.
