---
sidebar_label: Avro, Arrow, および ORC
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
---

# ClickHouseにおけるAvro、Arrow、およびORCデータの操作

Apacheは、アナリティクス環境で広く使用される複数のデータフォーマットを公開しており、その中には人気のある[Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/)、および[Orc](https://orc.apache.org/)が含まれています。ClickHouseは、これらのフォーマットを使用したデータのインポートおよびエクスポートをサポートしています。

## Avroフォーマットでのインポートおよびエクスポート {#importing-and-exporting-in-avro-format}

ClickHouseは、Hadoopシステムで広く使用されている[Apache Avro](https://avro.apache.org/)データファイルの読み書きをサポートしています。

[avroファイル](assets/data.avro)からインポートするには、`INSERT`ステートメントで[Avro](/interfaces/formats.md/#data-format-avro)フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[ファイル()](/sql-reference/functions/files.md/#file)関数を使用すると、データを実際にインポートする前にAvroファイルを調査することもできます：

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

### AvroとClickHouseデータ型 {#avro-and-clickhouse-data-types}

Avroファイルのインポートまたはエクスポート時に、[データ型の一致](/interfaces/formats.md/#data_types-matching)を考慮してください。Avroファイルからデータを読み込む際は、明示的な型キャストを使用して変換します：

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

### KafkaにおけるAvroメッセージ {#avro-messages-in-kafka}

KafkaメッセージがAvroフォーマットを使用している場合、ClickHouseは[AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent)フォーマットと[Kafka](/engines/table-engines/integrations/kafka.md)エンジンを使用してそのストリームを読み取ることができます：

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

## Arrowフォーマットの操作 {#working-with-arrow-format}

別の列指向フォーマットである[Apache Arrow](https://arrow.apache.org/)も、ClickHouseでインポートおよびエクスポートをサポートしています。[Arrowファイル](assets/data.arrow)からデータをインポートするには、[Arrow](/interfaces/formats.md/#data-format-arrow)フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrowファイルへのエクスポートも同様に行えます：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、手動で変換する必要があるかどうかは[データ型の一致](/interfaces/formats.md/#data-types-matching-arrow)を確認してください。

### Arrowデータストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats.md/#data-format-arrow-stream)フォーマットを使用して、Arrowストリーミング（メモリ内処理用に使用される）で作業できます。ClickHouseはArrowストリームを読み書きできます。

ClickHouseがArrowデータをストリーミングできる方法を示すために、次のpythonスクリプトにパイプで送信します（このスクリプトは、Arrowストリーミングフォーマットの入力ストリームを読み取り、結果をPandasテーブルとして出力します）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

次に、ClickHouseからデータをストリーミングし、その出力をスクリプトにパイプで送信できます：

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

ここでは、Arrowストリーミングデータの可能なソースとして`arrow-stream`を使用しました。

## ORCデータのインポートおよびエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/)フォーマットは、通常Hadoopで使用される列指向ストレージフォーマットです。ClickHouseは、[ORCフォーマット](/interfaces/formats.md/#data-format-orc)を使用して[Orcデータ](assets/data.orc)のインポートとエクスポートをサポートしています：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、データ型の一致に関する[注意](/interfaces/formats.md/#data-types-matching-orc)と、インポートとエクスポートを調整するための[追加設定](/interfaces/formats.md/#parquet-format-settings)も確認してください。

## さらなる読み物 {#further-reading}

ClickHouseは、様々なシナリオとプラットフォームをカバーするために、多くのフォーマット（テキストおよびバイナリ）をサポートしています。次の資料で、他のフォーマットやそれらの操作方法についてさらに探求してください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もチェックしてください - これはClickHouseサーバーなしでローカル/リモートファイルで作業するためのポータブルで完全な機能を持つツールです。
