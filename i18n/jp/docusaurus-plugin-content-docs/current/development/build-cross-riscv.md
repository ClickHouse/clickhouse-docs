---
description: 'RISC-V 64 アーキテクチャ用に ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'RISC-V 64 用に Linux でビルド'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'RISC-V 64 用に Linux で ClickHouse をビルドする方法'
---


# RISC-V 64 用に Linux で ClickHouse をビルドする方法

ClickHouse は RISC-V の実験的サポートを提供しています。すべての機能が有効にできるわけではありません。

## ClickHouse のビルド {#build-clickhouse}

非 RISC-V マシンで RISC-V 用にクロスコンパイルするには:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは RISC-V 64 CPU アーキテクチャを持つ Linux でのみ実行されます。
