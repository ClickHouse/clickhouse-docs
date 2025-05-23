---
'description': '将 Rust 库集成到 ClickHouse 的指南'
'sidebar_label': 'Rust 库'
'slug': '/development/integrating_rust_libraries'
'title': '集成 Rust 库'
---


# Rust 库

Rust 库集成将基于 BLAKE3 哈希函数的集成进行描述。

集成的第一步是将库添加到 /rust 文件夹。为此，您需要创建一个空的 Rust 项目，并在 Cargo.toml 中包含所需的库。还需要通过在 Cargo.toml 中添加 `crate-type = ["staticlib"]` 来将新库的编译配置为静态。

接下来，您需要使用 Corrosion 库将库链接到 CMake。第一步是在 /rust 文件夹内的 CMakeLists.txt 中添加库文件夹。之后，您应该将 CMakeLists.txt 文件添加到库目录。在其中，您需要调用 Corrosion 导入函数。这些行用于导入 BLAKE3：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

因此，我们将使用 Corrosion 创建一个正确的 CMake 目标，然后用一个更方便的名称重命名它。请注意，名称 `_ch_rust_blake3` 来自 Cargo.toml，其中被用作项目名称（`name = "_ch_rust_blake3"`）。

由于 Rust 数据类型与 C/C++ 数据类型不兼容，我们将使用我们的空库项目创建用于转换从 C/C++ 接收到的数据的 shim 方法，调用库方法，以及输出数据的逆转换。例如，针对 BLAKE3 编写了这个方法：

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

该方法获取 C 兼容的字符串、其大小和输出字符串指针作为输入。然后，它将 C 兼容的输入转换为实际库方法使用的类型并调用它们。之后，它应将库方法的输出转换回 C 兼容类型。在该特定情况下，库支持通过方法 fill() 直接写入指针，因此不需要转换。这里的主要建议是创建尽可能少的方法，这样您在每次方法调用时需要进行更少的转换，并且不会产生太多开销。

值得注意的是，`#[no_mangle]` 属性和 `extern "C"` 对于所有此类方法都是强制性的。没有它们，将无法进行正确的 C/C++ 兼容编译。此外，它们对于集成的下一步也是必要的。

在编写 shim 方法的代码后，我们需要为库准备头文件。这可以手动完成，或者可以使用 cbindgen 库进行自动生成。如果使用 cbindgen，您需要编写一个 build.rs 构建脚本并将 cbindgen 作为构建依赖项。

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

此外，您应该对每个 C 兼容的属性使用属性 #[no_mangle] 和 `extern "C"`。没有这些，库可能会错误编译，并且 cbindgen 将无法启动头文件的自动生成。

在完成所有这些步骤后，您可以在一个小项目中测试您的库，以发现与兼容性或头文件生成相关的所有问题。如果在头文件生成过程中出现任何问题，您可以尝试使用 cbindgen.toml 文件进行配置（您可以在这里找到模板：[https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

值得注意的是，在集成 BLAKE3 时出现的问题：MemorySanitizer 可能会导致误报，因为它无法判断 Rust 中的一些变量是否已初始化。通过为某些变量编写更明确的定义方法解决了这个问题，尽管这种实现方法较慢，并且仅用于修复 MemorySanitizer 构建。
