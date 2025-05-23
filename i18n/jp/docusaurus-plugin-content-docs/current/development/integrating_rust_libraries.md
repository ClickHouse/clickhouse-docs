---
'description': 'Guide for integrating Rust libraries into ClickHouse'
'sidebar_label': 'Rust Libraries'
'slug': '/development/integrating_rust_libraries'
'title': 'Integrating Rust Libraries'
---




# Rustライブラリ

Rustライブラリの統合は、BLAKE3ハッシュ関数の統合に基づいて説明されます。

統合の最初のステップは、ライブラリを/rustフォルダーに追加することです。これを行うには、空のRustプロジェクトを作成し、Cargo.tomlに必要なライブラリを含める必要があります。また、`crate-type = ["staticlib"]`をCargo.tomlに追加することで、新しいライブラリのコンパイルを静的に設定する必要があります。

次に、Corrosionライブラリを使用してCMakeにライブラリをリンクする必要があります。最初のステップは、/rustフォルダー内のCMakeLists.txtにライブラリフォルダーを追加することです。その後、ライブラリディレクトリにCMakeLists.txtファイルを追加する必要があります。そこでは、Corrosionインポート関数を呼び出す必要があります。以下の行はBLAKE3をインポートするために使用されました：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

このようにして、私たちはCorrosionを使用して正しいCMakeターゲットを作成し、そしてより便利な名前にリネームします。名前`_ch_rust_blake3`はCargo.tomlから来ており、ここでプロジェクト名として使用されています（`name = "_ch_rust_blake3"`）。

Rustのデータ型はC/C++のデータ型と互換性がないため、空のライブラリプロジェクトを使用して、C/C++から受け取ったデータの変換、ライブラリメソッドの呼び出し、出力データの逆変換のためのシムメソッドを作成します。たとえば、このメソッドはBLAKE3のために記述されました：

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

このメソッドは、C互換文字列、そのサイズ、および出力文字列ポインタを入力として受け取ります。次に、C互換の入力を実際のライブラリメソッドで使用される型に変換し、それを呼び出します。その後、ライブラリメソッドの出力をC互換の型に戻す必要があります。この特定のケースでは、ライブラリがfill()メソッドによってポインタへの直接書き込みをサポートしているため、変換は不要でした。ここでの主なアドバイスは、メソッドを少なく作成することです。そうすれば、各メソッド呼び出し時の変換を減らし、オーバーヘッドが大きくならないようにします。

`#[no_mangle]`属性と`extern "C"`は、すべてのそのようなメソッドにとって必須であることに注意してください。これがないと、正しいC/C++互換のコンパイルが行えません。さらに、統合の次のステップに必要です。

シムメソッド用のコードを書いた後、ライブラリのヘッダーファイルを準備する必要があります。これは手動で行うこともできますし、cbindgenライブラリを使用して自動生成することもできます。cbindgenを使用する場合は、build.rsビルドスクリプトを書き、cbindgenをビルド依存関係として含める必要があります。

ヘッダーファイルを自動生成できるビルドスクリプトの例：

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

また、すべてのC互換属性に対して`#[no_mangle]`および`extern "C"`属性を使用する必要があります。これがないと、ライブラリが正しくコンパイルされず、cbindgenはヘッダーの自動生成を実行できません。

これらのステップをすべて完了した後、互換性やヘッダー生成に関する問題を見つけるために、小さなプロジェクトでライブラリをテストできます。ヘッダー生成中に問題が発生した場合は、cbindgen.tomlファイルで構成を試みることができます（テンプレートはこちらで見つけることができます：[https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3の統合時に発生した問題に注意する価値があります：
MemorySanitizerは、Rustの一部の変数が初期化されているかどうかを見ることができないため、誤検出を引き起こす可能性があります。これは、一部の変数に対してより明示的な定義を持つメソッドを書くことで解決されましたが、このメソッドの実装は遅く、MemorySanitizerビルドを修正するためだけに使用されます。
