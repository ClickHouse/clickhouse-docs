---
slug: '/interfaces/formats/Template'
description: 'Документация для формата Template'
title: Template
keywords: ['Template']
doc_type: guide
input_format: true
output_format: true
---
| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Для случаев, когда вам требуется больше настроек, чем предлагают другие стандартные форматы, 
формат `Template` позволяет пользователю указать свою собственную строку формата с заполнителями для значений
и установить правила экранирования для данных.

Он использует следующие настройки:

| Настройка                                                                                                  | Описание                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | Указывает путь к файлу, который содержит строки формата для строк.                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | Указывает путь к файлу, который содержит строки формата для строк                                                      |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | Указывает разделитель между строками, который выводится (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию) |
| `format_template_row_format`                                                                             | Указывает строку формата для строк [встраиваемым образом](#inline_specification).                                                     |                                                                           
| `format_template_resultset_format`                                                                       | Указывает строку формата результирующего набора [встраиваемым образом](#inline_specification).                                                   |
| Некоторые настройки других форматов (например, `output_format_json_quote_64bit_integers`, когда используется `JSON` экранирование) |                                                                                                                            |

## Настройки и правила экранирования {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

Настройка `format_template_row` указывает путь к файлу, который содержит строки формата для строк со следующим синтаксисом:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

Где:

| Часть синтаксиса | Описание                                                                                                       |
|------------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`    | Разделитель между значениями (символ `$` можно экранировать как `$$`)                                                    |
| `column_i`       | Имя или индекс колонки, значения которой нужно выбрать или вставить (если пусто, то колонка будет пропущена) |
| `serializeAs_i`  | Правило экранирования для значений колонки.                                                                           |

Поддерживаются следующие правила экранирования:

| Правило экранирования  | Описание                              |
|------------------------|------------------------------------------|
| `CSV`, `JSON`, `XML`   | Похоже на форматы с теми же именами |
| `Escaped`              | Похоже на `TSV`                         |
| `Quoted`               | Похоже на `Values`                      |
| `Raw`                  | Без экранирования, похоже на `TSVRaw`    |   
| `None`                 | Без правила экранирования - см. примечание ниже        |

:::note
Если правило экранирования пропущено, то будет использовано `None`. `XML` подходит только для вывода.
:::

Рассмотрим пример. Учитывая следующую строку формата:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

Следующие значения будут выведены (если используется `SELECT`) или ожидаемы (если используется `INPUT`), 
между колонками `Search phrase:`, `, count:`, `, ad price: $` и `;` соответственно:

- `s` (с правилом экранирования `Quoted`)
- `c` (с правилом экранирования `Escaped`)
- `p` (с правилом экранирования `JSON`)

Например:

- Если осуществить `INSERT`, следующая строка соответствует ожидаемому шаблону и считала бы значения `bathroom interior design`, `2166`, `$3` в колонки `Search phrase`, `count`, `ad price`.
- Если осуществить `SELECT`, следующая строка является выводом, предполагая, что значения `bathroom interior design`, `2166`, `$3` уже хранятся в таблице в колонках `Search phrase`, `count`, `ad price`.  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

Настройка `format_template_rows_between_delimiter` указывает разделитель между строками, который выводится (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию).

### format_template_resultset {#format_template_resultset}

Настройка `format_template_resultset` указывает путь к файлу, который содержит строку формата для результирующего набора. 

Строка формата для результирующего набора имеет тот же синтаксис, что и строка формата для строк. 
Она позволяет указать префикс, суффикс и способ вывода дополнительной информации и содержит следующие заполнители вместо имен колонок:

- `data` — это строки с данными в формате `format_template_row`, разделенные `format_template_rows_between_delimiter`. Этот заполнитель должен быть первым в строке формата.
- `totals` — это строка с итоговыми значениями в формате `format_template_row` (при использовании WITH TOTALS).
- `min` — это строка с минимальными значениями в формате `format_template_row` (при установке крайних значений на 1).
- `max` — это строка с максимальными значениями в формате `format_template_row` (при установке крайних значений на 1).
- `rows` — общее количество выводимых строк.
- `rows_before_limit` — минимальное количество строк, которое было бы без LIMIT. Вывод только если запрос содержит LIMIT. Если запрос содержит GROUP BY, rows_before_limit_at_least — это точное количество строк, которое было бы без LIMIT.
- `time` — время выполнения запроса в секундах.
- `rows_read` — количество прочитанных строк.
- `bytes_read` — количество прочитанных байтов (не сжатых).

Заполнители `data`, `totals`, `min` и `max` не должны иметь заданное правило экранирования (или `None` должно быть указано явно). Оставшиеся заполнители могут иметь любое правило экранирования.

:::note
Если настройка `format_template_resultset` является пустой строкой, используется `${data}` как значение по умолчанию.
:::

Для запросов вставки формат позволяет пропускать некоторые колонки или поля, если указан префикс или суффикс (см. пример).

### Встраиваемая спецификация {#inline_specification}

Часто бывает сложно или невозможно развернуть конфигурации формата
(установленные с помощью `format_template_row`, `format_template_resultset`) для формата шаблона в директорию на всех узлах кластера. 
Более того, формат может быть настолько тривиальным, что его не нужно помещать в файл.

Для этих случаев можно использовать `format_template_row_format` (для `format_template_row`) и `format_template_resultset_format` (для `format_template_resultset`), чтобы задать строку шаблона непосредственно в запросе, 
вместо указания пути к файлу, который ее содержит.

:::note
Правила для строк формата и последовательностей экранирования такие же, как и для:
- [`format_template_row`](#format_template_row), когда используется `format_template_row_format`.
- [`format_template_resultset`](#format_template_resultset), когда используется `format_template_resultset_format`.
:::

## Пример использования {#example-usage}

Рассмотрим два примера того, как мы можем использовать формат `Template`, сначала для выбора данных, а затем для вставки данных.

### Выбор данных {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Max</caption>
    ${max}
  </table>
  <b>Processed ${rows_read:XML} rows in ${time:XML} sec</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

Результат:

```html
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>Max</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>Processed 3095973 rows in 0.1569913 sec</b>
 </body>
</html>
```

### Вставка данных {#inserting-data}

```text
Some header
Page views: 5, User id: 4324182021466249494, Useless field: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Useless field: world, Duration: 185, Sign: 1
Total rows: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Some header\n${data}\nTotal rows: ${:CSV}\n
```

```text title="/some/path/row.format"
Page views: ${PageViews:CSV}, User id: ${UserID:CSV}, Useless field: ${:CSV}, Duration: ${Duration:CSV}, Sign: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration` и `Sign` внутри заполнителей — это названия колонок в таблице. Значения после `Useless field` в строках и после `\nTotal rows:` в суффиксе будут проигнорированы. 
Все разделители во входных данных должны строго соответствовать разделителям в заданных строках формата.

### Встраиваемая спецификация {#in-line-specification}

Устали вручную форматировать таблицы markdown? В этом примере мы рассмотрим, как можем использовать формат `Template` и настройки встраиваемой спецификации, чтобы выполнить простую задачу - `SELECT` названия некоторых форматов ClickHouse из таблицы `system.formats` и отформатировать их как таблицу markdown. Это можно легко сделать, используя формат `Template` и настройки `format_template_row_format` и `format_template_resultset_format`.

В предыдущих примерах мы указывали строки формата результирующего набора и строк в отдельных файлах, с путями к этим файлам, указанными с помощью настроек `format_template_resultset` и `format_template_row` соответственно. Здесь мы сделаем это встраиваемым образом, поскольку наш шаблон тривиален и состоит только из нескольких `|` и `-` для создания таблицы markdown. Мы укажем нашу строку шаблона результирующего набора, используя настройку `format_template_resultset_format`. Чтобы создать заголовок таблицы, мы добавили `|ClickHouse Formats|\n|---|\n` перед `${data}`. Мы используем настройку `format_template_row_format`, чтобы указать строку шаблона `` |`{0:XML}`| `` для наших строк. Формат `Template` вставит наши строки с заданным форматом в заполнитель `${data}`. В этом примере у нас только одна колонка, но если вы хотите добавить больше, вы можете сделать это, добавив `{1:XML}`, `{2:XML}` и т.д. к вашей строке шаблона, выбрав соответствующее правило экранирования. В этом примере мы выбрали правило экранирования `XML`. 

```sql title="Query"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT Template
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

Посмотрите на это! Мы избавились от необходимости вручную добавлять все эти `|`s и `-`s, чтобы создать эту таблицу markdown:

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```