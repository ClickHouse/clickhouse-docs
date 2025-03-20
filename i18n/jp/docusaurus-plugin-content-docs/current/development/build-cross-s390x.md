---
slug: /development/build-cross-s390x
sidebar_position: 30
sidebar_label: Linux上でs390x (zLinux)のビルド
---


# Linux上でs390x (zLinux)のビルド

ClickHouseはs390xに対して実験的なサポートを提供しています。

## s390x用ClickHouseのビルド {#building-clickhouse-for-s390x}

s390xには2つのOpenSSL関連のビルドオプションがあります：
- デフォルトでは、OpenSSLはs390x上で共有ライブラリとしてビルドされます。これは、他のすべてのプラットフォームでOpenSSLが静的ライブラリとしてビルドされるのとは異なります。
- OpenSSLを静的ライブラリとしてビルドするには、`-DENABLE_OPENSSL_DYNAMIC=0`をCMakeに渡します。

これらの手順は、ホストマシンがx86_64であり、[ビルド手順](../development/build.md)に基づいてネイティブにビルドするために必要なすべてのツールがインストールされていることを前提としています。また、ホストがUbuntu 22.04であることを前提としていますが、以下の手順はUbuntu 20.04でも動作するはずです。

ネイティブにビルドするために必要なツールに加えて、以下の追加パッケージをインストールする必要があります：

```bash
apt-get install binutils-s390x-linux-gnu libc6-dev-s390x-cross gcc-s390x-linux-gnu binfmt-support qemu-user-static
```

Rustコードをクロスコンパイルしたい場合は、s390x用のRustクロスコンパイルターゲットをインストールします：

```bash
rustup target add s390x-unknown-linux-gnu
```

s390xのビルドでは、moldリンカーを使用します。これをhttps://github.com/rui314/mold/releases/download/v2.0.0/mold-2.0.0-x86_64-linux.tar.gzからダウンロードし、`$PATH`に配置してください。

s390x用にビルドするには：

```bash
cmake -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-s390x.cmake ..
ninja
```

## 実行する {#running}

ビルドが完了したら、バイナリを以下のように実行できます：

```bash
qemu-s390x-static -L /usr/s390x-linux-gnu ./clickhouse
```

## デバッグ {#debugging}

LLDBをインストールします：

```bash
apt-get install lldb-15
```

s390x実行可能ファイルをデバッグするには、QEMUを使用してクリックハウスをデバッグモードで実行します：

```bash
qemu-s390x-static -g 31338 -L /usr/s390x-linux-gnu ./clickhouse
```

別のシェルでLLDBを実行して添付し、`<Clickhouse Parent Directory>`と`<build directory>`を環境に応じた値に置き換えます。

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
   453      /// PHDRキャッシュはクエリプロファイラーが信頼性を持って動作するために必要です
```

## Visual Studio Code統合 {#visual-studio-code-integration}

- [CodeLLDB](https://github.com/vadimcn/vscode-lldb)拡張機能は、視覚的デバッグに必要です。
- [Command Variable](https://github.com/rioj7/command-variable)拡張機能は、[CMake Variants](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/variants.md)を使用している場合に動的な起動を支援できます。
- バックエンドをLLVMインストールに設定してください。例として、`"lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"`のようにします。
- 起動前にクリックハウス実行可能ファイルをデバッグモードで実行することを確認してください。（自動化する`preLaunchTask`を作成することも可能です。）

### 例の設定 {#example-configurations}
#### cmake-variants.yaml {#cmake-variantsyaml}
```yaml
buildType:
  default: relwithdebinfo
  choices:
    debug:
      short: Debug
      long: デバッグ情報を出力
      buildType: Debug
    release:
      short: Release
      long: 生成されたコードを最適化
      buildType: Release
    relwithdebinfo:
      short: RelWithDebInfo
      long: デバッグ情報付きのリリース
      buildType: RelWithDebInfo
    tsan:
      short: MinSizeRel
      long: 最小サイズのリリース
      buildType: MinSizeRel

toolchain:
  default: default
  description: ツールチェーンを選択
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
            "name": "(lldb) qemuでs390xを起動",
            "targetCreateCommands": ["target create ${command:cmake.launchTargetPath}"],
            "processCreateCommands": ["gdb-remote 2159"],
            "preLaunchTask": "ClickHouseを実行"
        }
    ]
}
```

#### settings.json {#settingsjson}
これにより、異なるビルドが`build`フォルダ内の異なるサブフォルダに配置されます。
```json
{
    "cmake.buildDirectory": "${workspaceFolder}/build/${buildKitVendor}-${buildKitVersion}-${variant:toolchain}-${variant:buildType}",
    "lldb.library": "/usr/lib/x86_64-linux-gnu/liblldb-15.so"
}
```

#### run-debug.sh {#run-debugsh}
```sh
#! /bin/sh
echo 'デバッガセッションを開始中'
cd $1
qemu-s390x-static -g 2159 -L /usr/s390x-linux-gnu $2 $3 $4
```

#### tasks.json {#tasksjson}
コンパイルされた実行可能ファイルを`server`モードでバイナリの隣の`tmp`フォルダで実行するタスクを定義し、`programs/server/config.xml`の下の設定から構成します。
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
                        "beginsPattern": "^デバッガセッションを開始中",
                        "endsPattern": ".*"
                    }
                }
            ]
        }
    ]
}
```
