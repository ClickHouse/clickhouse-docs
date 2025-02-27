---
sidebar_label: TABLUM.IO
slug: /integrations/tablumio
description: TABLUM.IOはClickHouseに対応したデータ管理SaaSです。
---

# TABLUM.IOをClickHouseに接続する

## TABLUM.IOのスタートアップページを開く {#open-the-tablumio-startup-page}

TABLUM.IOのクラウド版は[https://go.tablum.io/](https://go.tablum.io/)で利用できます。

:::note
  TABLUM.IOのセルフホステッド版をLinuxサーバーにDockerでインストールすることができます。
:::

## 1. サービスにサインアップまたはサインインする {#1-sign-up-or-sign-in-to-the-service}

最初に、メールアドレスを使用してTABLUM.IOにサインアップするか、GoogleまたはFacebookのアカウントを使ってクイックログインします。

![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/tablum-ch-0.png)

## 2. ClickHouseコネクタを追加する {#2-add-a-clickhouse-connector}

ClickHouseの接続詳細を集めて、**コネクタ**タブに移動し、ホストURL、ポート、ユーザー名、パスワード、データベース名、コネクタの名前を入力します。これらのフィールドを入力したら、**接続テスト**ボタンをクリックして詳細を検証し、次に**私のためにコネクタを保存**をクリックして永続化します。

:::tip
正しい**HTTP**ポートを指定し、接続詳細に従って**SSL**モードを切り替えることを確認してください。
:::

:::tip
一般的に、TLSを使用する場合はポート8443、使用しない場合はポート8123になります。
:::

![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/tablum-ch-1.png)

## 3. コネクタを選択する {#3-select-the-connector}

**データセット**タブに移動します。ドロップダウンから最近作成したClickHouseコネクタを選択します。右のパネルには、利用可能なテーブルとスキーマの一覧が表示されます。

![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/tablum-ch-2.png)

## 4. SQLクエリを入力して実行する {#4-input-a-sql-query-and-run-it}

SQLコンソールにクエリを入力し、**クエリを実行**を押します。結果はスプレッドシート形式で表示されます。

:::tip
列名を右クリックすると、ソートやフィルタリングなどのアクションを含むドロップダウンメニューが開きます。
:::

![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/tablum-ch-3.png)

:::note
TABLUM.IOを使用すると、以下のことができます。
* TABLUM.IOアカウント内で複数のClickHouseコネクタを作成して利用すること、
* データソースに依存せず、ロードされたデータに対してクエリを実行すること、
* 結果を新しいClickHouseデータベースとして共有すること。
:::

## さらなる情報 {#learn-more}

TABLUM.IOに関する詳細情報はhttps://tablum.ioでご覧ください。
