---
'alias': []
'description': 'ProtobufList 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'ProtobufList'
'output_format': true
'slug': '/interfaces/formats/ProtobufList'
'title': 'ProtobufList'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 입력   | 출력    | 별칭   |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`ProtobufList` 형식은 [`Protobuf`](./Protobuf.md) 형식과 유사하지만 행은 "Envelope"라는 고정 이름의 메시지에 포함된 하위 메시지의 시퀀스로 표현됩니다.

## 사용 예시 {#example-usage}

예를 들어:

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

파일 `schemafile.proto`는 다음과 같습니다:

```capnp title="schemafile.proto"
syntax = "proto3";
message Envelope {
  message MessageType {
    string name = 1;
    string surname = 2;
    uint32 birthDate = 3;
    repeated string phoneNumbers = 4;
  };
  MessageType row = 1;
};
```

## 형식 설정 {#format-settings}
