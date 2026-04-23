---
slug: /use-cases/observability/clickstack/demo-days/2026/04/2026-04-17
title: 'デモデイズ - 2026-04-17'
sidebar_label: '2026-04-17'
pagination_prev: null
pagination_next: null
description: 'ClickStack デモデイズ - 2026-04-17'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデイズ']
---

## ログとトレースの要約 \{#summarize-logs-and-traces\}

*[@alex-fedotyev](https://github.com/alex-fedotyev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/TWsFyWt-tD8" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX には、ログ、トレース、パターンをまたいで動作する AI 要約機能が追加されました。新しい summarize ボタンはテレメトリデータを読みやすい要約にまとめるため、イベントを一つひとつ手作業で読まなくても、一連のイベント全体で何が起きたのかをすばやく把握できます。

特に面白い追加機能のひとつは、要約のトーンやテーマを選べることです。たとえば Shakespeare drama のようなオプションを選ぶと、システムで起きたことを文体を変えて読むことができます。単なる目新しさにとどまらず、このアーキテクチャは Anthropic (または同様のサービス) の API と連携できるよう設計されており、最初の要約の後もユーザーが質問を続けられるよう、フォローアップの会話にも対応できるよう構築されています。

**関連 PR:** [#2108](https://github.com/hyperdxio/hyperdx/pull/2108) feat: 拡張可能な対象、トレースコンテキスト、セキュリティ強化を備えた AI 要約、[#2100](https://github.com/hyperdxio/hyperdx/pull/2100) スマートトーンモードを備えた実際の AI 要約コールバックを実装

## イベントデルタのヒートマップをチャートビルダーに統合 \{#event-deltas-heatmap-into-chart-builder\}

*[@alex-fedotyev](https://github.com/alex-fedotyev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BLVhIQjocwE" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

イベントデルタのヒートマップ可視化は、HyperDX の他の可視化と並ぶ標準的なチャートタイプとして利用できるよう、メインのチャートビルダーへの移行が進められています。以前は専用ビューでのみ利用できましたが、現在は他のチャートタイプと同様にチャートエクスプローラー内で利用できます。

この作業が完了すると、ユーザーはイベントデルタのヒートマップをダッシュボードタイルに直接配置できるようになり、他のチャートと同様のフィールドフィルタリングやタイムレンジ制御を利用できます。現在も実装を進めています。

**関連PR:** [#2107](https://github.com/hyperdxio/hyperdx/pull/2107) feat: ヒートマップチャートをダッシュボードエディターとタイルレンダリングに統合, [#2102](https://github.com/hyperdxio/hyperdx/pull/2102) イベントデルタをサポートする再利用可能な Heatmap チャートを実装

## schema 改善のためのベンチマーク \{#benchmarking-for-schema-improvements\}

*[@knudtty](https://github.com/knudtty) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/_B7TmIiXZyM" title="YouTube ビデオ プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Aaron が、HyperDX の更新版デフォルト OpenTelemetry logs schema に関するベンチマーク結果を解説します。主な変更点は、レガシーな `timestamp_time` カラム (秒粒度の 32 ビット Unixタイムスタンプ) を廃止し、ナノ秒精度を持つ `timestamp` のみに統一したことです。これにより、schema から 1 つカラムが削減されました。幅広いクエリベンチマークで、更新後の schema はほぼすべてのケースで旧 schema と同等以上の性能を示しています。

最終的な schema には、選択性の高いクエリで明確な効果を示す読み取り順序の最適化も含まれています。比較的まれな map 値の検索はベースラインと比べておよそ 2 倍高速になり、高頻度の値の検索ではさらに大きな改善が見られました。挿入性能にはわずかなオーバーヘッドがあります (維持するカラムが増えるため) が、全体としてクエリ性能は同等か改善しており、シンプルに適用できるアップグレードと言えます。

**関連 PR:** [#2125](https://github.com/hyperdxio/hyperdx/pull/2125) feat: 最適化されたデフォルト otel-logs schema

## オートコンプリートの改善 \{#improvements-to-autocomplete\}

*デモ: [@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/8zDZx49uYQo" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX のオートコンプリートは大幅に刷新され、はるかに高いカーディナリティへの対応と、値の読み込み高速化を実現しています。新しい実装はロールアップテーブル (15 分単位の時間バケットでキー・バリューのペアを事前集計する `AggregatingMergeTrees`) を基盤としているため、キー入力のたびに生データへクエリを実行する代わりに、はるかに小さい事前計算済みデータセットを読み取ります。2 億 3,000 万行のステージングインスタンスを使ったライブデモでは、`hostname` のような高カーディナリティのフィールドでも、オートコンプリートは目立った遅延なくすばやく値を読み込みました。

このシステムは、キーのみのロールアップ (すべてのキーを返し、関連する値は返さないことでカーディナリティのオーバーヘッドを抑える) と、完全なキー・バリューのロールアップの両方をサポートしています。キーのロールアップしか存在しない場合、値の検索ステップでは既存の fetch-values 戦略にフォールバックします。ロールアップテーブルがまったく検出されない場合でも、現在の動作に自然にフォールバックします。Aaron はまた、どのキーに値のロールアップを作成するかを制御する将来の許可リスト UI は、とくに高カーディナリティのデータを扱う顧客にとって有用な追加機能になるだろうとも述べています。

**関連 PR:** [#2128](https://github.com/hyperdxio/hyperdx/pull/2128) feat: 高速かつ完全なオートコンプリート, [#2127](https://github.com/hyperdxio/hyperdx/pull/2127) feat: 改善されたオートコンプリート

## SQL によるアラート機能の改善 \{#improvements-to-alerting-with-sql\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BOk-LC0y2no" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

前週に Raw SQL の折れ線グラフと棒グラフに対するアラートが追加されたのに続き、HyperDX で Raw SQL の数値グラフに対するアラートもサポートされるようになりました。アラート設定時に時間フィルターパラメータは不要になりました。省略した場合は警告が表示されますが、時間ディメンションをまったく持たないクエリも有効なものとして扱われます。これにより、ClickHouse クラスターの数が想定どおりの値であることを確認するなど、時間とともに変化しない設定値やシステムメトリクスに対しても簡単にアラートを設定できます。

また、新しいしきい値タイプも複数追加されました。not-equals、is-above、at-most、between、outside です。これにより、単純な greater-than 比較だけでなく、チームはアラート条件をより柔軟に表現できるようになります。最後に、アラート履歴がタイルエディターに直接表示されるようになりました。これにより、発報中のアラートが特定のダッシュボードタイルにリンクしている場合でも、ユーザーは完全な履歴を確認し、何がトリガーになったのかを把握したうえで、ダッシュボードから移動せずにアラートの確認応答やサイレンスを実行できます。

**関連 PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Raw SQL ベースのダッシュボードタイル向けアラートを実装, [#2114](https://github.com/hyperdxio/hyperdx/pull/2114) feat: Raw SQL Number Charts のアラートをサポート, [#2122](https://github.com/hyperdxio/hyperdx/pull/2122) feat: 追加のアラートしきい値タイプを追加, [#2130](https://github.com/hyperdxio/hyperdx/pull/2130) feat: between および not-between のアラートしきい値を追加, [#2123](https://github.com/hyperdxio/hyperdx/pull/2123) feat: アラート履歴 + ack をアラートエディターに追加

## アラート実行時のエラー \{#errors-during-alert-execution\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/b3G8kFiQiUg" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

アラートの実行に失敗した場合、HyperDX ではそのエラーが黙って見過ごされるのではなく、UI に直接表示されるようになりました。以前は、アラート履歴に抜けがあっても理由がわからず、エラーメッセージもなければ何が起きたのかをデバッグする手段もありませんでした。現在は、無効なクエリ、webhook 配信の失敗、webhook 設定の欠落や設定不備など、失敗の種類ごとに異なるエラーアイコンがインラインで表示されます。

エラーアイコンをクリックすると、問題の診断と解決に必要な詳細を確認できるため、サーバーログを掘り返したりサポートを依頼したりしなくても、設定不備のあるアラートを修正できます。目的は、アラート失敗にセルフサービスで対応できるようにすることです。エラーを確認し、内容を理解し、修正できます。

**関連 PR:** [#2132](https://github.com/hyperdxio/hyperdx/pull/2132) feat: UI にアラート実行エラーを表示, [#2136](https://github.com/hyperdxio/hyperdx/pull/2136) fix: 機微情報を含む可能性があるアラートエラーを非表示