---
description: 'Руководство по сборке ClickHouse из исходного кода на системах macOS'
sidebar_label: 'Сборка на macOS для macOS'
sidebar_position: 15
slug: /development/build-osx
title: 'Сборка на macOS для macOS'
---


# Как собрать ClickHouse на macOS для macOS

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как описано в [Быстром старте](https://clickhouse.com/#quick-start).
:::

ClickHouse можно компилировать на macOS x86_64 (Intel) и arm64 (Apple Silicon), начиная с macOS 10.15 (Catalina) или выше.

В качестве компилятора поддерживается только Clang из homebrew.

## Установка предварительных требований {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

Затем установите [Homebrew](https://brew.sh/) и выполните

Затем выполните:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm
```

:::note
Apple по умолчанию использует файловую систему без учета регистра. Хотя это обычно не влияет на компиляцию (в частности, можно использовать scratch makes), это может запутать операции с файлами, такие как `git mv`.
Для серьезной разработки на macOS убедитесь, что исходный код хранится на дисковом томе с учетом регистра, например, ознакомьтесь с [этими инструкциями](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::

## Сборка ClickHouse {#build-clickhouse}

Для сборки необходимо использовать компилятор Clang из Homebrew:

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# Результирующий двоичный файл будет создан в: build/programs/clickhouse
```

## Замечания {#caveats}

Если вы собираетесь запускать `clickhouse-server`, убедитесь, что увеличили системную переменную `maxfiles`.

:::note
Вам нужно будет использовать sudo.
:::

Для этого создайте файл `/Library/LaunchDaemons/limit.maxfiles.plist` со следующим содержимым:

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

Установите правильные права доступа к файлу:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

Проверьте, правильный ли файл:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Чтобы проверить, работает ли это, используйте команды `ulimit -n` или `launchctl limit maxfiles`.
