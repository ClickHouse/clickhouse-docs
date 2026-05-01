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

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |

## 説明 \{#description\}

`ProtobufList` フォーマットは [`Protobuf`](./Protobuf.md) フォーマットと似ていますが、行は固定名「Envelope」を持つメッセージ内に含まれるサブメッセージの列として表現されます。

## 使用例 \{#example-usage\}

例えば、次のようにします。

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

ファイル `schemafile.proto` は次のような内容です：

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

`format_schema` で指定されたメッセージ型は、まず最上位の `Envelope` メッセージ内のネストされた型として探され、解決されます。そこで一致が見つからない場合、つまり schema に `Envelope` メッセージが存在しないか、`Envelope` に指定された名前のメッセージが含まれていない場合は、その名前の最上位メッセージが直接使用されます。

## フォーマット設定 \{#format-settings\}