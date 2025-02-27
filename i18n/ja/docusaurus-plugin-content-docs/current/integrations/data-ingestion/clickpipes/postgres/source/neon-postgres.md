---
sidebar_label: Neon Postgres
description: ClickPipes のソースとして Neon Postgres インスタンスをセットアップする
slug: /integrations/clickpipes/postgres/source/neon-postgres
---

# Neon Postgres ソースセットアップガイド

これは、ClickPipes でのレプリケーションに使用できる Neon Postgres のセットアップ方法に関するガイドです。
このセットアップを行うには、[Neon コンソール](https://console.neon.tech/app/projects)にサインインしていることを確認してください。

## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用する出版物も作成しましょう。

そのためには、**SQL コンソール**タブに移動します。
ここで、以下の SQL コマンドを実行できます。
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 出版物を作成します。ミラーを作成する際にこれを使用します。
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

![ユーザーと出版物のコマンド](images/setup/neon-postgres/neon-commands.png)

**実行**をクリックして、出版物とユーザーを準備します。

## ロジカルレプリケーションを有効にする {#enable-logical-replication}
Neon では、UI を通じてロジカルレプリケーションを有効にできます。これは、ClickPipes の CDC がデータをレプリケートするために必要です。
**設定**タブに移動し、**ロジカルレプリケーション**セクションを選択します。

![ロジカルレプリケーションを有効にする](images/setup/neon-postgres/neon-enable-replication.png)

**有効にする**をクリックして、ここでの準備を完了します。有効にすると、以下の成功メッセージが表示されるはずです。

![ロジカルレプリケーションが有効になりました](images/setup/neon-postgres/neon-enabled-replication.png)

Neon Postgres インスタンスで以下の設定を確認しましょう：
```sql
SHOW wal_level; -- logical である必要があります
SHOW max_wal_senders; -- 10 である必要があります
SHOW max_replication_slots; -- 10 である必要があります
```

## IP ホワイトリスト設定 (Neon エンタープライズプランの場合) {#ip-whitelisting-for-neon-enterprise-plan}
Neon エンタープライズプランを利用している場合、[ClickPipes の IP](../../index.md#list-of-static-ips)をホワイトリストに追加して、ClickPipes から Neon Postgres インスタンスへのレプリケーションを許可できます。
そのためには、**設定**タブをクリックし、**IP 許可**セクションに移動します。

![IP 許可画面](images/setup/neon-postgres/neon-ip-allow.png)

## 接続情報のコピー {#copy-connection-details}
ユーザーと出版物が準備でき、レプリケーションが有効になったので、接続情報をコピーして新しい ClickPipe を作成できます。
**ダッシュボード**に移動し、接続文字列が表示されているテキストボックスで、ビューを**パラメータのみ**に変更します。次のステップでは、これらのパラメータが必要です。

![接続情報](images/setup/neon-postgres/neon-conn-details.png)

## 次は何をするのか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)して、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。
Postgres インスタンスを設定する際に使用した接続情報をメモしておくことを忘れないでください。ClickPipe 作成プロセス中に必要になります。
