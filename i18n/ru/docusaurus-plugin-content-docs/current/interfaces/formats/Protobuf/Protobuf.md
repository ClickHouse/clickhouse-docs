---
alias: []
description: 'Документация по формату Protobuf'
input_format: true
keywords: ['Protobuf']
output_format: true
slug: /interfaces/formats/Protobuf
title: 'Protobuf'
doc_type: 'guide'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |



## Описание

Формат `Protobuf` — это формат [Protocol Buffers](https://protobuf.dev/).

Этот формат требует внешней схемы, которая кэшируется между запросами.

ClickHouse поддерживает:

* синтаксис `proto2` и `proto3`;
* поля `repeated`/`optional`/`required`.

Чтобы найти соответствие между столбцами таблицы и полями типа сообщения Protocol Buffers, ClickHouse сравнивает их имена.
Это сравнение нечувствительно к регистру, а символы `_` (подчёркивание) и `.` (точка) считаются равными.
Если типы столбца и поля сообщения Protocol Buffers различаются, применяется необходимое преобразование.

Поддерживаются вложенные сообщения. Например, для поля `z` в следующем типе сообщения:

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

ClickHouse пытается найти столбец с именем `x.y.z` (или `x_y_z`, или `X.y_Z` и так далее).

Вложенные сообщения подходят для ввода или вывода данных с [вложенными структурами](/sql-reference/data-types/nested-data-structures/index.md).

Значения по умолчанию, определённые в схеме protobuf, аналогичной приведённой ниже, не применяются, вместо них используются [табличные значения по умолчанию](/sql-reference/statements/create/table#default_values):

```capnp
syntax = "proto2";

message MessageType {
  optional int32 result_per_page = 3 [default = 10];
}
```

Если сообщение содержит [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) и параметр `input_format_protobuf_oneof_presence` установлен, ClickHouse заполняет столбец, в котором указано, какое поле oneof было найдено.

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
   │ string1 │ string2 │ string_oneof │
   ├─────────┼─────────┼──────────────┤
1. │         │ string2 │ world        │
   ├─────────┼─────────┼──────────────┤
2. │ string1 │         │ hello        │
   └─────────┴─────────┴──────────────┘
```

Имя столбца, указывающего на присутствие, должно совпадать с именем oneof. Поддерживаются вложенные сообщения (см. [basic-examples](#basic-examples)).
Допустимые типы: Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Enum, Enum8 или Enum16.
Enum (а также Enum8 или Enum16) должен содержать все возможные теги oneof плюс 0 для обозначения отсутствия; строковые представления значения не имеют.

Настройка [`input_format_protobuf_oneof_presence`](/operations/settings/settings-formats.md#input_format_protobuf_oneof_presence) по умолчанию отключена.

ClickHouse принимает и отдает сообщения Protobuf в формате `length-delimited`.
Это означает, что перед каждым сообщением его длина должна быть записана как [целое число переменной длины (varint)](https://developers.google.com/protocol-buffers/docs/encoding#varints).


## Пример использования {#example-usage}

### Чтение и запись данных {#basic-examples}

:::note Файлы примера
Файлы, используемые в этом примере, доступны в [репозитории с примерами](https://github.com/ClickHouse/formats/ProtoBuf)
:::

В этом примере мы прочитаем часть данных из файла `protobuf_message.bin` в таблицу ClickHouse. Затем запишем их
обратно в файл с именем `protobuf_message_from_clickhouse.bin`, используя формат `Protobuf`.

Дан файл `schemafile.proto`:

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
<summary>Генерация бинарного файла</summary>
  
Если вы уже знаете, как сериализовать и десериализовать данные в формате `Protobuf`, можете пропустить этот шаг.

Мы используем Python, чтобы сериализовать некоторые данные в `protobuf_message.bin` и загрузить их в ClickHouse.
Если вы хотите использовать другой язык, см. также: ["How to read/write length-delimited Protobuf messages in popular languages"](https://cwiki.apache.org/confluence/display/GEODE/Delimiting+Protobuf+Messages).

Выполните следующую команду, чтобы сгенерировать Python‑файл с именем `schemafile_pb2.py` в
том же каталоге, что и `schemafile.proto`. Этот файл содержит Python‑классы,
которые представляют ваше Protobuf‑сообщение `UserData`:

```bash
protoc --python_out=. schemafile.proto
```

Теперь создайте новый Python‑файл с именем `generate_protobuf_data.py` в том же
каталоге, что и `schemafile_pb2.py`. Вставьте в него следующий код:

```python
import schemafile_pb2  # Module generated by 'protoc'
from google.protobuf import text_format
from google.protobuf.internal.encoder import _VarintBytes # Import the internal varint encoder

def create_user_data_message(name, surname, birthDate, phoneNumbers):
    """
    Создаёт и заполняет Protobuf‑сообщение UserData.
    """
    message = schemafile_pb2.MessageType()
    message.name = name
    message.surname = surname
    message.birthDate = birthDate
    message.phoneNumbers.extend(phoneNumbers)
    return message

```


# Данные для наших пользователей из примера

data_to_serialize = [
{"name": "Aisha", "surname": "Khan", "birthDate": 19920815, "phoneNumbers": ["(555) 247-8903", "(555) 612-3457"]},
{"name": "Javier", "surname": "Rodriguez", "birthDate": 20001015, "phoneNumbers": ["(555) 891-2046", "(555) 738-5129"]},
{"name": "Mei", "surname": "Ling", "birthDate": 19980616, "phoneNumbers": ["(555) 956-1834", "(555) 403-7682"]},
]

output_filename = "protobuf_messages.bin"


# Откройте двоичный файл в режиме двоичной записи ('wb')
with open(output_filename, "wb") as f:
    for item in data_to_serialize:
        # Создайте экземпляр сообщения Protobuf для текущего пользователя
        message = create_user_data_message(
            item["name"],
            item["surname"],
            item["birthDate"],
            item["phoneNumbers"]
        )

        # Сериализуйте сообщение
        serialized_data = message.SerializeToString()

        # Получите длину сериализованных данных
        message_length = len(serialized_data)

        # Используйте внутреннюю функцию библиотеки Protobuf _VarintBytes для кодирования длины
        length_prefix = _VarintBytes(message_length)

        # Запишите префикс длины
        f.write(length_prefix)
        # Запишите сериализованные данные сообщения
        f.write(serialized_data)

print(f"Сообщения Protobuf (с префиксом длины) записаны в {output_filename}")



# --- Необязательно: проверка (повторное чтение и вывод) ---

# Для повторного чтения мы также используем внутренний декодер Protobuf для значений varint.

from google.protobuf.internal.decoder import \_DecodeVarint32

print("\n--- Проверка с помощью повторного чтения ---")
with open(output_filename, "rb") as f:
buf = f.read() # Считать весь файл в буфер для упрощения декодирования значений varint
n = 0
while n < len(buf): # Декодировать префикс длины в формате varint
msg_len, new_pos = \_DecodeVarint32(buf, n)
n = new_pos

        # Извлечь данные сообщения
        message_data = buf[n:n+msg_len]
        n += msg_len

        # Распарсить сообщение
        decoded_message = schemafile_pb2.MessageType()
        decoded_message.ParseFromString(message_data)
        print(text_format.MessageToString(decoded_message, as_utf8=True))

````

Теперь запустите скрипт из командной строки. Рекомендуется запускать его из
виртуального окружения Python, например с помощью `uv`:

```bash
uv venv proto-venv
source proto-venv/bin/activate
````

Вам потребуется установить следующие библиотеки Python:

```bash
uv pip install --upgrade protobuf
```

Запустите скрипт для генерации бинарного файла:

```bash
python generate_protobuf_data.py
```

</details>

Создайте в ClickHouse таблицу, соответствующую схеме:

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

Вставьте данные в таблицу из командной строки:

```bash
cat protobuf_messages.bin | clickhouse-client --query "INSERT INTO test.protobuf_messages SETTINGS format_schema='schemafile:MessageType' FORMAT Protobuf"
```

Вы также можете записать данные обратно в бинарный файл, используя формат `Protobuf`:

```sql
SELECT * FROM test.protobuf_messages INTO OUTFILE 'protobuf_message_from_clickhouse.bin' FORMAT Protobuf SETTINGS format_schema = 'schemafile:MessageType'
```

Используя свою схему Protobuf, вы теперь можете десериализовать данные, которые были записаны ClickHouse в файл `protobuf_message_from_clickhouse.bin`.

### Чтение и запись данных с использованием ClickHouse Cloud {#basic-examples-cloud}

В ClickHouse Cloud вы не можете загрузить файл со схемой Protobuf. Однако вы можете использовать настройку `format_protobuf_schema`,
чтобы указать схему непосредственно в запросе. В этом примере показано, как прочитать сериализованные данные с вашей локальной
машины и вставить их в таблицу в ClickHouse Cloud.

Как и в предыдущем примере, создайте в ClickHouse Cloud таблицу в соответствии со своей схемой Protobuf:

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

Настройка `format_schema_source` определяет источник значения параметра `format_schema`

Возможные значения:

- 'file' (по умолчанию): не поддерживается в Cloud
- 'string': `format_schema` содержит буквальный текст схемы.
- 'query': `format_schema` — это запрос для получения схемы.

### `format_schema_source='string'` {#format-schema-source-string}

Чтобы вставить данные в ClickHouse Cloud, указав схему как строку, выполните:

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='syntax = "proto3";message MessageType {  string name = 1;  string surname = 2;  uint32 birthDate = 3;  repeated string phoneNumbers = 4;};', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

Выберите данные, вставленные в таблицу:

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```

### `format_schema_source='query'` {#format-schema-source-query}

Вы также можете хранить свою схему Protobuf в таблице.

Создайте таблицу в ClickHouse Cloud, в которую будут вставляться данные:


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

Вставьте данные в ClickHouse Cloud, указав схему в запросе, который нужно выполнить:

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='SELECT schema FROM testing.protobuf_schema', format_schema='schemafile:MessageType' FORMAT Protobuf"
```

Выведите данные, вставленные в таблицу:

```sql
clickhouse client --host <hostname> --secure --password <password> --query "SELECT * FROM testing.protobuf_messages"
```

```response
Aisha Khan 19920815 ['(555) 247-8903','(555) 612-3457']
Javier Rodriguez 20001015 ['(555) 891-2046','(555) 738-5129']
Mei Ling 19980616 ['(555) 956-1834','(555) 403-7682']
```

### Использование автоматически сгенерированной схемы

Если у вас нет внешней схемы Protobuf для ваших данных, вы всё равно можете выводить и принимать данные в формате Protobuf,
используя автоматически сгенерированную схему. Для этого используйте настройку `format_protobuf_use_autogenerated_schema`.

Например:

```sql
SELECT * FROM test.hits FORMAT Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1
```

В этом случае ClickHouse автоматически сгенерирует Protobuf-схему в соответствии со структурой таблицы с помощью функции
[`structureToProtobufSchema`](/sql-reference/functions/other-functions#structureToProtobufSchema). Затем ClickHouse будет использовать эту схему для сериализации данных в формате Protobuf.

Вы также можете прочитать Protobuf-файл с автоматически сгенерированной схемой. В этом случае необходимо, чтобы файл был создан с использованием той же схемы:

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_protobuf_use_autogenerated_schema=1 FORMAT Protobuf"
```

Настройка [`format_protobuf_use_autogenerated_schema`](/operations/settings/settings-formats.md#format_protobuf_use_autogenerated_schema) включена по умолчанию и применяется, если параметр [`format_schema`](/operations/settings/formats#format_schema) не задан.

Вы также можете сохранять автоматически сгенерированную схему в файл при вводе/выводе с помощью настройки [`output_format_schema`](/operations/settings/formats#output_format_schema). Например:

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1, output_format_schema='path/to/schema/schema.proto'
```

В этом случае автоматически сгенерированная Protobuf-схема будет сохранена в файле `path/to/schema/schema.capnp`.

### Сброс кэша Protobuf

Чтобы перезагрузить Protobuf-схему, загруженную из [`format_schema_path`](/operations/server-configuration-parameters/settings.md/#format_schema_path), используйте оператор [`SYSTEM DROP ... FORMAT CACHE`](/sql-reference/statements/system.md/#system-drop-schema-format).

```sql
СИСТЕМА ОЧИСТИТЬ КЭШ СХЕМЫ ФОРМАТА ДЛЯ Protobuf
```
