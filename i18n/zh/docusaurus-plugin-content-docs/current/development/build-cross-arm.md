---
'description': '为 AARCH64 架构从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 Linux 上为 AARCH64 构建'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': '如何在 Linux 上为 AARCH64 构建 ClickHouse'
'doc_type': 'guide'
---


# 如何在Linux上为AARCH64构建ClickHouse

在Aarch64机器上构建ClickHouse不需要特别的步骤。

要在x86 Linux机器上为AArch64进行交叉编译ClickHouse，请将以下标志传递给 `cmake`： `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
