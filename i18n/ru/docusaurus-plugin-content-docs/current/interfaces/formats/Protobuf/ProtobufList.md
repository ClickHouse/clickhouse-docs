---
alias: []
description: 'Документация для формата ProtobufList'
input_format: true
keywords: ['ProtobufList']
output_format: true
slug: /interfaces/formats/ProtobufList
title: 'ProtobufList'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Формат `ProtobufList` аналогичен формату [`Protobuf`](./Protobuf.md), но строки представлены как последовательность подсообщений, содержащихся в сообщении с фиксированным именем "Envelope".

## Пример использования {#example-usage}

Например:

```sql
SELECT * FROM test.table FORMAT ProtobufList SETTINGS format_schema = 'schemafile:MessageType'
```

```bash
cat protobuflist_messages.bin | clickhouse-client --query "INSERT INTO test.table FORMAT ProtobufList SETTINGS format_schema='schemafile:MessageType'"
```

Где файл `schemafile.proto` выглядит следующим образом:

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

## Настройки формата {#format-settings}
