---
slug: /development/build-cross-arm
sidebar_position: 25
sidebar_label: 在 Linux 上为 AARCH64 构建
---


# 如何在 Linux 上为 AARCH64 构建 ClickHouse

在 Aarch64 机器上构建 ClickHouse 不需要特殊步骤。

要在 x86 Linux 机器上为 AArch64 进行交叉编译，请将以下标志传递给 `cmake`：`-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
