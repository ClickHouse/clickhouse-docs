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

ClickHouse 支持创建用 WebAssembly 编写的用户定义函数 (UDF) 。这使你可以将使用 Rust、C、C++ 等语言编写的自定义逻辑编译为 WebAssembly 模块并执行。

<CloudNotSupportedBadge />

<ExperimentalBadge />

## 概述 \{#overview\}

WebAssembly 模块是一个已编译的二进制文件，其中包含一个或多个可以从 ClickHouse 调用的函数。
可以将模块视为一个库或共享对象 (shared object) ，它被加载一次并可多次复用。

包含 UDF 的 WebAssembly 模块可以使用任何能编译为 WebAssembly 的语言编写，例如 Rust、C 或 C++。

编译为 WebAssembly 的代码 (“guest” 代码) 并由 ClickHouse (“host”) 执行时，会运行在一个沙箱环境中，只能访问专用的内存空间。

Guest 代码会导出 ClickHouse 可以调用的函数——包括实现自定义逻辑的函数 (用于定义 UDF) ，以及内存管理和 ClickHouse 与 WebAssembly 代码之间数据交换所需的辅助函数。

代码应被编译为“freestanding” WebAssembly (即 `wasm32-unknown-unknown`) ，且不得依赖任何操作系统或标准库。同时，仅支持默认的 32 位 WebAssembly 目标 (不支持 `wasm64` 扩展) 。
模块必须遵循一种受支持的通信协议 (ABI) ，以便与 ClickHouse 交互。

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

* `wasmtime` (默认，推荐) — 使用 [WasmTime](https://github.com/bytecodealliance/wasmtime)
* `wasmedge` — 使用 [WasmEdge](https://github.com/WasmEdge/WasmEdge)

## 快速开始 \{#quick-start\}

本示例演示了通过实现 [Collatz 猜想](https://en.wikipedia.org/wiki/Collatz_conjecture) 计算器来创建 WebAssembly UDF 的完整工作流程。

我们将使用 WebAssembly 文本格式 (WAT) 来编写代码，它是 WebAssembly 的人类可读表示形式，因此在这个阶段不需要使用任何编程语言。
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
  * `hash` UInt256 — 模块二进制文件的 SHA256 (如果模块存在于磁盘但尚未加载，则为零) 。

模块管理是通过对该表执行标准 SQL 操作来完成的：

### 插入模块 \{#insert-a-module\}

```sql
INSERT INTO system.webassembly_modules (name, code)
SELECT 'my_module', base64Decode('AGFzbQEAAAA...');
```

 (可选) 提供完整性哈希：

```sql
INSERT INTO system.webassembly_modules (name, code, hash)
SELECT 'my_module', base64Decode('...'), reinterpretAsUInt256(unhex('369f...c57d'));
```

如果提供的哈希值与模块代码计算得到的 SHA256 不匹配，插入操作将失败。在从 S3 或 HTTP 等外部来源加载模块时，这会非常有用。

### 在集群中分发模块 \{#distribute-a-module-across-a-cluster\}

`system.webassembly_modules` 是按实例分别存储的表——`INSERT` 只会写入处理该连接的那个副本。`INSERT` 语句没有 `ON CLUSTER` 这种用法，因此后续执行 `CREATE FUNCTION ... ON CLUSTER` 时，会在没有该模块的副本上失败：

```text
Code: 674. DB::Exception: WebAssembly module 'collatz' not found:
while adding user defined function `collatz_steps`. (RESOURCE_NOT_FOUND)
```

要将一次插入操作分发到每个节点，请写入 `cluster` 表函数，而不是本地的 `system.webassembly_modules` 表：

```bash
cat collatz.wasm | clickhouse client -q "
  INSERT INTO FUNCTION cluster('default', 'system', 'webassembly_modules') (name, code)
  SELECT 'collatz', code FROM input('code String') FORMAT RawBlob"
```

:::note
这种模式依赖底层分布式写入路径能够访问每个分片中的每个副本，而这只有在集群配置为 `internal_replication=false` 时才会发生。当 `internal_replication=true` 时 (对于使用 `ReplicatedMergeTree` 自行进行复制的集群，这是默认值) ，插入只会发送到每个分片中一个健康的副本，而 `system.webassembly_modules` 不会通过这条路径被复制，因此某些副本仍会缺少该模块。在这种配置下，您需要分别向每个副本执行插入，例如遍历 `system.clusters` 并通过 `remote(...)` 按主机写入，或者将二进制文件复制到每台主机上的 `user_scripts/wasm/` 中。

您可以使用 `SELECT cluster, shard_num, internal_replication FROM system.clusters` 查看某个集群的 `internal_replication`。
:::

扇出插入后，该模块会存在于每个副本上，并且 `CREATE FUNCTION ... ON CLUSTER` 会成功：

```sql
CREATE FUNCTION collatz_steps ON CLUSTER 'default'
LANGUAGE WASM FROM 'collatz' :: 'steps'
ARGUMENTS (n UInt32) RETURNS UInt32;
```

您可以使用 `clusterAllReplicas` 验证该模块是否已在所有副本上加载：

```sql
SELECT hostName(), name FROM clusterAllReplicas('default', system.webassembly_modules) WHERE name = 'collatz';
```

向 `system.webassembly_modules` 中插入相同的 `(name, hash)` 对时具有幂等性，因此重新执行扇出插入是安全的，也是在某个副本被替换后修复状态的合理方式。请注意，新加入的服务器不会自动获得已有模块——你必须针对更新后的集群重新执行插入，或者将该二进制文件放到新主机的 `user_scripts/wasm/` 目录中。

### 列出模块 \{#list-modules\}

```sql
SELECT name, lower(hex(reinterpretAsFixedString(hash))) AS sha256 FROM system.webassembly_modules

   ┌─name────┬─sha256───────────────────────────────────────────────────────────┐
1. │ collatz │ a084a10b7b5cb07db198bc93bf1f3c1f8cb8ef279df7a4f6b66b1cdd55d79c48 │
   └─────────┴──────────────────────────────────────────────────────────────────┘
```

### 删除模块 \{#delete-a-module\}

通过 `DELETE FROM system.webassembly_modules WHERE name = '...'` 语句执行删除。
谓词必须为 `name = 'literal'` (精确匹配) 或 `name LIKE 'pattern'` (删除名称匹配该模式的所有模块) ；不接受其他形态。

```sql
DELETE FROM system.webassembly_modules WHERE name = 'collatz';

-- Bulk-delete every module whose name starts with `tmp_` (literal underscore is escaped as `\_`):
DELETE FROM system.webassembly_modules WHERE name LIKE 'tmp\_%';
```

如果任何现有 UDF 引用了其中一个匹配的模块，删除操作就会失败，因此必须先删除这些 UDF。

## 创建 WebAssembly UDF \{#create-a-webassembly-udf\}

**语法**：

```sql
CREATE [OR REPLACE] FUNCTION function_name
LANGUAGE WASM
FROM 'module_name' [:: 'source_function_name']
ARGUMENTS ( [name type[, ...]] | [type[, ...]] )
RETURNS return_type
[ABI ROW_DIRECT | ABI BUFFERED_V1 | ABI ASSEMBLYSCRIPT]
[DETERMINISTIC]
[SHA256_HASH 'hex']
[SETTINGS key = value[, ...]];
```

**参数**：

* `function_name`: ClickHouse 中的函数名。可以与模块中导出的函数名不同。
* `FROM 'module_name' :: 'source_function_name'`: 已加载 WASM 模块的名称，以及在该 WASM 模块中要使用的函数名 (默认值为 `function&#95;name`)
* `ARGUMENTS`: 参数名称和类型列表 (名称可选，并用于支持命名字段的序列化格式)
* `ABI`: Application Binary Interface (应用二进制接口) 版本
  * `ROW_DIRECT`: 直接类型映射，逐行处理
  * `BUFFERED_V1`: 采用基于块 (block) 的处理并进行序列化
  * `ASSEMBLYSCRIPT`: 适用于由 [AssemblyScript](https://www.assemblyscript.org) 编译器生成的模块的逐行处理。数值类型映射为 AssemblyScript 基元类型；ClickHouse `String` 映射为 AssemblyScript `string`。
* `DETERMINISTIC`: 将该函数声明为决定论的——对于相同输入始终返回相同输出。指定后，ClickHouse 可能会对所有参数均为常量的调用进行常量折叠：函数会在查询分析阶段计算一次，结果会在每一行中复用。
* `SHA256_HASH`: 用于校验的期望模块哈希 (如果省略则自动填充) ，可用于确保在不同副本上加载的是正确的 WASM 模块。
* `SETTINGS`: 每个函数的设置
  * `serialization_format` String — ABI 需要时使用的序列化格式。支持的值：`MsgPack`、`JSONEachRow`、`CSV`、`TSV`、`TSVRaw`、`RowBinary` 和 `Buffers`。默认值：`MsgPack`。`Buffers` 等基于块的格式必须返回单个列，且其类型必须与声明的函数签名匹配。
  * `webassembly_udf_enable_fuel` Bool — 为该函数启用有限 fuel 预算。默认值：`true`。当为 `false` 时，此函数会忽略查询级设置 `webassembly_udf_max_fuel`。在使用 `wasmtime` 引擎时，禁用 fuel 限制可能会提升性能。但对于不受信任或有缺陷的 guest 代码，这可能会增加失控执行的风险。

## ABI 版本 \{#abis-versions\}

要与 ClickHouse 交互，WebAssembly 模块必须遵循受支持的 ABI (Application Binary Interfaces，应用二进制接口) 之一。

* `ROW_DIRECT`：直接类型映射 (仅支持原始类型 `Int32`、`UInt32`、`Int64`、`UInt64`、`Float32`、`Float64`)
* `BUFFERED_V1`：通过序列化处理的复杂类型
* `ASSEMBLYSCRIPT`：与 [AssemblyScript](https://www.assemblyscript.org) 模块按行互操作；支持数值类型和 `String`。

### ABI ROW_DIRECT \{#abi-row_direct\}

针对每一行直接调用导出的 WASM 函数。

* 参数和返回类型必须是数值类型 `Int32/UInt32/Int64/UInt64/Float32/Float64/Int128/UInt128`。
* 此 ABI 不支持字符串。
* 函数签名必须与 WASM 导出签名匹配 (`i32/i64/f32/f64/v128`) 。
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

通过在 WASM 内存中进行 (反) 序列化，一次性处理整个数据块。支持任意参数和返回类型。

序列化后的数据会被复制到 WASM 内存中，作为指向缓冲区的指针传递给 UDF 函数 (缓冲区由数据指针和数据大小组成) ，同时还会传递输入中的行数。因此，WASM 运行时中的用户自定义函数始终接收两个 `i32` 参数，并返回一个 `i32` 值。
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

C 示例定义：

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

### ABI ASSEMBLYSCRIPT \{#abi-assemblyscript\}

适用于由 [AssemblyScript](https://www.assemblyscript.org) 编译器生成的模块。每一行都会触发一次对导出函数的调用，将 ClickHouse 值映射为 AssemblyScript 基本类型和字符串对象。

**支持的类型**：

* 数值类型：`Int8`/`UInt8`、`Int16`/`UInt16` (在边界处会扩展为 `i32`) 、`Int32`/`UInt32`、`Int64`/`UInt64`、`Float32`、`Float64`

* `String` — 映射为 AssemblyScript 的 `string` (WASM 内存中为 UTF-16) 。ClickHouse 会自动处理 UTF-8 ↔ UTF-16 的转换。

* 不支持将自定义 AssemblyScript 类用作参数或返回类型——其运行时类 id 在不同编译之间并不稳定 (参见 [AssemblyScript#2982](https://github.com/AssemblyScript/assemblyscript/issues/2982)) 。

**模块要求**：

模块必须使用 AssemblyScript 托管运行时进行编译，以确保导出 `__new`、`__pin` 和 `__unpin`。标准的输入/输出字符串处理依赖这些导出。推荐的调用方式：

```bash
asc src.ts --runtime incremental --exportRuntime -o src.wasm
```

AssemblyScript 还会导入 `env.abort`，用于处理运行时陷阱 (如内存不足、边界检查失败等) 。ClickHouse 会自动提供此导入：触发 `abort` 时，当前查询会因 `WASM_ERROR` 异常而失败，异常中包含已解码的 AssemblyScript 消息和源代码位置。

**示例**:

```typescript
// src.ts
export function add(a: u32, b: u32): u32 {
  return a + b;
}

export function greet(name: string): string {
  return "Hello, " + name + "!";
}
```

使用 `asc` 编译并将生成的 `.wasm` 加载到 `system.webassembly_modules` 后，按如下方式声明 UDFs：

```sql
CREATE FUNCTION as_add
    LANGUAGE WASM ABI ASSEMBLYSCRIPT
    FROM 'as_example' :: 'add'
    ARGUMENTS (a UInt32, b UInt32) RETURNS UInt32;

CREATE FUNCTION as_greet
    LANGUAGE WASM ABI ASSEMBLYSCRIPT
    FROM 'as_example' :: 'greet'
    ARGUMENTS (name String) RETURNS String;
```

### 使用 Rust 开发 UDF 的说明 \{#note-for-developing-udfs-in-rust\}

针对 Rust 程序，我们提供了辅助 crate [clickhouse-wasm-udf](https://crates.io/crates/clickhouse-wasm-udf)，用于简化在 ClickHouse 中开发 WebAssembly UDF 的流程。该 crate 提供了用于内存管理的函数，因此无需手动实现 `clickhouse_create_buffer` 和 `clickhouse_destroy_buffer` 函数，只需将该 crate 添加为依赖即可。此外，还提供了 `#[clickhouse_wasm_udf]` 宏，用于将常规 Rust 函数封装为所需的 ABI 格式。

借助该 crate，可以像下面这样编写 UDF：

```rust

use clickhouse_wasm_udf_bindgen::clickhouse_udf;

#[clickhouse_udf]
pub fn some_udf(data: String) -> HashMap<String, String> {
    // Your implementation here
}

```

这些宏会生成用于接收和返回缓冲区结构的包装函数，并使用 `serde` 自动处理序列化/反序列化。

## 模块可用的 Host API \{#host-api-available-to-modules\}

模块可以导入并使用以下宿主函数：

* `clickhouse_server_version() -> i64` — 以整数形式返回 ClickHouse 服务器版本 (例如 v25.11.1.1 对应 25011001) 。
* `clickhouse_throw(ptr: i32, size: i32)` — 使用提供的消息抛出错误。接受指向错误消息字符串所在内存位置的指针以及字符串的长度。
* `clickhouse_log(ptr: i32, size: i32)` — 将消息记录到 ClickHouse 服务器文本日志中。
* `clickhouse_random(ptr: i32, size: i32)` — 使用随机字节填充内存。
* `env.abort(message: i32, fileName: i32, line: i32, column: i32)` — 为与 AssemblyScript 兼容的模块提供。调用它 (或触发会调用它的 AssemblyScript 运行时 trap) 会终止 UDF，并抛出一个包含已解码消息和源位置的 `WASM_ERROR` 异常。未导入 `env.abort` 的模块不会受影响。

## 设置 \{#settings\}

以下查询级别设置用于控制 WebAssembly UDF 的执行：

* `webassembly_udf_max_fuel` — 每个 WebAssembly UDF 实例执行可使用的 fuel 上限。每条 WebAssembly 指令都会消耗一定数量的 fuel。该值在传递给运行时之前会先乘以 1024，因此 `webassembly_udf_max_fuel = 1` 大致对应 1024 个 fuel 单位。设置为 0 表示没有有限上限。仅适用于每个函数的设置 `webassembly_udf_enable_fuel` 为 true 的函数，且该值默认为 true。

* `webassembly_udf_max_memory` — 每个 WebAssembly UDF 实例的内存限制 (以字节为单位) 。

* `webassembly_udf_max_input_block_size` — 在单个块中传递给 WebAssembly UDF 的最大行数。设置为 0 表示一次性处理所有行。

* `webassembly_udf_max_instances` — 每个函数可并行运行的 WebAssembly UDF 实例最大数量。

示例用法：

```sql
SET webassembly_udf_max_fuel = 200000;
SELECT my_wasm_udf(column) FROM table;
```

## 另请参阅 \{#see-also\}

* [ClickHouse UDF 概述](/sql-reference/functions/udf)