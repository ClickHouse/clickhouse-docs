---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'Описание утилиты clickhouse-static-files-disk-uploader'
doc_type: 'guide'
---



# clickhouse-static-files-disk-uploader

Формирует каталог данных, содержащий метаданные для указанной таблицы ClickHouse. Эти метаданные можно использовать для создания таблицы ClickHouse на другом сервере с набором данных только для чтения, размещённым на диске `web`.

Не используйте этот инструмент для миграции данных. Вместо этого используйте [команды `BACKUP` и `RESTORE`](/operations/backup).



## Использование

```bash
$ clickhouse static-files-disk-uploader [args]
```


## Команды {#commands}

|Команда|Описание|
|---|---|
|`-h`, `--help`|Выводит справочную информацию|
|`--metadata-path [path]`|Путь к метаданным указанной таблицы|
|`--test-mode`|Включает режим `test`, при котором на указанный URL отправляется PUT-запрос с метаданными таблицы|
|`--link`|Создаёт символьные ссылки вместо копирования файлов в выходной каталог|
|`--url [url]`|URL веб-сервера для режима `test`|
|`--output-dir [dir]`|Каталог для вывода файлов в режиме `non-test`|



## Получение пути к метаданным для указанной таблицы

При использовании `clickhouse-static-files-disk-uploader` требуется получить путь к метаданным нужной таблицы.

1. Выполните следующий запрос, указав нужные таблицу и базу данных:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. В результате будет выведен путь к каталогу с данными указанной таблицы:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```


## Выгрузите каталог метаданных таблицы в локальную файловую систему

Используя целевой каталог вывода `output` и заданный путь к метаданным, выполните следующую команду:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

Если операция прошла успешно, вы увидите следующее сообщение, а в каталоге `output` будут находиться метаданные указанной таблицы:

```repsonse
Путь к данным: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", целевой путь: "output"
```


## Выгрузка каталога метаданных таблицы на внешний URL

Этот шаг аналогичен выгрузке каталога данных в локальную файловую систему, но с добавлением флага `--test-mode`. Вместо указания выходного каталога необходимо указать целевой URL с помощью флага `--url`.

При включённом `test`-режиме каталог метаданных таблицы загружается на указанный URL с помощью PUT-запроса.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```


## Использование каталога метаданных таблицы для создания таблицы ClickHouse {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

Получив каталог метаданных таблицы, вы можете использовать его для создания таблицы ClickHouse на другом сервере.

См. [этот репозиторий на GitHub](https://github.com/ClickHouse/web-tables-demo) с демонстрационным примером. В нем мы создаем таблицу, используя диск `web`, что позволяет подключить таблицу к набору данных на другом сервере.
