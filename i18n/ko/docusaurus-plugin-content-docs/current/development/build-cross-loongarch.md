---
'description': 'LoongArch64 아키텍처용으로 소스에서 ClickHouse를 빌드하는 가이드'
'sidebar_label': 'Linux에서 LoongArch64용 빌드하기'
'sidebar_position': 35
'slug': '/development/build-cross-loongarch'
'title': 'Linux에서 LoongArch64용 빌드하기'
'doc_type': 'guide'
---


# Linux에서 LoongArch64용 빌드

ClickHouse는 LoongArch64에 대한 실험적 지원을 제공합니다.

## ClickHouse 빌드 {#build-clickhouse}

빌드를 위해 필요한 llvm 버전은 19.1.0 이상이어야 합니다.

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

생성된 바이너리는 LoongArch64 CPU 아키텍처를 사용하는 Linux에서만 실행됩니다.
