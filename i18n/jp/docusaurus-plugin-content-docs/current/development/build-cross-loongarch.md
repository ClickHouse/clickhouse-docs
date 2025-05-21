---
description: 'LoongArch64アーキテクチャ向けのソースからClickHouseをビルドするためのガイド'
sidebar_label: 'LoongArch64向けにLinuxでビルド'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'LoongArch64向けにLinuxでビルド'
---


# LoongArch64向けにLinuxでビルド

ClickHouseはLoongArch64の実験的サポートを提供しています。

## ClickHouseをビルドする {#build-clickhouse}

ビルドに必要なllvmのバージョンは19.1.0以上である必要があります。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されたバイナリはLoongArch64 CPU アーキテクチャを搭載したLinuxでのみ実行されます。
