---
description: 'Руководство по сборке ClickHouse из源 на системах macOS'
sidebar_label: 'Сборка на macOS для macOS'
sidebar_position: 15
slug: /development/build-osx
title: 'Сборка на macOS для macOS'
---


# Как собрать ClickHouse на macOS для macOS

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить предустановленный ClickHouse, как описано в [Quick Start](https://clickhouse.com/#quick-start).
:::

ClickHouse можно скомпилировать на macOS x86_64 (Intel) и arm64 (Apple Silicon) начиная с macOS 10.15 (Catalina) или выше.

В качестве компилятора поддерживается только Clang из homebrew.

## Установка необходимых компонентов {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по требованиям](developer-instruction.md).

Затем установите [Homebrew](https://brew.sh/) и выполните

Затем выполните:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm bash
```

:::note
Apple использует файловую систему без учета регистра по умолчанию. Хотя это обычно не влияет на сборку (особенно работают командные сборки), это может вызвать путаницу в операциях с файлами, таких как `git mv`.
Для серьезной разработки на macOS убедитесь, что исходный код хранится на диске с учетом регистра, например, смотрите [эти инструкции](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::

## Сборка ClickHouse {#build-clickhouse}

Для сборки необходимо использовать компилятор Clang от Homebrew:

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# Получившийся бинарный файл будет создан по адресу: build/programs/clickhouse
```

## Замечания {#caveats}

Если вы собираетесь запускать `clickhouse-server`, убедитесь, что вы увеличили переменную `maxfiles` в системе.

:::note
Вам понадобится использовать sudo.
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

Дайте файлу правильные права:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

Проверьте корректность файла:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Чтобы проверить, работает ли это, используйте команды `ulimit -n` или `launchctl limit maxfiles`.
