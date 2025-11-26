---
description: 's390x アーキテクチャ向けに ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'Linux 上での s390x (zLinux) 向けビルド'
sidebar_position: 30
slug: /development/build-cross-s390x
title: 'Linux 上での s390x (zLinux) 向けビルド'
doc_type: 'guide'
---



# Linux 上での s390x（zLinux）向けビルド

ClickHouse は s390x を実験的にサポートしています。



## s390x 向けの ClickHouse のビルド

s390x には、OpenSSL 関連のビルドオプションが 2 つあります。

* デフォルトでは、s390x 上では OpenSSL は共有ライブラリとしてビルドされます。これは、他のすべてのプラットフォームでは OpenSSL が静的ライブラリとしてビルドされるのとは異なります。
* それでも OpenSSL を静的ライブラリとしてビルドしたい場合は、CMake に `-DENABLE_OPENSSL_DYNAMIC=0` を渡します。

これらの手順は、ホストマシンが x86&#95;64 であり、[ビルド手順](../development/build.md) に従ってネイティブビルドに必要なツール一式がすべてインストールされていることを前提とします。また、ホストが Ubuntu 22.04 であることを想定していますが、以下の手順は Ubuntu 20.04 でも動作するはずです。

ネイティブビルドに使用するツールをインストールすることに加えて、以下の追加パッケージをインストールする必要があります。

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

Rust コードをクロスコンパイルする場合は、s390x 向けの Rust クロスコンパイルターゲットをインストールしてください。

```bash
rustup target add s390x-unknown-linux-gnu
```

s390x ビルドでは mold リンカーを使用します。[https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86&#95;64-linux.tar.gz](https://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gz)
からダウンロードし、`$PATH` に配置してください。

s390x 向けにビルドするには:

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```


## 実行

ビルドが完了したら、たとえば次のようにバイナリを実行できます。

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```


## デバッグ

LLDB をインストールします：

```bash
apt-get install lldb-15
```

s390x 実行ファイルをデバッグするには、QEMU をデバッグモードで実行して ClickHouse を起動します:

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

別のシェルで LLDB を実行してアタッチし、`<Clickhouse Parent Directory>` と `<build directory>` を、お使いの環境に対応する値に置き換えてください。

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


## Visual Studio Code 連携

* ビジュアルデバッグには [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 拡張機能が必要です。
* [CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md) を使用している場合、[Command Variable](https://github.com/rioj7/command-variable) 拡張機能を使うと動的な起動に役立ちます。
* バックエンドとして使用する LLVM のインストール先を指すように設定してください（例: `"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`）。
* 起動前に ClickHouse 実行ファイルをデバッグモードで実行しておいてください（これを自動化する `preLaunchTask` を作成することも可能です）。

### 設定例

#### cmake-variants.yaml

```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: デバッグ情報を出力する
      buildType: Debug
    release:
      short: Release
      long: 生成コードを最適化する
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: デバッグ情報付きリリース
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: 最小サイズリリース
      buildType: MinSizeRel

toolchain:
  default: default
  description: ツールチェーンを選択する
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

#### launch.json

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "custom",
            "name": "(lldb) qemuでs390xを起動",
            "targetCreateCommands": ["target create ${command:cmake.launchTargetPath}"],
            "processCreateCommands": ["gdb-remote 2159"],
            "preLaunchTask": "ClickHouseを実行",
        }
    ]
}
```

#### settings.json

これにより、異なるビルドが `build` フォルダー内の別々のサブフォルダーに配置されるようになります。

```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh

```sh
#! /bin/sh
echo 'デバッガセッションを開始します'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json

`programs/server/config.xml` の設定を使用して、バイナリと同じディレクトリ内にある `tmp` フォルダーでコンパイル済み実行ファイルを `server` モードで実行するタスクを定義します。

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "ClickHouseを実行",
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
                        "beginsPattern": "^デバッガーセッションを開始",
                        "endsPattern": ".*"
                    }
                }
            ]
        }
    ]
}
```
