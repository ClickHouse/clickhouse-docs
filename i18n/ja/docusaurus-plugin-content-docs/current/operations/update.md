---
slug: /operations/update
sidebar_title: セルフマネージドアップグレード
title: セルフマネージドアップグレード
---
## ClickHouse アップグレード概要 {#clickhouse-upgrade-overview}

この文書には以下が含まれています：
- 一般的なガイドライン
- 推奨プラン
- システム上のバイナリをアップグレードするための具体的な手順
## 一般的なガイドライン {#general-guidelines}

これらのノートは、計画の助けとなり、文書の後半で推奨を行う理由を理解するのに役立ちます。
### ClickHouse サーバーは ClickHouse Keeper または ZooKeeper とは別にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper に対するセキュリティ修正が必要でない限り、ClickHouse サーバーをアップグレードする際に Keeper をアップグレードする必要はありません。アップグレードプロセス中は Keeper の安定性が必要ですので、Keeper のアップグレードを考慮する前に ClickHouse サーバーのアップグレードを完了してください。
### マイナーバージョンのアップグレードは頻繁に行うべきです {#minor-version-upgrades-should-be-adopted-often}
新しいマイナーバージョンがリリースされ次第、常にアップグレードすることを強くお勧めします。マイナーバージョンのリリースには破壊的な変更はありませんが、重要なバグ修正（およびセキュリティ修正）が含まれます。
### 対象バージョンを実行している別の ClickHouse サーバーで実験的機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性は、いつでも任意の方法で破壊される可能性があります。実験的機能を使用している場合は、変更ログを確認し、ターゲットバージョンがインストールされた別の ClickHouse サーバーを設定して、そこで実験的機能の使用をテストすることを検討してください。
### ダウングレード {#downgrades}
アップグレード後に新しいバージョンが依存している機能と互換性がないことに気づいた場合、新しい機能を使用していなければ最近の（1年未満の）バージョンにダウングレードできる可能性があります。ただし、新しい機能を使用し始めると、ダウングレードは機能しなくなります。
### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

私たちは、1年間の互換性ウィンドウ（2つの LTS バージョンを含む）を維持するよう努めています。これは、2つのバージョン間の差が1年未満であれば、クラスター内で一緒に動作できることを意味します（または、2つの LTS バージョンが間に存在しない場合）。ただし、クラスター内のすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることをお勧めします。なぜなら、分散クエリの遅延や ReplicatedMergeTree のバックグラウンド操作での再試行可能なエラーなど、一部のマイナーな問題が発生する可能性があるからです。

リリース日の差が1年以上ある場合、同じクラスター内で異なるバージョンを実行することは決して推奨しません。データ損失が発生することはないと予想していますが、クラスターが使用不可になる可能性があります。バージョン間に1年以上の差がある場合に予期される問題には以下が含まれます：

- クラスターが動作しない可能性がある
- 一部（または全て）のクエリが任意のエラーで失敗する可能性がある
- ログに任意のエラーや警告が表示される可能性がある
- ダウングレードが不可能になる可能性がある
### インクリメンタルアップグレード {#incremental-upgrades}

現在のバージョンとターゲットバージョンとの間の差が1年以上である場合、以下のいずれかをお勧めします：
- 停止時間を伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを起動する）。
- または、途中のバージョン（現在のバージョンよりも1年未満新しいバージョン）を介してアップグレードする。
## 推奨プラン {#recommended-plan}

以下は、ゼロダウンタイムの ClickHouse アップグレードの推奨ステップです：

1. 設定変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルに含まれていないことを確認し、代わりに `/etc/clickhouse-server/config.d/` にあるようにします。 `/etc/clickhouse-server/config.xml` はアップグレード中に上書きされる可能性があります。
2. [変更ログ](/whats-new/changelog/index.md) を読み、破壊的変更を確認します（ターゲットリリースから現在のリリースに戻ります）。
3. アップグレード前に行うことができる破壊的変更に従った更新を行い、アップグレード後に行う必要がある変更のリストを作成します。
4. 各シャードの複数のレプリカを特定し、他のレプリカがアップグレードされている間に追従させます。
5. アップグレードされるレプリカで、1つずつ：
   - ClickHouse サーバーをシャットダウンする
   - サーバーをターゲットバージョンにアップグレードする
   - ClickHouse サーバーを起動する
   - システムが安定していることを示す Keeper メッセージを待つ
   - 次のレプリカに進む
6. Keeper ログと ClickHouse ログにエラーがないかチェックします
7. ステップ 4 で特定されたレプリカを新しいバージョンにアップグレードします
8. ステップ 1 から 3 で行った変更のリストを参照し、アップグレード後に行う必要がある変更を行います。

:::note
レプリケートされた環境で複数のバージョンの ClickHouse が動作している際には、このエラーメッセージが期待されます。すべてのレプリカが同じバージョンにアップグレードされると、これが表示されなくなります。
```text
MergeFromLogEntryTask: コード: 40. DB::Exception: パーツのチェックサムが一致しません：
非圧縮ファイルのハッシュが一致しません。 (CHECKSUM_DOESNT_MATCH) マージ後のデータが他のレプリカ上のデータとバイト単位で同一ではありません。
```
:::
## ClickHouse サーバーバイナリのアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouse が `deb` パッケージからインストールされている場合は、サーバーで以下のコマンドを実行してください：

``` bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨される `deb` パッケージ以外で ClickHouse をインストールした場合は、適切なアップデート方法を使用してください。

:::note
すべてのシャードのレプリカがオフラインでないときに、複数のサーバーを同時にアップデートすることができます。
:::

特定バージョンへの古い ClickHouse のアップグレード：

例として：

`xx.yy.a.b` は現在の安定版です。最新の安定版は [こちら](https://github.com/ClickHouse/ClickHouse/releases) で見つけることができます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
