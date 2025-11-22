---
description: 'Rust ライブラリを ClickHouse に統合するためのガイド'
sidebar_label: 'Rust ライブラリ'
slug: /development/integrating_rust_libraries
title: 'Rust ライブラリの統合'
doc_type: 'guide'
---

# Rust ライブラリ

Rust ライブラリの統合については、BLAKE3 ハッシュ関数の統合を例に説明します。

統合の最初のステップは、ライブラリを /rust フォルダに追加することです。そのためには、空の Rust プロジェクトを作成し、必要なライブラリを Cargo.toml に追加する必要があります。また、Cargo.toml に `crate-type = ["staticlib"]` を追加し、新しいライブラリが静的ライブラリとしてコンパイルされるよう設定する必要があります。

次に、Corrosion ライブラリを使用して、ライブラリを CMake にリンクする必要があります。最初のステップは、/rust フォルダ内の CMakeLists.txt にライブラリディレクトリを追加することです。その後、ライブラリディレクトリに CMakeLists.txt ファイルを追加します。その中で Corrosion の import 関数を呼び出します。BLAKE3 をインポートするために使用した行は次のとおりです。

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

したがって、Corrosion を使用して適切な CMake ターゲットを作成し、その後、より便利な名前に付け直します。`_ch_rust_blake3` という名前は Cargo.toml に由来しており、そこでプロジェクト名として使用されています（`name = "_ch_rust_blake3"`）。

Rust のデータ型は C/C++ のデータ型と互換性がないため、この空のライブラリプロジェクトを利用して、C/C++ から受け取ったデータの変換、ライブラリメソッドの呼び出し、出力データの逆変換を行うためのシム（shim）メソッドを作成します。例えば、BLAKE3 用には次のようなメソッドが定義されています。

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
        let err_str = CString::new("入力がnullポインターでした").unwrap();
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

このメソッドは、C 互換の文字列、そのサイズ、および出力用の文字列ポインタを引数として受け取ります。次に、C 互換の入力を実際のライブラリメソッドで使用される型に変換し、そのメソッドを呼び出します。その後、ライブラリメソッドの出力を C 互換の型に戻す必要があります。この特定のケースでは、ライブラリがメソッド `fill()` によるポインタへの直接書き込みをサポートしていたため、この変換は不要でした。ここでの主な推奨事項は、メソッドの数をできるだけ少なくし、各メソッド呼び出し時に必要となる変換処理を減らしてオーバーヘッドを抑えることです。

`#[no_mangle]` 属性と `extern "C"` は、このようなすべてのメソッドに対して必須である点に注意してください。これらがない場合、C/C++ 互換の正しいコンパイルを行うことはできません。さらに、これらは以降の統合ステップにとっても必要になります。

シム (shim) メソッドのコードを記述したら、ライブラリ用のヘッダーファイルを用意する必要があります。これは手作業で行うことも、自動生成のために cbindgen ライブラリを使用することもできます。cbindgen を使用する場合は、`build.rs` ビルドスクリプトを作成し、cbindgen をビルド依存として追加する必要があります。

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

また、すべての C 互換の対象には属性 #[no&#95;mangle] と `extern "C"` を使用する必要があります。これらを指定しないと、ライブラリが正しくコンパイルされず、cbindgen によるヘッダーファイルの自動生成も行われません。


これらすべての手順を終えたら、小規模なプロジェクト内でライブラリをテストし、互換性やヘッダー生成に関する問題を洗い出すことができます。ヘッダー生成中に問題が発生した場合は、`cbindgen.toml` ファイルで設定を行うことを検討してください（テンプレートはこちらにあります: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3 を統合した際に発生した問題についても触れておきます。
MemorySanitizer は、Rust 内の一部の変数が初期化されているかどうかを判別できないため、誤検出（偽陽性）を報告する可能性があります。この問題は、一部の変数をより明示的に扱うメソッドを実装することで解決しましたが、そのメソッドの実装はより低速であり、MemorySanitizer 用ビルドを修正する目的でのみ使用されています。