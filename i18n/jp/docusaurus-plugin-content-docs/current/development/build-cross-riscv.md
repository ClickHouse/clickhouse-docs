---
description: 'RISC-V 64 アーキテクチャ向けに ClickHouse をソースコードからビルドするためのガイド'
sidebar_label: 'RISC-V 64 向け Linux でのビルド'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'Linux 上で RISC-V 64 向けに ClickHouse をビルドする方法'
doc_type: 'guide'
---

# Linux 上で RISC-V 64 向けに ClickHouse をビルドする方法 \\{#how-to-build-clickhouse-on-linux-for-risc-v-64\\}

ClickHouse は RISC-V を実験的にサポートしています。すべての機能を有効にできるわけではありません。

## ClickHouse をビルドする \\{#build-clickhouse\\}

RISC-V ではないマシン上で RISC-V 向けにクロスコンパイルするには:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは、RISC-V 64ビット CPU アーキテクチャの Linux 上でのみ実行可能です。
