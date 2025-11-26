---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: 'Elastic から ClickStack への移行'
pagination_prev: null
pagination_next: null
sidebar_label: '概要'
sidebar_position: 0
description: 'Elastic から ClickHouse Observability Stack への移行の概要'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'guide'
---



## Elastic から ClickStack への移行 {#migrating-to-clickstack-from-elastic}

このガイドは Elastic Stack から移行するユーザー、特に Elastic Agent で収集し Elasticsearch に保存されたログ、トレース、メトリクスを Kibana で監視している方を対象としています。ClickStack における同等の概念とデータ型を整理し、Kibana の Lucene ベースのクエリを HyperDX の構文へ変換する方法を説明し、スムーズに移行できるようデータとエージェントの両方の移行手順の指針を提供します。

移行を始める前に、ClickStack と Elastic Stack の間のトレードオフを理解しておくことが重要です。

次のような場合は、ClickStack への移行を検討してください:

- 大量のオブザーバビリティ・データを取り込んでおり、圧縮効率の悪さやリソース利用効率の低さにより Elastic のコストが高くついている。ClickStack は生データに対して少なくとも 10 倍の圧縮率を提供し、ストレージおよびコンピュートコストを大幅に削減できます。
- 大規模環境で検索性能が出ない、もしくはインジェストのボトルネックに直面している。
- SQL を用いてオブザーバビリティシグナルとビジネスデータを相関付けることで、オブザーバビリティとアナリティクスのワークフローを統合したい。
- OpenTelemetry を中核に据え、ベンダーロックインを避けたい。
- ClickHouse Cloud のストレージとコンピュートの分離を活用し、実質的に無制限のスケールを実現したい。アイドル期間中はインジェスト用のコンピュートとオブジェクトストレージに対してのみ支払うモデルを望んでいる。

一方で、次のような場合は ClickStack は適さない可能性があります:

- オブザーバビリティデータを主にセキュリティ用途で使用しており、SIEM に特化したプロダクトが必要である。
- ユニバーサルプロファイリングがワークフローの中で不可欠である。
- ビジネスインテリジェンス (BI) のダッシュボードプラットフォームが必要である。ClickStack は意図的に SRE と開発者向けの、明確な設計思想に基づくビジュアルワークフローを備えており、ビジネスインテリジェンス (BI) ツールとして設計されていません。同等の機能については、[ClickHouse プラグイン付きの Grafana](/integrations/grafana) または [Superset](/integrations/superset) の利用を推奨します。
