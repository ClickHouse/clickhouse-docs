---
sidebar_label: 'Регулярные выражения и шаблоны'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: 'Импорт и экспорт пользовательских текстовых данных с помощью шаблонов и регулярных выражений в ClickHouse'
description: 'Страница, описывающая, как импортировать и экспортировать пользовательский текст с помощью шаблонов и регулярных выражений в ClickHouse'
doc_type: 'guide'
keywords: ['форматы данных', 'шаблоны', 'regex', 'пользовательские форматы', 'парсинг']
---

# Импорт и экспорт произвольных текстовых данных с помощью форматов Template и Regex в ClickHouse {#importing-and-exporting-custom-text-data-using-templates-and-regex-in-clickhouse}

Нам часто приходится работать с данными в произвольных текстовых форматах. Это может быть нестандартный формат, некорректный JSON или «сломанный» CSV. Использование стандартных парсеров, таких как CSV или JSON, в таких случаях не всегда работает. Но в ClickHouse для этого предусмотрены мощные форматы Template и Regex.

## Импорт на основе шаблона {#importing-based-on-a-template}

Предположим, что мы хотим импортировать данные из следующего [файла журнала](assets/error.log):

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

Мы можем использовать формат [Template](/interfaces/formats/Template) для импорта этих данных. Нам нужно определить шаблонную строку с плейсхолдерами значений для каждой строки входных данных:

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

Создадим таблицу для импорта данных:

```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `request` String
)
ENGINE = MergeTree
ORDER BY (host, request, time)
```

Чтобы импортировать данные с использованием указанного шаблона, нужно сохранить строку шаблона в файл (в нашем случае — в [row.template](assets/row.template)):

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

Мы определяем имя столбца и правило экранирования в формате `${name:escaping}`. Здесь доступно несколько вариантов, таких как CSV, JSON, Escaped или Quoted, которые реализуют [соответствующие правила экранирования](/interfaces/formats/Template).

Теперь мы можем использовать указанный файл в качестве аргумента параметра настройки `format_template_row` при импорте данных (*обратите внимание, что в конце файлов шаблона и данных **не должно быть** лишнего символа перевода строки `\n`*):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

Теперь можно убедиться, что данные были загружены в таблицу:

```sql
SELECT
    request,
    count(*)
FROM error_log
GROUP BY request
```

```response
┌─request──────────────────────────────────────────┬─count()─┐
│ GET /img/close.png HTTP/1.1                      │     176 │
│ GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1 │     172 │
│ GET /phone/images/icon_01.png HTTP/1.1           │     139 │
│ GET /apple-touch-icon-precomposed.png HTTP/1.1   │     161 │
│ GET /apple-touch-icon.png HTTP/1.1               │     162 │
│ GET /apple-touch-icon-120x120.png HTTP/1.1       │     190 │
└──────────────────────────────────────────────────┴─────────┘
```

### Пропуск пробелов {#skipping-whitespaces}

Рекомендуется использовать [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces), который позволяет игнорировать пробелы между разделителями в шаблоне:

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## Экспорт данных с использованием шаблонов {#exporting-data-using-templates}

Мы также можем экспортировать данные в любой текстовый формат с помощью шаблонов. В этом случае нужно создать два файла:

[Result set template](assets/output.results), который определяет структуру всего набора результатов:

```response
== Топ-10 IP-адресов ==
${data}
--- Прочитано строк: ${rows_read:XML} за ${time:XML} ---
```

Здесь `rows_read` и `time` — это системные метрики, доступные для каждого запроса. При этом `data` обозначает сгенерированные строки (`${data}` всегда должно быть первым плейсхолдером в этом файле), которые формируются по шаблону, определённому в [**файле шаблона строк**](assets/output.rows):

```response
${ip:Escaped} создал ${total:Escaped} запросов
```

Теперь используем эти шаблоны, чтобы экспортировать следующий запрос:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Топ-10 IP-адресов ==

9.8.4.6 сгенерировал 3 запросов
9.5.1.1 сгенерировал 3 запросов
2.4.8.9 сгенерировал 3 запросов
4.8.8.2 сгенерировал 3 запросов
4.5.4.4 сгенерировал 3 запросов
3.3.6.4 сгенерировал 2 запросов
8.9.5.9 сгенерировал 2 запросов
2.5.1.8 сгенерировал 2 запросов
6.8.3.6 сгенерировал 2 запросов
6.6.3.5 сгенерировал 2 запросов

--- Прочитано 1000 строк за 0.001380604 ---
```

### Экспорт в HTML-файлы {#exporting-to-html-files}

Результаты, сформированные по шаблону, также можно экспортировать в файлы с помощью предложения [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md). Сгенерируем HTML-файлы на основе указанных форматов [resultset](assets/html.results) и [row](assets/html.row):

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
INTO OUTFILE 'out.html'
FORMAT Template
SETTINGS format_template_resultset = 'html.results',
         format_template_row = 'html.row'
```

### Экспорт в XML {#exporting-to-xml}

Формат шаблона можно использовать для генерации файлов любого текстового формата, включая XML. Просто подготовьте соответствующий шаблон и выполните экспорт.

Также рассмотрите возможность использования формата [XML](/interfaces/formats/XML), чтобы получить стандартный XML-вывод, включая метаданные:

```sql
SELECT *
FROM error_log
LIMIT 3
FORMAT XML
```

```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
        <meta>
                <columns>
                        <column>
                                <name>time</name>
                                <type>DateTime</type>
                        </column>
                        ...
                </columns>
        </meta>
        <data>
                <row>
                        <time>2023-01-15 13:00:01</time>
                        <ip>3.5.9.2</ip>
                        <host>example.com</host>
                        <request>GET /apple-touch-icon-120x120.png HTTP/1.1</request>
                </row>
                ...
        </data>
        <rows>3</rows>
        <rows_before_limit_at_least>1000</rows_before_limit_at_least>
        <statistics>
                <elapsed>0.000745001</elapsed>
                <rows_read>1000</rows_read>
                <bytes_read>88184</bytes_read>
        </statistics>
</result>

```

## Импорт данных на основе регулярных выражений {#importing-data-based-on-regular-expressions}

Формат [Regexp](/interfaces/formats/Regexp) предназначен для более сложных случаев, когда входные данные необходимо разбирать более сложным способом. Давайте разберём наш пример с файлом [error.log](assets/error.log), но на этот раз извлечём имя файла и протокол, чтобы сохранить их в отдельные столбцы. Для начала подготовим для этого новую таблицу:

```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `file` String,
    `protocol` String
)
ENGINE = MergeTree
ORDER BY (host, file, time)
```

Теперь мы можем импортировать данные с использованием регулярного выражения:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse вставит данные из каждой группы захвата в соответствующий столбец в соответствии с её порядком. Проверим данные:

```sql
SELECT * FROM error_log LIMIT 5
```

```response
┌────────────────time─┬─ip──────┬─host────────┬─file─────────────────────────┬─protocol─┐
│ 2023-01-15 13:00:01 │ 3.5.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:01:40 │ 3.7.2.5 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:16:49 │ 9.2.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:21:38 │ 8.8.5.3 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:31:27 │ 9.5.8.4 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
└─────────────────────┴─────────┴─────────────┴──────────────────────────────┴──────────┘
```

По умолчанию ClickHouse выдаст ошибку при наличии несопоставленных строк. Если вместо этого вы хотите пропускать несопоставленные строки, активируйте настройку [format&#95;regexp&#95;skip&#95;unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched):

```sql
SET format_regexp_skip_unmatched = 1;
```

## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов, как текстовых, так и двоичных, чтобы охватить различные сценарии и платформы. Изучите дополнительные форматы и способы работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- **Regex и шаблоны**
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости поднимать сервер ClickHouse.
