---
'description': 'LoongArch64架构下从源代码构建ClickHouse的指南'
'sidebar_label': '为LoongArch64构建在Linux上'
'sidebar_position': 35
'slug': '/development/build-cross-loongarch'
'title': '使用LoongArch64架构在Linux上构建'
---




# 在 LoongArch64 上构建 Linux

ClickHouse 对 LoongArch64 有实验性支持

## 构建 ClickHouse {#build-clickhouse}

构建所需的 llvm 版本必须大于或等于 19.1.0。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成的二进制文件将仅在具有 LoongArch64 CPU 架构的 Linux 上运行。
