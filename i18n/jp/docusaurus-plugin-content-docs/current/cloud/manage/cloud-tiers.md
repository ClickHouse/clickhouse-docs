---
sidebar_label: ClickHouse Cloud Tiers
slug: /cloud/manage/cloud-tiers
title: サービスの種類
---


# ClickHouse Cloud Tiers

ClickHouse Cloudにはいくつかのティアがあります。  
ティアは任意の組織レベルに割り当てられ、したがって組織内のサービスは同じティアに所属します。  
このページでは、特定のユースケースに適したティアについて説明します。

**クラウドティアの概要:**

<table><thead>
  <tr>
    <th></th>
    <th>[Basic](#basic)</th>
    <th>[Scale (推奨)](#scale)</th>
    <th>[Enterprise](#enterprise)</th>
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
    <td>✓ 最大1 TB / サービス</td>
    <td>✓ 無制限</td>
    <td>✓ 無制限</td>
  </tr>
  <tr>
    <td>メモリ</td>
    <td>✓ 合計8-12 GiBメモリ</td>
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
    <td>✓ 24時間ごとに1バックアップ、1日保持</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>垂直スケーリング</td>
    <td></td>
    <td>✓ 自動スケーリング</td>
    <td>✓ 標準プロファイル用の自動、カスタムプロファイル用の手動</td>
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
    <td>計算と計算の分離</td>
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

- 単一レプリカ展開をサポートするコスト効率の高いオプション。  
- 硬い信頼性保証がない小規模データボリュームの部門用途に最適です。

:::note
Basicティアのサービスはサイズが固定され、自動および手動のスケーリングは許可されていません。  
ユーザーは、サービスをスケールまたはEnterpriseティアにアップグレードできます。
:::

## Scale {#scale}

強化されたSLA（2以上のレプリカ展開）、スケーラビリティ、高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような機能をサポートしています: 
  - [プライベートネットワーキングサポート](../security/private-link-overview.md).
  - [計算と計算の分離](../reference/warehouses#what-is-compute-compute-separation).
  - [柔軟なスケーリング](../manage/scaling.md)オプション（スケールアップ/ダウン、イン/アウト）。

## Enterprise {#enterprise}

厳格なセキュリティおよびコンプライアンスニーズを持つ大規模でミッションクリティカルな展開に対応します。

- Scale内のすべての機能、**さらに**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）、および`HighMemory (1:8比)`と`HighCPU (1:2比)`のカスタムプロファイル。
- 最高レベルのパフォーマンスと信頼性の保証を提供します。
- エンタープライズグレードのセキュリティをサポート:
  - シングルサインオン（SSO）
  - 強化された暗号化: AWSおよびGCPサービス向け。サービスはデフォルトで当社のキーによって暗号化され、カスタマーマネージド暗号化キー（CMEK）を有効にするためにキーをローテーションできます。
- スケジュールされたアップグレードを許可: ユーザーは、データベースおよびクラウドリリースのアップグレードのための曜日/時間帯を選択できます。  
- [HIPAA](../security/compliance-overview.md/#hipaa)準拠を提供します。
- バックアップをユーザーのアカウントにエクスポートします。

:::note 
3つのティアすべての単一レプリカサービスはサイズが固定されていることを目的としています（`8 GiB`、`12 GiB`）。
:::

## 別のティアへのアップグレード {#upgrading-to-a-different-tier}

BasicからScale、またはScaleからEnterpriseへのアップグレードは常に可能です。

:::note
ティアのダウングレードは不可能です。
:::

---

サービスの種類に関する質問がある場合は、[料金ページ](https://clickhouse.com/pricing)をご覧いただくか、support@clickhouse.comまでお問い合わせください。
