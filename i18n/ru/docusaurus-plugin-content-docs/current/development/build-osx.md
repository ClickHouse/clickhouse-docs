---
slug: /development/build-osx
sidebar_position: 15
sidebar_label: Сборка на macOS для macOS
---


# Как собрать ClickHouse на macOS для macOS

:::info Вам не нужно собирать ClickHouse самостоятельно!
Вы можете установить предварительно собранный ClickHouse, как описано в [Быстрый старт](https://clickhouse.com/#quick-start).
:::

ClickHouse можно скомпилировать на macOS x86_64 (Intel) и arm64 (Apple Silicon) с использованием macOS 10.15 (Catalina) или выше.

В качестве компилятора поддерживается только Clang из homebrew.

## Установка необходимых компонентов {#install-prerequisites}

Сначала установите [Homebrew](https://brew.sh/).

Затем выполните:

``` bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm
```

:::note
Apple использует файловую систему без учета регистра по умолчанию. Хотя это обычно не влияет на компиляцию (особенно работают сборки scratch), это может запутать операции с файлами, такие как `git mv`.
Для серьезной разработки на macOS убедитесь, что исходный код хранится на дисковом носителе с учетом регистра, например, ознакомьтесь с [этими инструкциями](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830).
:::

## Сборка ClickHouse {#build-clickhouse}

Для сборки вам необходимо использовать Clang компилятор от Homebrew:

``` bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# Полученный бинарный файл будет создан в: build/programs/clickhouse
```

## Предостережения {#caveats}

Если вы планируете запускать `clickhouse-server`, убедитесь, что вы увеличили переменную `maxfiles` системы.

:::note
Вам потребуется использовать sudo.
:::

Для этого создайте файл `/Library/LaunchDaemons/limit.maxfiles.plist` с следующим содержимым:

``` xml
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

Убедитесь, что у файла правильные права:

``` bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

Проверьте, правильно ли настроен файл:

``` bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

Загрузите файл (или перезагрузите):

``` bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Чтобы проверить, работает ли это, используйте команды `ulimit -n` или `launchctl limit maxfiles`.
