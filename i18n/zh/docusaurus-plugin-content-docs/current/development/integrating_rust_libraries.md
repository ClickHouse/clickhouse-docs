---
slug: /development/integrating_rust_libraries
sidebar_label: 'Rust Libraries'
---


# Rust Libraries

Rust库集成将基于BLAKE3哈希函数集成进行描述。

集成的第一步是将库添加到/rust文件夹。为此，您需要创建一个空的Rust项目，并在Cargo.toml中包含所需的库。还需要通过在Cargo.toml中添加 `crate-type = ["staticlib"]` 来将新库的编译配置为静态链接。

接下来，您需要使用Corrosion库将库链接到CMake。第一步是在/rust文件夹中的CMakeLists.txt中添加库文件夹。之后，您应该将CMakeLists.txt文件添加到库目录中。在其中，您需要调用Corrosion导入函数。这些行用于导入BLAKE3：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

因此，我们将使用Corrosion创建一个正确的CMake目标，然后以更方便的名称重命名它。请注意，名称 `_ch_rust_blake3` 来自Cargo.toml，在该文件中它被用作项目名称 (`name = "_ch_rust_blake3"`)。

由于Rust数据类型与C/C++数据类型不兼容，我们将使用我们的空库项目为从C/C++接收的数据创建转换方法、调用库方法以及输出数据的逆转换。例如，这个方法是为BLAKE3编写的：

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

这个方法接受C兼容字符串、其大小和输出字符串指针作为输入。然后，它将C兼容输入转换为实际库方法使用的类型，并调用它们。之后，它应该将库方法的输出转换回C兼容类型。在这种特定情况下，库支持通过fill()方法直接写入指针，因此不需要进行转换。这里的主要建议是创建尽可能少的方法，这样您在每次方法调用时需要进行的转换就会更少，从而不会产生太多开销。

值得注意的是，`#[no_mangle]`属性和 `extern "C"` 对所有此类方法都是强制性的。没有它们，无法进行正确的C/C++兼容编译。此外，它们对于集成的下一步是必需的。

在编写完转换方法的代码后，我们需要为库准备头文件。这个过程可以手动完成，也可以使用cbindgen库进行自动生成。如果使用cbindgen，您需要编写一个build.rs构建脚本，并将cbindgen作为构建依赖项包含在内。

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

此外，您应该为每个C兼容属性使用属性 #[no_mangle] 和 `extern "C"`。没有它，库可能会编译不正确，cbindgen也不会启动头文件的自动生成。

经过所有这些步骤后，您可以在一个小项目中测试您的库，以找出与兼容性或头文件生成相关的所有问题。如果在头文件生成过程中出现任何问题，您可以尝试使用cbindgen.toml文件进行配置（可以在这里找到模板：[https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

值得注意的是，在集成BLAKE3时发生的问题：
MemorySanitizer可能会导致假阳性报告，因为它无法判断Rust中某些变量是否已初始化。这个问题通过为某些变量编写具有更明确的定义的方法解决，尽管这种实现的速度更慢，仅用于修复MemorySanitizer构建。
