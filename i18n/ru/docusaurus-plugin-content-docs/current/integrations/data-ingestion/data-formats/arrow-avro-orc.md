---
sidebar_label: 'Avro, Arrow и ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: 'Работа с данными Avro, Arrow и ORC в ClickHouse'
description: 'Страница, описывающая работу с данными Avro, Arrow и ORC в ClickHouse'
keywords: ['Apache Avro', 'Apache Arrow', 'формат ORC', 'колоночные форматы', 'форматы больших данных']
doc_type: 'guide'
---

# Работа с данными Avro, Arrow и ORC в ClickHouse {#working-with-avro-arrow-and-orc-data-in-clickhouse}

Apache разработал несколько форматов данных, активно используемых в аналитических системах, включая популярные [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/) и [ORC](https://orc.apache.org/). ClickHouse поддерживает импорт и экспорт данных с использованием любого из этих форматов.

## Импорт и экспорт в формате Avro {#importing-and-exporting-in-avro-format}

ClickHouse поддерживает чтение и запись файлов данных [Apache Avro](https://avro.apache.org/), которые широко используются в системах Hadoop.

Чтобы импортировать данные из [файла в формате Avro](assets/data.avro), следует использовать формат [Avro](/interfaces/formats/Avro) в операторе `INSERT`:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

С помощью функции [file()](/sql-reference/functions/files.md/#file) мы также можем изучить файлы Avro до непосредственного импорта данных:

```sql
SELECT path, hits
FROM file('data.avro', Avro)
ORDER BY hits DESC
LIMIT 5;
```

```response
┌─path────────────┬──hits─┐
│ Amy_Poehler     │ 62732 │
│ Adam_Goldberg   │ 42338 │
│ Aaron_Spelling  │ 25128 │
│ Absence_seizure │ 18152 │
│ Ammon_Bundy     │ 11890 │
└─────────────────┴───────┘
```

Для экспорта в файл Avro:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Типы данных Avro и ClickHouse {#avro-and-clickhouse-data-types}

Учитывайте [соответствие типов данных](/interfaces/formats/Avro#data-type-mapping) при импорте и экспорте файлов Avro. Используйте явное приведение типов для преобразования данных при загрузке их из файлов Avro:

```sql
SELECT
    date,
    toDate(date)
FROM file('data.avro', Avro)
LIMIT 3;
```

```response
┌──date─┬─toDate(date)─┐
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
└───────┴──────────────┘
```

### Сообщения Avro в Kafka {#avro-messages-in-kafka}

Когда сообщения Kafka находятся в формате Avro, ClickHouse может читать такие потоки с помощью формата [AvroConfluent](/interfaces/formats/AvroConfluent) и движка [Kafka](/engines/table-engines/integrations/kafka.md):

```sql
CREATE TABLE some_topic_stream
(
    field1 UInt32,
    field2 String
)
ENGINE = Kafka() SETTINGS
kafka_broker_list = 'localhost',
kafka_topic_list = 'some_topic',
kafka_group_name = 'some_group',
kafka_format = 'AvroConfluent';
```

## Работа с форматом Arrow {#working-with-arrow-format}

Ещё один колоночный формат — [Apache Arrow](https://arrow.apache.org/), который также поддерживается ClickHouse для импорта и экспорта данных. Чтобы импортировать данные из [файла в формате Arrow](assets/data.arrow), мы используем формат [Arrow](/interfaces/formats/Arrow):

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Экспорт в файл Arrow выполняется аналогичным образом:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

Также ознакомьтесь с [соответствием типов данных](/interfaces/formats/Arrow#data-types-matching), чтобы определить, какие из них нужно преобразовать вручную.

### Потоковая передача данных Arrow {#arrow-data-streaming}

Формат [ArrowStream](/interfaces/formats/ArrowStream) можно использовать для работы с потоковой передачей Arrow (используется для обработки данных в памяти). ClickHouse может читать и записывать потоки Arrow.

Чтобы продемонстрировать, как ClickHouse может передавать данные Arrow в потоке, перенаправим их в следующий скрипт на Python (он читает входной поток в потоковом формате Arrow и выводит результат в виде таблицы Pandas):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

Теперь мы можем потоково передавать данные из ClickHouse, перенаправляя его вывод в скрипт:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           путь  обращений
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse также может читать потоки Arrow в том же формате ArrowStream:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

Мы использовали `arrow-stream` как один из возможных источников потоковых данных Arrow.

## Импорт и экспорт данных ORC {#importing-and-exporting-orc-data}

Формат [Apache ORC](https://orc.apache.org/) — это колоночный формат хранения, обычно используемый с Hadoop. ClickHouse поддерживает импорт и экспорт [данных ORC](assets/data.orc) с использованием [формата ORC](/interfaces/formats/ORC):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

Также проверьте [соответствие типов данных](/interfaces/formats/ORC) и [дополнительные настройки](/interfaces/formats/Parquet#format-settings) для настройки экспорта и импорта.

## Дополнительные материалы {#further-reading}

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

А также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости в сервере ClickHouse.
