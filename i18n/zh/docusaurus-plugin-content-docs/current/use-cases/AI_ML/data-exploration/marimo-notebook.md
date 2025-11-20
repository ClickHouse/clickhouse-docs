---
slug: /use-cases/AI/marimo-notebook
sidebar_label: '使用 Marimo 笔记本和 chDB 探索数据'
title: '使用 Marimo 笔记本和 chDB 探索数据'
description: '本指南介绍如何在 Marimo 笔记本中配置并使用 chDB，以探索来自 ClickHouse Cloud 或本地文件的数据'
keywords: ['ML', 'Marimo', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/Marimo/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/Marimo/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/Marimo/7.gif';
import image_8 from '@site/static/images/use-cases/AI_ML/Marimo/8.gif';

在本指南中，你将学习如何在 Marimo 笔记本中，借助 [chDB](/docs/chdb)（由 ClickHouse 驱动的高速进程内 SQL OLAP 引擎），探索 ClickHouse Cloud 上的数据集。

**先决条件：**

* Python 3.8 或更高版本
* 一个虚拟环境
* 一个可用的 ClickHouse Cloud 服务以及你的[连接信息](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
如果你还没有 ClickHouse Cloud 账户，可以[注册](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb)试用，获得 300 美元的免费额度开始使用。
:::

**你将学到：**

* 使用 chDB 在 Marimo 笔记本中连接到 ClickHouse Cloud
* 查询远程数据集并将结果转换为 Pandas DataFrame
* 在 Marimo 中使用 Plotly 可视化数据
* 利用 Marimo 的响应式执行模型进行交互式数据探索

我们将使用英国房产价格数据集，它作为入门数据集之一托管在 ClickHouse Cloud 上。
该数据集包含了 1995 年到 2024 年间英国房屋成交价格相关的数据。


## 设置 {#setup}

### 加载数据集 {#loading-the-dataset}

要将此数据集添加到现有的 ClickHouse Cloud 服务,请使用您的账户信息登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)。

在左侧菜单中,点击 `Data sources`,然后点击 `Predefined sample data`:

<Image size='md' img={image_1} alt='添加示例数据集' />

在 UK property price paid data (4GB) 卡片中选择 `Get started`:

<Image size='md' img={image_2} alt='选择英国房价数据集' />

然后点击 `Import dataset`:

<Image size='md' img={image_3} alt='导入英国房价数据集' />

ClickHouse 将自动在 `default` 数据库中创建 `pp_complete` 表,并填充 2892 万行价格数据。

为了降低凭据泄露的风险,我们建议您将 Cloud 用户名和密码添加为本地机器上的环境变量。
在终端中运行以下命令,将用户名和密码添加为环境变量:

### 设置凭据 {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
上述环境变量仅在终端会话期间有效。
要永久设置,请将其添加到您的 shell 配置文件中。
:::

### 安装 Marimo {#installing-marimo}

现在激活您的虚拟环境。
在虚拟环境中,安装本指南将使用的以下软件包:

```python
pip install chdb pandas plotly marimo
```

使用以下命令创建一个新的 Marimo notebook:

```bash
marimo edit clickhouse_exploration.py
```

将打开一个新的浏览器窗口,显示 localhost:2718 上的 Marimo 界面:

<Image size='md' img={image_4} alt='Marimo 界面' />

Marimo notebook 以纯 Python 文件形式存储,便于进行版本控制和与他人共享。


## 安装依赖项 {#installing-dependencies}

在新单元格中导入所需的包:

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

将鼠标悬停在单元格上时,会看到两个带有"+"符号的圆圈。
点击它们即可添加新单元格。

添加一个新单元格并运行简单查询,以检查所有配置是否正确:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

您应该会在刚运行的单元格下方看到结果:

<Image size='md' img={image_5} alt='Marimo hello world' />


## 探索数据 {#exploring-the-data}

在 Marimo notebook 中配置好英国房价数据集并启动 chDB 后,我们现在可以开始探索数据了。
假设我们想要查看英国特定地区(如首都伦敦)的房价随时间的变化情况。
ClickHouse 的 [`remoteSecure`](/docs/sql-reference/table-functions/remote) 函数可以让您轻松从 ClickHouse Cloud 检索数据。
您可以指示 chDB 在进程内将数据作为 Pandas 数据框返回——这是一种便捷且熟悉的数据处理方式。

### 查询 ClickHouse Cloud 数据 {#querying-clickhouse-cloud-data}

创建一个新单元格,使用以下查询从您的 ClickHouse Cloud 服务获取英国房价数据并将其转换为 `pandas.DataFrame`:

```python
query = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
"""

df = chdb.query(query, "DataFrame")
df.head()
```

在上面的代码片段中,`chdb.query(query, "DataFrame")` 执行指定的查询并将结果输出为 Pandas DataFrame。

在查询中,我们使用 [`remoteSecure`](/sql-reference/table-functions/remote) 函数连接到 ClickHouse Cloud。

`remoteSecure` 函数接受以下参数:

- 连接字符串
- 要使用的数据库和表名称
- 您的用户名
- 您的密码

作为安全最佳实践,建议使用环境变量来传递用户名和密码参数,而不是直接在函数中指定,尽管后者也是可行的。

`remoteSecure` 函数连接到远程 ClickHouse Cloud 服务,执行查询并返回结果。
根据数据量大小,这可能需要几秒钟时间。

在本例中,我们返回每年的平均价格,并按 `town='LONDON'` 进行过滤。
结果随后作为 DataFrame 存储在名为 `df` 的变量中。

### 可视化数据 {#visualizing-the-data}

现在数据已经以熟悉的形式呈现,让我们来探索伦敦房产价格如何随时间变化。

Marimo 与 Plotly 等交互式绘图库配合得特别好。
在新单元格中,创建一个交互式图表:

```python
fig = px.line(
    df,
    x='year',
    y='price',
    title='Average Property Prices in London Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

不出所料,伦敦的房产价格随着时间推移大幅上涨。

<Image size='md' img={image_6} alt='Marimo 数据可视化' />

Marimo 的优势之一是其响应式执行模型。让我们创建一个交互式组件来动态选择不同的城镇。

### 交互式城镇选择 {#interactive-town-selection}

在新单元格中,创建一个下拉菜单来选择不同的城镇:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Select a town:'
)
town_selector
```

在另一个单元格中,创建一个响应城镇选择的查询。当您更改下拉菜单时,此单元格将自动重新执行:

```python
query_reactive = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = '{town_selector.value}'
GROUP BY year
ORDER BY year
"""

df_reactive = chdb.query(query_reactive, "DataFrame")
df_reactive
```

现在创建一个在您更改城镇时自动更新的图表。
您可以将图表移动到动态数据框上方,使其显示在带有下拉菜单的单元格下方。


```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'{town_selector.value}房产平均价格随时间变化趋势',
    labels={'price': '平均价格 (£)', 'year': '年份'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

现在从下拉菜单中选择城镇时,图表会动态更新:

<Image size='md' img={image_7} alt='Marimo dynamic chart' />

### 使用交互式箱线图探索价格分布 {#exploring-price-distributions}

让我们通过分析伦敦不同年份的房产价格分布来深入挖掘数据。
箱线图将展示中位数、四分位数和离群值,相比仅查看平均价格能让我们获得更全面的理解。
首先,创建一个年份滑块来交互式地探索不同年份的数据:

在新单元格中添加以下代码:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='选择年份:',
    show_value=True
)
year_slider
```

现在查询所选年份的各个房产价格。
注意这里不进行聚合——我们需要所有单独的交易记录来构建分布:

```python
query_distribution = f"""
SELECT
    price,
    toYear(date) AS year
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
  AND toYear(date) = {year_slider.value}
  AND price > 0
  AND price < 5000000
"""

df_distribution = chdb.query(query_distribution, "DataFrame")

```


# 创建交互式箱线图。

fig&#95;box = go.Figure()

fig&#95;box.add&#95;trace(
go.Box(
y=df&#95;distribution[&#39;price&#39;],
name=f&#39;London {year_slider.value}&#39;,
boxmean=&#39;sd&#39;,  # 显示均值和标准差
marker&#95;color=&#39;lightblue&#39;,
boxpoints=&#39;outliers&#39;  # 显示离群点
)
)

fig&#95;box.update&#95;layout(
title=f&#39;Distribution of Property Prices in London ({year_slider.value})&#39;,
yaxis=dict(
title=&#39;Price (£)&#39;,
tickformat=&#39;,.0f&#39;
),
showlegend=False,
height=600
)

fig&#95;box

```
点击单元格右上角的选项按钮,即可隐藏代码。
移动滑块时,图表将自动更新,这得益于 Marimo 的响应式执行机制:

<Image size="md" img={image_8} alt="Marimo 动态图表"/>
```


## 总结 {#summary}

本指南演示了如何使用 chDB 在 Marimo notebook 中探索 ClickHouse Cloud 的数据。
我们以英国房产价格数据集为例,展示了如何通过 `remoteSecure()` 函数查询远程 ClickHouse Cloud 数据,并将查询结果直接转换为 Pandas DataFrame 以便进行分析和可视化。
借助 chDB 和 Marimo 的响应式执行模型,数据科学家可以充分利用 ClickHouse 强大的 SQL 能力,同时结合 Pandas 和 Plotly 等熟悉的 Python 工具。此外,交互式组件和自动依赖追踪功能使探索性分析变得更加高效且易于复现。
