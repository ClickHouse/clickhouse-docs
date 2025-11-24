---
'description': 'Linux 시스템에서 소스에서 ClickHouse를 빌드하는 단계별 가이드'
'sidebar_label': 'Linux에서 구축'
'sidebar_position': 10
'slug': '/development/build'
'title': 'Linux에서 ClickHouse 구축하는 방법'
'doc_type': 'guide'
---


# ClickHouse를 Linux에서 빌드하는 방법

:::info ClickHouse를 직접 빌드할 필요는 없습니다!
미리 빌드된 ClickHouse를 [빠른 시작](https://clickhouse.com/#quick-start)에서 설명된 대로 설치할 수 있습니다.
:::

ClickHouse는 다음 플랫폼에서 빌드할 수 있습니다:

- x86_64
- AArch64
- PowerPC 64 LE (실험적)
- s390/x (실험적)
- RISC-V 64 (실험적)

## 가정 {#assumptions}

다음 튜토리얼은 Ubuntu Linux를 기반으로 하지만, 적절한 변경을 통해 다른 Linux 배포판에서도 작동해야 합니다.
개발을 위한 최소 권장 Ubuntu 버전은 24.04 LTS입니다.

이 튜토리얼은 ClickHouse 리포지토리와 모든 하위 모듈이 로컬에 체크아웃되어 있다고 가정합니다.

## 필수 요소 설치 {#install-prerequisites}

먼저 일반적인 [필수 요소 문서](developer-instruction.md)를 참조하세요.

ClickHouse는 빌드를 위해 CMake 및 Ninja를 사용합니다.

선택적으로, 빌드에서 이미 컴파일된 객체 파일을 재사용하도록 ccache를 설치할 수 있습니다.

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clang 컴파일러 설치 {#install-the-clang-compiler}

Ubuntu/Debian에 Clang을 설치하려면 [여기](https://apt.llvm.org/)에서 LLVM의 자동 설치 스크립트를 사용하세요.

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

다른 Linux 배포판의 경우, LLVM의 [미리 빌드된 패키지](https://releases.llvm.org/download.html)를 설치할 수 있는지 확인하세요.

2025년 3월 현재, Clang 19 이상이 필요합니다.
GCC 또는 다른 컴파일러는 지원되지 않습니다.

## Rust 컴파일러 설치 (선택 사항) {#install-the-rust-compiler-optional}

:::note
Rust는 ClickHouse의 선택적 종속성입니다.
Rust가 설치되어 있지 않으면 ClickHouse의 일부 기능이 컴파일에서 제외됩니다.
:::

먼저, 공식 [Rust 문서](https://www.rust-lang.org/tools/install)의 지침에 따라 `rustup`을 설치하세요.

C++ 종속성과 마찬가지로 ClickHouse는 제3자 서비스(예: `crates.io` 레지스트리)에 의존하지 않도록 설치되는 내용을 엄격히 관리하기 위해 벤더링을 사용합니다.

릴리스 모드에서는 어떤 최신 rustup 도구 체인 버전이 이러한 종속성과 잘 작동하지만, sanitizer를 활성화할 계획이라면 CI에서 사용된 것과 정확히 동일한 `std`와 일치하는 버전을 사용해야 합니다 (우리가 벤더링하는 크레이트에 대해):

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```
## ClickHouse 빌드 {#build-clickhouse}

모든 빌드 산출물이 포함된 별도의 `build` 디렉토리를 `ClickHouse` 내부에 생성할 것을 권장합니다:

```sh
mkdir build
cd build
```

서로 다른 빌드 유형에 대해 여러 개의 다른 디렉토리(예: `build_release`, `build_debug` 등)를 가질 수 있습니다.

선택 사항: 여러 컴파일러 버전이 설치된 경우, 사용할 특정 컴파일러를 지정할 수 있습니다.

```sh
export CC=clang-19
export CXX=clang++-19
```

개발 목적으로는 디버그 빌드가 권장됩니다.
릴리스 빌드에 비해, 디버그 빌드는 낮은 컴파일러 최적화 수준(`-O`)을 가지고 있어 더 나은 디버깅 경험을 제공합니다.
또한, `LOGICAL_ERROR` 타입의 내부 예외는 우아하게 실패하는 대신 즉시 충돌합니다.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdb와 같은 디버거를 사용하려면, 위의 명령에 `-D DEBUG_O_LEVEL="0"`을 추가하여 모든 컴파일러 최적화를 제거하여 gdb가 변수에 접근하거나 볼 수 있는 능력에 방해가 되지 않도록 하세요.
:::

빌드를 위해 ninja를 실행하세요:

```sh
ninja clickhouse
```

모든 이진 파일(유틸리티 및 테스트)을 빌드하려면 매개변수 없이 ninja를 실행하세요:

```sh
ninja
```

병렬 빌드 작업 수를 `-j` 매개변수를 사용하여 제어할 수 있습니다:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake는 위 명령어에 대한 단축키를 제공합니다:

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```
:::

## ClickHouse 실행 파일 실행 {#running-the-clickhouse-executable}

빌드가 성공적으로 완료된 후, `ClickHouse/<build_dir>/programs/`에서 실행 파일을 찾을 수 있습니다:

ClickHouse 서버는 현재 디렉토리에서 `config.xml` 구성 파일을 찾으려 합니다.
대신 `-C`를 통해 명령줄에서 구성 파일을 지정할 수 있습니다.

`clickhouse-client`를 사용하여 ClickHouse 서버에 연결하려면, 다른 터미널을 열고 `ClickHouse/build/programs/`로 이동한 다음 `./clickhouse client`를 실행하세요.

macOS 또는 FreeBSD에서 `Connection refused` 메시지가 표시되면 호스트 주소 127.0.0.1을 지정해 보세요:

```bash
clickhouse client --host 127.0.0.1
```

## 고급 옵션 {#advanced-options}

### 최소 빌드 {#minimal-build}

타사 라이브러리에서 제공하는 기능이 필요하지 않은 경우, 빌드를 더 빠르게 할 수 있습니다:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

문제가 발생할 경우, 스스로 해결해야 합니다...

Rust는 인터넷 연결이 필요합니다. Rust 지원을 비활성화하려면:

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse 실행 파일 실행 {#running-the-clickhouse-executable-1}

컴파일된 ClickHouse 이진 파일로 시스템에 설치된 ClickHouse의 프로덕션 버전을 교체할 수 있습니다.
이를 위해 공식 웹사이트의 지침에 따라 시스템에 ClickHouse를 설치하세요.
다음으로, 실행하세요:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`, `clickhouse-server` 등은 일반적으로 공유되는 `clickhouse` 이진 파일에 대한 심볼릭 링크입니다.

시스템에 설치된 ClickHouse 패키지의 구성 파일을 사용하여 사용자가 직접 빌드한 ClickHouse 이진 파일을 실행할 수도 있습니다:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 모든 Linux에서 빌드하기 {#building-on-any-linux}

OpenSUSE Tumbleweed에서 필수 요소를 설치하세요:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhide에서 필수 요소를 설치하세요:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### 도커에서 빌드하기 {#building-in-docker}

CI와 유사한 환경에서 로컬로 빌드를 실행할 수 있습니다:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
여기서 BUILD_JOB_NAME은 CI 리포트에 표시된 작업 이름입니다. 예: "Build (arm_release)", "Build (amd_debug)"

이 명령은 필요한 모든 종속성이 포함된 적합한 Docker 이미지 `clickhouse/binary-builder`를 끌어온 다음, 그 안에서 빌드 스크립트 `./ci/jobs/build_clickhouse.py`를 실행합니다.

빌드 출력은 `./ci/tmp/`에 배치됩니다.

이것은 AMD 및 ARM 아키텍처 모두에서 작동하며, Docker 외에 추가 종속성이 필요하지 않습니다.
