---
description: 'Updateのドキュメント'
sidebar_title: 'Self-managed Upgrade'
slug: '/operations/update'
title: 'セルフマネージドアップグレード'
---



## ClickHouse アップグレード概要 {#clickhouse-upgrade-overview}

このドキュメントには以下が含まれます:
- 一般的なガイドライン
- 推奨プラン
- システム上のバイナリをアップグレードするための具体的な手順

## 一般的なガイドライン {#general-guidelines}

これらのメモは、計画を立てるのを助け、後のドキュメントで行う推奨の理由を理解するのに役立ちます。

### ClickHouse サーバーは ClickHouse Keeper または ZooKeeper とは別にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper に対するセキュリティ修正が必要でない限り、ClickHouse サーバーをアップグレードする際に Keeper をアップグレードする必要はありません。アップグレードプロセス中に Keeper の安定性が必要ですので、最初に ClickHouse サーバーのアップグレードを完了させ、その後 Keeper のアップグレードを検討してください。

### マイナーバージョンのアップグレードは頻繁に行うべきです {#minor-version-upgrades-should-be-adopted-often}
常に最新のマイナーバージョンがリリースされ次第、アップグレードすることを強くお勧めします。マイナーバージョンには破壊的な変更はありませんが、重要なバグ修正や（セキュリティ修正を含む可能性があります）があります。

### 対象バージョンで実行される別の ClickHouse サーバーで実験的機能をテストしてください {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性はいつでもどのようにでも壊れる可能性があります。実験的機能を使用している場合は、変更履歴を確認し、ターゲットバージョンがインストールされた別の ClickHouse サーバーを設定して、そこで実験的機能の使用をテストすることを検討してください。

### ダウングレード {#downgrades}
アップグレード後、新しいバージョンが依存している機能と互換性がないことに気づいた場合、新機能を使用していない限り、最近の（1年未満の）バージョンにダウングレードできる可能性があります。ただし、新機能を使用するとダウングレードはできません。

### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

私たちは1年の互換性ウィンドウを維持する努力をしています（これには2つの LTS バージョンが含まれます）。これにより、2つのバージョンの間の差が1年未満であれば、クラスター内で正常に機能するはずです（または間に2つの LTS バージョン未満がある場合）。ただし、クラスターのすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることをお勧めします。これにより、分散クエリの遅延や ReplicatedMergeTree におけるいくつかのバックグラウンド操作での再試行エラーなどの小さな問題が発生する可能性があります。

リリース日が1年以上異なるバージョンを同じクラスターで実行することは決して推奨されません。データ損失はないと予想されますが、クラスターが使用不能になる可能性があります。バージョンに1年以上の違いがある場合に予想される問題は以下の通りです：

- クラスターが機能しない可能性があります
- 一部の（またはすべての）クエリが任意のエラーで失敗する可能性があります
- ログに任意のエラー/警告が表示される可能性があります
- ダウングレードできない可能性があります

### インクリメンタルアップグレード {#incremental-upgrades}

現在のバージョンとターゲットバージョンの間の差が1年以上ある場合、以下のいずれかを推奨します：
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを再起動）。
- または、中間バージョン（現在のバージョンよりも1年未満新しいバージョン）を介してアップグレードします。

## 推奨プラン {#recommended-plan}

以下は、ダウンタイムなしで ClickHouse をアップグレードするための推奨手順です：

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルにないことを確認し、代わりに `/etc/clickhouse-server/config.d/` にあることを確認します。これは、アップグレード中に `/etc/clickhouse-server/config.xml` が上書きされる可能性があるためです。
2. [変更履歴](/whats-new/changelog/index.md)を読み、破壊的な変更を確認します（ターゲットリリースから現在のリリースに戻る）。
3. アップグレード前に行うことができる破壊的変更に関する更新を行い、アップグレード後に行う必要のある変更のリストを作成します。
4. 各シャードに対して、アップグレード中に追随させる1つ以上のレプリカを特定します。
5. アップグレードされるレプリカを1つずつ：
   - ClickHouse サーバーを停止
   - サーバーをターゲットバージョンにアップグレード
   - ClickHouse サーバーを起動
   - システムが安定していることを示す Keeper メッセージを待つ
   - 次のレプリカに進む
6. Keeper ログと ClickHouse ログにエラーがないか確認します
7. ステップ 4 で特定したレプリカを新しいバージョンにアップグレードします
8. ステップ 1 から 3 で行った変更のリストを参照し、アップグレード後に行う必要のある変更を実施します。

:::note
複製環境で複数のバージョンの ClickHouse が実行されているときにこのエラーメッセージが表示されることは予想されます。すべてのレプリカが同じバージョンにアップグレードされると、これらのメッセージは表示されなくなります。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse サーバーのバイナリアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouseが `deb` パッケージからインストールされている場合は、サーバーで以下のコマンドを実行します：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨の `deb` パッケージ以外の方法で ClickHouse をインストールした場合は、適切なアップデート方法を使用してください。

:::note
すべてのレプリカがオフラインでない瞬間がない限り、複数のサーバーを一度に更新することができます。
:::

特定のバージョンへの古いバージョンの ClickHouse のアップグレード：

例として：

`xx.yy.a.b` は現在の安定版です。最新の安定バージョンは [こちら](https://github.com/ClickHouse/ClickHouse/releases) で見つけることができます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
