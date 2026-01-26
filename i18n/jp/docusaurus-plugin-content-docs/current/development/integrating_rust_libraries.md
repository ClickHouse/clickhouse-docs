---
description: 'Rust ライブラリを ClickHouse に統合するためのガイド'
sidebar_label: 'Rust ライブラリ'
slug: /development/integrating_rust_libraries
title: 'Rust ライブラリの統合'
doc_type: 'guide'
---

# Rust ライブラリ \{#rust-libraries\}

Rust ライブラリの統合については、BLAKE3 ハッシュ関数の統合を例に説明します。

統合の最初のステップは、ライブラリを /rust フォルダに追加することです。これを行うには、空の Rust プロジェクトを作成し、必要なライブラリを Cargo.toml に記述する必要があります。また、Cargo.toml に `crate-type = ["staticlib"]` を追加して、新しいライブラリをスタティックライブラリとしてコンパイルするよう設定する必要があります。

次に、Corrosion ライブラリを使用して CMake にライブラリをリンクする必要があります。最初のステップは、/rust フォルダ内の CMakeLists.txt にライブラリのフォルダを追加することです。その後、ライブラリディレクトリに CMakeLists.txt ファイルを追加する必要があります。その中で、Corrosion の import 関数を呼び出す必要があります。BLAKE3 をインポートするために、次の行が使用されました:

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

したがって、まず Corrosion を使って正しい CMake ターゲットを作成し、その後、より扱いやすい名前に変更します。なお、`_ch_rust_blake3` という名前は Cargo.toml でプロジェクト名として使用されているものです（`name = "_ch_rust_blake3"`）。

Rust のデータ型は C/C++ のデータ型と互換性がないため、この空のライブラリプロジェクトを利用して、C/C++ から受け取ったデータの変換、ライブラリメソッドの呼び出し、および出力データの逆変換を行うためのシム用メソッドを作成します。例えば、BLAKE3 向けには次のようなメソッドが作成されました。

```rust
#[no_mangle]
pub unsafe extern "C" fn blake3_apply_shim(
    begin: *const c_char,
    _size: u32,
    out_char_data: *mut u8,
```

```rust
#[no_mangle]
pub unsafe extern "C" fn blake3_apply_shim(
    begin: *const c_char,
    _size: u32,
    out_char_data: *mut u8,
) -> *mut c_char {
    if begin.is_null() {
        let err_str = CString::new("input was a null pointer").unwrap();
        return err_str.into_raw();
    }
    let mut hasher = blake3::Hasher::new();
    let input_bytes = CStr::from_ptr(begin);
    let input_res = input_bytes.to_bytes();
    hasher.update(input_res);
    let mut reader = hasher.finalize_xof();
    reader.fill(std::slice::from_raw_parts_mut(out_char_data, blake3::OUT_LEN));
    std::ptr::null_mut()
}
```

このメソッドは、C 互換の文字列、そのサイズ、および出力文字列ポインタを引数として受け取ります。その後、C 互換の入力を実際のライブラリメソッドで使用される型に変換し、そのメソッドを呼び出します。その後で、ライブラリメソッドの出力を再び C 互換の型へ変換し直す必要があります。この特定のケースでは、ライブラリが `fill()` メソッドによるポインタへの直接書き込みをサポートしていたため、変換は不要でした。ここでの主なアドバイスは、メソッドの数をできるだけ減らし、各メソッド呼び出しで必要となる変換処理を減らすことで、オーバーヘッドの増加を防ぐことです。

`#[no_mangle]` 属性と `extern "C"` は、このようなメソッドすべてに対して必須であることに注意してください。これらがないと、正しい C/C++ 互換のコンパイルを行うことはできません。さらに、これらは次の連携ステップにおいても必要となります。

シムメソッドのコードを書いた後は、ライブラリ用のヘッダーファイルを用意する必要があります。これは手動で作成することもできますし、cbindgen ライブラリを使用して自動生成することもできます。cbindgen を使用する場合は、`build.rs` のビルドスクリプトを記述し、cbindgen をビルド依存関係として追加する必要があります。

ヘッダーファイルを自動生成できるビルドスクリプトの例:

```rust
    let crate_dir = env::var("CARGO_MANIFEST_DIR").unwrap();

    let package_name = env::var("CARGO_PKG_NAME").unwrap();
    let output_file = ("include/".to_owned() + &format!("{}.h", package_name)).to_string();

    match cbindgen::generate(&crate_dir) {
        Ok(header) => {
            header.write_to_file(&output_file);
        }
        Err(err) => {
            panic!("{}", err)
        }
    }
```

また、すべての C 互換の項目に対して属性 #[no&#95;mangle] と `extern "C"` を使用する必要があります。これらがないと、ライブラリが正しくコンパイルされず、cbindgen によるヘッダーの自動生成が実行されません。

これらすべての手順が完了したら、小さなプロジェクトでライブラリをテストして、互換性やヘッダー生成に関する問題をすべて洗い出してください。ヘッダー生成中に問題が発生した場合は、`cbindgen.toml` ファイルで設定を行ってみてください（テンプレートはここで参照できます: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3 を統合した際に発生した問題についても触れておきます。
MemorySanitizer は、Rust 内の一部の変数が初期化されているかどうかを判別できないため、誤検知を引き起こすことがあります。この問題は、いくつかの変数についてより明示的な定義を行うメソッドを記述することで解決しました。ただし、このメソッドの実装はより低速であり、MemorySanitizer ビルドを修正する目的でのみ使用されています。