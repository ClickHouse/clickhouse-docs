---
description: 'ClickHouse に組み込まれている地理情報ベースの Dictionary'
sidebar_label: '組み込み Dictionary'
sidebar_position: 6
slug: /sql-reference/statements/create/dictionary/embedded
title: '組み込み (地理情報ベース) Dictionary'
doc_type: 'リファレンス'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse には、ジオベースを扱うための組み込み機能があります。

これにより、次のことが可能になります:

* リージョンの ID を使用して、目的の言語でその名前を取得する。
* リージョンの ID を使用して、市区町村、地域、連邦管区、国、または大陸の ID を取得する。
* あるリージョンが別のリージョンの一部かどうかを確認する。
* 親リージョンのチェーンを取得する。

すべての関数は「translocality」をサポートします。これは、リージョンの所有関係に対する複数の見方を同時に利用できる機能です。詳細については、「ウェブ解析用 Dictionary を扱うための関数」のセクションを参照してください。

内部 Dictionary はデフォルトのパッケージでは無効になっています。
有効にするには、サーバー設定ファイル内の `path_to_regions_hierarchy_file` と `path_to_regions_names_files` のパラメータのコメントアウトを解除します。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータには `regions_hierarchy.txt` ファイル (デフォルトのリージョン階層) へのパスを指定する必要があり、その他のファイル (`regions_hierarchy_ua.txt` など) も同じディレクトリ内に配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルを自分で作成することもできます。ファイル形式は以下のとおりです。

`regions_hierarchy*.txt`: ヘッダーなしの TabSeparated、カラム:

* リージョン ID (`UInt32`)
* 親リージョン ID (`UInt32`)
* リージョンタイプ (`UInt8`): 1 - 大陸, 3 - 国, 4 - 連邦管区, 5 - 地域, 6 - 市区町村; その他のタイプの値は使用されません
* 人口 (`UInt32`) — オプションのカラム

`regions_names_*.txt`: ヘッダーなしの TabSeparated、カラム:

* リージョン ID (`UInt32`)
* リージョン名 (`String`) — タブおよび改行 (エスケープされたものも含む) を含めることはできません。

RAM に保存するためにフラット配列が使用されます。このため、ID は 100 万を超えないようにする必要があります。

Dictionary はサーバーを再起動せずに更新できます。ただし、利用可能な Dictionary の集合自体は更新されません。
更新のために、ファイルの更新時刻がチェックされます。ファイルが変更されている場合、Dictionary が更新されます。
変更のチェック間隔は、`builtin_dictionaries_reload_interval` パラメータで設定します。
(初回使用時のロードを除く) Dictionary の更新はクエリをブロックしません。更新中、クエリは古いバージョンの Dictionary を使用します。更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは引き続き古いバージョンの Dictionary を使用します。

ジオベース用の Dictionary は、定期的に更新することを推奨します。更新時には新しいファイルを生成し、それらを別の場所に書き込みます。すべての準備が整ったら、サーバーが使用するファイル名にリネームします。

OS 識別子および検索エンジンを扱うための関数もありますが、これらは使用すべきではありません。
