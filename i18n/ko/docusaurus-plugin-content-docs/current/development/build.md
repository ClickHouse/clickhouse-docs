---
description: 'Linux 시스템에서 소스 코드에서 ClickHouse를 빌드하는 단계별 가이드'
sidebar_label: 'Linux에서 빌드'
sidebar_position: 10
slug: /development/build
title: 'Linux에서 ClickHouse를 빌드하는 방법'
doc_type: 'guide'
---

# Linux에서 ClickHouse를 빌드하는 방법 \{#how-to-build-clickhouse-on-linux\}

:::info ClickHouse를 직접 빌드할 필요는 없습니다!
[Quick Start](https://clickhouse.com/#quick-start)에 설명된 대로 사전 빌드된 ClickHouse를 설치할 수 있습니다.
:::

ClickHouse는 다음 플랫폼에서 빌드할 수 있습니다:

- x86_64
- AArch64
- PowerPC 64 LE (실험적 지원)
- s390/x (실험적 지원)
- RISC-V 64 (실험적 지원)

## Assumptions \{#assumptions\}

다음 튜토리얼은 Ubuntu Linux를 기준으로 작성되었지만, 적절한 변경을 통해 다른 Linux 배포판에서도 사용할 수 있습니다.
개발 환경에서 권장되는 최소 Ubuntu 버전은 24.04 LTS입니다.

이 튜토리얼은 ClickHouse 리포지토리와 모든 서브모듈을 로컬에 체크아웃해 두었다고 가정합니다.

## 필수 구성 요소 설치 \{#install-prerequisites\}

먼저 공통 [사전 준비 사항 문서](developer-instruction.md)를 참고하십시오.

ClickHouse는 빌드를 위해 CMake와 Ninja를 사용합니다.

이미 컴파일된 오브젝트 파일을 재사용할 수 있도록, 필요하다면 ccache를 설치할 수 있습니다.

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Clang 컴파일러 설치 \{#install-the-clang-compiler\}

Ubuntu/Debian에서 Clang을 설치하려면 [여기](https://apt.llvm.org/)에 있는 LLVM에서 제공하는 자동 설치 스크립트를 사용하십시오.

```bash
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh 21
```

다른 Linux 배포판에서는 LLVM의 [사전 빌드된 패키지](https://releases.llvm.org/download.html)를 설치할 수 있는지 확인하십시오.

2026년 2월 현재 Clang 21 이상이 필요합니다.
GCC 또는 다른 컴파일러는 지원되지 않습니다.


## Rust 컴파일러 설치(선택 사항) \{#install-the-rust-compiler-optional\}

:::note
Rust는 ClickHouse의 선택적 의존성입니다.
Rust가 설치되지 않은 경우 ClickHouse의 일부 기능은 컴파일되지 않습니다.
:::

먼저 공식 [Rust 문서](https://www.rust-lang.org/tools/install)에 있는 단계를 따라 `rustup`을 설치합니다.

C++ 의존성과 마찬가지로 ClickHouse는 무엇이 설치되는지 정확히 제어하고 `crates.io` 레지스트리와 같은 서드파티 서비스에 대한 의존을 피하기 위해 vendoring을 사용합니다.

릴리스 모드에서는 최신 rustup 툴체인 버전이라면 이러한 의존성과 함께 동작해야 하지만, sanitizer를 활성화할 계획이라면 CI에서 사용되는 것과 동일한 `std`와 정확히 일치하는 버전을 사용해야 합니다(이를 위해 해당 crate들을 vendor합니다).

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```


## ClickHouse 빌드 \{#build-clickhouse\}

모든 빌드 산출물이 들어갈 별도의 `build` 디렉터리를 `ClickHouse` 디렉터리 안에 생성할 것을 권장합니다:

```sh
mkdir build
cd build
```

서로 다른 빌드 타입을 위해 `build_release`, `build_debug` 등 여러 개의 디렉터리를 사용할 수 있습니다.

선택 사항: 여러 버전의 컴파일러가 설치되어 있는 경우, 사용하려는 정확한 컴파일러를 지정할 수 있습니다.

```sh
export CC=clang-21
export CXX=clang++-21
```

개발 목적에는 디버그 빌드를 사용하는 것을 권장합니다.
릴리스 빌드와 비교하면 컴파일러 최적화 수준(`-O`)이 더 낮아 디버깅 경험이 더 우수합니다.
또한 `LOGICAL_ERROR` 타입의 내부 예외는 오류를 정상적으로 처리하지 않고 즉시 비정상 종료를 발생시킵니다.

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdb와 같은 디버거를 사용하려면 위 명령에 `-D DEBUG_O_LEVEL="0"`을 추가하여 모든 컴파일러 최적화를 제거하십시오. 이러한 최적화는 gdb가 변수에 접근하거나 값을 조회하는 기능을 방해할 수 있습니다.
:::

빌드하려면 ninja를 실행하십시오:

```sh
ninja clickhouse
```

모든 바이너리(유틸리티 및 테스트)를 빌드하고 싶다면 매개변수 없이 `ninja`를 실행합니다.

```sh
ninja
```

`-j` 매개변수를 사용하여 병렬 빌드 작업의 개수를 제어할 수 있습니다.

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake에는 위 명령들을 위한 단축 명령이 있습니다:

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```

:::


## ClickHouse 실행 파일 실행하기 \{#running-the-clickhouse-executable\}

빌드가 성공적으로 완료되면 실행 파일은 `ClickHouse/<build_dir>/programs/`에 생성됩니다.

ClickHouse 서버는 현재 디렉터리에서 `config.xml` 구성 파일을 찾으려고 합니다.
명령줄에서 `-C` 옵션을 사용하여 다른 구성 파일을 지정할 수도 있습니다.

`clickhouse-client`로 ClickHouse 서버에 연결하려면 다른 터미널을 열고 `ClickHouse/build/programs/` 디렉터리로 이동한 후 `./clickhouse client`를 실행합니다.

macOS 또는 FreeBSD에서 `Connection refused` 메시지가 표시되면 호스트 주소를 127.0.0.1로 지정해 보십시오.

```bash
clickhouse client --host 127.0.0.1
```


## 고급 옵션 \{#advanced-options\}

### 최소 빌드 \{#minimal-build\}

타사(서드파티) 라이브러리가 제공하는 기능이 필요 없다면, 빌드 과정을 더욱 빠르게 진행할 수 있습니다.

```sh
cmake -DENABLE_LIBRARIES=OFF
```

문제가 발생해도 스스로 해결해야 합니다 ...

Rust에는 인터넷 연결이 필요합니다. Rust 지원을 비활성화하려면:

```sh
cmake -DENABLE_RUST=OFF
```


### ClickHouse 실행 파일 실행하기 \{#running-the-clickhouse-executable-1\}

시스템에 설치된 운영 환경용 ClickHouse 바이너리를, 직접 컴파일한 ClickHouse 바이너리로 교체해 사용할 수 있습니다.
이를 위해 공식 웹사이트의 지침에 따라 로컬 머신에 먼저 ClickHouse를 설치하십시오.
그런 다음 다음 명령을 실행하십시오:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`, `clickhouse-server` 및 기타는 공통으로 공유되는 `clickhouse` 바이너리에 대한 심볼릭 링크입니다.

직접 빌드한 ClickHouse 바이너리를 시스템에 설치된 ClickHouse 패키지의 설정 파일과 함께 실행할 수도 있습니다:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```


### 모든 Linux 배포판에서 빌드하기 \{#building-on-any-linux\}

OpenSUSE Tumbleweed에서 필수 구성 요소를 설치합니다:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhide에 필수 패키지를 설치하십시오:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```


### Docker에서 빌드하기 \{#building-in-docker\}

다음 명령을 사용하면 CI와 유사한 환경을 로컬에서 재현하여 어떤 빌드든 실행할 수 있습니다:

```bash
python -m ci.praktika run "BUILD_JOB_NAME"
```

여기서 BUILD&#95;JOB&#95;NAME은 CI 리포트에 표시되는 작업 이름입니다. 예를 들어 &quot;Build (arm&#95;release)&quot;, &quot;Build (amd&#95;debug)&quot;와 같습니다.

이 명령은 모든 필수 의존성이 포함된 해당 Docker 이미지 `clickhouse/binary-builder`를 pull 한 뒤,
그 컨테이너 내부에서 빌드 스크립트 `./ci/jobs/build_clickhouse.py`를 실행합니다.

빌드 결과물은 `./ci/tmp/`에 생성됩니다.

이 방법은 AMD와 ARM 아키텍처 모두에서 동작하며, `requests` 모듈을 사용할 수 있는 Python과 Docker 외에 추가 의존성을 필요로 하지 않습니다.
