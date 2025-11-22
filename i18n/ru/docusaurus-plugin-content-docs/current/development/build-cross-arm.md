---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры AARCH64'
sidebar_label: 'Сборка на Linux для AARCH64'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Как собрать ClickHouse на Linux для AARCH64'
doc_type: 'guide'
---

# Как собрать ClickHouse на Linux для AARCH64

Для сборки ClickHouse для AArch64 на машине с архитектурой AArch64 не требуются какие-либо специальные действия.

Чтобы выполнить кросс-компиляцию ClickHouse для AArch64 на машине с архитектурой x86 под управлением Linux, передайте в `cmake` следующий флаг: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`