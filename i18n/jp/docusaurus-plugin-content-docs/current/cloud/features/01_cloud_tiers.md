---
sidebar_label: 'ClickHouse Cloud のティア'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud のティア'
description: 'ClickHouse Cloud で利用可能なクラウドサービスのティア'
keywords: ['クラウドティア', 'サービスプラン', 'クラウド料金プラン', 'クラウドサービスレベル']
doc_type: 'reference'
---



# ClickHouse Cloud のティア

ClickHouse Cloud には複数のティアがあります。  
ティアは組織階層のいずれのレベルにも割り当てることができ、その組織内のサービスは同じティアに属します。
このページでは、お客様のユースケースに最適なティアについて説明します。

**クラウド ティアの概要:**



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
      <td>✓ 総メモリ 8～12 GiB</td>
      <td>✓ 設定可能</td>
      <td>✓ 設定可能</td>
    </tr>

    <tr>
      <td>可用性</td>
      <td>✓ 単一ゾーン</td>
      <td>✓ 2 つ以上のゾーン</td>
      <td>✓ 2 つ以上のゾーン</td>
    </tr>

    <tr>
      <td>バックアップ</td>
      <td>✓ 24 時間ごとに 1 回のバックアップを取得し、1 日間保持</td>
      <td>✓ 設定可能</td>
      <td>✓ 設定可能</td>
    </tr>

    <tr>
      <td>垂直スケーリング</td>

      <td />

      <td>✓ 自動スケーリング</td>
      <td>✓ 標準プロファイルでは自動、カスタムプロファイルでは手動</td>
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
      <td>バックアップをお客様のクラウドアカウントへエクスポート</td>

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

- 単一レプリカのデプロイメントをサポートする、コスト効率の高いオプションです。
- 厳格な信頼性保証を必要としない、小規模なデータ量の部門レベルのユースケースに最適です。

:::note
Basicティアのサービスはサイズが固定されており、自動・手動を問わずスケーリングはできません。
サービスをスケーリングする場合は、ScaleティアまたはEnterpriseティアにアップグレードしてください。
:::


## Scale {#scale}

強化されたSLA（2つ以上のレプリカデプロイメント）、スケーラビリティ、および高度なセキュリティを必要とするワークロード向けに設計されています。

- 以下の機能をサポートします：
  - [プライベートネットワークのサポート](/cloud/security/connectivity/private-networking)
  - [コンピュート-コンピュート分離](../reference/warehouses#what-is-compute-compute-separation)
  - [柔軟なスケーリング](/manage/scaling)オプション（スケールアップ/ダウン、スケールイン/アウト）
  - [設定可能なバックアップ](/cloud/manage/backups/configurable-backups)


## Enterprise {#enterprise}

厳格なセキュリティとコンプライアンス要件を持つ、大規模でミッションクリティカルなデプロイメントに対応します。

- Scaleの全機能、**さらに**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）に加え、`HighMemory（1:8比）`および`HighCPU（1:2比）`のカスタムプロファイル。
- 最高レベルのパフォーマンスと信頼性を保証。
- エンタープライズグレードのセキュリティをサポート:
  - シングルサインオン（SSO）
  - 強化された暗号化: AWSおよびGCPサービス向け。サービスはデフォルトで当社の鍵により暗号化され、顧客管理暗号化鍵（CMEK）を有効にするために顧客の鍵へローテーション可能。
- スケジュールされたアップグレード: データベースとクラウドリリースの両方について、曜日と時間帯を選択してアップグレードを実行可能。
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024)およびPCIコンプライアンスを提供。
- バックアップをユーザーのアカウントにエクスポート。

:::note
全3つのティアにおけるシングルレプリカサービスは、サイズが固定されています（`8 GiB`、`12 GiB`）
:::


## 異なるティアへのアップグレード {#upgrading-to-a-different-tier}

BasicからScale、またはScaleからEnterpriseへは、いつでもアップグレードできます。ティアをダウングレードする場合は、プレミアム機能を無効化する必要があります。

---

サービスタイプについてご不明な点がございましたら、[料金ページ](https://clickhouse.com/pricing)をご参照いただくか、support@clickhouse.comまでお問い合わせください。
