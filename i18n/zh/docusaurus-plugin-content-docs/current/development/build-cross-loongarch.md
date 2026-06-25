---
description: '在 LoongArch64 架构上从源码构建 ClickHouse 的指南'
sidebar_label: '在 Linux 上为 LoongArch64 构建'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: '在 Linux 上为 LoongArch64 构建'
doc_type: 'guide'
---

ClickHouse 已对 LoongArch64 提供 Experimental 支持

## 构建 ClickHouse \{#build-clickhouse\}

用于构建的 LLVM 版本必须不低于 21.1.0。

```bash
cd ClickHouse
mkdir build-loongarch64
cmake . -Bbuild-loongarch64 -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成的二进制文件只能在采用 LoongArch64 CPU 架构的 Linux 上运行。
