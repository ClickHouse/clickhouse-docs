---
sidebar_label: Avro, Arrow, および ORC
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
---


# ClickHouse での Avro、Arrow、および ORC データの操作

Apache は、人気のある [Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/)、および [Orc](https://orc.apache.org/) を含む、分析環境で広く使用される複数のデータフォーマットをリリースしました。ClickHouse は、そのリストの中から任意のデータフォーマットを使用してデータのインポートとエクスポートをサポートしています。

## Avro フォーマットでのインポートとエクスポート {#importing-and-exporting-in-avro-format}

ClickHouse は、Hadoop システムで広く使用されている [Apache Avro](https://avro.apache.org/) データファイルの読み取りと書き込みをサポートしています。

[avro ファイル](assets/data.avro)からインポートするには、`INSERT` ステートメントで [Avro](/interfaces/formats.md/#data-format-avro) フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[ファイル()](/sql-reference/functions/files.md/#file) 関数を使用すると、実際にデータをインポートする前に Avro ファイルを探索することもできます：

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

Avro ファイルへのエクスポート：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro と ClickHouse のデータ型 {#avro-and-clickhouse-data-types}

Avro ファイルのインポートやエクスポートの際は、[データ型の一致](/interfaces/formats/Avro#data-types-matching)を考慮してください。Avro ファイルからデータを読み込む際には、明示的な型キャスティングを使用して変換を行います：

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

### Kafka における Avro メッセージ {#avro-messages-in-kafka}

Kafka メッセージが Avro フォーマットを使用する場合、ClickHouse は [AvroConfluent](/interfaces/formats.md/#data-format-avro-confluent) フォーマットと [Kafka](/engines/table-engines/integrations/kafka.md) エンジンを使用してそのようなストリームを読み取ることができます：

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

## Arrow フォーマットの操作 {#working-with-arrow-format}

別の列指向フォーマットは [Apache Arrow](https://arrow.apache.org/) で、ClickHouse はインポートとエクスポートをサポートしています。 [Arrow ファイル](assets/data.arrow) からデータをインポートするには、[Arrow](/interfaces/formats.md/#data-format-arrow) フォーマットを使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrow ファイルへのエクスポートも同様に行います：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、[データ型の一致](/interfaces/formats/Arrow#data-types-matching) を確認して、手動で変換すべきデータ型があるかを確認してください。

### Arrow データストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats.md/#data-format-arrow-stream) フォーマットは、Arrow ストリーミング（インメモリ処理に使用）で使用できます。ClickHouse は Arrow ストリームを読み書きできます。

ClickHouse が Arrow データをストリーミングする方法を示すために、以下の Python スクリプトに出力をパイプします（このスクリプトは、Arrow ストリーミングフォーマットで入力ストリームを読み取り、結果を Pandas テーブルとして出力します）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

次に、ClickHouse からデータをストリーミングするために、その出力をスクリプトにパイプします：

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse は、同じ ArrowStream フォーマットを使用して Arrow ストリームを読み取ることもできます：

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

`arrow-stream` を Arrow ストリーミングデータの可能なソースとして使用しました。

## ORC データのインポートとエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) フォーマットは、通常 Hadoop で使用される列指向ストレージフォーマットです。ClickHouse は [ORC フォーマット](/interfaces/formats.md/#data-format-orc)を使用して [Orc データ](assets/data.orc) のインポートとエクスポートをサポートしています：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、[データ型の一致](/interfaces/formats/ORC) および [追加設定](/interfaces/formats/Parquet#format-settings) を確認して、エクスポートやインポートの調整を行ってください。

## さらなる読書 {#further-reading}

ClickHouse は、さまざまなシナリオやプラットフォームに対応するために、テキストおよびバイナリの多くのフォーマットをサポートしています。以下の文書で、より多くのフォーマットとそれらの操作方法を探索してください：

- [CSV および TSV フォーマット](csv-tsv.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQL フォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を確認してください。これは、ClickHouse サーバなしでローカルおよびリモートファイルを操作するためのポータブルでフル機能のツールです。
