---
description: 'WebAssembly 사용자 정의 함수(UDF)에 대한 문서'
sidebar_label: 'WebAssembly UDFs'
slug: /sql-reference/functions/wasm_udf
title: 'WebAssembly 사용자 정의 함수(UDF)'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# WebAssembly 사용자 정의 함수 \{#webassembly-user-defined-functions\}

ClickHouse는 WebAssembly로 작성된 사용자 정의 함수(UDF)를 생성하는 기능을 지원합니다. 이를 통해 Rust, C, C++ 등의 언어로 작성한 사용자 정의 로직을 WebAssembly 모듈로 컴파일하여 실행할 수 있습니다.

<CloudNotSupportedBadge />

<ExperimentalBadge />

## 개요 \{#overview\}

WebAssembly 모듈은 ClickHouse에서 호출할 수 있는 하나 이상의 함수를 포함하는 컴파일된 바이너리 파일입니다.
모듈은 한 번 로드한 후 여러 번 재사용하는 라이브러리 또는 공유 객체로 생각하면 됩니다.

UDF를 포함하는 WebAssembly 모듈은 Rust, C, C++ 등 WebAssembly로 컴파일할 수 있는 어느 언어로든 작성할 수 있습니다.

WebAssembly로 컴파일된 코드(「게스트」 코드)와 이를 실행하는 ClickHouse(「호스트」)는 전용 메모리 공간에만 접근할 수 있는 샌드박스 환경에서 동작합니다.

게스트 코드는 ClickHouse가 호출할 수 있는 함수들을 내보냅니다(export). 여기에는 사용자 정의 로직을 구현하는 함수(UDF 정의에 사용됨)뿐 아니라, 메모리 관리와 ClickHouse와 WebAssembly 코드 간 데이터 교환에 필요한 지원 함수들도 포함됩니다.

사용자 코드는 운영 체제나 표준 라이브러리에 대한 의존성 없이 「freestanding」 WebAssembly(즉, `wasm32-unknown-unknown`)로 컴파일되어야 합니다. 또한 기본 32비트 WebAssembly 타깃만 지원되며(`wasm64` 확장은 지원되지 않음), 이 타깃을 사용해야 합니다.
모듈은 ClickHouse와 상호 작용하기 위해 지원되는 통신 프로토콜(ABI) 중 하나를 준수해야 합니다.

컴파일이 완료되면, 모듈의 바이너리 코드는 `system.webassembly_modules` 테이블에 삽입하여 ClickHouse로 로드합니다.
그 후 `CREATE FUNCTION ... LANGUAGE WASM` 구문을 사용하여 모듈이 내보낸(export한) 함수를 참조하는 UDF를 생성할 수 있습니다.

## 사전 준비 사항 \{#prerequisites\}

ClickHouse 설정에서 WebAssembly 지원을 활성화하십시오:

```xml
<clickhouse>
    <allow_experimental_webassembly_udf>true</allow_experimental_webassembly_udf>
    <webassembly_udf_engine>wasmtime</webassembly_udf_engine>
</clickhouse>
```

사용 가능한 엔진 구현:

* `wasmtime` (기본, 권장) — [WasmTime](https://github.com/bytecodealliance/wasmtime)를 사용합니다
* `wasmedge` — [WasmEdge](https://github.com/WasmEdge/WasmEdge)를 사용합니다

## 빠른 시작 \{#quick-start\}

이 예제에서는 [Collatz 추측](https://en.wikipedia.org/wiki/Collatz_conjecture) 계산기를 구현하여 WebAssembly UDF를 생성하는 전체 과정을 보여줍니다.

WebAssembly의 사람이 읽을 수 있는 표현인 WebAssembly Text 형식(WAT)으로 코드를 작성하므로, 이 단계에서는 별도의 프로그래밍 언어가 필요하지 않습니다.
ClickHouse에서는 모듈이 바이너리 형식이어야 하므로, WAT를 WASM으로 변환하기 위해 트랜스파일러를 사용합니다.
이 변환을 위해 [WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt)의 `wat2wasm` 또는 [wasm-tools](https://github.com/bytecodealliance/wasm-tools)의 `parse` 명령을 사용할 수 있습니다.

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

위의 스니펫에서는 `FORMAT RawBlob`을 사용해 바이너리 WASM 코드를 ClickHouse 클라이언트로 직접 파이프하여 `system.webassembly_modules` 테이블에 삽입합니다.

그런 다음 모듈에서 export한 `steps` 함수를 참조하는 UDF를 정의합니다:

```sql
CREATE FUNCTION collatz_steps LANGUAGE WASM ARGUMENTS (n UInt32) RETURNS UInt32 FROM 'collatz' :: 'steps';
```

`::` 뒤에는 모듈의 함수 이름을 지정합니다. 이는 UDF 이름과 다르기 때문입니다.

이제 쿼리에서 `collatz_steps` 함수를 사용할 수 있습니다.

```sql
SELECT groupArray(collatz_steps(number :: UInt32))
FROM numbers(1, 100)
FORMAT TSV
```

`number` 컬럼은 WebAssembly 함수가 `CREATE FUNCTION` 문에서 지정한 시그니처와 타입이 정확히 일치하기를 기대하기 때문에, 명시적으로 `UInt32`로 캐스팅합니다.

그 결과 1부터 100까지의 수에 대한 Collatz 단계 수열을 얻으며, 이는 [OEIS의 A006577 수열](https://oeis.org/A006577)에 해당합니다.

```text
[0,1,7,2,5,8,16,3,19,6,14,9,9,17,17,4,12,20,20,7,7,15,15,10,23,10,111,18,18,18,106,5,26,13,13,21,21,21,34,8,109,8,29,16,16,16,104,11,24,24,24,11,11,112,112,19,32,19,32,19,19,107,107,6,27,27,27,14,14,14,102,22,115,22,14,22,22,35,35,9,22,110,110,9,9,30,30,17,30,17,92,17,17,105,105,12,118,25,25,25]
```

## system 테이블을 통한 WASM 모듈 관리 \{#manage-wasm-modules-via-system-table\}

WebAssembly 모듈은 다음 구조를 가진 `system.webassembly_modules` 테이블에 저장됩니다:

* **컬럼**
  * `name` String — 모듈 이름입니다. 비어 있을 수 없으며, 영숫자 및 밑줄 문자만 허용됩니다.
  * `code` String — 원시 바이너리 WASM 코드입니다. 쓰기 전용이며, 읽기 시 빈 문자열이 반환됩니다.
  * `hash` UInt256 — 모듈 바이너리의 SHA256 값입니다(디스크에 존재하지만 아직 로드되지 않은 경우 0).

모듈 관리는 이 테이블에 대한 표준 SQL 연산으로 수행됩니다.

### 모듈 추가 \{#insert-a-module\}

```sql
INSERT INTO system.webassembly_modules (name, code)
SELECT 'my_module', base64Decode('AGFzbQEAAAA...');
```

무결성 해시를 선택적으로 지정하십시오:

```sql
INSERT INTO system.webassembly_modules (name, code, hash)
SELECT 'my_module', base64Decode('...'), reinterpretAsUInt256(unhex('369f...c57d'));
```

제공된 해시가 모듈 코드의 SHA256 값과 일치하지 않으면 삽입 작업이 실패합니다. 이는 S3나 HTTP와 같은 외부 소스에서 모듈을 로드할 때 유용합니다.

### 모듈 목록 조회 \{#list-modules\}

```sql
SELECT name, lower(hex(reinterpretAsFixedString(hash))) AS sha256 FROM system.webassembly_modules

   ┌─name────┬─sha256───────────────────────────────────────────────────────────┐
1. │ collatz │ a084a10b7b5cb07db198bc93bf1f3c1f8cb8ef279df7a4f6b66b1cdd55d79c48 │
   └─────────┴──────────────────────────────────────────────────────────────────┘
```

### 모듈 삭제 \{#delete-a-module\}

`DELETE FROM system.webassembly_modules WHERE name = '...'` 구문으로 삭제를 수행합니다.
하나의 구문에서는 이름이 정확히 일치하는 하나의 모듈만 삭제할 수 있습니다.

```sql
DELETE FROM system.webassembly_modules WHERE name = 'collatz';
```

기존 UDF 중 해당 모듈을 참조하는 것이 하나라도 있으면 삭제 작업이 실패하므로, 먼저 해당 UDF들을 삭제해야 합니다.

## WebAssembly UDF 생성하기 \{#create-a-webassembly-udf\}

**구문**:

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

**매개변수**:

* `function_name`: ClickHouse의 함수 이름입니다. 모듈에서 내보내는 함수 이름과 다를 수 있습니다.
* `FROM 'module_name' :: 'source_function_name'`: 로드된 WASM 모듈의 이름과, 해당 WASM 모듈에서 사용할 함수 이름입니다(기본값은 `function_name`).
* `ARGUMENTS`: 인자 이름과 데이터 타입 목록입니다(이름은 선택 사항이며, 필드 이름을 지원하는 직렬화 형식에서 사용됩니다).
* `ABI`: Application Binary Interface 버전입니다.
  * `ROW_DIRECT`: 직접 타입 매핑, 행 단위 처리
  * `BUFFERED_V1`: 직렬화를 사용하는 블록 기반 처리
* `SHA256_HASH`: 검증을 위한 예상 모듈 해시입니다(생략 시 자동으로 채워지며), 서로 다른 레플리카에서 올바른 WASM 모듈이 로드되었는지 보장하는 데 사용할 수 있습니다.
* `SETTINGS`: 함수별 설정입니다.
  * `max_fuel` UInt64 — 인스턴스당 명령어 연료량입니다. 기본값: `100000`.
  * `max_memory` UInt64 — 인스턴스당 최대 메모리 사용량(바이트 단위)입니다. 범위: 64 KiB … 4 GiB. 기본값: `104857600` (100 MiB).
  * `serialization_format` String — ABI에서 요구하는 경우 사용할 직렬화 형식입니다. 기본값: `MsgPack`.
  * `max_input_block_size` UInt64 — 지정된 경우, 블록 기반 처리를 사용하는 ABI에서 입력 블록의 최대 크기를 행 단위로 제한합니다. 기본값: `0` (무제한).
  * `max_instances` UInt64 — 단일 쿼리에서 함수별 최대 병렬 인스턴스 수입니다. 기본값: `128`.

## ABI 버전 \{#abis-versions\}

ClickHouse와 상호 작용하려면 WebAssembly 모듈이 지원되는 ABI(Application Binary Interface) 중 하나를 준수해야 합니다.

* `ROW_DIRECT`: 타입을 직접 매핑(기본 타입 `Int32`, `UInt32`, `Int64`, `UInt64`, `Float32`, `Float64`만 해당)
* `BUFFERED_V1`: 직렬화를 사용하는 복합 타입

### ABI ROW_DIRECT \{#abi-row_direct\}

각 행(row)마다 export된 WASM 함수를 직접 호출합니다.

* 인수와 반환 타입은 `Int32/UInt32/Int64/UInt64/Float32/Float64/Int128/UInt128`와 같은 숫자 타입입니다.
* 문자열(String)은 이 ABI에서 지원되지 않습니다.
* 시그니처는 WASM export(`i32/i64/f32/f64/v128`)와 일치해야 합니다.
* 모듈에서 별도로 export해야 하는 지원 함수는 없습니다.

예를 들어 다음과 같은 시그니처를 가진 함수:

```
(func (param i32 i64 f32) (result f64) ...)
```

다음과 같이 생성합니다:

```sql
CREATE FUNCTION my_func ARGUMENTS (Int32, UInt64, Float32) RETURNS Float64 ...
```

WebAssembly는 부호 있는 인자와 부호 없는 인자를 구분하지 않고, 값을 해석하기 위해 각기 다른 명령어를 사용합니다. 따라서 인자의 크기는 정확히 동일해야 하며, 부호 여부는 FUNCTION 내부에서 수행되는 연산에 의해 결정됩니다.

### ABI BUFFERED_V1 \{#abi-buffered_v1\}

:::note
이 ABI는 실험적이며 향후 릴리스에서 변경될 수 있습니다.
:::

전체 블록을 한 번에 처리하고, WASM 메모리를 통한 (역)직렬화를 사용합니다. 모든 인자 및 반환 타입을 지원합니다.

직렬화된 데이터는 버퍼에 대한 포인터(데이터 포인터와 데이터 크기로 구성된 버퍼)를 통해 wasm 메모리로 복사된 뒤, 입력 행 수와 함께 UDF 함수에 전달됩니다. 따라서 WASM 측 UDF는 항상 두 개의 `i32` 인자를 받고 단일 `i32` 값을 반환합니다.
게스트 코드는 데이터를 처리한 후 직렬화된 결과 데이터가 들어 있는 결과 버퍼에 대한 포인터를 반환합니다.

게스트 코드는 이러한 버퍼를 생성하고 해제하기 위한 두 개의 함수를 제공해야 합니다.

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

C 정의 예시:

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

  !!! TODO: 크레이트가 아직 게시되지 않았습니다

  ### Rust에서 UDF를 개발할 때 참고 사항

  Rust 프로그램의 경우 ClickHouse용 WebAssembly UDF 개발을 단순화하기 위해 도우미 크레이트 [clickhouse-wasm-udf](https://crates.io/crates/clickhouse-wasm-udf)를 제공합니다. 이 크레이트는 메모리 관리를 위한 함수를 제공하므로 `clickhouse_create_buffer` 및 `clickhouse_destroy_buffer` 함수를 직접 구현할 필요 없이 크레이트를 의존성으로 추가하기만 하면 됩니다. 또한 일반적인 Rust 함수들을 요구되는 ABI 형식으로 래핑하기 위한 매크로 `#[clickhouse_wasm_udf]`도 제공합니다.

  이 크레이트를 사용하면 다음과 같이 UDF를 작성할 수 있습니다:


  ```rust

  use clickhouse_wasm_udf_bindgen::clickhouse_udf;

  #[clickhouse_udf]
  pub fn some_udf(data: String) -> HashMap<String, String> {
    // 구현을 여기에 작성하십시오
  }

  ```

  매크로는 버퍼 구조를 인수 및 반환값으로 받는 래퍼 함수를 생성하고, `serde`를 사용하여 직렬화/역직렬화를 자동으로 처리합니다.

  */ }

## 모듈에서 사용 가능한 Host API

다음 Host 함수는 모듈에서 가져와(import) 사용할 수 있습니다:

* `clickhouse_server_version() -> i64` — ClickHouse 서버 버전을 정수로 반환합니다(예: v25.11.1.1의 경우 25011001).
* `clickhouse_terminate(ptr: i32, size: i32)` — 제공된 메시지로 오류를 발생시킵니다. 오류 메시지 문자열이 저장된 메모리 위치에 대한 포인터와 문자열 크기를 인수로 받습니다.
* `clickhouse_log(ptr: i32, size: i32)` — 메시지를 ClickHouse 서버 텍스트 로그에 기록합니다.
* `clickhouse_random(ptr: i32, size: i32)` — 메모리를 임의의 바이트로 채웁니다.

## 같이 보기 \{#host-api-available-to-modules\}

* [ClickHouse UDF 개요](/sql-reference/functions/udf)