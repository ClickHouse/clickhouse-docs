---
description: 'E2K 아키텍처용 ClickHouse를 소스 코드에서 빌드하는 가이드'
sidebar_label: 'E2K용 Linux에서 빌드'
sidebar_position: 35
slug: /development/build-e2k
title: 'E2K용 Linux에서 빌드'
doc_type: 'guide'
---

ClickHouse는 E2K(Elbrus-2000)를 실험적으로 지원하며, boost, jemalloc, libunwind, zstd 등 E2K용으로 사용자 지정 빌드된 라이브러리를 사용하는 최소 구성에서만 네이티브 모드로 컴파일할 수 있습니다.

## ClickHouse 빌드 \{#build-clickhouse\}

빌드에 필요한 LLVM 버전은 20.1.8 이상이어야 합니다.

```bash
cd ClickHouse
mkdir build-e2k
cmake -DCMAKE_CROSSCOMPILING=OFF -DCOMPILER_CACHE=disabled \
 -DCMAKE_C_COMPILER=/usr/lib/llvm-20/bin/clang -DCMAKE_CXX_COMPILER=/usr/lib/llvm-20/bin/clang++ \
 -DLLD_PATH=/usr/lib/llvm-20/bin/ld.lld \
 -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr \
 -DGLIBC_COMPATIBILITY=OFF -DENABLE_LIBRARIES=OFF -DWERROR=OFF \
 -DENABLE_SSL=OFF -DENABLE_OPENSSL_DYNAMIC=ON \
 -DUSE_SIMDJSON=OFF -DENABLE_JEMALLOC=OFF -DENABLE_TESTS=OFF \
 -DBOOST_USE_UCONTEXT=ON -DENABLE_NURAFT=ON -DENABLE_RAPIDJSON=ON -DUSE_LIBFIU=ON ..
ninja -j8
```

생성된 바이너리는 E2K CPU 아키텍처 기반 Linux에서만 실행됩니다.