---
alias: []
description: 'ProtobufList 형식에 대한 문서'
input_format: true
keywords: ['ProtobufList']
output_format: true
slug: /interfaces/formats/ProtobufList
title: 'ProtobufList'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |

## 설명 \{#description\}

`ProtobufList` 형식은 [`Protobuf`](./Protobuf.md) 형식과 유사합니다. 다만 행은 「Envelope」라는 고정된 이름을 가진 메시지 안에 포함된 하위 메시지들의 시퀀스로 표현됩니다.

## 사용 예시 \{#example-usage\}

예를 들어:

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

`schemafile.proto` 파일은 다음과 같은 형태입니다:

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

`format_schema`에 지정된 메시지 유형은 먼저 최상위 `Envelope` 메시지 내부의 중첩 유형으로 확인합니다. 여기에서 일치하는 항목을 찾지 못하면 — schema에 `Envelope` 메시지가 없거나 `Envelope`에 요청한 이름의 메시지가 포함되어 있지 않은 경우 — 해당 이름의 최상위 메시지를 직접 사용합니다.

## 형식 설정 \{#format-settings\}