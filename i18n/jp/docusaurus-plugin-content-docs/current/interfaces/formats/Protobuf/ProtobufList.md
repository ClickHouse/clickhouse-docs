---
alias: []
description: 'ProtobufList フォーマットに関するドキュメント'
input_format: true
keywords: ['ProtobufList']
output_format: true
slug: /interfaces/formats/ProtobufList
title: 'ProtobufList'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 説明 {#description}

`ProtobufList`フォーマットは[`Protobuf`](./Protobuf.md)フォーマットに類似していますが、行は"Envelope"という固定名を持つメッセージに含まれる一連のサブメッセージとして表現されます。


## 使用例 {#example-usage}

例:

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

ファイル `schemafile.proto` は次のようになります:

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


## フォーマット設定 {#format-settings}
