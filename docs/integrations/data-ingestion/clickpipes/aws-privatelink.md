---
sidebar_label: 'AWS PrivateLink for ClickPipes'
description: 'Establish a secure connection between ClickPipes and a data source using AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink for ClickPipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';

# AWS PrivateLink for ClickPipes

You can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to establish secure connectivity between VPCs,
AWS services, your on-premises systems, and ClickHouse Cloud without exposing traffic to the public Internet.

This document outlines the ClickPipes reverse private endpoint functionality
that allows setting up an AWS PrivateLink VPC endpoint.

## Supported AWS PrivateLink endpoint types {#aws-privatelink-endpoint-types}

ClickPipes reverse private endpoint can be configured with one of the following AWS PrivateLink approaches:

- [VPC resource](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK multi-VPC connectivity for MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC endpoint service](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

Follow the links above for detailed instructions on how to set up the respective AWS PrivateLink shares.

### VPC resource {#vpc-resource}

Your VPC resources can be accessed in ClickPipes using PrivateLink.
Resource configuration can be targeted with a specific host or RDS cluster ARN.
Cross-region is not supported.

See a [getting started](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html) guide for more details.

It's a preferred choice for Postgres CDC ingesting data from RDS cluster.

### MSK multi-VPC connectivity {#msk-multi-vpc}

The MSK multi-VPC is a built-in feature of AWS MSK that allows you to connect multiple VPCs to a single MSK cluster.
Private DNS support is out of the box and does not require any additional configuration.
Cross-region is not supported.

It is a recommended option for ClickPipes for MSK.
See the [getting started](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) guide for more details.

### VPC endpoint service {#vpc-endpoint-service}

VPC service is another approach to share your data source with ClickPipes.
It requires setting up a NLB (Network Load Balancer) in front of your data source
and configuring the VPC endpoint service to use the NLB.

VPC endpoint service can be [configured with a private DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html),
that will be accessible in a ClickPipes VPC.

Cross-region is supported.

It's a preferred choice for:
- any on-premise Kafka setup that requires private DNS support
- cross-region connectivity for Postgres CDC

Cross-region MSK cluster connectivity can be set up using VPC endpoint service as well.
Please reach out to the ClickHouse support team for assistance.

## Creating a ClickPipe with reverse private endpoint {#creating-clickpipe}

1. Access the SQL Console for your ClickHouse Cloud Service.

<Image img={cp_service} alt="ClickPipes service" size="md" border/>


2. Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. Select either Kafka or Postgres as a data source.

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. Select the `Reverse private endpoint` option.

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. Select any of existing reverse private endpoints or create a new one.

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. Provide the required parameters for the selected endpoint type.

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - For VPC resource, provide the configuration share ARN and configuration ID.
    - For MSK multi-VPC, provide the cluster ARN and authentication method used with a created endpoint.
    - For VPC endpoint service, provide the service name.

7. Click on `Create` and wait for the reverse private endpoint to be ready.

    If you are creating a new endpoint, it will take some time to set up the endpoint.
    The page will refresh automatically once the endpoint is ready.
    VPC endpoint service might require accepting the connection request in your AWS console.

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. Once the endpoint is ready, you can use a DNS name to connect to the data source.
   
    On a list of endpoints, you can see the DNS name for the available endpoint.
    It can be either an internally ClickPipes provisioned DNS name or a private DNS name supplied by a PrivateLink service.
    DNS name is not a complete network address.
    Add the port according to the data source.

    MSK connection string can be accessed in the AWS console.

    To see a full list of DNS names, access it in the cloud service settings.

## Managing existing reverse private endpoints {#managing-existing-endpoints}

You can manage existing reverse private endpoints in the ClickHouse Cloud service settings:

1. On a sidebar find the `Settings` button and click on it.

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. Click on `Reverse private endpoints` in a `ClickPipe reverse private endpoints` section.

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

    Reverse private endpoint extended information is shown in the flyout.

    Endpoint can be removed from here. It will affect any ClickPipes using this endpoint.

## Supported AWS regions {#aws-privatelink-regions}

The following AWS regions are supported for AWS PrivateLink:
- `us-east-1` - for ClickHouse services running in `us-east-1` region
- `eu-central-1` for ClickHouse services running in EU regions
- `us-east-2` - for ClickHouse services running everywhere else

This restriction does not apply to PrivateLink VPC endpoint service type since it supports cross-region connectivity.

## Limitations {#limitations}

AWS PrivateLink endpoints for ClickPipes created in ClickHouse Cloud are not guaranteed to be created
in the same AWS region as the ClickHouse Cloud service.

Currently, only VPC endpoint service supports
cross-region connectivity.

Private endpoints are linked to a specific ClickHouse service and are not transferable between services.
Multiple ClickPipes for a single ClickHouse service can reuse the same endpoint.
