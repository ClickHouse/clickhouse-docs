---
slug: /development/build-cross-riscv
sidebar_position: 30
sidebar_label: RISC-V 64のLinux上でのビルド
---

# RISC-V 64用のLinux上でClickHouseをビルドする方法

ClickHouseはRISC-Vの実験的なサポートを提供しています。すべての機能を有効にすることはできません。

## ClickHouseをビルドする {#build-clickhouse}

RISC-Vでクロスコンパイルするために、非RISC-Vマシンで以下の手順を実行します：

``` bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは、RISC-V 64 CPUアーキテクチャを搭載したLinux上でのみ実行されます。
