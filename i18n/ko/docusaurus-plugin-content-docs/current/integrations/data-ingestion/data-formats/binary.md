---
sidebar_label: '바이너리 및 네이티브'
slug: /integrations/data-formats/binary-native
title: 'ClickHouse에서 네이티브 및 바이너리 형식 사용하기'
description: 'ClickHouse에서 네이티브 및 바이너리 형식을 사용하는 방법을 설명하는 페이지입니다'
keywords: ['바이너리 형식', '네이티브 형식', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', '데이터 형식', '성능', '압축']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouse에서 네이티브(Native) 및 바이너리 포맷 사용하기 \{#using-native-and-binary-formats-in-clickhouse\}

ClickHouse는 여러 가지 바이너리 포맷을 지원하며, 이는 성능과 저장 공간 효율성을 높이는 데 도움이 됩니다. 바이너리 포맷은 데이터가 바이너리 형태로 저장되기 때문에 문자 인코딩 측면에서도 안전합니다.

데모를 위해 some_data [테이블](assets/some_data.sql)과 [데이터](assets/some_data.tsv)를 사용합니다. 동일한 예제를 사용 중인 ClickHouse 인스턴스에서 그대로 재현해 보십시오.

## Native ClickHouse 형식으로 내보내기 \{#exporting-in-a-native-clickhouse-format\}

ClickHouse 노드 간에 데이터를 내보내고 가져오는 가장 효율적인 데이터 형식은 [Native](/interfaces/formats/Native) 형식입니다. 데이터를 내보낼 때에는 `INTO OUTFILE` 절을 사용합니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

이렇게 하면 네이티브 포맷으로 [data.clickhouse](assets/data.clickhouse) 파일이 생성됩니다.


### Native 형식에서 가져오기 \{#importing-from-a-native-format\}

데이터를 가져올 때는 작은 파일이거나 탐색 목적일 경우 [file()](/sql-reference/table-functions/file.md)을 사용할 수 있습니다:

```sql
DESCRIBE file('data.clickhouse', Native);
```

```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

:::tip
`file()` 함수를 사용할 때 ClickHouse Cloud를 사용 중이라면, 파일이 위치한 머신에서 `clickhouse client`에서 명령을 실행해야 합니다. 또 다른 방법은 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 사용하여 로컬에서 파일을 조회하는 것입니다.
:::

프로덕션 환경에서는 데이터를 가져오기 위해 `FROM INFILE`을 사용합니다.

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```


### Native 포맷 압축 \{#native-format-compression\}

데이터를 Native 포맷(및 대부분의 다른 포맷)으로 내보낼 때 `COMPRESSION` 절을 사용하여 압축을 활성화할 수도 있습니다.

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

내보내기에는 LZ4 압축을 사용했습니다. 데이터를 가져올 때에도 이를 명시해야 합니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```


## RowBinary로 내보내기 \{#exporting-to-rowbinary\}

지원되는 또 다른 바이너리 형식은 [RowBinary](/interfaces/formats/RowBinary)이며, 바이너리로 표현된 행(행 단위 데이터)을 가져오고 내보내는 데 사용할 수 있습니다.

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

이 명령을 실행하면 RowBinary(바이너리 행) 형식의 [data.binary](assets/data.binary) 파일이 생성됩니다.


### RowBinary 파일 살펴보기 \{#exploring-rowbinary-files\}

이 포맷에서는 자동 스키마 추론이 지원되지 않으므로, 적재 전에 데이터를 살펴보려면 스키마를 명시적으로 정의해야 합니다:

```sql
SELECT *
FROM file('data.binary', RowBinary, 'path String, month Date, hits UInt32')
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

컬럼 목록을 포함하는 헤더 행을 추가하는 [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames) 사용을 고려하십시오. [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)는 컬럼 타입을 포함하는 추가 헤더 행도 함께 추가합니다.


### RowBinary 파일에서 가져오기 \{#importing-from-rowbinary-files\}

RowBinary 파일에서 데이터를 로드하려면 `FROM INFILE` 절을 사용할 수 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```


## RawBLOB을 사용하여 단일 바이너리 값 가져오기 \{#importing-single-binary-value-using-rawblob\}

전체 바이너리 파일을 읽어 테이블의 컬럼에 저장하려고 한다고 가정합니다.
이 경우 [RawBLOB format](/interfaces/formats/RawBLOB)을 사용할 수 있습니다. 이 포맷은 단일 컬럼으로 구성된 테이블에서만 직접 사용할 수 있습니다:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

`images` 테이블에 이미지 파일을 저장해 보겠습니다:`

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data` 필드의 길이를 확인하면 원본 파일 크기와 동일함을 알 수 있습니다:

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```


### RawBLOB 데이터 내보내기 \{#exporting-rawblob-data\}

이 형식은 `INTO OUTFILE` 절을 사용하여 데이터를 내보낼 때도 사용할 수 있습니다:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

단일 값보다 많은 데이터를 내보내면 파일이 손상되므로 `LIMIT 1`을 사용해야 했습니다.


## MessagePack \{#messagepack\}

ClickHouse는 [MsgPack](/interfaces/formats/MsgPack)을 사용하여 [MessagePack](https://msgpack.org/) 형식으로 데이터를 가져오고 내보내는 작업을 지원합니다. MessagePack 형식으로 데이터를 내보내려면 다음을 수행합니다.

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePack 파일](assets/data.msgpk)에서 데이터를 불러오려면:

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```


## Protocol Buffers \{#protocol-buffers\}

<CloudNotSupportedBadge />

[Protocol Buffers](/interfaces/formats/Protobuf)로 작업하려면 먼저 [스키마 파일](assets/schema.proto)을 정의해야 합니다.

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

이 스키마 파일(여기서는 `schema.proto`)의 경로는 [Protobuf](/interfaces/formats/Protobuf) 포맷의 `format_schema` 설정 옵션에 설정됩니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

이 작업은 데이터를 [proto.bin](assets/proto.bin) 파일에 저장합니다. ClickHouse는 중첩 메시지를 포함한 Protobuf 데이터의 가져오기도 지원합니다. 단일 Protocol Buffer 메시지를 처리해야 하는 경우 [ProtobufSingle](/interfaces/formats/ProtobufSingle) 사용을 고려하십시오(이 경우 길이 구분자는 생략됩니다).


## Cap&#39;n Proto \{#capn-proto\}

<CloudNotSupportedBadge />

ClickHouse가 지원하는 또 다른 대표적인 바이너리 직렬화 포맷은 [Cap&#39;n Proto](https://capnproto.org/)입니다. `Protobuf` 포맷과 마찬가지로 이 예제에서는 스키마 파일([`schema.capnp`](assets/schema.capnp))을 정의해야 합니다.

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

이제 [CapnProto](/interfaces/formats/CapnProto) 형식과 다음 스키마를 사용하여 데이터를 가져오고 내보낼 수 있습니다.

```sql
SELECT
    path,
    CAST(month, 'UInt32') AS month,
    hits
FROM some_data
INTO OUTFILE 'capnp.bin'
FORMAT CapnProto
SETTINGS format_schema = 'schema:PathStats'
```

`Date` 컬럼을 해당 [대응 타입과 일치시키기 위해](/interfaces/formats/CapnProto#data_types-matching-capnproto) `UInt32`로 형변환해야 한다는 점에 유의하십시오.


## 기타 포맷 \{#other-formats\}

ClickHouse는 다양한 시나리오와 플랫폼을 지원하기 위해 텍스트 및 바이너리 포맷을 포함한 많은 포맷을 지원합니다. 다음 문서에서 더 많은 포맷과 이를 사용하는 방법을 살펴보십시오:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex 및 Template](templates-regex.md)
- **Native 및 바이너리 포맷**
- [SQL 포맷](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)을 확인하십시오. ClickHouse 서버를 시작하지 않고도 로컬/원격 파일에서 작업할 수 있는 휴대용 완전 기능 도구입니다.