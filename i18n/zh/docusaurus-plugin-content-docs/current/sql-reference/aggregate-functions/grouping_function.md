---
slug: /sql-reference/aggregate-functions/grouping_function
---


# 分组 (GROUPING)

## GROUPING {#grouping}

[ROLLUP](../statements/select/group-by.md/#rollup-modifier) 和 [CUBE](../statements/select/group-by.md/#cube-modifier) 是对 GROUP BY 的修饰符。这两者都计算小计。ROLLUP 采用一个有序的列列表，例如 `(day, month, year)`，并在聚合的每个级别计算小计，然后计算总计。CUBE 计算指定列的所有可能组合的小计。GROUPING 用于识别由 ROLLUP 或 CUBE 返回的哪些行是超级聚合，而哪些行是未修改的 GROUP BY 将返回的行。

GROUPING 函数接受多个列作为参数，并返回一个位掩码。
- `1` 表示由 `ROLLUP` 或 `CUBE` 修饰符返回的行是小计
- `0` 表示由 `ROLLUP` 或 `CUBE` 返回的行不是小计

## 分组集 (GROUPING SETS) {#grouping-sets}

默认情况下，CUBE 修饰符计算传递给 CUBE 的所有可能组合的小计。GROUPING SETS 允许你指定要计算的特定组合。

分析层级数据是 ROLLUP、CUBE 及 GROUPING SETS 修饰符的一个好用例。这里的示例是一个包含关于在两个数据中心安装了哪些 Linux 发行版及其版本的数据表。查看按发行版、版本和位置划分的数据可能很有价值。

### 加载示例数据 {#load-sample-data}

```sql
CREATE TABLE servers ( datacenter VARCHAR(255),
                         distro VARCHAR(255) NOT NULL,
                         version VARCHAR(50) NOT NULL,
                         quantity INT
                       )
                        ORDER BY (datacenter, distro, version)
```

```sql
INSERT INTO servers(datacenter, distro, version, quantity)
VALUES ('Schenectady', 'Arch','2022.08.05',50),
       ('Westport', 'Arch','2022.08.05',40),
       ('Schenectady','Arch','2021.09.01',30),
       ('Westport', 'Arch','2021.09.01',20),
       ('Schenectady','Arch','2020.05.01',10),
       ('Westport', 'Arch','2020.05.01',5),
       ('Schenectady','RHEL','9',60),
       ('Westport','RHEL','9',70),
       ('Westport','RHEL','7',80),
       ('Schenectady','RHEL','7',80)
```

```sql
SELECT 
    *
FROM
    servers;
```
```response
┌─datacenter──┬─distro─┬─version────┬─quantity─┐
│ Schenectady │ Arch   │ 2020.05.01 │       10 │
│ Schenectady │ Arch   │ 2021.09.01 │       30 │
│ Schenectady │ Arch   │ 2022.08.05 │       50 │
│ Schenectady │ RHEL   │ 7          │       80 │
│ Schenectady │ RHEL   │ 9          │       60 │
│ Westport    │ Arch   │ 2020.05.01 │        5 │
│ Westport    │ Arch   │ 2021.09.01 │       20 │
│ Westport    │ Arch   │ 2022.08.05 │       40 │
│ Westport    │ RHEL   │ 7          │       80 │
│ Westport    │ RHEL   │ 9          │       70 │
└─────────────┴────────┴────────────┴──────────┘

10 rows in set. Elapsed: 0.409 sec.
```

### 简单查询 {#simple-queries}

按发行版获取每个数据中心中服务器的数量：
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter,
    distro;
```
```response
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘

4 rows in set. Elapsed: 0.212 sec.
```

```sql
SELECT
    datacenter, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter;
```
```response
┌─datacenter──┬─qty─┐
│ Westport    │ 215 │
│ Schenectady │ 230 │
└─────────────┴─────┘

2 rows in set. Elapsed: 0.277 sec. 
```


```sql
SELECT
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    distro;
```

```response

┌─distro─┬─qty─┐
│ Arch   │ 155 │
│ RHEL   │ 290 │
└────────┴─────┘

2 rows in set. Elapsed: 0.352 sec. 
```


```sql
SELECT
    SUM(quantity) qty
FROM
    servers;
```
```response
┌─qty─┐
│ 445 │
└─────┘

1 row in set. Elapsed: 0.244 sec. 
```

### 使用 GROUPING SETS 比较多个 GROUP BY 声明 {#comparing-multiple-group-by-statements-with-grouping-sets}

在没有 CUBE、ROLLUP 或 GROUPING SETS 的情况下对数据进行细分：
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter,
    distro
UNION ALL
SELECT
    datacenter, 
    null,
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter
UNION ALL
SELECT
    null,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    distro
UNION ALL
SELECT
    null,
    null,
    SUM(quantity) qty
FROM
    servers;
```
```response
┌─datacenter─┬─distro─┬─qty─┐
│ ᴺᵁᴸᴸ       │ ᴺᵁᴸᴸ   │ 445 │
└────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Westport    │ ᴺᵁᴸᴸ   │ 215 │
│ Schenectady │ ᴺᵁᴸᴸ   │ 230 │
└─────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│ ᴺᵁᴸᴸ       │ Arch   │ 155 │
│ ᴺᵁᴸᴸ       │ RHEL   │ 290 │
└────────────┴────────┴─────┘

9 rows in set. Elapsed: 0.527 sec. 
```

使用 GROUPING SETS 获取相同的信息：
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    GROUPING SETS(
        (datacenter,distro),
        (datacenter),
        (distro),
        ()
    )
```
```response
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Westport    │        │ 215 │
│ Schenectady │        │ 230 │
└─────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│            │        │ 445 │
└────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│            │ Arch   │ 155 │
│            │ RHEL   │ 290 │
└────────────┴────────┴─────┘

9 rows in set. Elapsed: 0.427 sec.
```

### 比较 CUBE 和 GROUPING SETS {#comparing-cube-with-grouping-sets}

下一个查询中的 CUBE，`CUBE(datacenter,distro,version)` 提供的层次结构可能没有意义。在两个发行版之间查看版本没有意义（因为 Arch 和 RHEL 没有相同的发布周期或版本命名标准）。后面的 GROUPING SETS 示例更合适，因为它将 `distro` 和 `version` 组合在同一个集合中。

```sql
SELECT
   datacenter,
   distro,
   version,
   SUM(quantity)
FROM
   servers
GROUP BY
   CUBE(datacenter,distro,version)
ORDER BY
   datacenter,
   distro;
```
```response
┌─datacenter──┬─distro─┬─version────┬─sum(quantity)─┐
│             │        │ 7          │           160 │
│             │        │ 2020.05.01 │            15 │
│             │        │ 2021.09.01 │            50 │
│             │        │ 2022.08.05 │            90 │
│             │        │ 9          │           130 │
│             │        │            │           445 │
│             │ Arch   │ 2021.09.01 │            50 │
│             │ Arch   │ 2022.08.05 │            90 │
│             │ Arch   │ 2020.05.01 │            15 │
│             │ Arch   │            │           155 │
│             │ RHEL   │ 9          │           130 │
│             │ RHEL   │ 7          │           160 │
│             │ RHEL   │            │           290 │
│ Schenectady │        │ 9          │            60 │
│ Schenectady │        │ 2021.09.01 │            30 │
│ Schenectady │        │ 7          │            80 │
│ Schenectady │        │ 2022.08.05 │            50 │
│ Schenectady │        │ 2020.05.01 │            10 │
│ Schenectady │        │            │           230 │
│ Schenectady │ Arch   │ 2022.08.05 │            50 │
│ Schenectady │ Arch   │ 2021.09.01 │            30 │
│ Schenectady │ Arch   │ 2020.05.01 │            10 │
│ Schenectady │ Arch   │            │            90 │
│ Schenectady │ RHEL   │ 7          │            80 │
│ Schenectady │ RHEL   │ 9          │            60 │
│ Schenectady │ RHEL   │            │           140 │
│ Westport    │        │ 9          │            70 │
│ Westport    │        │ 2020.05.01 │             5 │
│ Westport    │        │ 2022.08.05 │            40 │
│ Westport    │        │ 7          │            80 │
│ Westport    │        │ 2021.09.01 │            20 │
│ Westport    │        │            │           215 │
│ Westport    │ Arch   │ 2020.05.01 │             5 │
│ Westport    │ Arch   │ 2021.09.01 │            20 │
│ Westport    │ Arch   │ 2022.08.05 │            40 │
│ Westport    │ Arch   │            │            65 │
│ Westport    │ RHEL   │ 9          │            70 │
│ Westport    │ RHEL   │ 7          │            80 │
│ Westport    │ RHEL   │            │           150 │
└─────────────┴────────┴────────────┴───────────────┘

39 rows in set. Elapsed: 0.355 sec. 
```
:::note
在上面的示例中，版本在未与发行版关联时可能没有意义，如果我们跟踪内核版本，可能会有意义，因为内核版本可以与任一发行版关联。使用 GROUPING SETS，如下一个示例，可能是一个更好的选择。
:::

```sql
SELECT
    datacenter,
    distro,
    version,
    SUM(quantity)
FROM servers
GROUP BY
    GROUPING SETS (
        (datacenter, distro, version),
        (datacenter, distro))
```
```response
┌─datacenter──┬─distro─┬─version────┬─sum(quantity)─┐
│ Westport    │ RHEL   │ 9          │            70 │
│ Schenectady │ Arch   │ 2022.08.05 │            50 │
│ Schenectady │ Arch   │ 2021.09.01 │            30 │
│ Schenectady │ RHEL   │ 7          │            80 │
│ Westport    │ Arch   │ 2020.05.01 │             5 │
│ Westport    │ RHEL   │ 7          │            80 │
│ Westport    │ Arch   │ 2021.09.01 │            20 │
│ Westport    │ Arch   │ 2022.08.05 │            40 │
│ Schenectady │ RHEL   │ 9          │            60 │
│ Schenectady │ Arch   │ 2020.05.01 │            10 │
└─────────────┴────────┴────────────┴───────────────┘
┌─datacenter──┬─distro─┬─version─┬─sum(quantity)─┐
│ Schenectady │ RHEL   │         │           140 │
│ Westport    │ Arch   │         │            65 │
│ Schenectady │ Arch   │         │            90 │
│ Westport    │ RHEL   │         │           150 │
└─────────────┴────────┴─────────┴───────────────┘

14 rows in set. Elapsed: 1.036 sec. 
```
