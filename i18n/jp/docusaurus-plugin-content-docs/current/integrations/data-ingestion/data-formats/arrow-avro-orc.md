---
sidebar_label: 'Avro、Arrow、ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: 'ClickHouse における Avro、Arrow、ORC データの扱い'
description: 'ClickHouse で Avro、Arrow、ORC 形式のデータを扱う方法を説明するページ'
keywords: ['Apache Avro', 'Apache Arrow', 'ORC 形式', 'カラムナ形式', 'ビッグデータ形式']
doc_type: 'guide'
---

# ClickHouse で Avro、Arrow、ORC データを扱う {#working-with-avro-arrow-and-orc-data-in-clickhouse}

Apache は、分析環境で広く利用されている複数のデータ形式を提供しており、その中には広く利用されている [Avro](https://avro.apache.org/)、[Arrow](https://arrow.apache.org/)、[Orc](https://orc.apache.org/) などが含まれます。ClickHouse では、これらのいずれの形式を用いたデータのインポートおよびエクスポートが可能です。

## Avro 形式でのインポートおよびエクスポート {#importing-and-exporting-in-avro-format}

ClickHouse は、Hadoop システムで広く使用されている [Apache Avro](https://avro.apache.org/) データファイルの読み書きをサポートしています。

[avro ファイル](assets/data.avro)からインポートするには、`INSERT` 文で [Avro](/interfaces/formats/Avro) 形式を使用します。

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[file()](/sql-reference/functions/files.md/#file) 関数を使用すると、実際にデータをインポートする前に Avro ファイルを事前に調査することもできます。

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

Avro ファイルにエクスポートするには：

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro と ClickHouse のデータ型 {#avro-and-clickhouse-data-types}

Avro ファイルをインポートまたはエクスポートする際は、[データ型の対応](/interfaces/formats/Avro#data-type-mapping) を確認してください。Avro ファイルからデータを読み込む際には、明示的な型キャストを使用して変換してください。

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

Kafka メッセージが Avro 形式を使用している場合、ClickHouse は [AvroConfluent](/interfaces/formats/AvroConfluent) フォーマットと [Kafka](/engines/table-engines/integrations/kafka.md) エンジンを使用して、これらのストリームを読み取ることができます。

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

## Arrow フォーマットの利用 {#working-with-arrow-format}

もう一つのカラムナフォーマットとして [Apache Arrow](https://arrow.apache.org/) があります。これは ClickHouse でのインポートおよびエクスポートにも対応しています。[Arrow ファイル](assets/data.arrow) からデータをインポートするには、[Arrow](/interfaces/formats/Arrow) フォーマットを使用します。

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrow ファイルへのエクスポートも同様に行えます。

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

また、[data types matching](/interfaces/formats/Arrow#data-types-matching) を参照して、手動で変換が必要な型がないか確認してください。

### Arrow データストリーミング {#arrow-data-streaming}

[ArrowStream](/interfaces/formats/ArrowStream) フォーマットは、Arrow ストリーミング（インメモリ処理に使用）データを扱うために利用できます。ClickHouse は Arrow ストリームの読み書きが可能です。

ClickHouse がどのように Arrow データをストリーミングできるかを示すために、次の Python スクリプトにパイプで渡します（Arrow ストリーミング形式の入力ストリームを読み取り、結果を Pandas のテーブルとして出力します）：

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

これで、ClickHouse の出力をスクリプトにパイプしてデータをストリーミングできるようになりました。

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse は、同じ ArrowStream フォーマットを使用することで Arrow ストリームも読み取れます。

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

Arrow ストリーミングデータのソースの一例として `arrow-stream` を使用しました。

## ORC データのインポートとエクスポート {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) は、主に Hadoop で使用される列指向ストレージ形式です。ClickHouse は、[ORC フォーマット](/interfaces/formats/ORC) を使用して [ORC データ](assets/data.orc) のインポートおよびエクスポートの両方をサポートしています。

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

また、エクスポートおよびインポートを最適化するために、[データ型の対応](/interfaces/formats/ORC)や[追加設定](/interfaces/formats/Parquet#format-settings)も確認してください。

## 参考情報 {#further-reading}

ClickHouse は、多様なシナリオやプラットフォームをカバーするために、テキスト形式とバイナリ形式の両方を含む多数の形式をサポートしています。形式の種類やその扱い方については、次の記事を参照してください。

- [CSV と TSV 形式](csv-tsv.md)
- [JSON 形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL 形式](sql.md)

あわせて [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も参照してください。ClickHouse サーバーを用意することなく、ローカル / リモートのファイルを扱うことができる、ポータブルなフル機能ツールです。
