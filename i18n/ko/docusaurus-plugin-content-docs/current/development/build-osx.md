---
description: 'macOS 시스템에서 소스 코드에서 ClickHouse를 빌드하는 가이드'
sidebar_label: 'macOS에서 macOS용 빌드'
sidebar_position: 15
slug: /development/build-osx
title: 'macOS에서 macOS용 빌드'
keywords: ['MacOS', 'Mac', 'build']
doc_type: 'guide'
---



# macOS에서 macOS용 ClickHouse를 빌드하는 방법 \{#how-to-build-clickhouse-on-macos-for-macos\}

:::info ClickHouse를 직접 빌드할 필요가 없습니다!
[Quick Start](https://clickhouse.com/#quick-start)에 설명된 대로 미리 빌드된 ClickHouse를 설치할 수 있습니다.
:::

ClickHouse는 macOS 10.15(Catalina) 이상에서 macOS x86_64(Intel) 및 arm64(Apple Silicon) 아키텍처용으로 컴파일할 수 있습니다.

컴파일러로는 Homebrew에서 제공하는 Clang만 지원됩니다.



## 필수 구성 요소 설치 \{#install-prerequisites\}

먼저 공통 [필수 구성 요소 문서](developer-instruction.md)를 확인합니다.

다음으로 [Homebrew](https://brew.sh/)를 설치한 후 다음 명령을 실행합니다.

그런 다음 다음 명령을 실행합니다:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple은 기본적으로 대소문자를 구분하지 않는 파일 시스템을 사용합니다. 이는 보통 컴파일에는 영향을 주지 않지만(특히 scratch make 작업은 정상적으로 동작합니다), `git mv`와 같은 파일 작업에서 문제를 일으킬 수 있습니다.
macOS에서 본격적으로 개발하려면 소스 코드를 반드시 대소문자를 구분하는 디스크 볼륨에 저장하십시오. 예를 들어 [이 안내](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)를 참고할 수 있습니다.
:::


## ClickHouse 빌드하기 \{#build-clickhouse\}

빌드하려면 Homebrew의 Clang 컴파일러를 사용해야 합니다.



```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# The resulting binary will be created at: build/programs/clickhouse
```

:::note
링킹 과정에서 `ld: archive member '/' not a mach-o file in ...` 오류가 발생하는 경우, 플래그 `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar`를 설정하여 llvm-ar을 사용해야 할 수도 있습니다.
:::


## 주의사항 \{#caveats\}

`clickhouse-server`를 실행할 계획이라면 시스템의 `maxfiles` 변수 값을 늘려야 합니다.

:::note
`sudo` 사용이 필요합니다.
:::

이를 위해 다음 내용을 포함하는 `/Library/LaunchDaemons/limit.maxfiles.plist` 파일을 생성하십시오.

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

해당 파일에 적절한 권한을 설정하십시오:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

파일이 올바른지 확인하십시오:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

파일을 로드하거나 시스템을 재부팅하십시오:

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

정상적으로 동작하는지 확인하려면 `ulimit -n` 또는 `launchctl limit maxfiles` 명령을 실행하십시오.
