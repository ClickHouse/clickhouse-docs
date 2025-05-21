---
description: 'プロフィールガイド最適化に関するドキュメント'
sidebar_label: 'プロフィールガイド最適化 (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'プロフィールガイド最適化'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# プロフィールガイド最適化

プロフィールガイド最適化 (PGO) は、プログラムがランタイムプロファイルに基づいて最適化されるコンパイラ最適化技術です。

テストによると、PGOはClickHouseのパフォーマンス向上に寄与します。テストの結果、ClickBenchテストスイートでQPSが最大15%向上することが確認されています。より詳細な結果は [こちら](https://pastebin.com/xbue3HMU) で確認できます。パフォーマンスの利点は、典型的なワークロードによって異なり、良い結果が得られる場合もあれば、悪い結果が得られる場合もあります。

ClickHouseにおけるPGOに関する詳細情報は、該当するGitHubの [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) で読むことができます。

## ClickHouseをPGOでビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGOには主に2種類あります: [インストゥルメンテーション](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) と [サンプリング](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (AutoFDOとしても知られています)。このガイドでは、ClickHouseでのインストゥルメンテーションPGOについて説明します。

1. インストゥルメンテーションモードでClickHouseをビルドします。Clangでは、`CXXFLAGS`に`-fprofile-generate`オプションを渡すことで実行できます。
2. サンプルワークロードでインストゥルメンテーションされたClickHouseを実行します。ここでは、通常のワークロードを使用する必要があります。アプローチの一つとして、[ClickBench](https://github.com/ClickHouse/ClickBench)をサンプルワークロードとして使用することが考えられます。インストゥルメンテーションモードのClickHouseは遅く動作する可能性があるため、その準備をしておき、パフォーマンスが重要な環境でインストゥルメンテーションされたClickHouseを実行しないでください。
3. 前のステップで収集したプロファイルとともに、`-fprofile-use`コンパイラフラグを使用してClickHouseを再度コンパイルします。

PGOの適用方法についての詳細ガイドは、Clangの [documentation](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) にあります。

もし生産環境から直接サンプルワークロードを収集する予定であれば、サンプリングPGOを使用することをお勧めします。
