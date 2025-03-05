---
slug: /development/build-cross-riscv
sidebar_position: 30
sidebar_label: RISC-V 64 用の Linux でのビルド
---


# RISC-V 64 用の Linux で ClickHouse をビルドする方法

ClickHouse は RISC-V に対する実験的なサポートを提供しています。すべての機能が有効にできるわけではありません。

## ClickHouse をビルドする {#build-clickhouse}

非 RISC-V マシン上で RISC-V 用にクロスコンパイルするには:

``` bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは、RISC-V 64 CPU アーキテクチャを持つ Linux 上でのみ実行されます。
