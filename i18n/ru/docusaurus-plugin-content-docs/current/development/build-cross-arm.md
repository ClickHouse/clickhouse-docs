---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры AARCH64'
sidebar_label: 'Сборка на Linux для AARCH64'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Как собрать ClickHouse на Linux для AARCH64'
doc_type: 'guide'
---

# Как собрать ClickHouse на Linux для AArch64 \{#how-to-build-clickhouse-on-linux-for-aarch64\}

Для сборки ClickHouse для AArch64 на машине с архитектурой AArch64 не требуются специальные действия.

Чтобы выполнить кросс-компиляцию ClickHouse для AArch64 на машине x86 с Linux, передайте в `cmake` следующий флаг: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`