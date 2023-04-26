---
slug: /en/cloud/manage/postman
sidebar_label: Programmatic API access with Postman
title: Programmatic API access with Postman
---

This guide will help you test the ClickHouse Cloud API using [Postman](https://www.postman.com/product/what-is-postman/). 
The Postman Application is available for use within a web browser or can be downloaded to a desktop.

### Create an account
* Free accounts are available at [https://www.postman.com](https://www.postman.com).
![Postman site](@site/docs/en/cloud/manage/images/postman/postman1.png)

### Create a Workspace 
* Name your workspace and set the visibility level. 
![Create workspace](@site/docs/en/cloud/manage/images/postman/postman2.png)

### Create a Collection 
* Below “Explore” on the top left Menu click “Import”: 
![Explore > Import](@site/docs/en/cloud/manage/images/postman/postman3.png)

* A modal will appear:
![API URL entry](@site/docs/en/cloud/manage/images/postman/postman4.png)

* Enter the API address: “https://api.clickhouse.cloud/v1” and press 'Enter':
![Import](@site/docs/en/cloud/manage/images/postman/postman5.png)

* Select “Postman Collection” by clicking on the “Import” button:
![Collection > Import](@site/docs/en/cloud/manage/images/postman/postman6.png)

### Interface with the ClickHouse Cloud API spec
* The “API spec for ClickHouse Cloud” will now appear within “Collections” (Left Navigation).
![Import your API](@site/docs/en/cloud/manage/images/postman/postman7.png)

* Click on “API spec for ClickHouse Cloud.” From the middle pain select the ‘Authorization’ tab:
![Import complete](@site/docs/en/cloud/manage/images/postman/postman8.png)

### Set Authorization
* Toggle the dropdown menu to select “Basic Auth”:
![Basic auth](@site/docs/en/cloud/manage/images/postman/postman9.png)

* Enter the Username and Password received when you set up your ClickHouse Cloud API keys:
![credentials](@site/docs/en/cloud/manage/images/postman/postman10.png)

### Enable Variables
* [Variables](https://learning.postman.com/docs/sending-requests/variables/) enable the storage and reuse of values in Postman allowing for easier API testing.
#### Set the Organization ID and Service ID
* Within the “Collection”, click the “Variable” tab in the middle pane (The Base URL will have been set by the earlier API import):
* Below “baseURL” click the open field “Add new value”, and Substitute your organization ID and service ID:
![Organization ID and Service ID](@site/docs/en/cloud/manage/images/postman/postman11.png)

## Test the ClickHouse Cloud API functionalities
### Test "GET list of available organizations"
* Under the “OpenAPI spec for ClickHouse Cloud”, expand the folder > V1 > organizations
* Click “GET list of available organizations” and press the blue "Send" button on the right:
![Test retrieval of organizations](@site/docs/en/cloud/manage/images/postman/postman12.png)
* The returned results should deliver your organization details with “status”: 200. (If you receive a “status” 400 with no organization information your configuration is not correct).
![Status](@site/docs/en/cloud/manage/images/postman/postman13.png)

### Test "GET organizational details"
* Under the organizationid folder, navigate to “GET organizational details”:
* In the middle frame menu under Params an organizationid is required.
![Test retrieval of organization details](@site/docs/en/cloud/manage/images/postman/postman14.png)
* Edit this value with "orgid" in curly braces "{{orgid}}" (From setting this value earlier a menu will appear with the value):
![Submit test](@site/docs/en/cloud/manage/images/postman/postman15.png)
* After pressing the "Save" button, press the blue "Send" button at the top right of the screen.
![Return value](@site/docs/en/cloud/manage/images/postman/postman16.png)
* The returned results should deliver your organization details with “status”: 200. (If you receive a “status” 400 with no organization information your configuration is not correct).

### Test "GET service details"
* Click “GET service details”
* Edit the Values for organizationid and serviceid with {{orgid}} and {{serviceid}} respectively.
* Press “Save” and then the blue “Send” button on the right.
![List of services](@site/docs/en/cloud/manage/images/postman/postman17.png)
* The returned results should deliver a list of your services and their details with “status”: 200. (If you receive a “status” 400 with no service(s) information your configuration is not correct).

