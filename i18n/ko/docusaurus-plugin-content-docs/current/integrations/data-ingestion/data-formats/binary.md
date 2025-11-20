---
'sidebar_label': '이진 및 네이티브'
'slug': '/integrations/data-formats/binary-native'
'title': 'ClickHouse에서 네이티브 및 이진 형식 사용하기'
'description': 'ClickHouse에서 네이티브 및 이진 형식을 사용하는 방법을 설명하는 페이지'
'keywords':
- 'binary formats'
- 'native format'
- 'rowbinary'
- 'rawblob'
- 'messagepack'
- 'protobuf'
- 'capn proto'
- 'data formats'
- 'performance'
- 'compression'
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 네이티브 및 이진 형식 사용하기

ClickHouse는 여러 이진 형식을 지원하며, 이는 더 나은 성능과 공간 효율성을 제공합니다. 이진 형식은 데이터를 이진 형태로 저장하기 때문에 문자 인코딩에서도 안전합니다.

우리는 시연을 위해 some_data [테이블](assets/some_data.sql)과 [데이터](assets/some_data.tsv)를 사용할 것이며, 여러분의 ClickHouse 인스턴스에서 자유롭게 재현하실 수 있습니다.

## 네이티브 ClickHouse 형식으로 내보내기 {#exporting-in-a-native-clickhouse-format}

ClickHouse 노드 간 데이터 내보내기 및 가져오기에 가장 효율적인 데이터 형식은 [Native](/interfaces/formats/Native) 형식입니다. 내보내기는 `INTO OUTFILE` 절을 사용하여 수행됩니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

이것은 네이티브 형식으로 [data.clickhouse](assets/data.clickhouse) 파일을 생성합니다.

### 네이티브 형식에서 가져오기 {#importing-from-a-native-format}

데이터를 가져오기 위해, 우리는 작은 파일이나 탐색 용도에 대해 [file()](/sql-reference/table-functions/file.md)을 사용할 수 있습니다:

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
`file()` 함수 사용 시, ClickHouse Cloud에서는 파일이 있는 머신에서 `clickhouse client` 명령을 실행해야 합니다. 또 다른 옵션은 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 사용하여 로컬에서 파일을 탐색하는 것입니다.
:::

운영 환경에서는 `FROM INFILE`을 사용하여 데이터를 가져옵니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### 네이티브 형식 압축 {#native-format-compression}

우리는 또한 `COMPRESSION` 절을 사용하여 네이티브 형식(및 대부분의 다른 형식)에 데이터를 내보낼 때 압축을 활성화할 수 있습니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

우리는 내보내기 위해 LZ4 압축을 사용했습니다. 데이터를 가져올 때 이 압축을 지정해야 합니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinary로 내보내기 {#exporting-to-rowbinary}

지원되는 또 다른 이진 형식은 [RowBinary](/interfaces/formats/RowBinary)로, 이진 형식의 행에서 데이터를 가져오고 내보낼 수 있습니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

이것은 이진 행 형식으로 [data.binary](assets/data.binary) 파일을 생성합니다.

### RowBinary 파일 탐색 {#exploring-rowbinary-files}
이 형식은 자동 스키마 추론을 지원하지 않으므로, 로드하기 전에 탐색하려면 스키마를 명시적으로 정의해야 합니다:

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

[RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames) 사용을 고려해 보세요. 이 형식은 컬럼 목록이 포함된 헤더 행을 추가합니다. [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)는 컬럼 유형이 포함된 추가 헤더 행도 추가합니다.

### RowBinary 파일에서 가져오기 {#importing-from-rowbinary-files}
RowBinary 파일에서 데이터를 로드하려면 `FROM INFILE` 절을 사용할 수 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOB을 사용하여 단일 이진 값 가져오기 {#importing-single-binary-value-using-rawblob}

우리가 전체 이진 파일을 읽고 테이블의 필드에 저장하고자 한다고 가정합시다.
이 경우 [RawBLOB 형식](/interfaces/formats/RawBLOB)을 사용할 수 있습니다. 이 형식은 단일 열 테이블과 함께만 직접 사용할 수 있습니다:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

`images` 테이블에 이미지 파일을 저장합시다:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

원본 파일 크기와 동일한 `data` 필드 길이를 확인할 수 있습니다:

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOB 데이터 내보내기 {#exporting-rawblob-data}

이 형식은 `INTO OUTFILE` 절을 사용하여 데이터를 내보내는 데에도 사용할 수 있습니다:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

우리는 단일 값 이상을 내보내면 손상된 파일이 생성되므로 `LIMIT 1`을 사용해야 했음을 유의해 주세요.

## MessagePack {#messagepack}

ClickHouse는 [MsgPack](/interfaces/formats/MsgPack)을 사용하여 [MessagePack](https://msgpack.org/)으로 가져오고 내보내는 것을 지원합니다. MessagePack 형식으로 내보내려면:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePack 파일](assets/data.msgpk)에서 데이터를 가져오려면:

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## 프로토콜 버퍼 {#protocol-buffers}

<CloudNotSupportedBadge/>

[Protocol Buffers](/interfaces/formats/Protobuf)와 작업하려면 먼저 [스키마 파일](assets/schema.proto)을 정의해야 합니다:

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

이 스키마 파일(`schema.proto`의 경우)의 경로는 [Protobuf](/interfaces/formats/Protobuf) 형식에 대한 `format_schema` 설정 옵션에서 설정됩니다:

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

이것은 데이터를 [proto.bin](assets/proto.bin) 파일에 저장합니다. ClickHouse는 또한 Protobuf 데이터 및 중첩 메시지를 가져오는 것을 지원합니다. 단일 Protocol Buffer 메시지와 작업하려면 [ProtobufSingle](/interfaces/formats/ProtobufSingle) 사용을 고려하세요(이 경우 길이 한계를 생략합니다).

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouse에서 지원하는 또 다른 인기 있는 이진 직렬화 형식은 [Cap'n Proto](https://capnproto.org/)입니다. `Protobuf` 형식과 마찬가지로, 우리의 예에서 스키마 파일([`schema.capnp`](assets/schema.capnp))을 정의해야 합니다:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

이제 [CapnProto](/interfaces/formats/CapnProto) 형식과 이 스키마를 사용하여 가져오고 내보낼 수 있습니다:

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

`Date` 컬럼을 [해당 유형에 맞게](interfaces/formats/CapnProto#data_types-matching-capnproto) `UInt32`로 캐스팅해야 했음을 유의하세요.

## 기타 형식 {#other-formats}

ClickHouse는 다양한 시나리오와 플랫폼을 지원하기 위해 많은 형식, 텍스트 및 이진 형식을 도입합니다. 다음 기사에서 더 많은 형식과 작업하는 방법을 탐색하세요:

- [CSV 및 TSV 형식](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규 표현식 및 템플릿](templates-regex.md)
- **네이티브 및 이진 형식**
- [SQL 형식](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)를 확인하세요 - ClickHouse 서버를 시작하지 않고도 로컬/원격 파일에서 작업할 수 있는 포터블 완전한 기능의 도구입니다.
