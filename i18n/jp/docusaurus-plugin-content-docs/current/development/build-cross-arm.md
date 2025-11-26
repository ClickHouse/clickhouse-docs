---
description: 'AARCH64 アーキテクチャ向け ClickHouse をソースコードからビルドするためのガイド'
sidebar_label: 'Linux 上での AARCH64 向けビルド'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Linux 上で AARCH64 向け ClickHouse をビルドする方法'
doc_type: 'guide'
---

# Linux 上で AArch64 向けに ClickHouse をビルドする方法

AArch64 マシン上で AArch64 向けに ClickHouse をビルドする場合、特別な手順は必要ありません。

x86 Linux マシン上で AArch64 向けに ClickHouse をクロスコンパイルするには、`cmake` に次のフラグを指定します: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`