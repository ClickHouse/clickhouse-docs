---
description: 'WebAssembly ユーザー定義関数のドキュメント'
sidebar_label: 'WebAssembly UDFs'
slug: /sql-reference/functions/wasm_udf
title: 'WebAssembly ユーザー定義関数'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# WebAssembly ユーザー定義関数 \{#webassembly-user-defined-functions\}

ClickHouse は、WebAssembly で実装されたユーザー定義関数 (UDF) の作成をサポートしています。これにより、Rust や C、C++ などの言語で実装したカスタムロジックを WebAssembly モジュールにコンパイルし、実行できます。

<CloudNotSupportedBadge />

<ExperimentalBadge />

## 概要 \{#overview\}

WebAssembly モジュールは、ClickHouse から呼び出すことができる 1 つ以上の関数を含むコンパイル済みバイナリファイルです。
モジュールは、一度ロードして何度も再利用するライブラリまたは共有オブジェクトと考えることができます。

UDF を含む WebAssembly モジュールは、Rust、C、C++ など、WebAssembly へコンパイル可能な任意の言語で記述できます。

WebAssembly にコンパイルされたコード（「ゲスト」コード）と、それを実行する ClickHouse（「ホスト」）は、専用のメモリ空間にのみアクセス可能なサンドボックス環境内で実行されます。

ゲストコードは ClickHouse が呼び出せる関数をエクスポートします。これには、カスタムロジックを実装する関数（UDF を定義するために使用）に加えて、メモリ管理や、ClickHouse と WebAssembly コード間のデータ交換に必要なサポート関数が含まれます。

コードは、オペレーティングシステムや標準ライブラリへの依存を持たない「freestanding」WebAssembly（`wasm32-unknown-unknown`）としてコンパイルする必要があります。また、サポートされるのはデフォルトの 32 ビット WebAssembly ターゲットのみです（`wasm64` 拡張は使用できません）。モジュールは、ClickHouse と連携するためにサポートされているいずれかの通信プロトコル（ABI）に従わなければなりません。

コンパイル後、モジュールのバイナリコードは `system.webassembly_modules` テーブルに挿入することで ClickHouse にロードされます。
その後、`CREATE FUNCTION ... LANGUAGE WASM` ステートメントを使用して、モジュールによってエクスポートされる関数を参照する UDF を作成できます。

## 前提条件 \{#prerequisites\}

ClickHouse の設定で WebAssembly サポートを有効化します。

```xml
<clickhouse>
    <allow_experimental_webassembly_udf>true</allow_experimental_webassembly_udf>
    <webassembly_udf_engine>wasmtime</webassembly_udf_engine>
</clickhouse>
```

利用可能なエンジン実装:

* `wasmtime`（デフォルト、推奨）— [WasmTime](https://github.com/bytecodealliance/wasmtime) を使用
* `wasmedge` — [WasmEdge](https://github.com/WasmEdge/WasmEdge) を使用

## クイックスタート \{#quick-start\}

この例では、[Collatz conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture)（コラッツ予想）の計算機を実装することで、WebAssembly UDF を作成するまでの一連のワークフローを示します。

ここでは WebAssembly Text 形式 (WAT) でコードを記述します。WAT は WebAssembly の人間が読みやすい表現であり、この段階では特定のプログラミング言語は必要ありません。
ClickHouse ではモジュールはバイナリ形式である必要があるため、トランスパイラを使って WAT を WASM に変換します。
この変換を行うには、[WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt) の `wat2wasm` か、[wasm-tools](https://github.com/bytecodealliance/wasm-tools) の `parse` コマンドを使用できます。

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

上記のスニペットでは、バイナリの WASM コードを `FORMAT RawBlob` を用いてパイプし、直接 ClickHouse クライアントに渡して `system.webassembly_modules` テーブルに挿入しています。

次に、そのモジュールからエクスポートされている `steps` 関数を参照する UDF を定義します。

```sql
CREATE FUNCTION collatz_steps LANGUAGE WASM ARGUMENTS (n UInt32) RETURNS UInt32 FROM 'collatz' :: 'steps';
```

`::` の後ろには、UDF 名とは異なるモジュール内の関数名を指定している点に注意してください。

これで、クエリ内で `collatz_steps` 関数を使用できるようになりました。

```sql
SELECT groupArray(collatz_steps(number :: UInt32))
FROM numbers(1, 100)
FORMAT TSV
```

`number` カラムは `UInt32` に明示的にキャストされています。これは、WebAssembly 関数が `CREATE FUNCTION` ステートメントで指定されたシグネチャと型が完全に一致していることを要求するためです。

結果として、1 から 100 までの数値に対する Collatz 手順の数列が得られ、これは [OEIS の A006577](https://oeis.org/A006577) に対応します。

```text
[0,1,7,2,5,8,16,3,19,6,14,9,9,17,17,4,12,20,20,7,7,15,15,10,23,10,111,18,18,18,106,5,26,13,13,21,21,21,34,8,109,8,29,16,16,16,104,11,24,24,24,11,11,112,112,19,32,19,32,19,19,107,107,6,27,27,27,14,14,14,102,22,115,22,14,22,22,35,35,9,22,110,110,9,9,30,30,17,30,17,92,17,17,105,105,12,118,25,25,25]
```

## system テーブル経由で WASM モジュールを管理する \{#manage-wasm-modules-via-system-table\}

WebAssembly モジュールは、次の構造を持つ `system.webassembly_modules` テーブルに保存されます。

* **Columns**
  * `name` String — モジュール名。空でないこと、かつ英数字およびアンダースコアのみ。
  * `code` String — 生のバイナリ形式の WASM コード。書き込み専用で、読み取り時は空文字列を返します。
  * `hash` UInt256 — モジュールバイナリの SHA256（ディスク上には存在するがまだロードされていない場合はゼロ）。

モジュールの管理は、このテーブルに対する標準的な SQL 操作によって行います。

### モジュールを追加する \{#insert-a-module\}

```sql
INSERT INTO system.webassembly_modules (name, code)
SELECT 'my_module', base64Decode('AGFzbQEAAAA...');
```

必要に応じて、インテグリティハッシュを指定します：

```sql
INSERT INTO system.webassembly_modules (name, code, hash)
SELECT 'my_module', base64Decode('...'), reinterpretAsUInt256(unhex('369f...c57d'));
```

指定されたハッシュ値がモジュールコードから計算された SHA256 と一致しない場合、挿入は行われません。これは、S3 や HTTP などの外部ソースからモジュールを読み込む際に役立ちます。

### モジュールを一覧する \{#list-modules\}

```sql
SELECT name, lower(hex(reinterpretAsFixedString(hash))) AS sha256 FROM system.webassembly_modules

   ┌─name────┬─sha256───────────────────────────────────────────────────────────┐
1. │ collatz │ a084a10b7b5cb07db198bc93bf1f3c1f8cb8ef279df7a4f6b66b1cdd55d79c48 │
   └─────────┴──────────────────────────────────────────────────────────────────┘
```

### モジュールを削除する \{#delete-a-module\}

削除は `DELETE FROM system.webassembly_modules WHERE name = '...'` ステートメントによって行います。
1 回のステートメントにつき、名前が完全一致するモジュールを 1 つだけ削除できます。

```sql
DELETE FROM system.webassembly_modules WHERE name = 'collatz';
```

既存の UDF がそのモジュールを参照している場合、削除は失敗するため、まずそれらの UDF を削除する必要があります。

## WebAssembly UDF を作成する \{#create-a-webassembly-udf\}

**構文**:

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

**パラメータ**:

* `function_name`: ClickHouse 内での関数名。モジュール内でエクスポートされている関数名とは異なる場合があります。
* `FROM 'module_name' :: 'source_function_name'`: 読み込まれる WASM モジュール名と、使用する WASM モジュール内の関数名（省略時は `function_name` が既定値）。
* `ARGUMENTS`: 引数名と型のリスト（名前は任意。名前付きフィールドをサポートするシリアライゼーション形式で使用されます）
* `ABI`: Application Binary Interface のバージョン
  * `ROW_DIRECT`: 型を直接マッピングし、行単位で処理
  * `BUFFERED_V1`: シリアライゼーションを伴うブロック単位の処理
* `SHA256_HASH`: 検証用の期待されるモジュールハッシュ（省略時は自動設定）。異なるレプリカ間で正しい WASM モジュールが読み込まれていることを保証するために使用できます。
* `SETTINGS`: 関数ごとの設定
  * `max_fuel` UInt64 — インスタンスごとの命令実行用 fuel。既定値: `100000`。
  * `max_memory` UInt64 — インスタンスごとの最大メモリ使用量（バイト単位）。範囲: 64 KiB 〜 4 GiB。既定値: `104857600`（100 MiB）。
  * `serialization_format` String — ABI がシリアライゼーション形式を必要とする場合に使用される形式。既定値: `MsgPack`。
  * `max_input_block_size` UInt64 — 指定された場合、ブロックベース処理を行う ABI に対して、入力ブロックサイズの最大値（行数）を制限します。既定値: `0`（無制限）。
  * `max_instances` UInt64 — 1 つのクエリ内で関数ごとに並列実行されるインスタンスの最大数。既定値: `128`。

## ABI バージョン \{#abis-versions\}

ClickHouse とやり取りするために、WebAssembly モジュールはサポートされているいずれかの ABI（Application Binary Interface）に準拠する必要があります。

* `ROW_DIRECT`: 直接型マッピング（プリミティブ型 `Int32`, `UInt32`, `Int64`, `UInt64`, `Float32`, `Float64` のみ）
* `BUFFERED_V1`: シリアル化を用いた複合型

### ABI ROW_DIRECT \{#abi-row_direct\}

エクスポートされた WASM 関数を、行ごとに直接呼び出します。

* 引数および戻り値の型は数値型 `Int32/UInt32/Int64/UInt64/Float32/Float64/Int128/UInt128` のみです。
* この ABI では文字列はサポートされません。
* シグネチャは WASM エクスポート（`i32/i64/f32/f64/v128`）と一致している必要があります。
* モジュールからエクスポートされるべきサポート関数は不要です。

例えば、次のようなシグネチャを持つ関数です:

```
(func (param i32 i64 f32) (result f64) ...)
```

次のように作成できます。

```sql
CREATE FUNCTION my_func ARGUMENTS (Int32, UInt64, Float32) RETURNS Float64 ...
```

WebAssembly は符号付き引数と符号なし引数を区別せず、値の解釈に異なる命令を使用します。そのため、引数のサイズは厳密に一致している必要があり、符号の有無は関数内で行われる演算によって決定されます。

### ABI BUFFERED_V1 \{#abi-buffered_v1\}

:::note
この ABI は実験的なものであり、将来のリリースで変更される可能性があります。
:::

WASM メモリを介したシリアライズ/デシリアライズにより、一度にブロック全体を処理します。任意の引数および戻り値の型をサポートします。

シリアライズされたデータは、wasm メモリ上のバッファ（データへのポインタとデータサイズから構成される構造体）へのポインタとしてコピーされ、入力の行数とともに UDF 関数に渡されます。したがって、wasm 実行時のユーザー定義関数は常に 2 つの `i32` 引数を受け取り、単一の `i32` 値を返します。
ゲストコードはこのデータを処理し、シリアライズされた結果データを含む結果バッファへのポインタを返します。

ゲストコードは、これらのバッファを作成および破棄するための 2 つの関数を提供しなければなりません。

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

C での定義例:

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

  !!! TODO: クレートはまだ公開されていません

  ### Rust で UDF を開発する際の注意

  Rust プログラム向けに、ClickHouse 用の WebAssembly UDF の開発を容易にするヘルパークレート [clickhouse-wasm-udf](https://crates.io/crates/clickhouse-wasm-udf) を提供しています。このクレートはメモリ管理用の関数を提供するため、`clickhouse_create_buffer` と `clickhouse_destroy_buffer` 関数を自前で実装する必要はなく、依存関係としてこのクレートを追加するだけで済みます。また、通常の Rust 関数を要求される ABI にラップするためのマクロ `#[clickhouse_wasm_udf]` も用意されています。

  このクレートを用いることで、次のように UDF を記述できます:


  ```rust

  use clickhouse_wasm_udf_bindgen::clickhouse_udf;

  #[clickhouse_udf]
  pub fn some_udf(data: String) -> HashMap<String, String> {
    // ここに実装を記述します
  }

  ```

  これらのマクロは、バッファ構造体を受け取り返すラッパー関数を生成し、`serde` を用いてシリアライズ／デシリアライズ処理を自動的に行います。

  */ }

## モジュールで利用可能なホスト API

次のホスト関数をモジュールからインポートして使用できます。

* `clickhouse_server_version() -> i64` — ClickHouse サーバーのバージョンを整数として返します（例: v25.11.1.1 の場合は 25011001）。
* `clickhouse_terminate(ptr: i32, size: i32)` — 指定されたメッセージでエラーをスローします。エラーメッセージ文字列を含むメモリ領域へのポインタと、その文字列のサイズを受け取ります。
* `clickhouse_log(ptr: i32, size: i32)` — メッセージを ClickHouse サーバーのテキストログに出力します。
* `clickhouse_random(ptr: i32, size: i32)` — メモリをランダムなバイトで埋めます。

## 関連項目 \{#host-api-available-to-modules\}

* [ClickHouse UDF の概要](/sql-reference/functions/udf)