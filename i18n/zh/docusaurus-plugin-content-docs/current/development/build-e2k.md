---
description: '在 E2K 架构上从源代码构建 ClickHouse 的指南'
sidebar_label: '在 Linux 上为 E2K 构建'
sidebar_position: 35
slug: /development/build-e2k
title: '在 Linux 上为 E2K 构建'
doc_type: 'guide'
---



# 在 Linux 上为 E2K 构建

ClickHouse 对 E2K（Elbrus-2000）的支持仍处于高度实验阶段，目前只能在原生模式下，以最小配置并依赖为 E2K 定制构建的库（如 boost、croaring、libunwind、zstd）进行编译。



## 构建 ClickHouse {#build-clickhouse}

构建所需的 LLVM 版本必须大于或等于 20.1.8。

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

生成的二进制文件仅可在采用 E2K CPU 架构的 Linux 系统上运行。
