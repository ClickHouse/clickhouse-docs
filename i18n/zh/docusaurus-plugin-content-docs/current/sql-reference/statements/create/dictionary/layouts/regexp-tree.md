---
slug: /sql-reference/statements/create/dictionary/layouts/regexp-tree
title: '正则表达式树字典布局'
sidebar_label: '正则树'
sidebar_position: 12
description: '配置正则表达式树字典，以支持基于模式的查找。'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


## 概览 \{#overview\}

`regexp_tree` 字典用于基于分层正则表达式模式将键映射到值。
它针对模式匹配查找进行了优化（例如，通过匹配正则表达式模式对用户代理字符串之类的字符串进行分类），而非精确键匹配。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse 正则表达式树字典简介" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 将正则表达式树字典与 YAMLRegExpTree 源一起使用 \{#use-regular-expression-tree-dictionary-in-clickhouse-open-source\}

<CloudNotSupportedBadge />

在 ClickHouse 开源版中，正则表达式树字典是通过 [`YAMLRegExpTree`](../sources/yamlregexptree.md) 源定义的，该源需要提供一个指向包含正则表达式树的 YAML 文件的路径。

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

字典源 [`YAMLRegExpTree`](../sources/yamlregexptree.md) 表示正则表达式树的结构。例如：

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

该配置由一个正则表达式树节点列表组成。每个节点具有以下结构：

* **regexp**：该节点所使用的正则表达式。
* **attributes**：用户定义的字典属性列表。在此示例中，有两个属性：`name` 和 `version`。第一个节点定义了这两个属性，第二个节点只定义属性 `name`。属性 `version` 由第二个节点的子节点提供。
  * 属性的值可以包含**反向引用**，用于引用所匹配正则表达式中的捕获组。在示例中，第一个节点中属性 `version` 的值由一个对正则表达式中捕获组 `(\d+[\.\d]*)` 的反向引用 `\1` 组成。反向引用编号范围为 1 到 9，写作 `$1` 或 `\1`（对于编号 1）。在查询执行期间，反向引用会被匹配到的捕获组替换。
* **child nodes**：regexp 树节点的子节点列表，每个子节点都有自己的属性以及（可能还有）子节点。字符串匹配以深度优先方式进行。如果一个字符串匹配某个 regexp 节点，则字典会检查它是否也匹配该节点的子节点。如果是，则会使用匹配最深的节点的属性。子节点的属性会覆盖父节点中同名属性。YAML 文件中子节点的名称可以是任意的，例如上述示例中的 `versions`。

Regexp 树字典只允许通过 `dictGet`、`dictGetOrDefault` 和 `dictGetAll` 函数进行访问。例如：

```sql title="Query"
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

```text title="Response"
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

在这个例子中，我们首先在顶层的第二个节点上匹配正则表达式 `\d+/tclwebkit(?:\d+[\.\d]*)`。
然后字典继续查找子节点，并发现该字符串同样匹配 `3[12]/tclwebkit`。
因此，属性 `name` 的值为 `Android`（在第一层中定义），属性 `version` 的值为 `12`（在子节点中定义）。

借助精心编写的 YAML 配置文件，你可以将正则表达式树字典用作 User-Agent 字符串解析器。
ClickHouse 支持 [uap-core](https://github.com/ua-parser/uap-core)，你可以在功能测试 [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) 中了解其用法。


### 收集属性值 \{#collecting-attribute-values\}

有时，相比只返回叶子节点的值，返回所有匹配的多个正则表达式的值会更有用。在这种情况下，可以使用专门的 [`dictGetAll`](/sql-reference/functions/ext-dict-functions.md#dictGetAll) 函数。如果某个节点具有类型为 `T` 的属性值，`dictGetAll` 将返回一个包含零个或多个值的 `Array(T)`。

默认情况下，每个键返回的匹配数量没有上限。可以将一个上限作为可选的第四个参数传递给 `dictGetAll`。数组按*拓扑顺序*填充，这意味着子节点排在父节点之前，兄弟节点按源数据中的顺序排列。

示例：

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

结果：

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```


### 匹配模式 \{#matching-modes\}

可以通过某些字典相关的设置项来修改模式匹配行为：

- `regexp_dict_flag_case_insensitive`：使用不区分大小写的匹配（默认为 `false`）。可以在单个表达式中通过 `(?i)` 和 `(?-i)` 覆盖。
- `regexp_dict_flag_dotall`：允许 `.` 匹配换行符（默认为 `false`）。

## 在 ClickHouse Cloud 中使用正则表达式树字典 \{#use-regular-expression-tree-dictionary-in-clickhouse-cloud\}

[`YAMLRegExpTree`](../sources/yamlregexptree.md) 源在 ClickHouse 开源版中可用，但在 ClickHouse Cloud 中不可用。
要在 ClickHouse Cloud 中使用正则表达式树字典，首先需要在本地的 ClickHouse 开源版中从 YAML 文件创建一个正则表达式树字典，然后使用 `dictionary` 表函数和 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句将该字典导出为 CSV 文件。

SELECT * FROM dictionary(regexp&#95;dict) INTO OUTFILE(&#39;regexp&#95;dict.csv&#39;)

CSV 文件的内容如下：

1,0,&quot;Linux/(\d+[.\d]*).+tlinux&quot;,&quot;[&#39;version&#39;,&#39;name&#39;]&quot;,&quot;[&#39;\1&#39;,&#39;TencentOS&#39;]&quot;
2,0,&quot;(\d+)/tclwebkit(\d+[.\d]*)&quot;,&quot;[&#39;comment&#39;,&#39;version&#39;,&#39;name&#39;]&quot;,&quot;[&#39;test $1 and $2&#39;,&#39;$1&#39;,&#39;Android&#39;]&quot;
3,2,&quot;33/tclwebkit&quot;,&quot;[&#39;version&#39;]&quot;,&quot;[&#39;13&#39;]&quot;
4,2,&quot;3[12]/tclwebkit&quot;,&quot;[&#39;version&#39;]&quot;,&quot;[&#39;12&#39;]&quot;
5,2,&quot;3[12]/tclwebkit&quot;,&quot;[&#39;version&#39;]&quot;,&quot;[&#39;11&#39;]&quot;
6,2,&quot;3[12]/tclwebkit&quot;,&quot;[&#39;version&#39;]&quot;,&quot;[&#39;10&#39;]&quot;

导出文件的 schema 如下：

`id UInt64`：RegexpTree 节点的 id。
`parent_id UInt64`：该节点父节点的 id。
`regexp String`：正则表达式字符串。
`keys Array(String)`：用户定义属性的名称。
`values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建该字典，首先根据以下表结构创建表 `regexp_dictionary_source_table`：

CREATE TABLE regexp&#95;dictionary&#95;source&#95;table
(
id UInt64,
parent&#95;id UInt64,
regexp String,
keys   Array(String),
values Array(String)
) ENGINE=Memory;

然后按如下方式更新本地 CSV 文件：

clickhouse client 
--host MY&#95;HOST 
--secure 
--password MY&#95;PASSWORD 
--query &quot;
INSERT INTO regexp&#95;dictionary&#95;source&#95;table
SELECT * FROM input (&#39;id UInt64, parent&#95;id UInt64, regexp String, keys Array(String), values Array(String)&#39;)
FORMAT CSV&quot; &lt; regexp&#95;dict.csv

您可以参阅 [Insert Local Files](/integrations/data-ingestion/insert-local-files) 了解更多详情。在初始化源表之后，我们可以基于该源表创建一个 RegexpTree：

CREATE DICTIONARY regexp&#95;dict
(
regexp String,
name String,
version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE &#39;regexp&#95;dictionary&#95;source&#95;table&#39;))
LIFETIME(0)
LAYOUT(regexp&#95;tree);

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV 文件的内容如下：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

导出文件的 schema 如下：

* `id UInt64`：RegexpTree 节点的 id。
* `parent_id UInt64`：该节点父节点的 id。
* `regexp String`：正则表达式字符串。
* `keys Array(String)`：用户定义属性的名称。
* `values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建该字典，首先根据以下表结构创建表 `regexp_dictionary_source_table`：

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

然后按如下方式更新本地 CSV 文件：

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

您可以参阅 [Insert Local Files](/integrations/data-ingestion/insert-local-files) 了解更多详情。在初始化源表之后，我们可以基于该源表创建一个 RegexpTree：

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
