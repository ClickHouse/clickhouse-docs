---
slug: /operations/update
sidebar_title: セルフマネージド アップグレード
title: セルフマネージド アップグレード
---

## ClickHouse アップグレードの概要 {#clickhouse-upgrade-overview}

このドキュメントには以下が含まれます:
- 一般的なガイドライン
- 推奨される計画
- システム上のバイナリをアップグレードするための具体的な手順

## 一般的なガイドライン {#general-guidelines}

これらのノートは、計画作成の手助けと、後のセクションでおすすめする理由を理解するために役立ちます。

### ClickHouse サーバーを ClickHouse Keeper または ZooKeeper とは別にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper にセキュリティ修正が必要でない限り、ClickHouse サーバーをアップグレードする際に Keeper をアップグレードする必要はありません。アップグレードプロセス中に Keeper の安定性が必要であるため、Keeper のアップグレードを検討する前に ClickHouse サーバーのアップグレードを完了してください。

### マイナー バージョンのアップグレードは頻繁に適用すべき {#minor-version-upgrades-should-be-adopted-often}
最新のマイナーバージョンがリリースされるとすぐにアップグレードすることを強くお勧めします。マイナーリリースには重大な変更はなく、重要なバグ修正が含まれています（セキュリティ修正が含まれる場合もあります）。

### 対象バージョンで実行されている別の ClickHouse サーバーで実験的な機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的な機能の互換性はいつでもどのようにでも破損する可能性があります。実験的な機能を使用している場合は、チェンジログを確認し、対象バージョンがインストールされた別の ClickHouse サーバーを設定して、そこで実験的な機能の使用をテストすることを考慮してください。

### ダウングレード {#downgrades}
アップグレード後に新しいバージョンが依存している機能と互換性がないことに気づいた場合、最近の（1年未満の）バージョンにダウングレードできる可能性があります。ただし、新機能を使用し始めるとダウングレードは機能しなくなります。

### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

我々は1年間の互換性ウィンドウを維持する努力をしています（これには2つの LTS バージョンが含まれます）。これは、バージョン間の差が1年未満であれば、2つのバージョンがクラスター内で一緒に動作できることを意味します（または、その間に2つ以下の LTS バージョンがある場合）。ただし、クラスター内のすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることをお勧めします。そうしないと、分散クエリの遅延や ReplicatedMergeTree におけるバックグラウンド操作での再試行可能なエラーなど、いくつかの小さな問題が発生する可能性があります。

リリース日が1年を超える場合に同じクラスターで異なるバージョンを実行することは決して推奨しません。データ損失が発生することは期待していませんが、クラスターが使用不可能になる可能性があります。1年以上のバージョン差がある場合に予想される問題は以下の通りです。

- クラスターが機能しないかもしれない
- いくつかの（あるいはすべての）クエリが任意のエラーで失敗するかもしれない
- ログに任意のエラーや警告が表示されるかもしれない
- ダウングレードが不可能になるかもしれない

### インクリメンタル アップグレード {#incremental-upgrades}

現在のバージョンとターゲットバージョンの差が1年以上である場合は、以下のいずれかをお勧めします。
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを再起動する）。
- または、中間バージョンを介してアップグレード（現在のバージョンよりも1年未満新しいバージョンを使用）。

## 推奨される計画 {#recommended-plan}

これがゼロダウンタイムの ClickHouse アップグレードのための推奨手順です。

1. 構成変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルにないことを確認し、代わりに `/etc/clickhouse-server/config.d/` にあるようにしてください。 `/etc/clickhouse-server/config.xml` はアップグレード中に上書きされる可能性があります。
2. 破壊的変更について [チェンジログ](/whats-new/changelog/index.md) を確認してください（ターゲットリリースから現在のリリースまで遡って）。
3. アップグレード前に行える破壊的変更の更新を行い、アップグレード後に必要な変更のリストを作成します。
4. 各シャードについて、アップグレード中に進行するための1つ以上のレプリカを特定します。
5. アップグレードされるレプリカで、1つずつ：
   - ClickHouse サーバーをシャットダウンする
   - サーバーをターゲットバージョンにアップグレードする
   - ClickHouse サーバーを再起動する
   - システムが安定していることを示す Keeper メッセージを待つ
   - 次のレプリカに進む
6. Keeper ログと ClickHouse ログでエラーをチェックする
7. ステップ4で特定したレプリカを新しいバージョンにアップグレードする
8. ステップ1から3で行った変更のリストを参照し、アップグレード後に行う必要がある変更を行います。

:::note
レプリケーション環境で複数のバージョンの ClickHouse が実行されている場合、このエラーメッセージは予期されるものです。すべてのレプリカが同じバージョンにアップグレードされると、これらは表示されなくなります。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse サーバーバイナリアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouse が `deb` パッケージからインストールされている場合は、サーバーで以下のコマンドを実行します。

``` bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨される `deb` パッケージ以外の方法で ClickHouse をインストールした場合は、適切な更新方法を使用してください。

:::note
すべてのレプリカのどれかがオフラインでない限り、複数のサーバーを同時に更新することができます。
:::

特定のバージョンへの古い ClickHouse のアップグレード:

例として:

`xx.yy.a.b` は現在の安定版です。最新の安定版は [こちら](https://github.com/ClickHouse/ClickHouse/releases) で見つけることができます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
