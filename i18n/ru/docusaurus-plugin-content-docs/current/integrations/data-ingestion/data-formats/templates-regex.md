---
sidebar_label: 'Regexp и шаблоны'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: 'Импорт и экспорт произвольных текстовых данных с помощью Templates и Regexp в ClickHouse'
description: 'Страница, описывающая, как импортировать и экспортировать произвольный текст с помощью Templates и Regexp в ClickHouse'
doc_type: 'guide'
keywords: ['data formats', 'templates', 'regex', 'custom formats', 'parsing']
---



# Импорт и экспорт произвольных текстовых данных с использованием Template и Regex в ClickHouse

Нам часто приходится работать с данными в произвольных текстовых форматах. Это могут быть нестандартные форматы, некорректный JSON или «поломанный» CSV. Использование стандартных парсеров, таких как CSV или JSON, не всегда срабатывает. Но в ClickHouse эту задачу решают мощные форматы Template и Regex.



## Импорт на основе шаблона {#importing-based-on-a-template}

Предположим, мы хотим импортировать данные из следующего [лог-файла](assets/error.log):

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

Для импорта этих данных можно использовать формат [Template](/interfaces/formats/Template). Необходимо определить строку шаблона с заполнителями значений для каждой строки входных данных:

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

Для импорта данных с использованием заданного шаблона необходимо сохранить строку шаблона в файл (в нашем случае [row.template](assets/row.template)):

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

Имя столбца и правило экранирования определяются в формате `${name:escaping}`. Доступны различные варианты, такие как CSV, JSON, Escaped или Quoted, которые реализуют [соответствующие правила экранирования](/interfaces/formats/Template).

Теперь можно использовать данный файл в качестве аргумента параметра `format_template_row` при импорте данных (_обратите внимание, что файлы шаблона и данных **не должны содержать** дополнительный символ `\n` в конце файла_):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

Убедимся, что данные загружены в таблицу:

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

### Пропуск пробельных символов {#skipping-whitespaces}

Рассмотрите возможность использования [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces), который позволяет пропускать пробельные символы между разделителями в шаблоне:

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```


## Экспорт данных с использованием шаблонов {#exporting-data-using-templates}

Данные также можно экспортировать в любой текстовый формат с помощью шаблонов. В этом случае необходимо создать два файла:

[Шаблон набора результатов](assets/output.results), который определяет структуру всего набора результатов:

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

Здесь `rows_read` и `time` — системные метрики, доступные для каждого запроса. `data` обозначает сгенерированные строки (`${data}` всегда должен быть первым заполнителем в этом файле), формируемые на основе шаблона, определённого в [**файле шаблона строки**](assets/output.rows):

```response
${ip:Escaped} generated ${total:Escaped} requests
```

Теперь используем эти шаблоны для экспорта следующего запроса:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Top 10 IPs ==

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

--- 1000 строк прочитано за 0.001380604 ---
```

### Экспорт в HTML-файлы {#exporting-to-html-files}

Результаты на основе шаблонов также можно экспортировать в файлы с помощью конструкции [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md). Сгенерируем HTML-файлы на основе заданных форматов [набора результатов](assets/html.results) и [строки](assets/html.row):

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

Формат Template можно использовать для генерации любых текстовых файлов, включая XML. Просто укажите соответствующий шаблон и выполните экспорт.

Также рассмотрите возможность использования формата [XML](/interfaces/formats/XML) для получения стандартных XML-результатов с метаданными:

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


## Импорт данных с использованием регулярных выражений {#importing-data-based-on-regular-expressions}

Формат [Regexp](/interfaces/formats/Regexp) предназначен для более сложных случаев, когда входные данные требуют сложного разбора. Давайте разберём наш пример файла [error.log](assets/error.log), но на этот раз извлечём имя файла и протокол, чтобы сохранить их в отдельных столбцах. Сначала подготовим для этого новую таблицу:

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

Теперь можно импортировать данные с использованием регулярного выражения:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse вставит данные из каждой группы захвата в соответствующий столбец согласно их порядку. Проверим данные:

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

По умолчанию ClickHouse выдаёт ошибку при обнаружении несовпадающих строк. Если вы хотите пропускать несовпадающие строки, включите параметр [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched):

```sql
SET format_regexp_skip_unmatched = 1;
```


## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов — как текстовых, так и бинарных — для работы в различных сценариях и на разных платформах. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- **Регулярные выражения и шаблоны**
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также обратите внимание на [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативный полнофункциональный инструмент для работы с локальными и удалёнными файлами без необходимости запуска сервера ClickHouse.
