---
slug: /cloud/managed-postgres/pricing
sidebar_label: '料金'
title: '料金'
description: 'ClickHouse が管理する Postgres の料金モデル、ティア、インスタンスタイプ、ベータの料金詳細'
keywords: ['Postgres 料金', 'Managed Postgres コスト', 'Postgres ベータ料金', 'Postgres pricing calculator', 'NVMe 料金', 'Postgres ティア料金']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse が管理する Postgres は、ローカル NVMe ストレージを基盤として構築されています。これにより、従来のネットワーク接続ストレージアーキテクチャに伴うコスト増を抑えながら、本番運用に耐える性能と ClickHouse とのネイティブな統合を実現します。このページでは、このサービスの料金モデル、利用可能なインスタンスタイプ、各ティアの比較について説明します。

ClickHouse が管理する Postgres は現在ベータとして提供されています。2026 年 6 月 15 日に課金計測が開始されるまでは、このサービスは無料で利用できます。これにより、課金開始前に各チームは適切なインスタンスサイズを見極めることができます。

ベータ期間中は、初期導入のお客様へのコミットメントの一環として、すべてのプランに 50% の割引が適用されます。料金は、1 vCPU、8 GB RAM、59 GB NVMe ストレージ構成で **月額約 30 ドル** からです。

:::tip[料金計算ツール]
正確な料金については、[料金計算ツール](https://clickhouse.com/pricing?service=postgres#pricing-calculator)を使用して、ワークロードに最適な構成と料金を確認してください。
:::

## 価格対性能 \{#price-performance\}

このサービスはローカル NVMe ストレージ上で動作するため、多くのワークロードで、従来のネットワーク接続ストレージアーキテクチャと比べて、大幅に優れた価格対性能を実現できます。同等のハードウェアプロファイルにおける他の Postgres プロバイダーとのベンチマーク比較については、[PostgresBench](https://postgresbench.clickhouse.com/)を参照してください。

顧客によっては、同等のワークロードに対して必要なコンピュートが最大で 2～4 倍少なくて済む場合があります。プロバイダー間で価格を比較する際には、こうした潜在的な効率向上を考慮してください。ただし、実際の改善幅はワークロードによって異なるため、各自のアプリケーションで検証する必要があります。

## 料金モデル \{#pricing-model\}

このサービスはローカル NVMe ストレージを使用して稼働するため、料金はコンピュート料金とディスク料金を分けて算出するのではなく、CPU、メモリ、ストレージを含む VM 構成全体に基づいて決まります。

50 種類以上の構成を利用でき、1 vCPU / 8 GB RAM / 59 GB NVMe から 96 vCPU / 768 GB RAM / 60 TB NVMe ストレージまで幅広く用意されているため、コンピュート負荷の高い Postgres ワークロードにも、ストレージを多く必要とする Postgres ワークロードにも柔軟に対応できます。

### ティア別料金 \{#tier-based-pricing\}

料金、機能、リソース制限は組織のティアによって異なります ([Basic、Scale、Enterprise](/cloud/manage/cloud-tiers)) 。ただし、すべてのティアには、ローカル NVMe ストレージ上で動作する本番環境対応の Postgres、ClickHouse へのネイティブ CDC、`pg_clickhouse` 拡張機能など、サービスの中核機能が含まれます。

以下の表は、各ティアに含まれる機能、提供内容、および制限をまとめたものです。ティア間の料金を比較するには、[料金計算ツール](https://clickhouse.com/pricing?service=postgres#pricing-calculator)を参照してください。

<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0'}}>
  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Basic</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>新しいアイデアの検証や小規模なスタータープロジェクトに最適です。ストレージ容量とメモリには制限があります。</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">コンピュートで最大 8 GB の RAM</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">最大 118 GB のローカル NVMe ストレージ</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">保持期間 1 日のバックアップ</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">PITR とブランチ</a></li>
      <li><a href="/docs/cloud/managed-postgres/high-availability">高可用性</a>を含む</li>
      <li>保持期間 1 日の<a href="/docs/cloud/managed-postgres/monitoring/query-insights">クエリインサイト</a></li>
      <li><a href="/docs/cloud/managed-postgres/extensions">90 種類以上の Postgres 拡張機能</a></li>
      <li><a href="/docs/cloud/managed-postgres/clickhouse-integration">ClickHouse へのネイティブ CDC</a></li>
      <li><a href="/docs/cloud/managed-postgres/extensions"><code>pg&#95;clickhouse</code> 拡張機能</a></li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">フルマネージドのデータ移行</a></li>
      <li>1 営業日以内の応答時間でエキスパートサポートを提供</li>
      <li>Google または Microsoft のソーシャルログインを使用する<a href="/docs/cloud/security/manage-my-account">シングルサインオン認証 (SSO) </a></li>
      <li><a href="/docs/cloud/security/manage-my-account#mfa">多要素認証</a></li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Scale</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>本番環境、大規模データ、またはプロフェッショナル用途に対応。</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Basic のすべてに加えて</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">最大 60 TB のストレージ</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">最大 96 vCPU と 768 GB RAM</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">ストレージの自動スケーリング</a></li>
      <li><a href="/docs/cloud/managed-postgres/read-replicas">読み取りレプリカ</a></li>
      <li><a href="/docs/cloud/managed-postgres/security">プライベートネットワーク</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">7 日間保持されるバックアップ</a></li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">クエリインサイト</a> の保持期間は 7 日間</li>
      <li>重大度 1 の問題に対する、24 時間 365 日・1 時間以内応答のエキスパートサポート</li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Enterprise</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>本番環境での運用、大規模データの処理、またはエンタープライズ用途向け。</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Scale のすべてに加えて、以下が含まれます</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li>重大度 1 の問題に対して 30 分以内に応答する Enterprise サポート</li>
      <li><a href="/docs/cloud/infrastructure/clickhouse-private">プライベートリージョン</a></li>
      <li>専任のリードサポートエンジニア</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">カスタム拡張機能</a> (*要承認) </li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">移行向けコンサルティングガイド</a></li>
      <li><a href="/docs/cloud/managed-postgres/upgrades">計画的なアップグレード</a></li>
    </ul>
  </div>
</div>

### インスタンスタイプ \{#instance-types\}

インスタンス構成は、ワークロードの特性に応じたインフラストラクチャの選定を簡素化できるよう、3 つのカテゴリに分かれています。

* **メモリ最適化:** メモリ対 CPU 比率が高い (1:8 や 1:4 など) メモリ集約型ワークロード向けに設計されています。AWS Graviton ベースの `r8gd`、`r6gd`、`m6gd`、`m8gd` ファミリーをサポートします。大規模なワーキングセット、高いキャッシュヒット率、メモリがボトルネックになりやすいデータベースワークロードに最適です。
* **ストレージ最適化:** コンピュートをそれに応じて増やさずに、大容量のローカル NVMe ストレージを必要とするワークロード向けに設計されています。AWS Graviton ベースの `i8g`、`i8ge`、`i7i`、`i7ie` ファミリーをサポートし、構成によっては最大 60 TB のローカル NVMe ストレージを利用できます。大規模なデータセット、時系列ワークロード、ログやイベントの保存、ストレージ負荷の高い OLTP ワークロードに最適です。
* **CPU 最適化:** メモリ対 CPU 比率が低い (通常は 1:2 前後) コンピュート集約型ワークロード向けに設計されています。`c6gd` ファミリーをサポートし、高い同時実行数が求められるトランザクションワークロードや、CPU がボトルネックになりやすいクエリに最適です。

## 料金計算ツール \{#pricing-calculator\}

さまざまなワークロードプロファイルや構成における導入コストを見積もるには、[料金計算ツール](https://clickhouse.com/pricing?service=postgres#pricing-calculator)を使用します。次の項目をカスタマイズできます。

* 組織ティア (Basic、Scale、Enterprise)
* リージョン
* 構成タイプ (メモリ、ストレージ、または CPU 最適化)
* CPU アーキテクチャ (ARM または x86)
* vCPU、メモリ、ストレージのサイジング
* スタンバイ / 高可用性 (HA) 構成

これにより、50 を超える対応構成の組み合わせで料金を比較し、ワークロードに最適な構成を見つけることができます。

## ベータ料金の主なポイント \{#beta-pricing-highlights\}

ベータ期間中は、以下の条件が適用されます。

* **2026年6月15日**に使用量の計測が開始されるまで、サービスは無料です
* **ClickPipes** によるネイティブ CDC は追加料金なしで利用できます
* 現時点では、**network egress** および **バックアップ** に料金はかかりません
* 現在、すべてのプランに **50% のベータ価格** が適用されています

## 免責事項 \{#disclaimers\}

製品はベータ期間中も進化を続けるため、一般提供 (GA) に先立って価格設定やパッケージ内容が見直される場合があります。以下の点にご注意ください。

* ネットワークエグレス料金は、GA 後に導入されます。データベースと同じ場所で稼働するアプリケーションでは、エグレスコストは最小限に抑えられる見込みです。
* 現在策定中の上限を超える保持期間については、GA 時点で追加のバックアップ料金が適用される可能性があります。
* Postgres と ClickHouse が同一リージョンに配置されている場合、ClickPipes 経由のネイティブ CDC は、統合 OLTP + OLAP プラットフォームというビジョンに沿って、GA 時点でも無料、またはごく低価格にとどまる見込みです。
* スケーリング、フェイルオーバー、スタンバイのプロビジョニング時には、データベースをオンラインのまま維持するため、短時間にわたって 2 つのインスタンスが並行して稼働します。移行が完了するまでの間、両方のインスタンスの料金が一時的に重複して発生する場合があります。この期間の長さは、インスタンスタイプとストレージ容量によって異なります。
* 選択したインスタンスタイプが指定したリージョンで一時的に利用できない場合、データベースをオンラインのまま維持するために、同等のインスタンスタイプをプロビジョニングすることがあります。料金は、実際にプロビジョニングされたインスタンスのレートで請求されます。
* 既存の価格設定も、ベータ期間中に実際の顧客の利用パターン、ワークロードの特性、インフラストラクチャ要件についての理解が深まるにつれて、GA に近づく段階で変更される可能性があります。