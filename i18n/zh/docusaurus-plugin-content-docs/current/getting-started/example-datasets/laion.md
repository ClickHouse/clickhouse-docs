---
description: '包含 4 亿张带有英文说明文字的图像的数据集'
sidebar_label: 'Laion-400M 数据集'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M 数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'laion', 'image embeddings', '示例数据', '机器学习']
---

[Laion-400M 数据集](https://laion.ai/blog/laion-400-open-dataset/) 包含 4 亿张带有英文说明文字的图像。如今 Laion 还提供了一个[规模更大的数据集](https://laion.ai/blog/laion-5b/)，但使用方式与本数据集类似。

该数据集包含图像 URL、图像及其说明文字各自的嵌入向量、图像与说明文字之间的相似度得分，以及元数据，例如图像宽度/高度、许可信息和 NSFW 标记。我们可以使用该数据集在 ClickHouse 中演示[近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md)。



## 数据准备

在原始数据中，embeddings 和元数据分别存储在不同的文件中。数据准备步骤会下载数据、合并文件、
将它们转换为 CSV，并将其导入 ClickHouse。你可以使用下面的 `download.sh` 脚本来完成该步骤：

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 下载图像嵌入向量
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # 下载文本嵌入向量
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # 下载元数据
python3 process.py $number # 合并文件并转换为 CSV 格式
```

脚本 `process.py` 定义如下：

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'
```


# 加载所有文件
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)



# 合并文件

data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)


# 要导入 ClickHouse 的列
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]



# 将 np.array 转换为列表
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())



# 因为 caption 字段有时包含各种引号，这里做一个小处理
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))



# 将数据导出为 CSV 文件
data.to_csv(str_i + '.csv', header=False)



# 删除原始数据文件

os.system(f&quot;rm {npy_file} {metadata_file} {text_npy}&quot;)

````

要启动数据准备流水线,请运行:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
````

该数据集被拆分为 410 个文件，每个文件大约包含 100 万行。如果你只想处理较小的数据子集，只需调整命令中的范围，例如 `seq 0 9 | ...`。

（上面的 Python 脚本非常慢（每个文件大约需要 2–10 分钟），内存占用很大（每个文件 41 GB），生成的 CSV 文件也很大（每个 10 GB），因此请谨慎使用。如果你的 RAM 足够多，可以增大 `-P1` 的数值以提高并行度。如果这仍然太慢，可以考虑设计更好的摄取流程——例如先将 .npy 文件转换为 Parquet，然后使用 ClickHouse 完成其余所有处理。）


## 创建表

要先创建一个不带索引的表，请运行：

```sql
CREATE TABLE laion
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32)
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192
```

要将 CSV 文件导入 ClickHouse：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

请注意，`id` 列仅用于示例说明，并由脚本填充为非唯一值。


## 运行暴力穷举向量相似搜索

要执行暴力穷举的近似向量搜索，请运行：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` 是一个包含 512 个元素的数组，也是一个客户端传入的参数。
在文章末尾会介绍一种获取此类数组的便捷方式。
目前，我们可以先生成一张随机乐高（LEGO）套装图片的嵌入向量作为 `target`。

**结果**

```markdown
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

返回 10 行。用时:4.605 秒。已处理 1.0038 亿行,309.98 GB(每秒 2180 万行,每秒 67.31 GB)。
```


## 使用向量相似性索引执行近似向量相似搜索

接下来，在该表上定义两个向量相似性索引。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

有关索引创建和搜索的参数及性能注意事项，请参阅[文档](../../engines/table-engines/mergetree-family/annindexes.md)。
上面的索引定义指定了一个 HNSW 索引，使用“余弦距离（cosine distance）”作为距离度量，将参数“hnsw&#95;max&#95;connections&#95;per&#95;layer”设置为 64，将参数“hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction”设置为 256。
该索引使用半精度 Brain 浮点数（bfloat16）作为量化格式，以优化内存使用。

要构建并物化该索引，请运行以下语句：

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

构建并保存索引可能需要几分钟甚至数小时，具体取决于数据行数和 HNSW 索引参数。

要执行向量搜索，只需再次运行相同的查询即可：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**结果**

```response
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ 乐高好朋友系列：小狗零食与技巧 (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ 新款乐高好朋友系列 41334 安德里亚的公园表演 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 乐高安德里亚的兔子小屋 女孩好朋友心湖城系列 适合5-12岁 / 62块 全新！ │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ 乐高好朋友系列冒险营树屋 - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ 乐高好朋友系列安德里亚的剧院表演 - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - 乐高好朋友系列 - 兽医诊所救护车                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ 乐高好朋友系列 41336 艾玛的艺术咖啡馆                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ 更多关于乐高好朋友系列斯蒂芬妮的友谊蛋糕套装 - 41308 的详情。            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ 乐高好朋友系列体操运动员 30400 袋装 26块                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ 乐高-41057-心湖城马术表演-好朋友系列-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘
```


10 行结果。耗时：0.019 秒。已处理 137.27 千行，24.42 MB（7.38 百万行/秒，1.31 GB/秒）。

```

由于使用向量索引检索最近邻,查询延迟显著降低。
使用向量相似度索引进行向量相似度搜索可能返回与暴力搜索略有不同的结果。
通过仔细选择 HNSW 参数并评估索引质量,HNSW 索引可以实现接近 1 的召回率(与暴力搜索的准确度相同)。
```


## 使用 UDF 创建嵌入向量

通常我们希望为新的图像或新的图像说明创建嵌入向量，并在数据中搜索相似的图像/图像说明对。我们可以使用 [UDF](/sql-reference/functions/udf) 在客户端侧直接创建 `target` 向量。务必使用同一模型来生成数据以及后续搜索所需的新嵌入向量。下面的脚本使用的是 `ViT-B/32` 模型，该模型也是构建该数据集所使用的基础模型。

### 文本嵌入向量

首先，将以下 Python 脚本存储在 ClickHouse 数据路径下的 `user_scripts/` 目录中，并将其设为可执行文件（`chmod +x encode_text.py`）。

`encode_text.py`:

```python
#!/usr/bin/python3
#!注意:如果使用虚拟环境,请更改上方 python3 可执行文件位置。
import clip
import torch
import numpy as np
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        inputs = clip.tokenize(text)
        with torch.no_grad():
            text_features = model.encode_text(inputs)[0].tolist()
            print(text_features)
        sys.stdout.flush()
```

然后在 ClickHouse 服务器配置文件中 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` 指定的位置创建 `encode_text_function.xml`。

```xml
<functions>
    <function>
        <type>executable</type>
        <name>encode_text</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>text</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_text.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

现在即可直接使用：

```sql
SELECT encode_text('猫');
```

第一次运行会比较慢，因为需要加载模型，但后续运行会很快。然后我们可以将输出复制到 `SET param_target=...` 中，从而轻松编写查询。或者，也可以直接将 `encode_text()` 函数作为 `cosineDistance` 函数的参数使用：

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('一只狗和一只猫')) ASC
LIMIT 10
```

请注意，`encode_text()` UDF 本身可能需要几秒钟来计算并输出嵌入向量。

### 图像嵌入

图像嵌入可以以类似方式创建，我们提供了一个 Python 脚本，可用于为本地文件中存储的图像生成嵌入向量。

`encode_image.py`

```python
#!/usr/bin/python3
#!注意:如果使用虚拟环境,请更改上面的 python3 可执行文件位置。
import clip
import torch
import numpy as np
from PIL import Image
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        image = preprocess(Image.open(text.strip())).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)[0].tolist()
            print(image_features)
        sys.stdout.flush()
```

`encode_image_function.xml`

```xml
<functions>
    <function>
        <type>executable_pool</type>
        <name>encode_image</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>path</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_image.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

获取用于搜索的示例图片：


```shell
# 获取乐高套装的随机图片
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

然后运行以下查询，为上面的图像生成嵌入向量：

```sql
SELECT encode_image('/path/to/your/image');
```

完整的搜索查询如下：

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
