---
'description': 'AARCH64アーキテクチャ用にソースからClickHouseをビルドするためのガイド'
'sidebar_label': 'AARCH64用Linux上でビルド'
'sidebar_position': 25
'slug': '/development/build-cross-arm'
'title': 'AARCH64用Linux上でClickHouseをビルドする方法'
'doc_type': 'guide'
---


# AARCH64用のClickHouseのビルド方法

Aarch64マシン上でAarch64用のClickHouseをビルドするために特別な手順は必要ありません。

x86 Linuxマシン上でAArch64用のClickHouseをクロスコンパイルするには、次のフラグを`cmake`に渡してください: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
