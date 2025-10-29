---
'description': 'プロファイルガイド最適化のドキュメント'
'sidebar_label': 'プロファイルガイド最適化 (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': 'プロファイルガイド最適化'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# プロファイルガイド最適化

プロファイルガイド最適化 (PGO) は、プログラムがランタイムプロファイルに基づいて最適化されるコンパイラ最適化技術です。

テストによれば、PGOはClickHouseのパフォーマンスを向上させるのに役立ちます。テストでは、ClickBenchテストスイートでQPSに最大15%の改善が見られました。詳細な結果は [こちら](https://pastebin.com/xbue3HMU) で確認できます。パフォーマンスの利点は、あなたの通常のワークロードに依存します - より良い結果が得られる場合もあれば、悪い結果になる場合もあります。

ClickHouseにおけるPGOに関する詳細情報は、対応するGitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) で読むことができます。

## PGOを用いてClickHouseをビルドする方法 {#how-to-build-clickhouse-with-pgo}

PGOには主に2種類あります: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) と [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (AutoFDOとしても知られています)。このガイドでは、ClickHouseを用いたInstrumentation PGOについて説明します。

1. InstrumentedモードでClickHouseをビルドします。Clangでは、`CXXFLAGS`に `-fprofile-generate`オプションを渡すことで行えます。
2. サンプルワークロードでInstrumented ClickHouseを実行します。ここでは通常のワークロードを使用する必要があります。アプローチの一つは、サンプルワークロードとして[ClickBench](https://github.com/ClickHouse/ClickBench)を使用することです。InstrumentationモードのClickHouseは遅く動作する可能性があるため、その点を覚悟し、パフォーマンスが重要な環境でInstrumented ClickHouseを実行しないようにしてください。
3. 前のステップで収集したプロファイルとともに、再度 `-fprofile-use` コンパイラフラグを用いてClickHouseを再コンパイルします。

PGOの適用方法に関する詳細なガイドは、Clangの [ドキュメント](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) にあります。

もし生産環境から直接サンプルワークロードを収集する予定がある場合は、Sampling PGOを使用することをお勧めします。
