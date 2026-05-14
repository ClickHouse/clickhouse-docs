---
description: 'AARCH64 アーキテクチャ向け ClickHouse をソースコードからビルドするためのガイド'
sidebar_label: 'Linux 上での AARCH64 向けビルド'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Linux 上で AARCH64 向け ClickHouse をビルドする方法'
doc_type: 'guide'
---

Aarch64 マシン上で ClickHouse を Aarch64 向けにビルドする場合、特別な手順は必要ありません。

x86 Linux マシン上で ClickHouse を AArch64 向けにクロスコンパイルするには、`cmake` に次のフラグを渡します: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`