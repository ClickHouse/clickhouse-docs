---
'alias': []
'description': 'ProtobufList 格式的文档'
'input_format': true
'keywords':
- 'ProtobufList'
'output_format': true
'slug': '/interfaces/formats/ProtobufList'
'title': 'ProtobufList'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 输入   | 输出   | 别名   |
|--------|--------|--------|
| ✔      | ✔      |        |

## 描述 {#description}

`ProtobufList` 格式类似于 [`Protobuf`](./Protobuf.md) 格式，但行作为包含在名为 "Envelope" 的消息中的子消息序列表示。

## 示例用法 {#example-usage}

例如：

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

文件 `schemafile.proto` 的内容如下：

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
