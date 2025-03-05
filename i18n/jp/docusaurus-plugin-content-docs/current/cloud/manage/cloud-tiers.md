---
sidebar_label: ClickHouse Cloudティア
slug: /cloud/manage/cloud-tiers
title: サービスタイプ
---


# ClickHouse Cloudティア

ClickHouse Cloudにはいくつかのティアが用意されています。  
ティアは、組織の任意のレベルに割り当てられます。したがって、組織内のサービスは同じティアに属します。  
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
    <td>✓ 8-12 GiBの合計メモリ</td>
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
    <td>✓ 24時間ごとに1つのバックアップ、保持1日</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>垂直スケーリング</td>
    <td></td>
    <td>✓ 自動スケーリング</td>
    <td>✓ 標準プロファイルでは自動、カスタムプロファイルでは手動</td>
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
    <td>コンピュート-コンピュート分離</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>自分のクラウドアカウントへのバックアップのエクスポート</td>
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

- シングルレプリカ展開をサポートするコスト効率の良いオプションです。  
- 信頼性の保証が厳しくない小規模なデータボリュームの部門向けユースケースに最適です。

:::note
ベーシックティアのサービスはサイズが固定されており、自動および手動の両方のスケーリングは許可されていません。  
ユーザーは、サービスをスケールやエンタープライズティアにアップグレードすることができます。
:::

## Scale {#scale}

強化されたSLA（2以上のレプリカ展開）、スケーラビリティ、そして高度なセキュリティを必要とするワークロード向けに設計されています。

- 次の機能をサポートします:
  - [プライベートネットワーキングサポート](../security/private-link-overview.md).
  - [コンピュート-コンピュート分離](../reference/warehouses#what-is-compute-compute-separation).
  - [柔軟なスケーリング](../manage/scaling.md)オプション（スケールアップ/ダウン、イン/アウト）。

## Enterprise {#enterprise}

厳格なセキュリティおよびコンプライアンスのニーズを有する大規模なミッションクリティカルな展開に対応しています。

- Scaleの内容すべて、**プラス**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）、および`HighMemory (1:8比)`と`HighCPU (1:2比)`のカスタムプロファイル。
- 最高レベルのパフォーマンスと信頼性の保証を提供します。
- エンタープライズグレードのセキュリティをサポートします:
  - シングルサインオン（SSO）
  - 強化された暗号化: AWSおよびGCPサービス用。サービスはデフォルトで我々のキーによって暗号化され、顧客管理暗号化キー（CMEK）を有効にするためにキーをローテーションできます。
- スケジュールされたアップグレードを許可します: ユーザーは、アップグレードの曜日/時間帯を選択できます。データベースとクラウドのリリースの両方に対応します。  
- [HIPAA](../security/compliance-overview.md/#hipaa-since-2024)コンプライアンスを提供します。
- ユーザーのアカウントへのバックアップをエクスポートします。

:::note 
すべてのティアでのシングルレプリカサービスはサイズが固定されています（`8 GiB`、`12 GiB`）。
:::

## 別のティアへのアップグレード {#upgrading-to-a-different-tier}

BasicからScaleまたはScaleからEnterpriseへいつでもアップグレードできます。

:::note
ティアのダウングレードは不可能です。
:::

---

サービスの種類に関して質問がある場合は、[価格ページ](https://clickhouse.com/pricing)をご覧いただくか、support@clickhouse.comまでお問い合わせください。
