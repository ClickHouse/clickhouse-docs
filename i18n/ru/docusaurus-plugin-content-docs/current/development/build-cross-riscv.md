---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры RISC-V 64'
sidebar_label: 'Сборка на Linux для RISC-V 64'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'Как собрать ClickHouse на Linux для RISC-V 64'
doc_type: 'guide'
---



# Как собрать ClickHouse на Linux для RISC-V 64

В ClickHouse есть экспериментальная поддержка архитектуры RISC-V. Доступны не все возможности.



## Сборка ClickHouse

Для кросс-компиляции под RISC-V на машине, не основанной на RISC-V:

```bash
cd ClickHouse
mkdir build-riscv64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

Полученный бинарный файл будет работать только в операционной системе Linux на архитектуре RISC-V 64.
