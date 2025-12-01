---
description: '将 Rust 库集成到 ClickHouse 的指南'
sidebar_label: 'Rust 库'
slug: /development/integrating_rust_libraries
title: '集成 Rust 库'
doc_type: 'guide'
---

# Rust 库 {#rust-libraries}

Rust 库的集成将以集成 BLAKE3 哈希函数为例进行说明。

集成的第一步是将该库添加到 /rust 目录下。为此，你需要创建一个空的 Rust 项目，并在 Cargo.toml 中添加所需的库。同时还需要在 Cargo.toml 中添加 `crate-type = ["staticlib"]`，以将新库配置为编译为静态库。

接下来，你需要使用 Corrosion 库将该库链接到 CMake。首先，需要在 /rust 目录下的 CMakeLists.txt 中添加该库所在的目录。然后，你应当在该库目录下添加 CMakeLists.txt 文件，并在其中调用 Corrosion 的导入函数。以下这些代码行用于导入 BLAKE3：

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

因此，我们将使用 Corrosion 创建一个合适的 CMake 目标，然后再将其重命名为一个更便于使用的名称。请注意，名称 `_ch_rust_blake3` 来自 Cargo.toml，在其中作为项目名称使用（`name = "_ch_rust_blake3"`）。

由于 Rust 数据类型与 C/C++ 的数据类型不兼容，我们将利用这个空的库项目来创建用于转换的 shim（垫片）方法：将从 C/C++ 接收的数据进行转换、调用库方法，以及对输出数据进行反向转换。例如，我们为 BLAKE3 编写了如下方法：

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

该方法接收 C 兼容的字符串、其大小以及输出字符串指针作为输入。随后，它将这些 C 兼容的输入转换为实际库方法所使用的类型并调用这些方法。之后，它应当把库方法的输出再转换回 C 兼容的类型。在这个特定场景下，库中的 `fill()` 方法支持直接向指针写入，因此不需要进行转换。这里的主要建议是尽量减少此类方法的数量，这样每次方法调用所需的类型转换就会更少，从而避免引入过多额外开销。

需要注意的是，`#[no_mangle]` 属性和 `extern "C"` 对于所有此类方法都是必需的。没有它们，就无法进行正确的、兼容 C/C++ 的编译。此外，它们也是完成下一步集成所必需的。

在为这些 shim 方法编写代码之后，我们需要为该库准备头文件。可以手动完成，也可以使用 cbindgen 库自动生成。如果使用 cbindgen，则需要编写一个 build.rs 构建脚本，并将 cbindgen 作为构建依赖引入。

下面是一个可以自动生成头文件的构建脚本示例：

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

此外，对于每个与 C 兼容的项，你都应使用属性 #[no&#95;mangle] 和 `extern "C"`。否则库可能会被错误地编译，并且 cbindgen 将无法进行头文件的自动生成。

在完成以上所有步骤之后，可以在一个小型项目中测试该库，以发现所有与兼容性或头文件生成相关的问题。若在头文件生成过程中出现任何问题，可以尝试通过 `cbindgen.toml` 文件进行配置（可以在此处找到一个模板：[https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)）。

值得一提的是在集成 BLAKE3 时出现的一个问题：
由于 MemorySanitizer 无法判断某些 Rust 变量是否已初始化，它可能会产生误报。为了解决这一问题，我们编写了一个对部分变量进行更显式处理的方法，尽管这种方法的实现较慢，并且仅用于修复 MemorySanitizer 构建。