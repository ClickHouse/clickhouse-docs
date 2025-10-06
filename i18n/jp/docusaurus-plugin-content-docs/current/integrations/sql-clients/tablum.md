---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IOは、ClickHouseを標準でサポートするデータ管理SaaSです。'
'title': 'TABLUM.IOをClickHouseに接続する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# TABLUM.IOをClickHouseに接続する

<CommunityMaintainedBadge/>

## TABLUM.IOのスタートアップページを開く {#open-the-tablumio-startup-page}

:::note
  Linuxサーバー上でdockerを使用してセルフホステッド版のTABLUM.IOをインストールできます。
:::

## 1. サービスにサインアップまたはサインインする {#1-sign-up-or-sign-in-to-the-service}

  まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookのアカウントを使ってクイックログインをしてください。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IOログインページ" />

## 2. ClickHouseコネクタを追加する {#2-add-a-clickhouse-connector}

ClickHouseの接続詳細を集め、**Connector**タブに移動して、ホストURL、ポート、ユーザー名、パスワード、データベース名、およびコネクタ名を入力します。これらのフィールドを完了したら、**Test connection**ボタンをクリックして詳細を検証し、その後**Save connector for me**をクリックして永続化させてください。

:::tip
  正しい**HTTP**ポートを指定し、接続詳細に従って**SSL**モードを切り替えることを確認してください。
:::

:::tip
  通常、TLSを使用している場合はポートが8443で、TLSを使用していない場合は8123です。
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IOでClickHouseコネクタを追加する" />

## 3. コネクタを選択する {#3-select-the-connector}

**Dataset**タブに移動します。ドロップダウンから最近作成したClickHouseコネクタを選択します。右側のパネルには利用可能なテーブルとスキーマのリストが表示されます。

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IOでClickHouseコネクタを選択する" />

## 4. SQLクエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**Run Query**を押します。結果はスプレッドシートとして表示されます。

:::tip
  列名を右クリックすると、ソート、フィルタリング、その他のアクションのあるドロップダウンメニューが開きます。
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IOでSQLクエリを実行する" />

:::note
TABLUM.IOを使用すると、以下ができます。
* TABLUM.IOアカウント内で複数のClickHouseコネクタを作成し利用する、
* データソースに関係なく、ロードされたデータに対してクエリを実行する、
* 結果を新しいClickHouseデータベースとして共有する。
:::

## さらに学ぶ {#learn-more}

TABLUM.IOに関する詳細情報はhttps://tablum.ioで確認してください。
