---
description: 'LoongArch64 アーキテクチャ向けに ClickHouse をソースコードからビルドするためのガイド'
sidebar_label: 'LoongArch64 向け Linux 上でのビルド'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'LoongArch64 向け Linux 上でのビルド'
doc_type: 'guide'
---

# Linux 上での LoongArch64 向けビルド {#build-on-linux-for-loongarch64}

ClickHouse は LoongArch64 を実験的にサポートしています

## ClickHouse をビルドする {#build-clickhouse}

ビルドに必要な LLVM のバージョンは 19.1.0 以上である必要があります。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されるバイナリは、LoongArch64 CPU アーキテクチャの Linux 環境でのみ実行できます。
