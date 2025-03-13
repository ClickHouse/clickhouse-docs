---
slug: /development/build-cross-arm
sidebar_position: 25
sidebar_label: Сборка на Linux для AARCH64
---


# Как собрать ClickHouse на Linux для AARCH64

Нет особых шагов для сборки ClickHouse для Aarch64 на машине Aarch64.

Чтобы скомпилировать ClickHouse для AArch64 на машине x86 с Linux, передайте следующий флаг в `cmake`: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`
