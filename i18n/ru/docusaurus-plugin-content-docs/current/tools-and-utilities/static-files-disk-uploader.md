---
'slug': '/operations/utilities/static-files-disk-uploader'
'title': 'clickhouse-static-files-disk-uploader'
'keywords':
- 'clickhouse-static-files-disk-uploader'
- 'utility'
- 'disk'
- 'uploader'
'description': 'Предоставляет описание утилиты clickhouse-static-files-disk-uploader'
'doc_type': 'guide'
---


# clickhouse-static-files-disk-uploader

Выводит директорию данных, содержащую метаданные для указанной таблицы ClickHouse. Эти метаданные могут быть использованы для создания таблицы ClickHouse на другом сервере, содержащей набор данных только для чтения, поддерживаемый диском `web`.

Не используйте этот инструмент для миграции данных. Вместо этого используйте команды [`BACKUP` и `RESTORE`](/operations/backup).

## Использование {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## Команды {#commands}

|Команда|Описание|
|---|---|
|`-h`, `--help`|Выводит справочную информацию|
|`--metadata-path [path]`|Путь, содержащий метаданные для указанной таблицы|
|`--test-mode`|Включает режим `test`, который отправляет PUT-запрос на заданный URL с метаданными таблицы|
|`--link`|Создает символьные ссылки вместо копирования файлов в выходную директорию|
|`--url [url]`|URL веб-сервера для режима `test`|
|`--output-dir [dir]`|Директория для вывода файлов в `non-test` режиме|

## Получение пути метаданных для указанной таблицы {#retrieve-metadata-path-for-the-specified-table}

При использовании `clickhouse-static-files-disk-uploader` необходимо получить путь к метаданным для желаемой таблицы.

1. Выполните следующий запрос, указав вашу целевую таблицу и базу данных:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. Это должно вернуть путь к директории данных для указанной таблицы:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## Вывод директории метаданных таблицы в локальную файловую систему {#output-table-metadata-directory-to-the-local-filesystem}

Используя целевую выходную директорию `output` и заданный путь метаданных, выполните следующую команду:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

Если все прошло успешно, вы должны увидеть следующее сообщение, и директория `output` должна содержать метаданные для указанной таблицы:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## Вывод директории метаданных таблицы на внешний URL {#output-table-metadata-directory-to-an-external-url}

Этот шаг аналогичен выводу директории данных в локальную файловую систему, но с добавлением флага `--test-mode`. Вместо указания выходной директории вы должны указать целевой URL с помощью флага `--url`.

С включенным режимом `test` директория метаданных таблицы загружается на указанный URL через PUT-запрос.

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## Использование директории метаданных таблицы для создания таблицы ClickHouse {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

Как только у вас есть директория метаданных таблицы, вы можете использовать ее для создания таблицы ClickHouse на другом сервере.

Пожалуйста, посмотрите [этот репозиторий на GitHub](https://github.com/ClickHouse/web-tables-demo) с демонстрацией. В примере мы создаем таблицу с использованием диска `web`, который позволяет подключить таблицу к набору данных на другом сервере.
