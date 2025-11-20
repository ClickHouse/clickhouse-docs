---
'description': 'AARCH64 아키텍처를 위한 소스에서 ClickHouse를 빌드하는 가이드'
'sidebar_label': 'AARCH64를 위한 Linux에서 빌드'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': 'AARCH64 아키텍처를 위한 ClickHouse를 Linux에서 빌드하는 방법'
'doc_type': 'guide'
---


# AARCH64 용 ClickHouse를 Linux에서 빌드하는 방법

Aarch64 머신에서 Aarch64 용 ClickHouse를 빌드하는 데 특별한 단계는 필요하지 않습니다.

x86 Linux 머신에서 AArch64 용 ClickHouse를 크로스 컴파일하려면 다음 플래그를 `cmake`에 전달하세요: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
