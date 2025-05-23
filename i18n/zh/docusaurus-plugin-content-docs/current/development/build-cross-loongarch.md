---
'description': '为 LoongArch64 架构从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 Linux 上为 LoongArch64 构建'
'sidebar_position': 35
'slug': '/development/build-cross-loongarch'
'title': '在 Linux 上为 LoongArch64 构建'
---


# 在 LoongArch64 上构建

ClickHouse 对 LoongArch64 提供实验性支持

## 构建 ClickHouse {#build-clickhouse}

构建所需的 llvm 版本必须大于或等于 19.1.0。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成的二进制文件仅在具有 LoongArch64 CPU 架构的 Linux 上运行。
