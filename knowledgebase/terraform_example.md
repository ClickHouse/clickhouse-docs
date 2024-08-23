---
title: Terraform example on how to use Cloud API
description: "This covers an example of how you can use terraform to create/delete clusters using the API"
Date: 2023-09-02
---

### How can I use API to manage clusters on ClickHouse Cloud?

### Answer


We will use Terraform to configure our infra and [ClickHouse Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 

Steps:


1). Create an API Key on Cloud.
Follow the docs here - https://clickhouse.com/docs/en/cloud/manage/openapi

Save the creds locally. 

2). Install Terraform using - https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

You can use Homebrew package manager if you're on Mac. 

3). Create a directory anywhere you like: 

```
mkdir test
➜  test pwd
/Users/jaijhala/Desktop/terraform/test
```

4). Create 2 files: `main.tf` and `secret.tfvars`

Copy the following:

`main.tf` file would be:

```
terraform {
 required_providers {
   clickhouse = {
     source = "ClickHouse/clickhouse"
     version = "0.0.2"
   }
 }
}

variable "organization_id" {
  type = string
}

variable "token_key" {
  type = string
}

variable "token_secret" {
  type = string
}

provider clickhouse {
  environment 	= "production"
  organization_id = var.organization_id
  token_key   	= var.token_key
  token_secret	= var.token_secret
}


variable "service_password" {
  type = string
  sensitive   = true
}

resource "clickhouse_service" "service123" {
  name       	= "jai-terraform"
  cloud_provider = "aws"
  region     	= "us-east-2"
  tier       	= "development"
  idle_scaling   = true
  password  = var.service_password
  ip_access = [
	{
    	source  	= "0.0.0.0/0"
    	description = "Anywhere"
	}
  ]
}

output "CLICKHOUSE_HOST" {
  value = clickhouse_service.service123.endpoints.0.host
}
```

You can replace your own parameters like service name, region etc.. in the resources section above. 

`secret.tfvars` is where you'll put all the API Key related info that you downloaded earlier. The idea behind this file is that all your secret credentials will be hidden from the main config file.

It would be something like (replace these parameters):

```
organization_id = "e957a5f7-4qe3-4b05-ad5a-d02b2dcd0593"
token_key = "QWhhkMeytqQruTeKg"
token_secret = "4b1dNmjWdLUno9lXxmKvSUcPP62jvn7irkuZPbY"
service_password = "password123!"
```



5).  Run `terraform init` from this directory

Expected output: 

```
Initializing the backend...

Initializing provider plugins...
- Finding clickhouse/clickhouse versions matching "0.0.2"...
- Installing clickhouse/clickhouse v0.0.2...
- Installed clickhouse/clickhouse v0.0.2 (self-signed, key ID D7089EE5C6A92ED1)

Partner and community providers are signed by their developers.
If you'd like to know more about provider signing, you can read about it here:
https://www.terraform.io/docs/cli/plugins/signing.html

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

6). Run `terraform apply -var-file=secret.tfvars` command. 

Something like: 


```
➜  test terraform apply -var-file=secret.tfvars

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with
the following symbols:
  + create

Terraform will perform the following actions:

  # clickhouse_service.service123 will be created
  + resource "clickhouse_service" "service123" {
      + cloud_provider = "aws"
      + endpoints      = (known after apply)
      + id             = (known after apply)
      + idle_scaling   = true
      + ip_access      = [
          + {
              + description = "Anywhere"
              + source      = "0.0.0.0/0"
            },
        ]
      + last_updated   = (known after apply)
      + name           = "jai-terraform"
      + password       = (sensitive value)
      + region         = "us-east-2"
      + tier           = "development"
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + CLICKHOUSE_HOST = (known after apply)

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```


Type `yes` and hit enter

Side note: Notice it says `password       = (sensitive value)` above. 
This is because we set `sensitive   = true` for the password in the main.tf file. 

7). It will take a couple of mins to create the service but eventually it should come up like: 

```
  Enter a value: yes

clickhouse_service.service123: Creating...
clickhouse_service.service123: Still creating... [10s elapsed]
clickhouse_service.service123: Still creating... [20s elapsed]
clickhouse_service.service123: Still creating... [30s elapsed]
clickhouse_service.service123: Still creating... [40s elapsed]
clickhouse_service.service123: Still creating... [50s elapsed]
clickhouse_service.service123: Still creating... [1m0s elapsed]
clickhouse_service.service123: Still creating... [1m10s elapsed]
clickhouse_service.service123: Still creating... [1m20s elapsed]
clickhouse_service.service123: Still creating... [1m30s elapsed]
clickhouse_service.service123: Still creating... [1m40s elapsed]
clickhouse_service.service123: Creation complete after 1m41s [id=aa8d8d63-1878-4600-8470-630715af38ed]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

CLICKHOUSE_HOST = "h3ljlaqez6.us-east-2.aws.clickhouse.cloud"
➜  test
```

8). Check Cloud Console, you should be able to see the service created. 

9). To clean up/destroy the service again, run `terraform destroy -var-file=secret.tfvars`


Something like: 

```
Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with
the following symbols:
  - destroy

Terraform will perform the following actions:

  # clickhouse_service.service123 will be destroyed
  - resource "clickhouse_service" "service123" {
      - cloud_provider = "aws" -> null
      - ............

Plan: 0 to add, 0 to change, 1 to destroy.

Changes to Outputs:
  - CLICKHOUSE_HOST = "h3ljlaqez6.us-east-2.aws.clickhouse.cloud" -> null

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value:
```

Type yes and hit enter

10). 
```
clickhouse_service.service123: Destroying... [id=aa8d8d63-1878-4600-8470-630715af38ed]
clickhouse_service.service123: Still destroying... [id=aa8d8d63-1878-4600-8470-630715af38ed, 10s elapsed]
clickhouse_service.service123: Still destroying... [id=aa8d8d63-1878-4600-8470-630715af38ed, 20s elapsed]
clickhouse_service.service123: Destruction complete after 27s

Destroy complete! Resources: 1 destroyed.
```

And it should be gone from the Cloud Console. 

More details about the Cloud API can be found here - https://clickhouse.com/docs/en/cloud/manage/api/api-overview