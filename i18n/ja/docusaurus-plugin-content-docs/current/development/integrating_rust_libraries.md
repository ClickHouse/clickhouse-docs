---
slug: /development/integrating_rust_libraries
sidebar_label: Rustライブラリ
---

# Rustライブラリ

Rustライブラリの統合は、BLAKE3ハッシュ関数の統合に基づいて説明されます。

統合の最初のステップは、ライブラリを /rust フォルダーに追加することです。これを行うには、空のRustプロジェクトを作成し、Cargo.tomlに必要なライブラリを含める必要があります。また、新しいライブラリのコンパイルを静的に設定するために、Cargo.tomlに `crate-type = ["staticlib"]` を追加する必要があります。

次に、Corrosionライブラリを使用してライブラリをCMakeにリンクする必要があります。最初のステップは、/rustフォルダー内のCMakeLists.txtにライブラリフォルダーを追加することです。その後、ライブラリディレクトリにCMakeLists.txtファイルを追加する必要があります。その中で、Corrosionのインポート関数を呼び出します。以下の行はBLAKE3をインポートするために使用されました：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

このようにして、Corrosionを使用して正しいCMakeターゲットを作成し、その後、より便利な名前に変更します。名前 `_ch_rust_blake3` はCargo.tomlから来ており、そこではプロジェクト名として使用されています（`name = "_ch_rust_blake3"`）。

Rustのデータ型はC/C++のデータ型と互換性がないため、データをC/C++から受け取り、ライブラリメソッドを呼び出し、出力データの逆変換を行うためのshimメソッドを作成するために、空のライブラリプロジェクトを使用します。例えば、BLAKE3のためにこのメソッドが書かれました：

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

このメソッドはC互換の文字列、そのサイズ、および出力文字列ポインタを入力として受け取ります。次に、C互換の入力を実際のライブラリメソッドで使用されるタイプに変換し、それらを呼び出します。その後、ライブラリメソッドの出力を再びC互換のタイプに変換する必要があります。この特定のケースでは、ライブラリはfill()メソッドでポインタへの直接書き込みをサポートしていたため、変換は必要ありませんでした。ここでの主なアドバイスは、メソッドの数を少なくすることで、各メソッド呼び出し時の変換作業を減らし、過剰なオーバーヘッドを作らないようにすることです。

`#[no_mangle]` 属性と `extern "C"` はすべてのそのようなメソッドに必須であることに注意してください。これがなければ、正しいC/C++互換のコンパイルを行うことはできません。さらに、次の統合ステップに必要です。

shimメソッドのコードを書いた後、ライブラリのヘッダーファイルを準備する必要があります。これは手動で行うこともできますし、cbindgenライブラリを使用して自動生成することもできます。cbindgenを使用する場合は、build.rsビルドスクリプトを書き、cbindgenをビルド依存関係に含める必要があります。

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

また、すべてのC互換の属性に対して `#[no_mangle]` と `extern "C"` を使用する必要があります。これがなければ、ライブラリは正しくコンパイルできず、cbindgenはヘッダーの自動生成を開始できません。

これらのすべてのステップを完了した後は、小さなプロジェクトでライブラリをテストして、互換性やヘッダー生成に関する問題を見つけることができます。ヘッダー生成中に問題が発生した場合は、cbindgen.tomlファイルを使って設定を調整することができます（テンプレートはこちらで見つけることができます: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3統合時に発生した問題には注意すべきです：
MemorySanitizerは、Rustの変数が初期化されているかどうかを確認できないため、偽陽性の報告を引き起こす可能性があります。この問題は、いくつかの変数に対してより明示的な定義を持つメソッドを書いて解決されましたが、このメソッドの実装は遅く、MemorySanitizerビルドの修正のためだけに使用されます。
