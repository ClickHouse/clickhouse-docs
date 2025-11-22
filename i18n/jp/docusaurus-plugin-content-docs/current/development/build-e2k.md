---
description: 'E2K アーキテクチャ向け ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'Linux での E2K 向けビルド'
sidebar_position: 35
slug: /development/build-e2k
title: 'Linux での E2K 向けビルド'
doc_type: 'guide'
---



# Linux 上での E2K 向けビルド

ClickHouse は E2K (Elbrus-2000) をまだ非常に実験的な段階でサポートしており、`boost`、`croaring`、`libunwind`、`zstd` などの E2K 向けにカスタムビルドされたライブラリを用いる場合に限り、ネイティブモードかつ最小限の構成でのみコンパイルできます。



## ClickHouseのビルド {#build-clickhouse}

ビルドに必要なLLVMのバージョンは20.1.8以上である必要があります。

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

生成されるバイナリは、E2K CPUアーキテクチャを搭載したLinux上でのみ実行可能です。
