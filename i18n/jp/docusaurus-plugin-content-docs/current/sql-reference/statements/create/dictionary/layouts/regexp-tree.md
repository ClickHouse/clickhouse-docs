---
slug: /sql-reference/statements/create/dictionary/layouts/regexp-tree
title: '正規表現ツリー Dictionary レイアウト'
sidebar_label: 'Regexp Tree'
sidebar_position: 12
description: 'パターンベースのルックアップ用の正規表現ツリー Dictionary レイアウトを構成します。'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


## 概要 \{#overview\}

`regexp_tree` Dictionary を使用すると、階層的な正規表現パターンに基づいてキーを値にマッピングできます。
これは、キーの完全一致ではなく、（たとえば、正規表現パターンにマッチさせてユーザーエージェント文字列のような文字列を分類するなど）パターンマッチによる検索に最適化されています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse の regex tree Dictionary 入門" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## `YAMLRegExpTree` ソースを使用した正規表現ツリー Dictionary の利用 \{#use-regular-expression-tree-dictionary-in-clickhouse-open-source\}

<CloudNotSupportedBadge />

正規表現ツリー Dictionary は、正規表現ツリーを含む YAML ファイルへのパスを指定する [`YAMLRegExpTree`](../sources/yamlregexptree.md) ソースを使用して、ClickHouse オープンソース版で定義されます。

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
...
```

Dictionary のデータソースである [`YAMLRegExpTree`](../sources/yamlregexptree.md) は、正規表現ツリーの構造を表します。例えば次のようになります：

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

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは次の構造を持ちます。

* **regexp**: ノードの正規表現。
* **attributes**: ユーザー定義の Dictionary 属性のリスト。この例では、`name` と `version` の 2 つの属性があります。最初のノードは両方の属性を定義します。2 番目のノードは属性 `name` のみを定義します。属性 `version` は 2 番目のノードの子ノードによって提供されます。
  * 属性の値には、マッチした正規表現のキャプチャグループを参照する **後方参照 (back reference)** を含めることができます。この例では、最初のノードにおける属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` への後方参照 `\1` で構成されています。後方参照番号は 1 から 9 までで、`$1` または `\1`（1 の場合）のように記述します。後方参照は、クエリ実行中にマッチしたキャプチャグループで置き換えられます。
* **child nodes**: regexp ツリーノードの子ノードのリストであり、それぞれが独自の attributes と（場合によっては）さらに子ノードを持ちます。文字列マッチングは深さ優先で行われます。ある文字列が regexp ノードにマッチした場合、Dictionary はその文字列がそのノードの子ノードにもマッチするかを確認します。マッチする場合、最も深い位置でマッチしたノードの attributes が割り当てられます。子ノードの属性は、親ノードと同名の属性を上書きします。YAML ファイルにおける子ノードの名前は任意であり、上記の例では `versions` などとできます。

Regexp ツリー Dictionary は、`dictGet`、`dictGetOrDefault`、`dictGetAll` 関数によるアクセスのみが可能です。例:

```sql title="Query"
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

```text title="Response"
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

この場合、まず最上位レイヤーの 2 番目のノードで、正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` にマッチします。
その後、Dictionary は子ノードの探索を続け、その文字列が `3[12]/tclwebkit` にもマッチすることを見つけます。
その結果、属性 `name` の値は（第 1 レイヤーで定義されている）`Android` となり、属性 `version` の値は（子ノードで定義されている）`12` となります。

適切に作り込まれた YAML 設定ファイルを用いることで、正規表現ツリー Dictionary をユーザーエージェント文字列パーサーとして利用できます。
ClickHouse は [uap-core](https://github.com/ua-parser/uap-core) をサポートしており、機能テスト [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) でその使用方法を確認できます。


### 属性値の収集 \{#collecting-attribute-values\}

複数の正規表現にマッチした場合、葉ノードの値だけでなく、マッチしたそれぞれから値を返したいことがあります。そのようなケースでは、専用の [`dictGetAll`](../../../functions/ext-dict-functions.md#dictGetAll) 関数を使用できます。あるノードが型 `T` の属性値を持つ場合、`dictGetAll` は 0 個以上の値を含む `Array(T)` を返します。

デフォルトでは、1 キーあたりで返されるマッチ数には上限がありません。上限は省略可能な第 4 引数として `dictGetAll` に渡すことができます。配列は *トポロジカル順序* で格納されます。これは、子ノードが親ノードより前に来て、兄弟ノードはソース内の順序に従うことを意味します。

例:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

結果:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```


### マッチングモード \{#matching-modes\}

パターンマッチングの挙動は、特定の Dictionary 設定によって変更できます。

- `regexp_dict_flag_case_insensitive`: 大文字・小文字を区別しないマッチングを使用します（デフォルトは `false`）。個々の式では `(?i)` および `(?-i)` で上書きできます。
- `regexp_dict_flag_dotall`: 「.」が改行文字にもマッチするようにします（デフォルトは `false`）。

## ClickHouse Cloud で正規表現ツリー Dictionary を使用する \{#use-regular-expression-tree-dictionary-in-clickhouse-cloud\}

[`YAMLRegExpTree`](../sources/yamlregexptree.md) ソースは ClickHouse Open Source では動作しますが、ClickHouse Cloud では動作しません。
ClickHouse Cloud で regexp ツリー Dictionary を使用するには、まずローカルの ClickHouse Open Source 環境で YAML ファイルから regexp ツリー Dictionary を作成し、その後 `dictionary` テーブル関数と [INTO OUTFILE](../../select/into-outfile.md) 句を使用して、この Dictionary を CSV ファイルにエクスポートします。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV ファイルの内容は次のとおりです:

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプされたファイルのスキーマは次のとおりです。

* `id UInt64`: RegexpTree ノードの id。
* `parent_id UInt64`: ノードの親の id。
* `regexp String`: 正規表現文字列。
* `keys Array(String)`: ユーザー定義属性の名前。
* `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloud で Dictionary を作成するには、まず以下のテーブル構造で `regexp_dictionary_source_table` テーブルを作成します。

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

次に、ローカルの CSV ファイルを次のように更新します

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

詳細については、[Insert Local Files](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルを初期化した後、そのテーブルをソースとして RegexpTree を作成できます。

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
