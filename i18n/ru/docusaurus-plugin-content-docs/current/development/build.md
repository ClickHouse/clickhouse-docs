---
description: 'Пошаговое руководство по сборке ClickHouse из исходного кода на Linux-системах'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
slug: /development/build
title: 'Как собрать ClickHouse на Linux'
doc_type: 'guide'
---



# Как собрать ClickHouse под Linux

:::info Вам не обязательно собирать ClickHouse самостоятельно!
Вы можете установить уже собранный ClickHouse, как описано в разделе [Quick Start](https://clickhouse.com/#quick-start).
:::

ClickHouse можно собрать на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)



## Предположения {#assumptions}

Данное руководство основано на Ubuntu Linux, но при соответствующих изменениях оно должно работать и на любом другом дистрибутиве Linux.
Минимально рекомендуемая версия Ubuntu для разработки — 24.04 LTS.

В руководстве предполагается, что у вас локально клонирован репозиторий ClickHouse со всеми подмодулями.



## Установка предварительных требований

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

ClickHouse при сборке использует CMake и Ninja.

При желании вы можете установить ccache, чтобы сборка повторно использовала уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Установите компилятор Clang

Чтобы установить Clang на Ubuntu/Debian, используйте скрипт автоматической установки LLVM с сайта [apt.llvm.org](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, доступны ли для установки какие-либо [предварительно собранные пакеты LLVM](https://releases.llvm.org/download.html).

По состоянию на март 2025 года требуется Clang 19 или новее.
GCC и другие компиляторы не поддерживаются.


## Установите компилятор Rust (необязательно) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью ClickHouse.
Если Rust не установлен, некоторые возможности ClickHouse не будут включены в сборку.
:::

Сначала выполните шаги из официальной [документации по Rust](https://www.rust-lang.org/tools/install), чтобы установить `rustup`.

Как и для зависимостей C++, ClickHouse использует vendoring, чтобы точно контролировать, что именно устанавливается, и избежать зависимости от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме release любая современная версия toolchain в rustup для Rust должна работать с этими зависимостями, если вы планируете включить санитайзеры, необходимо использовать версию, которая использует точно такую же `std`, как и та, что применяется в CI (для которой мы вендорим crates):



```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## Сборка ClickHouse

Рекомендуем создать отдельный каталог `build` внутри `ClickHouse`, в котором будут находиться все артефакты сборки:

```sh
mkdir build
cd build
```

Вы можете создавать несколько разных каталогов (например, `build_release`, `build_debug` и т.д.) для различных типов сборки.

Необязательно: если у вас установлено несколько версий компилятора, вы можете при необходимости указать, какой компилятор использовать.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для разработки рекомендуется использовать отладочные сборки.
По сравнению с релизными сборками, у них ниже уровень оптимизации компилятора (`-O`), что обеспечивает более удобную отладку.
Кроме того, внутренние исключения типа `LOGICAL_ERROR` приводят к немедленному падению вместо корректной обработки ошибки.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
Если вы хотите использовать отладчик, например gdb, добавьте `-D DEBUG_O_LEVEL="0"` к приведённой выше команде, чтобы отключить все оптимизации компилятора, которые могут мешать gdb просматривать и получать доступ к переменным.
:::

Запустите ninja для сборки:

```sh
ninja clickhouse
```

Если вы хотите собрать все бинарные артефакты (утилиты и тесты), запустите ninja без параметров:

```sh
ninja
```

Вы можете управлять количеством параллельных задач сборки с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращённые формы для приведённых выше команд:

```sh
cmake -S . -B build  # конфигурация сборки, запускается из корневого каталога репозитория
cmake --build build  # компиляция
```

:::


## Запуск исполняемого файла ClickHouse

После успешного завершения сборки вы найдете исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге.
Также вы можете указать файл конфигурации в командной строке с помощью параметра `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в `ClickHouse/build/programs/` и выполните `./clickhouse client`.

Если вы видите сообщение `Connection refused` на macOS или FreeBSD, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```


## Расширенные параметры

### Минимальная сборка

Если вам не нужна функциональность, предоставляемая сторонними библиотеками, вы можете ещё больше ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае проблем вам придётся разбираться самостоятельно ...

Для работы Rust требуется подключение к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Запуск исполняемого файла ClickHouse

Вы можете заменить продакшн-версию бинарного файла ClickHouse, установленную в вашей системе, скомпилированным бинарным файлом ClickHouse.
Для этого установите ClickHouse на свою машину, следуя инструкциям на официальном веб‑сайте.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие — это символьные ссылки на общий исполняемый файл `clickhouse`.

Вы также можете запустить собранный вами исполняемый файл ClickHouse с файлом конфигурации из пакета ClickHouse, установленного в вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### Сборка на любом дистрибутиве Linux

Установите необходимые компоненты в дистрибутиве openSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите необходимые пакеты в Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Сборка в Docker

Вы можете запустить любую сборку локально в среде, аналогичной CI, с помощью:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

где BUILD&#95;JOB&#95;NAME — это имя job&#39;а, отображаемое в отчёте CI, например: &quot;Build (arm&#95;release)&quot;, &quot;Build (amd&#95;debug)&quot;

Эта команда загружает соответствующий Docker-образ `clickhouse/binary-builder` со всеми необходимыми зависимостями
и запускает внутри него скрипт сборки: `./ci/jobs/build_clickhouse.py`

Результат сборки будет размещён в `./ci/tmp/`.

Команда работает как на архитектуре AMD, так и на ARM и не требует дополнительных зависимостей, кроме Docker.
