---
slug: /use-cases/observability/clickstack/demo-days/2026/04/10-04-2026
title: "デモデイズ - 10/04/2026"
sidebar_label: "10/04/2026"
pagination_prev: null
pagination_next: null
description: "ClickStack のデモデイズ（10/04/2026）"
doc_type: "guide"
keywords: ["ClickStack", "デモデイズ"]
---

## ピン留めできるデータソースフィルター \{#pinnable-datasource-filters\}

*[@brandon-pereira](https://github.com/brandon-pereira) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/j-b1ztSl8IQ" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

チームでデータソースフィルターをピン留めし、チーム全体で共有できるようになりました。任意のフィルターでピンアイコンをクリックすると、自分専用にピン留めするか、チーム全員に共有するかを選択できます。共有されたフィルターはフィルター一覧の上部にある専用セクションに表示されるため、各チームメンバーは正確なフィルター名を知らなくても簡単に見つけて適用できます。

これは、コミュニティから最も多く要望されていた機能の 1 つです。これにより、チームはフィルター設定を別の手段で共有する必要がなくなります。共有フィルターはピン留めされるとすぐにすべてのユーザーに表示されます。また、共有できるのはフィルターキーだけでなく特定のフィルター値も含まれるため、フィルターに必要なコンテキスト全体をそのまま共有できます。

**関連 PR:** [#2047](https://github.com/hyperdxio/hyperdx/pull/2047) [HDX-2300] チーム全体でフィルターの可視性と見つけやすさを高める 共有フィルター を導入

## ClickStack Cloud からサービスを復帰させる \{#waking-service-from-clickstack-cloud\}

*[@brandon-pereira](https://github.com/brandon-pereira) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Od7X0NOCqY0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack Cloud ユーザーは、アプリ内から直接スリープ中のサービスを復帰できるようになりました。以前は、サービスがスピンダウンしていると「再試行」のプロンプトが表示されていましたが、アプリが実際にサービスを復帰させることはありませんでした。いったん ClickStack Cloud に移動して手動で復帰させ、その後戻って自分で再試行する必要がありました。

現在は、この一連の処理をアプリがエンドツーエンドで行います。サービスがスリープ中の場合、プロンプトには「サービスを復帰」と表示され、現在の画面を離れることなく一連の処理が完了します。これは小さな使い勝手の改善ですが、ワークフローを中断する煩わしい複数ステップの手間を取り除けます。特に、しばらく操作していなかったあとに ClickStack を開いて、すぐにデータを確認したい場合に便利です。

## AI 機能を一貫して有効化する \{#consistent-enabling-of-ai-features\}

*デモ: [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/zS5OekPCzC0" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack の AI 機能は、現在では ClickHouse Cloud のコントロールプレーンからのみ切り替えられるようになり、ここが唯一の信頼できる設定元となりました。以前は、ClickStack のコントロールプレーンに 1 つ、アプリ自体に 1 つという、連携していない 2 つのチェックボックスがありました。片方を有効にしても、もう片方が同期されるとは限らなかったため、AI が実際に有効なのか分かりづらい状態でした。

現在、ClickStack 内のチェックボックスは ClickHouse Cloud へのリンクになっており、それ以外では無効化されています。ClickHouse Cloud でトグルを切り替えると、その機能は自動的に ClickStack でも利用可能になります。これにより、AI の有効化が一貫して予測可能になり、実際にどの設定が動作を制御しているのか迷う必要もなくなります。

## Raw SQL アラート \{#raw-sql-alerting\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bYYcYHkyy2E" title="YouTube ビデオ プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

既存の Raw SQL チャート機能を拡張し、しきい値ベースの通知をサポートすることで、Raw SQL の折れ線グラフでもアラートを利用できるようになりました。カスタム SQL クエリを基にした折れ線グラフがあれば、そこにアラートを追加し、他のチャートアラートと同様に設定できます。現在利用できるのは折れ線グラフと棒グラフです。しきい値比較を機能させるには、インターバルと日付範囲の両方のパラメータが必要なためです。

これにより、非常に強力なユースケースが実現します。デモでは、現在のインターバル内のエラー数をカウントし、直前の 30 個のインターバルと比較して、その値が過去の標準的な範囲を 2 標準偏差以上上回った場合に検出するクエリを紹介しています。このような統計的異常検知も、適切な SQL を記述してしきい値を設定するだけで実現できます。アラート設定はチャートエディタ内の折りたたみ可能なセクションに配置されているため、必要になるまで UI をすっきり保てます。

**関連 PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Raw SQL ベースのダッシュボードタイル向けアラートを実装, [#2085](https://github.com/hyperdxio/hyperdx/pull/2085) refactor: TileAlertEditor component を作成

## HyperDX TUI の改善 \{#hyperdx-tui-improvements\}

*[@wrn14897](https://github.com/wrn14897) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/cIigBpcrYlw" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX のターミナル UI は、ますます使い始めやすくなっています。`npm install -g @hyperdx/cli` でグローバルにインストールし、その後 `hdx` を実行して起動できるようになりました。対話型ターミナルインターフェイスを直接開くには、`--tui` フラグを使用します。実行ファイルも `npm` 経由で `hdx` として提供されるため、パッケージをインストールすれば追加のインストール手順は不要です。

今週は、インストールまわりの改善に加えて、注目すべき機能が 2 つ追加されました。エラーメッセージはターミナル内で適切にハイライトされ、構造化された形式で表示されるようになり、Web フロントエンドのフォーマットに合わせて、ブラウザーでも TUI でも同じレベルの詳細を確認できます。さらに、新しい SQL プレビューにより、実行される基になるクエリを確認できます。加えて、イベントビューアーから `Shift+A` で新しいアラートページにアクセスできるようになり、ターミナルを離れることなく、設定済みアラートの一覧と最近のトリガー履歴の概要を確認できます。

**関連 PR:** [#2095](https://github.com/hyperdxio/hyperdx/pull/2095) [HDX-3966] TUI のエラーメッセージ表示を改善し、SQL プレビューを追加、[#2093](https://github.com/hyperdxio/hyperdx/pull/2093) [HDX-3969] 概要と最近の履歴を表示するアラートページ (Shift+A) を追加、[#2043](https://github.com/hyperdxio/hyperdx/pull/2043) [HDX-3919] @hyperdx/cli パッケージを追加、[#2101](https://github.com/hyperdxio/hyperdx/pull/2101) [HDX-3976] CLI: 対話型ログインフローで apiUrl から appUrl へ移行