---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-22
title: 'デモデイズ - 2026-05-22'
sidebar_label: '2026-05-22'
sidebar_position: -20260522
pagination_prev: null
pagination_next: null
description: 'ClickStack デモデイズ（2026-05-22）'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデイズ']
---

## ClickCannon のデータ生成アップデート \{#clickcannon-data-generation-update\}

*デモ: [@SpencerTorres](https://github.com/SpencerTorres)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Zljd07_4uF4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

[ClickCannon](https://github.com/clickhouse/clickcannon) は、サイジングの検証を行うために社内で使っているツールです。大量の OpenTelemetry データを生成しつつ同時にクエリを実行し、特定の取り込み量とクエリ workload に対して顧客に必要なリソースを見積もります。OpenHouse ではこれを一般公開すると発表し、Spencer がその最新バージョンを紹介しました。

ディスク上にデータを事前設定する代わりに、ジェネレーターをインラインで設定できるようになりました。有効化したうえで、スレッド数、ブロックあたりの行数、1 秒あたりの総行数、さらにいくつかのメモリ制約を設定できます。これまでのように、まず 2 テラバイトものテストデータをディスクに用意する必要はありません。これが以前、このツールを共有しづらくしていた要因でした。

今後は、独自のサイジング作業に ClickCannon を使うユーザーをさらに増やしていく予定です。リポジトリは [https://github.com/clickhouse/clickcannon](https://github.com/clickhouse/clickcannon) にあります。

## 全画面タイル向けの日付入力とログソース単位のフィルター \{#date-input-for-full-screen-tiles-and-source-scoped-filters\}

*デモ: [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Mop1EYtGwKc" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

関連するダッシュボード改善が 2 つ同時に導入されました。単一のタイルを全画面表示にすると、ダッシュボード全体の時間範囲とは独立した専用の時間ピッカーと粒度セレクターを使えるようになりました。つまり、特定の 1 つのメトリクス (たとえば ClickHouse クラスターのダッシュボード上の 1 つのチャート) について長期間の履歴を詳しく見たい場合でも、ダッシュボード上のほかのすべてのタイルを更新せずに済みます。さらに、ダッシュボード名がブラウザーのタブタイトルにも表示されるようになりました。

もう 1 つは、ダッシュボードフィルターのログソース単位でのスコープ指定です。フィルターを、すべてのタイルにグローバルに適用するのではなく、特定のログソースに基づくタイルにのみ伝播するよう制限できるようになりました。たとえば、ログとトレースを組み合わせた混在ログソースのダッシュボードでは、関係のないタイルにまでフィルターが及ぶのを防げます。

**関連 PR:** [#2302](https://github.com/hyperdxio/hyperdx/pull/2302) feat: 軽微なダッシュボード改善, [#2331](https://github.com/hyperdxio/hyperdx/pull/2331) feat: ダッシュボードフィルターにログソース単位のスコープ指定を追加

## lower(Body) 上のテキスト索引を認識 \{#text-index-recognised-on-lower-body\}

*デモ: [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/l0GpNBP859o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

大文字と小文字を区別しない検索に関する、小規模ながら実際の動作を正す修正です。ログソースで `lower(Body)` に対し、プリプロセッサ引数なしのテキスト索引を定義している場合、以前はクエリプランナーが `hasAllTokens(Body, ...)` という条件を生成していました。この式は索引式と一致しないため、テキスト索引は使われず、クエリはスキャンにフォールバックしていました。

現在は `hasAllTokens(lower(Body), ...)` が生成されるようになり、索引式と一致します。このように設定されたログソースでは、大文字と小文字を区別しない検索がテキスト索引によって正しく高速化されるようになりました。

**関連PR:** [#2326](https://github.com/hyperdxio/hyperdx/pull/2326) feat: support text index on lower(Body) with no preprocessor

## よりシンプルになったイベントデルタの操作性 \{#simpler-event-deltas-experience\}

*デモ: [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BrIHHFz_Aw8" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

イベントデルタでは、これまでひと手間必要でした。ヒートマップ上で範囲をドラッグする前に、まずボタンをクリックして比較モードに切り替える必要がありました。現在はその手順がなくなり、読み込み直後から分布バーが表示され、ヒートマップ上で領域をドラッグするとすぐに、バーが選択範囲と背景を比較するモードに切り替わります。選択範囲の外側をクリックすると、全スパン表示に戻ります。

この変更自体は数週間前に OSS に取り込まれていましたが、その一部は Managed ClickStack に反映されていませんでした。現在はその差も解消され、よりシンプルな操作フローが両エディションで共通になりました。

**関連PR:** [#1899](https://github.com/hyperdxio/hyperdx/pull/1899) feat: 常時有効の属性分布モード

## ダッシュボードの目次と一括折りたたみ \{#dashboard-table-of-contents-and-bulk-collapse\}

*[@teeohhem](https://github.com/teeohhem) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Pojo5zf_hrE" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボードのセクション数が数個を超えて増えてくると (それ自体は望ましいことです。大規模なダッシュボードを整理するにはセクションが欠かせないためです) 、移動や把握が面倒になります。Tom は、すべてのセクションを一覧でき、各セクションへ直接ジャンプできる右側レールの目次を追加しました。さらに、すべてのセクションの内容を一度に隠せる一括折りたたみ／展開コントロールもあり、長いダッシュボード全体をスクロールしなくても、その構成をすばやく確認できます。

まだドラフト段階ですが、ClickHouse クラスターや Kubernetes ビュー向けに提供している複数セクションのダッシュボードでは、すでに実用的です。

**関連 PR:** [#2350](https://github.com/hyperdxio/hyperdx/pull/2350) feat(dashboard): 目次の右側レールと一括折りたたみ／展開を追加

## セッションをまたいでカラムのリサイズを保持 \{#column-resize-persisted-across-sessions\}

*デモ: [@teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/7l-Rz1tFlq8" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

昨日お寄せいただいた顧客からの報告です。結果テーブルでカラムの幅を変更したら、その設定は保持されるべきです。現在はそのように動作します。リサイズした幅はテーブル ID ごとにローカルストレージへ保存されるため、異なるテーブルでもそれぞれ独立したカラムレイアウトが維持されます。ブラウザを閉じて後から戻ってきても、カラムは前回のままです。さらに、テーブルにカラムを追加または削除しても、ほかのカラムの幅がリセットされることはありません。

**関連PR:** [#2327](https://github.com/hyperdxio/hyperdx/pull/2327) fix: 検索結果テーブルでカラム幅を保持