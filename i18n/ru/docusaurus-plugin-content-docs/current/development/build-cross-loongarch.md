---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры LoongArch64'
sidebar_label: 'Сборка в Linux для LoongArch64'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'Сборка в Linux для LoongArch64'
doc_type: 'guide'
---



# Сборка в Linux для архитектуры LoongArch64

ClickHouse экспериментально поддерживает архитектуру LoongArch64.



## Сборка ClickHouse {#build-clickhouse}

Для сборки требуется версия LLVM не ниже 19.1.0.

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

Полученный исполняемый файл будет работать только в Linux с архитектурой процессора LoongArch64.
