---
description: 'LoongArch64アーキテクチャ向けにソースからClickHouseをビルドするためのガイド'
sidebar_label: 'LoongArch64向けLinuxでのビルド'
sidebar_position: 35
slug: '/development/build-cross-loongarch'
title: 'LoongArch64向けLinuxでのビルド'
---




# LinuxでのLoongArch64用ビルド

ClickHouseはLoongArch64に対して実験的なサポートを提供しています。

## ClickHouseをビルドする {#build-clickhouse}

ビルドに必要なllvmのバージョンは19.1.0以上である必要があります。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されたバイナリは、LoongArch64 CPUアーキテクチャを搭載したLinuxでのみ実行されます。
