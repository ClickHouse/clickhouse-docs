---
'description': 'RISC-V 64アーキテクチャ向けにソースからClickHouseをビルドするためのガイド'
'sidebar_label': 'RISC-V 64向けのLinux上での構築'
'sidebar_position': 30
'slug': '/development/build-cross-riscv'
'title': 'RISC-V 64向けのLinux上でのClickHouseの構築方法'
'doc_type': 'guide'
---


# How to Build ClickHouse on Linux for RISC-V 64

ClickHouseにはRISC-Vに対する実験的なサポートがあります。すべての機能が有効にできるわけではありません。

## Build ClickHouse {#build-clickhouse}

非RISC-VマシンでRISC-V用にクロスコンパイルするには：

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成されたバイナリは、RISC-V 64 CPUアーキテクチャを持つLinux上でのみ実行されます。
