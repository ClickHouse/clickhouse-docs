---
slug: '/development/build-cross-arm'
sidebar_label: 'Сборка на Linux для AARCH64'
sidebar_position: 25
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры'
title: 'Как собрать ClickHouse на Linux для AARCH64'
doc_type: guide
---
# Как собрать ClickHouse на Linux для AARCH64

Не требуется никаких специальных шагов для сборки ClickHouse для Aarch64 на машине с Aarch64.

Чтобы собрать ClickHouse для AArch64 на x86 машине с Linux, передайте следующий флаг в `cmake`: `-DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-aarch64.cmake`