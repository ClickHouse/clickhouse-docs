---
description: 'Документация по пользовательским функциям WebAssembly'
sidebar_label: 'WebAssembly UDF'
slug: /sql-reference/functions/wasm_udf
title: 'Пользовательские функции WebAssembly'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Пользовательские функции на WebAssembly \{#webassembly-user-defined-functions\}

ClickHouse поддерживает создание пользовательских функций (UDF), реализованных на WebAssembly. Это позволяет выполнять пользовательскую логику, написанную на таких языках, как Rust, C, C++ и другие, компилируя их в модули WebAssembly.

<CloudNotSupportedBadge />

<ExperimentalBadge />

## Обзор \{#overview\}

Модуль WebAssembly — это скомпилированный двоичный файл, который содержит одну или несколько функций, вызываемых из ClickHouse.
Модуль можно рассматривать как библиотеку или разделяемый объект, который загружается один раз и многократно переиспользуется.

Модуль WebAssembly, содержащий UDF, может быть написан на любом языке, компилируемом в WebAssembly, например Rust, C или C++.

Код, скомпилированный в WebAssembly («гостевой» код) и выполняемый ClickHouse («хост»), запускается в изолированном окружении (sandbox), имеющем доступ только к выделенному участку памяти.

Гостевой код экспортирует функции, которые ClickHouse может вызывать; сюда входят функции, реализующие вашу прикладную логику (используемые для определения UDF), а также вспомогательные функции, необходимые для управления памятью и обмена данными между ClickHouse и кодом WebAssembly.

Ваш код должен быть скомпилирован в «автономный» WebAssembly (также известный как `wasm32-unknown-unknown`) без каких-либо зависимостей от операционной системы или стандартной библиотеки. Также поддерживается только стандартная 32-битная цель WebAssembly (расширение `wasm64` не поддерживается).
Модуль должен следовать одному из поддерживаемых протоколов взаимодействия (ABI) для интеграции с ClickHouse.

После компиляции двоичный код модуля загружается в ClickHouse путём вставки его в таблицу `system.webassembly_modules`.
После этого вы можете создавать UDF, которые ссылаются на функции, экспортируемые модулем, с помощью выражения `CREATE FUNCTION ... LANGUAGE WASM`.

## Предварительные требования \{#prerequisites\}

Включите поддержку WebAssembly в конфигурации ClickHouse:

```xml
<clickhouse>
    <allow_experimental_webassembly_udf>true</allow_experimental_webassembly_udf>
    <webassembly_udf_engine>wasmtime</webassembly_udf_engine>
</clickhouse>
```

Доступные реализации движка:

* `wasmtime` (по умолчанию, рекомендуется) — использует [WasmTime](https://github.com/bytecodealliance/wasmtime)
* `wasmedge` — использует [WasmEdge](https://github.com/WasmEdge/WasmEdge)

## Быстрый старт \{#quick-start\}

В этом примере демонстрируется полный рабочий процесс создания WebAssembly UDF путём реализации калькулятора [гипотезы Коллатца](https://en.wikipedia.org/wiki/Collatz_conjecture).

Мы напишем код в текстовом формате WebAssembly (WAT), который является человекочитаемым представлением WebAssembly, поэтому на этом этапе знание какого-либо языка программирования не требуется.
ClickHouse требует, чтобы модуль был в двоичном формате, поэтому мы воспользуемся транспайлером для преобразования WAT в WASM.
Для выполнения этого преобразования вы можете использовать `wat2wasm` из [WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt) или команду `parse` из [wasm-tools](https://github.com/bytecodealliance/wasm-tools).

```bash
cat << 'EOF' | wasm-tools parse | clickhouse client -q "INSERT INTO system.webassembly_modules (name, code) SELECT 'collatz', code FROM input('code String') FORMAT RawBlob"
(module
  (func $next (param $n i32) (result i32)
    local.get $n i32.const 1 i32.and
    (if (result i32)
      (then local.get $n i32.const 3 i32.mul i32.const 1 i32.add)
      (else local.get $n i32.const 2 i32.div_u)))
  (func $steps (export "steps") (param $n i32) (result i32)
    (local $count i32)
    local.get $n i32.const 1 i32.lt_u
    (if (then i32.const 0 return))
    (block $done (loop $loop
      local.get $n i32.const 1 i32.eq br_if $done
      local.get $n call $next local.set $n
      local.get $count i32.const 1 i32.add local.set $count
      br $loop))
    local.get $count)
)
EOF
```

В приведённом выше фрагменте мы передаём бинарный код WASM непосредственно в клиент ClickHouse, используя `FORMAT RawBlob`, чтобы вставить его в таблицу `system.webassembly_modules`.

Затем мы определяем UDF, который ссылается на функцию `steps`, экспортируемую из модуля:

```sql
CREATE FUNCTION collatz_steps LANGUAGE WASM ARGUMENTS (n UInt32) RETURNS UInt32 FROM 'collatz' :: 'steps';
```

Обратите внимание, что мы указываем имя функции из модуля после `::`, так как оно отличается от имени UDF.

Теперь мы можем использовать функцию `collatz_steps` в наших запросах:

```sql
SELECT groupArray(collatz_steps(number :: UInt32))
FROM numbers(1, 100)
FORMAT TSV
```

Столбец `number` явно приводится к типу `UInt32`, потому что функции WebAssembly ожидают точного соответствия типов сигнатуре, указанной в операторе `CREATE FUNCTION`.

В результате мы получили последовательность шагов Коллатца для чисел от 1 до 100, соответствующую последовательности [A006577 из OEIS](https://oeis.org/A006577).

```text
[0,1,7,2,5,8,16,3,19,6,14,9,9,17,17,4,12,20,20,7,7,15,15,10,23,10,111,18,18,18,106,5,26,13,13,21,21,21,34,8,109,8,29,16,16,16,104,11,24,24,24,11,11,112,112,19,32,19,32,19,19,107,107,6,27,27,27,14,14,14,102,22,115,22,14,22,22,35,35,9,22,110,110,9,9,30,30,17,30,17,92,17,17,105,105,12,118,25,25,25]
```

## Управление модулями WASM через системную таблицу \{#manage-wasm-modules-via-system-table\}

Модули WebAssembly хранятся в таблице `system.webassembly_modules`, имеющей следующую структуру:

* **Столбцы**
  * `name` String — Имя модуля. Непустое, допускаются только буквенно-цифровые символы и подчёркивания.
  * `code` String — Сырые двоичные данные WASM. Только для записи, при чтении возвращается пустая строка.
  * `hash` UInt256 — SHA256 бинарного файла модуля (ноль, если модуль присутствует на диске, но ещё не загружен).

Управление модулями осуществляется с помощью стандартных SQL-операций над этой таблицей:

### Добавить модуль \{#insert-a-module\}

```sql
INSERT INTO system.webassembly_modules (name, code)
SELECT 'my_module', base64Decode('AGFzbQEAAAA...');
```

При необходимости укажите контрольную сумму:

```sql
INSERT INTO system.webassembly_modules (name, code, hash)
SELECT 'my_module', base64Decode('...'), reinterpretAsUInt256(unhex('369f...c57d'));
```

Если указанный хэш не совпадает с вычисленным SHA256‑хэшем кода модуля, вставка завершается с ошибкой. Это может быть полезно при загрузке модулей из внешних источников, таких как S3 или HTTP.

### Список модулей \{#list-modules\}

```sql
SELECT name, lower(hex(reinterpretAsFixedString(hash))) AS sha256 FROM system.webassembly_modules

   ┌─name────┬─sha256───────────────────────────────────────────────────────────┐
1. │ collatz │ a084a10b7b5cb07db198bc93bf1f3c1f8cb8ef279df7a4f6b66b1cdd55d79c48 │
   └─────────┴──────────────────────────────────────────────────────────────────┘
```

### Удаление модуля \{#delete-a-module\}

Удаление выполняется запросом `DELETE FROM system.webassembly_modules WHERE name = '...'`.
Поддерживается только удаление одного модуля за один запрос по его точному имени.

```sql
DELETE FROM system.webassembly_modules WHERE name = 'collatz';
```

Если какие-либо существующие UDF ссылаются на модуль, удаление завершится с ошибкой, поэтому сначала нужно удалить эти UDF.

## Создайте UDF на WebAssembly \{#create-a-webassembly-udf\}

**Синтаксис**:

```sql
CREATE [OR REPLACE] FUNCTION function_name
LANGUAGE WASM
FROM 'module_name' [:: 'source_function_name']
ARGUMENTS ( [name type[, ...]] | [type[, ...]] )
RETURNS return_type
[ABI ROW_DIRECT | ABI BUFFERED_V1]
[SHA256_HASH 'hex']
[SETTINGS key = value[, ...]];
```

**Параметры**:

* `function_name`: Имя функции в ClickHouse. Может отличаться от имени экспортируемой функции в модуле.
* `FROM 'module_name' :: 'source_function_name'`: Имя загруженного модуля WASM и имя функции в модуле WASM, которое следует использовать (по умолчанию — `function_name`).
* `ARGUMENTS`: Список имён и типов аргументов (имена необязательны и используются для форматов сериализации, которые поддерживают именованные поля).
* `ABI`: Версия Application Binary Interface
  * `ROW_DIRECT`: Прямое сопоставление типов, построчная обработка
  * `BUFFERED_V1`: Блочная обработка с сериализацией
* `SHA256_HASH`: Ожидаемый хэш модуля для проверки (автоматически заполняется, если опущен); может использоваться для обеспечения загрузки корректного модуля WASM на разных репликах.
* `SETTINGS`: Настройки для отдельной функции
  * `max_fuel` UInt64 — Количество инструкций (fuel) на экземпляр. Значение по умолчанию: `100000`.
  * `max_memory` UInt64 — Максимальное использование памяти на экземпляр, в байтах. Диапазон: 64 KiB … 4 GiB. Значение по умолчанию: `104857600` (100 MiB).
  * `serialization_format` String — Формат сериализации для ABI, где это требуется. Значение по умолчанию: `MsgPack`.
  * `max_input_block_size` UInt64 — Если указано, ограничивает максимальный размер входного блока в строках для ABI, использующего блочную обработку. Значение по умолчанию: `0` (без ограничений).
  * `max_instances` UInt64 — Максимальное количество параллельных экземпляров функции в одном запросе. Значение по умолчанию: `128`.

## Версии ABI \{#abis-versions\}

Для взаимодействия с ClickHouse модули WebAssembly должны соответствовать одному из поддерживаемых ABI (Application Binary Interface).

* `ROW_DIRECT`: Прямое отображение типов (только примитивные типы `Int32`, `UInt32`, `Int64`, `UInt64`, `Float32`, `Float64`)
* `BUFFERED_V1`: Сложные типы с сериализацией

### ABI ROW_DIRECT \{#abi-row_direct\}

Вызывает экспортируемую функцию WASM напрямую для каждой строки.

* Аргументы и возвращаемые значения должны иметь числовые типы `Int32/UInt32/Int64/UInt64/Float32/Float64/Int128/UInt128`.
* Строки не поддерживаются в этом ABI.
* Сигнатуры должны соответствовать экспорту WASM (`i32/i64/f32/f64/v128`).
* Модуль не обязан экспортировать какие-либо вспомогательные функции.

Например, функция с сигнатурой:

```
(func (param i32 i64 f32) (result f64) ...)
```

Его можно создать следующим образом:

```sql
CREATE FUNCTION my_func ARGUMENTS (Int32, UInt64, Float32) RETURNS Float64 ...
```

WebAssembly не различает знаковые и беззнаковые аргументы, а использует разные инструкции для интерпретации значений. Поэтому размер аргумента должен строго совпадать, тогда как его знаковость определяется операциями внутри функции.

### ABI BUFFERED_V1 \{#abi-buffered_v1\}

:::note
Этот ABI является экспериментальным и может измениться в будущих релизах.
:::

Обрабатывает целые блоки целиком, используя (де)сериализацию через память WASM. Поддерживает любые типы аргументов и возвращаемых значений.

Сериализованные данные копируются в память WASM, передаваемую как указатель на буфер (состоящий из указателя на данные и размера этих данных) в функцию UDF вместе с числом строк во входных данных. Таким образом, функция, определяемая пользователем, на стороне WASM всегда принимает два аргумента `i32` и возвращает одно значение `i32`. Гостевой код обрабатывает данные и возвращает указатель на буфер результата с сериализованными данными результата.

Гостевой код должен реализовать две функции для создания и уничтожения этих буферов.

```
(module
  ;; Allocate a new buffer of specified size
  ;; Returns: handle to Buffer structure (not direct data pointer!) with pointer to data and size
  (func (export "clickhouse_create_buffer")
    (param $size i32)    ;; Size of data to allocate
    (result i32))        ;; Returns buffer handle with enough space

  ;; Free a buffer by its handle
  (func (export "clickhouse_destroy_buffer")
    (param $handle i32)  ;; Buffer handle to free
    (result))            ;; No return value

    ;; User-defined function
    (func (export "user_defined_function1")
      (param $input_buffer_handle i32)  ;; Input buffer handle
      (param $n i32)                    ;; Number of rows in input
      (result i32))                     ;; Returns output buffer handle
)
```

Примеры определений на языке C:

```c
typedef struct {
    uint8_t * data;
    uint32_t size;
} ClickhouseBuffer;

ClickhouseBuffer * clickhouse_create_buffer(uint32_t size) { /* ... */ }

void clickhouse_destroy_buffer(ClickhouseBuffer * data) { /* ... */ }

/// Example user-defined functions
ClickhouseBuffer * user_defined_function1(ClickhouseBuffer * span, uint32_t n) { /* ... */ }
ClickhouseBuffer * user_defined_function2(ClickhouseBuffer * span, uint32_t n) { /* ... */ }
```

{/*

  !!! TODO: crate is not yet published

  ### Примечание по разработке UDF на Rust

  Для программ на Rust мы предоставляем вспомогательный crate [clickhouse-wasm-udf](https://crates.io/crates/clickhouse-wasm-udf), который упрощает разработку UDF на WebAssembly для ClickHouse. Этот crate содержит функции для управления памятью, поэтому вам не нужно вручную реализовывать функции `clickhouse_create_buffer` и `clickhouse_destroy_buffer` — достаточно добавить crate как зависимость. Также доступны макросы `#[clickhouse_wasm_udf]`, которые оборачивают ваши обычные функции Rust в требуемый формат ABI.

  С этим crate вы можете писать UDF следующим образом:


  ```rust

  use clickhouse_wasm_udf_bindgen::clickhouse_udf;

  #[clickhouse_udf]
  pub fn some_udf(data: String) -> HashMap<String, String> {
    // Ваша реализация здесь
  }

  ```

  Макросы сгенерируют обёрточную функцию, принимающую и возвращающую структуры буферов, и автоматически обработают (де)сериализацию с использованием `serde`.

  */ }

## Host API, доступный модулям

Следующие функции хоста могут быть импортированы и использованы в модулях:

* `clickhouse_server_version() -> i64` — возвращает версию сервера ClickHouse в виде целого числа (например, 25011001 для v25.11.1.1).
* `clickhouse_terminate(ptr: i32, size: i32)` — вызывает ошибку с переданным сообщением. Принимает указатель на область памяти, содержащую строку сообщения об ошибке, и размер строки.
* `clickhouse_log(ptr: i32, size: i32)` — записывает сообщение в текстовый лог сервера ClickHouse.
* `clickhouse_random(ptr: i32, size: i32)` — заполняет память случайными байтами.

## См. также \{#host-api-available-to-modules\}

* [Обзор UDF в ClickHouse](/sql-reference/functions/udf)