---
slug: /use-cases/observability/clickstack/demo-days/2026/04/03-04-2026
title: 'デモデー - 03/04/2026'
sidebar_label: '03/04/2026'
pagination_prev: null
pagination_next: null
description: 'ClickStack デモデー - 03/04/2026'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデー']
---

## 新しいダッシュボードと保存済み検索の一覧ページ \{#new-dashboard-and-saved-search-listing-pages\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/dQCkNZElwcg" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボードと保存済み検索はサイドバーから切り離され、それぞれ専用の一覧ページに移されました。チーム内でダッシュボードの数が増えてくると、従来のサイドバー方式はすぐに扱いづらくなっていました。新しいページでは、タグごとに整理されたカードビューですべてを表示でき、名前検索とタグフィルタリングも組み込まれています。より情報量の多い表示を好む場合は、リストビューも利用できます。

お気に入り機能も追加されています。ダッシュボードまたは保存済み検索にスターを付けると、一覧ページの先頭に固定表示され、すばやくアクセスできるようサイドバーにも再び表示されます。従来に近い使い勝手を保ちつつ、他のユーザーのナビゲーションを圧迫しません。一覧ページではさらに、各カードにアラート状態アイコンと「作成者 / 更新者」のメタデータも表示されるため、誰が何を管理しているのか、また何かが発報中かどうかを一目で確認できます。

さらに、新しいテンプレートギャラリーも追加されました。Node.js、Python、Go、Java の OTel ランタイムメトリクスに対応した 4 つの事前構築済みダッシュボードを、数クリックでインポートできます。インポート時にタグと対象のメトリクスソースを編集できるため、既存のタグ構成にそのまま組み込めます。

**関連 PR:** [#1971](https://github.com/hyperdxio/hyperdx/pull/1971) ダッシュボード一覧ページを追加, [#2012](https://github.com/hyperdxio/hyperdx/pull/2012) 保存済み検索一覧ページを追加, [#2021](https://github.com/hyperdxio/hyperdx/pull/2021) ダッシュボードと保存済み検索のお気に入り機能を追加, [#2033](https://github.com/hyperdxio/hyperdx/pull/2033) タグごとにダッシュボードと検索をグループ化, [#2031](https://github.com/hyperdxio/hyperdx/pull/2031) 作成・更新メタデータを表示, [#2053](https://github.com/hyperdxio/hyperdx/pull/2053) ダッシュボード一覧ページにアラートアイコンを追加, [#2010](https://github.com/hyperdxio/hyperdx/pull/2010) ダッシュボードテンプレートギャラリーを追加

## フィルターのためのフィルター \{#filters-for-filters\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Tfe9kJygoEg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボード変数のフィルターで、それ自体にフィルター条件を設定できるようになりました。ユースケースはシンプルです。たとえば、Node.js のダッシュボードに &quot;service name&quot; のドロップダウンがある場合、そのドロップダウンには環境内のすべてのサービスではなく、Node.js サービスだけを表示したいはずです。表示内容を限定するためのフィルター条件を、ダッシュボード変数に直接設定できるようになりました。

フィルターセレクターも複数選択に対応するよう更新されました。サービス単位でグループ化するダッシュボードでは、ドロップダウンから複数の値を一度に選択できるため、比較がずっとしやすくなります。

**関連PR:** [#1969](https://github.com/hyperdxio/hyperdx/pull/1969) ダッシュボードフィルターに条件を追加; フィルターの複数選択をサポート

## 定義済みダッシュボードの RBAC \{#rbac-for-predefined-dashboards\}

*[@pulpdrew](https://github.com/pulpdrew) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/AZ94-quHEuw" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

RBAC が ClickStack のプリセットダッシュボードにも適用されるようになりました。以前は、これらの組み込みダッシュボードでは RBAC がまったく考慮されておらず、割り当てられたロールに関係なく、どのユーザーでもアクセスできました。これでその問題は解消されました。

きめ細かな Read 権限は、想定どおりに機能します。特定のサービスへの読み取り専用アクセスを持つよう設定されたロールでは、ユーザーがそのサービスに関連するプリセットダッシュボードのみを表示できるようになります。そのロールのユーザーはダッシュボードとそのフィルターを閲覧できますが、フィルターのコントロールは編集できないようロックされます。このデモでは、特定の名前付きサービスを対象に `services` の Read 権限を設定したカスタムロールと、そのロールでログインしたユーザーに、アクセス可能なダッシュボードとフィルターの状態だけが表示される様子を示しています。

## 検索の最適化 \{#optimizations-for-searching\}

*[@knudtty](https://github.com/knudtty) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/uVD2FKzoHjM" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickHouse の「Read in Order」最適化は、ORDER BY がテーブルの主キーと一致している場合にデータを順次読み込み、LIMIT に達した時点で停止することで、検索クエリを高速化します。ベンチマークの結果、この最適化を有効にしていても、大規模なデータセットでは検索時に依然として必要以上のデータを読み込んでいることが分かりました。原因は、走査対象となるパーツ数にあります。最適化が有効でも、テーブルが十分に大きいとパーツ数も多くなり、ClickHouse は必要以上のデータを読み込んでしまいます。

修正内容は、検索クエリ用の時間ウィンドウ付きクエリ配列の先頭に 1 分間の時間ウィンドウを追加するというものです。ほとんどの検索では、必要なデータは直近 1 分間に含まれているため、まずこのウィンドウを検索することで、ほぼ即座に結果を返せます。そこで何も見つからなければ、従来どおり段階的により広いウィンドウへフォールバックします。これとは別に、タイムスタンプのカラムで認識されない `toDateTime(Timestamp)` 式が使われていたため、`otel_traces` schema では ORDER BY 最適化が正しく適用されていませんでした。これも修正されています。

**関連 PR:** [#2019](https://github.com/hyperdxio/hyperdx/pull/2019) 検索に 1 分間のウィンドウを使用, [#2014](https://github.com/hyperdxio/hyperdx/pull/2014) otel&#95;traces の ORDER BY 最適化の問題を修正

## 行のコピーと設定可能なフィルター数 \{#copy-row-and-configurable-filter-sizes\}

*[@knudtty](https://github.com/knudtty) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e_IIKG3f6SE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

行ビューアーで、JSONとしてコピーするボタンを利用できるようになり、ログの行全体をワンクリックでコピーできます。このボタンはサイドバーの全体表示にも表示されます。行を LLM のプロンプトに貼り付けて、このログがコードのどこで出力されているかを確認したり、すべてのテキストを手動で選択しなくても、インシデントレポート用に完全なイベントを取得したりするのに便利です。

サイドバーで取得するフィルターキーの数は、Query Settings 配下のチーム設定として構成できるようになりました。従来の固定上限では、大規模なデータセットでは利用可能なフィルター属性の一部しか表示されませんでした。これにより、チームは上限を引き上げて、より多くのリソース属性やログ属性を表示できるようになります。今回の変更には、多数のフィルターグループが表示される場合でもフィルターパネルのレンダリングを高速に保つための仮想化の改善も含まれています。

**関連PR:** [#2035](https://github.com/hyperdxio/hyperdx/pull/2035) 行をJSONとしてコピーするボタンを追加, [#2020](https://github.com/hyperdxio/hyperdx/pull/2020) 取得するフィルター数の新しいチーム設定, [#1979](https://github.com/hyperdxio/hyperdx/pull/1979) ネストされたフィルターグループの仮想化

## ダッシュボードのタブとグループ \{#tabs-and-groups-in-dashboards\}

*デモ: [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/tyumDlJuDTg" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ダッシュボードのタイルをグループに整理できるようになりました。これにより、従来の 2 種類のコンテナ (「sections」と「groups」) を使い分けるモデルが置き換えられます。従来は、ユーザーがどのコンテナタイプを使うかを最初に決める必要がありました。新しい単一の グループ という考え方により、構成がよりシンプルになります。グループ はデフォルトで折りたたみ可能で、必要に応じて枠線を表示でき、タブを追加することもできます。各タブはそれぞれ独自のタイルセットを持ち、タイルはドラッグハンドルを使ってグループ間で移動できます。

このデモでは、いくつかのカスタマイズオプションを切り替えたグループを紹介しています。具体的には、折りたたみのオン/オフ、枠線の表示/非表示、タブの有効/無効です。デモ時点では、この PR はまだレビュー中で、デザインに関するフィードバックが集められていました。これが反映されれば、従来の 2 種類のコンテナモデルと比べて、ダッシュボード作成者にとってより柔軟で分かりやすい構成要素になるはずです。

**関連 PR:** [#1972](https://github.com/hyperdxio/hyperdx/pull/1972) タブおよび折りたたみ/枠線オプションを備えたダッシュボードグループ、[#2015](https://github.com/hyperdxio/hyperdx/pull/2015) section/group を単一の グループ に統合

## ClickStack CLI \{#clickstack-cli\}

*[@wrn14897](https://github.com/wrn14897) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/9XqJNhstabw" title="YouTube ビデオ プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack CLI (`hdx`) は、ターミナルを離れることなくログやトレースの検索、tail、調査を行える、新しいターミナル TUI です。ブラウザーと同じ Web セッションの仕組みを使って HyperDX インスタンスに接続するため、別途管理する API キーは必要ありません。インスタンス URL とメールアドレスを指定して一度 `hdx auth login` を実行すれば、その後も認証状態が維持されます。

この TUI の画面は、Web アプリと同じ検索インターフェイスです。クエリ構文、ソースの選択、個々のログエントリを詳細に調べる操作まで共通しています。特に注目すべき点の 1 つがトレースのウォーターフォール表示で、ログエントリを開くと、完全な分散トレースがターミナル内に直接レンダリングされます。このデモでは、agentic な利用に関する初期段階の実験も紹介しています。AI エージェントに CLI の schema イントロスペクション出力へのアクセスと、ClickHouse プロキシ経由でクエリを実行する機能を与えることで、問題を自律的に調査できるようになります。さらにデモでは、エージェントが Web セッションを使って Playwright 経由で HyperDX UI を操作し、描画されたチャートから Metrics を取得して、ログで見つかった内容と照合する様子も示されています。

**関連 PR:** [#2043](https://github.com/hyperdxio/hyperdx/pull/2043) @hyperdx/cli パッケージを追加 — イベントの検索と tail を行うためのターミナル TUI