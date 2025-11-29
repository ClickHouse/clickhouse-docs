---
description: 'Пошаговое руководство по сборке ClickHouse из исходников в операционных системах Linux'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
slug: /development/build
title: 'Как собрать ClickHouse на Linux'
doc_type: 'guide'
---

# Как собрать ClickHouse под Linux {#how-to-build-clickhouse-on-linux}

:::info Вам не обязательно собирать ClickHouse самостоятельно!
Вы можете установить уже собранный ClickHouse, как описано в разделе [Быстрый старт](https://clickhouse.com/#quick-start).
:::

ClickHouse может быть собран на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)

## Предположения {#assumptions}

Данное руководство рассчитано на использование в Ubuntu Linux, но при соответствующей настройке оно также должно работать и на любом другом дистрибутиве Linux.
Минимально рекомендуемая версия Ubuntu для разработки — 24.04 LTS.

Руководство исходит из того, что вы локально клонировали репозиторий ClickHouse со всеми подмодулями.

## Установка необходимых зависимостей {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

ClickHouse использует CMake и Ninja для сборки.

При желании вы можете установить ccache, чтобы при сборке повторно использовать уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Установите компилятор Clang {#install-the-clang-compiler}

Чтобы установить Clang в Ubuntu/Debian, используйте автоматический скрипт установки LLVM, доступный [здесь](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, можно ли установить один из [предварительно собранных пакетов LLVM](https://releases.llvm.org/download.html).

По состоянию на март 2025 года требуется Clang 19 или выше.
Компилятор GCC и другие компиляторы не поддерживаются.


## Установка компилятора Rust (необязательно) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью для ClickHouse.
Если Rust не установлен, некоторые функции ClickHouse не будут включены в сборку.
:::

Сначала выполните шаги из официальной [документации по Rust](https://www.rust-lang.org/tools/install), чтобы установить `rustup`.

Так же, как и для зависимостей C++, ClickHouse использует vendoring, чтобы точно контролировать состав устанавливаемых компонентов и не зависеть от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме release любая современная версия toolchain `rustup` должна работать с этими зависимостями, если вы планируете включить санитайзеры, необходимо использовать версию, у которой `std` в точности совпадает с той, что используется в CI (для которой мы вендорим соответствующие crates):

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```


## Сборка ClickHouse {#build-clickhouse}

Мы рекомендуем создать отдельный каталог `build` внутри `ClickHouse`, в котором будут храниться все артефакты сборки:

```sh
mkdir build
cd build
```

Вы можете использовать несколько разных каталогов (например, `build_release`, `build_debug` и т. д.) для разных типов сборок.

Необязательный шаг: если у вас установлено несколько версий компилятора, при необходимости вы можете указать конкретный компилятор, который следует использовать.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для целей разработки рекомендуется использовать отладочные сборки.
По сравнению с релизными, у них ниже уровень оптимизации компилятора (`-O`), что обеспечивает более удобную отладку.
Также внутренние исключения типа `LOGICAL_ERROR` приводят к немедленному аварийному завершению работы вместо корректной обработки ошибки.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
Если вы хотите использовать отладчик, такой как gdb, добавьте `-D DEBUG_O_LEVEL="0"` к приведённой выше команде, чтобы полностью отключить оптимизации компилятора, которые могут мешать gdb просматривать переменные и получать к ним доступ.
:::

Запустите ninja для сборки:

```sh
ninja clickhouse
```

Если вы хотите собрать все двоичные файлы (утилиты и тесты), запустите команду `ninja` без параметров:

```sh
ninja
```

Вы можете управлять количеством параллельных задач сборки с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращённые варианты для приведённых выше команд:

```sh
cmake -S . -B build  # настройка сборки, запускается из корневого каталога репозитория
cmake --build build  # компиляция
```

:::


## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешной сборки вы найдёте исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге.
При необходимости вы можете указать другой файл конфигурации в командной строке через параметр `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте ещё один терминал, перейдите в `ClickHouse/build/programs/` и выполните `./clickhouse client`.

Если в macOS или FreeBSD вы получаете сообщение `Connection refused`, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```


## Расширенные настройки {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вам не нужна функциональность, предоставляемая сторонними библиотеками, вы можете ещё больше ускорить процесс сборки:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае проблем вам придётся разбираться самостоятельно…

Rust требует подключения к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```


### Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить продакшн-версию бинарного файла ClickHouse, установленную в вашей системе, на скомпилированный бинарный файл ClickHouse.
Для этого установите ClickHouse на свою машину, следуя инструкциям на официальном сайте.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие — это симлинки на общий бинарный файл `clickhouse`.

Вы также можете запустить собранный вами бинарный файл ClickHouse с файлом конфигурации из пакета ClickHouse, установленного в вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```


### Сборка в любом дистрибутиве Linux {#building-on-any-linux}

Установите необходимые зависимости в дистрибутиве openSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите необходимые зависимости на Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```


### Сборка в Docker {#building-in-docker}

Вы можете запустить любую сборку локально в среде, аналогичной CI, используя:

```bash
python -m ci.praktika run "BUILD_JOB_NAME"
```

где BUILD&#95;JOB&#95;NAME — это имя задания (job) так, как оно указано в отчёте CI, например, &quot;Build (arm&#95;release)&quot;, &quot;Build (amd&#95;debug)&quot;.

Эта команда загружает соответствующий Docker-образ `clickhouse/binary-builder` со всеми необходимыми зависимостями
и запускает внутри него скрипт сборки: `./ci/jobs/build_clickhouse.py`.

Результат сборки будет помещён в `./ci/tmp/`.

Эта команда работает как на архитектуре AMD, так и на ARM и не требует никаких дополнительных зависимостей, кроме установленного Python с модулем `requests` и Docker.
