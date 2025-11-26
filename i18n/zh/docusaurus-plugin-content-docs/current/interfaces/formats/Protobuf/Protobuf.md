---
alias: []
description: 'Protobuf 格式文档'
input_format: true
keywords: ['Protobuf']
output_format: true
slug: /interfaces/formats/Protobuf
title: 'Protobuf'
doc_type: 'guide'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述

`Protobuf` 格式即 [Protocol Buffers](https://protobuf.dev/) 格式。

该格式需要一个外部格式 schema，并会在查询之间进行缓存。

ClickHouse 支持：

* `proto2` 和 `proto3` 两种语法。
* `Repeated`/`optional`/`required` 字段。

为了在表的列与 Protocol Buffers 消息类型的字段之间建立对应关系，ClickHouse 会比较它们的名称。
此比较不区分大小写，并将字符 `_`（下划线）和 `.`（点）视为相同。
如果表列与 Protocol Buffers 消息字段的类型不同，则会应用必要的类型转换。

支持嵌套消息。例如，对于下述消息类型中的字段 `z`：

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

ClickHouse 会尝试查找名为 `x.y.z`（或 `x_y_z`、`X.y_Z` 等）的列。

嵌套消息适合作为[嵌套数据结构](/sql-reference/data-types/nested-data-structures/index.md)的输入或输出。

在如下所示的 protobuf 模式中定义的默认值不会生效，而是会使用[表默认值](/sql-reference/statements/create/table#default_values)来替代它们：

```capnp
syntax = "proto2";

message MessageType {
  optional int32 result_per_page = 3 [default = 10];
}
```

如果消息包含 [oneof](https://protobuf.dev/programming-guides/proto3/#oneof)，并且设置了 `input_format_protobuf_oneof_presence`，ClickHouse 会填充一个列，用于指示 oneof 中实际出现的是哪个字段。

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
INSERT INTO string_or_string FROM INFILE '$CURDIR/data_protobuf/String1' SETTINGS format_schema='$SCHEMADIR/string_or_string.proto:StringOrString' FORMAT ProtobufSingle;
SELECT * FROM string_or_string
```

```text
   ┌─────────┬─────────┬──────────────┐
   │ 字符串1 │ 字符串2 │ 字符串之一 │
   ├─────────┼─────────┼──────────────┤
1. │         │ 字符串2 │ 世界        │
   ├─────────┼─────────┼──────────────┤
2. │ 字符串1 │         │ 你好        │
   └─────────┴─────────┴──────────────┘
```

表示存在与否的列名必须与 oneof 的名称相同。支持嵌套消息（参见 [basic-examples](#basic-examples)）。
允许的类型为 Int8、UInt8、Int16、UInt16、Int32、UInt32、Int64、UInt64、Enum、Enum8 或 Enum16。
Enum（以及 Enum8 或 Enum16）必须包含 oneof 所有可能的标签，以及用于表示不存在的 0，字符串表示形式无关紧要。

设置 [`input_format_protobuf_oneof_presence`](/operations/settings/settings-formats.md#input_format_protobuf_oneof_presence) 默认是禁用的。

ClickHouse 以 `length-delimited` 格式读写 protobuf 消息。
这意味着在每条消息之前，必须先以[可变长度整数（varint）](https://developers.google.com/protocol-buffers/docs/encoding#varints)形式写出其长度。


## 示例用法 {#example-usage}

### 读取和写入数据 {#basic-examples}

:::note 示例文件
本示例中使用的文件可以在 [examples 仓库](https://github.com/ClickHouse/formats/ProtoBuf) 中找到
:::

在本示例中，我们将从文件 `protobuf_message.bin` 中读取一些数据到 ClickHouse 表中。然后再使用 `Protobuf` 格式将其写回到名为 `protobuf_message_from_clickhouse.bin` 的文件中。

假设有如下文件 `schemafile.proto`：

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
<summary>生成二进制文件</summary>
  
如果你已经知道如何以 `Protobuf` 格式序列化和反序列化数据，可以跳过此步骤。

我们将使用 Python 将一些数据序列化到 `protobuf_message.bin` 文件中，然后将其读取到 ClickHouse 中。
如果你想使用其他语言，请参阅：["How to read/write length-delimited Protobuf messages in popular languages"](https://cwiki.apache.org/confluence/display/GEODE/Delimiting+Protobuf+Messages)。

在与 `schemafile.proto` 相同的目录中运行以下命令，生成一个名为 `schemafile_pb2.py` 的 Python 文件。该文件包含表示 `UserData` Protobuf 消息的 Python 类：

```bash
protoc --python_out=. schemafile.proto
```

现在，在与 `schemafile_pb2.py` 相同的目录中创建一个名为 `generate_protobuf_data.py` 的新 Python 文件，并将以下代码粘贴到该文件中：

```python
import schemafile_pb2  # 由 'protoc' 生成的模块
from google.protobuf import text_format
from google.protobuf.internal.encoder import _VarintBytes # 导入内部 varint 编码器

def create_user_data_message(name, surname, birthDate, phoneNumbers):
    """
    创建并填充一个 UserData Protobuf 消息。
    """
    message = schemafile_pb2.MessageType()
    message.name = name
    message.surname = surname
    message.birthDate = birthDate
    message.phoneNumbers.extend(phoneNumbers)
    return message

```


# 我们示例用户的数据

data_to_serialize = [
{"name": "Aisha", "surname": "Khan", "birthDate": 19920815, "phoneNumbers": ["(555) 247-8903", "(555) 612-3457"]},
{"name": "Javier", "surname": "Rodriguez", "birthDate": 20001015, "phoneNumbers": ["(555) 891-2046", "(555) 738-5129"]},
{"name": "Mei", "surname": "Ling", "birthDate": 19980616, "phoneNumbers": ["(555) 956-1834", "(555) 403-7682"]},
]

output_filename = "protobuf_messages.bin"


# 以二进制写入模式（"wb"）打开输出文件
with open(output_filename, "wb") as f:
    for item in data_to_serialize:
        # 为当前用户创建一个 Protobuf 消息实例
        message = create_user_data_message(
            item["name"],
            item["surname"],
            item["birthDate"],
            item["phoneNumbers"]
        )

        # 序列化该消息
        serialized_data = message.SerializeToString()

        # 获取序列化后数据的长度
        message_length = len(serialized_data)

        # 使用 Protobuf 库内部的 _VarintBytes 对长度进行编码
        length_prefix = _VarintBytes(message_length)

        # 写入长度前缀
        f.write(length_prefix)
        # 写入序列化后的消息数据
        f.write(serialized_data)

print(f"已将 Protobuf 消息（按长度分隔）写入 {output_filename}")



# --- 可选：验证（读回并打印） ---

# 为了读回，我们还将使用 Protobuf 内部的 varint 解码器。

from google.protobuf.internal.decoder import \_DecodeVarint32

print("\n--- 通过读回进行验证 ---")
with open(output_filename, "rb") as f:
buf = f.read() # Read the whole file into a buffer for easier varint decoding
n = 0
while n < len(buf): # Decode the varint length prefix
msg_len, new_pos = \_DecodeVarint32(buf, n)
n = new_pos

        # Extract the message data
        message_data = buf[n:n+msg_len]
        n += msg_len

        # Parse the message
        decoded_message = schemafile_pb2.MessageType()
        decoded_message.ParseFromString(message_data)
        print(text_format.MessageToString(decoded_message, as_utf8=True))

````

现在从命令行运行该脚本。建议在 Python 虚拟环境中运行，例如使用 `uv`：

```bash
uv venv proto-venv
source proto-venv/bin/activate
````

你需要安装以下 Python 库：

```bash
uv pip install --upgrade protobuf
```

运行脚本以生成二进制文件：

```bash
python generate_protobuf_data.py
```

</details>

创建一个与该 schema 匹配的 ClickHouse 表：

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

从命令行将数据插入到该表中：

```bash
cat protobuf_messages.bin | clickhouse-client --query "INSERT INTO test.protobuf_messages SETTINGS format_schema='schemafile:MessageType' FORMAT Protobuf"
```

你也可以使用 `Protobuf` 格式将数据写回到一个二进制文件中：

```sql
SELECT * FROM test.protobuf_messages INTO OUTFILE 'protobuf_message_from_clickhouse.bin' FORMAT Protobuf SETTINGS format_schema = 'schemafile:MessageType'
```

借助你的 Protobuf schema，现在可以反序列化从 ClickHouse 写出的文件 `protobuf_message_from_clickhouse.bin` 中的数据。

### 使用 ClickHouse Cloud 读写数据 {#basic-examples-cloud}

在 ClickHouse Cloud 中，你无法上传 Protobuf schema 文件。不过，你可以使用 `format_protobuf_schema`
设置在查询中指定 schema。在本示例中，我们演示如何从本地机器读取已序列化的数据，并将其插入到 ClickHouse Cloud 中的某个表中。

与前一个示例类似，在 ClickHouse Cloud 中根据你的 Protobuf schema 创建表：

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

`format_schema_source` 设置用于定义 `format_schema` 的来源：

可选值：

- 'file'（默认）：在 Cloud 中不支持
- 'string'：`format_schema` 是 schema 的字面内容。
- 'query'：`format_schema` 是用于获取 schema 的查询。

### `format_schema_source='string'` {#format-schema-source-string}

将数据插入 ClickHouse Cloud，并将 schema 作为字符串指定，运行：

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='syntax = "proto3";message MessageType {  string name = 1;  string surname = 2;  uint32 birthDate = 3;  repeated string phoneNumbers = 4;};', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

查询插入到表中的数据：

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```

### `format_schema_source='query'` {#format-schema-source-query}

你也可以将 Protobuf schema 存储在一张表中。

在 ClickHouse Cloud 上创建一张用于插入数据的表：


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

将数据插入 ClickHouse Cloud，并在将要执行的查询中指定 schema：

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='SELECT schema FROM testing.protobuf_schema', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

查询已插入表中的数据：

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```

### 使用自动生成的模式

如果你的数据没有外部的 Protobuf 模式（schema），仍然可以基于自动生成的模式以 Protobuf 格式读写数据。为此，请使用 `format_protobuf_use_autogenerated_schema` 设置。

例如：

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1
```

在这种情况下，ClickHouse 将根据表结构，使用函数 [`structureToProtobufSchema`](/sql-reference/functions/other-functions#structureToProtobufSchema) 自动生成 Protobuf schema。然后会使用该 schema 以 Protobuf 格式序列化数据。

你也可以使用自动生成的 schema 来读取 Protobuf 文件。在这种情况下，必须使用同一份 schema 来创建该文件：

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_protobuf_use_autogenerated_schema=1 FORMAT Protobuf"
```

[`format_protobuf_use_autogenerated_schema`](/operations/settings/settings-formats.md#format_protobuf_use_autogenerated_schema) 设置默认启用，当未设置 [`format_schema`](/operations/settings/formats#format_schema) 时生效。

还可以在进行输入/输出时，使用 [`output_format_schema`](/operations/settings/formats#output_format_schema) 设置，将自动生成的 schema 保存到文件中。例如：

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1, output_format_schema='path/to/schema/schema.proto'
```

在这种情况下，自动生成的 Protobuf 模式将会保存在文件 `path/to/schema/schema.capnp` 中。

### 清除 Protobuf 缓存

要重新加载从 [`format_schema_path`](/operations/server-configuration-parameters/settings.md/#format_schema_path) 加载的 Protobuf 模式，请使用 [`SYSTEM DROP ... FORMAT CACHE`](/sql-reference/statements/system.md/#system-drop-schema-format) 语句。

```sql
SYSTEM 删除 Protobuf 的格式模式缓存
```
