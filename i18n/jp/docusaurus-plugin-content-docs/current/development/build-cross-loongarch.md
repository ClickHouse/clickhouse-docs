---
'description': 'LoongArch64アーキテクチャ用にClickHouseをソースからビルドするためのガイド'
'sidebar_label': 'Linux上でLoongArch64のためにビルド'
'sidebar_position': 35
'slug': '/development/build-cross-loongarch'
'title': 'Linux上でLoongArch64のためにビルド'
'doc_type': 'guide'
---


# Build on Linux for LoongArch64

ClickHouseはLoongArch64に対して実験的なサポートを提供しています。

## Build ClickHouse {#build-clickhouse}

ビルドに必要なllvmのバージョンは19.1.0以上でなければなりません。

```bash
cd ClickHouse
mkdir build-loongarch64
CC=clang-19 CXX=clang++-19 cmake . -Bbuild-loongarch64 -G Ninja -DCMAKE_TOOLCHAIN_FILE=cmake/linux/toolchain-loongarch64.cmake
ninja -C build-loongarch64
```

生成されたバイナリは、LoongArch64のCPUアーキテクチャを持つLinuxでのみ実行されます。
