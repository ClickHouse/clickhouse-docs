---
'description': 'Guide for building ClickHouse from source for the RISC-V 64 architecture'
'sidebar_label': 'Build on Linux for RISC-V 64'
'sidebar_position': 30
'slug': '/development/build-cross-riscv'
'title': 'How to Build ClickHouse on Linux for RISC-V 64'
---




# RISC-V 64用のLinuxでのClickHouseのビルド方法

ClickHouseはRISC-Vの実験的サポートを提供しています。すべての機能を有効にできるわけではありません。

## ClickHouseのビルド {#build-clickhouse}

非RISC-VマシンでRISC-V向けにクロスコンパイルするには：

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは、RISC-V 64 CPUアーキテクチャを持つLinuxでのみ実行されます。
