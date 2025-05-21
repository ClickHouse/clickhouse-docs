---
description: '更新に関する文書'
sidebar_title: 'セルフマネージドアップグレード'
slug: /operations/update
title: 'セルフマネージドアップグレード'
---

## ClickHouseアップグレードの概要 {#clickhouse-upgrade-overview}

この文書には以下が含まれます:
- 一般的なガイドライン
- 推奨プラン
- システム上のバイナリをアップグレードする際の具体的な手順

## 一般的なガイドライン {#general-guidelines}

これらのノートは、計画に役立ち、文書の後半でなぜその推奨を行うのかを理解するのに役立ちます。

### ClickHouseサーバーはClickHouse KeeperまたはZooKeeperから別々にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse KeeperやApache ZooKeeperにセキュリティ修正が必要でない限り、ClickHouseサーバーをアップグレードする際にKeeperをアップグレードする必要はありません。アップグレードプロセス中はKeeperの安定性が必要ですので、Keeperのアップグレードを検討する前にClickHouseサーバーのアップグレードを完了してください。

### マイナーバージョンのアップグレードは頻繁に行うべき {#minor-version-upgrades-should-be-adopted-often}
新しいマイナーバージョンがリリースされるとすぐにアップグレードすることを強くお勧めします。マイナーバージョンのリリースには破壊的な変更はありませんが、重要なバグ修正が含まれており（セキュリティ修正がある場合もあります）、常にアップグレードが推奨されます。

### 対象バージョンを実行している別のClickHouseサーバーで実験的な機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的な機能の互換性はいつでも破損する可能性があります。実験的な機能を使用している場合は、変更履歴を確認し、対象バージョンがインストールされた別のClickHouseサーバーを設定して、そちらで実験的な機能の使用をテストしてください。

### ダウングレード {#downgrades}
アップグレード後に新しいバージョンが依存している機能と互換性がないことに気付いた場合、新機能を使用していなければ、最近の（1年未満の）バージョンへのダウングレードが可能です。新機能を使用すると、ダウングレードは機能しなくなります。

### クラスター内の複数のClickHouseサーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

私たちは1年間の互換性ウィンドウを維持するよう努めています（これには2つのLTSバージョンが含まれます）。これは、バージョン間の差が1年未満であれば、任意の2つのバージョンがクラスター内で連携できることを意味します（または、2つのLTSバージョンが間に存在しない場合）。ただし、クラスターのすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることをお勧めします。いくつかの小さな問題（例えば、分散クエリの遅延、ReplicatedMergeTreeのバックグラウンド操作中の再試行可能エラーなど）が発生する可能性があります。

リリース日が1年以上離れている同じクラスター内で異なるバージョンを実行することは決して推奨しません。データ損失は予想されませんが、クラスターが無用になる可能性があります。バージョン間の差が1年を超える場合に予想される問題には以下が含まれます：

- クラスターが機能しない可能性があります
- 一部の（またはすべての）クエリが任意のエラーで失敗する可能性があります
- ログに任意のエラーや警告が表示される可能性があります
- ダウングレードが不可能になる可能性があります

### インクリメンタルアップグレード {#incremental-upgrades}

現在のバージョンと対象バージョンの差が1年以上ある場合、次のいずれかを推奨します：
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを再起動する）。
- または、中間バージョン（現在のバージョンよりも1年未満新しいバージョン）を介してアップグレードすること。

## 推奨プラン {#recommended-plan}

これらは、ダウンタイムのないClickHouseアップグレードの推奨手順です：

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` に含まれていないことを確認し、代わりに `/etc/clickhouse-server/config.d/` にあるようにしてください。 `/etc/clickhouse-server/config.xml` はアップグレード中に上書きされる可能性があります。
2. [変更履歴](/whats-new/changelog/index.md)を読み、破壊的な変更（対象リリースから現在のリリースにさかのぼる）を確認してください。
3. アップグレード前に行える破壊的な変更を特定して適用し、アップグレード後に必要な変更のリストを作成してください。
4. 各シャードのために、残りのレプリカがアップグレードされる間に維持するための1つ以上のレプリカを特定してください。
5. アップグレードされるレプリカで、1つずつ：
   - ClickHouseサーバーをシャットダウンする
   - サーバーをターゲットバージョンにアップグレードする
   - ClickHouseサーバーを起動する
   - システムが安定していることを示すKeeperメッセージを待つ
   - 次のレプリカに進む
6. KeeperログとClickHouseログにエラーがないか確認する
7. ステップ4で特定したレプリカを新しいバージョンにアップグレードする
8. ステップ1から3で行った変更のリストを参照し、アップグレード後に行う必要がある変更を適用してください。

:::note
複数のバージョンのClickHouseがレプリケート環境で実行されている場合、このエラーメッセージは予想されます。すべてのレプリカが同じバージョンにアップグレードされると、これが表示されなくなります。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouseサーバーバイナリアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouseが `deb` パッケージからインストールされた場合、サーバーで以下のコマンドを実行します：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨されている `deb` パッケージ以外を使用してClickHouseをインストールした場合、適切なアップデート方法を使用してください。

:::note
1つのシャードのすべてのレプリカがオフラインでない限り、複数のサーバーを同時に更新できます。
:::

古いバージョンのClickHouseを特定のバージョンにアップグレードする手順：

例として：

`xx.yy.a.b` は現在の安定版です。最新の安定版は [こちら](https://github.com/ClickHouse/ClickHouse/releases) で確認できます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
