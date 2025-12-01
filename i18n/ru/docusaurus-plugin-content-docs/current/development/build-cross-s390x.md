---
description: 'Руководство по сборке ClickHouse из исходного кода для архитектуры s390x'
sidebar_label: 'Сборка на Linux для s390x (zLinux)'
sidebar_position: 30
slug: /development/build-cross-s390x
title: 'Сборка на Linux для s390x (zLinux)'
doc_type: 'guide'
---

# Сборка в Linux для s390x (zLinux) {#build-on-linux-for-s390x-zlinux}

ClickHouse в экспериментальном режиме поддерживает архитектуру s390x.

## Сборка ClickHouse для s390x {#building-clickhouse-for-s390x}

На платформе s390x, как и на других платформах, OpenSSL собирается как статическая библиотека. Если вы хотите собрать с динамическим OpenSSL, необходимо передать `-DENABLE_OPENSSL_DYNAMIC=1` в CMake.

В этих инструкциях предполагается, что хостовая система — Linux x86&#95;64/ARM и на ней установлены все инструменты, необходимые для нативной сборки в соответствии с [инструкцией по сборке](../development/build.md). Также предполагается, что хост — Ubuntu 22.04, но приведённые ниже инструкции также должны работать на Ubuntu 20.04.

Помимо установки инструментов, используемых для нативной сборки, необходимо установить следующие дополнительные пакеты:

```bash
apt-get mold
rustup target add s390x-unknown-linux-gnu
```

Сборка для s390x:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```


## Запуск {#running}

Для эмуляции вам понадобится статический бинарник qemu-user для s390x. В Ubuntu его можно установить с помощью:

```bash
apt-get install binfmt-support binutils-s390x-linux-gnu qemu-user-static
```

После сборки бинарный файл можно запустить, например, так:

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./programs/clickhouse local --query "Select 2"
2
```


## Отладка {#debugging}

Установите LLDB:

```bash
apt-get install lldb-21
```

Чтобы отладить исполняемый файл s390x, запустите ClickHouse с помощью QEMU в режиме отладки:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

В другом терминале запустите LLDB и присоединитесь к процессу, заменив `<Clickhouse Parent Directory>` и `<build directory>` на значения, соответствующие вашей среде.

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
- Расширение [Command Variable](https://github.com/rioj7/command-variable) может упростить динамический запуск при использовании [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md).
- Убедитесь, что бекенд настроен на вашу установку LLVM, например: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-21.so"`.
- Перед запуском визуальной отладки предварительно запустите исполняемый файл clickhouse в режиме отладки. (Также можно создать задачу `preLaunchTask`, которая автоматизирует это.)

### Примеры конфигураций {#example-configurations}

#### cmake-variants.yaml {#cmake-variantsyaml}

```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: Включить отладочную информацию
      buildType: Debug
    release:
      short: Release
      long: Оптимизировать генерируемый код
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: Релизная сборка с отладочной информацией
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: Релизная сборка минимального размера
      buildType: MinSizeRel

toolchain:
  default: default
  description: Выберите набор инструментов
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
            "targetCreateCommands": ["target create ${command:cmake.launchTargetPath}"],
            "processCreateCommands": ["gdb-remote 2159"],
            "preLaunchTask": "Запуск ClickHouse"
        }
    ]
}
```


#### settings.json {#settingsjson}

Это также поместит разные сборки в разные подпапки в каталоге `build`.

```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-21.so"
}
```


#### run-debug.sh {#run-debugsh}

```sh
#! /bin/sh
echo 'Запуск сеанса отладчика'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```


#### tasks.json {#tasksjson}

Определяет задачу для запуска скомпилированного исполняемого файла в режиме `server` в подкаталоге `tmp` рядом с бинарными файлами, с использованием конфигурации из файла `programs/server/config.xml`.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Запустить ClickHouse",
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
                        "beginsPattern": "^Начало сеанса отладки",
                        "endsPattern": ".*"
                    }
                }
            ]
        }
    ]
}
```
