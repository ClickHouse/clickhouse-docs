
# Lazy

仅在上次访问后 `expiration_time_in_seconds` 秒内将表保留在 RAM 中。仅可以与 \*Log 表一起使用。

它针对存储许多小型 \*Log 表进行了优化，这些表在访问之间的时间间隔很长。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
