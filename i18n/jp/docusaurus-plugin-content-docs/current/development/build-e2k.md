---
description: 'E2K アーキテクチャ向けに ClickHouse をソースコードからビルドするためのガイド'
sidebar_label: 'Linux での E2K 向けビルド'
sidebar_position: 35
slug: /development/build-e2k
title: 'Linux での E2K 向けビルド'
doc_type: 'guide'
---

# E2K 向け Linux 上でのビルド \{#build-on-linux-for-e2k\}

ClickHouse は E2K (Elbrus-2000) を実験的にサポートしており、boost、jemalloc、libunwind、zstd などの e2k 向けにカスタムビルドされたライブラリを使用した最小限の構成で、ネイティブモードでのみコンパイル可能です。

## ClickHouse をビルドする \{#build-clickhouse\}

ビルドに必要な LLVM のバージョンは 20.1.8 以上です。

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

生成されたバイナリは、E2K CPU アーキテクチャの Linux 環境でのみ実行できます。
