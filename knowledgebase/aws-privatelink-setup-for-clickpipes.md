---
Date: 2024-11-27
---

# AWS PrivateLink setup to expose private RDS for ClickPipes

## Requirements
The VPC must be located in one of our ClickPipes regions: us-east-1, us-east-2 or eu-central-1.
(https://clickhouse.com/docs/en/integrations/clickpipes#list-of-static-ips)

The recommended approach for integrating RDS with ClickPipes is to utilize PrivateLink along with a Private Hosted Zone on the ClickPipes side. Once configured, all database connections initiated by ClickPipes will traverse through VPC endpoints, as the RDS instance's DNS names will resolve to the PrivateLink endpoint IP addresses. This setup requires the RDS instance to be accessible via unique DNS names. The DNS zone should be unique to avoid conflicts (e.g., myTestDB.123z8u.c2.rds.us-west-1.amazonaws.com).

## Private link creation
Follow these steps to create a **VPC endpoint service** for your RDS instance. Repeat these steps if you have multiple instances that require endpoint services:
1. Locate Your VPC and [Create an NLB](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/create-network-load-balancer.html)
    - Navigate to your target VPC and create a Network Load Balancer (NLB).
2. Configure the Target Group
    - The target group should point to the RDS instance's endpoint.
    - Ensure that the TCP protocol is used to avoid TLS termination by the NLB.
3. Set the Listener Port
    - The listener port of the load balancer must match the port used by the target group (typically 5432 for PostgreSQL or 3306 for MySQL).
4. Ensure the Load Balancer is Private
    - Configure the NLB to be private, ensuring it is only accessible within the VPC.
5. Create the VPC Endpoint Service
    - In the VPC, create an endpoint service that points to the NLB.
    - Enable acceptance of connection requests from specific accounts.
6. Authorize ClickPipes to Use the Endpoint Service
    - Grant permission to the ClickPipes account to request this endpoint service.
    - Configure allowed principals by adding the following principal ID: `arn:aws:iam::072088201116:root`

## Initiating connection
When it’s done, share details such as private DNS name, VPC service name and availability zone.
ClickPipes team will initiate VPC endpoints creation in ClickPipes VPC. This will require [connection request acceptance](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#accept-reject-connection-requests) on your side.

## Creating ClickPipes
Use your RDS's private DNS endpoints to create your ClickPipes.