---
description: 'セルフマネージド環境のアップグレードに関するドキュメント'
sidebar_title: 'セルフマネージド環境のアップグレード'
slug: /operations/update
title: 'セルフマネージド環境のアップグレード'
doc_type: 'guide'
---

## ClickHouse アップグレードの概要 {#clickhouse-upgrade-overview}

このドキュメントでは、次の内容を説明します:
- 一般的なガイドライン
- 推奨される計画
- システム上のバイナリをアップグレードするための詳細

## 一般的なガイドライン {#general-guidelines}

ここでの注意事項は、計画を立てる際の助けになるとともに、本ドキュメントの後半で行っている推奨事項の理由を理解するのに役立ちます。

### ClickHouse Keeper または ZooKeeper とは別に ClickHouse サーバーをアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper に対するセキュリティ修正が必要な場合を除き、ClickHouse サーバーをアップグレードする際に Keeper を同時にアップグレードする必要はありません。アップグレード処理中は Keeper の安定性が必要となるため、まず ClickHouse サーバーのアップグレードを完了してから、Keeper のアップグレードを検討してください。

### マイナーバージョンのアップグレードは頻繁に行う {#minor-version-upgrades-should-be-adopted-often}
新しいマイナーバージョンがリリースされたら、可能な限り速やかにその最新版へアップグレードすることを強く推奨します。マイナーリリースには互換性を壊す変更は含まれませんが、重要なバグ修正（およびセキュリティ修正が含まれる場合もあります）が含まれます。

### 対象バージョンで動作する別の ClickHouse サーバー上で実験的機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性は、いつでもどのような形でも壊れる可能性があります。実験的機能を利用している場合は、変更履歴を確認し、対象バージョンをインストールした別の ClickHouse サーバーを用意して、そのサーバー上で実験的機能の利用方法をテストすることを検討してください。

### ダウングレード {#downgrades}
アップグレード後に、新しいバージョンが依存している機能と互換性がないことに気付いた場合で、かつ新機能をまだ一切使用していなければ、比較的最近の（1年以内にリリースされた）バージョンにダウングレードできる可能性があります。一度でも新機能を使用してしまうと、ダウングレードは行えません。

### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

ClickHouse では 1年間の互換性ウィンドウ（2つの LTS バージョンを含む）を維持するよう努めています。これは、2つのバージョン間の差が1年未満（またはその間に存在する LTS バージョンが2つ未満）であれば、クラスター内で一緒に動作できるべきであることを意味します。ただし、分散クエリの低速化や、ReplicatedMergeTree における一部バックグラウンド処理でのリトライ可能なエラーなど、軽微な問題が発生する可能性があるため、クラスターのすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることを推奨します。

リリース日の差が1年を超える異なるバージョンを同一クラスターで動作させることは決して推奨しません。データ損失は想定していないものの、クラスターが利用不能になる可能性があります。バージョン間の差が1年を超える場合に想定される問題には、以下が含まれます:

- クラスターが動作しない可能性がある
- 一部（あるいはすべて）のクエリが予期しないエラーで失敗する可能性がある
- 予期しないエラーや警告がログに出力される可能性がある
- ダウングレードが不可能になる場合がある

### 段階的なアップグレード {#incremental-upgrades}

現在のバージョンと対象バージョンの差が1年を超える場合は、次のいずれかを推奨します:
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、全サーバーをアップグレードしてから、すべてのサーバーを起動する）。
- もしくは、中間バージョン（現在のバージョンから見て1年以内にリリースされた、より新しいバージョン）を経由してアップグレードする。

## 推奨プラン {#recommended-plan}

以下は、ダウンタイムなしで ClickHouse をアップグレードするための推奨手順です。

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイル内ではなく、`/etc/clickhouse-server/config.d/` 内にあることを確認します。`/etc/clickhouse-server/config.xml` はアップグレード時に上書きされる可能性があります。
2. 対象リリースから現在利用しているリリースまでさかのぼって、非互換な変更点について [changelogs](/whats-new/changelog/index.md) を確認します。
3. 非互換な変更点として特定されたうち、アップグレード前に実施できる更新を適用し、アップグレード後に実施が必要な変更点の一覧を作成します。
4. 各シャードについて、他のレプリカをアップグレードしている間も稼働させておく 1 つ以上のレプリカを特定します。
5. アップグレード対象のレプリカごとに、1 台ずつ以下を実施します。

* ClickHouse サーバーをシャットダウンする
* サーバーを対象バージョンにアップグレードする
* ClickHouse サーバーを起動する
* Keeper のメッセージを確認し、システムが安定した状態になるまで待つ
* 次のレプリカに進む

6. Keeper ログおよび ClickHouse ログにエラーがないか確認します。
7. 手順 4 で特定したレプリカを新しいバージョンにアップグレードします。
8. 手順 1 ～ 3 で作成した変更点の一覧を参照し、アップグレード後に実施が必要な変更を適用します。

:::note
このエラーメッセージは、レプリケーション環境内で複数バージョンの ClickHouse が動作している場合に想定されるものです。すべてのレプリカが同一バージョンにアップグレードされると、このメッセージは表示されなくなります。

```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  マージ後のデータが他のレプリカのデータとバイト単位で同一ではありません。
```

:::

## ClickHouse サーバーバイナリのアップグレード手順 {#clickhouse-server-binary-upgrade-process}

ClickHouse を `deb` パッケージからインストールした場合は、サーバー上で次のコマンドを実行します。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨されている `deb` パッケージ以外の方法で ClickHouse をインストールした場合は、適切な更新方法を使用してください。

:::note
1 つのシャードに属するすべてのレプリカが同時にオフラインになる瞬間さえなければ、複数のサーバーを同時に更新できます。
:::

古いバージョンの ClickHouse を特定のバージョンにアップグレードするには:

例として:

`xx.yy.a.b` は現在の安定版です。最新の安定版は[こちら](https://github.com/ClickHouse/ClickHouse/releases)で確認できます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
