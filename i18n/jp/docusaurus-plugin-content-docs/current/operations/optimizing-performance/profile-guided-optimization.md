---
description: 'プロファイルガイド最適化のドキュメント'
sidebar_label: 'プロファイルガイド最適化 (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'プロファイルガイド最適化'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# プロファイルガイド付き最適化

Profile-Guided Optimization (PGO) は、実行時プロファイル情報に基づいてプログラムを最適化するコンパイラの最適化手法です。

テスト結果によると、PGO は ClickHouse のパフォーマンス向上に有効です。ClickBench テストスイートにおいて、QPS が最大 15% 改善することが確認されています。より詳細な結果は[こちら](https://pastebin.com/xbue3HMU)で参照できます。パフォーマンス上の利点は、通常のワークロードに依存するため、より良い結果が得られる場合もあれば、そうでない場合もあります。

ClickHouse における PGO の詳細については、対応する GitHub の [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) を参照してください。



## PGOを使用してClickHouseをビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGOには主に2つの種類があります：[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)と[Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（AutoFDOとも呼ばれます）。本ガイドでは、ClickHouseにおけるInstrumentation PGOについて説明します。

1. InstrumentationモードでClickHouseをビルドします。Clangでは、`CXXFLAGS`に`-fprofile-generate`オプションを渡すことで実行できます。
2. Instrumentationを有効にしたClickHouseをサンプルワークロードで実行します。ここでは通常のワークロードを使用する必要があります。アプローチの1つとして、[ClickBench](https://github.com/ClickHouse/ClickBench)をサンプルワークロードとして使用することができます。InstrumentationモードのClickHouseは動作が遅くなる可能性があるため、その点に留意し、パフォーマンスが重要な環境ではInstrumentationを有効にしたClickHouseを実行しないでください。
3. 前のステップで収集したプロファイルと`-fprofile-use`コンパイラフラグを使用して、ClickHouseを再度コンパイルします。

PGOの適用方法に関するより詳細なガイドは、Clangの[ドキュメント](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)に記載されています。

本番環境から直接サンプルワークロードを収集する場合は、Sampling PGOの使用を推奨します。
