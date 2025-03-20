---
slug: /development/build-cross-loongarch
sidebar_position: 35
sidebar_label: Linux上でのLoongArch64向けビルド
---


# Linux上でのLoongArch64向けビルド

ClickHouseはLoongArch64に対して実験的なサポートを提供しています。

## ClickHouseのビルド {#build-clickhouse}

ビルドに必要なllvmのバージョンは19.1.0以上である必要があります。

``` bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されたバイナリは、LoongArch64 CPUアーキテクチャを持つLinux上でのみ実行されます。
