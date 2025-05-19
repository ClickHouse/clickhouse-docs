---
description: 'Пошаговое руководство по сборке ClickHouse из исходников на системах Linux'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
slug: /development/build
title: 'Как собрать ClickHouse на Linux'
---


# Как собрать ClickHouse на Linux

:::info Вам не обязательно собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как описано в [Быстром старте](https://clickhouse.com/#quick-start).
:::

ClickHouse можно собрать на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)

## Предположения {#assumptions}

Следующий учебник основан на Ubuntu Linux, но он также должен работать на любой другой дистрибутив Linux с соответствующими изменениями.
Минимально рекомендуемая версия Ubuntu для разработки - 24.04 LTS.

Учебник предполагает, что у вас есть локально скачанный репозиторий ClickHouse и все его подмодули.

## Установка предварительных условий {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным условиям](developer-instruction.md).

ClickHouse использует CMake и Ninja для сборки.

Вы можете дополнительно установить ccache, чтобы сборка могла переиспользовать уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Установка компилятора Clang {#install-the-clang-compiler}

Чтобы установить Clang на Ubuntu/Debian, воспользуйтесь автоматическим скриптом установки LLVM, который можно найти [здесь](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, можете ли вы установить любой из [предварительно собранных пакетов](https://releases.llvm.org/download.html) LLVM.

На март 2025 года требуется Clang 19 или выше.
GCC или другие компиляторы не поддерживаются.

## Установка компилятора Rust (по желанию) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью ClickHouse.
Если Rust не установлен, некоторые функции ClickHouse будут пропущены при компиляции.
:::

Сначала выполните шаги из официальной [документации по Rust](https://www.rust-lang.org/tools/install), чтобы установить `rustup`.

Как и в случае с зависимостями C++, ClickHouse использует vendoring для точного контроля над тем, что установлено, и избегает зависимости от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме релиза любая современная версия rustup toolchain должна работать с этими зависимостями, если вы планируете включить санитайзеры, вы должны использовать версию, совпадающую с тем же `std`, что и в CI (для чего мы используем вендоринг пакетов):

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## Сборка ClickHouse {#build-clickhouse}

Рекомендуется создать отдельный каталог `build` внутри `ClickHouse`, который будет содержать все артефакты сборки:

```sh
mkdir build
cd build
```

Вы можете иметь несколько разных каталогов (например, `build_release`, `build_debug` и т.д.) для различных типов сборки.

По желанию: если у вас установлено несколько версий компилятора, вы можете указать точный компилятор.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для целей разработки рекомендуется использовать отладочные сборки.
В отличие от релизных сборок они имеют более низкий уровень оптимизации компилятора (`-O`), который обеспечивает лучший опыт отладки.
Кроме того, внутренние исключения типа `LOGICAL_ERROR` немедленно приводят к сбою, вместо того чтобы завершаться gracefully.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

Запустите ninja для сборки:

```sh
ninja clickhouse-server clickhouse-client
```

Если вы хотите собрать все бинарные файлы (утилиты и тесты), запустите ninja без параметров:

```sh
ninja
```

Вы можете контролировать количество параллельных задач сборки, используя параметр `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращения для вышеуказанных команд:

```sh
cmake -S . -B build  # настройка сборки, запуск из корневого каталога репозитория
cmake --build build  # компиляция
```
:::

## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешной сборки вы найдете исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге.
Вы также можете указать файл конфигурации в командной строке с помощью `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в `ClickHouse/build/programs/` и выполните `./clickhouse client`.

Если вы получили сообщение `Connection refused` на macOS или FreeBSD, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```

## Расширенные параметры {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вам не нужны функции, предоставляемые сторонними библиотеками, вы можете ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае проблем вы остаетесь наедине со своими трудностями...

Rust требует подключения к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить производственную версию бинарного файла ClickHouse, установленного в вашей системе, на скомпилированный бинарный файл ClickHouse.
Для этого установите ClickHouse на своем компьютере, следуя инструкциям с официального сайта.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие являются символическими ссылками на общий бинарный файл `clickhouse`.

Вы также можете запустить свой собственный собранный бинарный файл ClickHouse с файлом конфигурации из пакета ClickHouse, установленного на вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### Сборка на любом Linux {#building-on-any-linux}

Установите предварительные условия на OpenSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите предварительные условия на Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Сборка в Docker {#building-in-docker}

Вы можете запустить любую сборку локально в среде, похожей на CI, с помощью:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
где BUILD_JOB_NAME - это имя задания, как показано в отчете CI, например, "Build (arm_release)", "Build (amd_debug)"

Эта команда загружает соответствующий Docker-образ `clickhouse/binary-builder` со всеми необходимыми зависимостями,
и запускает скрипт сборки внутри него: `./ci/jobs/build_clickhouse.py`

Результаты сборки будут помещены в `./ci/tmp/`.

Это работает на архитектурах AMD и ARM и не требует дополнительных зависимостей, кроме Docker.
