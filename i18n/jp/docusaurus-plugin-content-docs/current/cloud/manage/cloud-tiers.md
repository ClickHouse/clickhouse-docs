---
'sidebar_label': 'ClickHouse Cloud Tiers'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud Tiers'
'description': 'Cloud tiers available in ClickHouse Cloud'
---




# ClickHouse Cloud Tiers

ClickHouse Cloudには、いくつかのティアが用意されています。  
ティアは、任意の組織レベルで割り当てられます。したがって、組織内のサービスは同じティアに属します。  
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
    <td>✓ 1 ゾーン</td>
    <td>✓ 2 つ以上のゾーン</td>
    <td>✓ 2 つ以上のゾーン</td>
  </tr>
  <tr>
    <td>バックアップ</td>
    <td>✓ 24時間ごとに1回のバックアップ、1日保存</td>
    <td>✓ 設定可能</td>
    <td>✓ 設定可能</td>
  </tr>
  <tr>
    <td>垂直スケーリング</td>
    <td></td>
    <td>✓ 自動スケーリング</td>
    <td>✓ 標準プロファイルの自動、カスタムプロファイルの手動</td>
  </tr>
  <tr>
    <td>横方向スケーリング</td>
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
    <td>コンピュートの分離</td>
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
    <td>スケジュールアップグレード</td>
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
    <td>プライベートネットワーク</td>
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

- 単一レプリカデプロイメントをサポートするコスト効率の高いオプションです。  
- 確固たる信頼性保証が必要ない小規模なデータボリュームの部門やユースケースに最適です。

:::note
Basicティアのサービスは、サイズが固定されていることを意図しており、自動および手動のスケーリングは許可されていません。  
ユーザーは、サービスをスケールするためにScaleまたはEnterpriseティアにアップグレードできます。
:::

## Scale {#scale}

強化されたSLA（2つ以上のレプリカデプロイメント）、スケーラビリティ、および高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような機能のサポートを提供します: 
  - [プライベートネットワーキングのサポート](../security/private-link-overview.md).
  - [コンピュートの分離](../reference/warehouses#what-is-compute-compute-separation).
  - [柔軟なスケーリング](../manage/scaling.md) オプション（スケールアップ/ダウン、イン/アウト）。

## Enterprise {#enterprise}

厳格なセキュリティおよびコンプライアンス要件を持つ大規模なミッションクリティカルなデプロイに対応します。

- Scaleのすべて、**さらに**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:メモリ比`）、および`HighMemory (1:8比)`や`HighCPU (1:2比)`のカスタムプロファイル。  
- 最高レベルのパフォーマンスと信頼性の保証を提供します。  
- エンタープライズグレードのセキュリティをサポートします:
  - シングルサインオン（SSO）
  - 強化された暗号化: AWSおよびGCPサービスに対して。サービスはデフォルトで私たちのキーによって暗号化され、顧客管理暗号化キー（CMEK）を有効にするためにキーを回転させることができます。  
- スケジュールアップグレードを許可: ユーザーは、データベースおよびクラウドリリースのアップグレードのための週の曜日/時間ウィンドウを選択できます。  
- [HIPAA](../security/compliance-overview.md/#hipaa-since-2024) 遵守を提供します。  
- バックアップをユーザーのアカウントにエクスポートします。

:::note 
3つのティアすべてにおける単一レプリカのサービスサイズは固定されることを意図しています（`8 GiB`、`12 GiB`）。
:::

## 別のティアへのアップグレード {#upgrading-to-a-different-tier}

いつでもBasicからScale、またはScaleからEnterpriseにアップグレードできます。

:::note
ティアのダウングレードは不可能です。
:::

---

サービスの種類について質問がある場合は、[価格ページ](https://clickhouse.com/pricing)を参照するか、support@clickhouse.comにお問い合わせください。
