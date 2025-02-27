---
title : ProtobufList
slug: /interfaces/formats/ProtobufList
keywords : [ProtobufList]
input_format: true
output_format: true
alias: []
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 入力  | 出力   | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`ProtobufList` フォーマットは [`Protobuf`](./Protobuf.md) フォーマットに似ていますが、行は「Envelope」という固定名のメッセージ内に含まれるサブメッセージのシーケンスとして表現されます。

## 使用例 {#example-usage}

例えば：

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

ファイル `schemafile.proto` は以下のようになります：

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
