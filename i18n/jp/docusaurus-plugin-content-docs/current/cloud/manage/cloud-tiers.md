---
sidebar_label: 'ClickHouse Cloud Tiers'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud Tiers'
description: 'ClickHouse Cloudで利用可能なクラウドティア'
---


# ClickHouse Cloud Tiers

ClickHouse Cloudにはいくつかのティアがあります。  
ティアは、任意の組織レベルで割り当てられます。したがって、組織内のサービスは同じティアに属します。  
このページでは、特定のユースケースに適したティアについて説明します。

**クラウドティアの概要:**

<table><thead>
  <tr>
    <th></th>
    <th>[Basic](#basic)</th>
    <th>[Scale (Recommended)](#scale)</th>
    <th>[Enterprise](#enterprise)</th>
  </tr></thead>
<tbody>
  <tr>
    <td>**サービス機能**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>サービスの数</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>✓ 最大1 TB / サービス</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
  </tr>
  <tr>
    <td>メモリ</td>
    <td>✓ 合計8-12 GiBのメモリ</td>
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
    <td>✓ 24時間ごとに1回のバックアップ、1日保持</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>垂直スケーリング</td>
    <td></td>
    <td>✓ 自動スケーリング</td>
    <td>✓ 標準プロファイルは自動、カスタムプロファイルは手動</td>
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
    <td>コンピュートとコンピュートの分離</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>バックアップを自分のクラウドアカウントにエクスポート</td>
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
    <td>SOC 2タイプII</td>
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
    <td>S3ロールベースのアクセス</td>
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

## Basic {#basic}

- シングルレプリカ展開をサポートするコスト効率の良いオプションです。  
- 厳しい信頼性保証のない小規模データボリュームの部門利用ケースに最適です。

:::note
Basicティアのサービスはサイズが固定されており、自動および手動の両方のスケーリングを許可しません。  
ユーザーは、サービスをスケールアップするためにScaleまたはEnterpriseティアにアップグレードできます。
:::

## Scale {#scale}

強化されたSLA（2以上のレプリカ展開）、スケーラビリティ、そして高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような特徴をサポートしています:  
  - [プライベートネットワーキングサポート](../security/private-link-overview.md)。  
  - [コンピュートとコンピュートの分離](../reference/warehouses#what-is-compute-compute-separation)。  
  - [柔軟なスケーリング](../manage/scaling.md)オプション（スケールアップダウン、インアウト）。

## Enterprise {#enterprise}

大規模でミッションクリティカルな展開に応え、厳格なセキュリティおよびコンプライアンスのニーズを持つ方針に特化しています。

- Scaleのすべてを含み、**さらに**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）、および`HighMemory (1:8比)`と`HighCPU (1:2比)`のカスタムプロファイル。
- 最高レベルのパフォーマンスと信頼性の保証を提供します。
- 企業向けのセキュリティをサポートします:  
  - シングルサインオン (SSO)  
  - 拡張暗号化: AWSおよびGCPサービス用。サービスはデフォルトで当社のキーによって暗号化され、顧客管理暗号化キー（CMEK）を有効にするためにそのキーにローテーションできます。  
- スケジュールされたアップグレードを許可します: ユーザーは、データベースおよびクラウドリリースのアップグレードの曜日/時間帯を選択できます。  
- [HIPAA](../security/compliance-overview.md/#hipaa-since-2024)コンプライアンスを提供します。  
- バックアップをユーザーのアカウントにエクスポートします。

:::note 
3つのティア全てにまたがるシングルレプリカサービスは、サイズが固定されることになっています（`8 GiB`, `12 GiB`）
:::

## 別のティアへのアップグレード {#upgrading-to-a-different-tier}

BasicからScale、またはScaleからEnterpriseへ常にアップグレードできます。

:::note
ティアのダウングレードは可能ではありません。
:::

---

サービスの種類について質問がある場合は、[料金ページ](https://clickhouse.com/pricing)を参照するか、support@clickhouse.comに連絡してください。
