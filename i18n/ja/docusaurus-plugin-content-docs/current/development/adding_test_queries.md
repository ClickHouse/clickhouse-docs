---
slug: /development/adding_test_queries
sidebar_label: テストクエリの追加
sidebar_position: 63
title: ClickHouse CIにテストクエリを追加する方法
description: ClickHouseの継続的インテグレーションにテストケースを追加する方法についての指示
---


ClickHouseには数百（または数千）の機能があります。すべてのコミットは、数千のテストケースを含む複雑なテストセットによってチェックされます。

コア機能は非常によくテストされていますが、一部のコーナーケースや機能の異なる組み合わせは、ClickHouse CIで明らかにすることができます。

私たちが見るバグやリグレッションのほとんどは、テストカバレッジが不十分な「グレーエリア」で発生します。

そして、私たちはテストによって実際に使用される可能性のあるシナリオや機能の組み合わせをほとんどカバーすることに非常に興味があります。

## なぜテストを追加するのか {#why-adding-tests}

ClickHouseコードにテストケースを追加する理由/タイミング：
1) 複雑なシナリオ/機能の組み合わせを使用している場合や、広く使用されていないコーナーケースがある場合
2) 特定の挙動がバージョン間で変更され、変更ログで通知されない場合
3) ClickHouseの品質を向上させる手助けをしたい、未来のリリースで使用する機能が壊れないことを確認したい
4) テストが追加/承認されると、確認したコーナーケースが偶発的に壊れないことが保証される
5) 素晴らしいオープンソースコミュニティの一部になること
6) あなたの名前が `system.contributors` テーブルに表示される！
7) 世界を少し良くすることができる :)

### 実施手順 {#steps-to-do}

#### 前提条件 {#prerequisite}

Linuxマシンを使用していると仮定します（他のOS上でDockerや仮想マシンを使用することもできます）と、任意のモダンなブラウザ/インターネット接続、基本的なLinuxおよびSQLスキルを持っていること。

特別な専門知識は必要ありません（C++を知っている必要はありませんし、ClickHouse CIの動作について何かを知る必要もありません）。

#### 準備 {#preparation}

1) [GitHubアカウントを作成](https://github.com/join) (まだ持っていない場合)
2) [gitをセットアップ](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/set-up-git)
```bash
# Ubuntuの場合
sudo apt-get update
sudo apt-get install git

git config --global user.name "John Doe" # 名前を入力
git config --global user.email "email@example.com" # メールアドレスを入力
```
3) [ClickHouseプロジェクトをフォーク](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) - [https://github.com/ClickHouse/ClickHouse](https://github.com/ClickHouse/ClickHouse)を開いて、右上のフォークボタンを押します：
![フォークリポジトリ](https://github-images.s3.amazonaws.com/help/bootcamp/Bootcamp-Fork.png)

4) あなたのフォークをPCの任意のフォルダにクローンします。例えば、`~/workspace/ClickHouse`
```
mkdir ~/workspace && cd ~/workspace
git clone https://github.com/<あなたのGitHubユーザー名>/ClickHouse
cd ClickHouse
git remote add upstream https://github.com/ClickHouse/ClickHouse
```

#### テスト用の新しいブランチ {#new-branch-for-the-test}

1) 最新のClickHouseマスターから新しいブランチを作成します
```
cd ~/workspace/ClickHouse
git fetch upstream
git checkout -b name_for_a_branch_with_my_test upstream/master
```

#### ClickHouseのインストールと実行 {#install--run-clickhouse}

1) `clickhouse-server`をインストールします（[公式ドキュメント](https://clickhouse.com/docs/ja/getting-started/install/)を参照）
2) テスト構成をインストールします（Zookeeperのモック実装を使用し、いくつかの設定を調整します）
```
cd ~/workspace/ClickHouse/tests/config
sudo ./install.sh
```
3) clickhouse-serverを実行します
```
sudo systemctl restart clickhouse-server
```

#### テストファイルの作成 {#creating-the-test-file}

1) テストの番号を見つけます - `tests/queries/0_stateless/`内で最も大きな番号のファイルを見つけます

```sh
$ cd ~/workspace/ClickHouse
$ ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
tests/queries/0_stateless/01520_client_print_query_id.reference
```
現在、最終番号は `01520` ですので、私のテスト番号は `01521` となります。

2) 次の番号とテストする機能名を使用してSQLファイルを作成します。

```sh
touch tests/queries/0_stateless/01521_dummy_test.sql
```

3) お気に入りのエディタでSQLファイルを編集します（下のテスト作成のヒントを参照）。
```sh
vim tests/queries/0_stateless/01521_dummy_test.sql
```

4) テストを実行し、その結果を参照ファイルに保存します：
```
clickhouse-client -nm < tests/queries/0_stateless/01521_dummy_test.sql | tee tests/queries/0_stateless/01521_dummy_test.reference
```

5) すべてが正しいことを確認し、出力が不正確な場合（バグなど）、テキストエディタを使用して参照ファイルを調整します。

#### 良いテストを作成する方法 {#how-to-create-a-good-test}

- テストは以下のようにあるべきです。
	- 最小限 - テストされる機能に関連するテーブルのみを作成し、無関係なカラムやクエリの部分を削除する
	- 高速 - 数秒（できれば数秒未満）以上かからない
	- 正確 - 機能が動作していない場合は失敗する
        - 決定的であること
	- 分離されている / ステートレスであること
		- 環境に依存しない
		- 可能な限りタイミングに依存しない
- コーナーケース（ゼロ/Null/空セット/例外を投げる）をカバーするよう努める
- クエリがエラーを返すことをテストするには、クエリの後に特別なコメントを追加できます： `-- { serverError 60 }` または `-- { clientError 20 }`
- 必要でなければデータベースを切り替えない
- 必要に応じて同じノード上に複数のテーブルレプリカを作成できます
- 必要に応じてテストクラスタの定義の1つを使用できます（system.clustersを参照）
- 適用される場合は、クエリやデータの初期化に`number` / `numbers_mt` / `zeros` / `zeros_mt`などを使用する
- テストの後とテストの前に作成されたオブジェクトをクリーンアップする（DROP IF EXISTS）- 不具合状態がある場合にも対応
- 操作の同期モード（変更、マージなど）を好む
- `0_stateless`フォルダ内の他のSQLファイルを例として使用する
- テストしたい機能/機能の組み合わせが既存のテストでカバーされていないことを確認する

#### テストの命名規則 {#test-naming-rules}

テストに適切な名前を付けることは重要です。これにより、clickhouse-testの呼び出しでいくつかのテストのサブセットをオフにできます。

| テストフラグ| テスト名に含まれるべき内容 | フラグを追加するタイミング |
|---|---|---|
| `--[no-]zookeeper`| "zookeeper"または"replica" | テストが`ReplicatedMergeTree`ファミリーからのテーブルを使用する場合 |
| `--[no-]shard` | "shard"または "distributed" または "global"| テストが127.0.0.2などへの接続を使用する場合 |
| `--[no-]long` | "long"または"deadlock"または"race" | テストが60秒以上実行される場合 |

#### コミット / プッシュ / PRを作成 {#commit--push--create-pr}

1) 変更をコミットしてプッシュします
```sh
cd ~/workspace/ClickHouse
git add tests/queries/0_stateless/01521_dummy_test.sql
git add tests/queries/0_stateless/01521_dummy_test.reference
git commit # できるだけ良いコミットメッセージを使用
git push origin HEAD
```
2) プッシュ中に表示されたリンクを使用して、メインリポジトリへのPRを作成します。
3) PRのタイトルと内容を調整します。 `Changelog category (leave one)`には
`Build/Testing/Packaging Improvement`を維持し、他のフィールドを埋めることができます。

