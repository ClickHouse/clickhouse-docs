---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры LoongArch64'
sidebar_label: 'Сборка на Linux для LoongArch64'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'Сборка на Linux для LoongArch64'
---


# Сборка на Linux для LoongArch64

ClickHouse имеет экспериментальную поддержку LoongArch64

## Сборка ClickHouse {#build-clickhouse}

Версия llvm, необходимая для сборки, должна быть не менее 19.1.0.

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

Полученный бинарный файл будет работать только на Linux с архитектурой процессора LoongArch64.
