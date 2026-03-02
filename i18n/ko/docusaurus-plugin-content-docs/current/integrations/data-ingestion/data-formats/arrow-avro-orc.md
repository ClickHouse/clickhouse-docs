---
sidebar_label: 'Avro, Arrow 및 ORC'
sidebar_position: 5
slug: /integrations/data-formats/arrow-avro-orc
title: 'ClickHouse에서 Avro, Arrow 및 ORC 데이터 다루기'
description: 'ClickHouse에서 Avro, Arrow 및 ORC 데이터를 다루는 방법을 설명하는 페이지'
keywords: ['Apache Avro', 'Apache Arrow', 'ORC 포맷', '컬럼형 포맷', '빅데이터 포맷']
doc_type: 'guide'
---



# ClickHouse에서 Avro, Arrow, ORC 데이터를 사용하는 방법 \{#working-with-avro-arrow-and-orc-data-in-clickhouse\}

Apache는 분석 환경에서 활발히 사용되는 여러 데이터 포맷을 정의했으며, 여기에는 널리 사용되는 [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/), [ORC](https://orc.apache.org/)가 포함됩니다. ClickHouse는 이 목록에 있는 모든 형식을 사용하여 데이터를 가져오고 내보내는 기능을 지원합니다.



## Avro 형식으로 가져오기 및 내보내기 \{#importing-and-exporting-in-avro-format\}

ClickHouse는 Hadoop 시스템에서 널리 사용되는 [Apache Avro](https://avro.apache.org/) 데이터 파일을 읽고 쓸 수 있습니다.

[avro 파일](assets/data.avro)에서 데이터를 가져오려면 `INSERT` 구문에서 [Avro](/interfaces/formats/Avro) 형식을 사용하면 됩니다.

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

[file()](/sql-reference/functions/files.md/#file) 함수를 사용하면 데이터를 실제로 가져오기 전에 Avro 파일을 미리 살펴볼 수도 있습니다:

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

### Avro 및 ClickHouse 데이터 유형 \{#avro-and-clickhouse-data-types\}

Avro 파일을 가져오거나 내보낼 때 [데이터 유형 매칭](/interfaces/formats/Avro#data-type-mapping)을 고려하십시오. Avro 파일에서 데이터를 로드할 때는 명시적 형 변환을 사용하여 데이터 유형을 변환하십시오.

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

### Kafka에서 Avro 메시지 사용 \{#avro-messages-in-kafka\}

Kafka 메시지가 Avro 형식을 사용할 때 ClickHouse는 [AvroConfluent](/interfaces/formats/AvroConfluent) 형식과 [Kafka](/engines/table-engines/integrations/kafka.md) 엔진을 사용하여 이와 같은 스트림을 읽을 수 있습니다.

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


## Arrow 포맷 다루기 \{#working-with-arrow-format\}

또 다른 컬럼형 포맷으로 [Apache Arrow](https://arrow.apache.org/)가 있으며, ClickHouse에서는 가져오기와 내보내기 모두를 지원합니다. [Arrow 파일](assets/data.arrow)에서 데이터를 가져오기 위해 [Arrow](/interfaces/formats/Arrow) 포맷을 사용합니다.

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Arrow 파일로의 내보내기도 동일한 방식으로 동작합니다:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

또한 수동으로 변환해야 하는 데이터 타입이 있는지 확인하려면 [data types matching](/interfaces/formats/Arrow#data-types-matching)을(를) 참조하십시오.

### Arrow 데이터 스트리밍 \{#arrow-data-streaming\}

[ArrowStream](/interfaces/formats/ArrowStream) 형식을 사용하면 Arrow 스트리밍(메모리 내 처리에 사용됨)으로 데이터를 처리할 수 있습니다. ClickHouse는 Arrow 스트림을 읽고 쓸 수 있습니다.

ClickHouse가 Arrow 데이터를 어떻게 스트리밍할 수 있는지 보여주기 위해 다음 Python 스크립트로 파이프로 전달해 보겠습니다(이 스크립트는 Arrow 스트리밍 형식으로 입력 스트림을 읽고, 결과를 Pandas 테이블로 출력합니다):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

이제 ClickHouse의 출력을 스크립트로 파이프로 전달하여 데이터를 스트리밍할 수 있습니다.

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```

```response
                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse에서는 동일한 ArrowStream 포맷을 사용하여 Arrow 스트림도 읽을 수 있습니다.

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

`arrow-stream`을 Arrow 스트리밍 데이터의 소스 중 하나로 사용했습니다.


## ORC 데이터 가져오기 및 내보내기 \{#importing-and-exporting-orc-data\}

[Apache ORC](https://orc.apache.org/) 형식은 Hadoop 환경에서 주로 사용되는 열 지향 저장 형식입니다. ClickHouse는 [ORC 형식](/interfaces/formats/ORC)을 사용하여 [ORC 데이터](assets/data.orc)의 가져오기(import)와 내보내기(export)를 모두 지원합니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

또한 내보내기와 가져오기 동작을 조정하려면 [데이터 타입 매핑](/interfaces/formats/ORC)과 [추가 설정](/interfaces/formats/Parquet#format-settings)도 함께 확인하십시오.


## 추가 자료 \{#further-reading\}

ClickHouse는 다양한 시나리오와 플랫폼을 지원하기 위해 텍스트 및 바이너리 형식을 포함한 여러 포맷을 지원합니다. 다음 문서에서 더 많은 포맷과 이를 다루는 방법을 살펴보십시오:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규식 및 템플릿](templates-regex.md)
- [네이티브 및 바이너리 포맷](binary.md)
- [SQL 포맷](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인하십시오. ClickHouse 서버 없이 로컬/원격 파일을 다룰 수 있는 휴대성이 뛰어난 전체 기능 도구입니다.
