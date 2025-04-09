---
alias: []
description: 'Документация для формата Template'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Для случаев, когда вам нужно больше настройки, чем предлагают другие стандартные форматы, 
формат `Template` позволяет пользователю указать свою собственную строку формата с заполнителями для значений 
и указать правила экранирования для данных.

Он использует следующие настройки:

| Настройка                                                                                                   | Описание                                                                                                                  |
|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                               | Указывает путь к файлу, который содержит форматы строк для строк.                                                        |
| [`format_template_resultset`](#format_template_resultset)                                                   | Указывает путь к файлу, который содержит форматы строк для строк                                                         |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                         | Указывает разделитель между строками, который печатается (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию) |
| `format_template_row_format`                                                                                | Указывает строку формата для строк [встроенно](#inline_specification).                                                    |                                                                           
| `format_template_resultset_format`                                                                          | Указывает строку формата результата [встроенно](#inline_specification).                                                  |
| Некоторые настройки других форматов (например, `output_format_json_quote_64bit_integers` при использовании `JSON` экранирования |                                                                                                                            |

## Настройки И Правила Экранирования {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

Настройка `format_template_row` указывает путь к файлу, который содержит форматы строк для строк со следующим синтаксисом:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

Где:

| Часть синтаксиса | Описание                                                                                                          |
|------------------|------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`    | Разделитель между значениями (символ `$` можно экранировать как `$$`)                                             |
| `column_i`       | Имя или индекс колонки, значения которой нужно выбрать или вставить (если пусто, колонка будет пропущена)         |
| `serializeAs_i`  | Правило экранирования для значений колонки.                                                                      |

Поддерживаются следующие правила экранирования:

| Правило экранирования | Описание                                 |
|-----------------------|-------------------------------------------|
| `CSV`, `JSON`, `XML`  | Аналогично форматам с теми же именами    |
| `Escaped`             | Аналогично `TSV`                         |
| `Quoted`              | Аналогично `Values`                      |
| `Raw`                 | Без экранирования, аналогично `TSVRaw`   |   
| `None`                | Нет правила экранирования - смотрите примечание ниже |

:::note
Если правило экранирования опущено, будет использоваться `None`. `XML` подходит только для вывода.
:::

Рассмотрим пример. Данная строка формата:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

Следующие значения будут выведены (если использовать `SELECT`) или ожидаться (если использовать `INPUT`), 
между колонками `Search phrase:`, `, count:`, `, ad price: $` и `;` соответственно:

- `s` (с правилом экранирования `Quoted`)
- `c` (с правилом экранирования `Escaped`)
- `p` (с правилом экранирования `JSON`)

Например:

- Если производится `INSERT`, строка ниже соответствует ожидаемому шаблону и будет считывать значения `bathroom interior design`, `2166`, `$3` в колонки `Search phrase`, `count`, `ad price`.
- Если производится `SELECT`, строка ниже – это вывод, при условии, что значения `bathroom interior design`, `2166`, `$3` уже хранятся в таблице под колонками `Search phrase`, `count`, `ad price`.  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

Настройка `format_template_rows_between_delimiter` указывает разделитель между строками, который печатается (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию).

### format_template_resultset {#format_template_resultset}

Настройка `format_template_resultset` указывает путь к файлу, который содержит строку формата для набора результатов. 

Строка формата для набора результатов имеет тот же синтаксис, что и строка формата для строк. 
Она позволяет указывать префикс, суффикс и способ вывода дополнительной информации и содержит следующие заполнители вместо имен колонок:

- `data` - это строки с данными в формате `format_template_row`, разделенные `format_template_rows_between_delimiter`. Этот заполнитель должен быть первым заполнителем в строке формата.
- `totals` - это строка с общими значениями в формате `format_template_row` (при использовании WITH TOTALS).
- `min` - это строка с минимальными значениями в формате `format_template_row` (при установленных значениях крайностей в 1).
- `max` - это строка с максимальными значениями в формате `format_template_row` (при установленных значениях крайностей в 1).
- `rows` - общее число строк вывода.
- `rows_before_limit` - минимальное количество строк, которое было бы без LIMIT. Вывод только, если запрос содержит LIMIT. Если запрос содержит GROUP BY, `rows_before_limit_at_least` - это точное количество строк, которое было бы без LIMIT.
- `time` - время выполнения запроса в секундах.
- `rows_read` - количество прочитанных строк.
- `bytes_read` - количество прочитанных байтов (не сжатых).

Заполнители `data`, `totals`, `min` и `max` не должны иметь указанное правило экранирования (или `None` должно быть явно указано). Остальные заполнители могут иметь указанное любое правило экранирования.

:::note
Если настройка `format_template_resultset` является пустой строкой, используется `${data}` как значение по умолчанию.
:::

Для запросов вставки формат позволяет пропускать некоторые колонки или поля, если префикс или суффикс (смотрите пример).

### Встроенная спецификация {#inline_specification}

Часто бывает сложно или невозможно развернуть конфигурации формата 
(устанавливаемые через `format_template_row`, `format_template_resultset`) для формата шаблона в директорию на всех узлах кластера. 
Более того, формат может быть таким тривиальным, что его не нужно помещать в файл.

Для этих случаев можно использовать `format_template_row_format` (для `format_template_row`) и `format_template_resultset_format` (для `format_template_resultset`), чтобы задать строку шаблона непосредственно в запросе, 
а не как путь к файлу, который его содержит.

:::note
Правила для строк формата и escape-последовательностей такие же, как для:
- [`format_template_row`](#format_template_row) при использовании `format_template_row_format`.
- [`format_template_resultset`](#format_template_resultset) при использовании `format_template_resultset_format`.
:::

## Пример Использования {#example-usage}

Рассмотрим два примера того, как мы можем использовать формат `Template`, сначала для выбора данных, а затем для вставки данных.

### Выбор Данных {#selecting-data}

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
  <b>Обработано ${rows_read:XML} строк за ${time:XML} сек</b>
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
  <b>Обработано 3095973 строк за 0.1569913 сек</b>
 </body>
</html>
```

### Вставка Данных {#inserting-data}

```text
Некоторый заголовок
Page views: 5, User id: 4324182021466249494, Бесполезное поле: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Бесполезное поле: world, Duration: 185, Sign: 1
Total rows: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Некоторый заголовок\n${data}\nTotal rows: ${:CSV}\n
```

```text title="/some/path/row.format"
Page views: ${PageViews:CSV}, User id: ${UserID:CSV}, Бесполезное поле: ${:CSV}, Duration: ${Duration:CSV}, Sign: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration` и `Sign` внутри заполнителей - это названия колонок в таблице. Значения после `Бесполезное поле` в строках и после `\nTotal rows:` в суффиксе будут проигнорированы.
Все разделители в входящих данных должны строго соответствовать разделителям в указанных строках формата.

### Встроенная Спецификация {#in-line-specification}

Устали вручную форматировать таблицы в markdown? В этом примере мы посмотрим, как мы можем использовать формат `Template` и встроенные настройки спецификации для выполнения простой задачи - получения имен некоторых форматов ClickHouse из таблицы `system.formats` и форматирования их как таблицы markdown. Это можно легко сделать с помощью формата `Template` и настроек `format_template_row_format` и `format_template_resultset_format`.

В предыдущих примерах мы указывали строки формата результата и строки в отдельных файлах, с путями к этим файлам, указанными с помощью настроек `format_template_resultset` и `format_template_row` соответственно. Здесь мы сделаем это встроенно, потому что наш шаблон тривиален и состоит всего из нескольких `|` и `-`, чтобы составить таблицу markdown. Мы укажем нашу строку шаблона результата, используя настройку `format_template_resultset_format`. Чтобы создать заголовок таблицы, мы добавили `|ClickHouse Formats|\n|---|\n` перед `${data}`. Мы используем настройку `format_template_row_format`, чтобы указать строку шаблона `` |`{0:XML}`| `` для наших строк. Формат `Template` вставит наши строки с заданным форматом в заполнитель `${data}`. В этом примере у нас только один столбец, но если вы хотите добавить больше, вы можете сделать это, добавив `{1:XML}`, `{2:XML}`... и так далее к вашей строке шаблона строки, выбрав правило экранирования по мере необходимости. В этом примере мы выбрали правило экранирования `XML`.

```sql title="Запрос"
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

Смотрите-ка! Мы избавились от необходимости вручную добавлять все эти `|` и `-`, чтобы создать таблицу markdown:

```response title="Ответ"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
