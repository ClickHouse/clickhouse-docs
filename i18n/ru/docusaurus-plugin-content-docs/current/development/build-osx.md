---
slug: '/development/build-osx'
sidebar_label: 'Сборка на macOS для macOS'
sidebar_position: 15
description: 'В macOS системе из исходного кода построение ClickHouse с указаниями'
title: 'Сборка на macOS для macOS'
doc_type: guide
---
# Как собрать ClickHouse на macOS для macOS

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить предсобранный ClickHouse, как описано в [Быстром старт](https://clickhouse.com/#quick-start).
:::

ClickHouse можно скомпилировать на macOS x86_64 (Intel) и arm64 (Apple Silicon), начиная с macOS 10.15 (Catalina) или выше.

В качестве компилятора поддерживается только Clang из homebrew.

## Установите предварительные требования {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

Затем установите [Homebrew](https://brew.sh/) и выполните

Затем выполните:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple по умолчанию использует файловую систему без учета регистра. Хотя это обычно не влияет на компиляцию (особенно работают 'scratch makes'), это может запутать такие операции с файлами, как `git mv`.
Для серьезной разработки на macOS убедитесь, что исходный код хранится на регистрозависимом дисковом объеме, например, смотрите [эти инструкции](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::

## Сборка ClickHouse {#build-clickhouse}

Для сборки необходимо использовать компилятор Clang из Homebrew:

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# The resulting binary will be created at: build/programs/clickhouse
```

:::note
Если вы сталкиваетесь с ошибками `ld: archive member '/' not a mach-o file in ...` во время линковки, возможно, вам нужно
использовать llvm-ar, установив флаг `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar`.
:::

## Предостережения {#caveats}

Если вы намерены запускать `clickhouse-server`, убедитесь, что увеличили системную переменную `maxfiles`.

:::note
Вам потребуется использовать sudo.
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

Проверьте, что файл корректен:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Чтобы проверить, работает ли это, используйте команды `ulimit -n` или `launchctl limit maxfiles`.