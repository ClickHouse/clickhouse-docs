---
slug: /operations/update
sidebar_title: セルフマネージドアップグレード
title: セルフマネージドアップグレード
---

## ClickHouse アップグレードの概要 {#clickhouse-upgrade-overview}

この文書には以下が含まれています：
- 一般的なガイドライン
- 推奨プラン
- システム上のバイナリをアップグレードするための具体的な手順

## 一般的なガイドライン {#general-guidelines}

これらのメモは、計画を立てる際や、その後の推奨事項への理解を助けるためのものです。

### ClickHouse サーバーは ClickHouse Keeper または ZooKeeper とは別にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper にセキュリティ修正が必要でない限り、ClickHouse サーバーをアップグレードする際に Keeper をアップグレードする必要はありません。アップグレードプロセス中は Keeper の安定性が求められるため、Keeper のアップグレードを検討する前に ClickHouse サーバーのアップグレードを完了させてください。

### マイナーバージョンのアップグレードは頻繁に行うべき {#minor-version-upgrades-should-be-adopted-often}
新しいマイナーバージョンがリリースされるとすぐにアップグレードすることを強く推奨します。マイナーリリースには破壊的変更はありませんが、重要なバグ修正が含まれていることがあります（セキュリティ修正が含まれる場合もあります）。

### 実験的機能はターゲットバージョンがインストールされた別の ClickHouse サーバーでテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性は、いつでもどのようにでも壊れる可能性があります。実験的機能を使用している場合は、変更履歴を確認し、ターゲットバージョンがインストールされた別の ClickHouse サーバーをセットアップして、実験的機能の使用をテストすることを検討してください。

### ダウングレード {#downgrades}
アップグレード後に新しいバージョンが依存している機能と互換性がないことに気付いた場合、もし新機能を使用していなければ、最近の（1年未満の）バージョンにダウングレードできる可能性があります。新機能を使用するとダウングレードは機能しなくなります。

### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

我々は1年の互換性ウィンドウ（2つの LTS バージョンを含む）を維持するよう努めています。これは、任意の2つのバージョンが互いに1年未満の差で、クラスター内で一緒に動作できることを意味します（または、2つ未満の LTS バージョンがその間にある場合）。ただし、クラスターのすべてのメンバーをなるべく早く同じバージョンにアップグレードすることをお勧めします。なぜなら、いくつかの軽微な問題が生じる可能性があるからです（例えば、分散クエリの遅延や、ReplicatedMergeTree のバックグラウンド操作でのリトライ可能なエラーなど）。

リリース日の違いが1年以上あるバージョンで同じクラスターを運用することは推奨しません。データの損失は期待しませんが、クラスターが使用不可能になる可能性があります。バージョン間に1年以上の差がある場合に予想される問題には以下が含まれます：

- クラスターが機能しない可能性がある
- 一部（またはすべて）のクエリが任意のエラーで失敗するかもしれない
- 任意のエラー/警告がログに現れるかもしれない
- ダウングレードが不可能になる可能性がある

### インクリメンタルアップグレード {#incremental-upgrades}

現在のバージョンとターゲットバージョンの差が1年以上ある場合は、次のいずれかを推奨します：
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを起動）。
- または、中間バージョンを経由してアップグレードする（現在のバージョンよりも1年未満新しいバージョン）。

## 推奨プラン {#recommended-plan}

以下は、ゼロダウンタイムでの ClickHouse アップグレードの推奨ステップです：

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルに含まれておらず、代わりに `/etc/clickhouse-server/config.d/` にあることを確認してください。`/etc/clickhouse-server/config.xml` はアップグレード中に上書きされる可能性があります。
2. [変更履歴](/whats-new/changelog/index.md)を通読し、破壊的変更がないか確認します（ターゲットリリースから現在のリリースまで戻る）。
3. アップグレード前に行える破壊的変更を確認し、アップグレード後に行う必要がある変更のリストを作成します。
4. 各シャードのレプリカの中から1つ以上を特定し、他のレプリカをアップグレード中に維持します。
5. アップグレードされるレプリカで、1台ずつ：
   - ClickHouse サーバーをシャットダウン
   - サーバーをターゲットバージョンにアップグレード
   - ClickHouse サーバーを起動
   - Keeper メッセージがシステムが安定していることを示すのを待つ
   - 次のレプリカへ進む
6. Keeper ログと ClickHouse ログにエラーをチェックします。
7. ステップ4で特定したレプリカを新しいバージョンにアップグレードします。
8. ステップ1～3で行った変更のリストを参照し、アップグレード後に行う必要がある変更を行います。

:::note
これは、複数のバージョンの ClickHouse がレプリケート環境で実行されている場合に予期されるエラーメッセージです。すべてのレプリカが同じバージョンにアップグレードされると、これらは表示されなくなります。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse サーバーバイナリアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouse が `deb` パッケージからインストールされている場合、サーバーで以下のコマンドを実行します：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨された `deb` パッケージ以外で ClickHouse をインストールした場合は、適切なアップデート方法を使用してください。

:::note
一つのシャードのすべてのレプリカがオフラインでない瞬間がない限り、複数のサーバーを一度にアップデートすることができます。
:::

古いバージョンの ClickHouse を特定のバージョンにアップグレードする手順：

例：

`xx.yy.a.b` が現在の安定版です。最新の安定版は [こちら](https://github.com/ClickHouse/ClickHouse/releases) で見つけることができます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
