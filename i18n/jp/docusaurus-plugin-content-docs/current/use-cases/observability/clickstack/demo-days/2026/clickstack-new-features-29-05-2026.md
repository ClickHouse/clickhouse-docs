---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-29
title: 'デモデイズ - 2026-05-29'
sidebar_label: '2026-05-29'
sidebar_position: -20260529
pagination_prev: null
pagination_next: null
description: '2026-05-29 の ClickStack デモデイズ'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデイズ']
---

## バージョンを考慮したスキーマフィルタリングの改善 \{#version-aware-improved-schema-filtering\}

*デモ: [@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bAVaBnfJ82Y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack では現在、`direct_read` 最適化は ClickHouse バージョン 26.2 以降でのみ適用されます。これは、このバージョン以降では全文検索索引がオープンソースのスキーマに追加された alias カラムを正しくサポートしているためです。以前は、正しく動作しない古いバージョンでもこの最適化が試行されることがありました。バージョンチェックはスキーマを調べてクエリ時に行われ、alias カラム自体も現在はデフォルトでオープンソースのスキーマに含まれています。

あわせて、自動補完用の materialized view をテキスト索引への直接クエリに置き換える作業も紹介されました。現時点では両者が重複した処理を行っており、取り込み負荷を増やしています。ベンチマークの結果、テキスト索引へのクエリで十分な性能が維持できることが確認されれば、materialized view は簡素化または削除できるようになります。Aaron はさらに、今後の ClickHouse テキスト索引のバージョンで位置エンコーディングが導入されれば、キー・バリューのフィルタ ルックアップがさらに高精度になる可能性について、チームからの質問にも答えました。

**関連 PR:** [#2341](https://github.com/hyperdxio/hyperdx/pull/2341) feat: logs と traces に対して `direct_read` 最適化をデフォルトで有効化, [#2405](https://github.com/hyperdxio/hyperdx/pull/2405) feat(common-utils): SQL フィルタに `direct_read` の KV アイテム最適化を適用, [#2376](https://github.com/hyperdxio/hyperdx/pull/2376) feat: フィルタと自動補完にテキスト索引を活用

## ログのパースの改善 \{#better-log-parsing\}

*[@dhable](https://github.com/dhable) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/vhkMlddahu4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ある顧客のログでは、イベント本文が `level` フィールドを含む JSON オブジェクトになっていました。重要度の推定ロジックでは、本文を JSON としてパースして属性を抽出する処理と、OTel レベルで重要度が設定されていない場合に文字列マッチングへフォールバックする処理の 2 つを行っていました。この文字列マッチングが、本文内の alert manager 名に含まれる &quot;alert&quot; という単語を拾ってしまい、ログレベルを誤って分類していました。

この修正では、ガード条件を追加しています。本文が JSON としてパースされ、すでに level フィールドを含んでいる場合は、文字列による推定処理を完全にスキップします。約 1 年前に作られたスモークテストスイートがあったおかげで、新しいテストケースを追加するだけで修正を簡単に検証でき、関連するエッジケースも検出できました。まさにそのために設計されたものです。

**関連 PR:** [#2363](https://github.com/hyperdxio/hyperdx/pull/2363) fix(log-parser): body が level フィールドを含む JSON としてパースされる場合、文字列推定をスキップ

## MCPサーバーの改善 \{#mcp-server-improvements\}

*デモ: [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aIy1zfmlz3Y" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

今週は、イベントパターンのバケット化とスコアリングの改善、エラーヒントの強化、共通ヘルパーの整理など、MCPに複数の改善が加わりました。ツールのプレフィックスも、製品名に合わせて `hyperdx_` から `clickstack_` に変更されました。

**関連PR:** [#2337](https://github.com/hyperdxio/hyperdx/pull/2337) feat(mcp): MCPツールの品質を改善 — エラーヒント、共通ヘルパー、メッセージの改善、[#2396](https://github.com/hyperdxio/hyperdx/pull/2396) refactor(mcp): ツールのプレフィックスを hyperdx&#95; から clickstack&#95; に変更、[#2343](https://github.com/hyperdxio/hyperdx/pull/2343) feat(mcp): patch&#95;dashboard、get&#95;dashboard&#95;tile、search&#95;dashboards ツールを追加、[#2418](https://github.com/hyperdxio/hyperdx/pull/2418) fix(mcp): 読みやすいチャート凡例のためにエイリアスの説明と例を改善、[#2412](https://github.com/hyperdxio/hyperdx/pull/2412) refactor: 共通ヘルパーとスキーマレベルのチェックによりMCPのObjectId検証を簡素化

## 新しい系列カラーパレット \{#new-series-color-palette\}

*デモ: [@elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/YzECP3diWvg" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Elizabet は、Alex によるカラーピッカー対応を支える一環として、HyperDX と ClickStack のテーマ間でデータ可視化のカラーパレットを統一する作業に取り組みました。これまで 2 つのテーマはそれぞれ別のパレットを持ち、さらに各テーマごとに例外ルールもあったため、色の扱いを整理して考えるのが必要以上に複雑になっていました。目標は、両方のテーマで使える単一のパレットを作ることでした。

彼女は、コントラストとアクセシビリティを確認するため、色覚シミュレーションツールを使って業界標準のパレット (Tableau、Observable、IBM) で検証しました。ClickHouse のパレットは結果が振るわず、特に緑は白背景上で十分なコントラストが確保できていませんでした。Tableau と Observable も、それぞれ少なくとも 1 つのチェックに失敗しています。一方、IBM のパレットはすべてのチェックを通過しましたが、色数が 5 色しかなく不十分です。総合的には Observable のパレットが最も条件に近く、青を少し調整したうえで、今後は両方のテーマで共有されることになりました。

**関連 PR:** [#2362](https://github.com/hyperdxio/hyperdx/pull/2362) refactor(theme): chart パレットのトークン名を色相名に変更し、テーマ間で統一

## スティッキーヘッダー対応の新しいページレイアウト \{#new-page-layout-with-sticky-header\}

*[@elizabetdev](https://github.com/elizabetdev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e7d3ocqi4Ac" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

新しい PageHeader と PageLayout のコンポーネントの組み合わせが、ダッシュボード、サービスマップ、クライアントセッション、Kubernetes、ClickHouse ダッシュボードなど、主要なページ全体に導入されました。これにより、すべてのページでパディング、ヘッダー下の境界線、タイトル構造が統一されました。以前はページごとにばらつきがあり、左側にタイトル、右側にコントロールがあるページもあれば、タイトル自体がないページもありました。

スティッキー動作は prop で有効にするオプトイン方式です。sticky slot に渡した内容は、スクロールしてもヘッダーの下に固定されたままになり、それ以外の要素は通常どおりスクロールします。何も渡されておらず、パンくずリストやページオプションしかない場合は、それらが自動的にスティッキーになります。

**関連 PR:** [#2282](https://github.com/hyperdxio/hyperdx/pull/2282) PageHeader/PageLayout を追加し、Sessions を移行, [#2345](https://github.com/hyperdxio/hyperdx/pull/2345) 一覧ページで PageHeader の title を使用, [#2346](https://github.com/hyperdxio/hyperdx/pull/2346) Service Map を PageLayout に移行, [#2347](https://github.com/hyperdxio/hyperdx/pull/2347) Kubernetes ダッシュボードを PageLayout に移行, [#2348](https://github.com/hyperdxio/hyperdx/pull/2348) ClickHouse ダッシュボードを PageLayout に移行, [#2364](https://github.com/hyperdxio/hyperdx/pull/2364) feat(dashboard): スティッキーなクエリツールバー付きで PageLayout に移行, [#2394](https://github.com/hyperdxio/hyperdx/pull/2394) fix(PageHeader): スティッキーヘッダーがドロワーのオーバーレイの下に維持されるよう修正

## シリーズ向けの新しいデータソースセレクターと色選択 \{#new-datasource-selector-and-color-picking-for-series\}

*[@alex-fedotyev](https://github.com/alex-fedotyev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/DKfJs9onl50" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Alex による UI の改善が 2 つあります。データソースセレクターは整理され、クリックすると選択できるデータソースだけが表示されるようになりました。スキーマの表示や新しいログソースの作成といった管理操作は、別のケバブメニューに移されています。これにより、選択と設定が切り分けられました。これは以前からやるべき項目として挙がっていたもので、チームからのフィードバックにも応えています。

Number タイルでは固定色のカラーピッカーも使えるようになり、メトリクスに特定の色を割り当てられるようになりました。条件付きの色ルール (しきい値やカラムに応じて赤、緑、黄色に変わる機能) も現在進行中です。Elizabet の統一パレットが導入されれば、どちらも現在の「color 1、2、3」というラベルではなく、適切な色名を使うようになります。これは、Grafana のようなツールから移行してくるユーザーにとって有意義な改善になるはずです。

**関連 PR:** [#2365](https://github.com/hyperdxio/hyperdx/pull/2365) feat(source-picker): chip + kebab menu UX, [#2265](https://github.com/hyperdxio/hyperdx/pull/2265) feat(app): number tile static color picker

## ダッシュボード操作のヒントを改善 \{#better-hints-for-dashboard-actions\}

*[@alex-fedotyev](https://github.com/alex-fedotyev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/yQaKMSXp8YA" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボードのテーブルタイルの行で、ホバー時の表示がよりわかりやすくなりました。マウスオーバーするとカーソルとアイコンが変わり、クリック時の動作がわかるようになっています。リンク先のダッシュボードを開くのか、ログソースにドリルダウンするのかが示されます。この変更前は、行がクリック可能であること自体がわかりにくく、クリックすると何が起こるのかはなおさら不明でした。

**関連PR:** [#2321](https://github.com/hyperdxio/hyperdx/pull/2321) feat(app): ダッシュボードのテーブルタイルの行クリックに対するホバー時のヒントと、リンクであることがわかるネイティブな見た目