---
description: 'Руководство по сборке ClickHouse из исходников для архитектуры E2K'
sidebar_label: 'Сборка на Linux для E2K'
sidebar_position: 35
slug: /development/build-e2k
title: 'Сборка на Linux для E2K'
doc_type: 'guide'
---

# Сборка на Linux для E2K \{#build-on-linux-for-e2k\}

В ClickHouse имеется экспериментальная поддержка архитектуры E2K (Эльбрус‑2000), и он может быть скомпилирован только в нативном режиме с минимальной конфигурацией, используя специально собранные для E2K библиотеки, такие как Boost, jemalloc, libunwind, Zstd.

## Сборка ClickHouse \{#build-clickhouse\}

Требуемая версия LLVM для сборки должна быть не ниже 20.1.8.

```bash
cd ClickHouse
mkdir build-e2k
cmake -DCMAKE_CROSSCOMPILING=OFF -DCOMPILER_CACHE=disabled \
 -DCMAKE_C_COMPILER=/usr/lib/llvm-20/bin/clang -DCMAKE_CXX_COMPILER=/usr/lib/llvm-20/bin/clang++ \
 -DLLD_PATH=/usr/lib/llvm-20/bin/ld.lld \
 -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr \
 -DGLIBC_COMPATIBILITY=OFF -DENABLE_LIBRARIES=OFF -DWERROR=OFF \
 -DENABLE_SSL=OFF -DENABLE_OPENSSL_DYNAMIC=ON \
 -DUSE_SIMDJSON=OFF -DENABLE_JEMALLOC=OFF -DENABLE_TESTS=OFF -DUSE_SYSTEM_COMPILER_RT=OFF \
 -DBOOST_USE_UCONTEXT=ON -DENABLE_NURAFT=ON -DENABLE_RAPIDJSON=ON -DUSE_LIBFIU=ON ..
ninja -j8
```

Полученный бинарный файл будет работать только в Linux на процессорах с архитектурой E2K.
