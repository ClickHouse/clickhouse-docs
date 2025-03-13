---
slug: '/development/adding_test_queries'
sidebar_label: 'テストクエリの追加'
sidebar_position: 63
title: 'ClickHouse CIにテストクエリを追加する方法'
description: 'ClickHouse継続的インテグレーションにテストケースを追加する手順'
---

ClickHouseには何百、あるいは何千もの機能があります。すべてのコミットには、何千ものテストケースを含む複雑なテストセットがチェックされます。

コア機能は非常によくテストされていますが、ClickHouse CIを使用することで隅々まで確認されるコーナーケースや異なる機能の組み合わせがあります。

私たちが見るバグ/リグレッションのほとんどは、テストカバレッジが不十分な「グレーゾーン」で発生します。

私たちは、実際の使用状況で使われる可能性のあるシナリオや機能の組み合わせをほとんど網羅するテストをカバーすることに非常に興味があります。

## なぜテストを追加するのか {#why-adding-tests}

ClickHouseのコードにテストケースを追加すべき理由/タイミング：
1) 複雑なシナリオ/機能の組み合わせを使用する場合/広く使われていない可能性のあるコーナーケースがある場合
2) バージョン間で特定の動作が変わることに気付いた場合、変更ログに通知がない場合
3) ClickHouseの品質向上を手助けしたいと思っている場合、将来のリリースで使用する機能が壊れないことを保証したい場合
4) テストが追加/承認されると、確認しているコーナーケースが偶然壊れることがないと確信できます。
5) 優れたオープンソースコミュニティの一部となります
6) あなたの名前が`system.contributors`テーブルに表示されます！
7) 世界を少し良くします :)

### 手順 {#steps-to-do}

#### 前提条件 {#prerequisite}

Linuxマシンを実行していると仮定します（他のOS上でdocker / 仮想マシンを使用できます）し、現代的なブラウザとインターネット接続があり、基礎的なLinuxとSQLのスキルがあります。

高度に専門的な知識は必要ありません（C++を知っている必要はありませんし、ClickHouse CIの動作について何かを知っている必要もありません）。

#### 準備 {#preparation}

1) [GitHubアカウントを作成する](https://github.com/join)（まだ持っていない場合）
2) [gitをセットアップする](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/set-up-git)
```bash

# Ubuntuの場合
sudo apt-get update
sudo apt-get install git

git config --global user.name "John Doe" # あなたの名前に置き換えてください
git config --global user.email "email@example.com" # あなたのメールアドレスに置き換えてください
```
3) [ClickHouseプロジェクトをフォークする](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) - ただし、[https://github.com/ClickHouse/ClickHouse](https://github.com/ClickHouse/ClickHouse)を開いて、右上のフォークボタンを押します：
![fork repo](https://github-images.s3.amazonaws.com/help/bootcamp/Bootcamp-Fork.png)

4) フォークをPCのフォルダにクローンします。たとえば、`~/workspace/ClickHouse`
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

1) `clickhouse-server`をインストールする（[公式ドキュメント](/getting-started/install)に従ってください）
2) テスト設定をインストールする（Zookeeperモック実装を使用し、いくつかの設定を調整します）
```
cd ~/workspace/ClickHouse/tests/config
sudo ./install.sh
```
3) `clickhouse-server`を起動します
```
sudo systemctl restart clickhouse-server
```

#### テストファイルの作成 {#creating-the-test-file}

1) あなたのテスト番号を見つける - `tests/queries/0_stateless/`内で最も大きな番号のファイルを見つけます

```sh
$ cd ~/workspace/ClickHouse
$ ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
tests/queries/0_stateless/01520_client_print_query_id.reference
```
現在、テストの最後の番号は`01520`ですので、私のテストの番号は`01521`になります。

2) 次の番号とテストする機能の名前のSQLファイルを作成します

```sh
touch tests/queries/0_stateless/01521_dummy_test.sql
```

3) お気に入りのエディタでSQLファイルを編集します（以下のテストの作成に関するヒントを参照してください）
```sh
vim tests/queries/0_stateless/01521_dummy_test.sql
```

4) テストを実行し、その結果を参照ファイルに記録します：
```
clickhouse-client -nm < tests/queries/0_stateless/01521_dummy_test.sql | tee tests/queries/0_stateless/01521_dummy_test.reference
```

5) すべてが正しいことを確認します。出力が不正確な場合（たとえば、バグによって）、テキストエディタを使用して参照ファイルを調整します。

#### 良いテストの作成方法 {#how-to-create-a-good-test}

- テストは以下の条件を満たすべきです
	- 最小限である - テスト機能に関連するテーブルのみを作成し、無関係なカラムやクエリの部分を削除します。
	- 迅速である - 数秒（それより短い方が良い）以上かかるべきではありません。
	- 正当である - 動作しない場合はテストが失敗する。
        - 決定論的である
	- 隔離された/ステートレスである
		- 環境に依存しない
		- 可能な場合はタイミングに依存しない
- コーナーケースをカバーするように努める（ゼロ/ Null / 空のセット / 例外をスローする）
- クエリがエラーを返すことをテストするには、クエリの後に特別なコメントを追加します：`-- { serverError 60 }`または`-- { clientError 20 }`
- データベースを切り替えない（必要な場合を除いて）
- 必要に応じて同じノード上に複数のテーブルレプリカを作成できます
- 必要に応じてテストクラスタ定義の1つを使用します（system.clustersを参照）
- 該当する場合は、`number` / `numbers_mt` / `zeros` / `zeros_mt`などをクエリに使用してデータを初期化します。
- テストによって作成されたオブジェクトをクリーンアップします（テスト前にDROP IF EXISTS） - ダーティーな状態がある場合に備えて
- 操作の同期モードを優先します（変異、マージなど）
- `0_stateless`フォルダ内の他のSQLファイルを例として使用します。
- テストしたい機能や機能の組み合わせが既存のテストでカバーされていないことを確認します。

#### テスト命名規則 {#test-naming-rules}

テストに適切な名前を付けることは重要であり、特定のテストのサブセットをclickhouse-testの呼び出しでオフにできるようにするためです。

| テスターフラグ | テスト名に含めるべき内容 | フラグを追加するタイミング |
|---|---|---|
| `--[no-]zookeeper` | "zookeeper"または"replica" | テストが`ReplicatedMergeTree`ファミリーのテーブルを使用する場合 |
| `--[no-]shard` | "shard"または"distributed"または"global" | テストが127.0.0.2などへの接続を使用する場合 |
| `--[no-]long` | "long"または"deadlock"または"race" | テストが60秒を超えて実行される場合 |

#### コミット / プッシュ / PRを作成する {#commit--push--create-pr}

1) 変更をコミットしてプッシュします
```sh
cd ~/workspace/ClickHouse
git add tests/queries/0_stateless/01521_dummy_test.sql
git add tests/queries/0_stateless/01521_dummy_test.reference
git commit # 可能であれば、良いコミットメッセージを使用してください
git push origin HEAD
```
2) プッシュ中に表示されたリンクを使用して、メインリポジトリへのPRを作成します。
3) PRのタイトルと内容を調整し、`Changelog category (leave one)`には`Build/Testing/Packaging Improvement`を維持し、他のフィールドは必要に応じて記入します。
