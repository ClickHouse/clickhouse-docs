---
'description': 'ClickHouse에 Rust 라이브러리 통합에 대한 가이드'
'sidebar_label': 'Rust 라이브러리'
'slug': '/development/integrating_rust_libraries'
'title': 'Rust 라이브러리 통합'
'doc_type': 'guide'
---


# Rust 라이브러리

Rust 라이브러리 통합은 BLAKE3 해시 함수 통합을 기반으로 설명됩니다.

통합의 첫 번째 단계는 라이브러리를 /rust 폴더에 추가하는 것입니다. 이를 위해 빈 Rust 프로젝트를 생성하고 요구되는 라이브러리를 Cargo.toml에 포함해야 합니다. Cargo.toml에 `crate-type = ["staticlib"]`를 추가하여 새로운 라이브러리 컴파일을 정적(static)으로 구성하는 것도 필요합니다.

다음 단계는 Corrosion 라이브러리를 사용하여 CMake에 라이브러리를 링크하는 것입니다. 첫 번째 단계는 /rust 폴더 내의 CMakeLists.txt에 라이브러리 폴더를 추가하는 것입니다. 그 후, 라이브러리 디렉토리에 CMakeLists.txt 파일을 추가해야 합니다. 여기에서 Corrosion 가져오기 함수를 호출해야 합니다. 다음은 BLAKE3를 가져오기 위해 사용된 코드입니다:

```CMake
corrosion_import_crate(MANIFEST_PATH Cargo.toml NO_STD)

target_include_directories(_ch_rust_blake3 INTERFACE include)
add_library(ch_rust::blake3 ALIAS _ch_rust_blake3)
```

따라서, 우리는 Corrosion을 사용하여 올바른 CMake 타겟을 생성하고, 이를 더 편리한 이름으로 변경할 것입니다. 이름 `_ch_rust_blake3`는 Cargo.toml에서 프로젝트 이름으로 사용되며 (`name = "_ch_rust_blake3"`), 여기서 유래합니다.

Rust 데이터 타입은 C/C++ 데이터 타입과 호환되지 않기 때문에, 우리는 빈 라이브러리 프로젝트를 사용하여 C/C++에서 받은 데이터 변환을 위한 shim 메서드를 작성하고, 라이브러리 메서드를 호출하고, 출력 데이터에 대한 역변환을 수행할 것입니다. 예를 들어, BLAKE3에 대해 이 메서드가 작성되었습니다:

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

이 메서드는 C 호환 문자열, 크기 및 출력 문자열 포인터를 입력으로 받습니다. 그런 다음, C 호환 입력을 실제 라이브러리 메서드에서 사용하는 타입으로 변환하고 이를 호출합니다. 그 후, 라이브러리 메서드의 출력을 다시 C 호환 타입으로 변환해야 합니다. 특정 경우에 라이브러리는 fill() 메서드를 통해 포인터에 직접 쓰는 것을 지원하므로 변환이 필요하지 않았습니다. 여기서의 주요 조언은 메서드를 적게 생성하여 각 메서드 호출 시 적은 변환을 수행하고 과부하를 최소화하는 것입니다.

모든 이러한 메서드에 대해 `#[no_mangle]` 속성과 `extern "C"`가 필수적이라는 점은 주목할 가치가 있습니다. 이를 생략하면 올바른 C/C++ 호환 컴파일을 수행할 수 없습니다. 또한, 다음 단계의 통합 작업에도 필요합니다.

shim 메서드의 코드를 작성한 후에는 라이브러리를 위한 헤더 파일을 준비해야 합니다. 이 작업은 수동으로 수행할 수 있지만, cbindgen 라이브러리를 사용하여 자동 생성할 수도 있습니다. cbindgen을 사용할 경우, build.rs 빌드 스크립트를 작성하고 cbindgen을 빌드 종속성으로 포함해야 합니다.

헤더 파일을 자동 생성할 수 있는 빌드 스크립트의 예는 다음과 같습니다:

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

또한, 각 C 호환 속성에 대해 #[no_mangle]과 `extern "C"`를 사용해야 합니다. 이를 생략할 경우 라이브러리가 잘못 컴파일될 수 있으며 cbindgen이 헤더 자동 생성을 실행하지 않을 것입니다.

이 모든 단계를 마친 후에는 소규모 프로젝트에서 라이브러리를 테스트하여 호환성이나 헤더 생성과 관련된 모든 문제를 찾아야 합니다. 헤더 생성 중 문제가 발생하는 경우 cbindgen.toml 파일로 구성해 볼 수 있습니다 (템플릿은 여기에서 찾을 수 있습니다: [https://github.com/eqrion/cbindgen/blob/master/template.toml](https://github.com/eqrion/cbindgen/blob/master/template.toml)).

BLAKE3 통합 시 발생한 문제도 주목할 가치가 있습니다:
MemorySanitizer는 Rust의 일부 변수가 초기화되었는지를 확인할 수 없기 때문에 오탐지를 유발할 수 있습니다. 이는 일부 변수에 대해 더 명시적인 정의가 포함된 메서드를 작성하여 해결했지만, 이 메서드 구현은 느리며 MemorySanitizer 빌드를 수정하기 위해서만 사용됩니다.
