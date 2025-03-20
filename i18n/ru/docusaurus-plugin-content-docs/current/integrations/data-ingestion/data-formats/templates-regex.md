---
sidebar_label: Регулярные выражения и шаблоны
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
---


# Импорт и экспорт настраиваемых текстовых данных с использованием шаблонов и регулярных выражений в ClickHouse

Мы часто сталкиваемся с данными в нестандартных текстовых форматах. Это может быть нестандартный формат, недействительный JSON или поврежденный CSV. Использование стандартных парсеров, таких как CSV или JSON, не всегда подходит. Но ClickHouse предлагает мощные форматы шаблонов и регулярных выражений.

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

Мы можем использовать формат [Template](/interfaces/formats.md/#format-template) для импорта этих данных. Нам нужно определить строку шаблона с заполнителями значений для каждой строки входных данных:

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

Давайте создадим таблицу для импорта наших данных:
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

Для импорта данных с использованием данного шаблона, нам нужно сохранить строку шаблона в файле ([row.template](assets/row.template) в нашем случае):

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

Мы определяем имя колонки и правило экранирования в формате `${name:escaping}`. Здесь доступны несколько вариантов, таких как CSV, JSON, Escaped или Quoted, которые реализуют [соответствующие правила экранирования](/interfaces/formats.md/#format-template).

Теперь мы можем использовать данный файл в качестве аргумента для параметра настройки `format_template_row` во время импорта данных (*обратите внимание, что файлы шаблона и данных **не должны содержать** дополнительный символ `\n` в конце файла*):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

И мы можем убедиться, что наши данные были загружены в таблицу:

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
Рекомендуется использовать [TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces), который позволяет пропускать пробелы между разделителями в шаблоне:
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## Экспорт данных с использованием шаблонов {#exporting-data-using-templates}

Мы также можем экспортировать данные в любой текстовый формат, используя шаблоны. В этом случае нам нужно создать два файла:

[Шаблон результата](assets/output.results), который определяет макет для всего набора результатов:

```response
== Топ 10 IP ==
${data}
--- ${rows_read:XML} строк прочитано за ${time:XML} ---
```

Здесь `rows_read` и `time` — это системные метрики, доступные для каждого запроса. В то время как `data` обозначает сгенерированные строки (`${data}` всегда должна быть первым заполнителем в этом файле), основываясь на шаблоне, определенном в [**файле шаблона строк**](assets/output.rows):

```response
${ip:Escaped} сгенерировалось ${total:Escaped} запросов
```

Теперь давайте использовать эти шаблоны, чтобы экспортировать следующий запрос:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Топ 10 IP ==

9.8.4.6 сгенерировалось 3 запроса
9.5.1.1 сгенерировалось 3 запроса
2.4.8.9 сгенерировалось 3 запроса
4.8.8.2 сгенерировалось 3 запроса
4.5.4.4 сгенерировалось 3 запроса
3.3.6.4 сгенерировалось 2 запроса
8.9.5.9 сгенерировалось 2 запроса
2.5.1.8 сгенерировалось 2 запроса
6.8.3.6 сгенерировалось 2 запроса
6.6.3.5 сгенерировалось 2 запроса

--- 1000 строк прочитано за 0.001380604 ---
```

### Экспорт в HTML файлы {#exporting-to-html-files}
Результаты на основе шаблонов также могут быть экспортированы в файлы с использованием предложения [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md). Давайте сгенерируем HTML файлы на основе данных [результатов](assets/html.results) и [строк](assets/html.row):

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

Шаблонный формат может использоваться для генерации всех вообразимых текстовых форматов файлов, включая XML. Просто вставьте соответствующий шаблон и выполните экспорт.

Также рассмотрите возможность использования формата [XML](/interfaces/formats.md/#xml), чтобы получить стандартные XML результаты, включая метаданные:

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

Формат [Regexp](/interfaces/formats.md/#data-format-regexp) учитывает более сложные случаи, когда входные данные нужно парсить более сложным образом. Давайте обработаем наш пример с [error.log](assets/error.log), но на этот раз захватим имя файла и протокол, чтобы сохранить их в отдельных колонках. Сначала давайте подготовим новую таблицу для этого:

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

Теперь мы можем импортировать данные на основе регулярного выражения:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse вставит данные из каждой группы захвата в соответствующую колонку на основании ее порядка. Давайте проверим данные:

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

По умолчанию ClickHouse выдаст ошибку в случае несоответствующих строк. Если вы хотите пропустить несоответствующие строки, включите это с помощью параметра [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched):

```sql
SET format_regexp_skip_unmatched = 1;
```

## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Изучите больше форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- **Регулярные выражения и шаблоны**
- [Нативные и бинарные форматы](binary.md)
- [SQL форматы](sql.md)

И также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - переносным инструментом с полным набором функций для работы с локальными/удаленными файлами без необходимости в сервере Clickhouse.
