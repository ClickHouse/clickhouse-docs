---
slug: /development/build-cross-arm
sidebar_position: 25
sidebar_label: AARCH64 用の Linux でのビルド
---


# AARCH64 用の Linux で ClickHouse をビルドする方法

Aarch64 マシンで Aarch64 用の ClickHouse をビルドするために特別な手順は必要ありません。

x86 Linux マシン上で AArch64 用に ClickHouse をクロスコンパイルするには、次のフラグを `cmake` に渡します: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
