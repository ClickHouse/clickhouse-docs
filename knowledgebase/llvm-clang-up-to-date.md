---
date: 2024-04-22
title: How to build LLVM and clang on Linux
description: Commands to build LLVM and clang on Linux.
keywords: [contributing, llvm, clang]
---

# How to build LLVM and Clang on Linux

In order to build and contribute to ClickHouse, you must use [LLVM](https://llvm.org/) and [Clang](https://clang.llvm.org/).

<!-- truncate -->

These are the commands to build the latest version of LLVM and Clang on Linux:

```bash
git clone git@github.com:llvm/llvm-project.git
mkdir llvm-build
cd llvm-build
cmake -GNinja -DCMAKE_BUILD_TYPE:STRING=Release -DLLVM_ENABLE_PROJECTS=all -DLLVM_TARGETS_TO_BUILD=all ../llvm-project/llvm
time ninja
sudo ninja install
```
