---
description: 'Руководство по сборке ClickHouse из исходных кодов для архитектуры RISC-V 64'
sidebar_label: 'Сборка на Linux для RISC-V 64'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'Как собрать ClickHouse на Linux для RISC-V 64'
---


# Как собрать ClickHouse на Linux для RISC-V 64

ClickHouse имеет экспериментальную поддержку для RISC-V. Не все функции могут быть включены.

## Сборка ClickHouse {#build-clickhouse}

Чтобы кросс-компилировать для RISC-V на машине, не являющейся RISC-V:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

Полученный бинарный файл будет работать только на Linux с архитектурой CPU RISC-V 64.
