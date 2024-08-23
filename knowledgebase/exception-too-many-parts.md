---
date: 2023-03-20
---

# DB::Exception: Too many parts (600). Merges are processing significantly slower than inserts

You reached the `parts_to_throw_insert` setting on a MergeTree table. You can monitor the number of active parts for a given table with:

```sql
select count(*) from system.parts where table = '<table_name>' and active == 1
```

The main requirement about inserting into Clickhouse: you should never send too many `INSERT` statements per second. Ideally - one insert per second / per few seconds.

So you can insert 100K rows per second but only with one big bulk `INSERT` statement. When you send hundreds / thousands insert statements per second to *MergeTree table you will always get some errors, and it can not be changed by adjusting some settings.

If you can't combine lot of inserts into one big bulk insert statement outside - then you should create Buffer table before *MergeTree table.

1. Each insert create a folder in  `/var/lib/clickhouse/.../table_name/`. Inside that folder there are 2 files per each column - one with data (compressed), second with index. Data is physically sorted by primary key inside those files. Those folders are called '**parts**'.

2. ClickHouse merges those smaller parts to bigger parts in the background. It chooses parts to merge according to some rules. After merging two (or more) parts one bigger part is being created and old parts are queued to be removed. The settings you list allow finetuning the rules of merging parts. The goal of merging process - is to leave one big part for each partition (or few big parts per partition which are not worth to merge because they are too big). Please check also that [comment](https://github.com/yandex/ClickHouse/issues/1661#issuecomment-352739726).

3. If you create new parts too fast (for example by doing lot of small inserts) and ClickHouse is not able to merge them with proper speed (so new parts come faster than ClickHouse can merge them) - then you get the exception 'Merges are processing significantly slower than inserts'. You can try to increase the limit but you can get the situation then you get filesystem problems caused by the too big number of files / directories (like inodes limit).

4. If you insert to lot of partitions at once the problem is multiplied by the number of partitions affected by insert.

5. You can try to adjust the behaviour of clickhouse with one of the listed settings, or with max_insert_block_size / max_block_size  / insert_format_max_block_size / max_client_network_bandwidth.  But: the better solution is just to insert data in expected tempo. The expected tempo is: **one insert per 1-2 sec, each insert containing 10K-500K rows of data**.

6. So proper solution to solve "Merges are processing significantly slower than inserts"  is to adjust the number of inserts per second and number of rows in each insert. Use batch insert to combine small inserts into one bigger if data comes row-by-row. Throttle huge inserts if you have too much data to insert at once. Don't change clickhouse internals, unless you really understand well what does they it mean.

7. If your data comes faster than 500K rows per second - most probably you need more servers in the cluster to serve that traffic, not the adjustment of settings.

8. The speed of background merges usually depends on storage speed, used compression settings, the MergeTree option (the merge algorithm - plain merge/aggregating/summing/collapsing, etc.), and the used sorting key.
