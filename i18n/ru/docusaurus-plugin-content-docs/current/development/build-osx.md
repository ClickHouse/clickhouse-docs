---
description: 'Руководство по сборке ClickHouse из исходных кодов в системах macOS'
sidebar_label: 'Сборка на macOS для macOS'
sidebar_position: 15
slug: /development/build-osx
title: 'Сборка на macOS для macOS'
keywords: ['MacOS', 'Mac', 'build']
doc_type: 'guide'
---



# Как собрать ClickHouse на macOS для macOS {#how-to-build-clickhouse-on-macos-for-macos}

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как описано в разделе [Quick Start](https://clickhouse.com/#quick-start).
:::

ClickHouse можно скомпилировать на macOS x86_64 (Intel) и arm64 (Apple Silicon) под управлением macOS 10.15 (Catalina) или более поздней версии.

В качестве компилятора поддерживается только Clang из Homebrew.



## Установка необходимых компонентов {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

Затем установите [Homebrew](https://brew.sh/) и запустите

Затем выполните:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple по умолчанию использует файловую систему, нечувствительную к регистру. Хотя это обычно не влияет на компиляцию (особенно на разовые сборки через `make`), тем не менее это может приводить к некорректной работе таких операций с файлами, как `git mv`.
Для серьёзной разработки на macOS убедитесь, что исходный код хранится на томе диска, чувствительном к регистру. См., например, [эти инструкции](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::


## Сборка ClickHouse {#build-clickhouse}

Для сборки необходимо использовать компилятор Clang из Homebrew:



```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# Итоговый исполняемый файл будет создан по пути: build/programs/clickhouse {#the-resulting-binary-will-be-created-at-buildprogramsclickhouse}
```

:::note
Если при линковке вы сталкиваетесь с ошибками вида `ld: archive member '/' not a mach-o file in ...`, вам может понадобиться
использовать llvm-ar, указав флаг `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar`.
:::


## Особенности {#caveats}

Если вы планируете запускать `clickhouse-server`, убедитесь, что значение системной переменной `maxfiles` увеличено.

:::note
Для этого потребуется sudo.
:::

Создайте файл `/Library/LaunchDaemons/limit.maxfiles.plist` со следующим содержимым:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>524288</string>
      <string>524288</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

Установите для файла правильные права доступа:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

Убедитесь, что файл корректен:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите систему):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Чтобы проверить, работает ли всё, выполните команду `ulimit -n` или `launchctl limit maxfiles`.
