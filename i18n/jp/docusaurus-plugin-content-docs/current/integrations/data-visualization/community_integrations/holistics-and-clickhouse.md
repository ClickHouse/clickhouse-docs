---
sidebar_label: 'Holistics'
slug: /integrations/holistics
keywords: ['clickhouse', 'Holistics', 'AI', '統合', 'BI', 'データ可視化']
description: 'Holistics は、適切にガバナンスされ、容易にアクセスできるメトリクスにより、誰もがより良い意思決定を行えるよう支援する、セルフサービス BI と組み込みアナリティクス向けの AI を活用したプラットフォームです。'
title: 'ClickHouse を Holistics に接続する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import holistics_01 from '@site/static/images/integrations/data-visualization/holistics_01.png';
import holistics_02 from '@site/static/images/integrations/data-visualization/holistics_02.png';
import holistics_03 from '@site/static/images/integrations/data-visualization/holistics_03.png';
import holistics_04 from '@site/static/images/integrations/data-visualization/holistics_04.png';
import holistics_05 from '@site/static/images/integrations/data-visualization/holistics_05.png';
import holistics_06 from '@site/static/images/integrations/data-visualization/holistics_06.png';


# ClickHouse を Holistics に接続する \{#connecting-clickhouse-to-holistics\}

<CommunityMaintainedBadge/>

[Holistics](https://www.holistics.io/) は、信頼できる一貫したメトリクスのためのプログラマブルなセマンティックレイヤーを備えた、AI ネイティブなセルフサービス BI プラットフォームです。

ClickHouse を Holistics に接続すると、チームはコードベースのセマンティックレイヤーに基づく、高速で信頼性の高い AI 活用型のセルフサービス環境を利用できます。ビジネスユーザーはドラッグ＆ドロップと AI を用いて自信を持ってデータを探索でき、同時にメトリクス定義を再利用可能かつ組み合わせ可能な形で維持し、Git でバージョン管理することができます。

## 前提条件 \{#prerequisites\}

接続を行う前に、以下を確認してください。

- **権限:** 新しいデータソースを追加するには、Holistics 上の管理者権限が必要です。
- **ネットワークアクセス:** ClickHouse サーバーが [Holistics の IP アドレス](https://docs.holistics.io/docs/connect/ip-whitelisting) からアクセス可能である必要があります。
- **データベースユーザー:** 管理者アカウントは使用せず、Holistics 用に専用の読み取り専用ユーザーを作成してください。

### 推奨される権限 \{#recommended-privileges\}

専用ユーザーには、クエリを実行したいテーブルに対する `SELECT` 権限に加えて、スキーマ検出のために `system` テーブルに対する `SELECT` 権限が必要です。

```sql
-- Example: Grant read access to a specific database
GRANT SELECT ON my_database.* TO holistics_user;

-- Grant access to system metadata
GRANT SELECT ON system.* TO holistics_user;
```

<VerticalStepper headerLevel="h2">
  ## 接続情報を確認する

  HTTP(S) を使用して ClickHouse に接続するには、次の情報が必要です。

  | **Parameter**     | **Description**                                                              |
  | ----------------- | ---------------------------------------------------------------------------- |
  | **Host**          | ClickHouse サーバーのホスト名（例: `mz322.eu-central-1.aws.clickhouse.cloud`）。          |
  | **Port**          | ClickHouse Cloud の場合は **8443**（SSL/TLS）。SSL なしのセルフマネージドなインスタンスの場合は **8123**。 |
  | **Database Name** | 接続したいデータベース名。デフォルトは通常 `default`。                                             |
  | **Username**      | データベースユーザー。デフォルトは `default`。                                                 |
  | **Password**      | データベースユーザーのパスワード。                                                            |

  これらの情報は、ClickHouse Cloud コンソールで **Connect** ボタンをクリックし、**HTTPS** を選択することで確認できます。

  <Image size="md" img={holistics_01} alt="ClickHouse Cloud コンソールにおける Connect ボタンの位置" border />

  ## ネットワークアクセスを設定する

  Holistics はクラウドベースのアプリケーションのため、そのサーバーからデータベースに到達できる必要があります。次の 2 つのオプションがあります。

  1. **ダイレクト接続（推奨）:** Holistics の IP アドレスをファイアウォールまたは ClickHouse Cloud の IP Access List に Allowlist 登録します。IP の一覧は [IP Whitelisting ガイド](https://docs.holistics.io/docs/connect/ip-whitelisting)で確認できます。

     <Image size="md" img={holistics_02} alt="ClickHouse Cloud における IP Allowlisting の例" border />

  2. **リバース SSH トンネル:** データベースがプライベートネットワーク（VPC）内にあり、パブリックに公開できない場合は、[Reverse SSH Tunnel](https://docs.holistics.io/docs/connect/connect-tunnel) を使用します。

  ## Holistics にデータソースを追加する

  1. Holistics で **Settings → Data Sources** に移動します。

     <Image size="md" img={holistics_03} alt="Holistics の設定で Data Sources へ移動する操作" border />

  2. **New Data Source** をクリックし、**ClickHouse** を選択します。

     <Image size="md" img={holistics_04} alt="新規データソースの一覧から ClickHouse を選択する画面" border />

  3. ステップ1で収集した情報をフォームに入力します。

     | **Field**         | **Setting**                                            |
     | ----------------- | ------------------------------------------------------ |
     | **Host**          | 使用している ClickHouse のホスト名                                |
     | **Port**          | `8443`（または `8123`）                                     |
     | **Require SSL**   | ポート 8443 を使用する場合は **ON** に切り替え（ClickHouse Cloud では必須）。 |
     | **Database Name** | `default`（または使用している特定の DB）                             |

     <Image size="md" img={holistics_05} alt="Holistics で ClickHouse の接続情報を入力する画面" border />

  4. **Test Connection** をクリックします。

     <Image size="md" img={holistics_06} alt="Holistics で ClickHouse への接続テストが成功した画面" border />

     * **成功:** **Save** をクリックします。
     * **失敗:** ユーザー名とパスワードを確認し、[Holistics の IP が Allowlist 登録されている](https://docs.holistics.io/docs/connect/ip-whitelisting)ことを確認してください。
</VerticalStepper>


## 既知の制限事項 \{#known-limitations\}

Holistics は ClickHouse の標準的な SQL 機能の大部分をサポートしていますが、以下の例外があります。

- **Running Total:** この分析関数は、現時点では ClickHouse でのサポートが限定的です。
- **ネストされたデータ型:** 深くネストされた JSON や Array 構造は、可視化の前に SQL モデルでフラット化する必要がある場合があります。

サポートされている機能の完全な一覧については、[Database-specific Limitations ページ](https://docs.holistics.io/docs/connect/faqs/clickhouse-limitations)を参照してください。