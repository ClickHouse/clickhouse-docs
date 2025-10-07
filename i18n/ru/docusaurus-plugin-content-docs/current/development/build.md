---
slug: '/development/build'
sidebar_label: 'Сборка на Linux'
sidebar_position: 10
description: 'Пошаговое руководство по построению ClickHouse на системе Linux из'
title: 'Как собрать ClickHouse на Linux'
doc_type: guide
---
# Как собрать ClickHouse на Linux

:::info Вам не обязательно собирать ClickHouse самостоятельно!
Вы можете установить предсобранный ClickHouse, как описано в [Быстром начале](https://clickhouse.com/#quick-start).
:::

ClickHouse можно собрать на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)

## Предположения {#assumptions}

Следующий учебник основан на Ubuntu Linux, но он также должен работать на любой другой дистрибутив Linux с соответствующими изменениями.
Минимально рекомендованная версия Ubuntu для разработки — 24.04 LTS.

Урок предполагает, что у вас есть локально загруженный репозиторий ClickHouse и все подмодули.

## Установите необходимые пакеты {#install-prerequisites}

Во-первых, смотрите общую [документацию по требованиям](developer-instruction.md).

ClickHouse использует CMake и Ninja для сборки.

Вы можете дополнительно установить ccache, чтобы сборка могла повторно использовать уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Установите компилятор Clang {#install-the-clang-compiler}

Чтобы установить Clang на Ubuntu/Debian, используйте автоматический скрипт установки LLVM из [здесь](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, можете ли вы установить любые из [предсобранных пакетов](https://releases.llvm.org/download.html) LLVM.

С марта 2025 года требуется Clang версии 19 или выше.
GCC или другие компиляторы не поддерживаются.

## Установите компилятор Rust (по желанию) {#install-the-rust-compiler-optional}

:::note
Rust является необязательной зависимостью ClickHouse.
Если Rust не установлен, некоторые функции ClickHouse будут пропущены при компиляции.
:::

Во-первых, выполните шаги в официальной [документации по Rust](https://www.rust-lang.org/tools/install), чтобы установить `rustup`.

Как и с зависимостями C++, ClickHouse использует вендоринг для точного контроля того, что установлено, и избегания зависимости от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме релиза любая современная версия rustup должна работать с этими зависимостями, если вы планируете включить санитайзеры, вам необходимо использовать версию, которая соответствует точно такому же `std`, как та, которая используется в CI (для которой мы вендорим трейты):

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## Соберите ClickHouse {#build-clickhouse}

Мы рекомендуем создать отдельный каталог `build` внутри `ClickHouse`, который будет содержать все артефакты сборки:

```sh
mkdir build
cd build
```

Вы можете иметь несколько различных каталогов (например, `build_release`, `build_debug` и т. д.) для различных типов сборки.

По желанию: если у вас установлено несколько версий компилятора, вы можете указать точный компилятор для использования.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для разработки рекомендуется использовать отладочные сборки.
По сравнению с релизными сборками, они имеют более низкий уровень оптимизации компилятора (`-O`), что способствует лучшему опыту отладки.
Кроме того, внутренние исключения типа `LOGICAL_ERROR` приводят к немедленному сбою вместо корректного завершения.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
Если вы хотите использовать отладчик, такой как gdb, добавьте `-D DEBUG_O_LEVEL="0"` к вышеуказанной команде, чтобы удалить все оптимизации компилятора, которые могут мешать gdb видеть/доступ к переменным.
:::

Запустите ninja для сборки:

```sh
ninja clickhouse
```

Если вы хотите собрать все бинарные файлы (утилиты и тесты), запустите ninja без параметров:

```sh
ninja
```

Вы можете контролировать количество параллельных задач сборки с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет ярлыки для вышеуказанных команд:

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```
:::

## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешной сборки вы найдете исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге.
Вы также можете указать файл конфигурации в командной строке с помощью `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в `ClickHouse/build/programs/` и запустите `./clickhouse client`.

Если вы получите сообщение `Connection refused` на macOS или FreeBSD, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```

## Расширенные параметры {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вы не нуждаетесь в функциональности, предоставляемой сторонними библиотеками, вы можете еще больше ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае возникновения проблем вы остаетесь один на один со своими проблемами...

Rust требует подключения к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить производственную версию бинарного файла ClickHouse, установленного в вашей системе, на собранный бинарный файл ClickHouse.
Для этого установите ClickHouse на своем компьютере, следуя инструкциям с официального сайта.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие являются символическими ссылками на общий бинарный файл `clickhouse`.

Вы также можете запустить свой собранный бинарный файл ClickHouse с файлом конфигурации из установленного на вашей системе пакета ClickHouse:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### Сборка на любом Linux {#building-on-any-linux}

Установите необходимые пакеты на OpenSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите необходимые пакеты на Fedora Rawhide:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Сборка в Docker {#building-in-docker}

Вы можете запустить любую сборку локально в окружении, похожем на CI, используя:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
где BUILD_JOB_NAME — это название задачи, как показано в отчете CI, например, "Build (arm_release)", "Build (amd_debug)"

Эта команда загружает соответствующий образ Docker `clickhouse/binary-builder` со всеми необходимыми зависимостями,
и запускает скрипт сборки внутри него: `./ci/jobs/build_clickhouse.py`

Вывод сборки будет помещен в `./ci/tmp/`.

Он работает как на архитектурах AMD, так и на ARM и не требует дополнительных зависимостей, кроме Docker.