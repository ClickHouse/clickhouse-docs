---
'description': 's390x 아키텍처를 위한 ClickHouse 소스 빌드 가이드'
'sidebar_label': 's390x (zLinux) 용 Linux에서 빌드'
'sidebar_position': 30
'slug': '/development/build-cross-s390x'
'title': 's390x (zLinux) 용 Linux에서 빌드'
'doc_type': 'guide'
---


# Linux에서 s390x (zLinux)에 대한 빌드

ClickHouse는 s390x에 대한 실험적 지원을 제공합니다.

## s390x를 위한 ClickHouse 빌드 {#building-clickhouse-for-s390x}

s390x에는 두 가지 OpenSSL 관련 빌드 옵션이 있습니다:
- 기본적으로, OpenSSL은 s390x에서 공유 라이브러리로 빌드됩니다. 이는 모든 다른 플랫폼과 다르며, 다른 플랫폼에서는 OpenSSL이 정적 라이브러리로 빌드됩니다.
- OpenSSL을 정적 라이브러리로 빌드하려면 CMake에 `-DENABLE_OPENSSL_DYNAMIC=0`을 전달하십시오.

이 지침은 호스트 머신이 x86_64이며 [빌드 지침](../development/build.md)을 기반으로 네이티브로 빌드하는 데 필요한 모든 도구가 설치되어 있다고 가정합니다. 또한 호스트가 Ubuntu 22.04라고 가정하지만 다음 지침은 Ubuntu 20.04에서도 작동해야 합니다.

네이티브로 빌드하는 데 사용되는 도구 외에 다음 추가 패키지를 설치해야 합니다:

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

rust 코드를 크로스 컴파일하려면 s390x용 rust 크로스 컴파일 대상을 설치하십시오:

```bash
rustup target add s390x-unknown-linux-gnu
```

s390x 빌드는 mold 링커를 사용합니다. https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gz 에서 다운로드하여 `$PATH`에 포함시키십시오.

s390x에 대한 빌드를 하려면:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```

## 실행 {#running}

빌드가 완료되면 다음과 같이 이진 파일을 실행할 수 있습니다:

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```

## 디버깅 {#debugging}

LLDB를 설치하십시오:

```bash
apt-get install lldb-15
```

s390x 실행 파일을 디버깅하려면, QEMU에서 디버그 모드로 clickhouse를 실행하십시오:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

다른 셸에서 LLDB를 실행하고 연결합니다. `<Clickhouse Parent Directory>` 및 `<build directory>`를 환경에 해당하는 값으로 교체하십시오.

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

## Visual Studio Code 통합 {#visual-studio-code-integration}

- 비주얼 디버깅을 위한 [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 확장이 필요합니다.
- [Command Variable](https://github.com/rioj7/command-variable) 확장은 [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md)를 사용할 경우 동적 실행에 도움이 될 수 있습니다.
- 백엔드가 LLVM 설치 위치로 설정되었는지 확인하십시오. 예: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`
- 실행하기 전에 clickhouse 실행 파일이 디버그 모드로 실행되었는지 확인하십시오. (이 작업을 자동화하는 `preLaunchTask`를 만드는 것도 가능합니다)

### 예시 구성 {#example-configurations}
#### cmake-variants.yaml {#cmake-variantsyaml}
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

#### launch.json {#launchjson}
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

#### settings.json {#settingsjson}
이것은 또한 서로 다른 빌드를 `build` 폴더의 서로 다른 하위 폴더에 배치합니다.
```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh {#run-debugsh}
```sh
#! /bin/sh
echo 'Starting debugger session'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json {#tasksjson}
`programs/server/config.xml` 아래의 구성으로 바이너리 옆의 `tmp` 폴더에서 `server` 모드로 컴파일된 실행 파일을 실행하는 작업을 정의합니다.
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
