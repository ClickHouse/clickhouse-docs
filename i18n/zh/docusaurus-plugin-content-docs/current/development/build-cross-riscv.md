---
'description': '用于在 RISC-V 64 架构上从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 Linux 上为 RISC-V 64 构建'
'sidebar_position': 30
'slug': '/development/build-cross-riscv'
'title': '如何在 Linux 上为 RISC-V 64 构建 ClickHouse'
---




# 如何在 Linux 上为 RISC-V 64 构建 ClickHouse

ClickHouse 为 RISC-V 提供了实验性支持。并非所有功能都可以启用。

## 构建 ClickHouse {#build-clickhouse}

要在非 RISC-V 机器上交叉编译 RISC-V：

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

生成的二进制文件将仅在具有 RISC-V 64 CPU 架构的 Linux 上运行。
