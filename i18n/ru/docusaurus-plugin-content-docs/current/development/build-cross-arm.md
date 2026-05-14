---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры AARCH64'
sidebar_label: 'Сборка на Linux для AARCH64'
sidebar_position: 25
slug: /development/build-cross-arm
title: 'Как собрать ClickHouse на Linux для AARCH64'
doc_type: 'guide'
---

Для сборки ClickHouse для Aarch64 на машине с архитектурой Aarch64 не требуется никаких специальных действий.

Чтобы выполнить кросс-компиляцию ClickHouse для AArch64 на машине x86 под Linux, передайте в `cmake` следующий флаг: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`