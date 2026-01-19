---
description: 's390x アーキテクチャ向けに ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'Linux 上での s390x (zLinux) 向けビルド'
sidebar_position: 30
slug: /development/build-cross-s390x
title: 'Linux 上での s390x (zLinux) 向けビルド'
doc_type: 'guide'
---

# Linux 上での s390x (zLinux) 向けビルド \{#build-on-linux-for-s390x-zlinux\}

ClickHouse は s390x を実験的にサポートしています。

## s390x 向けの ClickHouse のビルド \{#building-clickhouse-for-s390x\}

s390x では、他のプラットフォームと同様に、OpenSSL はスタティックライブラリとしてビルドされます。OpenSSL を動的ライブラリとしてビルドしたい場合は、CMake に `-DENABLE_OPENSSL_DYNAMIC=1` を指定する必要があります。

これらの手順では、ホストマシンが Linux x86&#95;64/ARM であり、[ビルド手順](../development/build.md) に基づいてネイティブビルドに必要なツールが一通りそろっていることを前提としています。また、ホストが Ubuntu 22.04 であることを想定していますが、以下の手順は Ubuntu 20.04 でも動作するはずです。

ネイティブビルドに使用するツールのインストールに加えて、以下の追加パッケージをインストールする必要があります。

```bash
apt-get mold
rustup target add s390x-unknown-linux-gnu
```

s390x 向けにビルドするには:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```

## 実行 \{#running\}

エミュレーションを行うには、s390x 用の QEMU user static バイナリが必要です。Ubuntu では次のコマンドでインストールできます。

```bash
apt-get install binfmt-support binutils-s390x-linux-gnu qemu-user-static
```

ビルドが完了したら、たとえば次のようにバイナリを実行できます：

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./programs/clickhouse local --query "Select 2"
2
```

## デバッグ \{#debugging\}

LLDB をインストールします：

```bash
apt-get install lldb-21
```

s390x 向け実行ファイルをデバッグするには、デバッグモードで QEMU を使用して ClickHouse を実行します。

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

別のシェルで LLDB を実行してプロセスにアタッチし、`&lt;ClickHouse Parent Directory&gt;` と `&lt;build directory&gt;` をお使いの環境に対応する値に置き換えてください。

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

## Visual Studio Code との連携 \{#visual-studio-code-integration\}

- ビジュアルデバッグを行うには [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 拡張機能が必要です。
- [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md) を使用する場合、動的な起動設定には [Command Variable](https://github.com/rioj7/command-variable) 拡張機能が役立ちます。
- バックエンドが使用している LLVM のインストール先に設定されていることを確認してください。例: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-21.so"`
- 起動前に ClickHouse の実行ファイルをデバッグモードで実行しておいてください（これを自動化する `preLaunchTask` を作成することも可能です）。

### 構成例 \{#example-configurations\}

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

これにより、ビルドごとに `build` フォルダー内の別々のサブフォルダーに配置されます。

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

`server` モードでコンパイル済み実行ファイルを実行するタスクを定義します。バイナリと同じディレクトリ内の `tmp` フォルダを使用し、`programs/server/config.xml` にある設定を利用します。

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
