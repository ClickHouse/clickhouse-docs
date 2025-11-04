---
'description': '在最后访问后只将表保留在RAM中`expiration_time_in_seconds`秒。只能与Log类型表一起使用。'
'sidebar_label': '懒惰'
'sidebar_position': 20
'slug': '/engines/database-engines/lazy'
'title': '懒惰'
'doc_type': 'reference'
---


# 懒惰

在上次访问后，仅在 RAM 中保留表 `expiration_time_in_seconds` 秒。只能与 \*Log 表一起使用。

它是为存储许多小型 \*Log 表而优化的，这些表之间的访问时间间隔较长。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
