---
slug: /sql-reference/statements/create/dictionary/sources/yamlregexptree
title: 'YAMLRegExpTree Dictionary ソース'
sidebar_position: 15
sidebar_label: 'YAMLRegExpTree'
description: 'YAML ファイルを正規表現ツリー Dictionary のソースとして使用するよう設定します。'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

`YAMLRegExpTree` ソースは、ローカルファイルシステム上の YAML ファイルから正規表現ツリーを読み込みます。
これは [`regexp_tree`](../layouts/regexp-tree.md) Dictionary レイアウト専用に設計されており、
ユーザーエージェントの解析などのパターンベースの検索向けに、階層的な正規表現から属性へのマッピングを提供します。

:::note
`YAMLRegExpTree` ソースは ClickHouse のオープンソース版でのみ利用可能です。
ClickHouse Cloud では、Dictionary を CSV にエクスポートし、代わりに [ClickHouse table source](./clickhouse.md) 経由でロードしてください。
詳細は、[ClickHouse Cloud で regexp&#95;tree Dictionary を使用する](../layouts/regexp-tree#use-regular-expression-tree-dictionary-in-clickhouse-cloud) を参照してください。
:::


## 設定 \{#configuration\}

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0);
```

設定項目:

| Setting | 説明                                                                               |
| ------- | -------------------------------------------------------------------------------- |
| `PATH`  | 正規表現ツリーを含む YAML ファイルへの絶対パス。DDL で作成する場合、ファイルは `user_files` ディレクトリ内に存在している必要があります。 |


## YAML ファイル構造 \{#yaml-file-structure\}

YAML ファイルには、正規表現ツリーのノードのリストが含まれます。各ノードは属性および子ノードを持つことができ、階層構造を形成します。

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

各ノードは次の構造を持ちます：

* **`regexp`**: このノード用の正規表現。
* **attributes**: ユーザー定義の Dictionary 属性（例: `name`、`version`）。属性値には、正規表現のキャプチャグループへの **後方参照** を含めることができ、`\1` や `$1` のように記述します（1〜9 の数字）。これらはクエリ実行時に、一致したキャプチャグループで置き換えられます。
* **child nodes**: 子ノードのリストで、それぞれが独自の属性を持ち、さらに子ノードを持つ場合もあります。子ノードリストの名前は任意です（例: 上記の `versions`）。文字列マッチングは深さ優先で行われます。ある文字列があるノードにマッチした場合、その子ノードもチェックされます。最も深い階層でマッチしたノードの属性が優先され、同名の親属性を上書きします。


## 関連ページ \{#related-pages\}

- [regexp_tree Dictionary のレイアウト](../layouts/regexp-tree.md) — レイアウト設定、クエリ例、マッチングモード
- [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictGetAll](/sql-reference/functions/ext-dict-functions#dictGetAll) — regexp tree Dictionary に対してクエリを実行するための関数