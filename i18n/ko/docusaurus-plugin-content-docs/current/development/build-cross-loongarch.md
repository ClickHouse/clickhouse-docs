---
description: 'LoongArch64 아키텍처용 ClickHouse 소스 코드 빌드 가이드'
sidebar_label: 'Linux에서 LoongArch64용 빌드'
sidebar_position: 35
slug: /development/build-cross-loongarch
title: 'Linux에서 LoongArch64용 빌드'
doc_type: 'guide'
---

# LoongArch64용 Linux에서 빌드하기 \{#build-on-linux-for-loongarch64\}

ClickHouse는 LoongArch64를 실험적으로 지원합니다.

## ClickHouse 빌드 \{#build-clickhouse\}

빌드를 위해 필요한 LLVM 버전은 21.1.0 이상이어야 합니다.

```bash
cd ClickHouse
mkdir build-loongarch64
cmake . -Bbuild-loongarch64 -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

생성된 바이너리는 LoongArch64 CPU 아키텍처를 사용하는 Linux에서만 실행할 수 있습니다.
