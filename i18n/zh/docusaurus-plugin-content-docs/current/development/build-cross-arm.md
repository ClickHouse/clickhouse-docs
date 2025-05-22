---
'description': '为AARCH64架构从源代码构建ClickHouse的指南'
'sidebar_label': '在Linux上为AARCH64构建'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': '如何在Linux上为AARCH64构建ClickHouse'
---


# 如何在 Linux 上为 AARCH64 构建 ClickHouse

在 Aarch64 机器上构建 ClickHouse 不需要特殊步骤。

要在 x86 Linux 机器上交叉编译 ClickHouse 为 AArch64，请将以下标志传递给 `cmake`： `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
