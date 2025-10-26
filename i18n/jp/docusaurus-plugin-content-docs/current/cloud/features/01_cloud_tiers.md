---
'sidebar_label': 'ClickHouse Cloud 階層'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud 階層'
'description': 'ClickHouse Cloudで利用可能なクラウド階層'
'doc_type': 'reference'
---


# ClickHouse Cloud tiers

ClickHouse Cloudにはいくつかのティアが用意されています。 
ティアは組織の任意のレベルで割り当てられ、その結果、組織内のサービスは同じティアに属します。
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
    <td>✓ 8-12 GiB 合計メモリ</td>
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
    <td>✓ 24時間ごとに1回のバックアップ、保持期間は1日</td>
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
    <td>計算分離</td>
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

- シングルレプリカデプロイメントをサポートするコスト効率の良いオプションです。
- 厳格な可用性保証が不要な、小規模データボリュームの部門利用ケースに最適です。

:::note
Basicティアのサービスはサイズが固定されており、自動および手動のスケーリングを許可しません。 
スケーリングが必要な場合は、ScaleまたはEnterpriseティアにアップグレードできます。
:::

## Scale {#scale}

強化されたSLA（2つ以上のレプリカデプロイメント）、スケーラビリティ、および高度なセキュリティを必要とするワークロード向けに設計されています。

- 次のような機能をサポートしています:
  - [プライベートネットワーキングサポート](/cloud/security/private-link-overview)。
  - [計算分離](../reference/warehouses#what-is-compute-compute-separation)。
  - [柔軟なスケーリング](/manage/scaling)オプション（スケールアップ/ダウン、イン/アウト）。
  - [設定可能なバックアップ](/cloud/manage/backups/configurable-backups)

## Enterprise {#enterprise}

厳格なセキュリティおよびコンプライアンスのニーズを持つ大規模でミッションクリティカルなデプロイメントに対応しています。

- Scaleのすべてに加えて、**
- 柔軟なスケーリング: 標準プロファイル（`1:4 vCPU:memory ratio`）、および`HighMemory (1:8 ratio)`および`HighCPU (1:2 ratio)`のカスタムプロファイル。
- 最高レベルのパフォーマンスおよび可用性保証を提供します。
- エンタープライズグレードのセキュリティをサポートします:
  - シングルサインオン (SSO)
  - 強化された暗号化: AWSおよびGCPサービス用。 サービスはデフォルトで私たちの鍵で暗号化され、顧客管理暗号化キー (CMEK) を有効にするために鍵をローテーション可能です。
- スケジュールされたアップグレードを許可します: データベースおよびクラウドリリースのアップグレードのために、週の曜日/時間帯を選択できます。  
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024)およびPCIコンプライアンスを提供します。
- バックアップをユーザーのアカウントにエクスポートします。

:::note 
3つのティアすべてでの単一レプリカサービスは、サイズが固定されていることを意図しています（`8 GiB`, `12 GiB`）。
:::

## 別のティアにアップグレードする {#upgrading-to-a-different-tier}

BasicからScaleまたはScaleからEnterpriseにアップグレードすることは常に可能です。ティアのダウングレードには、プレミアム機能を無効にする必要があります。

---

サービスの種類について質問がある場合は、[価格ページ](https://clickhouse.com/pricing)を参照するか、support@clickhouse.comにお問い合わせください。
