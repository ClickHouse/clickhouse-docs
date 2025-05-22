---
'description': '仅在上次访问后 `expiration_time_in_seconds` 秒内将表保留在 RAM 中。只能与 Log 类型表一起使用。'
'sidebar_label': '懒惰'
'sidebar_position': 20
'slug': '/engines/database-engines/lazy'
'title': '懒惰'
---


# Lazy

在最后一次访问后，保持表只在 RAM 中存在 `expiration_time_in_seconds` 秒。仅可与 \*Log 表一起使用。

它被优化用于存储许多较小的 \*Log 表，这些表之间的访问时间间隔较长。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
