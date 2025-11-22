---
description: 'RISC-V 64 アーキテクチャ向け ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'Linux での RISC-V 64 向けビルド'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'Linux で RISC-V 64 向け ClickHouse をビルドする方法'
doc_type: 'guide'
---



# Linux 上で RISC-V 64 向け ClickHouse をビルドする方法

ClickHouse は RISC-V を実験的にサポートしています。すべての機能を有効にできるわけではありません。



## ClickHouseのビルド {#build-clickhouse}

RISC-V以外のマシンでRISC-V向けにクロスコンパイルする場合:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されるバイナリは、RISC-V 64 CPUアーキテクチャを搭載したLinux上でのみ実行できます。
