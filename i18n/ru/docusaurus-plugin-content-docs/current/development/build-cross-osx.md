---
description: 'Руководство по кросс-компиляции ClickHouse на Linux под macOS'
sidebar_label: 'Сборка на Linux для macOS'
sidebar_position: 20
slug: /development/build-cross-osx
title: 'Сборка на Linux для macOS'
doc_type: 'guide'
---

# Как собрать ClickHouse на Linux для macOS \\{#how-to-build-clickhouse-on-linux-for-macos\\}

Этот документ описывает случай, когда у вас есть машина под управлением Linux, и вы хотите использовать её для сборки бинарного файла `clickhouse`, который будет запускаться на OS X.
Основной сценарий использования — проверки в системе непрерывной интеграции, выполняющиеся на Linux-машинах.
Если вы хотите собирать ClickHouse непосредственно на macOS, перейдите к [инструкциям по нативной сборке](../development/build-osx.md).

Кросс-компиляция для macOS основана на [инструкциях по сборке](../development/build.md), сначала выполните шаги, описанные там.

В следующих разделах приведено пошаговое руководство по сборке ClickHouse для `x86_64` macOS.
Если вы нацеливаетесь на архитектуру ARM, просто замените все вхождения `x86_64` на `aarch64`.
Например, замените `x86_64-apple-darwin` на `aarch64-apple-darwin` на всех этапах.

## Установите набор инструментов для кросс-компиляции \\{#install-cross-compilation-toolset\\}

Запомните путь, по которому установлен `cctools`, и обозначьте его как `${CCTOOLS}`

```bash
mkdir ~/cctools
export CCTOOLS=$(cd ~/cctools && pwd)
cd ${CCTOOLS}

git clone https://github.com/tpoechtrager/apple-libtapi.git
cd apple-libtapi
git checkout 15dfc2a8c9a2a89d06ff227560a69f5265b692f9
INSTALLPREFIX=${CCTOOLS} ./build.sh
./install.sh
cd ..

git clone https://github.com/tpoechtrager/cctools-port.git
cd cctools-port/cctools
git checkout 2a3e1c2a6ff54a30f898b70cfb9ba1692a55fad7
./configure --prefix=$(readlink -f ${CCTOOLS}) --with-libtapi=$(readlink -f ${CCTOOLS}) --target=x86_64-apple-darwin
make install
```

Также нужно загрузить SDK macOS X в рабочее дерево.

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## Сборка ClickHouse \\{#build-clickhouse\\}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

Полученный бинарный файл будет иметь формат исполняемого файла Mach-O и не сможет быть запущен под Linux.
