# Loading full Stack Overflow

Commands for full dataset. Warning this dataset is considerable for Postgres and requires around 200GB of space.

```sql
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
 schemaname |    tablename    | total_size_bytes | total_size_gb |
------------+-----------------+------------------+---------------+
 public     | users           |       4288405504 |             3 |
 public     | posts           |      68606214144 |            63 |
 public     | votes           |      20525654016 |            19 |
 public     | comments        |      22888538112 |            21 |
 public     | posthistory     |     125899735040 |           117 |
 public     | postlinks       |        579387392 |             0 |
 public     | badges          |       4989747200 |             4 |
(7 rows)
```

## users

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/users.sql.gz
gzip -d users.sql.gz
psql < users.sql
```

## posts

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql
```

## posthistory

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql
```

## comments

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql
```

## votes

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql
```

## badges

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql
```

## postlinks

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```
