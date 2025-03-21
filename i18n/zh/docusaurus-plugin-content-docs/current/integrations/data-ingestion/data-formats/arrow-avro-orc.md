---
sidebar_label: Avro、Arrow 和 ORC
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
---


# 在 ClickHouse 中处理 Avro、Arrow 和 ORC 数据

Apache 发布了多种数据格式，这些格式在分析环境中被广泛使用，包括流行的 [Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/) 和 [Orc](https://orc.apache.org/)。 ClickHouse 支持使用列表中的任何格式进行数据的导入和导出。

## 以 Avro 格式导入和导出 {#importing-and-exporting-in-avro-format}

ClickHouse 支持读取和写入广泛用于 Hadoop 系统的 [Apache Avro](https://avro.apache.org/) 数据文件。

要从 [avro 文件](assets/data.avro) 导入数据，我们应该在 `INSERT` 语句中使用 [Avro](/interfaces/formats.md/#data-format-avro) 格式：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

使用 [file()](/sql-reference/functions/files.md/#file) 函数，我们还可以在实际导入数据之前查看 Avro 文件：

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

要导出到 Avro 文件：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro 和 ClickHouse 数据类型 {#avro-and-clickhouse-data-types}

在导入或导出 Avro 文件时，请考虑 [数据类型匹配](/interfaces/formats/Avro#data-types-matching)。加载 Avo 文件时，使用显式类型转换进行转换：

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

### Kafka 中的 Avro 消息 {#avro-messages-in-kafka}

当 Kafka 消息使用 Avro 格式时，ClickHouse 可以使用 [AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent) 格式和 [Kafka](/engines/table-engines/integrations/kafka.md) 引擎读取此类流：

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

## 使用 Arrow 格式 {#working-with-arrow-format}

另一种列式格式是 [Apache Arrow](https://arrow.apache.org/)，ClickHouse 也支持其导入和导出。要从 [Arrow 文件](assets/data.arrow) 导入数据，我们使用 [Arrow](/interfaces/formats.md/#data-format-arrow) 格式：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

导出到 Arrow 文件的方式相同：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

此外，请检查 [数据类型匹配](/interfaces/formats/Arrow#data-types-matching)，以了解是否需要手动转换。

### Arrow 数据流 {#arrow-data-streaming}

[ArrowStream](/interfaces/formats.md/#data-format-arrow-stream) 格式可用于处理 Arrow 流（用于内存处理）。ClickHouse 可以读取和写入 Arrow 流。

为了演示 ClickHouse 如何流式传输 Arrow 数据，让我们将其通过以下 Python 脚本进行管道传输（该脚本以 Arrow 流格式读取输入流，并将结果作为 Pandas 表输出）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

现在我们可以通过将 ClickHouse 的输出管道传输到脚本来流式传输数据：

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse 也可以使用相同的 ArrowStream 格式读取 Arrow 流：

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

我们将 `arrow-stream` 作为 Arrow 流数据的一个可能来源。

## 导入和导出 ORC 数据 {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) 格式是一种列式存储格式，通常用于 Hadoop。 ClickHouse 支持使用 [ORC 格式](/interfaces/formats.md/#data-format-orc) 导入和导出 [Orc 数据](assets/data.orc)：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

此外，还要检查 [数据类型匹配](/interfaces/formats/ORC) 以及 [附加设置](/interfaces/formats/Parquet#format-settings)，以调整导出和导入。

## 深入阅读 {#further-reading}

ClickHouse 支持多种格式，包括文本和二进制，以覆盖各种场景和平台。在以下文章中探索更多格式及其使用方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个便携的全功能工具，可以在本地/远程文件上工作，而无需 Clickhouse 服务器。
