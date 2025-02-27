---
slug: /development/build-cross-arm
sidebar_position: 25
sidebar_label: AARCH64向けにLinuxでビルドする
---

# AARCH64向けにLinuxでClickHouseをビルドする方法

Aarch64マシンでAarch64向けにClickHouseをビルドするために、特別な手順は必要ありません。

x86 LinuxマシンでAArch64向けにClickHouseをクロスコンパイルするには、`cmake`に以下のフラグを渡してください: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
