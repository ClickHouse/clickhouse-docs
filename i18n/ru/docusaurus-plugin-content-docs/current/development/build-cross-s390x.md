---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры s390x'
sidebar_label: 'Сборка в Linux для s390x (zLinux)'
sidebar_position: 30
slug: /development/build-cross-s390x
title: 'Сборка в Linux для s390x (zLinux)'
doc_type: 'guide'
---



# Сборка на Linux для s390x (zLinux)

ClickHouse в экспериментальном режиме поддерживает архитектуру s390x.



## Building ClickHouse for s390x {#building-clickhouse-for-s390x}

Для s390x доступны два варианта сборки, связанных с OpenSSL:

- По умолчанию OpenSSL собирается на s390x как динамическая библиотека. Это отличается от всех остальных платформ, где OpenSSL собирается как статическая библиотека.
- Чтобы в любом случае собрать OpenSSL как статическую библиотеку, передайте параметр `-DENABLE_OPENSSL_DYNAMIC=0` в CMake.

Данные инструкции предполагают, что хост-машина имеет архитектуру x86_64 и содержит все инструменты, необходимые для нативной сборки согласно [инструкциям по сборке](../development/build.md). Также предполагается, что на хосте установлена Ubuntu 22.04, однако приведённые инструкции должны работать и на Ubuntu 20.04.

Помимо установки инструментов для нативной сборки, необходимо установить следующие дополнительные пакеты:

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

Если требуется выполнить кросс-компиляцию кода на Rust, установите целевую платформу кросс-компиляции Rust для s390x:

```bash
rustup target add s390x-unknown-linux-gnu
```

Сборка для s390x использует компоновщик mold. Загрузите его по адресу https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gz
и поместите в каталог из переменной `$PATH`.

Для сборки под s390x выполните:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```


## Запуск {#running}

После сборки исполняемый файл можно запустить следующим образом:

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```


## Отладка {#debugging}

Установите LLDB:

```bash
apt-get install lldb-15
```

Для отладки исполняемого файла s390x запустите ClickHouse с помощью QEMU в режиме отладки:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

В другом терминале запустите LLDB и подключитесь к процессу, заменив `<Clickhouse Parent Directory>` и `<build directory>` на значения, соответствующие вашему окружению.

```bash
lldb-15
(lldb) target create ./clickhouse
Current executable set to '/<Clickhouse Parent Directory>/ClickHouse/<build directory>/programs/clickhouse' (s390x).
(lldb) settings set target.source-map <build directory> /<Clickhouse Parent Directory>/ClickHouse
(lldb) gdb-remote 31338
Process 1 stopped
* thread #1, stop reason = signal SIGTRAP
    frame #0: 0x0000004020e74cd0
->  0x4020e74cd0: lgr    %r2, %r15
    0x4020e74cd4: aghi   %r15, -160
    0x4020e74cd8: xc     0(8,%r15), 0(%r15)
    0x4020e74cde: brasl  %r14, 275429939040
(lldb) b main
Breakpoint 1: 9 locations.
(lldb) c
Process 1 resuming
Process 1 stopped
* thread #1, stop reason = breakpoint 1.1
    frame #0: 0x0000004005cd9fc0 clickhouse`main(argc_=1, argv_=0x0000004020e594a8) at main.cpp:450:17
   447  #if !defined(FUZZING_MODE)
   448  int main(int argc_, char ** argv_)
   449  {
-> 450      inside_main = true;
   451      SCOPE_EXIT({ inside_main = false; });
   452
   453      /// PHDR cache is required for query profiler to work reliably
```


## Интеграция с Visual Studio Code {#visual-studio-code-integration}

- Для визуальной отладки требуется расширение [CodeLLDB](https://github.com/vadimcn/vscode-lldb).
- Расширение [Command Variable](https://github.com/rioj7/command-variable) может помочь с динамическими запусками при использовании [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md).
- Убедитесь, что бэкенд указывает на вашу установку LLVM, например: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`
- Убедитесь, что исполняемый файл ClickHouse запущен в режиме отладки перед запуском. (Также можно создать `preLaunchTask`, который автоматизирует этот процесс)

### Примеры конфигураций {#example-configurations}

#### cmake-variants.yaml {#cmake-variantsyaml}

```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: Генерация отладочной информации
      buildType: Debug
    release:
      short: Release
      long: Оптимизация сгенерированного кода
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: Release с отладочной информацией
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: Release с минимальным размером
      buildType: MinSizeRel

toolchain:
  default: default
  description: Выбор набора инструментов
  choices:
    default:
      short: x86_64
      long: x86_64
    s390x:
      short: s390x
      long: s390x
      settings:
        CMAKE_TOOLCHAIN_FILE: cmake/linux/toolchain-s390x.cmake
```

#### launch.json {#launchjson}

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "custom",
      "name": "(lldb) Запуск s390x с qemu",
      "targetCreateCommands": [
        "target create ${command:cmake.launchTargetPath}"
      ],
      "processCreateCommands": ["gdb-remote 2159"],
      "preLaunchTask": "Run ClickHouse"
    }
  ]
}
```

#### settings.json {#settingsjson}

Это также разместит различные сборки в разных подпапках папки `build`.

```json
{
  "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
  "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh {#run-debugsh}

```sh
#! /bin/sh
echo 'Запуск сеанса отладки'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json {#tasksjson}

Определяет задачу для запуска скомпилированного исполняемого файла в режиме `server` в папке `tmp` рядом с бинарными файлами, с конфигурацией из `programs/server/config.xml`.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Запуск ClickHouse",
      "type": "shell",
      "isBackground": true,
      "command": "${workspaceFolder}/.vscode/run-debug.sh",
      "args": [
        "${command:cmake.launchTargetDirectory}/tmp",
        "${command:cmake.launchTargetPath}",
        "server",
        "--config-file=${workspaceFolder}/programs/server/config.xml"
      ],
      "problemMatcher": [
        {
          "pattern": [
            {
              "regexp": ".",
              "file": 1,
              "location": 2,
              "message": 3
            }
          ],
          "background": {
            "activeOnStart": true,
            "beginsPattern": "^Запуск сеанса отладки",
            "endsPattern": ".*"
          }
        }
      ]
    }
  ]
}
```
