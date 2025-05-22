import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## 数据集 {#dataset}

这个由 Foursquare 提供的数据集可以在 [下载](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)
并在 Apache 2.0 许可下免费使用。

它包含超过 1 亿条商业兴趣点（POI）记录，如商店、餐厅、公园、游乐场和纪念碑。它还包括
有关这些地方的附加元数据，如类别和社交媒体
信息。

## 数据探索 {#data-exploration}

为了探索数据，我们将使用 [`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)，这是一个小型命令行工具， 
它提供了完整的 ClickHouse 引擎，尽管您也可以使用 
ClickHouse Cloud、`clickhouse-client` 或者 `chDB`。

运行以下查询以选择存储数据的 s3 存储桶中的数据：

```sql title="Query"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*') LIMIT 1
```

```response title="Response"
Row 1:
──────
fsq_place_id:        4e1ef76cae60cd553dec233f
name:                @VirginAmerica In-flight Via @Gogo
latitude:            37.62120111687914
longitude:           -122.39003793803701
address:             ᴺᵁᴸᴸ
locality:            ᴺᵁᴸᴸ
region:              ᴺᵁᴸᴸ
postcode:            ᴺᵁᴸᴸ
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             US
date_created:        2011-07-14
date_refreshed:      2018-07-05
date_closed:         2018-07-05
tel:                 ᴺᵁᴸᴸ
website:             ᴺᵁᴸᴸ
email:               ᴺᵁᴸᴸ
facebook_id:         ᴺᵁᴸᴸ
instagram:           ᴺᵁᴸᴸ
twitter:             ᴺᵁᴸᴸ
fsq_category_ids:    ['4bf58dd8d48988d1f7931735']
fsq_category_labels: ['Travel and Transportation > Transport Hub > Airport > Plane']
placemaker_url:      https://foursquare.com/placemakers/review-place/4e1ef76cae60cd553dec233f
geom:                �^��a�^@Bσ���
bbox:                (-122.39003793803701,37.62120111687914,-122.39003793803701,37.62120111687914)
```

我们看到有不少字段是 `ᴺᵁᴸᴸ`，因此我们可以在查询中添加一些额外条件
以获得更有用的数据：

```sql title="Query"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
   WHERE address IS NOT NULL AND postcode IS NOT NULL AND instagram IS NOT NULL LIMIT 1
```

```response
Row 1:
──────
fsq_place_id:        59b2c754b54618784f259654
name:                Villa 722
latitude:            ᴺᵁᴸᴸ
longitude:           ᴺᵁᴸᴸ
address:             Gijzenveldstraat 75
locality:            Zutendaal
region:              Limburg
postcode:            3690
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             ᴺᵁᴸᴸ
date_created:        2017-09-08
date_refreshed:      2020-01-25
date_closed:         ᴺᵁᴸᴸ
tel:                 ᴺᵁᴸᴸ
website:             https://www.landal.be
email:               ᴺᵁᴸᴸ
facebook_id:         522698844570949 -- 522.70 trillion
instagram:           landalmooizutendaal
twitter:             landalzdl
fsq_category_ids:    ['56aa371be4b08b9a8d5734e1']
fsq_category_labels: ['Travel and Transportation > Lodging > Vacation Rental']
placemaker_url:      https://foursquare.com/placemakers/review-place/59b2c754b54618784f259654
geom:                ᴺᵁᴸᴸ
bbox:                (NULL,NULL,NULL,NULL)
```

运行以下查询以使用 `DESCRIBE` 查看数据的自动推断模式：

```sql title="Query"
DESCRIBE s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

```response title="Response"
    ┌─name────────────────┬─type────────────────────────┬
 1. │ fsq_place_id        │ Nullable(String)            │
 2. │ name                │ Nullable(String)            │
 3. │ latitude            │ Nullable(Float64)           │
 4. │ longitude           │ Nullable(Float64)           │
 5. │ address             │ Nullable(String)            │
 6. │ locality            │ Nullable(String)            │
 7. │ region              │ Nullable(String)            │
 8. │ postcode            │ Nullable(String)            │
 9. │ admin_region        │ Nullable(String)            │
10. │ post_town           │ Nullable(String)            │
11. │ po_box              │ Nullable(String)            │
12. │ country             │ Nullable(String)            │
13. │ date_created        │ Nullable(String)            │
14. │ date_refreshed      │ Nullable(String)            │
15. │ date_closed         │ Nullable(String)            │
16. │ tel                 │ Nullable(String)            │
17. │ website             │ Nullable(String)            │
18. │ email               │ Nullable(String)            │
19. │ facebook_id         │ Nullable(Int64)             │
20. │ instagram           │ Nullable(String)            │
21. │ twitter             │ Nullable(String)            │
22. │ fsq_category_ids    │ Array(Nullable(String))     │
23. │ fsq_category_labels │ Array(Nullable(String))     │
24. │ placemaker_url      │ Nullable(String)            │
25. │ geom                │ Nullable(String)            │
26. │ bbox                │ Tuple(                     ↴│
    │                     │↳    xmin Nullable(Float64),↴│
    │                     │↳    ymin Nullable(Float64),↴│
    │                     │↳    xmax Nullable(Float64),↴│
    │                     │↳    ymax Nullable(Float64)) │
    └─────────────────────┴─────────────────────────────┘
```

## 将数据加载到 ClickHouse 中 {#loading-the-data}

如果您希望将数据持久化到磁盘，可以使用 `clickhouse-server` 
或 ClickHouse Cloud。

要创建表，请运行以下命令：

```sql title="Query"
CREATE TABLE foursquare_mercator
(
    fsq_place_id String,
    name String,
    latitude Float64,
    longitude Float64,
    address String,
    locality String,
    region LowCardinality(String),
    postcode LowCardinality(String),
    admin_region LowCardinality(String),
    post_town LowCardinality(String),
    po_box LowCardinality(String),
    country LowCardinality(String),
    date_created Nullable(Date),
    date_refreshed Nullable(Date),
    date_closed Nullable(Date),
    tel String,
    website String,
    email String,
    facebook_id String,
    instagram String,
    twitter String,
    fsq_category_ids Array(String),
    fsq_category_labels Array(String),
    placemaker_url String,
    geom String,
    bbox Tuple(
        xmin Nullable(Float64),
        ymin Nullable(Float64),
        xmax Nullable(Float64),
        ymax Nullable(Float64)
    ),
    category LowCardinality(String) ALIAS fsq_category_labels[1],
    mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
    mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
    INDEX idx_x mercator_x TYPE minmax,
    INDEX idx_y mercator_y TYPE minmax
)
ORDER BY mortonEncode(mercator_x, mercator_y)
```

请注意在多个列中使用 [`LowCardinality`](/sql-reference/data-types/lowcardinality) 
数据类型，这会将数据类型的内部表示更改为字典编码。处理字典编码的数据可以显著提高许多应用程序的 `SELECT` 查询性能。

此外，还创建了两个 `UInt32` 的 `MATERIALIZED` 列，`mercator_x` 和 `mercator_y`，它们将经纬度坐标映射到 
[Web Mercator 投影](https://en.wikipedia.org/wiki/Web_Mercator_projection)
以便于将地图分割成瓷砖：

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

让我们逐列解释上面发生的事情。

**mercator_x**

此列将经度值转换为 Mercator 投影中的 X 坐标：

- `longitude + 180` 将经度范围从 [-180, 180] 移动到 [0, 360]
- 除以 360 将其归一化为 0 到 1 之间的值
- 乘以 `0xFFFFFFFF`（最大 32 位无符号整数的十六进制表示）将该归一化值缩放到 32 位整数的全集范围

**mercator_y**

此列将纬度值转换为 Mercator 投影中的 Y 坐标：

- `latitude + 90` 将纬度从 [-90, 90] 移动到 [0, 180]
- 除以 360 并乘以 pi() 将其转换为三角函数的弧度
- `log(tan(...))` 部分是 Mercator 投影公式的核心
- 乘以 `0xFFFFFFFF` 则缩放到 32 位整数的全集范围

指定 `MATERIALIZED` 确保在我们 `INSERT` 数据时 ClickHouse 会计算这些列的值，而无需在 `INSERT` 语句中指定这些不属于原始数据模式的列。

该表按 `mortonEncode(mercator_x, mercator_y)` 排序，这生成了 `mercator_x` 和 `mercator_y` 的 Z-order 空间填充曲线，以显著
提高地理空间查询性能。这种 Z-order 曲线排序确保数据在物理上按空间临近度组织：

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

还创建了两个 `minmax` 索引以加快搜索速度：

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

如您所见，ClickHouse 拥有您进行实时
映射应用所需的一切！

运行以下查询以加载数据：

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## 可视化数据 {#data-visualization}

要查看这个数据集可以实现的功能，请查看 [adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219)。
adsb.exposed 最初是由联合创始人和首席技术官 Alexey Milovidov 构建的，用于可视化 ADS-B（自动依赖监视广播） 
飞行数据，规模大约是原始数据的 1000 倍。在一次公司黑客马拉松上，Alexey 将 Foursquare 数据添加到该工具中。

这里是一些我们最喜欢的可视化结果，供您欣赏。

<Image img={visualization_1} size="md" alt="欧洲兴趣点的密度图"/>

<Image img={visualization_2} size="md" alt="日本的清酒酒吧"/>

<Image img={visualization_3} size="md" alt="自动取款机"/>

<Image img={visualization_4} size="md" alt="根据国家分类的欧洲兴趣点地图"/>
