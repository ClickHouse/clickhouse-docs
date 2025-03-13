---
slug: /development/build-cross-loongarch
sidebar_position: 35
sidebar_label: 在Linux上为LoongArch64构建
---


# 在Linux上为LoongArch64构建

ClickHouse对LoongArch64提供实验性支持。

## 构建ClickHouse {#build-clickhouse}

构建所需的llvm版本必须大于或等于19.1.0。

``` bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成的二进制文件只能在使用LoongArch64 CPU架构的Linux上运行。
