---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: '使用 Jupyter Notebook 和 chDB 探索数据'
title: '在 Jupyter Notebook 中使用 chDB 探索数据'
description: '本指南介绍如何在 Jupyter Notebook 中配置和使用 chDB，从 ClickHouse Cloud 或本地文件中探索数据'
keywords: ['ML', 'Jupyer', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/jupyter/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/jupyter/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/jupyter/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/jupyter/7.png';
import image_8 from '@site/static/images/use-cases/AI_ML/jupyter/8.png';
import image_9 from '@site/static/images/use-cases/AI_ML/jupyter/9.png';


# 使用 Jupyter 笔记本和 chDB 探索数据

在本指南中，您将学习如何借助 [chDB](/chdb)（一个由 ClickHouse 驱动的高性能进程内 SQL OLAP 引擎），在 Jupyter 笔记本中探索 ClickHouse Cloud 上的数据集。

**前提条件**:
- 一个虚拟环境
- 一个可用的 ClickHouse Cloud 服务以及您的[连接信息](/cloud/guides/sql-console/gather-connection-details)

:::tip
如果您还没有 ClickHouse Cloud 账户，可以[注册](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb)
试用，并获得 300 美元的免费额度开始体验。
:::

**您将学到：**
- 使用 chDB 从 Jupyter 笔记本连接到 ClickHouse Cloud
- 查询远程数据集并将结果转换为 Pandas DataFrame
- 将云端数据与本地 CSV 文件结合进行分析
- 使用 matplotlib 可视化数据

我们将使用 UK Property Price 数据集，它是 ClickHouse Cloud 中提供的入门数据集之一。
其中包含了 1995 年到 2024 年间英国房屋成交价格的数据。



## 设置 {#setup}

要将此数据集添加到现有的 ClickHouse Cloud 服务中,请使用您的账户信息登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)。

在左侧菜单中,点击 `Data sources`,然后点击 `Predefined sample data`:

<Image size='md' img={image_1} alt='添加示例数据集' />

在英国房产成交价格数据(4GB)卡片中选择 `Get started`:

<Image size='md' img={image_2} alt='选择英国房产成交价格数据集' />

然后点击 `Import dataset`:

<Image size='md' img={image_3} alt='导入英国房产成交价格数据集' />

ClickHouse 将自动在 `default` 数据库中创建 `pp_complete` 表,并向该表填充 2892 万行价格数据点。

为了降低凭据泄露的风险,我们建议将您的 Cloud 用户名和密码添加为本地机器上的环境变量。
在终端中运行以下命令,将您的用户名和密码添加为环境变量:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
上述环境变量仅在您的终端会话期间有效。
要永久设置它们,请将其添加到您的 shell 配置文件中。
:::

现在激活您的虚拟环境。
在虚拟环境中,使用以下命令安装 Jupyter Notebook:

```python
pip install notebook
```

使用以下命令启动 Jupyter Notebook:

```python
jupyter notebook
```

将打开一个新的浏览器窗口,显示 `localhost:8888` 上的 Jupyter 界面。
点击 `File` > `New` > `Notebook` 创建一个新的 Notebook。

<Image size='md' img={image_4} alt='创建新的 notebook' />

系统将提示您选择一个内核。
选择任何可用的 Python 内核,在本示例中我们将选择 `ipykernel`:

<Image size='md' img={image_5} alt='选择内核' />

在空白单元格中,您可以输入以下命令来安装 chDB,我们将使用它连接到远程 ClickHouse Cloud 实例:

```python
pip install chdb
```

现在您可以导入 chDB 并运行一个简单的查询来检查一切是否设置正确:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```


## 探索数据 {#exploring-the-data}

在设置好英国房价数据集并在 Jupyter notebook 中运行 chDB 后,我们现在可以开始探索数据了。

假设我们想要查看英国特定地区(如首都伦敦)的房价随时间的变化情况。
ClickHouse 的 [`remoteSecure`](/sql-reference/table-functions/remote) 函数允许您轻松地从 ClickHouse Cloud 检索数据。
您可以指示 chDB 在进程中将此数据作为 Pandas DataFrame 返回——这是一种方便且熟悉的数据处理方式。

编写以下查询以从您的 ClickHouse Cloud 服务获取英国房价数据并将其转换为 `pandas.DataFrame`:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

```


# 从 .env 文件加载环境变量

load&#95;dotenv()

username = os.environ.get(&#39;CLICKHOUSE&#95;USER&#39;)
password = os.environ.get(&#39;CLICKHOUSE&#95;PASSWORD&#39;)

query = f&quot;&quot;&quot;
SELECT
toYear(date) AS year,
avg(price) AS avg&#95;price
FROM remoteSecure(
&#39;****.europe-west4.gcp.clickhouse.cloud&#39;,
default.pp&#95;complete,
&#39;{username}&#39;,
&#39;{password}&#39;
)
WHERE town = &#39;LONDON&#39;
GROUP BY toYear(date)
ORDER BY year;
&quot;&quot;&quot;

df = chdb.query(query, &quot;DataFrame&quot;)
df.head()

````

在上述代码片段中，`chdb.query(query, "DataFrame")` 执行指定的查询并将结果以 Pandas DataFrame 的形式输出到终端。
在查询中，我们使用 `remoteSecure` 函数连接到 ClickHouse Cloud。
`remoteSecure` 函数接受以下参数：
- 连接字符串
- 要使用的数据库和表名称
- 用户名
- 密码

作为安全最佳实践，建议使用环境变量来传递用户名和密码参数，而不是直接在函数中指定，当然如果需要也可以直接指定。

`remoteSecure` 函数连接到远程 ClickHouse Cloud 服务，执行查询并返回结果。
根据数据量大小，此操作可能需要几秒钟。
在本例中，我们返回每年的平均价格，并按 `town='LONDON'` 进行过滤。
结果随后以 DataFrame 的形式存储在名为 `df` 的变量中。

`df.head` 仅显示返回数据的前几行：

<Image size="md" img={image_6} alt="DataFrame 预览"/>

在新单元格中运行以下命令以检查列的数据类型：

```python
df.dtypes
````

```response
year          uint16
avg_price    float64
dtype: object
```

请注意，虽然在 ClickHouse 中 `date` 的类型是 `Date`，但在结果数据帧中，它的类型是 `uint16`。
chDB 在返回 DataFrame 时会自动推断最合适的类型。

现在我们已经以熟悉的形式获得了数据，让我们来探究一下伦敦房产价格是如何随时间变化的。

在一个新的代码单元中，运行以下命令，使用 matplotlib 绘制一张伦敦“时间 vs 价格”的简单图表：

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('年份')
plt.ylabel('价格（£）')
plt.title('伦敦房产价格时间序列')
```


# 每隔两年显示一次以避免拥挤

years&#95;to&#95;show = df[&#39;year&#39;][::2]  # 每隔两年
plt.xticks(years&#95;to&#95;show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight&#95;layout()
plt.show()

````

<Image size="md" img={image_7} alt="dataframe preview"/>

不出所料,伦敦的房产价格随时间推移大幅上涨。

一位数据科学家同事向我们发送了一个包含额外住房相关变量的 .csv 文件,并想了解伦敦房屋销售数量随时间的变化情况。
让我们将其中一些数据与房价进行对比绘图,看看能否发现任何相关性。

您可以使用 `file` 表引擎直接读取本地机器上的文件。
在新单元格中,运行以下命令从本地 .csv 文件创建新的 DataFrame。

```python
query = f"""
SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
WHERE area = 'city of london' AND houses_sold IS NOT NULL
GROUP BY toYear(date)
ORDER BY year;
"""

df_2 = chdb.query(query, "DataFrame")
df_2.head()
````

<details>
  <summary>在单个步骤中从多个数据源读取</summary>
  你也可以在单个步骤中从多个数据源读取。可以使用下面带有 `JOIN` 的查询来实现：

  ```python
  query = f"""
  SELECT 
      toYear(date) AS year,
      avg(price) AS avg_price, housesSold
  FROM remoteSecure(
  '****.europe-west4.gcp.clickhouse.cloud',
  default.pp_complete,
  '{username}',
  '{password}'
  ) AS remote
  JOIN (
    SELECT 
      toYear(date) AS year,
      sum(houses_sold)*1000 AS housesSold
      FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
    WHERE area = 'city of london' AND houses_sold IS NOT NULL
    GROUP BY toYear(date)
    ORDER BY year
  ) AS local ON local.year = remote.year
  WHERE town = 'LONDON'
  GROUP BY toYear(date)
  ORDER BY year;
  """
  ```
</details>

<Image size="md" img={image_8} alt="数据帧预览" />

虽然我们缺少 2020 年及之后的数据，但仍然可以对 1995 到 2019 年这段时间内的两个数据集进行对比绘图。
在一个新的单元格中运行以下命令：


```python
# 创建一个包含两个 y 轴的图形
fig, ax1 = plt.subplots(figsize=(14, 8))
```


# 在左侧 y 轴上绘制房屋销售数量
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)



# 为价格数据创建第二个 y 轴
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('平均价格（£）', color=color)



# 绘制 2019 年及之前的价格数据

ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='平均价格', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# 使用货币格式格式化价格轴

ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# 设置标题并每隔 2 年显示一次
plt.title('伦敦住房市场：销售量与价格随时间变化', fontsize=14, pad=20)



# 两个数据集仅使用 2019 年及之前的年份

all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2] # 每隔一年显示
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# 添加图例

ax1.legend(loc=&#39;upper left&#39;)
ax2.legend(loc=&#39;upper right&#39;)

plt.tight&#95;layout()
plt.show()

```

<Image size="md" img={image_9} alt="远程数据集和本地数据集的图表"/>

从图表数据可以看出,销售量在1995年约为16万套,随后快速增长,在1999年达到约54万套的峰值。
此后,销售量在2000年代中期急剧下降,在2007-2008年金融危机期间大幅下跌,降至约14万套。
另一方面,价格从1995年的约15万英镑稳步增长至2005年的约30万英镑。
2012年后增长显著加速,从约40万英镑陡然上升至2019年的超过100万英镑。
与销售量不同,价格在2008年危机中几乎未受影响,并保持上升趋势。令人惊叹!
```


## 总结 {#summary}

本指南演示了 chDB 如何通过连接 ClickHouse Cloud 与本地数据源，在 Jupyter notebook 中实现无缝的数据探索。
通过使用英国房产价格数据集，我们展示了如何使用 `remoteSecure()` 函数查询远程 ClickHouse Cloud 数据，使用 `file()` 表引擎读取本地 CSV 文件，并将结果直接转换为 Pandas DataFrame 进行分析和可视化。
借助 chDB，数据科学家可以充分利用 ClickHouse 强大的 SQL 功能，同时结合熟悉的 Python 工具（如 Pandas 和 matplotlib），轻松整合多个数据源进行全面分析。

虽然许多伦敦的数据科学家可能在短期内无法负担自己的房产，但至少他们可以分析这个将他们拒之门外的市场！
