---
'description': 'RISC-V 64 아키텍처를 위한 소스에서 ClickHouse를 빌드하기 위한 가이드'
'sidebar_label': 'RISC-V 64에 대한 Linux에서 빌드'
'sidebar_position': 30
'slug': '/development/build-cross-riscv'
'title': 'RISC-V 64 아키텍처에 대한 Linux에서 ClickHouse 빌드하는 방법'
'doc_type': 'guide'
---


# How to Build ClickHouse on Linux for RISC-V 64

ClickHouse는 RISC-V에 대한 실험적 지원을 제공합니다. 모든 기능을 활성화할 수는 없습니다.

## Build ClickHouse {#build-clickhouse}

비-RISC-V 머신에서 RISC-V용으로 크로스 컴파일하려면:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

결과 바이너리는 RISC-V 64 CPU 아키텍처가 있는 Linux에서만 실행됩니다.
