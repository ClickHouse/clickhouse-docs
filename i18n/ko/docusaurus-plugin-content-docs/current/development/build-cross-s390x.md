---
description: 's390x 아키텍처용 ClickHouse를 소스 코드에서 빌드하기 위한 가이드'
sidebar_label: 's390x(zLinux)용 Linux에서 빌드'
sidebar_position: 30
slug: /development/build-cross-s390x
title: 's390x(zLinux)용 Linux에서 빌드'
doc_type: 'guide'
---

# Linux에서 s390x(zLinux)용 빌드 \{#build-on-linux-for-s390x-zlinux\}

ClickHouse는 s390x 아키텍처를 실험적으로 지원합니다.

## s390x용 ClickHouse 빌드 \{#building-clickhouse-for-s390x\}

s390x는 다른 플랫폼과 마찬가지로 OpenSSL을 정적 라이브러리로 빌드합니다. 동적 OpenSSL로 빌드하려면 CMake에 `-DENABLE_OPENSSL_DYNAMIC=1` 옵션을 전달해야 합니다.

다음 지침은 호스트 머신이 Linux x86&#95;64/ARM이며, [빌드 지침](../development/build.md)을 기반으로 네이티브 빌드에 필요한 모든 도구가 이미 설치되어 있다고 가정합니다. 또한 호스트 운영 체제가 Ubuntu 22.04라고 가정하지만, 아래 지침은 Ubuntu 20.04에서도 동일하게 동작합니다.

네이티브 빌드에 사용하는 도구 외에 다음 추가 패키지도 설치해야 합니다:

```bash
apt-get mold
rustup target add s390x-unknown-linux-gnu
```

s390x용으로 빌드하려면:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```


## 실행 \{#running\}

에뮬레이션을 수행하려면 s390x용 QEMU user static 바이너리가 필요합니다. Ubuntu에서는 다음 명령으로 설치합니다:

```bash
apt-get install binfmt-support binutils-s390x-linux-gnu qemu-user-static
```

빌드가 완료되면 예를 들어 다음과 같이 바이너리를 실행할 수 있습니다.

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./programs/clickhouse local --query "Select 2"
2
```


## 디버깅 \{#debugging\}

LLDB를 설치하십시오:

```bash
apt-get install lldb-21
```

s390x 실행 파일을 디버깅하려면 QEMU 디버그 모드에서 ClickHouse를 실행합니다.

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

다른 셸에서 LLDB를 실행해 프로세스에 attach한 뒤, `<Clickhouse Parent Directory>` 및 `<build directory>`를 현재 환경에 맞는 값으로 바꾸십시오.

```bash
lldb-15
(lldb) target create ./clickhouse
Current executable set to '/<Clickhouse Parent Directory>/ClickHouse/<build directory>/programs/clickhouse' (s390x).
(lldb) settings set target.source-map <build directory> /<Clickhouse Parent Directory>/ClickHouse
(lldb) gdb-remote 31338
Process 1 stopped
* thread #1, stop reason = signal SIGTRAP
    frame #0: 0x0000004020e74cd0
->  0x4020e74cd0: lgr    %r2, %r15
    0x4020e74cd4: aghi   %r15, -160
    0x4020e74cd8: xc     0(8,%r15), 0(%r15)
    0x4020e74cde: brasl  %r14, 275429939040
(lldb) b main
Breakpoint 1: 9 locations.
(lldb) c
Process 1 resuming
Process 1 stopped
* thread #1, stop reason = breakpoint 1.1
    frame #0: 0x0000004005cd9fc0 clickhouse`main(argc_=1, argv_=0x0000004020e594a8) at main.cpp:450:17
   447  #if !defined(FUZZING_MODE)
   448  int main(int argc_, char ** argv_)
   449  {
-> 450      inside_main = true;
   451      SCOPE_EXIT({ inside_main = false; });
   452
   453      /// PHDR cache is required for query profiler to work reliably
```


## Visual Studio Code 통합 \{#visual-studio-code-integration\}

- 시각적 디버깅을 위해 [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 확장이 필요합니다.
- [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md)를 사용하는 경우, [Command Variable](https://github.com/rioj7/command-variable) 확장이 동적 실행 설정에 도움이 됩니다.
- 백엔드를 사용 중인 LLVM 설치 위치로 설정해야 합니다. 예: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-21.so"`
- 시작 전에 ClickHouse 실행 파일을 디버그 모드로 미리 실행해 두어야 합니다. (`preLaunchTask`를 생성해 이 과정을 자동화하는 것도 가능합니다)

### 구성 예제 \{#example-configurations\}

#### cmake-variants.yaml \{#cmake-variantsyaml\}

```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: Emit debug information
      buildType: Debug
    release:
      short: Release
      long: Optimize generated code
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: Release with Debug Info
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: Minimum Size Release
      buildType: MinSizeRel

toolchain:
  default: default
  description: Select toolchain
  choices:
    default:
      short: x86_64
      long: x86_64
    s390x:
      short: s390x
      long: s390x
      settings:
        CMAKE_TOOLCHAIN_FILE: cmake/linux/toolchain-s390x.cmake
```


#### launch.json \{#launchjson\}

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "custom",
            "name": "(lldb) Launch s390x with qemu",
            "targetCreateCommands": ["target create ${command:cmake.launchTargetPath}"],
            "processCreateCommands": ["gdb-remote 2159"],
            "preLaunchTask": "Run ClickHouse"
        }
    ]
}
```


#### settings.json \{#settingsjson\}

이 설정을 사용하면 `build` 폴더 아래에서 빌드마다 서로 다른 하위 폴더로 구분되어 저장됩니다.

```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-21.so"
}
```


#### run-debug.sh \{#run-debugsh\}

```sh
#! /bin/sh
echo 'Starting debugger session'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```


#### tasks.json \{#tasksjson\}

컴파일된 실행 파일을 `server` 모드로 실행하는 작업을 정의합니다. 실행은 바이너리와 같은 위치에 있는 `tmp` 폴더에서 이루어지며, 설정은 `programs/server/config.xml`에 있는 구성 파일을 사용합니다.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Run ClickHouse",
            "type": "shell",
            "isBackground": true,
            "command": "${workspaceFolder}/.vscode/run-debug.sh",
            "args": [
                "${command:cmake.launchTargetDirectory}/tmp",
                "${command:cmake.launchTargetPath}",
                "server",
                "--config-file=${workspaceFolder}/programs/server/config.xml"
            ],
            "problemMatcher": [
                {
                    "pattern": [
                        {
                            "regexp": ".",
                            "file": 1,
                            "location": 2,
                            "message": 3
                        }
                    ],
                    "background": {
                        "activeOnStart": true,
                        "beginsPattern": "^Starting debugger session",
                        "endsPattern": ".*"
                    }
                }
            ]
        }
    ]
}
```
