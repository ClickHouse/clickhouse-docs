---
'description': 'ClickHouseにRustライブラリを統合するためのガイド'
'sidebar_label': 'Rustライブラリ'
'slug': '/development/integrating_rust_libraries'
'title': 'Rustライブラリの統合'
'doc_type': 'guide'
---


# Rustライブラリ

Rustライブラリの統合は、BLAKE3ハッシュ関数の統合に基づいて説明されます。

統合の最初のステップは、ライブラリを/rustフォルダーに追加することです。これを行うには、空のRustプロジェクトを作成し、Cargo.tomlに必要なライブラリを含める必要があります。また、Cargo.tomlに`crate-type = ["staticlib"]`を追加して、新しいライブラリのコンパイルを静的に設定することも必要です。

次に、Corrosionライブラリを使用してCMakeにライブラリをリンクする必要があります。最初のステップは、/rustフォルダー内のCMakeLists.txtにライブラリフォルダーを追加することです。その後、ライブラリディレクトリにCMakeLists.txtファイルを追加する必要があります。その中で、Corrosionのインポート関数を呼び出す必要があります。BLAKE3をインポートするために使用された行は以下の通りです：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

このようにして、Corrosionを使用して正しいCMakeターゲットを作成し、次にそれにより便利な名前を付けます。名前`_ch_rust_blake3`はCargo.tomlから来ており、プロジェクト名として使われています（`name = "_ch_rust_blake3"`）。

Rustのデータ型はC/C++のデータ型と互換性がないため、空のライブラリプロジェクトを使用してC/C++から受け取ったデータを変換するためのシムメソッドを作成し、ライブラリメソッドを呼び出し、出力データの逆変換を行います。たとえば、このメソッドはBLAKE3のために書かれました：

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

このメソッドは、C互換の文字列、そのサイズ、および出力文字列ポインタを入力として取得します。それから、C互換の入力を実際のライブラリメソッドで使用される型に変換し、それらを呼び出します。その後、ライブラリメソッドの出力をC互換の型に戻す必要があります。この特定のケースでは、ライブラリはfill()メソッドを介してポインタへの直接書き込みをサポートしていたため、変換は必要ありませんでした。ここでの主なアドバイスは、メソッドを少なくすることで、毎回のメソッド呼び出し時の変換を減らし、あまりオーバーヘッドを生み出さないようにすることです。

`#[no_mangle]`属性と`extern "C"`は、すべてのそのようなメソッドに対して必須であることに注意が必要です。これらなしでは、正しいC/C++互換のコンパイルを行うことはできません。さらに、これらは統合の次のステップに必要です。

シムメソッドのコードを書いた後は、ライブラリのヘッダーファイルを準備する必要があります。これは手動で行うこともできますが、cbindgenライブラリを使用して自動生成することもできます。cbindgenを使用する場合は、build.rsビルドスクリプトを書き、cbindgenをビルド依存関係として含める必要があります。

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

また、すべてのC互換属性に対して属性`#[no_mangle]`と`extern "C"`を使用する必要があります。これがないとライブラリは正しくコンパイルされず、cbindgenはヘッダーの自動生成を開始できません。

これらすべてのステップを終えた後、互換性やヘッダー生成に関する問題を見つけるために、小さなプロジェクトでライブラリをテストできます。ヘッダージェネレーション中に問題が発生した場合は、cbindgen.tomlファイルで設定を試みることができます（こちらにテンプレートがあります: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

BLAKE3の統合時に発生した問題についても触れておく必要があります：
MemorySanitizerは、Rustの一部の変数が初期化されているかどうかを確認できないため、誤検知を引き起こす可能性があります。これを解決するために、一部の変数に対してより明示的な定義を持つメソッドを記述しましたが、このメソッドの実装は遅く、MemorySanitizerビルドを修正するためにのみ使用されます。
