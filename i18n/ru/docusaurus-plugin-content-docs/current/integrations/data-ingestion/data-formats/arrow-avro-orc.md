---
sidebar_label: 'Avro, Arrow и ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: 'Работа с данными Avro, Arrow и ORC в ClickHouse'
description: 'Страница о работе с данными Avro, Arrow и ORC в ClickHouse'
keywords: ['Apache Avro', 'Apache Arrow', 'ORC format', 'columnar formats', 'big data formats']
doc_type: 'guide'
---



# Работа с данными Avro, Arrow и ORC в ClickHouse

Apache разработал несколько форматов данных, активно используемых в аналитических системах, включая популярные [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/) и [ORC](https://orc.apache.org/). ClickHouse поддерживает импорт и экспорт данных в любом из этих форматов.



## Импорт и экспорт в формате Avro {#importing-and-exporting-in-avro-format}

ClickHouse поддерживает чтение и запись файлов данных [Apache Avro](https://avro.apache.org/), которые широко используются в системах Hadoop.

Для импорта из [avro-файла](assets/data.avro) необходимо использовать формат [Avro](/interfaces/formats/Avro) в операторе `INSERT`:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

С помощью функции [file()](/sql-reference/functions/files.md/#file) можно также изучить содержимое Avro-файлов перед импортом данных:

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

Для экспорта в Avro-файл:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Типы данных Avro и ClickHouse {#avro-and-clickhouse-data-types}

При импорте или экспорте Avro-файлов учитывайте [соответствие типов данных](/interfaces/formats/Avro#data-type-mapping). Используйте явное приведение типов при загрузке данных из Avro-файлов:

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

Когда сообщения Kafka используют формат Avro, ClickHouse может читать такие потоки с помощью формата [AvroConfluent](/interfaces/formats/AvroConfluent) и движка [Kafka](/engines/table-engines/integrations/kafka.md):

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

Еще один колоночный формат — [Apache Arrow](https://arrow.apache.org/), который также поддерживается ClickHouse для импорта и экспорта. Для импорта данных из [файла Arrow](assets/data.arrow) используется формат [Arrow](/interfaces/formats/Arrow):

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

Также ознакомьтесь с разделом [соответствие типов данных](/interfaces/formats/Arrow#data-types-matching), чтобы узнать, требуется ли ручное преобразование каких-либо типов.

### Потоковая передача данных Arrow {#arrow-data-streaming}

Формат [ArrowStream](/interfaces/formats/ArrowStream) используется для работы с потоковой передачей Arrow (применяется для обработки данных в памяти). ClickHouse может читать и записывать потоки Arrow.

Чтобы продемонстрировать, как ClickHouse может передавать данные Arrow в потоковом режиме, направим их в следующий python-скрипт (он читает входной поток в формате потоковой передачи Arrow и выводит результат в виде таблицы Pandas):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

Теперь можно передать данные из ClickHouse в потоковом режиме, направив его вывод в скрипт:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse также может читать потоки Arrow, используя тот же формат ArrowStream:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

В качестве возможного источника потоковых данных Arrow мы использовали `arrow-stream`.


## Импорт и экспорт данных ORC {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) — это колоночный формат хранения данных, обычно используемый в Hadoop. ClickHouse поддерживает импорт и экспорт [данных Orc](assets/data.orc) с использованием [формата ORC](/interfaces/formats/ORC):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

Также ознакомьтесь с [соответствием типов данных](/interfaces/formats/ORC) и [дополнительными настройками](/interfaces/formats/Parquet#format-settings) для настройки экспорта и импорта.


## Дополнительные материалы {#further-reading}

ClickHouse поддерживает множество форматов данных — как текстовых, так и бинарных — для работы в различных сценариях и на разных платформах. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также рекомендуем ознакомиться с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативным полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости запуска сервера ClickHouse.
