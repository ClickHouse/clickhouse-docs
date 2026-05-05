---
description: 'ClickHouseのバックポートポリシーと自動化の概要'
sidebar_label: 'バックポートシステム'
sidebar_position: 56
slug: /development/backports
title: 'バックポートシステム'
doc_type: 'reference'
---

# バックポートシステム \{#backport-system\}

このドキュメントでは、ClickHouse のバックポートポリシーと、それを実現する自動化システムについて説明します。

## リリースモデル \{#release-model\}

ClickHouse のバージョンは `YY.M.patch.build-type` というスキームに従います。ここで、`YY` は西暦の下 2 桁、`M` はリリース月 (先頭の 0 なし) 、`patch` はブランチ内のパッチ番号、`build` は単調増加するビルド番号、`type` は `stable` または `lts` のいずれかです。

例: `25.3.8.23-lts` — 2025 年 3 月の LTS、パッチ 8、ビルド 23。

リリーストラックは 2 種類あります。

* **Stable** リリースは、おおむね毎月公開されます。直近 3 つの stable リリースにパッチが提供されるため、各リリースのアクティブサポート期間はおよそ 3 か月です。
* **LTS (Long-Term Support)** リリースは、毎年 3 月と 8 月に公開されます。2 つの LTS バージョンが同時にサポートされ、それぞれ少なくとも 12 か月間サポートされます。

本番ワークロードを実行しているユーザーには、最新の stable または LTS リリースのいずれかを使用し、パッチリリースでは互換性を損なう変更は導入されないため、新しいパッチバージョンに速やかにアップグレードすることを推奨します。

## バックポートポリシー \{#backport-policy\}

すべての変更がバックポートされるわけではありません。リリースブランチの安定性を維持するため、バックポートの範囲は意図的に限定されています。

* **セキュリティ修正** — 常にバックポートされます。
* **重大なバグ修正** (例外 (論理エラー) 、データ損失、誤った結果、RBAC の問題) — 一般的なバックポートルールに従って自動的にバックポート対象に選定されます。これらは `pr-critical-bugfix` ラベルで識別され、このラベルが付くと `pr-must-backport` が自動的に追加されます。
* **安定性に関する修正およびリグレッション修正** — 変更によるリスクが、バグをそのまま残すリスクに比べて低い場合にバックポートされます。これらは、メンテナーが手動で追加する `pr-must-backport` によって識別されます。
* **回避策がある軽微なバグ修正** — リリースブランチの不安定化を避けるため、通常はバックポートされません。
* **新機能、改善、パフォーマンス関連の作業** — バックポートされません。

`pr-must-backport` ラベルは、メンテナーが PR をバックポート対象として指定するために使用する手動 override です。`pr-critical-bugfix` ラベルが付くと、CI フックによって `pr-must-backport` が自動的に追加されます (`pr_labels_and_category.py` を参照) 。

**競合のエスカレーション。** 自動バックポートでマージ競合を解決できない場合でも、cherry-pick PR は作成し、元の PR の著者、マージ実行者、および既存の assignee に割り当てる必要があります。これにより、人手で競合を解消し、バックポートを完了できます。

## バックポートツール \{#backport-tool\}

上で説明したバックポートポリシーは、`tests/ci/cherry_pick.py` にある自動化ツールとして実装されています。このツールは ClickHouse のインフラストラクチャ上で GitHub Actions ワークフローとして実行され、アクティブなリリースブランチの検出、バックポート対象となる PR の選定、2 段階の cherry-pick とバックポート手順の実行、競合の管理、遅延ポリシーの適用、ラベルの同期維持など、必要な要件をすべて満たします。

長期的な目標は、この実装を他のプロジェクトでも採用できる独立実行型のオープンソース Python ツールとして切り出すことです。目標とする設計は次のとおりです。

* **設定可能** — すべてのポリシーパラメータ (適格ラベル、遅延ウィンドウ、古い PR のしきい値、ロールアウト時の動作など) を設定ファイルで表現し、コードを変更せずに、任意のプロジェクトのバックポート要件に合わせてツールを適応できるようにすること。
* **配布可能** — ClickHouse の CI インフラストラクチャに依存せず、PyPI からインストールできる自己完結型の Python wheel としてパッケージ化すること。
* **プログラム可能** — プルリクエスト、ラベル、リリースブランチについての明確なオブジェクトモデルを公開し、ユーザーがコアエンジン上で独自のワークフローをスクリプトできるようにすること。

### テスト \{#testing\}

独立実行型ツールでは、専用のテストスイートと軽量なテスト用インフラストラクチャを用意する予定です。このインフラストラクチャでは、あらかじめ次の内容を設定した一時的な GitHub リポジトリ (またはローカルでの同等の環境) を起動できるようになります。

* リリースラインを表す、構成可能なブランチのセット
* さまざまな組み合わせの バックポートラベル が付いた pull request
* リリースブランチを指す `release` ラベル付きのリリース PR

これによりテストでは、本番環境の状態に影響を与えることなく、実在するが使い捨て可能なリポジトリを対象に、ラベルの検出、cherry-pick ブランチの作成、競合の処理、backport PR の作成、assignee のロジック、ロールアウト時のスキップ、遅延ポリシーといった、自動化の一連の流れ全体を検証できます。同じインフラストラクチャは、ポリシーの変更をデプロイする前のリグレッションテストにも再利用できます。

## アクティブなリリースブランチ \{#active-release-branches\}

アクティブなリリースブランチとは、対応するリリース PR (`release` ラベル付き) が GitHub 上でまだオープンのままになっているブランチを指します。バックポートの自動化は実行のたびにこれらを動的に検出するため、新しいリリースが作成されたときや古いリリースがサポート終了に達したときでも、設定変更は不要です。

リリースブランチは、新しいリリースのデプロイ期間中、**rolling-out** 状態 (そのリリース PR に `rolling-out` ラベルが付いている状態) になることがあります。ロールアウトを複雑にしないよう、**rolling-out** ブランチに対する通常のバックポートは一時停止されます。バージョン固有のラベル (例: `v25.3-must-backport`) はこの動作を上書きし、ロールアウト中であってもバックポートを強制します。

## 実装 \{#implementation\}

### 概要 \{#overview\}

バックポートの自動化は、`tests/ci/cherry_pick.py` で実装された `CherryPick` GitHub Actions ワークフロー (`.github/workflows/cherry_pick.yml`) として 1 時間ごとに実行されます。これは、セルフホストの `style-checker-aarch64` ランナー上で、GitHub API とローカルの git 操作を通じて動作します。

このプロセスは、各 (元の PR、リリースブランチ) ペアごとに 2 段階で進行します。

1. 実際のマージ先から競合解決を切り離すために、**cherry-pick PR** が作成されます。競合がなければ、自動的にマージされます。
2. 実際のリリースブランチに対して **バックポート PR** が作成され、cherry-pick された変更は 1 つのコミットにまとめられます。

### ラベル \{#labels\}

元の PR に付与されたラベルによって、バックポートを実施するかどうかと、そのバックポート先が決まります。

| Label                                             | Effect                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pr-must-backport`                                | すべてのアクティブなリリースブランチにバックポートします (`rolling-out` が付いたブランチは除く)                             |
| `pr-must-backport-force`                          | `rolling-out` の制限を無視して、すべてのアクティブなリリースブランチにバックポートします                                  |
| `pr-critical-bugfix`                              | `pr-must-backport` を自動的にトリガーします (`pr_labels_and_category.py` 内の `AUTO_BACKPORT` 経由)  |
| `v{VER}-must-backport` (例: `v25.3-must-backport`) | その特定のリリースブランチにのみバックポートします。そのブランチでは `rolling-out` によるスキップを上書きします                      |
| `pr-backports-created`                            | 必要なバックポート PR がすべて作成されると、ボットによって設定されます。cherry-pick PR が再オープンされると解除されます                |
| `pr-cherrypick`                                   | ボットが作成した cherry-pick PR に付与されます                                                      |
| `pr-backport`                                     | ボットが作成したバックポート PR に付与されます                                                            |
| `do not test`                                     | CI が実行されないようにするため、cherry-pick PR に付与されます                                             |
| `rolling-out`                                     | 対象ブランチが現在ロールアウト中であることを示すため、**release PR** に設定されます。通常のバックポートではこのブランチはスキップされます         |

### ブランチ名と PR 名の命名規則 \{#branch-and-pr-naming\}

元の PR 番号 `N` とリリースブランチ `release/X.Y` ごとに、次の命名規則を使用します。

* Cherry-pick ブランチ: `cherrypick/release/X.Y/N`
* Backport ブランチ: `backport/release/X.Y/N`
* Cherry-pick PR タイトル: `Cherry pick #N to release/X.Y: <original title>`
* Backport PR タイトル: `Backport #N to release/X.Y: <original title>`

### 手順 \{#step-by-step-process\}

#### 1. アクティブなリリースを特定する \{#discover-active-releases\}

`BackportPRs.receive_release_prs` は、`release` ラベルが付いたオープンな PR を GitHub からすべて取得します。これらの PR の head ref がリリースブランチ名です (例: `release/25.3`) 。これに基づいて、`v25.3-must-backport` などの互換性ラベルのセットが導出されます。

#### 2. バックポート対象の PR を見つける \{#find-prs-to-backport\}

`BackportPRs.receive_prs_for_backport` は GitHub Search API を使用して、次の条件を満たすマージ済み PR を検索します。

* 少なくとも 1 つのバックポートラベル (`pr-must-backport`、`pr-must-backport-force`、`pr-critical-bugfix`、またはバージョン固有のラベル) が付いており、
* まだ `pr-backports-created` が付与されておらず、
* いずれかのリリースブランチで見つかった最も古いコミット日時より後にマージされており、
* 過去 90 日以内に更新されていること (検索クエリの効率を維持するため) 。

#### 3. ロールアウト中のブランチの処理 \{#rolling-out-branch-handling\}

リリース PR に `rolling-out` ラベルが付いている場合、汎用のバックポートラベル (`pr-must-backport`、`pr-critical-bugfix`) ではそのブランチはスキップされます。ボットは、そのブランチ向けに以前作成された cherry-pick PR またはバックポート PR を、説明コメントを付けてクローズします。バージョン固有のラベル (例: `v25.3-must-backport`) は、常にこれを重写する形で適用されます。`pr-must-backport-force` は、すべてのブランチで `rolling-out` チェックをバイパスします。

#### 4. Cherry-pick 段階 (`ReleaseBranch.create_cherrypick`) \{#cherry-pick-stage\}

cherry-pick PR がまだ存在しない各 (元の PR、リリースブランチ) の組み合わせについて:

1. リリースブランチをチェックアウトし、そこから **backport ブランチ** (`backport/release/X.Y/N`) を作成します。
2. マージコミットの first parent に対して `git merge -s ours` を実行し、内容変更のない合成マージベースを作成します。
3. 元の PR のマージコミットを直接指す **cherry-pick ブランチ** (`cherrypick/release/X.Y/N`) を強制的に作成します。
4. cherry-pick ブランチを backport ブランチへ `git merge --no-commit --no-ff` でマージします。
   * すでに最新であれば、その変更はすでにリリースブランチに取り込まれているため、完了としてマークしてスキップします。
   * それ以外の場合は (競合の有無を問わず) 、リセットして両方のブランチを push します。
5. `pr-cherrypick` および `do not test` のラベルを付けて、`cherrypick/release/X.Y/N` から `backport/release/X.Y/N` 宛ての cherry-pick PR を作成します。
6. 該当する場合は、元の PR から `pr-bugfix` または `pr-critical-bugfix` を引き継ぎます。
7. この時点では assignee は**設定されません**。追加されるのは、競合が検出された場合のみです。

#### 5. 競合のない cherry-pick PR の自動マージ \{#auto-merge-conflict-free-cherry-pick-prs\}

cherry-pick PR をマージできる場合 (競合がない場合) 、ボットは GitHub API 経由で自動的にマージし、すぐにバックポート段階へ進みます。

#### 6. バックポート段階 (`ReleaseBranch.create_backport`) \{#backport-stage\}

cherry-pick PR がマージされた後:

1. バックポートブランチをチェックアウトし、pull します。
2. リリースブランチとバックポートブランチの merge-base を特定します。
3. merge-base に対して `git reset --soft` を実行し、cherry-pick したすべてのコミットを 1 つにまとめます。
4. バックポート PR のタイトルをメッセージとしてコミットします。
5. バックポートブランチを force-push し、本来のリリースブランチ宛てのバックポート PR を作成します。
6. PR に `pr-backport` ラベルを付けます (該当する場合は `pr-bugfix` / `pr-critical-bugfix` も付けます) 。
7. PR を、元の PR の著者、マージした人、既存の assignee に割り当てます (ロボットアカウントは除きます) 。

#### 7. 完了 \{#completion\}

特定の元PRについて、対象のすべてのリリースブランチへのバックポートが完了すると、ボットは元PRに `pr-backports-created` を追加します。

#### 8. 事前チェック \{#pre-check\}

PR の作業を開始する前に、`ReleaseBranch.pre_check` は `git merge-base --is-ancestor` を実行し、そのマージコミットがリリースブランチからまだ到達可能になっていないことを確認します。すでに到達可能な場合、その PR はすでにバックポート済みと見なされ、スキップされます。

### 放置された Cherry-pick PR の処理 \{#stale-cherry-pick-pr-handling\}

`CherryPickPRs` クラスは、毎時実行の開始時に実行され、次の 2 つのケースを処理します。

* **孤立した cherry-pick PR**: cherry-pick PR のリリースブランチに対応するリリース PR がオープン状態でなくなった場合 (つまりリリースがクローズされた場合) 、その cherry-pick PR は自動的にクローズされます。
* **再オープンされた cherry-pick PR**: 元の PR にすでに `pr-backports-created` が付いていても、対応する cherry-pick PR がまだオープンな場合は、元の PR から `pr-backports-created` ラベルが削除され、再処理できるようになります。

手動でのコンフリクト解決待ちの cherry-pick PR については、次のように処理されます。

* **3 日**間更新がない場合、ボットは担当者にメンションする ping コメントを投稿します。
* **7 日**間更新がない場合、ボットはクローズする旨のコメントを投稿し、その PR をクローズします。

### コンフリクトの解消 \{#conflict-resolution\}

`cherry-pick` で競合が発生した場合、`cherry-pick` PR は人手で解消できるよう、開いたままになります。ボットはその PR を、元の PR の著者、マージした担当者、アサイン済みの担当者に割り当てます。競合が解消されて `cherry-pick` PR がマージされると、ボットは次の1時間ごとの実行時に バックポート PR を作成します。

backport を完全に破棄するには、`cherry-pick` PR をクローズします。ボットはそれを意図的にスキップされたものとして扱います。

壊れた `cherry-pick` PR を最初から作り直すには:

1. `cherry-pick` PR から `pr-cherrypick` ラベルを削除します。
2. `cherrypick/...` ブランチを削除します。
3. 元の PR に `pr-backports-created` がある場合は削除します。

### バックポートPR向けCI \{#ci-for-backport-prs\}

バックポートPRはリリースブランチを対象とするため、標準のプルリクエスト用ワークフローではなく、専用のCIワークフロー (`BackportPR`。`ci/workflows/backport_branches.py`で定義) を使用します。このワークフローでは、CIの代表的な子集を実行します。具体的には、ASan/UBSanおよびTSanビルド、リリースビルド、macOSビルド、ASanでの機能テスト、TSanでのストレステスト、統合テストです。また、バックポートブランチに1～50件のコミットがあり、かつ少なくとも1つの変更ファイルがあることも検証します (`check_backport_branch.py`で強制されます) 。

### 認証 \{#authentication\}

このワークフローでは、git push の操作に SSH 鍵 (`ROBOT_CLICKHOUSE_SSH_KEY`) を使用します。GitHub API 呼び出しの認証には `get_best_robot_token` が使用され、SSM (`/github-tokens`) に保存されたプールから、残り QUOTA が最も多いトークンを選択します。`ROBOT_CLICKHOUSE_COMMIT_TOKEN` は API 呼び出しには使用されず、Actions ワークフローの checkout ステップで使用されます。担当者を割り当てる際は、ロボットアカウント (`robot-clickhouse`、`clickhouse-gh`) は除外されます。

### GitHub API キャッシュ \{#github-api-cache\}

`GitHubCache` (`cache_utils.py` 内) は、PyGithub のオブジェクトキャッシュを S3 に永続化することで、毎時実行時の API 呼び出し数を削減します。キャッシュは各実行の開始時にダウンロードされ、終了時にアップロードされます。

### エラー処理 \{#error-handling\}

個々の PR の処理中に発生したエラーは捕捉してログに記録されますが、実行は停止しません。すべての PR の処理が完了した後、エラーが 1 件でも発生していた場合は、`BackportException` が送出されます。CI では、これを契機に `CIBuddy` を介してチームチャットへ通知が送信されます。