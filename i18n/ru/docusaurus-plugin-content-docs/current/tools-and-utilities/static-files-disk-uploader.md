---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'Предоставляет описание утилиты clickhouse-static-files-disk-uploader'
---


# clickhouse-static-files-disk-uploader

Выводит каталог данных, содержащий метаданные для заданной таблицы ClickHouse. Эти метаданные могут быть использованы для создания таблицы ClickHouse на другом сервере, содержащего набор данных только для чтения, поддерживаемый диском `web`.

Не используйте этот инструмент для миграции данных. Вместо этого используйте команды [`BACKUP` и `RESTORE`](/operations/backup).

## Использование {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## Команды {#commands}

|Команда|Описание|
|---|---|
|`-h`, `--help`|Выводит информацию о помощи|
|`--metadata-path [path]`|Путь, содержащий метаданные для заданной таблицы|
|`--test-mode`|Включает режим `test`, который отправляет запрос PUT по указанному URL с метаданными таблицы|
|`--link`|Создает символьные ссылки вместо копирования файлов в выходной каталог|
|`--url [url]`|URL веб-сервера для режима `test`|
|`--output-dir [dir]`|Каталог для вывода файлов в `non-test` режиме|

## Получение пути к метаданным для заданной таблицы {#retrieve-metadata-path-for-the-specified-table}

При использовании `clickhouse-static-files-disk-uploader` вы должны получить путь к метаданным для желаемой таблицы.

1. Выполните следующий запрос, указав вашу целевую таблицу и базу данных:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. Это должно вернуть путь к каталогу данных для заданной таблицы:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## Вывод каталога метаданных таблицы в локальную файловую систему {#output-table-metadata-directory-to-the-local-filesystem}

Используя целевой выходной каталог `output` и заданный путь к метаданным, выполните следующую команду:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

Если успешно, вы должны увидеть следующее сообщение, и каталог `output` должен содержать метаданные для заданной таблицы:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## Вывод каталога метаданных таблицы на внешний URL {#output-table-metadata-directory-to-an-external-url}

Этот шаг похож на вывод каталога данных в локальную файловую систему, но с добавлением флага `--test-mode`. Вместо указания выходного каталога вы должны указать целевой URL через флаг `--url`.

С включенным режимом `test` каталог метаданных таблицы загружается на указанный URL через запрос PUT.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## Использование каталога метаданных таблицы для создания таблицы ClickHouse {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

После того как у вас есть каталог метаданных таблицы, вы можете использовать его для создания таблицы ClickHouse на другом сервере.

Пожалуйста, смотрите [этот репозиторий GitHub](https://github.com/ClickHouse/web-tables-demo), демонстрирующий пример. В примере мы создаем таблицу, используя диск `web`, который позволяет нам прикрепить таблицу к набору данных на другом сервере.
