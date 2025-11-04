---
slug: '/development/build-cross-riscv'
sidebar_label: 'Сборка на Linux для RISC-V 64'
sidebar_position: 30
description: 'Руководство по сборке ClickHouse из исходного кода, ориентированное'
title: 'Как собрать ClickHouse на Linux для RISC-V 64'
doc_type: guide
---
# Как собрать ClickHouse на Linux для RISC-V 64

ClickHouse имеет экспериментальную поддержку RISC-V. Не все функции могут быть включены.

## Сборка ClickHouse {#build-clickhouse}

Чтобы скомпилировать ClickHouse для RISC-V на не-RISC-V машине:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

Получившийся бинарный файл будет работать только на Linux с архитектурой процессора RISC-V 64.