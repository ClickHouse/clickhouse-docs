---
description: 'セルフマネージド環境のアップグレードに関するドキュメント'
sidebar_title: 'セルフマネージド環境のアップグレード'
slug: /operations/update
title: 'セルフマネージド環境のアップグレード'
doc_type: 'guide'
---



## ClickHouseアップグレード概要 {#clickhouse-upgrade-overview}

本ドキュメントには以下が含まれます：

- 一般的なガイドライン
- 推奨プラン
- システム上のバイナリのアップグレードに関する詳細


## 一般的なガイドライン {#general-guidelines}

これらの注意事項は、計画の立案と、本ドキュメントで後述する推奨事項の理由を理解するのに役立ちます。

### ClickHouse KeeperまたはZooKeeperとは別にClickHouseサーバーをアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}

ClickHouse KeeperまたはApache ZooKeeperにセキュリティ修正が必要な場合を除き、ClickHouseサーバーをアップグレードする際にKeeperをアップグレードする必要はありません。アップグレードプロセス中はKeeperの安定性が必要となるため、Keeperのアップグレードを検討する前にClickHouseサーバーのアップグレードを完了してください。

### マイナーバージョンのアップグレードは頻繁に適用すべきである {#minor-version-upgrades-should-be-adopted-often}

リリースされ次第、常に最新のマイナーバージョンにアップグレードすることを強く推奨します。マイナーリリースには破壊的変更は含まれませんが、重要なバグ修正(およびセキュリティ修正が含まれる場合もあります)が含まれています。

### ターゲットバージョンを実行する別のClickHouseサーバーで実験的機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性は、いつでも何らかの形で破壊される可能性があります。実験的機能を使用している場合は、変更履歴を確認し、ターゲットバージョンがインストールされた別のClickHouseサーバーをセットアップして、そこで実験的機能の使用をテストすることを検討してください。

### ダウングレード {#downgrades}

アップグレード後に、新しいバージョンが依存している機能と互換性がないことに気付いた場合、新機能をまだ使用していなければ、最近の(1年未満の)バージョンにダウングレードできる可能性があります。新機能を使用し始めると、ダウングレードは機能しなくなります。

### クラスタ内の複数のClickHouseサーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

1年間の互換性ウィンドウ(2つのLTSバージョンを含む)を維持するよう努めています。これは、バージョン間の差が1年未満(またはLTSバージョンが2つ未満)であれば、任意の2つのバージョンがクラスタ内で連携できることを意味します。ただし、いくつかの軽微な問題(分散クエリの速度低下、ReplicatedMergeTreeの一部のバックグラウンド操作における再試行可能なエラーなど)が発生する可能性があるため、クラスタのすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることを推奨します。

リリース日が1年以上離れている場合、同じクラスタ内で異なるバージョンを実行することは決して推奨しません。データ損失が発生するとは想定していませんが、クラスタが使用不能になる可能性があります。バージョン間の差が1年以上ある場合に想定される問題には、以下が含まれます。

- クラスタが動作しない可能性がある
- 一部(または全て)のクエリが任意のエラーで失敗する可能性がある
- ログに任意のエラー/警告が表示される可能性がある
- ダウングレードが不可能になる可能性がある

### 段階的アップグレード {#incremental-upgrades}

現在のバージョンとターゲットバージョンの差が1年以上ある場合は、次のいずれかを推奨します。

- ダウンタイムを伴うアップグレード(すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを起動する)。
- または、中間バージョン(現在のバージョンより1年未満新しいバージョン)を経由してアップグレードする。


## 推奨される手順 {#recommended-plan}

ダウンタイムなしでClickHouseをアップグレードするための推奨手順は以下の通りです：

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルではなく、`/etc/clickhouse-server/config.d/` に配置されていることを確認してください。アップグレード時に `/etc/clickhouse-server/config.xml` が上書きされる可能性があります。
2. [変更履歴](/whats-new/changelog/index.md)を確認し、破壊的変更を把握してください（対象リリースから現在使用しているリリースまで遡って確認します）。
3. 破壊的変更で特定された更新のうち、アップグレード前に実施可能なものを適用し、アップグレード後に実施する必要がある変更のリストを作成してください。
4. 各シャードについて、他のレプリカをアップグレードしている間も稼働させ続ける1つ以上のレプリカを特定してください。
5. アップグレード対象のレプリカに対して、1つずつ以下を実行してください：

- ClickHouseサーバーをシャットダウンする
- サーバーを対象バージョンにアップグレードする
- ClickHouseサーバーを起動する
- Keeperのメッセージでシステムが安定したことを確認する
- 次のレプリカに進む

6. KeeperログとClickHouseログでエラーを確認する

7. 手順4で特定したレプリカを新しいバージョンにアップグレードする
8. 手順1から3で作成した変更リストを参照し、アップグレード後に実施する必要がある変更を適用してください。

:::note
このエラーメッセージは、レプリケーション環境で複数のバージョンのClickHouseが稼働している場合に想定されるものです。すべてのレプリカが同じバージョンにアップグレードされると、このメッセージは表示されなくなります。

```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```

:::


## ClickHouseサーバーバイナリのアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouseを`deb`パッケージからインストールした場合は、サーバー上で以下のコマンドを実行します:

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨される`deb`パッケージ以外の方法でClickHouseをインストールした場合は、適切なアップデート方法を使用してください。

:::note
1つのシャードのすべてのレプリカが同時にオフラインになることがなければ、複数のサーバーを同時にアップデートできます。
:::

ClickHouseの旧バージョンから特定のバージョンへのアップグレード:

例:

`xx.yy.a.b`は現在の安定版です。最新の安定版は[こちら](https://github.com/ClickHouse/ClickHouse/releases)で確認できます

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
