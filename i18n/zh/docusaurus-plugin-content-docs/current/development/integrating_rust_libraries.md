---
'description': 'Guide for integrating Rust libraries into ClickHouse'
'sidebar_label': 'Rust Libraries'
'slug': '/development/integrating_rust_libraries'
'title': 'Integrating Rust Libraries'
---




# Rust 库

Rust 库的集成将基于 BLAKE3 哈希函数集成进行描述。

集成的第一步是将库添加到 /rust 文件夹。为此，您需要创建一个空的 Rust 项目，并在 Cargo.toml 中包含所需的库。还需要通过在 Cargo.toml 中添加 `crate-type = ["staticlib"]` 来将新库编译配置为静态库。

接下来，您需要使用 Corrosion 库将库链接到 CMake。第一步是在 /rust 文件夹中的 CMakeLists.txt 中添加库文件夹。之后，您应该将 CMakeLists.txt 文件添加到库目录。在其中，您需要调用 Corrosion 导入函数。这些行被用于导入 BLAKE3：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

因此，我们将使用 Corrosion 创建一个正确的 CMake 目标，然后使用更方便的名称重命名它。请注意，名称 `_ch_rust_blake3` 来源于 Cargo.toml，在那里它被用作项目名称（`name = "_ch_rust_blake3"`）。

由于 Rust 数据类型与 C/C++ 数据类型不兼容，我们将使用我们的空库项目为从 C/C++ 接收的数据创建转换的方法，调用库方法，并对输出数据进行逆转换。例如，为 BLAKE3 编写了这个方法：

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

该方法以 C 兼容的字符串、其大小和输出字符串指针作为输入。然后，它将 C 兼容的输入转换为实际库方法所使用的类型并调用它们。之后，它应将库方法的输出转换回 C 兼容类型。在这个特定情况下，库支持通过方法 fill() 直接写入指针，因此不需要转换。这里的主要建议是创建更少的方法，这样您在每次调用方法时需要进行的转换就会更少，而不会导致过多的开销。

值得注意的是，所有这些方法都必须使用 `#[no_mangle]` 属性和 `extern "C"`。没有它们，就无法进行正确的 C/C++ 兼容编译。此外，它们对于集成的下一步是必需的。

在编写完 shim 方法的代码后，我们需要为库准备头文件。这可以手动完成，或者您可以使用 cbindgen 库进行自动生成。在使用 cbindgen 的情况下，您需要编写一个 build.rs 构建脚本，并将 cbindgen 包含为构建依赖项。

一个可以自动生成头文件的构建脚本示例：

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

此外，您应该为每个 C 兼容属性使用 `#[no_mangle]` 和 `extern "C"`。没有它，库可能会编译不正确，cbindgen 也无法启动头文件的自动生成。

经过所有这些步骤，您可以在一个小项目中测试您的库，以查找与兼容性或头文件生成相关的所有问题。如果在头文件生成期间发生任何问题，您可以尝试使用 cbindgen.toml 文件进行配置（您可以在这里找到模板：[https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

值得注意的是，在集成 BLAKE3 时出现了一个问题：
MemorySanitizer 可能会导致误报，因为它无法看到 Rust 中某些变量是否已初始化。通过为某些变量编写一种更显式定义的方法来解决这个问题，尽管这种方法的实现较慢，仅用于修复 MemorySanitizer 构建。
