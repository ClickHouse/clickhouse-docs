---
description: 'Пошаговое руководство по сборке ClickHouse из исходного кода в системах Linux'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
slug: /development/build
title: 'Как собрать ClickHouse на Linux'
doc_type: 'guide'
---



# Как собрать ClickHouse под Linux

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить готовую сборку ClickHouse, как описано в разделе [Quick Start](https://clickhouse.com/#quick-start).
:::

ClickHouse можно собрать на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)



## Предположения {#assumptions}

Данное руководство основано на Ubuntu Linux, но также должно работать на любом другом дистрибутиве Linux с соответствующими изменениями.
Минимальная рекомендуемая версия Ubuntu для разработки — 24.04 LTS.

Руководство предполагает, что у вас локально клонирован репозиторий ClickHouse со всеми подмодулями.


## Установка необходимых компонентов {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

ClickHouse использует CMake и Ninja для сборки.

При необходимости можно установить ccache, чтобы система сборки могла повторно использовать уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Установка компилятора Clang {#install-the-clang-compiler}

Для установки Clang в Ubuntu/Debian используйте автоматический скрипт установки LLVM, доступный [здесь](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте возможность установки одного из [предварительно собранных пакетов](https://releases.llvm.org/download.html) LLVM.

По состоянию на март 2025 года требуется Clang версии 19 или выше.
Компиляторы GCC и другие не поддерживаются.


## Установка компилятора Rust (необязательно) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью ClickHouse.
Если Rust не установлен, некоторые возможности ClickHouse будут исключены из сборки.
:::

Сначала следуйте инструкциям из официальной [документации Rust](https://www.rust-lang.org/tools/install) для установки `rustup`.

Как и в случае с зависимостями C++, ClickHouse использует вендоринг для точного контроля устанавливаемых компонентов и исключения зависимости от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме релиза любая современная версия инструментария rustup должна работать с этими зависимостями, если вы планируете включить санитайзеры, необходимо использовать версию, которая точно соответствует той же `std`, что и используемая в CI (для которой мы применяем вендоринг крейтов):


```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## Сборка ClickHouse {#build-clickhouse}

Рекомендуется создать отдельный каталог `build` внутри `ClickHouse`, в котором будут храниться все артефакты сборки:

```sh
mkdir build
cd build
```

Можно создать несколько различных каталогов (например, `build_release`, `build_debug` и т. д.) для разных типов сборки.

Опционально: если установлено несколько версий компилятора, можно указать конкретный компилятор для использования.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для разработки рекомендуется использовать отладочные сборки.
По сравнению с релизными сборками они имеют более низкий уровень оптимизации компилятора (`-O`), что обеспечивает более удобную отладку.
Кроме того, внутренние исключения типа `LOGICAL_ERROR` приводят к немедленному аварийному завершению, а не к корректному завершению работы.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
Если требуется использовать отладчик, такой как gdb, добавьте `-D DEBUG_O_LEVEL="0"` к приведенной выше команде, чтобы отключить все оптимизации компилятора, которые могут помешать gdb просматривать переменные и получать к ним доступ.
:::

Запустите ninja для сборки:

```sh
ninja clickhouse
```

Чтобы собрать все исполняемые файлы (утилиты и тесты), запустите ninja без параметров:

```sh
ninja
```

Количество параллельных задач сборки можно контролировать с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращенные варианты приведенных выше команд:

```sh
cmake -S . -B build  # настройка сборки, запуск из корневого каталога репозитория
cmake --build build  # компиляция
```

:::


## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешного завершения сборки исполняемый файл можно найти в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти конфигурационный файл `config.xml` в текущем каталоге.
В качестве альтернативы можно указать конфигурационный файл в командной строке с помощью параметра `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в каталог `ClickHouse/build/programs/` и выполните команду `./clickhouse client`.

Если на macOS или FreeBSD вы получаете сообщение `Connection refused`, попробуйте явно указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```


## Дополнительные параметры {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вам не требуется функциональность, предоставляемая сторонними библиотеками, вы можете дополнительно ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае возникновения проблем вы действуете на свой страх и риск...

Rust требует подключения к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить продакшн-версию бинарного файла ClickHouse, установленную в вашей системе, на скомпилированный бинарный файл ClickHouse.
Для этого установите ClickHouse на вашу машину, следуя инструкциям с официального сайта.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие являются символическими ссылками на общий бинарный файл `clickhouse`.

Вы также можете запустить собственную сборку бинарного файла ClickHouse с конфигурационным файлом из пакета ClickHouse, установленного в вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### Сборка на любом Linux {#building-on-any-linux}

Установите необходимые компоненты на OpenSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите необходимые компоненты на Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Сборка в Docker {#building-in-docker}

Вы можете запустить любую сборку локально в окружении, аналогичном CI, используя:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

где BUILD_JOB_NAME — это имя задачи, как показано в отчёте CI, например, "Build (arm_release)", "Build (amd_debug)"

Эта команда загружает соответствующий Docker-образ `clickhouse/binary-builder` со всеми необходимыми зависимостями
и запускает внутри него скрипт сборки: `./ci/jobs/build_clickhouse.py`

Результаты сборки будут размещены в `./ci/tmp/`.

Это работает на архитектурах AMD и ARM и не требует дополнительных зависимостей, кроме Docker.
