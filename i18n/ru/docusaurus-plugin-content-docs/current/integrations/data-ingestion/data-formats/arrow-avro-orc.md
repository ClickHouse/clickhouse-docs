---
sidebar_label: Avro, Arrow и ORC
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
---


# Работа с данными форматов Avro, Arrow и ORC в ClickHouse

Apache выпустила несколько форматов данных, активно используемых в аналитических средах, включая популярные [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/) и [Orc](https://orc.apache.org/). ClickHouse поддерживает импорт и экспорт данных, используя любой из этих форматов.

## Импорт и экспорт в формате Avro {#importing-and-exporting-in-avro-format}

ClickHouse поддерживает чтение и запись файлов данных [Apache Avro](https://avro.apache.org/), которые широко используются в системах Hadoop.

Чтобы импортировать из [avro файла](assets/data.avro), мы должны использовать формат [Avro](/interfaces/formats.md/#data-format-avro) в операторе `INSERT`:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

С помощью функции [file()](/sql-reference/functions/files.md/#file) мы также можем исследовать Avro файлы перед фактическим импортом данных:

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

Чтобы экспортировать в файл Avro:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Типы данных Avro и ClickHouse {#avro-and-clickhouse-data-types}

Рассматривайте [соответствие типов данных](/interfaces/formats/Avro#data-types-matching) при импорте или экспорте файлов Avro. Используйте явное приведение типов для преобразования при загрузке данных из файлов Avro:

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

Когда сообщения Kafka используют формат Avro, ClickHouse может читать такие потоки, используя формат [AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent) и движок [Kafka](/engines/table-engines/integrations/kafka.md):

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

Еще один колоночный формат - [Apache Arrow](https://arrow.apache.org/), также поддерживаемый ClickHouse для импорта и экспорта. Чтобы импортировать данные из [Arrow файла](assets/data.arrow), мы используем формат [Arrow](/interfaces/formats.md/#data-format-arrow):

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Экспорт в файл Arrow выполняется тем же способом:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

Также проверьте [соответствие типов данных](/interfaces/formats/Arrow#data-types-matching), чтобы узнать, следует ли что-либо конвертировать вручную.

### Потоковые данные Arrow {#arrow-data-streaming}

Формат [ArrowStream](/interfaces/formats.md/#data-format-arrow-stream) может быть использован для работы с потоками Arrow (используется для обработки в памяти). ClickHouse может читать и записывать потоковые данные Arrow.

Чтобы продемонстрировать, как ClickHouse может потоково передавать данные Arrow, давайте передадим их на следующий python-скрипт (он читает входной поток в формате потокового передачи Arrow и выводит результат в виде таблицы Pandas):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

Теперь мы можем потоково передавать данные из ClickHouse, перенаправив его вывод в скрипт:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse также может читать потоковые данные Arrow, используя тот же формат ArrowStream:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

Мы использовали `arrow-stream` в качестве возможного источника потоковых данных Arrow.

## Импорт и экспорт данных ORC {#importing-and-exporting-orc-data}

Формат [Apache ORC](https://orc.apache.org/) - это колоночный формат хранения, обычно используемый для Hadoop. ClickHouse поддерживает как импорт, так и экспорт [Orc данных](assets/data.orc) с использованием [формата ORC](/interfaces/formats.md/#data-format-orc):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

Также посмотрите [соответствие типов данных](/interfaces/formats/ORC), а также [дополнительные настройки](/interfaces/formats/Parquet#format-settings), чтобы настроить экспорт и импорт.

## Дальнейшее чтение {#further-reading}

ClickHouse вводит поддержку множества форматов, как текстовых, так и бинарных, чтобы покрыть различные сценарии и платформы. Изучите больше форматов и способов работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [SQL форматы](sql.md)

Также проверьте [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативный многофункциональный инструмент для работы с локальными/удаленными файлами без необходимости в сервере Clickhouse.
