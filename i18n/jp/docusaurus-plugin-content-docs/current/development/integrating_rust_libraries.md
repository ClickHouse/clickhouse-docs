description: 'ClickHouseへのRustライブラリ統合のためのガイド'
sidebar_label: 'Rustライブラリ'
slug: /development/integrating_rust_libraries
title: 'Rustライブラリの統合'
```


# Rustライブラリ

Rustライブラリの統合は、BLAKE3ハッシュ関数の統合に基づいて説明されます。

統合の最初のステップは、/rustフォルダにライブラリを追加することです。これを行うには、空のRustプロジェクトを作成し、Cargo.tomlに必要なライブラリを含める必要があります。また、Cargo.tomlに`crate-type = ["staticlib"]`を追加して、新しいライブラリのコンパイルを静的に構成する必要があります。

次に、Corrosionライブラリを使用してライブラリをCMakeにリンクする必要があります。最初のステップは、/rustフォルダ内のCMakeLists.txtにライブラリフォルダを追加することです。その後、ライブラリディレクトリにCMakeLists.txtファイルを追加します。その中で、Corrosionのインポート関数を呼び出す必要があります。これらの行はBLAKE3をインポートするために使用されました：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

このようにして、Corrosionを使用して正しいCMakeターゲットを作成し、より便利な名前に変更します。名前`_ch_rust_blake3`はCargo.tomlから来ており、ここではプロジェクト名（`name = "_ch_rust_blake3"`）として使用されています。

Rustのデータ型はC/C++のデータ型と互換性がないため、空のライブラリプロジェクトを使用して、C/C++から受け取ったデータの変換、ライブラリメソッドの呼び出し、出力データの逆変換のためのシムメソッドを作成します。たとえば、このメソッドはBLAKE3用に書かれました：

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

このメソッドは、C互換の文字列、そのサイズ、および出力文字列ポインタを入力として取得します。次に、C互換の入力を実際のライブラリメソッドで使用される型に変換し、それらを呼び出します。その後、ライブラリメソッドの出力をC互換型に戻す必要があります。この特定のケースでは、ライブラリはメソッドfill()を使用してポインタに直接書き込むことをサポートしているため、変換は必要ありません。ここでの主なアドバイスは、メソッドを少なく作成することです。そうすれば、各メソッド呼び出しで行う変換が少なくなり、大きなオーバーヘッドを生じさせることがありません。

`#[no_mangle]`属性と`extern "C"`は、すべてのそのようなメソッドに必須であることに注意してください。これがないと、正しいC/C++互換のコンパイルを行うことができません。さらに、統合の次のステップにも必要です。

シムメソッドのコードを書いた後、ライブラリのヘッダーファイルを準備する必要があります。これは手動で行うこともできますし、cbindgenライブラリを使用して自動生成することもできます。cbindgenを使用する場合は、build.rsビルドスクリプトを書く必要があり、cbindgenをビルド依存関係として含める必要があります。

ヘッダーファイルを自動生成できるビルドスクリプトの一例：

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

また、すべてのC互換属性には`#[no_mangle]`と`extern "C"`の属性を使用する必要があります。これがないとライブラリが正しくコンパイルされず、cbindgenがヘッダーの自動生成を実行できなくなります。

これらのすべてのステップを終えたら、小さなプロジェクトでライブラリをテストして、互換性やヘッダー生成の問題を見つけることができます。ヘッダー生成中に問題が発生した場合は、cbindgen.tomlファイルで設定を調整することができます（ここにテンプレートがあります: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3を統合する際に発生した問題にも注意が必要です：
MemorySanitizerは、Rust内のいくつかの変数が初期化されているかどうかを確認できないため、偽陽性の報告を引き起こす可能性があります。この問題は、特定の変数に対してより明確な定義を持つメソッドを書くことで解決されましたが、このメソッドの実装は遅く、MemorySanitizerビルドを修正するためにのみ使用されます。
