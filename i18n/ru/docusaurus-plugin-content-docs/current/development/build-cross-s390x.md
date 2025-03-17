---
slug: /development/build-cross-s390x
sidebar_position: 30
sidebar_label: Сборка на Linux для s390x (zLinux)
---


# Сборка на Linux для s390x (zLinux)

ClickHouse имеет экспериментальную поддержку для s390x.

## Сборка ClickHouse для s390x {#building-clickhouse-for-s390x}

s390x имеет две опции сборки, связанные с OpenSSL:
- По умолчанию OpenSSL собирается для s390x как динамическая библиотека. Это отличается от всех остальных платформ, где OpenSSL собирается как статическая библиотека.
- Чтобы собрать OpenSSL как статическую библиотеку, независимо от этого, передайте `-DENABLE_OPENSSL_DYNAMIC=0` в CMake.

Эти инструкции предполагают, что хост-машина является x86_64 и имеет все инструменты, необходимые для сборки на месте, согласно [инструкциям по сборке](../development/build.md). Также предполагается, что хост — это Ubuntu 22.04, но следующие инструкции также должны работать на Ubuntu 20.04.

В дополнение к установке инструментов, используемых для локальной сборки, необходимо установить следующие дополнительные пакеты:

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

Если вы хотите компилировать код Rust, установите целевую платформу кросс-компиляции для s390x:

```bash
rustup target add s390x-unknown-linux-gnu
```

Сборка для s390x использует компоновщик mold, скачайте его с https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gz
и поместите его в ваш `$PATH`.

Чтобы собрать для s390x:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```

## Запуск {#running}

После сборки бинарный файл можно запустить, например:

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```

## Отладка {#debugging}

Установите LLDB:

```bash
apt-get install lldb-15
```

Чтобы отладить исполняемый файл s390x, запустите ClickHouse, используя QEMU в режиме отладки:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

В другой оболочке запустите LLDB и присоединитесь, заменив `<Clickhouse Parent Directory>` и `<build directory>` на соответствующие значения вашего окружения.

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

- Расширение [CodeLLDB](https://github.com/vadimcn/vscode-lldb) требуется для визуальной отладки.
- Расширение [Command Variable](https://github.com/rioj7/command-variable) может помочь с динамическими запусками, если используется [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md).
- Убедитесь, что вы установили путь к вашей установке LLVM, например, `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`.
- Убедитесь, что вы запускаете исполняемый файл ClickHouse в режиме отладки перед запуском. (Также можно создать `preLaunchTask`, который автоматизирует это)

### Примеры конфигураций {#example-configurations}
#### cmake-variants.yaml {#cmake-variantsyaml}
```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: Выводить отладочную информацию
      buildType: Debug
    release:
      short: Release
      long: Оптимизировать сгенерированный код
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: Релиз с отладочной информацией
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: Минимальный размер релиза
      buildType: MinSizeRel

toolchain:
  default: default
  description: Выберите инструментальную цепочку
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
            "preLaunchTask": "Запустить ClickHouse"
        }
    ]
}
```

#### settings.json {#settingsjson}
Это также поместит разные сборки в разные подпапки папки `build`.
```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh {#run-debugsh}
```sh
#! /bin/sh
echo 'Запуск сессии отладки'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json {#tasksjson}
Определяет задачу для запуска скомпилированного исполняемого файла в режиме `server` в папке `tmp`, рядом с бинарными файлами, с конфигурацией из `programs/server/config.xml`.
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
                        "beginsPattern": "^Запуск сессии отладки",
                        "endsPattern": ".*"
                    }
                }
            ]
        }
    ]
}
```
