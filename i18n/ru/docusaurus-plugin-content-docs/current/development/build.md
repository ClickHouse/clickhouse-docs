---
description: 'Пошаговое руководство по сборке ClickHouse из исходников на системах Linux'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
slug: /development/build
title: 'Как собрать ClickHouse на Linux'
---


# Как собрать ClickHouse на Linux

:::info Вы не обязаны собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как это описано в [Quick Start](https://clickhouse.com/#quick-start).
:::

ClickHouse можно собрать на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)

## Предположения {#assumptions}

Следующий учебник основан на Ubuntu Linux, но он также должен работать на любой другой дистрибутиве Linux с соответствующими изменениями. 
Минимально рекомендованная версия Ubuntu для разработки — 24.04 LTS.

Учебник предполагает, что у вас есть локально клонированный репозиторий ClickHouse и все подмодули.

## Установите предварительные требования {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

ClickHouse использует CMake и Ninja для сборки.

Вы можете дополнительно установить ccache, чтобы сборка могла повторно использовать уже собранные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Установите компилятор Clang {#install-the-clang-compiler}

Чтобы установить Clang на Ubuntu/Debian, используйте автоматический скрипт установки LLVM [отсюда](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, можете ли вы установить какие-либо из [предварительно собранных пакетов LLVM](https://releases.llvm.org/download.html).

На март 2025 года требуется Clang 19 или выше.
GCC или другие компиляторы не поддерживаются.

## Установите компилятор Rust (опционально) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью ClickHouse.
Если Rust не установлен, некоторые функции ClickHouse будут исключены из компиляции.
:::

Сначала выполните шаги в официальной [документации по Rust](https://www.rust-lang.org/tools/install) для установки `rustup`.

Как и с зависимостями C++, ClickHouse использует вендоринг для точного контроля того, что установлено, и избегания зависимости от сторонних служб (например, реестра `crates.io`).

Хотя в режиме выпуска любая современная версия rustup toolchain должна работать с этими зависимостями, если вы планируете включить санитайзеры, вы должны использовать версию, которая соответствует точно такому же `std`, как тот, что используется в CI (для которого мы вендорим крейты):

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## Сборка ClickHouse {#build-clickhouse}

Рекомендуем создать отдельную директорию `build` внутри `ClickHouse`, которая будет содержать все артефакты сборки:

```sh
mkdir build
cd build
```

Вы можете создать несколько разных директорий (например, `build_release`, `build_debug` и т.д.) для разных типов сборки.

Опционально: если у вас установлено несколько версий компилятора, вы можете указать конкретный компилятор для использования.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для целей разработки рекомендуется использовать отладочные сборки. 
По сравнению с выпусками они имеют более низкий уровень оптимизации компилятора (`-O`), что обеспечивает лучший опыт отладки. 
Кроме того, внутренние исключения типа `LOGICAL_ERROR` сразу приводят к сбою вместо мягкой неудачи.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

Запустите ninja для сборки:

```sh
ninja clickhouse-server clickhouse-client
```

Если вы хотите собрать все бинарные файлы (системные утилиты и тесты), просто запустите ninja без параметров:

```sh
ninja
```

Вы можете контролировать количество параллельных задач сборки с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращения для вышеуказанных команд:

```sh
cmake -S . -B build  # настроить сборку, запустите из каталога верхнего уровня репозитория
cmake --build build  # компиляция
```
:::

## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешной сборки вы найдете исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге. 
Вы можете дополнительно указать файл конфигурации в командной строке через `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в `ClickHouse/build/programs/` и выполните `./clickhouse client`.

Если вы получили сообщение `Connection refused` на macOS или FreeBSD, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```

## Расширенные параметры {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вам не нужна функциональность, предоставляемая сторонними библиотеками, вы можете еще больше ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае проблем вы остаетесь наедине с ними ...

Rust требует подключения к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить производственную версию бинарника ClickHouse, установленного в вашей системе, скомпилированным бинарником ClickHouse. 
Для этого установите ClickHouse на вашем компьютере, следуя инструкциям с официального сайта.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие являются символическими ссылками на общий бинарный файл `clickhouse`.

Вы также можете запустить свой собственный скомпилированный бинарник ClickHouse с файлом конфигурации из установленного пакета ClickHouse на вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### Сборка на любом Linux {#building-on-any-linux}

Установите предварительные требования на OpenSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите предварительные требования на Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Сборка в docker {#building-in-docker}

Мы используем образ docker `clickhouse/binary-builder` для сборок в CI. 
Он содержит все необходимое для сборки бинарного файла и пакетов. 
Существует скрипт `docker/packager/packager`, чтобы упростить использование образа:

```bash

# задайте каталог для выходных артефактов
output_dir="build_results"

# самая простая сборка
./docker/packager/packager --package-type=binary --output-dir "$output_dir"

# сборка debian пакетов
./docker/packager/packager --package-type=deb --output-dir "$output_dir"

# по умолчанию debian пакеты используют тонкий LTO, так что мы можем переопределить это для ускорения сборки
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
```
