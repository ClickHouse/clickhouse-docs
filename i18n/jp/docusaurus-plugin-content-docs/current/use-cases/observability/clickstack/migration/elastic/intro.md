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

## Elastic から ClickStack への移行 \\{#migrating-to-clickstack-from-elastic\\}

このガイドは、Elastic Stack から移行するユーザー、特に Elastic Agent で収集し Elasticsearch に保存されたログ、トレース、メトリクスを Kibana で監視しているユーザーを対象としています。ClickStack における同等の概念やデータ型を説明し、Kibana の Lucene ベースのクエリを HyperDX の構文に変換する方法、およびスムーズに移行するためのデータとエージェントの移行に関するガイダンスを提供します。

移行を開始する前に、ClickStack と Elastic Stack の違いやトレードオフを理解することが重要です。

次のような場合は、ClickStack への移行を検討すべきです:

- 大量のオブザーバビリティデータを取り込んでおり、圧縮効率の低さやリソース利用の非効率さが原因で Elastic のコストが高すぎると感じている。ClickStack は生データに対して少なくとも 10 倍の圧縮率を提供し、ストレージとコンピュートのコストを大幅に削減できます。
- 大規模環境で検索パフォーマンスが低下している、またはインジェストのボトルネックが発生している。
- SQL を用いてオブザーバビリティ・シグナルとビジネスデータを相関付けることで、オブザーバビリティとアナリティクスのワークフローを統合したい。
- OpenTelemetry を中核に据え、ベンダーロックインを回避したい。
- ClickHouse Cloud のストレージとコンピュートの分離を活用し、実質的に無制限のスケールを実現したい — アイドル期間中はインジェスト用コンピュートとオブジェクトストレージに対してのみ課金されるモデルを利用したい。

一方で、次のような場合は ClickStack が適さない可能性があります:

- オブザーバビリティデータを主にセキュリティ用途で利用しており、SIEM に特化した製品を必要としている。
- ユニバーサルプロファイリングがワークフローにおいて重要な要素である。
- ビジネスインテリジェンス (BI) ダッシュボードプラットフォームを必要としている。ClickStack は、意図的に SRE や開発者向けの指向性のあるビジュアルワークフローを備えており、ビジネスインテリジェンス (BI) ツールとして設計されていません。同等の機能が必要な場合は、[Grafana の ClickHouse プラグイン](/integrations/grafana) または [Superset](/integrations/superset) の利用を推奨します。