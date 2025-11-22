---
description: 'Руководство по сборке ClickHouse из исходного кода на системах macOS'
sidebar_label: 'Сборка на macOS для macOS'
sidebar_position: 15
slug: /development/build-osx
title: 'Сборка на macOS для macOS'
keywords: ['MacOS', 'Mac', 'сборка']
doc_type: 'guide'
---



# Как собрать ClickHouse на macOS для macOS

:::info Вам не обязательно собирать ClickHouse самому!
Вы можете установить уже собранный ClickHouse, как описано в разделе [Быстрый старт](https://clickhouse.com/#quick-start).
:::

ClickHouse можно скомпилировать на архитектурах x86_64 (Intel) и arm64 (Apple Silicon) под управлением macOS 10.15 (Catalina) или выше.

В качестве компилятора поддерживается только Clang из Homebrew.



## Установка предварительных требований {#install-prerequisites}

Сначала ознакомьтесь с общей [документацией по предварительным требованиям](developer-instruction.md).

Затем установите [Homebrew](https://brew.sh/) и выполните команду

Затем выполните:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple по умолчанию использует файловую систему, не учитывающую регистр символов. Хотя обычно это не влияет на компиляцию (особенно сборка с нуля будет работать), это может вызвать проблемы при выполнении файловых операций, таких как `git mv`.
Для серьезной разработки на macOS убедитесь, что исходный код хранится на томе с файловой системой, учитывающей регистр символов, например, см. [эти инструкции](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::


## Сборка ClickHouse {#build-clickhouse}

Для сборки необходимо использовать компилятор Clang из Homebrew:


```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# Итоговый исполняемый файл будет создан по пути: build/programs/clickhouse
```

:::note
Если при линковке вы сталкиваетесь с ошибками `ld: archive member '/' not a mach-o file in ...`, вам может понадобиться
использовать llvm-ar, указав флаг `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar`.
:::


## Предостережения {#caveats}

Если вы планируете запускать `clickhouse-server`, необходимо увеличить системную переменную `maxfiles`.

:::note
Для этого потребуются права sudo.
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

Установите корректные права доступа для файла:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

Проверьте корректность файла:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите систему):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Для проверки используйте команды `ulimit -n` или `launchctl limit maxfiles`.
