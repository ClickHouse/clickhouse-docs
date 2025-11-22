---
description: 'AArch64 アーキテクチャ向けに ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'AArch64 向け Linux 上でのビルド'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Linux 上で AArch64 向けに ClickHouse をビルドする方法'
doc_type: 'guide'
---

# Linux 上で AArch64 向けに ClickHouse をビルドする方法

AArch64 マシン上で AArch64 向けに ClickHouse をビルドする場合、特別な手順は不要です。

x86 Linux マシン上で AArch64 向けに ClickHouse をクロスコンパイルするには、`cmake` に次のフラグを指定します：`-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`