---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры LoongArch64'
sidebar_label: 'Сборка на Linux для LoongArch64'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'Сборка на Linux для LoongArch64'
doc_type: 'guide'
---

# Сборка под Linux для LoongArch64 {#build-on-linux-for-loongarch64}

ClickHouse экспериментально поддерживает LoongArch64

## Сборка ClickHouse {#build-clickhouse}

Для сборки требуется версия LLVM не ниже 19.1.0.

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

Полученный бинарный файл будет работать только под Linux на архитектуре процессора LoongArch64.
