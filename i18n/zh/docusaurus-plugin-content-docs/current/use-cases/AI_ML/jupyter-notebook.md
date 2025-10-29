---
'slug': '/use-cases/AI/jupyter-notebook'
'sidebar_label': '在 Jupyter 笔记本中使用 chDB 探索数据'
'title': '在 Jupyter 笔记本中使用 chDB 探索数据'
'description': '本指南解释了如何设置和使用 chDB 在 Jupyter 笔记本中探索来自 ClickHouse Cloud 或本地文件的数据'
'keywords':
- 'ML'
- 'Jupyer'
- 'chDB'
- 'pandas'
'doc_type': 'guide'
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


# 使用 Jupyter Notebook 和 chDB 探索数据

在本指南中，您将学习如何使用 [chDB](/chdb) —— 一个由 ClickHouse 支持的快速内置 SQL OLAP 引擎——在 Jupyter Notebook 中探索 ClickHouse Cloud 数据集。

**前提条件**：
- 一个虚拟环境
- 一个正在运行的 ClickHouse Cloud 服务和您的 [连接详情](/cloud/guides/sql-console/gather-connection-details)

**您将学习：**
- 使用 chDB 从 Jupyter Notebook 连接到 ClickHouse Cloud
- 查询远程数据集并将结果转换为 Pandas DataFrame
- 将云数据与本地 CSV 文件结合进行分析
- 使用 matplotlib 可视化数据

我们将使用在 ClickHouse Cloud 上可用的英国房产价格数据集作为起始数据集之一。
它包含了1995年至2024年间在英国出售房屋的价格数据。

## 设置 {#setup}

要将此数据集添加到现有的 ClickHouse Cloud 服务中，请使用您的帐户信息登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)。

在左侧菜单中，点击 `数据源`。然后点击 `预定义示例数据`：

<Image size="md" img={image_1} alt="添加示例数据集"/>

在英国房产价格支付数据（4GB）卡片中选择 `开始使用`： 

<Image size="md" img={image_2} alt="选择英国价格支付数据集"/>

然后点击 `导入数据集`：

<Image size="md" img={image_3} alt="导入英国价格支付数据集"/>

ClickHouse 将自动在 `default` 数据库中创建 `pp_complete` 表，并用2892万行价格点数据填充该表。

为了减少暴露您凭据的可能性，我们建议将您的 Cloud 用户名和密码添加为本地计算机上的环境变量。
在终端中运行以下命令以将您的用户名和密码添加为环境变量：

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
上面的环境变量仅在您的终端会话期间有效。
要永久设置它们，请将其添加到您的 shell 配置文件中。
:::

现在激活您的虚拟环境。
在您的虚拟环境中，使用以下命令安装 Jupyter Notebook：

```python
pip install notebook
```

使用以下命令启动 Jupyter Notebook：

```python
jupyter notebook
```

新的浏览器窗口应在 `localhost:8888` 打开并显示 Jupyter 界面。
点击 `文件` > `新建` > `笔记本` 创建一个新的 Notebook。

<Image size="md" img={image_4} alt="创建新笔记本"/>

您将被提示选择一个内核。
选择您可用的任何 Python 内核，在此示例中我们将选择 `ipykernel`：

<Image size="md" img={image_5} alt="选择内核"/>

在一个空白单元格中，您可以输入以下命令安装 chDB，我们将使用它连接到我们的远程 ClickHouse Cloud 实例：

```python
pip install chdb
```

您现在可以导入 chDB，并运行一个简单的查询来检查一切是否设置正确：

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```

## 探索数据 {#exploring-the-data}

在设置好英国房产价格数据集并在 Jupyter Notebook 中运行 chDB 后，我们现在可以开始探索我们的数据。

我们假设我们有兴趣检查某个特定区域（例如首都伦敦）的价格随时间的变化。
ClickHouse 的 [`remoteSecure`](/sql-reference/table-functions/remote) 函数使您可以轻松从 ClickHouse Cloud 检索数据。
您可以指示 chDB 将此数据作为 Pandas 数据帧返回——这是一个方便且熟悉的数据处理方式。

编写以下查询以从您的 ClickHouse Cloud 服务中获取英国价格支付数据，并将其转换为 `pandas.DataFrame`：

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


# Load environment variables from .env file
load_dotenv()

username = os.environ.get('CLICKHOUSE_USER')
password = os.environ.get('CLICKHOUSE_PASSWORD')

query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
)
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""

df = chdb.query(query, "DataFrame")
df.head()
```

在上面的代码片段中，`chdb.query(query, "DataFrame")` 运行指定的查询，并将结果输出到终端作为 Pandas DataFrame。
在查询中，我们使用 `remoteSecure` 函数连接到 ClickHouse Cloud。
`remoteSecure` 函数接受以下参数：
- 连接字符串
- 要使用的数据库和表的名称
- 您的用户名
- 您的密码

作为安全最佳实践，您应该优先使用环境变量来设置用户名和密码参数，而不是直接在函数中指定，尽管如果您愿意，也可以这样做。

`remoteSecure` 函数连接到远程 ClickHouse Cloud 服务，运行查询并返回结果。
根据您的数据大小，这可能需要几秒钟。
在这种情况下，我们返回每年的平均价格点，并按 `town='LONDON'` 进行筛选。
结果然后存储为名为 `df` 的 DataFrame。

`df.head` 仅显示返回数据的前几行：

<Image size="md" img={image_6} alt="数据框预览"/>

在一个新的单元格中运行以下命令以检查列的类型：

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

注意到虽然在 ClickHouse 中 `date` 的类型是 `Date`，但在生成的数据框中它的类型是 `uint16`。
chDB 在返回 DataFrame 时会自动推断最合适的类型。

现在，我们的数据以熟悉的形式可用，让我们探索伦敦的房产价格随时间的变化。

在新单元格中，运行以下命令使用 matplotlib 绘制伦敦的时间与价格的简单图表：

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Price (£)')
plt.title('Price of London property over time')


# Show every 2nd year to avoid crowding
years_to_show = df['year'][::2]  # Every 2nd year
plt.xticks(years_to_show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<Image size="md" img={image_7} alt="数据框预览"/>

也许并不奇怪，伦敦的房产价格随着时间的大幅上涨。

一位同事数据科学家给我们发送了一个 .csv 文件，里面包含额外的与住房相关的变量，并对
伦敦的房屋销售数量随时间的变化感到好奇。
让我们将其中的一些与房价进行绘制，看看能否发现任何关联。

您可以使用 `file` 表引擎直接读取本地计算机上的文件。
在新单元格内，运行以下命令以从本地 .csv 文件创建一个新的 DataFrame。

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
```

<details>
<summary>一步读取多个源</summary>
也可以通过一步操作从多个源进行读取。您可以使用下面的查询，通过 `JOIN` 来实现：

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

<Image size="md" img={image_8} alt="数据框预览"/>

虽然我们缺少2020年以后的数据，但我们可以绘制1995年至2019年间的两个数据集。
在新单元格中运行以下命令：

```python

# Create a figure with two y-axes
fig, ax1 = plt.subplots(figsize=(14, 8))


# Plot houses sold on the left y-axis
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)


# Create a second y-axis for price data
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Average Price (£)', color=color)


# Plot price data up until 2019
ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Average Price', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# Format price axis with currency formatting
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# Set title and show every 2nd year
plt.title('London Housing Market: Sales Volume vs Prices Over Time', fontsize=14, pad=20)


# Use years only up to 2019 for both datasets
all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2]  # Every 2nd year
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# Add legends
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

plt.tight_layout()
plt.show()
```

<Image size="md" img={image_9} alt="远程数据集和本地数据集的绘图"/>

从绘制的数据中，我们看到在1995年，销售量约为160,000，并迅速激增，并在1999年达到峰值约540,000。
之后，销量在2000年代中期急剧下降，在2007-2008年金融危机期间大幅下跌，降至约140,000。
另一方面，价格从1995年的约150,000英镑稳步、持续增长，到2005年的约300,000英镑。
2012年后增长显著加速，从约400,000英镑迅速上升到2019年的超过1,000,000英镑。
与销售量不同，价格对2008年危机的影响微乎其微，保持了上涨的趋势。哦不！

## 总结 {#summary}

本指南展示了 chDB 如何通过将 ClickHouse Cloud 与本地数据源连接，实现 Jupyter Notebook 中无缝的数据探索。
通过使用英国房产价格数据集，我们展示了如何使用 `remoteSecure()` 函数查询远程 ClickHouse Cloud 数据，使用 `file()` 表引擎读取本地 CSV 文件，并直接将结果转换为 Pandas DataFrame 进行分析和可视化。
通过 chDB，数据科学家可以结合使用 ClickHouse 强大的 SQL 功能和熟悉的 Python 工具，如 Pandas 和 matplotlib，轻松结合多个数据源进行全面分析。

虽然许多位在伦敦的数据科学家可能无法在短期内负担得起自己的房屋或公寓，但至少他们可以分析将他们排除在外的市场！
