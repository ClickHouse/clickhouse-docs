---
description: 'Руководство по сборке ClickHouse из исходного кода под архитектуру E2K'
sidebar_label: 'Сборка на Linux для E2K'
sidebar_position: 35
slug: /development/build-e2k
title: 'Сборка на Linux для E2K'
doc_type: 'guide'
---



# Сборка в Linux для E2K

В ClickHouse поддержка E2K (Elbrus-2000) находится на очень ранней экспериментальной стадии, и его можно собрать только в нативном режиме с минимальной конфигурацией, используя специально собранные под E2K библиотеки, такие как boost, croaring, libunwind, zstd.



## Сборка ClickHouse {#build-clickhouse}

Для сборки требуется версия LLVM не ниже 20.1.8.

```bash
cd ClickHouse
mkdir build-e2k
cmake -DCMAKE_CROSSCOMPILING=OFF -DCOMPILER_CACHE=disabled \
 -DCMAKE_C_COMPILER=/usr/lib/llvm-20/bin/clang -DCMAKE_CXX_COMPILER=/usr/lib/llvm-20/bin/clang++ \
 -DLLD_PATH=/usr/lib/llvm-20/bin/ld.lld \
 -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr \
 -DGLIBC_COMPATIBILITY=OFF -DENABLE_JEMALLOC=OFF -DENABLE_LIBRARIES=OFF \
 -DENABLE_SSL=OFF -DWERROR=OFF -DUSE_SIMDJSON=OFF -DENABLE_TESTS=OFF -DBOOST_USE_UCONTEXT=ON ..
ninja -j8
```

Полученный исполняемый файл будет работать только в Linux с архитектурой процессора E2K.
