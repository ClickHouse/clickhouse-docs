---
description: 'Linux에서 macOS 시스템용 ClickHouse를 크로스 컴파일하는 가이드'
sidebar_label: 'Linux에서 macOS용 빌드'
sidebar_position: 20
slug: /development/build-cross-osx
title: 'Linux에서 macOS용 빌드'
doc_type: 'guide'
---

# Linux에서 macOS용 ClickHouse 빌드 방법 \{#how-to-build-clickhouse-on-linux-for-macos\}

Linux 머신이 있고, 이 머신을 사용해 OS X에서 실행될 `clickhouse` 바이너리를 빌드하려는 경우를 위한 안내입니다.
주요 사용 사례는 Linux 머신에서 실행되는 지속적 통합(continuous integration) 검사입니다.
macOS에서 직접 ClickHouse를 빌드하려면 [네이티브 빌드 안내](../development/build-osx.md)를 참고하십시오.

macOS용 크로스 빌드는 [빌드 안내](../development/build.md)를 기반으로 하며, 먼저 해당 지침을 따르십시오.

다음 섹션에서는 `x86_64` macOS용 ClickHouse를 빌드하는 과정을 단계별로 설명합니다.
ARM 아키텍처를 대상으로 하는 경우, 모든 `x86_64` 항목을 `aarch64`로 바꾸면 됩니다.
예를 들어, 모든 단계에서 `x86_64-apple-darwin`을 `aarch64-apple-darwin`으로 교체하십시오.

## 크로스 컴파일용 도구 세트 설치 \{#install-cross-compilation-toolset\}

`cctools`를 설치할 경로를 `${CCTOOLS}`로 기억해 두십시오.

```bash
mkdir ~/cctools
export CCTOOLS=$(cd ~/cctools && pwd)
cd ${CCTOOLS}

git clone https://github.com/tpoechtrager/apple-libtapi.git
cd apple-libtapi
git checkout 15dfc2a8c9a2a89d06ff227560a69f5265b692f9
INSTALLPREFIX=${CCTOOLS} ./build.sh
./install.sh
cd ..

git clone https://github.com/tpoechtrager/cctools-port.git
cd cctools-port/cctools
git checkout 2a3e1c2a6ff54a30f898b70cfb9ba1692a55fad7
./configure --prefix=$(readlink -f ${CCTOOLS}) --with-libtapi=$(readlink -f ${CCTOOLS}) --target=x86_64-apple-darwin
make install
```

또한 작업 트리에 macOS X SDK를 받아 두어야 합니다.

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## ClickHouse 빌드 \{#build-clickhouse\}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

생성된 바이너리는 Mach-O 실행 파일 포맷이며 Linux에서는 실행할 수 없습니다.
