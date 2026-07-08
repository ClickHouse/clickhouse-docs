---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-15
title: 'デモデイズ - 2026-05-15'
sidebar_label: '2026-05-15'
sidebar_position: -20260515
pagination_prev: null
pagination_next: null
description: '2026-05-15 の ClickStack デモデイズ'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデイズ']
---

## ノートブックからのアラート \{#alerts-from-notebooks\}

*デモ: [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/HIxCMDmdZ8o" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ノートブックからアラートを作成できるようになりました。これまでその場で ダッシュボード を構築していたのと同じノートブックのフローで、アラートの設定も自動的に行われます。つまり、ノートブックを離れることなく、「これは興味深いクエリだ」から「これが発火したら通知してくれ」まで進めます。

1 つ注意点があります。チームにはあらかじめ定義された webhook がいくつもありますが、現時点ではノートブックは追加の質問をしないため、ユーザーに選ばせるのではなく、最も適切そうな webhook を自動的に選択します。ノートブックがコンテキスト不足のときに追加の質問をできるようにする PR はすでに進行中なので、このギャップはまもなく解消されるはずです。

## materialized viewからのオートコンプリート \{#autocomplete-from-materialized-views\}

*[@knudtty](https://github.com/knudtty) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iQf5EwktBW4" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

少し前に、検索バーでの属性オートコンプリートを支えるために materialized view を追加しました。これにより、値をその場で計算するのではなく、即座に表示できるようになりました。現在は同じ MV をサイドフィルターにも使っているため、負荷の高いインスタンスでもフィルターの読み込みが大幅に高速化されています。

一点、注意しておきたい挙動の変更があります。MV ベースのフィルターは、現在のクエリに絞り込んだ値ではなく、現在の時間範囲内で取り得るすべてのフィルター値を返します。検索スコープのフィルターに戻すためのトグルも用意されており、こちらでは現在の結果に対して低速な集計を実行します。デフォルトの `filterValueExpandedKeyLimit` も引き上げられており、MV なしでは 20 キー、MV ありでは 100 キーです。必要に応じて任意の値まで設定でき、1000 でもテスト済みです。

この MV は維持コストも比較的低く、ステージング環境のインスタンスで大量のデータに対して動かしていますが、問題なく動作しています。同じ MV が属性オートコンプリートと map カラムの展開にも使われているため、一度設定すれば複数の箇所で高速化の恩恵を受けられます。デモでは、検索スコープと全フィルターを切り替えるトグルを設定内に置くのではなく、フィルターパネル上部の主要なピル型スイッチとして前面に出すべきではないか、という議論もありました。これについては今後の対応として検討しています。

**関連 PR:** [#2272](https://github.com/hyperdxio/hyperdx/pull/2272) feat: フィルターはデフォルトで検索条件を考慮しない; MV により高速化

## テーブルのカラム順と系列ごとのフォーマット \{#table-column-ordering-and-per-series-formatting\}

*デモ: [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iEn8kzvERE8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

関連するテーブルの改善がいくつかまとめて導入されました。group-by カラムを常に右側に表示するのではなく、テーブルの左側に固定できるようになりました。これは、サービス名を縦に追って確認することが多い RED スタイルのダッシュボードでは、通常はこちらの方が望ましい動作です。この挙動は、テーブルごとの表示設定で制御できます。

系列ごとの数値フォーマットにも対応しました。従来は、テーブル全体に 1 つの数値フォーマットが適用されていたため、テーブル内にミリ秒フォーマットの系列が 1 つでもあると、Requests カラムまで `123ms` のように表示されていました。今後は、カラムごとまたは系列ごとにフォーマットを設定できるため、リクエスト数は通常の数値のままにしつつ、latency カラムは継続時間としてフォーマットできます。

さらに、フォーマット推論も系列単位で行われるようになりました。Trace Duration フィールドを集計した場合は、その特定の系列だけがミリ秒として推論され、1 つのカラムが継続時間だからといってテーブル全体がミリ秒フォーマットに引きずられることはありません。

**関連 PR:** [#2149](https://github.com/hyperdxio/hyperdx/pull/2149) feat: テーブル左側に group-by カラムを表示できるようにする, [#2174](https://github.com/hyperdxio/hyperdx/pull/2174) feat: 系列ごとの数値フォーマットを追加

## カスタマイズ可能なダッシュボードリンク \{#customizable-dashboard-linking\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Stlz02xES40" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボードのテーブルで、行クリック時に別のダッシュボード (または検索) へリンクできるようになりました。リンク先と引き継ぐフィルターの両方に対して、設定可能なテンプレートを使用できます。テーブルタイルの設定には、新しい「row click action」オプションがあります。「ダッシュボード」を選択し、リンク先のダッシュボードを指定してから、現在の行のフィルターを対象ダッシュボードのフィルターにマッピングします。フィルター値には Handlebars 形式のテンプレートを使用するため、クリックした行の任意のカラム値をリンク先フィルターや WHERE 句 (SQL または Lucene) に取り込めます。デモの例ではサービス一覧をこの機能に接続しており、行をクリックすると、あらかじめ `service.name` で絞り込まれたサービス詳細ダッシュボードに移動します。

特定のリンク先ダッシュボードを選ぶ代わりに、ダッシュボード名自体をテンプレート化することもできます。たとえば、`${service.name} dashboard` のような名前のサービスごとのダッシュボードがある場合、リンク先はクリックした行に一致するものに動的に解決されます。テンプレート化されたダッシュボードが存在しない場合のエラー処理も用意されており、壊れたページに遷移する代わりに通知が表示されます。

複数の変数に対応しており、クリックした行のカラムを任意に組み合わせて、フィルターセットまたはテンプレート化されたダッシュボード名に渡せます。Handlebars には動的ヘルパーや条件ブロックがありますが、現時点では対象範囲を小さく保ち、挙動を予測しやすくするため、それらの大半は無効化されています。インポートフローも更新されており、ID で別のダッシュボードにリンクするダッシュボードでは、インポート時にそれらの参照をリンク先アカウント内に存在するダッシュボードへ再マッピングできるようになりました。

**関連PR:** [#2146](https://github.com/hyperdxio/hyperdx/pull/2146) feat: カスタムダッシュボードの on-click にフィルターテンプレート機能を追加, [#2148](https://github.com/hyperdxio/hyperdx/pull/2148) feat: ダッシュボード onClicks のインポート/エクスポートに対応, [#2156](https://github.com/hyperdxio/hyperdx/pull/2156) feat: 外部ダッシュボード API にカスタム onClick フィールドを追加, [#2273](https://github.com/hyperdxio/hyperdx/pull/2273) feat: ダッシュボードテーブルの onClick を MCP スキーマとプロンプトに追加