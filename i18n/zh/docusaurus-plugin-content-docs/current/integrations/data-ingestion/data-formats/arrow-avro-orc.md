---
sidebar_label: 'Avro、Arrow 和 ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: '在 ClickHouse 中使用 Avro、Arrow 和 ORC 数据'
description: '介绍如何在 ClickHouse 中使用 Avro、Arrow 和 ORC 数据的页面'
keywords: ['Apache Avro', 'Apache Arrow', 'ORC 格式', '列式格式', '大数据格式']
doc_type: 'guide'
---



# 在 ClickHouse 中处理 Avro、Arrow 和 ORC 数据 {#working-with-avro-arrow-and-orc-data-in-clickhouse}

Apache 已发布了多种在分析环境中广泛使用的数据格式，其中包括流行的 [Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/) 和 [ORC](https://orc.apache.org/)。ClickHouse 支持使用上述任意一种格式导入和导出数据。



## 以 Avro 格式导入和导出 {#importing-and-exporting-in-avro-format}

ClickHouse 支持读取和写入 [Apache Avro](https://avro.apache.org/) 数据文件，这些文件在 Hadoop 系统中被广泛使用。

要从 [Avro 文件](assets/data.avro) 导入数据，应在 `INSERT` 语句中使用 [Avro](/interfaces/formats/Avro) 格式：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

使用 [file()](/sql-reference/functions/files.md/#file) 函数，我们还可以在真正导入数据之前先查看和探索 Avro 文件：

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

导出为 Avro 文件：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro 和 ClickHouse 数据类型 {#avro-and-clickhouse-data-types}

在导入或导出 Avro 文件时，请注意[数据类型映射](/interfaces/formats/Avro#data-type-mapping)。从 Avro 文件加载数据时，请使用显式类型转换进行转换：

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

当 Kafka 消息使用 Avro 格式时，ClickHouse 可以使用 [AvroConfluent](/interfaces/formats/AvroConfluent) 格式和 [Kafka](/engines/table-engines/integrations/kafka.md) 引擎读取此类数据流：

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

另一种列式数据格式是 [Apache Arrow](https://arrow.apache.org/)，ClickHouse 也支持使用它进行导入和导出。要从 [Arrow 文件](assets/data.arrow) 导入数据，我们使用 [Arrow](/interfaces/formats/Arrow) 格式：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

导出到 Arrow 文件的方式是一样的：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

另外，请检查 [数据类型匹配](/interfaces/formats/Arrow#data-types-matching)，以确定是否有需要手动转换的数据类型。

### Arrow 数据流 {#arrow-data-streaming}

[ArrowStream](/interfaces/formats/ArrowStream) 格式可用于处理 Arrow 流（用于内存中处理）。ClickHouse 可以读取和写入 Arrow 流。

为了演示 ClickHouse 如何以流式方式处理 Arrow 数据，我们将其通过管道传递给下面的 Python 脚本（它以 Arrow 流格式读取输入流，并将结果输出为一个 Pandas 表格）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

现在，我们可以通过管道将 ClickHouse 的输出传给脚本，实现数据流式传输：

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           路径  命中次数
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse 也可以使用相同的 ArrowStream 格式来读取 Arrow 流：

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

我们使用了 `arrow-stream` 作为 Arrow 流式数据的一个可能来源。


## 导入和导出 ORC 数据 {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) 格式是一种面向列的存储格式，通常用于 Hadoop。ClickHouse 支持使用 [ORC 格式](/interfaces/formats/ORC) 导入和导出 [ORC 数据](assets/data.orc)：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

另外，还应查看[数据类型匹配](/interfaces/formats/ORC)以及[附加设置](/interfaces/formats/Parquet#format-settings)，以便对导出和导入进行调优。


## 延伸阅读 {#further-reading}

ClickHouse 支持多种格式（包括文本和二进制），以适配各种场景和平台。可在以下文章中了解更多格式以及如何使用它们：

- [CSV 和 TSV 格式](csv-tsv.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [Native 和二进制格式](binary.md)
- [SQL 格式](sql.md)

此外可查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一款便携的全功能工具，可在无需 ClickHouse 服务器的情况下处理本地或远程文件。
