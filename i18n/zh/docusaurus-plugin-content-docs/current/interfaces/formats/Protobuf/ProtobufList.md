---
title: 'ProtobufList'
slug: '/interfaces/formats/ProtobufList'
keywords: ['ProtobufList']
input_format: true
output_format: true
alias: []
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

`ProtobufList` 格式类似于 [`Protobuf`](./Protobuf.md) 格式，但行以子消息的序列表示，这些子消息包含在一个固定名称为 "Envelope" 的消息中。

## 示例用法 {#example-usage}

例如：

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

其中文件 `schemafile.proto` 具有如下内容：

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

## 格式设置 {#format-settings}
