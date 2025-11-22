---
description: '从源代码为 AARCH64 架构构建 ClickHouse 的指南'
sidebar_label: '在 Linux 上为 AARCH64 架构构建'
sidebar_position: 25
slug: /development/build-cross-arm
title: '如何在 Linux 上为 AARCH64 架构构建 ClickHouse'
doc_type: 'guide'
---

# 如何在 Linux 上构建适用于 AARCH64 的 ClickHouse

在 AArch64 机器上构建 AArch64 版本的 ClickHouse 无需任何特殊步骤。

要在 x86 Linux 机器上为 AArch64 交叉编译 ClickHouse，请向 `cmake` 传递以下参数：`-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`