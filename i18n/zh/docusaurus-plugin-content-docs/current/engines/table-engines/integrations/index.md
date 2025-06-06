---
'description': '集成的 Table Engines 文档'
'sidebar_label': 'Integrations'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/'
'title': '集成的表引擎'
---


# Table Engines for Integrations

ClickHouse 提供了多种与外部系统集成的方式，包括表引擎。与所有其他表引擎一样，配置是通过 `CREATE TABLE` 或 `ALTER TABLE` 查询完成的。从用户的角度来看，配置的集成看起来像一个普通的表，但对它的查询会被代理到外部系统。这样的透明查询是此方法相较于替代集成方法（如字典或表函数）的主要优点之一，因为后者在每次使用时都需要自定义查询方法。

<!-- The table of contents table for this page is automatically generated by 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
from the YAML front matter fields: slug, description, title.

If you've spotted an error, please edit the YML frontmatter of the pages themselves.
-->
