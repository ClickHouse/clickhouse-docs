---
'description': 'Update に関する Documentation'
'sidebar_title': 'Self-managed Upgrade'
'slug': '/operations/update'
'title': 'セルフマネージド アップグレード'
'doc_type': 'guide'
---

## ClickHouse アップグレード概要 {#clickhouse-upgrade-overview}

この文書には以下が含まれています：
- 一般的なガイドライン
- 推奨される計画
- システム上のバイナリをアップグレードするための具体的な手順

## 一般的なガイドライン {#general-guidelines}

これらのノートは、計画の手助けをし、文書内で推奨を行う理由を理解するのに役立ちます。

### ClickHouse サーバーは ClickHouse Keeper または ZooKeeper と別にアップグレードする {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper または Apache ZooKeeper のセキュリティ修正が必要でない限り、ClickHouse サーバーをアップグレードする際に Keeper をアップグレードする必要はありません。アップグレードプロセス中は Keeper の安定性が必要ですので、Keeper のアップグレードを検討する前に ClickHouse サーバーのアップグレードを完了してください。

### マイナーバージョンのアップグレードは頻繁に行うべき {#minor-version-upgrades-should-be-adopted-often}
リリースされるとすぐに最新のマイナーバージョンにアップグレードすることを強く推奨します。マイナーリリースは互換性のある変更がなく、重要なバグ修正があります（セキュリティ修正が含まれることもあります）。

### 目標バージョンで動作する別の ClickHouse サーバーで実験的機能をテストする {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

実験的機能の互換性は、いつでもどのように壊れる可能性があります。実験的機能を使用している場合は、変更履歴を確認し、目標バージョンがインストールされた別の ClickHouse サーバーを設定し、そこで実験的機能の使用をテストすることを検討してください。

### ダウングレード {#downgrades}
アップグレード後に新しいバージョンが依存している一部の機能と互換性がないことに気づいた場合、もし新機能を使用していなければ、最近の（1年未満の）バージョンにダウングレードできる場合があります。新機能を使用し始めると、ダウングレードは機能しなくなります。

### クラスター内の複数の ClickHouse サーバーバージョン {#multiple-clickhouse-server-versions-in-a-cluster}

1年間の互換性ウィンドウ（2つのLTSバージョンを含む）を維持するよう努めています。これは、任意の2つのバージョンが1年未満の差であれば、クラスター内で互いに動作できることを意味します（または2502つのLTSバージョンが間にない場合）。ただし、クラスター内のすべてのメンバーをできるだけ早く同じバージョンにアップグレードすることを推奨します。そうしないと、分散クエリの遅延、ReplicatedMergeTree内の一部のバックグラウンド操作での再試行可能なエラーなど、いくつかのマイナーな問題が発生する可能性があります。

リリース日が1年以上異なるバージョンを同じクラスターで実行することは絶対にお勧めしません。データ損失が発生するとは期待していませんが、クラスターは使用できなくなる可能性があります。バージョンの差が1年以上ある場合に予想される問題には、以下が含まれます：

- クラスターが機能しない
- 一部（またはすべて）のクエリが任意のエラーで失敗する
- 日誌に任意のエラー/警告が表示される
- ダウングレードが不可能になる

### インクリメンタルアップグレード {#incremental-upgrades}

現在のバージョンと目標バージョンの違いが1年以上である場合、以下のいずれかを推奨します：
- ダウンタイムを伴うアップグレード（すべてのサーバーを停止し、すべてのサーバーをアップグレードし、すべてのサーバーを稼働させる）。
- または、中間バージョン（現在のバージョンに対して1年未満新しいバージョン）を介してアップグレードする。

## 推奨される計画 {#recommended-plan}

これは、ゼロダウンタイムの ClickHouse アップグレードに推奨される手順です：

1. 設定の変更がデフォルトの `/etc/clickhouse-server/config.xml` ファイルにないことを確認し、代わりに `/etc/clickhouse-server/config.d/` にあることを確認してください。 `/etc/clickhouse-server/config.xml` はアップグレード中に上書きされる可能性があります。
2. [変更履歴](/whats-new/changelog/index.md)を確認し、互換性のない変更を探してください（ターゲットリリースから現在のリリースまでさかのぼって）。
3. アップグレードの前に行える互換性のない変更を特定し、アップグレード後に行う必要がある変更のリストを作成します。
4. 各シャードのために、他のレプリカがアップグレードされている間に維持する1つまたは複数のレプリカを特定します。
5. アップグレードされるレプリカに対して、一度に1つずつ：
- ClickHouse サーバーをシャットダウン  
- サーバーを目標バージョンにアップグレード  
- ClickHouse サーバーを起動  
- Keeper メッセージがシステムが安定していることを示すのを待つ  
- 次のレプリカに進む  
6. Keeper ログと ClickHouse ログでエラーを確認する
7. ステップ4で特定されたレプリカを新しいバージョンにアップグレードする
8. ステップ1から3で行われた変更のリストを参照し、アップグレード後に行う必要がある変更を行います。

:::note
レプリケーション環境で複数のバージョンの ClickHouse が実行されているときに、このエラーメッセージが表示されることは予想されます。すべてのレプリカが同じバージョンにアップグレードされると、これらは表示されなくなります。
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse サーバーバイナリアップグレードプロセス {#clickhouse-server-binary-upgrade-process}

ClickHouse が `deb` パッケージからインストールされている場合、サーバーで次のコマンドを実行します：

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

推奨される `deb` パッケージ以外の方法で ClickHouse をインストールした場合は、適切な更新方法を使用してください。

:::note
シャードのすべてのレプリカがオフラインでない限り、複数のサーバーを同時にアップデートできます。
:::

特定のバージョンへの ClickHouse の古いバージョンのアップグレード：

例として：

`xx.yy.a.b` が現在の安定バージョンです。最新の安定バージョンは [こちら](https://github.com/ClickHouse/ClickHouse/releases)で見つけることができます。

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
