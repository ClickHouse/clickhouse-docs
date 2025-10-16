---
'sidebar_label': 'Avro、Arrow、及びORC'
'sidebar_position': 5
'slug': '/integrations/data-formats/arrow-avro-orc'
'title': 'ClickHouseにおけるAvro、Arrow、及びORCデータの操作'
'description': 'ClickHouseにおけるAvro、Arrow、及びORCデータの操作方法を説明するページ'
'doc_type': 'guide'
---


# ClickHouseでAvro、Arrow、ORCデータを扱う

Apacheは、人気のある [Avro](https://avro.apache.org/)、 [Arrow](https://arrow.apache.org/)、および [Orc](https://orc.apache.org/) を含む、分析環境で活発に使用される複数のデータフォーマットをリリースしました。ClickHouseは、そのリストから任意のフォーマットを使用してデータのインポートおよびエクスポートをサポートしています。

## Avroフォーマットでのインポートとエクスポート {#importing-and-exporting-in-avro-format}

ClickHouseは、Hadoopシステムで広く使用されている [Apache Avro](https://avro.apache.org/) データファイルの読み取りと書き込みをサポートしています。

[avro file](assets/data.avro) からインポートするには、`INSERT`ステートメントで [Avro](/interfaces/formats.md/#data-format-avro) フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[data()](/sql-reference/functions/files.md/#file) 関数を使用すると、実際にデータをインポートする前にAvroファイルを調べることができます：

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

Avroファイルにエクスポートするには：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### AvroとClickHouseのデータ型 {#avro-and-clickhouse-data-types}

Avroファイルのインポートまたはエクスポートの際には [data types matching](/interfaces/formats/Avro#data-type-mapping) を考慮してください。Avroファイルからデータを読み込む際には、明示的な型キャストを使用して変換します：

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

### KafkaのAvroメッセージ {#avro-messages-in-kafka}

KafkaメッセージがAvroフォーマットを使用する場合、ClickHouseは [AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent) フォーマットおよび [Kafka](/engines/table-engines/integrations/kafka.md) エンジンを使用してそのようなストリームを読み取ることができます：

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

## Arrowフォーマットでの作業 {#working-with-arrow-format}

別の列指向フォーマットは [Apache Arrow](https://arrow.apache.org/) で、ClickHouseもインポートおよびエクスポートのためにサポートしています。[Arrow file](assets/data.arrow) からデータをインポートするには、[Arrow](/interfaces/formats.md/#data-format-arrow) フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrowファイルへのエクスポートも同じ方法で行えます：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、手動で変換する必要があるかどうかを知るために [data types matching](/interfaces/formats/Arrow#data-types-matching) を確認してください。

### Arrowデータストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats.md/#data-format-arrow-stream) フォーマットは、Arrowストリーミング（メモリ内処理に使用）の作業に使用できます。ClickHouseはArrowストリームの読み書きが可能です。

ClickHouseがArrowデータをストリーミングできることを示すために、以下のPythonスクリプトにパイプします（これはArrowストリーミングフォーマットで入力ストリームを読み込み、結果をPandasテーブルとして出力します）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

これで、ClickHouseからデータをストリーミングするために、その出力をスクリプトにパイプできます：

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouseも同じArrowStreamフォーマットを使用してArrowストリームを読み取ることができます：

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

`arrow-stream` をArrowストリーミングデータの可能なソースとして使用しました。

## ORCデータのインポートとエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) フォーマットは、通常Hadoop用に使用される列指向ストレージフォーマットです。ClickHouseは、[ORC format](/interfaces/formats.md/#data-format-orc) を使用して [Orc data](assets/data.orc) のインポートおよびエクスポートをサポートしています：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、エクスポートおよびインポートを調整するために、 [data types matching](/interfaces/formats/ORC) および [additional settings](/interfaces/formats/Parquet#format-settings) を確認してください。

## さらなる読み物 {#further-reading}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするため、多くのフォーマット（テキストおよびバイナリ）のサポートを導入しています。以下の記事で、より多くのフォーマットやそれらとの作業方法を探求してください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を確認してください - ClickHouseサーバーなしでローカル/リモートファイルで作業するためのフル機能を持ったポータブルツールです。
