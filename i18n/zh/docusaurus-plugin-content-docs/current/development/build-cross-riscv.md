---
'description': '为RISC-V 64架构从源代码构建ClickHouse的指南'
'sidebar_label': '在Linux上为RISC-V 64构建'
'sidebar_position': 30
'slug': '/development/build-cross-riscv'
'title': '如何在Linux上为RISC-V 64构建ClickHouse'
---


# 如何在Linux上为RISC-V 64构建ClickHouse

ClickHouse对RISC-V提供了实验性支持。并非所有功能都可以启用。

## 构建ClickHouse {#build-clickhouse}

在非RISC-V机器上进行RISC-V的交叉编译：

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成的二进制文件将仅在具有RISC-V 64 CPU架构的Linux上运行。
