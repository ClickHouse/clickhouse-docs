---
alias: []
description: 'Protobuf 형식에 대한 문서'
input_format: true
keywords: ['Protobuf']
output_format: true
slug: /interfaces/formats/Protobuf
title: 'Protobuf'
doc_type: 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description \{#description\}

`Protobuf` 포맷은 [Protocol Buffers](https://protobuf.dev/) 포맷입니다.

이 포맷은 쿼리 간에 캐시되는 외부 포맷 스키마가 필요합니다.

ClickHouse는 다음을 지원합니다:

* `proto2`와 `proto3` 문법 모두
* `Repeated`/`optional`/`required` 필드

테이블 컬럼과 Protocol Buffers 메시지 타입의 필드 간 대응을 찾기 위해 ClickHouse는 이름을 비교합니다.
이 비교는 대소문자를 구분하지 않으며, `_`(언더스코어)와 `.`(점) 문자를 동일하게 간주합니다.
컬럼과 Protocol Buffers 메시지 필드의 타입이 다른 경우, 필요한 변환이 적용됩니다.

중첩 메시지가 지원됩니다. 예를 들어, 다음 메시지 타입에서 `z` 필드에 대해:

```capnp
message MessageType {
  message XType {
    message YType {
      int32 z;
    };
    repeated YType y;
  };
  XType x;
};
```

ClickHouse는 `x.y.z`(또는 `x_y_z`, `X.y_Z` 등)라는 이름의 컬럼을 찾습니다.

중첩 메시지는 [중첩 데이터 구조](/sql-reference/data-types/nested-data-structures/index.md)의 입력 또는 출력에 적합합니다.

아래와 같은 protobuf 스키마에 정의된 기본값은 적용되지 않고, 대신 [테이블 기본값](/sql-reference/statements/create/table#default_values)이 사용됩니다.

```capnp
syntax = "proto2";

message MessageType {
  optional int32 result_per_page = 3 [default = 10];
}
```

메시지에 [oneof](https://protobuf.dev/programming-guides/proto3/#oneof)가 포함되어 있고 `input_format_protobuf_oneof_presence`가 설정된 경우, ClickHouse는 해당 oneof 중 어떤 필드가 발견되었는지 나타내는 컬럼을 채웁니다.

```capnp
syntax = "proto3";

message StringOrString {
  oneof string_oneof {
    string string1 = 1;
    string string2 = 42;
  }
}
```

```sql
CREATE TABLE string_or_string ( string1 String, string2 String, string_oneof Enum('no'=0, 'hello' = 1, 'world' = 42))  Engine=MergeTree ORDER BY tuple();
INSERT INTO string_or_string from INFILE '$CURDIR/data_protobuf/String1' SETTINGS format_schema='$SCHEMADIR/string_or_string.proto:StringOrString' FORMAT ProtobufSingle;
SELECT * FROM string_or_string
```

```text
   ┌─────────┬─────────┬──────────────┐
   │ string1 │ string2 │ string_oneof │
   ├─────────┼─────────┼──────────────┤
1. │         │ string2 │ world        │
   ├─────────┼─────────┼──────────────┤
2. │ string1 │         │ hello        │
   └─────────┴─────────┴──────────────┘
```

존재를 나타내는 컬럼의 이름은 `oneof`의 이름과 동일해야 합니다. 중첩 메시지도 지원됩니다([basic-examples](#basic-examples)를 참조하십시오).
허용되는 타입은 Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Enum, Enum8 또는 Enum16입니다.
Enum(및 Enum8, Enum16)은 모든 `oneof`에서 사용 가능한 태그와 부재를 나타내는 0을 모두 포함해야 하며, 문자열 표현은 중요하지 않습니다.

[`input_format_protobuf_oneof_presence`](/operations/settings/settings-formats.md#input_format_protobuf_oneof_presence) 설정은 기본적으로 비활성화되어 있습니다.

ClickHouse는 `length-delimited` 형식으로 protobuf 메시지를 입력하고 출력합니다.
이는 각 메시지 앞에 그 길이를 [가변 길이 정수(varint)](https://developers.google.com/protocol-buffers/docs/encoding#varints)로 기록해야 함을 의미합니다.


## 사용 예제 \{#example-usage\}

### 데이터 읽기 및 쓰기 \{#basic-examples\}

:::note 예제 파일
이 예제에서 사용하는 파일은 [examples repository](https://github.com/ClickHouse/formats/ProtoBuf)에서 확인할 수 있습니다.
:::

이 예제에서는 `protobuf_message.bin` 파일에서 데이터를 읽어 ClickHouse 테이블로 가져옵니다. 그런 다음 `Protobuf` 형식을 사용하여
`protobuf_message_from_clickhouse.bin`이라는 파일로 다시 기록합니다.

다음은 `schemafile.proto` 파일입니다:

```capnp
syntax = "proto3";  
  
message MessageType {  
  string name = 1;  
  string surname = 2;  
  uint32 birthDate = 3;  
  repeated string phoneNumbers = 4;  
};
```


<details>
  <summary>바이너리 파일 생성</summary>

  이미 `Protobuf` 포맷으로 데이터를 직렬화(serialize)하고 역직렬화(deserialize)하는 방법을 알고 있으면, 이 단계는 건너뛰어도 됩니다.

  Python을 사용하여 일부 데이터를 `protobuf_message.bin` 파일로 직렬화한 다음 ClickHouse로 읽어 들이겠습니다.
  다른 언어를 사용하려는 경우 다음 문서도 참고하십시오: [&quot;How to read/write length-delimited Protobuf messages in popular languages&quot;](https://cwiki.apache.org/confluence/display/GEODE/Delimiting+Protobuf+Messages).

  다음 명령을 실행하여 `schemafile.proto`와 같은 디렉터리에
  `schemafile_pb2.py`라는 이름의 Python 파일을 생성하십시오. 이 파일에는
  `UserData` Protobuf 메시지를 표현하는 Python 클래스가 포함됩니다:

  ```bash
  protoc --python_out=. schemafile.proto
  ```

  이제 `schemafile_pb2.py`와 동일한 디렉터리에
  `generate_protobuf_data.py`라는 새 Python 파일을 만드십시오. 다음 코드를 해당 파일에 붙여 넣으십시오:

  ```python
  import schemafile_pb2  # 'protoc'에 의해 생성된 모듈
  from google.protobuf import text_format
  from google.protobuf.internal.encoder import _VarintBytes # 내부 varint 인코더를 임포트

  def create_user_data_message(name, surname, birthDate, phoneNumbers):
      """
      UserData Protobuf 메시지를 생성하고 값을 채웁니다.
      """
      message = schemafile_pb2.MessageType()
      message.name = name
      message.surname = surname
      message.birthDate = birthDate
      message.phoneNumbers.extend(phoneNumbers)
      return message

  # 예제 사용자에 대한 데이터
  data_to_serialize = [
      {"name": "Aisha", "surname": "Khan", "birthDate": 19920815, "phoneNumbers": ["(555) 247-8903", "(555) 612-3457"]},
      {"name": "Javier", "surname": "Rodriguez", "birthDate": 20001015, "phoneNumbers": ["(555) 891-2046", "(555) 738-5129"]},
      {"name": "Mei", "surname": "Ling", "birthDate": 19980616, "phoneNumbers": ["(555) 956-1834", "(555) 403-7682"]},
  ]

  output_filename = "protobuf_messages.bin"

  # 바이너리 파일을 쓰기-바이너리 모드('wb')로 엽니다.
  with open(output_filename, "wb") as f:
      for item in data_to_serialize:
          # 현재 사용자에 대한 Protobuf 메시지 인스턴스를 생성합니다.
          message = create_user_data_message(
              item["name"],
              item["surname"],
              item["birthDate"],
              item["phoneNumbers"]
          )

          # 메시지를 직렬화합니다.
          serialized_data = message.SerializeToString()

          # 직렬화된 데이터의 길이를 가져옵니다.
          message_length = len(serialized_data)

          # Protobuf 라이브러리의 내부 _VarintBytes를 사용하여 길이를 인코딩합니다.
          length_prefix = _VarintBytes(message_length)

          # 길이 프리픽스를 씁니다.
          f.write(length_prefix)
          # 직렬화된 메시지 데이터를 씁니다.
          f.write(serialized_data)

  print(f"Protobuf messages (length-delimited) written to {output_filename}")

  # --- 선택 사항: 검증(다시 읽어서 출력) ---
  # 다시 읽을 때는 varint용 Protobuf 내부 디코더도 사용합니다.
  from google.protobuf.internal.decoder import _DecodeVarint32

  print("\n--- 다시 읽어 검증하는 중 ---")
  with open(output_filename, "rb") as f:
      buf = f.read() # varint 디코딩을 쉽게 하기 위해 전체 파일을 버퍼로 읽습니다.
      n = 0
      while n < len(buf):
          # varint 길이 프리픽스를 디코딩합니다.
          msg_len, new_pos = _DecodeVarint32(buf, n)
          n = new_pos
          
          # 메시지 데이터를 추출합니다.
          message_data = buf[n:n+msg_len]
          n += msg_len

          # 메시지를 파싱합니다.
          decoded_message = schemafile_pb2.MessageType()
          decoded_message.ParseFromString(message_data)
          print(text_format.MessageToString(decoded_message, as_utf8=True))
  ```

  이제 명령줄에서 스크립트를 실행하십시오. 예를 들어 `uv`를 사용하여
  Python 가상 환경에서 실행하는 것을 권장합니다:

  ```bash
  uv venv proto-venv
  source proto-venv/bin/activate
  ```

  다음 Python 라이브러리를 설치해야 합니다:

  ```bash
  uv pip install --upgrade protobuf
  ```

  바이너리 파일을 생성하기 위해 스크립트를 실행하십시오:

  ```bash
  python generate_protobuf_data.py
  ```
</details>

스키마에 맞는 ClickHouse 테이블을 생성합니다:

```sql
CREATE DATABASE IF NOT EXISTS test;
CREATE TABLE IF NOT EXISTS test.protobuf_messages (
  name String,
  surname String,
  birthDate UInt32,
  phoneNumbers Array(String)
)
ENGINE = MergeTree()
ORDER BY tuple()
```


커맨드라인에서 테이블에 데이터를 삽입하십시오:

```bash
cat protobuf_messages.bin | clickhouse-client --query "INSERT INTO test.protobuf_messages SETTINGS format_schema='schemafile:MessageType' FORMAT Protobuf"
```

`Protobuf` 형식을 사용하여 데이터를 바이너리 파일로 다시 기록할 수도 있습니다:

```sql
SELECT * FROM test.protobuf_messages INTO OUTFILE 'protobuf_message_from_clickhouse.bin' FORMAT Protobuf SETTINGS format_schema = 'schemafile:MessageType'
```

이제 Protobuf 스키마를 사용하여 ClickHouse에서 파일 `protobuf_message_from_clickhouse.bin`로 기록한 데이터를 역직렬화할 수 있습니다.


### ClickHouse Cloud를 사용한 데이터 읽기 및 쓰기 \{#basic-examples-cloud\}

ClickHouse Cloud에서는 Protobuf 스키마 파일을 업로드할 수 없습니다. 그러나 `format_protobuf_schema`
설정을 사용하여 쿼리에서 스키마를 지정할 수 있습니다. 이 예제에서는 로컬
컴퓨터에서 직렬화된 데이터를 읽어 ClickHouse Cloud의 테이블에 삽입하는 방법을 설명합니다.

이전 예제와 마찬가지로, ClickHouse Cloud에서 Protobuf 스키마에 따라 테이블을 생성하십시오:

```sql
CREATE DATABASE IF NOT EXISTS test;
CREATE TABLE IF NOT EXISTS test.protobuf_messages (
  name String,
  surname String,
  birthDate UInt32,
  phoneNumbers Array(String)
)
ENGINE = MergeTree()
ORDER BY tuple()
```

`format_schema_source` SETTING은 `format_schema`의 소스를 정의합니다.

가능한 값:

* &#39;file&#39; (기본값): Cloud에서는 지원되지 않습니다.
* &#39;string&#39;: `format_schema`는 스키마의 내용을 그대로 담고 있는 리터럴입니다.
* &#39;query&#39;: `format_schema`는 스키마를 조회하기 위한 쿼리입니다.


### `format_schema_source='string'` \{#format-schema-source-string\}

스키마를 문자열로 지정하여 ClickHouse Cloud에 데이터를 삽입하려면 다음을 실행하십시오:

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='syntax = "proto3";message MessageType {  string name = 1;  string surname = 2;  uint32 birthDate = 3;  repeated string phoneNumbers = 4;};', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

테이블에 삽입된 데이터를 조회하십시오:

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```


### `format_schema_source='query'` \{#format-schema-source-query\}

Protobuf 스키마를 테이블에 저장하여 사용할 수도 있습니다.

데이터를 삽입할 ClickHouse Cloud 테이블을 생성하십시오:

```sql
CREATE TABLE testing.protobuf_schema (
  schema String
)
ENGINE = MergeTree()
ORDER BY tuple();
```

```sql
INSERT INTO testing.protobuf_schema VALUES ('syntax = "proto3";message MessageType {  string name = 1;  string surname = 2;  uint32 birthDate = 3;  repeated string phoneNumbers = 4;};');
```

실행할 쿼리에서 스키마를 지정하여 데이터를 ClickHouse Cloud에 삽입합니다:

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='SELECT schema FROM testing.protobuf_schema', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

테이블에 삽입된 데이터를 조회합니다.

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```


### 자동 생성된 스키마 사용 \{#using-autogenerated-protobuf-schema\}

데이터에 대한 외부 Protobuf 스키마가 없어도 자동 생성된 스키마를 사용하여 Protobuf 형식으로 데이터를 입력/출력할 수 있습니다. 이를 위해 `format_protobuf_use_autogenerated_schema` 설정을 사용합니다.

예를 들어:

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1
```

이 경우 ClickHouse는 함수
[`structureToProtobufSchema`](/sql-reference/functions/other-functions#structureToProtobufSchema)를 사용하여 테이블 구조에 따라 Protobuf 스키마를 자동으로 생성합니다. 그런 다음 이 스키마를 사용하여 데이터를 Protobuf 형식으로 직렬화합니다.

자동 생성된 스키마를 사용하여 Protobuf 파일을 읽을 수도 있습니다. 이때 파일은 동일한 스키마를 사용하여 생성되어야 합니다:

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_protobuf_use_autogenerated_schema=1 FORMAT Protobuf"
```

[`format_protobuf_use_autogenerated_schema`](/operations/settings/settings-formats.md#format_protobuf_use_autogenerated_schema) 설정은 기본적으로 활성화되어 있으며, [`format_schema`](/operations/settings/formats#format_schema)가 설정되지 않았을 때 적용됩니다.

입출력 시 [`output_format_schema`](/operations/settings/formats#output_format_schema) 설정을 사용하여 자동으로 생성된 스키마를 파일에 저장할 수도 있습니다. 예를 들면 다음과 같습니다.

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1, output_format_schema='path/to/schema/schema.proto'
```

이 경우 자동으로 생성된 Protobuf 스키마는 `path/to/schema/schema.capnp` 파일에 저장됩니다.


### Protobuf 캐시 삭제 \{#drop-protobuf-cache\}

[`format_schema_path`](/operations/server-configuration-parameters/settings.md/#format_schema_path)을 통해 불러온 Protobuf 스키마를 다시 로드하려면 [`SYSTEM DROP ... FORMAT CACHE`](/sql-reference/statements/system.md/#system-drop-schema-format) SQL 문을 사용합니다.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE FOR Protobuf
```
