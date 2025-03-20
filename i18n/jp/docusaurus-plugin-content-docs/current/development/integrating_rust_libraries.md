---
slug: /development/integrating_rust_libraries
sidebar_label: Rust Libraries
---


# Rustライブラリ

Rustライブラリの統合は、BLAKE3ハッシュ関数の統合に基づいて説明されます。

統合の最初のステップは、ライブラリを/rustフォルダに追加することです。これを行うには、空のRustプロジェクトを作成し、Cargo.tomlに必要なライブラリを含める必要があります。また、Cargo.tomlに `crate-type = ["staticlib"]` を追加して、新しいライブラリコンパイルを静的に設定する必要があります。

次に、Corrosionライブラリを使用してCMakeにライブラリをリンクする必要があります。最初のステップは、/rustフォルダ内のCMakeLists.txtにライブラリフォルダを追加することです。その後、ライブラリディレクトリにCMakeLists.txtファイルを追加する必要があります。その中で、Corrosionインポート関数を呼び出す必要があります。以下の行はBLAKE3をインポートするために使用されました：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

これにより、Corrosionを使用して正しいCMakeターゲットを作成し、より便利な名前に変更します。名前 `_ch_rust_blake3` はCargo.tomlから取得され、プロジェクト名（`name = "_ch_rust_blake3"`）として使用されます。

Rustのデータ型はC/C++のデータ型と互換性がないため、空のライブラリプロジェクトを使用して、C/C++から受け取ったデータの変換、ライブラリメソッドの呼び出し、および出力データへの逆変換を行うためのシムメソッドを作成します。例えば、BLAKE3用に以下のメソッドが書かれました：

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

このメソッドは、C互換の文字列、そのサイズ、および出力文字列ポインタを入力として受け取ります。その後、C互換の入力を、実際のライブラリメソッドで使用される型に変換し、それらを呼び出します。その後、ライブラリメソッドの出力を再びC互換型に変換します。この特定の場合、ライブラリはfill()メソッドを使用してポインタに直接書き込むことをサポートしているため、変換は必要ありませんでした。ここでの主なアドバイスは、メソッド数を少なく作成することで、各メソッド呼び出し時の変換を減らし、過剰なオーバーヘッドを作成しないことです。

`#[no_mangle]`属性と`extern "C"`は、すべてのそのようなメソッドに対して必須であることに注意してください。これらがなければ、正しいC/C++互換のコンパイルを行うことはできません。さらに、これらは統合の次のステップに必要です。

シムメソッドのコードを記述した後、ライブラリのヘッダーファイルを準備する必要があります。これは手動で行うこともできますし、cbindgenライブラリを使用して自動生成することもできます。cbindgenを使用する場合は、build.rsビルドスクリプトを記述し、cbindgenをビルド依存関係として含める必要があります。

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

また、すべてのC互換の属性に対して属性#[no_mangle]と`extern "C"`を使用する必要があります。これがないと、ライブラリが正しくコンパイルされず、cbindgenがヘッダーの自動生成を起動しません。

これらすべてのステップを終えたら、ライブラリを小さなプロジェクトでテストして、互換性やヘッダー生成に関する問題を見つけることができます。ヘッダー生成中に問題が発生した場合は、cbindgen.tomlファイルを使用して設定を試みることができます（テンプレートはここで見つかります: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3を統合する際に発生した問題に言及する価値があります：
MemorySanitizerは、Rustのいくつかの変数が初期化されているかどうかを確認できないため、誤検出レポートを引き起こす可能性があります。これは、いくつかの変数のより明示的な定義を持つメソッドを書くことで解決されましたが、このメソッドの実装は遅く、MemorySanitizerビルドを修正するためのみに使用されます。
