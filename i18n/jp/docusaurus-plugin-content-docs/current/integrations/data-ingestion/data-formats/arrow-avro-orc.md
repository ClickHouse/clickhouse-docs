---
sidebar_label: 'Avro、Arrow および ORC'
sidebar_position: 5
slug: '/integrations/data-formats/arrow-avro-orc'
title: 'ClickHouse で Avro、Arrow、および ORC データを操作する'
description: 'Avro、Arrow、および ORC データの ClickHouse での操作方法を説明するページ'
---




# ClickHouseにおけるAvro、Arrow、およびORCデータの操作

Apacheは、人気のある [Avro](https://avro.apache.org/)、 [Arrow](https://arrow.apache.org/)、および [Orc](https://orc.apache.org/) を含む分析環境で積極的に使用される複数のデータ形式をリリースしました。ClickHouseは、これらの形式を使用してデータのインポートとエクスポートをサポートしています。

## Avro形式でのインポートとエクスポート {#importing-and-exporting-in-avro-format}

ClickHouseは、Hadoopシステムで広く使用されている [Apache Avro](https://avro.apache.org/) データファイルの読み書きをサポートしています。

[avroファイル](assets/data.avro)からインポートするには、`INSERT`ステートメントで [Avro](/interfaces/formats.md/#data-format-avro) 形式を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[ファイル()](/sql-reference/functions/files.md/#file) 関数を使用することで、実際にデータをインポートする前にAvroファイルを探索することもできます：

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

Avroファイルのインポートまたはエクスポート時には [データ型マッチング](/interfaces/formats/Avro#data-types-matching) を考慮してください。Avroファイルからデータを読み込む際には明示的な型キャストを使用して変換してください：

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

### Kafka内のAvroメッセージ {#avro-messages-in-kafka}

KafkaメッセージがAvro形式を使用する場合、ClickHouseは [AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent) 形式と [Kafka](/engines/table-engines/integrations/kafka.md) エンジンを使用してそのようなストリームを読み取ることができます：

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

## Arrow形式での作業 {#working-with-arrow-format}

もう一つの列指向形式は [Apache Arrow](https://arrow.apache.org/) で、ClickHouseではインポートおよびエクスポートをサポートしています。[Arrowファイル](assets/data.arrow)からデータをインポートするには、[Arrow](/interfaces/formats.md/#data-format-arrow) 形式を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrowファイルへのエクスポートも同様に機能します：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、[データ型マッチング](/interfaces/formats/Arrow#data-types-matching) を確認して、手動で変換する必要があるかどうかを確認してください。

### Arrowデータのストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats.md/#data-format-arrow-stream) 形式を使用してArrowストリーミング（メモリ内プロセッシングに使用される）で作業することができます。ClickHouseはArrowストリームの読み書きが可能です。

ClickHouseがどのようにArrowデータをストリーミングできるかを示すために、以下のpythonスクリプトに出力をパイプします（これはArrowストリーミング形式の入力ストリームを読み取り、結果をPandasテーブルとして出力します）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

次に、ClickHouseからデータをストリーミングし、その出力をスクリプトにパイプします：

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouseも同じArrowStream形式を使用してArrowストリームを読み取ることができます：

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

`arrow-stream`をArrowストリーミングデータの可能なソースとして使用しました。

## ORCデータのインポートとエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) 形式は、通常はHadoop向けに使用される列指向ストレージ形式です。ClickHouseは、[ORC形式](/interfaces/formats.md/#data-format-orc)を使用して [Orcデータ](assets/data.orc)のインポートとエクスポートをサポートしています：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、エクスポートとインポートを調整するために、[データ型マッチング](/interfaces/formats/ORC)と[追加設定](/interfaces/formats/Parquet#format-settings)を確認してください。

## さらなる情報 {#further-reading}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキストとバイナリの多くの形式をサポートしています。以下の記事で、さらに多くの形式とそれらとの作業方法を探検してください：

- [CSVとTSV形式](csv-tsv.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を確認してください。これは、ClickHouseサーバーを必要とせずにローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
