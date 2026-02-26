---
description: 'WebAssembly 用户定义函数文档'
sidebar_label: 'WebAssembly UDF'
slug: /sql-reference/functions/wasm_udf
title: 'WebAssembly 用户定义函数'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# WebAssembly 用户定义函数 \{#webassembly-user-defined-functions\}

ClickHouse 支持创建用 WebAssembly 编写的用户定义函数（UDF）。这使你可以将使用 Rust、C、C++ 等语言编写的自定义逻辑编译为 WebAssembly 模块并执行。

<CloudNotSupportedBadge />

<ExperimentalBadge />

## 概述 \{#overview\}

WebAssembly 模块是一个已编译的二进制文件，其中包含一个或多个可以从 ClickHouse 调用的函数。
可以将模块视为一个库或共享对象（shared object），它被加载一次并可多次复用。

包含 UDF 的 WebAssembly 模块可以使用任何能编译为 WebAssembly 的语言编写，例如 Rust、C 或 C++。

编译为 WebAssembly 的代码（“guest” 代码）并由 ClickHouse（“host”）执行时，会运行在一个沙箱环境中，只能访问专用的内存空间。

Guest 代码会导出 ClickHouse 可以调用的函数——包括实现自定义逻辑的函数（用于定义 UDF），以及内存管理和 ClickHouse 与 WebAssembly 代码之间数据交换所需的辅助函数。

代码应被编译为“freestanding” WebAssembly（即 `wasm32-unknown-unknown`），且不得依赖任何操作系统或标准库。同时，仅支持默认的 32 位 WebAssembly 目标（不支持 `wasm64` 扩展）。
模块必须遵循一种受支持的通信协议（ABI），以便与 ClickHouse 交互。

编译完成后，可以通过将模块的二进制代码插入到 `system.webassembly_modules` 表中，将其加载到 ClickHouse 中。
之后，可以使用 `CREATE FUNCTION ... LANGUAGE WASM` 语句创建引用该模块导出函数的 UDF。

## 先决条件 \{#prerequisites\}

在 ClickHouse 配置中启用 WebAssembly 支持：

```xml
<clickhouse>
    <allow_experimental_webassembly_udf>true</allow_experimental_webassembly_udf>
    <webassembly_udf_engine>wasmtime</webassembly_udf_engine>
</clickhouse>
```

可用的引擎实现：

* `wasmtime`（默认，推荐）— 使用 [WasmTime](https://github.com/bytecodealliance/wasmtime)
* `wasmedge` — 使用 [WasmEdge](https://github.com/WasmEdge/WasmEdge)

## 快速开始 \{#quick-start\}

本示例演示了通过实现 [Collatz 猜想](https://en.wikipedia.org/wiki/Collatz_conjecture) 计算器来创建 WebAssembly UDF 的完整工作流程。

我们将使用 WebAssembly 文本格式（WAT）来编写代码，它是 WebAssembly 的人类可读表示形式，因此在这个阶段不需要使用任何编程语言。
ClickHouse 要求模块为二进制格式，因此我们将使用转译器将 WAT 转换为 WASM。
要执行此转换，可以使用 [WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt) 中的 `wat2wasm`，或使用 [wasm-tools](https://github.com/bytecodealliance/wasm-tools) 中的 `parse` 命令。

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

在上面的代码片段中，我们使用 `FORMAT RawBlob` 将二进制 WASM 代码通过管道直接传入 ClickHouse 客户端，并插入到 `system.webassembly_modules` 表中。

然后，我们定义一个引用该模块导出 `steps` 函数的 UDF：

```sql
CREATE FUNCTION collatz_steps LANGUAGE WASM ARGUMENTS (n UInt32) RETURNS UInt32 FROM 'collatz' :: 'steps';
```

请注意，我们在 `::` 之后指定的是模块中的函数名称，因为它与 UDF 的名称不同。

现在我们可以在查询中使用 `collatz_steps` 函数了：

```sql
SELECT groupArray(collatz_steps(number :: UInt32))
FROM numbers(1, 100)
FORMAT TSV
```

`number` 列被显式转换为 `UInt32`，因为 WebAssembly 函数要求类型与 `CREATE FUNCTION` 语句中指定的签名精确匹配。

在结果中，我们得到了从 1 到 100 各个数的 Collatz 步数序列，对应于 [OEIS 中的序列 A006577](https://oeis.org/A006577)。

```text
[0,1,7,2,5,8,16,3,19,6,14,9,9,17,17,4,12,20,20,7,7,15,15,10,23,10,111,18,18,18,106,5,26,13,13,21,21,21,34,8,109,8,29,16,16,16,104,11,24,24,24,11,11,112,112,19,32,19,32,19,19,107,107,6,27,27,27,14,14,14,102,22,115,22,14,22,22,35,35,9,22,110,110,9,9,30,30,17,30,17,92,17,17,105,105,12,118,25,25,25]
```

## 通过 system 系统表管理 WASM 模块 \{#manage-wasm-modules-via-system-table\}

WebAssembly 模块存储在 `system.webassembly_modules` 表中，其结构如下：

* **列**
  * `name` String — 模块名称。必须非空且仅包含单词字符。
  * `code` String — 原始二进制 WASM 代码。只写，读取时返回空字符串。
  * `hash` UInt256 — 模块二进制文件的 SHA256（如果模块存在于磁盘但尚未加载，则为零）。

模块管理是通过对该表执行标准 SQL 操作来完成的：

### 插入模块 \{#insert-a-module\}

```sql
INSERT INTO system.webassembly_modules (name, code)
SELECT 'my_module', base64Decode('AGFzbQEAAAA...');
```

（可选）提供完整性哈希：

```sql
INSERT INTO system.webassembly_modules (name, code, hash)
SELECT 'my_module', base64Decode('...'), reinterpretAsUInt256(unhex('369f...c57d'));
```

如果提供的哈希值与模块代码计算得到的 SHA256 不匹配，插入操作将失败。在从 S3 或 HTTP 等外部来源加载模块时，这会非常有用。

### 列出模块 \{#list-modules\}

```sql
SELECT name, lower(hex(reinterpretAsFixedString(hash))) AS sha256 FROM system.webassembly_modules

   ┌─name────┬─sha256───────────────────────────────────────────────────────────┐
1. │ collatz │ a084a10b7b5cb07db198bc93bf1f3c1f8cb8ef279df7a4f6b66b1cdd55d79c48 │
   └─────────┴──────────────────────────────────────────────────────────────────┘
```

### 删除模块 \{#delete-a-module\}

删除操作通过执行 `DELETE FROM system.webassembly_modules WHERE name = '...'` 语句来完成。
每条语句仅支持按精确名称删除一个模块。

```sql
DELETE FROM system.webassembly_modules WHERE name = 'collatz';
```

如果有任何现有的 UDF 引用了该模块，则删除操作会失败，因此必须先删除这些 UDF。

## 创建 WebAssembly UDF \{#create-a-webassembly-udf\}

**语法**：

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

**参数**：

* `function_name`: ClickHouse 中的函数名。可以与模块中导出的函数名不同。
* `FROM 'module_name' :: 'source_function_name'`: 已加载 WASM 模块的名称，以及在该 WASM 模块中要使用的函数名（默认值为 `function_name`）
* `ARGUMENTS`: 参数名称和类型列表（名称可选，并用于支持命名字段的序列化格式）
* `ABI`: Application Binary Interface（应用二进制接口）版本
  * `ROW_DIRECT`: 直接类型映射，逐行处理
  * `BUFFERED_V1`: 采用基于块（block）的处理并进行序列化
* `SHA256_HASH`: 用于校验的期望模块哈希（如果省略则自动填充），可用于确保在不同副本上加载的是正确的 WASM 模块。
* `SETTINGS`: 每个函数的设置
  * `max_fuel` UInt64 — 每个实例可用的指令燃料。默认值：`100000`。
  * `max_memory` UInt64 — 每个实例的最大内存使用量（字节）。范围：64 KiB … 4 GiB。默认值：`104857600`（100 MiB）。
  * `serialization_format` String — 当 ABI 需要时使用的序列化格式。默认值：`MsgPack`。
  * `max_input_block_size` UInt64 — 如指定，则在使用基于块处理的 ABI 时限制输入块的最大大小（以行数计）。默认值：`0`（无限制）。
  * `max_instances` UInt64 — 单个查询中每个函数的最大并行实例数。默认值：`128`。

## ABI 版本 \{#abis-versions\}

要与 ClickHouse 交互，WebAssembly 模块必须遵循受支持的 ABI（Application Binary Interfaces，应用二进制接口）之一。

* `ROW_DIRECT`：直接类型映射（仅支持原始类型 `Int32`、`UInt32`、`Int64`、`UInt64`、`Float32`、`Float64`）
* `BUFFERED_V1`：通过序列化处理的复杂类型

### ABI ROW_DIRECT \{#abi-row_direct\}

针对每一行直接调用导出的 WASM 函数。

* 参数和返回类型必须是数值类型 `Int32/UInt32/Int64/UInt64/Float32/Float64/Int128/UInt128`。
* 此 ABI 不支持字符串。
* 函数签名必须与 WASM 导出签名匹配（`i32/i64/f32/f64/v128`）。
* 模块不需要导出任何辅助函数。

例如具有如下签名的函数：

```
(func (param i32 i64 f32) (result f64) ...)
```

可以按如下方式创建：

```sql
CREATE FUNCTION my_func ARGUMENTS (Int32, UInt64, Float32) RETURNS Float64 ...
```

WebAssembly 不区分有符号和无符号参数，而是通过不同的指令来解释这些值。因此，参数的位宽必须完全一致，而是否带符号则由函数内部的操作来决定。

### ABI BUFFERED_V1 \{#abi-buffered_v1\}

:::note
此 ABI 为实验性特性，在未来版本中可能发生变化。
:::

通过在 WASM 内存中进行（反）序列化，一次性处理整个数据块。支持任意参数和返回类型。

序列化后的数据会被复制到 WASM 内存中，作为指向缓冲区的指针传递给 UDF 函数（缓冲区由数据指针和数据大小组成），同时还会传递输入中的行数。因此，WASM 运行时中的用户自定义函数始终接收两个 `i32` 参数，并返回一个 `i32` 值。
Guest 代码对数据进行处理，并返回一个指向结果缓冲区的指针，其中包含序列化后的结果数据。

Guest 代码必须提供两个函数，用于创建和销毁这些缓冲区。

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

C 语言定义示例：

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

  !!! TODO: crate 尚未发布

  ### 使用 Rust 开发 UDF 的说明

  针对 Rust 程序，我们提供了辅助 crate [clickhouse-wasm-udf](https://crates.io/crates/clickhouse-wasm-udf)，用于简化在 ClickHouse 中开发 WebAssembly UDF 的流程。该 crate 提供了用于内存管理的函数，因此无需手动实现 `clickhouse_create_buffer` 和 `clickhouse_destroy_buffer` 函数，只需将该 crate 添加为依赖即可。此外，还提供了 `#[clickhouse_wasm_udf]` 宏，用于将常规 Rust 函数封装为所需的 ABI 格式。

  借助该 crate，可以像下面这样编写 UDF：


  ```rust

  use clickhouse_wasm_udf_bindgen::clickhouse_udf;

  #[clickhouse_udf]
  pub fn some_udf(data: String) -> HashMap<String, String> {
    // 在此处编写实现
  }

  ```

  这些宏会生成用于接收和返回缓冲区结构的包装函数，并使用 `serde` 自动处理序列化/反序列化。

  */ }

## 模块可用的 Host API

模块可以导入并使用以下宿主函数：

* `clickhouse_server_version() -> i64` — 以整数形式返回 ClickHouse 服务器版本（例如 v25.11.1.1 对应 25011001）。
* `clickhouse_terminate(ptr: i32, size: i32)` — 使用提供的消息抛出错误。接受指向错误消息字符串所在内存位置的指针以及字符串的长度。
* `clickhouse_log(ptr: i32, size: i32)` — 将消息记录到 ClickHouse 服务器文本日志中。
* `clickhouse_random(ptr: i32, size: i32)` — 使用随机字节填充内存。

## 另请参阅 \{#host-api-available-to-modules\}

* [ClickHouse UDF 概述](/sql-reference/functions/udf)