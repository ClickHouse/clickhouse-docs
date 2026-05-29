---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO は、ClickHouse を標準サポートするデータ管理 SaaS です。'
title: 'TABLUM.IO を ClickHouse に接続する'
doc_type: 'guide'
keywords: ['tablum', 'SQLクライアント', 'データベースツール', 'クエリツール', 'デスクトップアプリ']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

## TABLUM.IO のスタートページを開く \{#open-the-tablumio-startup-page\}

:::note
Linux サーバー上の Docker に、TABLUM.IO のセルフホスト版をインストールできます。
:::

## 1. サービスにサインアップまたはサインインする \{#1-sign-up-or-sign-in-to-the-service\}

まず、メールアドレスで TABLUM.IO にサインアップするか、Google または Facebook アカウントでクイックログインします。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO のログインページ" />

## 2. ClickHouse コネクタを追加する \{#2-add-a-clickhouse-connector\}

ClickHouse の接続情報を用意し、**Connector** タブに移動して、ホスト URL、ポート、ユーザー名、パスワード、データベース名、コネクタ名を入力します。これらのフィールドの入力が完了したら、**Test connection** ボタンをクリックして設定内容を検証し、その後 **Save connector for me** をクリックしてコネクタを保存します。

:::tip
接続情報に応じて、正しい **HTTP** ポートを指定し、**SSL** モードを適切に切り替えてください。
:::

:::tip
通常、TLS を使用する場合のポートは 8443、TLS を使用しない場合は 8123 です。
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IO で ClickHouse コネクタを追加する" />

## 3. コネクタを選択する \{#3-select-the-connector\}

**Dataset** タブを開きます。ドロップダウンから、先ほど作成した ClickHouse コネクタを選択します。右側のパネルに、利用可能なテーブルとスキーマの一覧が表示されます。

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IO で ClickHouse コネクタを選択" />

## 4. SQLクエリを入力して実行する \{#4-input-a-sql-query-and-run-it\}

SQL Console にクエリを入力し、**Run Query** をクリックします。結果はスプレッドシート形式で表示されます。

:::tip
カラム名を右クリックすると、並べ替え、フィルター、その他の操作を含むドロップダウンメニューが開きます。
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IO で SQLクエリを実行する" />

:::note
TABLUM.IO では、次のことができます。

* TABLUM.IO アカウント内で複数の ClickHouse コネクタを作成して利用する
* データソースに関係なく、読み込まれた任意のデータに対してクエリを実行する
* 結果を新しい ClickHouse データベースとして共有する
  :::

## 詳しく見る \{#learn-more\}

TABLUM.IO の詳細については、https://tablum.io をご覧ください。