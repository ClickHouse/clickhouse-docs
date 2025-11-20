---
'description': 'Linux에서 macOS 시스템을 위한 ClickHouse의 크로스 컴파일 가이드'
'sidebar_label': 'macOS를 위한 Linux에서 빌드하기'
'sidebar_position': 20
'slug': '/development/build-cross-osx'
'title': 'macOS를 위한 Linux에서 빌드하기'
'doc_type': 'guide'
---


# How to Build ClickHouse on Linux for macOS

이 문서는 Linux 머신을 보유하고 있으며 OS X에서 실행될 `clickhouse` 바이너리를 빌드하는 데 사용하고자 할 때의 내용을 다룹니다. 주요 사용 사례는 Linux 머신에서 실행되는 지속적인 통합 점검입니다. macOS에서 ClickHouse를 직접 빌드하고자 한다면, [네이티브 빌드 지침](../development/build-osx.md)을 진행하세요.

macOS를 위한 크로스 빌드는 [빌드 지침](../development/build.md)을 기반으로 하며, 먼저 이를 따르십시오.

다음 섹션에서는 `x86_64` macOS를 위한 ClickHouse 빌드 과정을 안내합니다. ARM 아키텍처를 타겟으로 하는 경우, 모든 `x86_64`의 발생을 `aarch64`로 대체하면 됩니다. 예를 들어, 모든 단계에서 `x86_64-apple-darwin`을 `aarch64-apple-darwin`으로 교체하십시오.

## Install cross-compilation toolset {#install-cross-compilation-toolset}

필요한 경우 `cctools`를 설치하는 경로를 `${CCTOOLS}`로 기억해 둡시다.

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

또한, 작업 트리에 macOS X SDK를 다운로드해야 합니다.

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## Build ClickHouse {#build-clickhouse}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

결과 바이너리는 Mach-O 실행 파일 형식을 가지며 Linux에서 실행할 수 없습니다.
