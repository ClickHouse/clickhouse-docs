---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'Описание служебной утилиты clickhouse-static-files-disk-uploader'
doc_type: 'guide'
---



# clickhouse-static-files-disk-uploader

Формирует каталог данных, содержащий метаданные для указанной таблицы ClickHouse. Эти метаданные можно использовать для создания таблицы ClickHouse на другом сервере с набором данных только для чтения, хранящимся на диске `web`.

Не используйте этот инструмент для миграции данных. Вместо этого используйте [команды `BACKUP` и `RESTORE`](/operations/backup).



## Использование {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```


## Команды {#commands}

| Команда                  | Описание                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `-h`, `--help`           | Выводит справочную информацию                                                             |
| `--metadata-path [path]` | Путь к каталогу с метаданными для указанной таблицы                                       |
| `--test-mode`            | Включает режим `test`, который отправляет PUT-запрос на указанный URL с метаданными таблицы |
| `--link`                 | Создаёт символические ссылки вместо копирования файлов в выходной каталог                |
| `--url [url]`            | URL веб-сервера для режима `test`                                                         |
| `--output-dir [dir]`     | Каталог для вывода файлов в режиме `non-test`                                             |


## Получение пути к метаданным указанной таблицы {#retrieve-metadata-path-for-the-specified-table}

При использовании `clickhouse-static-files-disk-uploader` необходимо получить путь к метаданным нужной таблицы.

1. Выполните следующий запрос, указав целевую таблицу и базу данных:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. Запрос вернёт путь к каталогу данных указанной таблицы:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```


## Вывод директории метаданных таблицы в локальную файловую систему {#output-table-metadata-directory-to-the-local-filesystem}

Используя целевую директорию для вывода `output` и указанный путь к метаданным, выполните следующую команду:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

При успешном выполнении вы увидите следующее сообщение, а директория `output` будет содержать метаданные указанной таблицы:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```


## Выгрузка директории метаданных таблицы на внешний URL {#output-table-metadata-directory-to-an-external-url}

Этот шаг аналогичен выгрузке директории данных в локальную файловую систему, но с добавлением флага `--test-mode`. Вместо указания выходной директории необходимо указать целевой URL с помощью флага `--url`.

При включенном режиме `test` директория метаданных таблицы выгружается на указанный URL посредством PUT-запроса.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```


## Использование директории метаданных таблицы для создания таблицы ClickHouse {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

Получив директорию метаданных таблицы, вы можете использовать её для создания таблицы ClickHouse на другом сервере.

См. [этот репозиторий на GitHub](https://github.com/ClickHouse/web-tables-demo) с демонстрационным примером. В примере создаётся таблица с использованием диска `web`, что позволяет подключить таблицу к набору данных на другом сервере.
