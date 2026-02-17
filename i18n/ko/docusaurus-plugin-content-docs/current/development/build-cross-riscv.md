---
description: 'RISC-V 64 아키텍처용 ClickHouse를 소스 코드에서 빌드하는 가이드'
sidebar_label: 'Linux에서 RISC-V 64용 빌드'
sidebar_position: 30
slug: /development/build-cross-riscv
title: 'Linux에서 RISC-V 64용 ClickHouse를 빌드하는 방법'
doc_type: 'guide'
---

# RISC-V 64용 Linux에서 ClickHouse를 빌드하는 방법 \{#how-to-build-clickhouse-on-linux-for-risc-v-64\}

ClickHouse는 RISC-V에 대한 실험적 지원을 제공합니다. 모든 기능을 사용할 수 있는 것은 아닙니다.

## ClickHouse 빌드 \{#build-clickhouse\}

RISC-V가 아닌 머신에서 RISC-V용으로 크로스 컴파일하려면:

```bash
cd ClickHouse
mkdir build-riscv64
cmake . -Bbuild-riscv64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-riscv64.cmake -DGLIBC_COMPATIBILITY=OFF -DENABLE_LDAP=OFF  -DOPENSSL_NO_ASM=ON -DENABLE_JEMALLOC=ON -DENABLE_PARQUET=OFF -DENABLE_GRPC=OFF -DENABLE_HDFS=OFF -DENABLE_MYSQL=OFF
ninja -C build-riscv64
```

생성된 바이너리는 RISC-V 64 CPU 아키텍처를 사용하는 Linux에서만 실행됩니다.
