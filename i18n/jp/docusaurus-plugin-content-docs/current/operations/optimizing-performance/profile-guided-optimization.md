---
description: 'プロファイルガイド最適化のドキュメント'
sidebar_label: 'プロファイルガイド最適化 (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'プロファイルガイド最適化'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# プロファイルガイド最適化

Profile-Guided Optimization (PGO) は、実行時プロファイルに基づいてプログラムを最適化するコンパイラ最適化手法です。

テストの結果、PGO は ClickHouse のパフォーマンス向上に有効であることが分かっています。ClickBench テストスイートでは、QPS が最大 15% 向上することが確認されています。より詳細な結果は[こちら](https://pastebin.com/xbue3HMU)で確認できます。パフォーマンス向上の度合いは、典型的なワークロードに依存し、より良い結果が得られる場合もあれば、そうでない場合もあります。

ClickHouse における PGO の詳細については、該当する GitHub の[issue](https://github.com/ClickHouse/ClickHouse/issues/44567)を参照してください。



## PGO を使って ClickHouse をビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGO には大きく分けて 2 種類あります。[Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) と [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)（AutoFDO とも呼ばれます）です。このガイドでは、ClickHouse における Instrumentation PGO について説明します。

1. Instrumentation モードで ClickHouse をビルドします。Clang では `CXXFLAGS` に `-fprofile-generate` オプションを渡すことで行えます。
2. サンプルのワークロードで Instrumentation モードの ClickHouse を実行します。ここでは、通常運用しているワークロードを使用する必要があります。1 つの方法として、サンプルワークロードとして [ClickBench](https://github.com/ClickHouse/ClickBench) を使用できます。Instrumentation モードの ClickHouse は低速に動作する可能性があるため、その点を理解したうえで使用し、性能が重要な環境では Instrumentation モードの ClickHouse を実行しないでください。
3. 前のステップで収集したプロファイルを使用し、コンパイラフラグ `-fprofile-use` を付与して ClickHouse を再コンパイルします。

PGO の適用方法についての、より詳細なガイドは Clang の[ドキュメント](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)に記載されています。

本番環境から直接サンプルワークロードを収集する場合は、Sampling PGO の利用を検討することをお勧めします。
