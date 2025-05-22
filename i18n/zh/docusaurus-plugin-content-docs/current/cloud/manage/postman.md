---
'slug': '/cloud/manage/postman'
'sidebar_label': '使用 Postman 的编程 API 访问'
'title': '使用 Postman 的编程 API 访问'
'description': '本指南将帮助您使用 Postman 测试 ClickHouse Cloud API'
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman5 from '@site/static/images/cloud/manage/postman/postman5.png';
import postman6 from '@site/static/images/cloud/manage/postman/postman6.png';
import postman7 from '@site/static/images/cloud/manage/postman/postman7.png';
import postman8 from '@site/static/images/cloud/manage/postman/postman8.png';
import postman9 from '@site/static/images/cloud/manage/postman/postman9.png';
import postman10 from '@site/static/images/cloud/manage/postman/postman10.png';
import postman11 from '@site/static/images/cloud/manage/postman/postman11.png';
import postman12 from '@site/static/images/cloud/manage/postman/postman12.png';
import postman13 from '@site/static/images/cloud/manage/postman/postman13.png';
import postman14 from '@site/static/images/cloud/manage/postman/postman14.png';
import postman15 from '@site/static/images/cloud/manage/postman/postman15.png';
import postman16 from '@site/static/images/cloud/manage/postman/postman16.png';
import postman17 from '@site/static/images/cloud/manage/postman/postman17.png';

This guide will help you test the ClickHouse Cloud API using [Postman](https://www.postman.com/product/what-is-postman/). 
The Postman Application is available for use within a web browser or can be downloaded to a desktop.

### 创建账户 {#create-an-account}
* 免费账户可在 [https://www.postman.com](https://www.postman.com) 获取。

<Image img={postman1} size="md" alt="Postman site" border/>

### 创建工作区 {#create-a-workspace}
* 命名您的工作区并设置可见性级别。

<Image img={postman2} size="md" alt="Create workspace" border/>

### 创建集合 {#create-a-collection}
* 在左上角菜单的“Explore”下点击“Import”：

<Image img={postman3} size="md" alt="Explore > Import" border/>

* 会弹出一个模态框：

<Image img={postman4} size="md" alt="API URL entry" border/>

* 输入API地址：“https://api.clickhouse.cloud/v1”并按‘Enter’：

<Image img={postman5} size="md" alt="Import" border/>

* 选择“Postman Collection”，点击“Import”按钮：

<Image img={postman6} size="md" alt="Collection > Import" border/>

### 与 ClickHouse Cloud API 规范接口 {#interface-with-the-clickhouse-cloud-api-spec}
* “ClickHouse Cloud 的 API 规范”现在会出现在“Collections”（左侧导航）中。

<Image img={postman7} size="md" alt="Import your API" border/>

* 点击“API spec for ClickHouse Cloud”。在中间面板选择“Authorization”标签：

<Image img={postman8} size="md" alt="Import complete" border/>

### 设置授权 {#set-authorization}
* 切换下拉菜单选择“Basic Auth”：

<Image img={postman9} size="md" alt="Basic auth" border/>

* 输入您在设置 ClickHouse Cloud API 密钥时收到的用户名和密码：

<Image img={postman10} size="md" alt="credentials" border/>

### 启用变量 {#enable-variables}
* [变量](https://learning.postman.com/docs/sending-requests/variables/) 使得在 Postman 中存储和重用值成为可能，从而使 API 测试更加容易。
#### 设置组织 ID 和服务 ID {#set-the-organization-id-and-service-id}
* 在“集合”中，点击中间面板的“Variable”标签（Base URL 会通过之前的 API 导入进行设置）：
* 在 `baseURL` 下点击打开字段“添加新值”，替换为您的组织 ID 和服务 ID：

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>


## 测试 ClickHouse Cloud API 功能 {#test-the-clickhouse-cloud-api-functionalities}
### 测试“获取可用组织列表” {#test-get-list-of-available-organizations}
* 在“OpenAPI spec for ClickHouse Cloud”下，展开文件夹 > V1 > organizations
* 点击“GET list of available organizations”，然后按右侧的蓝色“Send”按钮：

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* 返回结果应显示您的组织详细信息，"status": 200。（如果收到"status" 400且没有组织信息，则您的配置不正确）。

<Image img={postman13} size="md" alt="Status" border/>

### 测试“获取组织详细信息” {#test-get-organizational-details}
* 在 `organizationid` 文件夹中，导航到“GET organizational details”：
* 在中间框架菜单下的参数中，需要一个 `organizationid`。

<Image img={postman14} size="md" alt="Test retrieval of organization details" border/>

* 将此值编辑为 `orgid`，使用大括号 `{{orgid}}`（设置此值后，菜单将出现该值）：

<Image img={postman15} size="md" alt="Submit test" border/>

* 按下“Save”按钮后，按右上角的蓝色“Send”按钮。

<Image img={postman16} size="md" alt="Return value" border/>

* 返回结果应显示您的组织详细信息，"status": 200。（如果收到 "status" 400 且没有组织信息，则您的配置不正确）。

### 测试“获取服务详细信息” {#test-get-service-details}
* 点击“GET service details”
* 将 `organizationid` 和 `serviceid` 的值编辑为 `{{orgid}}` 和 `{{serviceid}}`。
* 按“Save”，然后点击右侧的蓝色“Send”按钮。

<Image img={postman17} size="md" alt="List of services" border/>

* 返回结果应返回您的服务及其详细信息的列表，"status": 200。（如果收到"status" 400且没有服务信息，则您的配置不正确）。
