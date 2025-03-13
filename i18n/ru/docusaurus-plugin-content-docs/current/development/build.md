---
slug: /development/build
sidebar_position: 10
sidebar_label: Сборка на Linux
---


# Как собрать ClickHouse на Linux

:::info Вам не обязательно собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как описано в [Быстром старт](https://clickhouse.com/#quick-start).
:::

ClickHouse может быть собран на следующих платформах:

- x86_64
- AArch64
- PowerPC 64 LE (экспериментально)
- s390/x (экспериментально)
- RISC-V 64 (экспериментально)

## Предположения {#assumptions}

Следующий учебник основан на Ubuntu Linux, но также должен работать на любой другой дистрибутиве Linux с соответствующими изменениями.
Минимальная рекомендуемая версия Ubuntu для разработки — 24.04 LTS.

Данный учебник предполагает, что у вас уже локально клонирована репозитория ClickHouse и все подмодули.

## УстановкаPrerequisites {#install-prerequisites}

ClickHouse использует CMake и Ninja для сборки.

Вы можете дополнительно установить ccache, чтобы дать сборке возможность повторно использовать уже скомпилированные объектные файлы.

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Установка компилятора Clang {#install-the-clang-compiler}

Чтобы установить Clang на Ubuntu/Debian, используйте автоматический установочный скрипт LLVM из [здесь](https://apt.llvm.org/).

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

Для других дистрибутивов Linux проверьте, можете ли вы установить какие-либо из [предварительно собранных пакетов](https://releases.llvm.org/download.html) от LLVM.

На март 2025 года требуется Clang 19 или выше.
GCC и другие компиляторы не поддерживаются.

## Установка компилятора Rust (опционально) {#install-the-rust-compiler-optional}

:::note
Rust является опциональной зависимостью ClickHouse.
Если Rust не установлен, некоторые возможности ClickHouse будут пропущены при компиляции.
:::

Сначала выполните шаги в официальной [документации Rust](https://www.rust-lang.org/tools/install) для установки `rustup`.

Как и с зависимостями C++, ClickHouse использует вендоринг, чтобы контролировать точно то, что установлено, и избежать зависимости от сторонних сервисов (таких как реестр `crates.io`).

Хотя в режиме релиза любая современная версия инструментальной цепочки rustup должна работать с этими зависимостями, если вы планируете включить санитайзеры, вам необходимо использовать версию, которая совпадает с той же `std`, что и в CI (для чего мы вендерим ящики):

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

Вы можете создать несколько различных каталогов (например, `build_release`, `build_debug` и др.) для разных типов сборок.

Опционально: если у вас установлено несколько версий компилятора, вы можете указать точный компилятор, который хотите использовать.

```sh
export CC=clang-19
export CXX=clang++-19
```

Для целей разработки рекомендуется использовать отладочные сборки.
По сравнению с релизными сборками они имеют более низкий уровень оптимизации компилятора (`-O`), что обеспечивает лучший опыт отладки.
Также внутренние исключения типа `LOGICAL_ERROR` вызывают немедленный сбой, вместо того чтобы завершаться корректно.

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

Вы можете контролировать количество параллельных сборок с помощью параметра `-j`:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake предоставляет сокращения для вышеупомянутых команд:

```sh
cmake -S . -B build  # конфигурировать сборку, запускать из корневого каталога репозитория
cmake --build build  # компиляция
```
:::

## Запуск исполняемого файла ClickHouse {#running-the-clickhouse-executable}

После успешной сборки вы найдете исполняемый файл в `ClickHouse/<build_dir>/programs/`:

Сервер ClickHouse пытается найти файл конфигурации `config.xml` в текущем каталоге.
Вы также можете указать файл конфигурации в командной строке с помощью `-C`.

Чтобы подключиться к серверу ClickHouse с помощью `clickhouse-client`, откройте другой терминал, перейдите в `ClickHouse/build/programs/` и запустите `./clickhouse client`.

Если вы получаете сообщение `Connection refused` на macOS или FreeBSD, попробуйте указать адрес хоста 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```

## Расширенные параметры {#advanced-options}

### Минимальная сборка {#minimal-build}

Если вам не нужна функциональность, предоставляемая сторонними библиотеками, вы можете ускорить сборку:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

В случае проблем, вы будете предоставлены сами себе...

Rust требует подключение к интернету. Чтобы отключить поддержку Rust:

```sh
cmake -DENABLE_RUST=OFF
```

### Замена исполняемого файла ClickHouse {#running-the-clickhouse-executable-1}

Вы можете заменить продукционную версию бинарного файла ClickHouse, установленного в вашей системе, на собранный бинарный файл ClickHouse.
Для этого установите ClickHouse на своем компьютере, следуя инструкциям с официального сайта.
Затем выполните:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

Обратите внимание, что `clickhouse-client`, `clickhouse-server` и другие являются символьными ссылками на общий бинарный файл `clickhouse`.

Вы также можете запустить свой собственный собранный бинарный файл ClickHouse с файлом конфигурации из пакета ClickHouse, установленного на вашей системе:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
````

### Сборка на любом Linux {#building-on-any-linux}

Установите зависимости на OpenSUSE Tumbleweed:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Установите зависимости на Fedora Rawhide:

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
Существует скрипт `docker/packager/packager`, чтобы облегчить использование изображения:

```bash

# определите каталог для выходных артефактов
output_dir="build_results"

# самая простая сборка
./docker/packager/packager --package-type=binary --output-dir "$output_dir"

# сборка debian пакетов
./docker/packager/packager --package-type=deb --output-dir "$output_dir"

# по умолчанию debian пакеты используют тонкую LTO, поэтому мы можем переопределить это, чтобы ускорить сборку
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
```
