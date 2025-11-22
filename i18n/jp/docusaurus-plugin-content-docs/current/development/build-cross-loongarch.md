---
description: 'LoongArch64 アーキテクチャ向けに ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'Linux での LoongArch64 向けビルド'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'Linux での LoongArch64 向けビルド'
doc_type: 'guide'
---



# Linux 上での LoongArch64 向けビルド

ClickHouse は LoongArch64 を実験的にサポートしています。



## ClickHouseのビルド {#build-clickhouse}

ビルドに必要なLLVMのバージョンは19.1.0以上である必要があります。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されるバイナリは、LoongArch64 CPUアーキテクチャを搭載したLinux上でのみ実行できます。
