---
sidebar_label: 'Avro、Arrow、ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: 'ClickHouse における Avro、Arrow、ORC データの利用'
description: 'ClickHouse で Avro、Arrow、ORC データを扱う方法について説明するページ'
keywords: ['Apache Avro', 'Apache Arrow', 'ORC format', 'columnar formats', 'big data formats']
doc_type: 'guide'
---



# ClickHouse での Avro、Arrow、ORC データの扱い方

Apache は、一般的な [Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/)、[Orc](https://orc.apache.org/) を含む、分析環境で広く利用されている複数のデータ形式を提供しています。ClickHouse は、これらの形式を使用したデータのインポートおよびエクスポートの両方をサポートしています。



## Avro形式でのインポートとエクスポート {#importing-and-exporting-in-avro-format}

ClickHouseは、Hadoopシステムで広く使用されている[Apache Avro](https://avro.apache.org/)データファイルの読み取りと書き込みをサポートしています。

[avroファイル](assets/data.avro)からインポートするには、`INSERT`文で[Avro](/interfaces/formats/Avro)形式を指定します:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[file()](/sql-reference/functions/files.md/#file)関数を使用すると、実際にデータをインポートする前にAvroファイルの内容を確認することもできます:

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

Avroファイルにエクスポートするには:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### AvroとClickHouseのデータ型 {#avro-and-clickhouse-data-types}

Avroファイルをインポートまたはエクスポートする際は、[データ型のマッピング](/interfaces/formats/Avro#data-type-mapping)を考慮してください。Avroファイルからデータを読み込む際は、明示的な型キャストを使用して変換します:

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

KafkaメッセージがAvro形式を使用している場合、ClickHouseは[AvroConfluent](/interfaces/formats/AvroConfluent)形式と[Kafka](/engines/table-engines/integrations/kafka.md)エンジンを使用してそのようなストリームを読み取ることができます:

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


## Arrow形式の操作 {#working-with-arrow-format}

もう一つのカラム型形式として[Apache Arrow](https://arrow.apache.org/)があり、ClickHouseではインポートとエクスポートの両方でサポートされています。[Arrowファイル](assets/data.arrow)からデータをインポートするには、[Arrow](/interfaces/formats/Arrow)形式を使用します:

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrowファイルへのエクスポートも同様に動作します:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、手動で変換が必要なデータ型があるかどうかを確認するには、[データ型のマッチング](/interfaces/formats/Arrow#data-types-matching)を参照してください。

### Arrowデータストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats/ArrowStream)形式は、Arrowストリーミング(インメモリ処理に使用)を操作するために使用できます。ClickHouseはArrowストリームの読み取りと書き込みが可能です。

ClickHouseがArrowデータをストリーミングする方法を実演するために、以下のPythonスクリプトにパイプしてみましょう(このスクリプトはArrowストリーミング形式で入力ストリームを読み取り、結果をPandasテーブルとして出力します):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

これで、ClickHouseからの出力をスクリプトにパイプすることでデータをストリーミングできます:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouseは同じArrowStream形式を使用してArrowストリームを読み取ることもできます:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

ここでは`arrow-stream`をArrowストリーミングデータの可能なソースとして使用しました。


## ORCデータのインポートとエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/)形式は、主にHadoopで使用されるカラム型ストレージ形式です。ClickHouseは[ORC形式](/interfaces/formats/ORC)を使用して[ORCデータ](assets/data.orc)のインポートとエクスポートの両方をサポートしています:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、エクスポートとインポートを調整するには、[データ型のマッピング](/interfaces/formats/ORC)および[追加設定](/interfaces/formats/Parquet#format-settings)を確認してください。


## 参考資料 {#further-reading}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方で多数のフォーマットをサポートしています。以下の記事で、より多くのフォーマットとその操作方法を確認できます：

- [CSVおよびTSV形式](csv-tsv.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これはClickHouseサーバーを必要とせず、ローカル/リモートファイルを操作できる、ポータブルでフル機能を備えたツールです。
