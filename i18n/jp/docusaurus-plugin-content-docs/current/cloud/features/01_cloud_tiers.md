---
sidebar_label: 'ClickHouse Cloud のサービスティア'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud のサービスティア'
description: 'ClickHouse Cloud で利用可能なクラウドサービスティア'
keywords: ['クラウドサービスティア', 'サービスプラン', 'クラウド料金プラン', 'クラウドサービスレベル']
doc_type: 'reference'
---

# ClickHouse Cloud のティア {#clickhouse-cloud-tiers}

ClickHouse Cloud には複数のティアが用意されています。 
ティアは任意の組織レベルで割り当てられるため、その組織内のサービスは同じティアに属します。
このページでは、特定のユースケースに対してどのティアが適しているかを説明します。

**Cloud ティアの概要:**

<table>
  <thead>
    <tr>
      <th />

      <th>[Basic](#basic)</th>
      <th>[Scale（推奨）](#scale)</th>
      <th>[Enterprise](#enterprise)</th>
    </tr>
  </thead>

  <tbody>
    <tr className="table-category-header">
      <td>**サービス機能**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>サービス数</td>
      <td>✓ 無制限</td>
      <td>✓ 無制限</td>
      <td>✓ 無制限</td>
    </tr>

    <tr>
      <td>ストレージ</td>
      <td>✓ 1 サービスあたり最大 1 TB</td>
      <td>✓ 無制限</td>
      <td>✓ 無制限</td>
    </tr>

    <tr>
      <td>メモリ</td>
      <td>✓ 合計 8～12 GiB のメモリ</td>
      <td>✓ 設定可能</td>
      <td>✓ 設定可能</td>
    </tr>

    <tr>
      <td>可用性</td>
      <td>✓ 1 ゾーン</td>
      <td>✓ 2 つ以上のゾーン</td>
      <td>✓ 2 つ以上のゾーン</td>
    </tr>

    <tr>
      <td>バックアップ</td>
      <td>✓ 24 時間ごとに 1 回のバックアップ、保持期間 1 日</td>
      <td>✓ 設定可能</td>
      <td>✓ 設定可能</td>
    </tr>

    <tr>
      <td>垂直スケーリング</td>

      <td />

      <td>✓ 自動スケーリング</td>
      <td>✓ 標準プロファイルは自動、カスタムプロファイルは手動</td>
    </tr>

    <tr>
      <td>水平スケーリング</td>

      <td />

      <td>✓ 手動スケーリング</td>
      <td>✓ 手動スケーリング</td>
    </tr>

    <tr>
      <td>ClickPipes</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>先行アップグレード</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>コンピュート間の分離</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>バックアップを自分のクラウドアカウントにエクスポート</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>スケジュール済みアップグレード</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>カスタムハードウェアプロファイル</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr className="table-category-header">
      <td>**セキュリティ**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>SAML/SSO</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>MFA</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>SOC 2 Type II</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>ISO 27001</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>プライベートネットワーキング</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>S3 ロールベースのアクセス</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>透過的なデータ暗号化 (CMEK for TDE)</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>HIPAA</td>

      <td />

      <td />

      <td>✓</td>
    </tr>
  </tbody>
</table>

## Basic {#basic}

- 単一レプリカのデプロイメントをサポートするコスト効率の高いオプションです。
- 厳密な信頼性保証を必要としない、小規模なデータ量の部門レベルのユースケースに最適です。

:::note
Basic ティアのサービスは、あらかじめ固定されたサイズでの利用を前提としており、自動・手動いずれのスケーリングも行えません。
スケーリングが必要な場合は、Scale または Enterprise ティアへアップグレードできます。
:::

## Scale {#scale}

強化された SLA（2 つ以上のレプリカを持つデプロイメント）、スケーラビリティ、高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような機能をサポートします:
  - [プライベートネットワーキング](/cloud/security/connectivity/private-networking)
  - [コンピュート間の分離（compute-compute separation）](../reference/warehouses#what-is-compute-compute-separation)
  - [柔軟なスケーリング](/manage/scaling) オプション（スケールアップ/ダウン、スケールイン/アウト）
  - [設定可能なバックアップ](/cloud/manage/backups/configurable-backups)

## エンタープライズ {#enterprise}

厳格なセキュリティおよびコンプライアンス要件を持つ、大規模でミッションクリティカルなデプロイメント向けのプランです。

- Scale に含まれるすべてに加えて、**さらに**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:memory ratio`）に加え、`HighMemory (1:8 ratio)` および `HighCPU (1:2 ratio)` のカスタムプロファイルを利用可能。
- 最高レベルのパフォーマンスとレジリエンスを保証。
- エンタープライズグレードのセキュリティに対応:
  - シングルサインオン (SSO)
  - 強化された暗号化: AWS および GCP サービス向け。サービスはデフォルトで当社のキーにより暗号化されており、ユーザーのキーにローテーションして Customer Managed Encryption Keys (CMEK) を有効化可能。
- スケジュールされたアップグレードに対応: データベースとクラウドの両方のリリースについて、アップグレードを行う曜日および時間帯を選択可能。  
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) および PCI のコンプライアンス要件に準拠。
- バックアップをユーザーのアカウントへエクスポート可能。

:::note 
3 つすべてのティアにおいて、単一レプリカのサービスはサイズを固定（`8 GiB`、`12 GiB`）とするよう設計されています。
:::

## 別のプランへのアップグレード {#upgrading-to-a-different-tier}

Basic から Scale へ、または Scale から Enterprise へは、いつでもアップグレードできます。プランをダウングレードする場合は、プレミアム機能を無効にする必要があります。

---

サービスプランについてご不明な点がある場合は、[料金ページ](https://clickhouse.com/pricing)をご覧いただくか、support@clickhouse.com までお問い合わせください。