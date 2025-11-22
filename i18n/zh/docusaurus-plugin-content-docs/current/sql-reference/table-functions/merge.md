---
description: '创建一个临时的 Merge 表。其结构将通过对底层表的列取并集并推导其公共类型来确定。'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
doc_type: 'reference'
---



# merge 表函数

创建一个临时的 [Merge](../../engines/table-engines/special/merge.md) 表。
表结构通过对其底层表的列取并集并推导公共数据类型来确定。
可用的虚拟列与 [Merge](../../engines/table-engines/special/merge.md) 表引擎相同。



## 语法 {#syntax}


```sql
merge(['db_name',] 'tables_regexp')
```

## 参数 {#arguments}

| 参数        | 描述                                                                                                                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db_name`       | 可选参数,默认值为 `currentDatabase()`,可能的取值:<br/> - 数据库名称<br/> - 返回数据库名称字符串的常量表达式,例如 `currentDatabase()`<br/> - `REGEXP(expression)`,其中 `expression` 是用于匹配数据库名称的正则表达式 |
| `tables_regexp` | 用于匹配指定数据库中表名的正则表达式                                                                                                                                                                                                 |


## 相关内容 {#related}

- [Merge](../../engines/table-engines/special/merge.md) 表引擎
