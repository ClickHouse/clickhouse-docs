---
slug: /cloud/manage/postman
sidebar_label: Programmatic API access with Postman
title: Programmatic API access with Postman
---

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

### Create an account {#create-an-account}
* Free accounts are available at [https://www.postman.com](https://www.postman.com).

<img src={postman1} alt="Postman site"/>

### Create a Workspace {#create-a-workspace}
* Name your workspace and set the visibility level. 

<img src={postman2} alt="Create workspace"/>

### Create a Collection {#create-a-collection}
* Below "Explore" on the top left Menu click "Import": 

<img src={postman3} alt="Explore > Import"/>

* A modal will appear:

<img src={postman4} alt="API URL entry"/>

* Enter the API address: "https://api.clickhouse.cloud/v1" and press 'Enter':

<img src={postman5} alt="Import"/>

* Select "Postman Collection" by clicking on the "Import" button:

<img src={postman6} alt="Collection > Import"/>

### Interface with the ClickHouse Cloud API spec {#interface-with-the-clickhouse-cloud-api-spec}
* The "API spec for ClickHouse Cloud" will now appear within "Collections" (Left Navigation).

<img src={postman7} alt="Import your API"/>

* Click on "API spec for ClickHouse Cloud." From the middle pain select the ‘Authorization’ tab:

<img src={postman8} alt="Import complete"/>

### Set Authorization {#set-authorization}
* Toggle the dropdown menu to select "Basic Auth":

<img src={postman9} alt="Basic auth"/>

* Enter the Username and Password received when you set up your ClickHouse Cloud API keys:

<img src={postman10} alt="credentials"/>

### Enable Variables {#enable-variables}
* [Variables](https://learning.postman.com/docs/sending-requests/variables/) enable the storage and reuse of values in Postman allowing for easier API testing.
#### Set the Organization ID and Service ID {#set-the-organization-id-and-service-id}
* Within the "Collection", click the "Variable" tab in the middle pane (The Base URL will have been set by the earlier API import):
* Below `baseURL` click the open field "Add new value", and Substitute your organization ID and service ID:

<img src={postman11} alt="Organization ID and Service ID"/>


## Test the ClickHouse Cloud API functionalities {#test-the-clickhouse-cloud-api-functionalities}
### Test "GET list of available organizations" {#test-get-list-of-available-organizations}
* Under the "OpenAPI spec for ClickHouse Cloud", expand the folder > V1 > organizations
* Click "GET list of available organizations" and press the blue "Send" button on the right:

<img src={postman12} alt="Test retrieval of organizations"/>

* The returned results should deliver your organization details with "status": 200. (If you receive a "status" 400 with no organization information your configuration is not correct).

<img src={postman13} alt="Status"/>

### Test "GET organizational details" {#test-get-organizational-details}
* Under the `organizationid` folder, navigate to "GET organizational details":
* In the middle frame menu under Params an `organizationid` is required.

<img src={postman14} alt="Test retrieval of organization details"/>

* Edit this value with `orgid` in curly braces `{{orgid}}` (From setting this value earlier a menu will appear with the value):

<img src={postman15} alt="Submit test"/>

* After pressing the "Save" button, press the blue "Send" button at the top right of the screen.

<img src={postman16} alt="Return value"/>

* The returned results should deliver your organization details with "status": 200. (If you receive a "status" 400 with no organization information your configuration is not correct).

### Test "GET service details" {#test-get-service-details}
* Click "GET service details"
* Edit the Values for `organizationid` and `serviceid` with `{{orgid}}` and `{{serviceid}}` respectively.
* Press "Save" and then the blue "Send" button on the right.

<img src={postman17} alt="List of services"/>

* The returned results should deliver a list of your services and their details with "status": 200. (If you receive a "status" 400 with no service(s) information your configuration is not correct).

