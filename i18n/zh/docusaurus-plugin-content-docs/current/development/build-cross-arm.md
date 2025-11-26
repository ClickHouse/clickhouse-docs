---
description: '在 AARCH64 架构上从源码构建 ClickHouse 的指南'
sidebar_label: '在 Linux 上面向 AARCH64 构建'
sidebar_position: 25
slug: /development/build-cross-arm
title: '如何在 Linux 上面向 AARCH64 构建 ClickHouse'
doc_type: 'guide'
---

# 如何在 Linux 上为 AArch64 构建 ClickHouse

在 AArch64 机器上构建面向 AArch64 的 ClickHouse 时，无需执行任何特殊步骤。

要在 x86 Linux 机器上为 AArch64 交叉编译 ClickHouse，请向 `cmake` 传递以下参数：`-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`