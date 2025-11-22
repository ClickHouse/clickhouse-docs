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

| Входной формат | Выходной формат | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |



## Описание {#description}

Формат `Protobuf` — это формат [Protocol Buffers](https://protobuf.dev/).

Этот формат требует внешней схемы, которая кэшируется между запросами.

ClickHouse поддерживает:

- синтаксисы `proto2` и `proto3`;
- поля `Repeated`/`optional`/`required`.

Для установления соответствия между столбцами таблицы и полями типа сообщения Protocol Buffers ClickHouse сравнивает их имена.
Это сравнение не учитывает регистр, а символы `_` (подчёркивание) и `.` (точка) считаются эквивалентными.
Если типы столбца и поля сообщения Protocol Buffers различаются, применяется необходимое преобразование типов.

Вложенные сообщения поддерживаются. Например, для поля `z` в следующем типе сообщения:

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

Вложенные сообщения подходят для ввода или вывода [вложенных структур данных](/sql-reference/data-types/nested-data-structures/index.md).

Значения по умолчанию, определённые в схеме protobuf, как в примере ниже, не применяются; вместо них используются [значения по умолчанию таблицы](/sql-reference/statements/create/table#default_values):

```capnp
syntax = "proto2";

message MessageType {
  optional int32 result_per_page = 3 [default = 10];
}
```

Если сообщение содержит [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) и установлена настройка `input_format_protobuf_oneof_presence`, ClickHouse заполняет столбец, который указывает, какое поле oneof было обнаружено.

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
INSERT INTO string_or_string from INFILE '$CURDIR/data_protobuf/String1' SETTINGS format_schema='$SCHEMADIR/string_or_string.proto:StringOrString' FORMAT ProtobufSingle;
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

Имя столбца, указывающего на присутствие, должно совпадать с именем oneof. Вложенные сообщения поддерживаются (см. [basic-examples](#basic-examples)).
Допустимые типы: Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Enum, Enum8 или Enum16.
Enum (а также Enum8 или Enum16) должен содержать все возможные теги oneof плюс 0 для обозначения отсутствия; строковые представления не имеют значения.

Настройка [`input_format_protobuf_oneof_presence`](/operations/settings/settings-formats.md#input_format_protobuf_oneof_presence) по умолчанию отключена.

ClickHouse принимает и выводит сообщения protobuf в формате `length-delimited`.
Это означает, что перед каждым сообщением должна быть записана его длина в виде [целого числа переменной ширины (varint)](https://developers.google.com/protocol-buffers/docs/encoding#varints).


## Пример использования {#example-usage}

### Чтение и запись данных {#basic-examples}

:::note Примеры файлов
Файлы, используемые в этом примере, доступны в [репозитории с примерами](https://github.com/ClickHouse/formats/ProtoBuf)
:::

В этом примере мы прочитаем данные из файла `protobuf_message.bin` в таблицу ClickHouse, а затем запишем их
обратно в файл `protobuf_message_from_clickhouse.bin` в формате `Protobuf`.

Рассмотрим файл `schemafile.proto`:

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

Мы используем Python для сериализации данных в файл `protobuf_message.bin` и последующего чтения их в ClickHouse.
Если вы хотите использовать другой язык программирования, см. также: ["How to read/write length-delimited Protobuf messages in popular languages"](https://cwiki.apache.org/confluence/display/GEODE/Delimiting+Protobuf+Messages).

Выполните следующую команду для генерации файла Python с именем `schemafile_pb2.py` в
том же каталоге, что и `schemafile.proto`. Этот файл содержит классы Python,
представляющие ваше сообщение Protobuf `UserData`:

```bash
protoc --python_out=. schemafile.proto
```

Теперь создайте новый файл Python с именем `generate_protobuf_data.py` в том же
каталоге, что и `schemafile_pb2.py`. Вставьте в него следующий код:

```python
import schemafile_pb2  # Module generated by 'protoc'
from google.protobuf import text_format
from google.protobuf.internal.encoder import _VarintBytes # Import the internal varint encoder

def create_user_data_message(name, surname, birthDate, phoneNumbers):
    """
    Создает и заполняет сообщение Protobuf UserData.
    """
    message = schemafile_pb2.MessageType()
    message.name = name
    message.surname = surname
    message.birthDate = birthDate
    message.phoneNumbers.extend(phoneNumbers)
    return message

```


# Данные для примеров пользователей

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

        # Используйте внутреннюю функцию _VarintBytes библиотеки Protobuf для кодирования длины
        length_prefix = _VarintBytes(message_length)

        # Запишите префикс длины
        f.write(length_prefix)
        # Запишите сериализованные данные сообщения
        f.write(serialized_data)

print(f"Сообщения Protobuf (с префиксом длины) записаны в {output_filename}")



# --- Необязательно: Проверка (чтение и вывод) ---

# Для чтения мы также будем использовать внутренний декодер Protobuf для varint.

from google.protobuf.internal.decoder import \_DecodeVarint32

print("\n--- Проверка путём чтения ---")
with open(output_filename, "rb") as f:
buf = f.read() # Читаем весь файл в буфер для упрощения декодирования varint
n = 0
while n < len(buf): # Декодируем префикс длины varint
msg_len, new_pos = \_DecodeVarint32(buf, n)
n = new_pos

        # Извлекаем данные сообщения
        message_data = buf[n:n+msg_len]
        n += msg_len

        # Разбираем сообщение
        decoded_message = schemafile_pb2.MessageType()
        decoded_message.ParseFromString(message_data)
        print(text_format.MessageToString(decoded_message, as_utf8=True))

````

Теперь запустите скрипт из командной строки. Рекомендуется запускать его из
виртуального окружения Python, например, используя `uv`:

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

Создайте таблицу ClickHouse, соответствующую схеме:

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

С помощью вашей схемы Protobuf вы теперь можете десериализовать данные, которые были записаны из ClickHouse в файл `protobuf_message_from_clickhouse.bin`.

### Чтение и запись данных с использованием ClickHouse Cloud {#basic-examples-cloud}

В ClickHouse Cloud невозможно загрузить файл схемы Protobuf. Однако вы можете использовать настройку `format_protobuf_schema`
для указания схемы в запросе. В этом примере мы покажем, как читать сериализованные данные с вашей локальной
машины и вставлять их в таблицу в ClickHouse Cloud.

Как и в предыдущем примере, создайте таблицу в соответствии со схемой Protobuf в ClickHouse Cloud:

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

Настройка `format_schema_source` определяет источник настройки `format_schema`

Возможные значения:

- 'file' (по умолчанию): не поддерживается в Cloud
- 'string': `format_schema` является буквальным содержимым схемы.
- 'query': `format_schema` является запросом для получения схемы.

### `format_schema_source='string'` {#format-schema-source-string}

Чтобы вставить данные в ClickHouse Cloud, указав схему в виде строки, выполните:

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

Вы также можете хранить схему Protobuf в таблице.

Создайте таблицу в ClickHouse Cloud для вставки данных:


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

Вставьте данные в ClickHouse Cloud, указав схему в виде запроса для выполнения:

```bash
cat protobuf_messages.bin | clickhouse client --host <hostname> --secure --password <password> --query "INSERT INTO testing.protobuf_messages SETTINGS format_schema_source='SELECT schema FROM testing.protobuf_schema', format_schema='schemafile:MessageType' FORMAT Protobuf"
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

### Использование автоматически генерируемой схемы {#using-autogenerated-protobuf-schema}

Если у вас нет внешней схемы Protobuf для ваших данных, вы всё равно можете выводить и вводить данные в формате Protobuf,
используя автоматически генерируемую схему. Для этого используйте настройку `format_protobuf_use_autogenerated_schema`.

Например:

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1
```

В этом случае ClickHouse автоматически сгенерирует схему Protobuf в соответствии со структурой таблицы, используя функцию
[`structureToProtobufSchema`](/sql-reference/functions/other-functions#structureToProtobufSchema). Затем эта схема будет использована для сериализации данных в формате Protobuf.

Вы также можете прочитать файл Protobuf с автоматически генерируемой схемой. В этом случае необходимо, чтобы файл был создан с использованием той же схемы:

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_protobuf_use_autogenerated_schema=1 FORMAT Protobuf"
```

Настройка [`format_protobuf_use_autogenerated_schema`](/operations/settings/settings-formats.md#format_protobuf_use_autogenerated_schema) включена по умолчанию и применяется, если [`format_schema`](/operations/settings/formats#format_schema) не задана.

Вы также можете сохранить автоматически генерируемую схему в файл во время ввода/вывода, используя настройку [`output_format_schema`](/operations/settings/formats#output_format_schema). Например:

```sql
SELECT * FROM test.hits format Protobuf SETTINGS format_protobuf_use_autogenerated_schema=1, output_format_schema='path/to/schema/schema.proto'
```

В этом случае автоматически сгенерированная схема Protobuf будет сохранена в файле `path/to/schema/schema.capnp`.

### Очистка кэша Protobuf {#drop-protobuf-cache}

Чтобы перезагрузить схему Protobuf, загруженную из [`format_schema_path`](/operations/server-configuration-parameters/settings.md/#format_schema_path), используйте оператор [`SYSTEM DROP ... FORMAT CACHE`](/sql-reference/statements/system.md/#system-drop-schema-format).

```sql
SYSTEM DROP FORMAT SCHEMA CACHE FOR Protobuf
```
