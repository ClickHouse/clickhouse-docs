---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'マネージド版 ClickStack 入門'
sidebar_label: 'マネージド'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'マネージド版 ClickStack 入門'
doc_type: 'guide'
keywords: ['マネージド ClickStack', '入門', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import SetupManagedIngestion from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
import ProviderSelection from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import NavigateClickStackUI from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import service_connect from '@site/static/images/_snippets/service_connect.png';

<BetaBadge />

**Managed ClickStack** を **ClickHouse Cloud** 上にデプロイする方法が、最も簡単な始め方です。これにより、インジェスト、スキーマ、オブザーバビリティのワークフローを完全に制御しつつ、フルマネージドでセキュアなバックエンドが提供されます。これによって自前で ClickHouse を運用する必要がなくなり、次のような多くの利点が得られます。

* ストレージとは独立したコンピュートの自動スケーリング
* オブジェクトストレージに基づく、低コストかつ事実上無制限の保持期間
* ウェアハウスを使って読み取り・書き込みワークロードを個別に分離できる機能
* 統合認証
* 自動バックアップ
* セキュリティおよびコンプライアンス機能
* シームレスなアップグレード

<VerticalStepper headerLevel="h2">
  ## ClickHouse Cloud にサインアップする \{#signup-to-clickhouse-cloud\}

  [ClickHouse Cloud](https://console.clickhouse.cloud) で Managed ClickStack サービスを作成するには、次の手順でサインアップします。

  * [サインアップページ](https://console.clickhouse.cloud/signUp) でアカウントを作成する
  * Email、または Google SSO、Microsoft SSO、AWS Marketplace、Google Cloud、Microsoft Azure のいずれかを使って登録方法を選択する
  * Email とパスワードで登録した場合は、受信したメール内のリンクから 24 時間以内にメールアドレスを確認することを忘れない
  * 先ほど作成したユーザー名とパスワードを使用してログインする

  <Image img={signup_page} size="md" alt="Cloud へのサインアップ" border />

  ## ユースケースを選択する \{#select-your-use-case\}

  <UseCaseSelector />

  ## プロバイダー、リージョン、データサイズを指定する \{#specify-your-data-size\}

  <ProviderSelection />

  ## インジェストをセットアップする \{#setup-ingestion\}

  <SetupManagedIngestion />

  ## インジェストを開始する \{#start-ingestion\}

  <StartManagedIngestion />

  ## ClickStack UI に移動する \{#navigate-to-clickstack-ui-cloud\}

  <NavigateClickStackUI />

  ## 次のステップ \{#next-steps\}

  :::important[デフォルト認証情報を記録する]
  上記の手順の中でデフォルトの認証情報を記録していない場合は、サービスに移動して `Connect` を選択し、パスワードおよび HTTP/ネイティブエンドポイントを記録してください。これらの管理者認証情報は安全に保管し、他のガイドでも再利用できるようにしておきます。
  :::

  <Image img={service_connect} size="md" alt="サービス接続" border />

  新しいユーザーのプロビジョニングや追加のデータソースの追加などの作業を行うには、[Managed ClickStack のデプロイガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks) を参照してください。
</VerticalStepper>
