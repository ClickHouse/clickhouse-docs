---
description: '在 s390x 架构上从源码构建 ClickHouse 的指南'
sidebar_label: '在 Linux 上为 s390x（zLinux）构建'
sidebar_position: 30
slug: /development/build-cross-s390x
title: '在 Linux 上为 s390x（zLinux）构建'
doc_type: 'guide'
---



# 在 Linux 上为 s390x（zLinux）构建

ClickHouse 目前对 s390x 提供实验性支持。



## Building ClickHouse for s390x {#building-clickhouse-for-s390x}

s390x 有两个与 OpenSSL 相关的构建选项：

- 默认情况下，OpenSSL 在 s390x 上构建为共享库。这与其他所有平台不同，其他平台上 OpenSSL 构建为静态库。
- 若要将 OpenSSL 构建为静态库，请向 CMake 传递 `-DENABLE_OPENSSL_DYNAMIC=0` 参数。

这些说明假设主机为 x86_64 架构，并已根据[构建说明](../development/build.md)安装了本地构建所需的所有工具。同时假设主机为 Ubuntu 22.04，但以下说明也适用于 Ubuntu 20.04。

除了安装本地构建所需的工具外，还需要安装以下附加软件包：

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

如果需要交叉编译 Rust 代码，请安装 s390x 的 Rust 交叉编译目标：

```bash
rustup target add s390x-unknown-linux-gnu
```

s390x 构建使用 mold 链接器，请从 https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gz 下载并将其放入 `$PATH` 中。

构建 s390x 版本：

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```


## Running {#running}

构建完成后,可以通过以下命令运行二进制文件,例如:

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```


## 调试 {#debugging}

安装 LLDB:

```bash
apt-get install lldb-15
```

要调试 s390x 可执行文件,请使用 QEMU 在调试模式下运行 ClickHouse:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

在另一个 shell 中运行 LLDB 并附加,将 `<Clickhouse Parent Directory>` 和 `<build directory>` 替换为您环境中对应的值。

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


## Visual Studio Code 集成 {#visual-studio-code-integration}

- 可视化调试需要安装 [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 扩展。
- 如果使用 [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md),[Command Variable](https://github.com/rioj7/command-variable) 扩展可以帮助实现动态启动。
- 确保将后端设置为您的 LLVM 安装路径,例如:`"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`
- 确保在启动前以调试模式运行 ClickHouse 可执行文件。(也可以创建一个 `preLaunchTask` 来自动执行此操作)

### 示例配置 {#example-configurations}

#### cmake-variants.yaml {#cmake-variantsyaml}

```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: 生成调试信息
      buildType: Debug
    release:
      short: Release
      long: 优化生成的代码
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: 带调试信息的发布版本
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: 最小体积发布版本
      buildType: MinSizeRel

toolchain:
  default: default
  description: 选择工具链
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
      "name": "(lldb) 使用 qemu 启动 s390x",
      "targetCreateCommands": [
        "target create ${command:cmake.launchTargetPath}"
      ],
      "processCreateCommands": ["gdb-remote 2159"],
      "preLaunchTask": "Run ClickHouse"
    }
  ]
}
```

#### settings.json {#settingsjson}

这还会将不同的构建放在 `build` 文件夹的不同子文件夹下。

```json
{
  "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
  "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh {#run-debugsh}

```sh
#! /bin/sh
echo '正在启动调试器会话'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json {#tasksjson}

定义一个任务,在二进制文件旁边的 `tmp` 文件夹下以 `server` 模式运行编译后的可执行文件,配置来自 `programs/server/config.xml`。

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "运行 ClickHouse",
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
