---
description: 'Documentation for Profile Guided Optimization'
sidebar_label: 'Profile Guided Optimization (PGO)'
sidebar_position: 54
slug: '/operations/optimizing-performance/profile-guided-optimization'
title: 'Profile Guided Optimization'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# プロファイルガイド最適化

プロファイルガイド最適化 (PGO) は、プログラムが実行時のプロファイルに基づいて最適化されるコンパイラ最適化手法です。

テストによると、PGOはClickHouseのパフォーマンス向上に寄与します。テストでは、ClickBenchテストスイートでQPSが最大15%向上することを確認しています。詳細な結果は[こちら](https://pastebin.com/xbue3HMU)で確認できます。パフォーマンスの利点は、通常のワークロードによって異なります - より良い結果が得られることもあれば、逆もあります。

ClickHouseにおけるPGOに関するより多くの情報は、該当するGitHubの[イシュー](https://github.com/ClickHouse/ClickHouse/issues/44567)で読むことができます。

## PGOを使用してClickHouseをビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGOには2つの主要な種類があります：[インスツルメンテーション](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)と[サンプリング](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（AutoFDOとも呼ばれます）。このガイドでは、ClickHouseのインスツルメンテーションPGOについて説明します。

1. インスツルメンテーションモードでClickHouseをビルドします。Clangでは、`CXXFLAGS`に`-fprofile-generate`オプションを渡すことで実行できます。
2. サンプルワークロードでインスツルメンテーションを施したClickHouseを実行します。ここでは、通常のワークロードを使用する必要があります。1つのアプローチは、[ClickBench](https://github.com/ClickHouse/ClickBench)をサンプルワークロードとして使用することです。インスツルメンテーションモードのClickHouseは遅く動作する可能性があるため、その準備をしておき、パフォーマンスが重要な環境でインスツルメンテーションされたClickHouseを実行しないでください。
3. 前のステップで収集したプロファイルを使用して、`-fprofile-use`コンパイラフラグでClickHouseを再コンパイルします。

PGOを適用する方法についてのより詳細なガイドは、Clangの[ドキュメンテーション](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)にあります。

本番環境から直接サンプルワークロードを収集する予定の場合は、サンプリングPGOを使用することをお勧めします。
