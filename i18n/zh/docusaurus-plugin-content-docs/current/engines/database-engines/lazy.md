---
'description': 'Keeps tables in RAM only `expiration_time_in_seconds` seconds after
  last access. Can be used only with Log type tables.'
'sidebar_label': 'Lazy'
'sidebar_position': 20
'slug': '/engines/database-engines/lazy'
'title': 'Lazy'
---




# Lazy

仅在最后访问后的 `expiration_time_in_seconds` 秒内将表保留在 RAM 中。仅可用于 \*Log 表。

它针对存储许多小的 \*Log 表进行了优化，这些表之间的访问时间间隔较长。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
