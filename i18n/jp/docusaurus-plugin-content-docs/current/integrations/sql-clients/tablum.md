---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IOはClickHouseを標準でサポートするデータ管理SaaSです。'
title: 'TABLUM.IOとClickHouseを接続する'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# TABLUM.IOとClickHouseを接続する

<CommunityMaintainedBadge/>

## TABLUM.IOのスタートアップページを開く {#open-the-tablumio-startup-page}

:::note
  あなたのLinuxサーバーにdockerを使用してTABLUM.IOのセルフホステッドバージョンをインストールすることができます。
:::


## 1. サービスにサインアップまたはサインインする {#1-sign-up-or-sign-in-to-the-service}

  まず、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookのアカウントでクイックログインを行ってください。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IOログインページ" />

## 2. ClickHouseコネクタを追加する {#2-add-a-clickhouse-connector}

ClickHouseの接続情報を集め、**コネクタ**タブに移動して、ホストURL、ポート、ユーザー名、パスワード、データベース名、コネクタ名を入力します。これらのフィールドをすべて入力したら、**接続テスト**ボタンをクリックして詳細を確認し、その後**私のためにコネクタを保存**をクリックして永続化します。

:::tip
正しい**HTTP**ポートを指定し、接続情報に応じて**SSL**モードを切り替えてください。
:::

:::tip
通常、TLSを使用している場合はポートは8443、TLSを使用していない場合は8123です。
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IOでClickHouseコネクタを追加する" />

## 3. コネクタを選択する {#3-select-the-connector}

**データセット**タブに移動します。ドロップダウンメニューから最近作成したClickHouseコネクタを選択します。右側のパネルには利用可能なテーブルとスキーマのリストが表示されます。

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IOでClickHouseコネクタを選択する" />

## 4. SQLクエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**クエリを実行**を押してください。結果はスプレッドシートとして表示されます。

:::tip
列名を右クリックすると、ソート、フィルタ、その他のアクションのドロップダウンメニューが開きます。
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IOでSQLクエリを実行する" />

:::note
TABLUM.IOを使用することで、以下のことが可能です。
* TABLUM.IOアカウント内で複数のClickHouseコネクタを作成し、利用する。
* データソースに関係なく、読み込まれたデータに対してクエリを実行する。
* 結果を新しいClickHouseデータベースとして共有する。
:::

## 詳細情報を確認する {#learn-more}

TABLUM.IOについての詳細情報は https://tablum.io で確認できます。
