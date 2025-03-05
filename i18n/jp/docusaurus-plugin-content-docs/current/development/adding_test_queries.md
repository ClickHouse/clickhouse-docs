---
slug: /development/adding_test_queries
sidebar_label: テストクエリの追加
sidebar_position: 63
title: ClickHouse CIにテストクエリを追加する方法
description: ClickHouseの継続的インテグレーションにテストケースを追加する方法
---

ClickHouseには数百（あるいは数千）の機能があります。すべてのコミットは、多数のテストケースを含む複雑なテストセットによってチェックされます。

コア機能は非常によくテストされていますが、一部のコーナーケースや異なる機能の組み合わせは、ClickHouse CIで発見される可能性があります。

私たちが目にするバグやリグレッションの大部分は、テストカバレッジが不十分な「グレーエリア」で発生します。

私たちは、実際に使用される可能性のあるシナリオや機能の組み合わせをテストでカバーしたいと考えています。

## なぜテストを追加するのか {#why-adding-tests}

ClickHouseのコードにテストケースを追加するべき理由/タイミング：
1) 複雑なシナリオや機能の組み合わせを使用している、または広く使用されていないコーナーケースがある
2) バージョン間で特定の挙動が変更されているのを見た（変更ログで通知なし）
3) ClickHouseの品質向上を助けたい、または自分が使う機能が今後のリリースで壊れないことを確保したい
4) テストが追加/承認されると、確認したコーナーケースが偶発的に壊れることはない
5) 素晴らしいオープンソースコミュニティの一部になれる
6) あなたの名前が `system.contributors` テーブルに表示される！
7) 世界を少しでも良くする :)

### 実施手順 {#steps-to-do}

#### 前提条件 {#prerequisite}

Linuxマシンを運用していると仮定します（他のOSでdockerや仮想マシンを使用できます）し、現代的なブラウザ/インターネット接続があり、基本的なLinuxとSQLのスキルを持っている必要があります。

特に専門的な知識は必要ありません（C++についてやClickHouse CIの仕組みを知っている必要はありません）。

#### 準備 {#preparation}

1) [GitHubアカウントを作成](https://github.com/join)（まだ持っていない場合）
2) [gitをセットアップ](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/set-up-git)
```bash

# Ubuntuの場合
sudo apt-get update
sudo apt-get install git

git config --global user.name "John Doe" # あなたの名前を入力
git config --global user.email "email@example.com" # あなたのメールを入力
```
3) [ClickHouseプロジェクトをフォーク](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) - [https://github.com/ClickHouse/ClickHouse](https://github.com/ClickHouse/ClickHouse)を開き、右上のフォークボタンを押します：
![repoをフォークする](https://github-images.s3.amazonaws.com/help/bootcamp/Bootcamp-Fork.png)

4) あなたのフォークをPCのフォルダにクローンします。例えば `~/workspace/ClickHouse` のように。
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

1) `clickhouse-server`をインストールします（[公式ドキュメント](https://clickhouse.com/docs/zh/getting-started/install/)に従ってください）
2) テスト設定をインストールします（Zookeeperのモック実装を使用し、いくつかの設定を調整します）
```
cd ~/workspace/ClickHouse/tests/config
sudo ./install.sh
```
3) clickhouse-serverを実行します
```
sudo systemctl restart clickhouse-server
```

#### テストファイルの作成 {#creating-the-test-file}

1) テスト番号を見つけます - `tests/queries/0_stateless/`内の最大の番号のファイルを探します

```sh
$ cd ~/workspace/ClickHouse
$ ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
tests/queries/0_stateless/01520_client_print_query_id.reference
```
現在、テストの最後の番号は `01520` なので、私のテストは `01521` になります。

2) 次の番号とテストする機能の名前を持つSQLファイルを作成します

```sh
touch tests/queries/0_stateless/01521_dummy_test.sql
```

3) お好みのエディタでSQLファイルを編集します（以下のテスト作成のヒントを参照）
```sh
vim tests/queries/0_stateless/01521_dummy_test.sql
```

4) テストを実行し、その結果をリファレンスファイルに格納します：
```
clickhouse-client -nm < tests/queries/0_stateless/01521_dummy_test.sql | tee tests/queries/0_stateless/01521_dummy_test.reference
```

5) すべてが正しいか確認し、テスト出力が間違っている場合（例えばバグによる）には、テキストエディタを使用してリファレンスファイルを調整します。

#### 良いテストを作成する方法 {#how-to-create-a-good-test}

- テストは以下の特性を持つべきです：
	- 最小限 - テストする機能に関連するテーブルのみを作成し、無関係なカラムやクエリの部分を削除します
	- 高速 - 数秒（できればミリ秒）以内に完了するべきです
	- 正確 - 機能が動作していない場合は失敗します
        - 決定論的
	- アイソレート / ステートレス
		- 環境に依存しないこと
		- 可能な限りタイミングに依存しないこと
- コーナーケース（ゼロ / Null / 空のセット / 例外を投げる）をカバーすることを心がけます
- クエリがエラーを返すことをテストするために、クエリの後に特別なコメントを入れることができます： `-- { serverError 60 }` または `-- { clientError 20 }`
- データベースを切り替えてはいけません（必要ない限り）
- 必要に応じて、同じノードに複数のテーブルレプリカを作成できます
- 必要な場合にテストクラスタ定義のいずれかを使用できます（system.clustersを参照）
- 適用可能な場合は `number` / `numbers_mt` / `zeros` / `zeros_mt` などをクエリやデータの初期化に使用します
- テスト後およびテスト前に作成されたオブジェクトをクリーンアップ（DROP IF EXISTS）します - 汚れた状態を防ぐため
- 操作の同期モード（ミューテーション、マージなど）を優先します
- `0_stateless` フォルダ内の他のSQLファイルを例として使用します
- テストしたい機能/機能の組み合わせに対する既存のテストがないことを確認します

#### テスト名のルール {#test-naming-rules}

テストを正しく命名することは重要です。そうすれば、clickhouse-testの実行時にいくつかのテストのサブセットをオフにすることができます。

| テスター フラグ | テスト名に含めるべき内容 | フラグを追加するタイミング |
|---|---|---|
| `--[no-]zookeeper` | "zookeeper"または"replica" | テストが `ReplicatedMergeTree` ファミリーのテーブルを使用する場合 |
| `--[no-]shard` | "shard"または"distributed"または"global"| テストが127.0.0.2などへの接続を使用する場合 |
| `--[no-]long` | "long"または"deadlock"または"race" | テストが60秒以上実行される場合 |

#### コミット / プッシュ / PRを作成 {#commit--push--create-pr}

1) 変更をコミット＆プッシュします
```sh
cd ~/workspace/ClickHouse
git add tests/queries/0_stateless/01521_dummy_test.sql
git add tests/queries/0_stateless/01521_dummy_test.reference
git commit # 可能な限り適切なコミットメッセージを使用
git push origin HEAD
```
2) プッシュ中に示されたリンクを使用して、メインリポジトリにPRを作成します
3) PRのタイトルと内容を調整し、 `Changelog category (leave one)` には `Build/Testing/Packaging Improvement` を保持し、他のフィールドを埋めます。
