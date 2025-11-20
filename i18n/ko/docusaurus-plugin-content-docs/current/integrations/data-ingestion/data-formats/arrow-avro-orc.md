---
'sidebar_label': 'Avro, Arrow 및 ORC'
'sidebar_position': 5
'slug': '/integrations/data-formats/arrow-avro-orc'
'title': 'ClickHouse에서 Avro, Arrow 및 ORC 데이터 작업하기'
'description': 'ClickHouse에서 Avro, Arrow 및 ORC 데이터와 작업하는 방법에 대한 페이지'
'keywords':
- 'Apache Avro'
- 'Apache Arrow'
- 'ORC format'
- 'columnar formats'
- 'big data formats'
'doc_type': 'guide'
---



# ClickHouse에서 Avro, Arrow 및 ORC 데이터 작업하기

Apache는 널리 사용되는 다양한 데이터 형식, 특히 [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/), [Orc](https://orc.apache.org/)와 같은 형식을 분석 환경에서 적극적으로 제공하고 있습니다. ClickHouse는 이 목록에 있는 형식을 사용하여 데이터를 가져오고 내보내는 것을 지원합니다.

## Avro 형식으로 가져오기 및 내보내기 {#importing-and-exporting-in-avro-format}

ClickHouse는 Hadoop 시스템에서 널리 사용되는 [Apache Avro](https://avro.apache.org/) 데이터 파일을 읽고 쓸 수 있습니다.

[avro 파일](assets/data.avro)에서 가져오려면 `INSERT` 문에서 [Avro](/interfaces/formats/Avro) 형식을 사용해야 합니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[file()](/sql-reference/functions/files.md/#file) 함수를 사용하면 실제로 데이터를 가져오기 전에 Avro 파일을 탐색할 수 있습니다:

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

Avro 파일로 내보내려면:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro 및 ClickHouse 데이터 유형 {#avro-and-clickhouse-data-types}

Avro 파일을 가져오거나 내보낼 때 [데이터 유형 매핑](/interfaces/formats/Avro#data-type-mapping)을 고려하세요. Avro 파일에서 데이터를 로드할 때는 명시적 유형 캐스팅을 사용하여 변환해야 합니다:

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

### Kafka의 Avro 메시지 {#avro-messages-in-kafka}

Kafka 메시지가 Avro 형식을 사용할 때, ClickHouse는 [AvroConfluent](/interfaces/formats/AvroConfluent) 형식과 [Kafka](/engines/table-engines/integrations/kafka.md) 엔진을 사용하여 이러한 스트림을 읽을 수 있습니다:

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

## Arrow 형식으로 작업하기 {#working-with-arrow-format}

또 다른 컬럼형 형식은 [Apache Arrow](https://arrow.apache.org/)이며, ClickHouse에서 가져오기 및 내보내기를 지원합니다. [Arrow 파일](assets/data.arrow)에서 데이터를 가져오기 위해 [Arrow](/interfaces/formats/Arrow) 형식을 사용합니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrow 파일로 내보내는 것은 동일한 방식으로 작동합니다:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

또한, 수동으로 변환해야 하는 것이 있는지 확인하려면 [데이터 유형 매핑](/interfaces/formats/Arrow#data-types-matching)을 확인하세요.

### Arrow 데이터 스트리밍 {#arrow-data-streaming}

[ArrowStream](/interfaces/formats/ArrowStream) 형식을 사용하여 Arrow 스트리밍(메모리 내 처리에 사용)을 작업할 수 있습니다. ClickHouse는 Arrow 스트림을 읽고 쓸 수 있습니다.

ClickHouse가 Arrow 데이터를 스트리밍하는 방법을 보여주기 위해, 다음 python 스크립트에 파이프하여 데이터를 전달해봅시다(입력 스트림을 Arrow 스트리밍 형식으로 읽고 결과를 Pandas 테이블로 출력합니다):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

이제 ClickHouse에서 데이터를 스트리밍할 수 있으며, 스크립트에 출력을 파이프하여 사용할 수 있습니다:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse는 동일한 ArrowStream 형식을 사용하여 Arrow 스트림을 읽을 수도 있습니다:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

우리는 `arrow-stream`을 Arrow 스트리밍 데이터의 가능한 출처로 사용했습니다.

## ORC 데이터 가져오기 및 내보내기 {#importing-and-exporting-orc-data}

[Apache ORC](https://orc.apache.org/) 형식은 일반적으로 Hadoop에 사용되는 컬럼형 저장 형식입니다. ClickHouse는 [ORC 형식](/interfaces/formats/ORC)을 사용하여 [Orc 데이터](assets/data.orc)를 가져오고 내보내는 것을 지원합니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

또한 [데이터 유형 매핑](/interfaces/formats/ORC) 및 [추가 설정](/interfaces/formats/Parquet#format-settings)을 확인하여 가져오기 및 내보내기 조정을 할 수 있습니다.

## 추가 읽기 {#further-reading}

ClickHouse는 다양한 시나리오와 플랫폼을 다루기 위해 텍스트 및 이진 형식에 대한 지원을 도입합니다. 다음 기사를 통해 더 많은 형식과 이를 작업하는 방법을 탐색하세요:

- [CSV 및 TSV 형식](csv-tsv.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규 표현식 및 템플릿](templates-regex.md)
- [네이티브 및 이진 형식](binary.md)
- [SQL 형식](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)를 확인하세요 - Clickhouse 서버 없이 로컬/원격 파일에서 작업할 수 있는 포터블 완전 기능 도구입니다.
