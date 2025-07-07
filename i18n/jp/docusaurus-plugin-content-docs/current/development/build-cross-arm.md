---
'description': 'Guide for building ClickHouse from source for the AARCH64 architecture'
'sidebar_label': 'Build on Linux for AARCH64'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': 'How to Build ClickHouse on Linux for AARCH64'
---




# AARCH64向けにLinuxでClickHouseをビルドする方法

Aarch64マシンでClickHouseをビルドするために特別な手順は必要ありません。

x86 Linuxマシン上でAArch64向けにClickHouseをクロスコンパイルするには、`cmake`に次のフラグを渡します: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
