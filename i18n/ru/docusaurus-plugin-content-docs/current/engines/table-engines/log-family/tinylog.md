---
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: TinyLog
---


# TinyLog

Движок принадлежит к семейству логов. См. [Семейство логов](../../../engines/table-engines/log-family/index.md) для общих свойств логов и их различий.

Этот движок таблиц обычно используется с методом записи один раз: записать данные один раз, а затем читать их столько раз, сколько необходимо. Например, вы можете использовать таблицы типа `TinyLog` для промежуточных данных, которые обрабатываются небольшими партиями. Обратите внимание, что хранение данных в большом количестве маленьких таблиц неэффективно.

Запросы выполняются в одном потоке. Другими словами, этот движок предназначен для относительно небольших таблиц (до примерно 1 000 000 строк). Имеет смысл использовать этот движок таблиц, если у вас много маленьких таблиц, так как он проще, чем [Log](../../../engines/table-engines/log-family/log.md) (меньше файлов нужно открывать).

## Characteristics {#characteristics}

- **Упрощенная структура**: В отличие от движка Log, TinyLog не использует файлы меток. Это снижает сложность, но также ограничивает оптимизацию производительности для крупных наборов данных.
- **Запросы в одном потоке**: Запросы на таблицах TinyLog выполняются в одном потоке, что делает его подходящим для относительно небольших таблиц, обычно до 1 000 000 строк.
- **Эффективность для маленьких таблиц**: Простота движка TinyLog делает его выгодным при управлении множеством маленьких таблиц, так как он требует меньше операций с файлами по сравнению с движком Log.

В отличие от движка Log, TinyLog не использует файлы меток. Это снижает сложность, но также ограничивает оптимизацию производительности для более крупных наборов данных.

## Создание таблицы {#table_engines-tinylog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

## Запись данных {#table_engines-tinylog-writing-the-data}

Движок `TinyLog` хранит все колонки в одном файле. Для каждого запроса `INSERT` ClickHouse добавляет блок данных в конец файла таблицы, записывая колонки одну за другой.

Для каждой таблицы ClickHouse записывает файлы:

- `<column>.bin`: Файл данных для каждой колонки, содержащий сериализованные и сжатые данные.

Движок `TinyLog` не поддерживает операции `ALTER UPDATE` и `ALTER DELETE`.

## Пример использования {#table_engines-tinylog-example-of-use}

Создание таблицы:

``` sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

Вставка данных:

``` sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

Мы использовали два запроса `INSERT` для создания двух блоков данных внутри файлов `<column>.bin`.

ClickHouse использует один поток для выбора данных. В результате порядок блоков строк в выводе соответствует порядку этих же блоков во входных данных. Например:

``` sql
SELECT * FROM tiny_log_table
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
