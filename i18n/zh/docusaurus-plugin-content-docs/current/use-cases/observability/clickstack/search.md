---
'slug': '/use-cases/observability/clickstack/search'
'title': '使用 ClickStack 搜索'
'sidebar_label': '搜索'
'pagination_prev': null
'pagination_next': null
'description': '使用 ClickStack 搜索'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';

ClickStack 允许您对事件（日志和追踪）进行全文搜索。您只需输入与您的事件匹配的关键字即可开始搜索。例如，如果您的日志包含“Error”，您只需在搜索栏中输入“Error”即可找到它。

相同的搜索语法也用于通过仪表板和图表过滤事件。

## 自然语言搜索语法 {#natural-language-syntax}

- 搜索不区分大小写
- 默认情况下，搜索按完整单词匹配（例如，`Error` 会匹配 `Error here`，但不会匹配 `Errors here`）。您可以使用通配符包围一个单词以匹配部分单词（例如，`*Error*` 会匹配 `AnyError` 和 `AnyErrors`）
- 搜索词的顺序可以任意（例如，`Hello World` 会匹配包含 `Hello World` 和 `World Hello` 的日志）
- 您可以使用 `NOT` 或 `-` 排除关键字（例如，`Error NOT Exception` 或 `Error -Exception`）
- 您可以使用 `AND` 和 `OR` 来组合多个关键字（例如，`Error OR Exception`）
- 精确匹配可以通过双引号完成（例如，`"Error tests not found"`）

<Image img={hyperdx_27} alt="Search" size="md"/>

### 列/属性搜索 {#column-search}

- 您可以通过使用 `column:value` 搜索列和 JSON/map 属性（例如，`level:Error`，`service:app`）
- 您可以使用比较运算符 (`>`，`<`，`>=`，`<=`) 搜索值范围（例如，`Duration:>1000`）
- 您可以通过使用 `property:*` 搜索属性的存在（例如，`duration:*`）

## 时间输入 {#time-input}

- 时间输入接受自然语言输入（例如，`1 hour ago`，`yesterday`，`last week`）
- 指定单个时间点将导致从该时间点到现在的搜索。
- 时间范围总是会在搜索时转换为解析后的时间范围，以便于调试时间查询。
- 您也可以突出显示直方图条以缩放到特定时间范围。

## SQL 搜索语法 {#sql-syntax}

您可以选择切换搜索输入到 SQL 模式。这将接受任何有效的 SQL WHERE 子句进行搜索。这对于无法用 Lucene 语法表达的复杂查询非常有用。

## 选择语句 {#select-statement}

要指定在搜索结果中显示的列，您可以使用 `SELECT` 输入。这是搜索页面中要选择的列的 SQL SELECT 表达式。目前不支持别名（例如，您不能使用 `column as "alias"`）。
