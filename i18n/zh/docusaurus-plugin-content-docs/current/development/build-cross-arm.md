---
'description': '构建指南，用于在 AARCH64 架构上从源代码构建 ClickHouse'
'sidebar_label': '在 AARCH64 架构的 Linux 上构建'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': '如何在 AARCH64 架构上的 Linux 上构建 ClickHouse'
---




# 如何在Linux上为AARCH64构建ClickHouse

在Aarch64机器上构建ClickHouse不需要特殊步骤。

要在x86 Linux机器上交叉编译ClickHouse为AArch64，请将以下标志传递给 `cmake`： `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
