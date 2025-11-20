---
sidebar_label: 'ClickHouse Cloud のティア'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud のティア'
description: 'ClickHouse Cloud で利用可能なクラウドティア'
keywords: ['cloud tiers', 'service plans', 'cloud pricing tiers', 'cloud service levels']
doc_type: 'reference'
---



# ClickHouse Cloud のティア

ClickHouse Cloud には複数のティアがあります。 
ティアは任意の組織レベルで割り当てられます。そのため、組織内のサービスは同じティアに属します。
このページでは、ユースケースごとに最適なティアについて説明します。

**クラウドティアの概要:**



<table>
  <thead>
    <tr>
      <th />

      <th>[Basic](#basic)</th>
      <th>[Scale (推奨)](#scale)</th>
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
      <td>✓ サービスあたり最大 1 TB</td>
      <td>✓ 無制限</td>
      <td>✓ 無制限</td>
    </tr>

    <tr>
      <td>メモリ</td>
      <td>✓ 合計メモリ 8～12 GiB</td>
      <td>✓ 設定可能</td>
      <td>✓ 設定可能</td>
    </tr>

    <tr>
      <td>可用性</td>
      <td>✓ 1 ゾーン</td>
      <td>✓ 2 ゾーン以上</td>
      <td>✓ 2 ゾーン以上</td>
    </tr>

    <tr>
      <td>バックアップ</td>
      <td>✓ 24 時間ごとに 1 回、保持期間 1 日</td>
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
      <td>早期アップグレード</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>コンピュート分離</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>バックアップを自身のクラウドアカウントへエクスポート</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>スケジュールされたアップグレード</td>

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
      <td>S3 ロールベースアクセス</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>透過的データ暗号化 (CMEK for TDE)</td>

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

- 単一レプリカのデプロイメントをサポートする、コスト効率の高いオプションです。
- 厳格な信頼性保証を必要としない、比較的小規模なデータ量を扱う部門レベルのユースケースに最適です。

:::note
Basicティアのサービスはサイズが固定されており、自動・手動を問わずスケーリングはできません。
サービスをスケーリングする場合は、ScaleティアまたはEnterpriseティアへのアップグレードが必要です。
:::


## Scale {#scale}

強化されたSLA（2つ以上のレプリカ構成）、スケーラビリティ、および高度なセキュリティを必要とするワークロード向けに設計されています。

- 以下のような機能をサポートしています：
  - [プライベートネットワークのサポート](/cloud/security/connectivity/private-networking)
  - [コンピュート間分離](../reference/warehouses#what-is-compute-compute-separation)
  - [柔軟なスケーリング](/manage/scaling)オプション（スケールアップ/ダウン、イン/アウト）
  - [設定可能なバックアップ](/cloud/manage/backups/configurable-backups)


## Enterprise {#enterprise}

大規模でミッションクリティカルな展開において、厳格なセキュリティとコンプライアンス要件を持つ組織に対応します。

- Scaleの全機能に**加えて**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）に加え、`HighMemory（1:8比）`および`HighCPU（1:2比）`のカスタムプロファイルを提供。
- 最高レベルのパフォーマンスと信頼性を保証します。
- エンタープライズグレードのセキュリティをサポート:
  - シングルサインオン（SSO）
  - 強化された暗号化: AWSおよびGCPサービス向け。サービスはデフォルトで当社の鍵により暗号化され、顧客管理暗号化鍵（CMEK）を有効にするために顧客の鍵へローテーション可能です。
- スケジュールされたアップグレードに対応: データベースとクラウドリリースの両方について、アップグレードの曜日と時間帯を選択できます。
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024)およびPCIコンプライアンスを提供します。
- バックアップをユーザーのアカウントにエクスポートします。

:::note
全3つのティアにおけるシングルレプリカサービスは、サイズが固定されています（`8 GiB`、`12 GiB`）
:::


## 異なるティアへのアップグレード {#upgrading-to-a-different-tier}

BasicからScale、またはScaleからEnterpriseへは、いつでもアップグレードできます。ティアをダウングレードする場合は、プレミアム機能を無効化する必要があります。

---

サービスタイプについてご不明な点がございましたら、[料金ページ](https://clickhouse.com/pricing)をご参照いただくか、support@clickhouse.comまでお問い合わせください。
