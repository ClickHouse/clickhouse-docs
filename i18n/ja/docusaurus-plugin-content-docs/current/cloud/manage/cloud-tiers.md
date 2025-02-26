---
sidebar_label: ClickHouse Cloud Tiers
slug: /cloud/manage/cloud-tiers
title: サービスの種類
---

# ClickHouse Cloud Tiers

ClickHouse Cloudにはいくつかのティアが用意されています。  
ティアは任意の組織レベルで割り当てられます。したがって、組織内のサービスは同じティアに属します。  
このページでは、特定のユースケースに適したティアについて説明します。

**クラウドティアの概要:**

<table><thead>
  <tr>
    <th></th>
    <th>[基本](#basic)</th>
    <th>[スケール (推奨)](#scale)</th>
    <th>[エンタープライズ](#enterprise)</th>
  </tr></thead>
<tbody>
  <tr>
    <td>**サービス機能**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>サービス数</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>✓ 最大 1 TB / サービス</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
  </tr>
  <tr>
    <td>メモリ</td>
    <td>✓ 合計メモリ 8-12 GiB</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>可用性</td>
    <td>✓ 1ゾーン</td>
    <td>✓ 2以上のゾーン</td>
    <td>✓ 2以上のゾーン</td>
  </tr>
  <tr>
    <td>バックアップ</td>
    <td>✓ 24時間ごとに1回バックアップ、保持期間1日</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>垂直スケーリング</td>
    <td></td>
    <td>✓ 自動スケーリング</td>
    <td>✓ 標準プロファイルには自動、カスタムプロファイルには手動</td>
  </tr>
  <tr>
    <td>水平スケーリング</td>
    <td></td>
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
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>コンピュート分離</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>自分のクラウドアカウントへのバックアップエクスポート</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>スケジュールされたアップグレード</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>カスタムハードウェアプロファイル</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>**セキュリティ**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>SAML/SSO</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>MFA</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>SOC 2 タイプ II</td>
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
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>S3 ロールベースアクセス</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>透過的データ暗号化 (CMEK for TDE)</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>HIPAA</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
</tbody></table>

## 基本 {#basic}

- シングルレプリカデプロイをサポートするコスト効率の良いオプション。  
- 確実な信頼性保証のない、小規模なデータボリュームの部門利用ケースに最適です。

:::note
基本ティアのサービスはサイズが固定されており、手動および自動でのスケーリングはできません。  
ユーザーはサービスをスケールまたはエンタープライズティアにアップグレードすることで、サービスをスケールさせることができます。
:::

## スケール {#scale}

強化されたSLA（2以上のレプリカデプロイ）、スケーラビリティ、および高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような機能のサポートを提供します：  
  - [プライベートネットワーキングサポート](../security/private-link-overview.md).  
  - [コンピュート分離](../reference/warehouses#what-is-compute-compute-separation).  
  - [柔軟なスケーリング](../manage/scaling.md)オプション（スケールアップ/ダウン、イン/アウト）。

## エンタープライズ {#enterprise}

厳格なセキュリティおよびコンプライアンスニーズを持つ大規模なミッションクリティカルなデプロイメントに対応しています。

- スケールのすべてに加え、  
- 柔軟なスケーリング：標準プロファイル（`1:4 vCPU:メモリ比`）、`HighMemory (1:8比)`および`HighCPU (1:2比)`のカスタムプロファイル。  
- 最高レベルのパフォーマンスと信頼性保証を提供します。  
- エンタープライズグレードのセキュリティをサポート：  
  - シングルサインオン (SSO)  
  - 強化された暗号化：AWSおよびGCPサービス用。サービスはデフォルトで当社のキーによって暗号化され、顧客管理の暗号化キー (CMEK) を有効にするためにキーを回転することができます。  
- スケジュールされたアップグレードを許可：ユーザーは、データベースおよびクラウドリリースのアップグレードのための曜日/時間ウィンドウを選択できます。  
- [HIPAA](../security/compliance-overview.md/#hipaa)コンプライアンスを提供します。  
- バックアップをユーザーのアカウントにエクスポートします。

:::note 
全ての3つのティア間でのシングルレプリカサービスは、サイズが固定されています（`8 GiB`、`12 GiB`）
:::

## 他のティアへのアップグレード {#upgrading-to-a-different-tier}

基本からスケールへのアップグレード、またはスケールからエンタープライズへのアップグレードは常に可能です。

:::note
ティアのダウングレードはできません。
:::

---

サービスの種類について質問がある場合は、[料金ページ](https://clickhouse.com/pricing)を参照するか、support@clickhouse.com にお問い合わせください。
