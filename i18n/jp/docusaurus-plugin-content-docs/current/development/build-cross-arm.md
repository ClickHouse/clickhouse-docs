---
description: 'AARCH64アーキテクチャ用にソースからClickHouseをビルドするためのガイド'
sidebar_label: 'AARCH64のLinuxでビルド'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Linux上でAARCH64用にClickHouseをビルドする方法'
---


# Linux上でAARCH64用にClickHouseをビルドする方法

Aarch64マシン上でAarch64用にClickHouseをビルドするために特別な手順は必要ありません。

x86 Linuxマシン上でAArch64用にClickHouseをクロスコンパイルするには、`cmake`に次のフラグを渡します: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
