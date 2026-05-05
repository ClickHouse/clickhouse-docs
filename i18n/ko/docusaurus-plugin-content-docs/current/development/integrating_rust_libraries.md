---
description: 'Rust 라이브러리를 ClickHouse에 통합하기 위한 가이드'
sidebar_label: 'Rust 라이브러리'
slug: /development/integrating_rust_libraries
title: 'Rust 라이브러리 통합'
doc_type: 'guide'
---

# Rust 라이브러리 \{#rust-libraries\}

Rust 라이브러리 통합은 BLAKE3 해시 함수 통합을 예시로 설명합니다.

통합의 첫 단계는 라이브러리를 /rust 디렉터리에 추가하는 것입니다. 이를 위해 빈 Rust 프로젝트를 생성한 뒤, 필요한 라이브러리를 Cargo.toml에 포함해야 합니다. 또한 Cargo.toml에 `crate-type = ["staticlib"]`를 추가하여 새 라이브러리가 정적 라이브러리로 컴파일되도록 구성해야 합니다.

다음으로 Corrosion 라이브러리를 사용하여 CMake에 라이브러리를 링크해야 합니다. 첫 단계는 /rust 디렉터리 내부의 CMakeLists.txt에 라이브러리 디렉터리를 추가하는 것입니다. 그다음으로 라이브러리 디렉터리에 CMakeLists.txt 파일을 추가해야 합니다. 이 파일에서 Corrosion import 함수를 호출해야 합니다. 다음 내용은 BLAKE3를 import하는 데 사용된 설정입니다:

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

따라서 Corrosion을 사용하여 적절한 CMake 타깃을 생성한 다음, 더 편리한 이름으로 이름을 변경합니다. `_ch_rust_blake3`라는 이름은 Cargo.toml에서 가져온 것으로, 해당 파일에서 프로젝트 이름으로 사용됩니다 (`name = "_ch_rust_blake3"`).

Rust 데이터 타입은 C/C++ 데이터 타입과 호환되지 않으므로, 빈 라이브러리 프로젝트를 사용하여 C/C++에서 전달받은 데이터를 변환하기 위한 shim 메서드를 만들고, 라이브러리 메서드를 호출한 뒤, 출력 데이터에 대해 역변환을 수행합니다. 예를 들어, 다음 메서드는 BLAKE3를 위해 작성되었습니다:

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

이 메서드는 C 호환 문자열과 그 크기, 그리고 출력 문자열 포인터를 입력으로 받습니다. 그런 다음 C 호환 입력값을 실제 라이브러리 메서드에서 사용하는 타입으로 변환한 뒤 해당 메서드들을 호출합니다. 이후에는 라이브러리 메서드의 출력을 다시 C 호환 타입으로 변환해야 합니다. 이 특정 경우에는 라이브러리가 `fill()` 메서드를 통해 포인터에 직접 쓰기를 지원하므로, 이러한 변환이 필요하지 않았습니다. 여기서의 핵심 조언은 메서드 수를 최소화하여 각 메서드 호출마다 필요한 변환 횟수를 줄이고 불필요한 오버헤드를 만들지 않는 것입니다.

`#[no_mangle]` 속성과 `extern "C"`는 이러한 모든 메서드에 필수라는 점에 유의해야 합니다. 이들이 없으면 C/C++와 호환되는 올바른 방식으로 컴파일할 수 없습니다. 더 나아가, 이 속성과 선언은 다음 단계의 통합 과정에서도 필요합니다.

shim 메서드에 대한 코드를 작성한 후에는 라이브러리용 헤더 파일을 준비해야 합니다. 이는 수동으로 작성해도 되고, 자동 생성을 위해 cbindgen 라이브러리를 사용할 수도 있습니다. cbindgen을 사용할 경우, `build.rs` 빌드 스크립트를 작성하고 cbindgen을 빌드 의존성(build-dependency)으로 포함해야 합니다.

헤더 파일을 자동으로 생성할 수 있는 빌드 스크립트 예시는 다음과 같습니다:

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

또한 C와 호환되는 모든 속성에 대해 #[no&#95;mangle] 속성과 `extern "C"`를 반드시 사용해야 합니다. 이를 사용하지 않으면 라이브러리가 올바르게 컴파일되지 않을 수 있으며, cbindgen이 헤더 자동 생성을 수행하지 못합니다.

이 모든 단계를 마친 후에는 작은 프로젝트에서 라이브러리를 테스트하여 호환성이나 헤더 생성과 관련된 모든 문제를 찾아볼 수 있습니다. 헤더 생성 중에 문제가 발생하면 `cbindgen.toml` 파일로 구성해 볼 수 있습니다(Template은 여기에서 확인할 수 있습니다: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)).

BLAKE3를 통합할 때 발생한 문제를 짚고 넘어갈 필요가 있습니다.
MemorySanitizer는 Rust에서 일부 변수가 초기화되었는지 여부를 확인할 수 없기 때문에 오탐지(false-positive) 보고를 일으킬 수 있습니다. 이 문제는 일부 변수에 대해 더 명시적인 정의를 사용하는 메서드를 작성하여 해결했습니다. 다만 이러한 메서드 구현은 더 느리며, MemorySanitizer 빌드 문제를 수정하는 용도로만 사용됩니다.