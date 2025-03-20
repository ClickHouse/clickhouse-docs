---
description: 'RecipeNLG 数据集，包含 220 万个食谱'
slug: /getting-started/example-datasets/recipes
sidebar_label: 食谱数据集
title: '食谱数据集'
---

RecipeNLG 数据集可从 [这里](https://recipenlg.cs.put.poznan.pl/dataset) 下载。该数据集包含 220 万个食谱，大小略低于 1 GB。
## 下载并解压数据集 {#download-and-unpack-the-dataset}

1. 访问下载页面 [https://recipenlg.cs.put.poznan.pl/dataset](https://recipenlg.cs.put.poznan.pl/dataset)。
2. 接受条款和条件并下载压缩文件。
3. 可选：使用 `md5sum dataset.zip` 验证压缩文件，其值应为 `3a168dfd0912bb034225619b3586ce76`。
4. 使用 `unzip dataset.zip` 解压缩文件。您将在 `dataset` 目录中获得 `full_dataset.csv` 文件。
## 创建表 {#create-a-table}

运行 clickhouse-client 并执行以下 CREATE 查询：

``` sql
CREATE TABLE recipes
(
    title String,
    ingredients Array(String),
    directions Array(String),
    link String,
    source LowCardinality(String),
    NER Array(String)
) ENGINE = MergeTree ORDER BY title;
```
## 插入数据 {#insert-the-data}

运行以下命令：

``` bash
clickhouse-client --query "
    INSERT INTO recipes
    SELECT
        title,
        JSONExtract(ingredients, 'Array(String)'),
        JSONExtract(directions, 'Array(String)'),
        link,
        source,
        JSONExtract(NER, 'Array(String)')
    FROM input('num UInt32, title String, ingredients String, directions String, link String, source LowCardinality(String), NER String')
    FORMAT CSVWithNames
" --input_format_with_names_use_header 0 --format_csv_allow_single_quote 0 --input_format_allow_errors_num 10 < full_dataset.csv
```

这是一个解析自定义 CSV 的示例，因为它需要多次调整。

解释：
- 数据集是 CSV 格式，但在插入时需要一些预处理；我们使用表函数 [input](../../sql-reference/table-functions/input.md) 进行预处理；
- CSV 文件的结构在表函数 `input` 的参数中指定；
- 字段 `num` （行号）是多余的 - 我们从文件中解析并忽略它；
- 我们使用 `FORMAT CSVWithNames`，但 CSV 中的头将被忽略（通过命令行参数 `--input_format_with_names_use_header 0`），因为头部不包含第一个字段的名称；
- 文件仅使用双引号来括起来 CSV 字符串；某些字符串没有用双引号括起来，单引号不能解析为字符串包围 - 这就是我们添加 `--format_csv_allow_single_quote 0` 参数的原因；
- 某些来自 CSV 的字符串无法解析，因为它们的值开头包含 `\M/` 序列；在 CSV 中，唯一可以以反斜杠开头的值为 `\N`，它被解析为 SQL NULL。我们添加了 `--input_format_allow_errors_num 10` 参数，最多可以跳过十条格式不正确的记录；
- 对于成分、方向和 NER 字段，有数组；这些数组以不寻常的形式表示：它们被序列化为字符串形式的 JSON 然后放入 CSV - 我们将它们解析为 String，并使用 [JSONExtract](../../sql-reference/functions/json-functions.md) 函数将其转换为 Array。
## 验证插入的数据 {#validate-the-inserted-data}

通过检查行数：

查询：

``` sql
SELECT count() FROM recipes;
```

结果：

``` text
┌─count()─┐
│ 2231142 │
└─────────┘
```
## 示例查询 {#example-queries}
### 按食谱数量排序的主要成分： {#top-components-by-the-number-of-recipes}

在这个示例中，我们学习如何使用 [arrayJoin](../../sql-reference/functions/array-join.md) 函数将数组扩展为一组行。

查询：

``` sql
SELECT
    arrayJoin(NER) AS k,
    count() AS c
FROM recipes
GROUP BY k
ORDER BY c DESC
LIMIT 50
```

结果：

``` text
┌─k────────────────────┬──────c─┐
│ salt                 │ 890741 │
│ sugar                │ 620027 │
│ butter               │ 493823 │
│ flour                │ 466110 │
│ eggs                 │ 401276 │
│ onion                │ 372469 │
│ garlic               │ 358364 │
│ milk                 │ 346769 │
│ water                │ 326092 │
│ vanilla              │ 270381 │
│ olive oil            │ 197877 │
│ pepper               │ 179305 │
│ brown sugar          │ 174447 │
│ tomatoes             │ 163933 │
│ egg                  │ 160507 │
│ baking powder        │ 148277 │
│ lemon juice          │ 146414 │
│ Salt                 │ 122558 │
│ cinnamon             │ 117927 │
│ sour cream           │ 116682 │
│ cream cheese         │ 114423 │
│ margarine            │ 112742 │
│ celery               │ 112676 │
│ baking soda          │ 110690 │
│ parsley              │ 102151 │
│ chicken              │ 101505 │
│ onions               │  98903 │
│ vegetable oil        │  91395 │
│ oil                  │  85600 │
│ mayonnaise           │  84822 │
│ pecans               │  79741 │
│ nuts                 │  78471 │
│ potatoes             │  75820 │
│ carrots              │  75458 │
│ pineapple            │  74345 │
│ soy sauce            │  70355 │
│ black pepper         │  69064 │
│ thyme                │  68429 │
│ mustard              │  65948 │
│ chicken broth        │  65112 │
│ bacon                │  64956 │
│ honey                │  64626 │
│ oregano              │  64077 │
│ ground beef          │  64068 │
│ unsalted butter      │  63848 │
│ mushrooms            │  61465 │
│ Worcestershire sauce │  59328 │
│ cornstarch           │  58476 │
│ green pepper         │  58388 │
│ Cheddar cheese       │  58354 │
└──────────────────────┴────────┘

结果中有 50 行。耗时：0.112 秒。处理了 223 万行，361.57 MB（每秒 1999 万行，3.24 GB/s。）
```
### 最复杂的草莓食谱 {#the-most-complex-recipes-with-strawberry}

``` sql
SELECT
    title,
    length(NER),
    length(directions)
FROM recipes
WHERE has(NER, 'strawberry')
ORDER BY length(directions) DESC
LIMIT 10
```

结果：

``` text
┌─title────────────────────────────────────────────────────────────┬─length(NER)─┬─length(directions)─┐
│ Chocolate-Strawberry-Orange Wedding Cake                         │          24 │                126 │
│ Strawberry Cream Cheese Crumble Tart                             │          19 │                 47 │
│ Charlotte-Style Ice Cream                                        │          11 │                 45 │
│ Sinfully Good a Million Layers Chocolate Layer Cake, With Strawb │          31 │                 45 │
│ Sweetened Berries With Elderflower Sherbet                       │          24 │                 44 │
│ Chocolate-Strawberry Mousse Cake                                 │          15 │                 42 │
│ Rhubarb Charlotte with Strawberries and Rum                      │          20 │                 42 │
│ Chef Joey's Strawberry Vanilla Tart                              │           7 │                 37 │
│ Old-Fashioned Ice Cream Sundae Cake                              │          17 │                 37 │
│ Watermelon Cake                                                  │          16 │                 36 │
└──────────────────────────────────────────────────────────────────┴─────────────┴────────────────────┘

共10行. 耗时：0.215秒。处理了223万行，1.48 GB (每秒1035万行，6.86 GB/s.)
```

在这个例子中，我们使用了 [has](../../sql-reference/functions/array-functions.md#hasarr-elem) 函数来按数组元素进行过滤，并按步骤数排序。

有一个结婚蛋糕需要整整126个步骤来制作！显示该步骤：

查询：

``` sql
SELECT arrayJoin(directions)
FROM recipes
WHERE title = 'Chocolate-Strawberry-Orange Wedding Cake'
```

结果：

``` text
┌─arrayJoin(directions)───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 在烤箱中将一个烤架放在中心位置，一个烤架放在底部的三分之一处，预热至350华氏度。                                                                                              │
│ 用黄油涂抹一个直径5英寸、高2英寸的蛋糕模具、一个直径8英寸、高2英寸的蛋糕模具和一个直径12英寸、高2英寸的蛋糕模具。                                                                │
│ 在模具中撒上面粉；用烘焙纸铺底部。                                                                                                                                                 │
│ 在一个重的小锅中，将1/3杯橙汁和2盎司无糖巧克力混合。                                                                                                                        │
│ 在中低火上搅拌混合物，直到巧克力融化。                                                                                                                                            │
│ 取出火源。                                                                                                                                                                       │
│ 逐渐搅拌入1 2/3杯橙汁。                                                                                                                                                         │
│ 在中等碗中，将3杯面粉、2/3杯可可粉、2茶匙小苏打、1茶匙盐和1/2茶匙泡打粉过筛。                                                                                               │
│ 使用电动搅拌器，在大碗中打发1杯（2条）黄油和3杯糖，直到混合均匀（混合物看起来会有些颗粒感）。                                                                                │
│ 分次加入4个鸡蛋，每次加入后搅打均匀。                                                                                                                                           │
│ 将1汤匙橙皮和1汤匙香草提取物搅拌入混合物中。                                                                                                                                 │
│ 交替加入干成分和橙汁混合物，每次加入3次，每次都要充分搅打。                                                                                                                  │
│ 加入1杯巧克力豆。                                                                                                                                                              │
│ 转移1杯加2汤匙的面糊到准备好的5英寸模具中，将3杯面糊转移到准备好的8英寸模具中，将剩余的面糊（约6杯）放入12英寸模具中。                                                        │
│ 将5英寸和8英寸模具放在烤箱的中心架上。                                                                                                                                         │
│ 将12英寸模具放在烤箱的下层架上。                                                                                                                                              │
│ 烤蛋糕，直到插入中心的测试器干净取出，约35分钟。                                                                                                                             │
│ 将烤好的蛋糕从模具中转移到架子上，完全冷却。                                                                                                                                  │
│ 在一个6英寸的纸板蛋糕圆上标记一个直径4英寸的圆。                                                                                                                               │
│ 剪下标记的圆。                                                                                                                                                                   │
│ 在一个8英寸的纸板蛋糕圆上标记一个直径7英寸的圆。                                                                                                                               │
│ 剪下标记的圆。                                                                                                                                                                   │
│ 在一个12英寸的纸板蛋糕圆上标记一个直径11英寸的圆。                                                                                                                             │
│ 剪下标记的圆。                                                                                                                                                                   │
│ 切开5英寸蛋糕的边缘以松开。                                                                                                                                                    │
│ 将4英寸的纸板放在模具上。                                                                                                                                                      │
│ 固定纸板和模具；将蛋糕翻转到纸板上。                                                                                                                                              │
│ 剥去烘焙纸。将蛋糕连同纸板用铝箔包好。                                                                                                                                         │
│ 按照同样的方法转移、剥去烘焙纸并包好8英寸蛋糕和12英寸蛋糕，使用7英寸纸板和11英寸纸板。                                                                                      │
│ 使用剩余的材料，再做一批蛋糕面糊，并按上述方式烤制另外3层蛋糕。                                                                                                            │
│ 在模具中冷却蛋糕。                                                                                                                                                           │
│ 将蛋糕在模具中用铝箔紧紧包好。                                                                                                                                               │
│ （可以提前准备。                                                                                                                                                                 │
│ 在室温下放置最多1天，或者将所有蛋糕层双重包裹并冷冻最多1周。                                                                                                              │
│ 使用时，将蛋糕层带到室温。）                                                                                                                                                  │
│ 将第一个12英寸的蛋糕放在工作台上的纸板上。                                                                                                                                  │
│ 在蛋糕顶部和边缘涂抹2 3/4杯甘那许。                                                                                                                                                    │
│ 在甘那许上涂抹2/3杯果酱，边缘留出1/2英寸的巧克力边框。                                                                                                                         │
│ 用汤匙将1 3/4杯白巧克力糖霜滴在果酱上。                                                                                                                                          │
│ 轻轻地将糖霜抹在果酱上，边缘留出1/2英寸的巧克力边框。                                                                                                                            │
│ 在第二个12英寸的纸板上擦一些可可粉。                                                                                                                                             │
│ 切开第二个12英寸的蛋糕的边缘以松开。                                                                                                                                           │
│ 将纸板（可可面朝下）放在模具上。                                                                                                                                                 │
│ 将蛋糕翻转到纸板上。                                                                                                                                                           │
│ 剥去烘焙纸。                                                                                                                                                                      │
│ 小心地将蛋糕从纸板上滑到第一个12英寸蛋糕的填充物上。                                                                                                                            │
│ 放入冰箱中。                                                                                                                                                                       │
│ 将第一个8英寸蛋糕放在工作台上的纸板上。                                                                                                                                     │
│ 在蛋糕顶部涂抹1杯甘那许，直到边缘。                                                                                                                                                 │
│ 在甘那许上涂抹1/4杯果酱，留出1/2英寸的巧克力边框。                                                                                                                            │
│ 用汤匙将1杯白巧克力糖霜滴在果酱上。                                                                                                                                              │
│ 轻轻抹平糖霜，边缘留出1/2英寸的巧克力边框。                                                                                                                                  │
│ 在第二个8英寸的纸板上涂一些可可粉。                                                                                                                                           │
│ 切开第二个8英寸蛋糕的边缘以松开。                                                                                                                                             │
│ 将纸板（可可面朝下）放在模具上。                                                                                                                                                 │
│ 将蛋糕翻转到纸板上。                                                                                                                                                           │
│ 剥去烘焙纸。                                                                                                                                                                        │
│ 将蛋糕从纸板上滑到第一个8英寸蛋糕的填充物上。                                                                                                                                  │
│ 放入冰箱中。                                                                                                                                                                       │
│ 将第一个5英寸蛋糕放在工作台上的纸板上。                                                                                                                                     │
│ 在蛋糕顶部涂抹1/2杯甘那许，直到边缘。                                                                                                                                            │
│ 在甘那许上涂抹2汤匙果酱，留出1/2英寸的巧克力边框。                                                                                                                          │
│ 用汤匙将1/3杯白巧克力糖霜滴在果酱上。                                                                                                                                              │
│ 轻轻抹平糖霜，边缘留出1/2英寸的巧克力边框。                                                                                                                                  │
│ 在第二个6英寸的纸板上涂一些可可粉。                                                                                                                                          │
│ 切开第二个5英寸蛋糕的边缘以松开。                                                                                                                                           │
│ 将纸板（可可面朝下）放在模具上。                                                                                                                                                 │
│ 将蛋糕翻转到纸板上。                                                                                                                                                           │
│ 剥去烘焙纸。                                                                                                                                                                      │
│ 将蛋糕从纸板上滑到第一个5英寸蛋糕的填充物上。                                                                                                                                  │
│ 所有蛋糕冷藏1小时以定型填充物。                                                                                                                                                     │
│ 将12英寸的层叠蛋糕放在其纸板上，放在旋转蛋糕架上。                                                                                                                        │
│ 在蛋糕的顶部和侧面涂抹2 2/3杯糖霜作为第一层。                                                                                                                                     │
│ 将蛋糕放入冰箱中。                                                                                                                                                             │
│ 将8英寸的层叠蛋糕放在其纸板上，放在蛋糕架上。                                                                                                                                 │
│ 在蛋糕的顶部和侧面涂抹1 1/4杯糖霜作为第一层。                                                                                                                                  │
│ 将蛋糕放入冰箱中。                                                                                                                                                             │
│ 将5英寸的层叠蛋糕放在其纸板上，放在蛋糕架上。                                                                                                                                  │
│ 在蛋糕的顶部和侧面涂抹3/4杯糖霜作为第一层。                                                                                                                                      │
│ 将所有蛋糕放入冰箱中，直到第一层糖霜定型，约1小时。                                                                                                                            │
│ （蛋糕可以提前制作到这一点，最多1天；覆盖好并保持在冰箱中。）                                                                                                                   │
│ 准备第二批糖霜，使用剩余的糖霜材料，并遵循第一批的指示。                                                                                                                      │
│ 用小星形嘴将2杯糖霜放入裱花袋中。                                                                                                                                               │
│ 将12英寸蛋糕放在其纸板上，放在大型平盘上。                                                                                                                                     │
│ 将盘子放在蛋糕架上。                                                                                                                                                          │
│ 使用抹刀将2 1/2杯糖霜涂抹在蛋糕的顶部和侧面；抹平顶部。                                                                                                                       │
│ 使用装满糖霜的裱花袋在蛋糕的顶部边缘挤出装饰边。                                                                                                                               │
│ 将蛋糕在盘子上放入冰箱中。                                                                                                                                                     │
│ 将8英寸蛋糕放在其纸板上，放在蛋糕架上。                                                                                                                                         │
│ 使用抹刀将1 1/2杯糖霜涂抹在蛋糕的顶部和侧面；抹平顶部。                                                                                                                      │
│ 使用裱花袋在蛋糕的顶部边缘挤出装饰边。                                                                                                                                           │
│ 将蛋糕放在其纸板上放入冰箱中。                                                                                                                                                 │
│ 将5英寸蛋糕放在其纸板上，放在蛋糕架上。                                                                                                                                         │
│ 使用抹刀将3/4杯糖霜涂抹在蛋糕的顶部和侧面；抹平顶部。                                                                                                                        │
│ 使用裱花袋在蛋糕的顶部边缘挤出装饰边，如有必要，则适量将更多糖霜放入袋内。                                                                                                      │
│ 将蛋糕放在其纸板上放入冰箱中。                                                                                                                                                 │
│ 在糖霜定型之前，将所有蛋糕冷藏约2小时。                                                                                                                                            │
│ （可以提前2天准备。                                                                                                                                                              │
│ 轻轻覆盖；保持在冰箱中。）                                                                                                                                                      │
│ 将12英寸蛋糕放在工作台上的盘子上。                                                                                                                                             │
│ 直直地将1根木制的支撑棍推入蛋糕的中心，并完全穿透。                                                                                                                            │
│ 在糖霜顶部标记支撑棍1/4英寸。                                                                                                                                                     │
│ 拔出支撑棍，并在标记处用锯齿刀切断。                                                                                                                                           │
│ 再切出4根支撑棍，长度与之相同。                                                                                                                                                  │
│ 将1根切割好的支撑棍重新插入蛋糕的中心。                                                                                                                                          │
│ 将剩下的4根切割支撑棍插入蛋糕，定位在蛋糕边缘内侧3 1/2英寸，并均匀间隔。                                                                                                      │
│ 将8英寸蛋糕放在其纸板上，放在工作台上。                                                                                                                                       │
│ 直直地将1根支撑棍推入蛋糕的中心，并完全穿透。                                                                                                                                  │
│ 在糖霜顶部标记支撑棍1/4英寸。                                                                                                                                                     │
│ 拔出支撑棍，并在标记处用锯齿刀切断。                                                                                                                                           │
│ 再切出3根支撑棍，长度与之相同。                                                                                                                                                  │
│ 将1根切割好的支撑棍重新插入蛋糕的中心。                                                                                                                                          │
│ 将剩下的3根切割支撑棍插入蛋糕，定位在边缘内侧2 1/2英寸，并均匀间隔。                                                                                                           │
│ 使用大型金属抹刀作为辅助工具，将8英寸的蛋糕放置在12英寸蛋糕中心的支撑棍上，确保居中。                                                                                           │
│ 小心地将5英寸蛋糕放在8英寸蛋糕的支撑棍上，确保居中。                                                                                                                           │
│ 使用柑橘剥皮器从橙子上切出长条的橙皮。                                                                                                                                           │
│ 将条切成长段。                                                                                                                                                                     │
│ 要制作橙皮卷，围绕木勺的把手将橙皮段缠绕；轻轻地从把手上滑下橙皮，以保持卷曲形状。                                                                                             │
│ 用橙皮卷、常春藤或薄荷枝和一些浆果装饰蛋糕。                                                                                                                                     │
│ （组装好的蛋糕可以提前最多8小时制作。                                                                                                                                           │
│ 让其在凉爽的室温下静置。）                                                                                                                                                       │
│ 拆下顶部和中间的蛋糕层。                                                                                                                                                           │
│ 从蛋糕中取出支撑棍。                                                                                                                                                               │
│ 将顶部和中间蛋糕切成片。                                                                                                                                                           │
│ 切割12英寸蛋糕：从边缘向内3英寸，直刀下切，切到底部，形成中心直径6英寸的圆形。                                                                                                   │
│ 切割蛋糕的外部分，切割内部分并与草莓搭配食用。                                                                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

共126行. 耗时：0.011秒。处理了8.19千行，5.34 MB (每秒737.75千行，480.59 MB/s.)
```
### 在线演示 {#online-playground}

数据集也可以在 [在线演示](https://sql.clickhouse.com?query_id=HQXNQZE26Z1QWYP9KC76ML) 中查看。
