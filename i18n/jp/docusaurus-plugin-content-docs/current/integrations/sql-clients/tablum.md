---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IO is a data management SaaS that supports ClickHouse out of
  the box.'
'title': 'Connecting TABLUM.IO to ClickHouse'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting TABLUM.IO to ClickHouse

<CommunityMaintainedBadge/>

## Open the TABLUM.IO startup page {#open-the-tablumio-startup-page}

:::note
  あなたのLinuxサーバーにdockerでTABLUM.IOのセルフホステッドバージョンをインストールできます。
:::


## 1. Sign up or sign in to the service {#1-sign-up-or-sign-in-to-the-service}

  まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookのアカウントを使用してクイックログインを行います。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IOのログインページ" />

## 2. Add a ClickHouse connector {#2-add-a-clickhouse-connector}

ClickHouseの接続詳細を集めて、**Connector**タブに移動し、ホストURL、ポート、ユーザー名、パスワード、データベース名、およびコネクタの名前を入力します。これらのフィールドを入力した後、**Test connection**ボタンをクリックして詳細を確認し、その後**Save connector for me**をクリックして永続化します。

:::tip
正しい**HTTP**ポートを指定し、接続詳細に従って**SSL**モードを切り替えることを確認してください。
:::

:::tip
通常、TLSを使用する場合はポートは8443で、使用しない場合は8123です。
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IOでのClickHouseコネクタの追加" />

## 3. Select the connector {#3-select-the-connector}

**Dataset**タブに移動します。ドロップダウンメニューから最近作成したClickHouseコネクタを選択します。右側のパネルには、利用可能なテーブルとスキーマのリストが表示されます。

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IOでのClickHouseコネクタの選択" />

## 4. Input a SQL query and run it {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**Run Query**を押します。結果はスプレッドシートとして表示されます。

:::tip
カラム名を右クリックすると、並べ替え、フィルター、その他のアクションのためのドロップダウンメニューが開きます。
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IOでのSQLクエリの実行" />

:::note
TABLUM.IOを使用すると、
* TABLUM.IOアカウント内で複数のClickHouseコネクタを作成し、利用できます。
* データソースに関係なく、読み込まれたデータに対してクエリを実行できます。
* 結果を新しいClickHouseデータベースとして共有できます。
:::

## Learn more {#learn-more}

TABLUM.IOに関する詳細情報はhttps://tablum.ioをご覧ください。
