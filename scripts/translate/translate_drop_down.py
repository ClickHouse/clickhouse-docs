import json

data = {
    "dropdownCategories": [
        {
            "type": "category",
            "label": "Getting Started",
            "description": "Learn how to use ClickHouse",
            "customProps": {
                "href": "/",
                "sidebar": "docs"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Introduction",
                    "description": "An introduction to ClickHouse",
                    "href": "/intro"
                },
                {
                    "type": "link",
                    "label": "Starter Guides",
                    "description": "Start here when learning ClickHouse",
                    "href": "/starter-guides"
                },
                {
                    "type": "link",
                    "label": "Concepts",
                    "description": "Core concepts to know",
                    "href": "/concepts"
                },
                {
                    "type": "link",
                    "label": "Migration Guides",
                    "description": "Migrate your database to ClickHouse",
                    "href": "/migrations/migrations"
                },
                {
                    "type": "link",
                    "label": "Use Case Guides",
                    "description": "Common use case guides for ClickHouse",
                    "href": "/use-cases"
                },
                {
                    "type": "link",
                    "label": "Example datasets",
                    "description": "Helpful datasets and tutorials",
                    "href": "/getting-started/example-datasets"
                }
            ]
        },
        {
            "type": "category",
            "label": "Cloud",
            "description": "The fastest way to deploy ClickHouse",
            "customProps": {
                "href": "/cloud/overview",
                "sidebar": "cloud"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Get Started",
                    "description": "Start quickly with ClickHouse Cloud",
                    "href": "/cloud/get-started/"
                },
                {
                    "type": "link",
                    "label": "Managing Cloud",
                    "description": "Manage your ClickHouse Cloud services",
                    "href": "/cloud/bestpractices"
                },
                {
                    "type": "link",
                    "label": "Cloud API",
                    "description": "Automate your ClickHouse Cloud services",
                    "href": "/cloud/manage/cloud-api/"
                },
                {
                    "type": "link",
                    "label": "Cloud Reference",
                    "description": "Understanding how ClickHouse Cloud works",
                    "href": "/cloud/reference/"
                },
                {
                    "type": "link",
                    "label": "Best Practices",
                    "description": "How to get the most out of ClickHouse Cloud",
                    "href": "/cloud/bestpractices/"
                },
                {
                    "type": "link",
                    "label": "Security",
                    "description": "Secure your ClickHouse Cloud services",
                    "href": "/cloud/security/"
                },
                {
                    "type": "link",
                    "label": "Migrating to Cloud",
                    "description": "Migrate your database to ClickHouse Cloud",
                    "href": "/integrations/migration"
                }
            ]
        },
        {
            "type": "category",
            "label": "Manage Data",
            "description": "How to manage data in ClickHouse",
            "customProps": {
                "href": "/updating-data",
                "sidebar": "managingData"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Core Data Concepts",
                    "description": "Understand internal concepts in ClickHouse",
                    "href": "/managing-data/core-concepts"
                },
                {
                    "type": "link",
                    "label": "Updating Data",
                    "description": "Updating and replacing data in ClickHouse",
                    "href": "/updating-data"
                },
                {
                    "type": "link",
                    "label": "Deleting data",
                    "description": "Deleting data in ClickHouse",
                    "href": "/managing-data/deleting-data/overview"
                },
                {
                    "type": "link",
                    "label": "Data Modeling",
                    "description": "Optimize your schema and data model",
                    "href": "/data-modeling/overview"
                },
                {
                    "type": "link",
                    "label": "Performance and Optimizations",
                    "description": "Guides to help you optimize ClickHouse",
                    "href": "/operations/overview"
                }
            ]
        },
        {
            "type": "category",
            "label": "Server Admin",
            "description": "Manage and deploy ClickHouse",
            "customProps": {
                "href": "/architecture/introduction",
                "sidebar": "serverAdmin"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Deployments and Scaling",
                    "description": "How to deploy ClickHouse",
                    "href": "/deployment-guides/index"
                },
                {
                    "type": "link",
                    "label": "Security and Authentication",
                    "description": "Secure your ClickHouse deployment",
                    "href": "/security-and-authentication"
                },
                {
                    "type": "link",
                    "label": "Settings",
                    "description": "Configure ClickHouse",
                    "href": "/operations/settings"
                },
                {
                    "type": "link",
                    "label": "Tools and Utilities",
                    "description": "Tools to help you manage ClickHouse",
                    "href": "/operations/utilities"
                },
                {
                    "type": "link",
                    "label": "System Tables",
                    "description": "Metadata tables to help you manage ClickHouse",
                    "href": "/operations/system-tables"
                }
            ]
        },
        {
            "type": "category",
            "label": "Reference",
            "description": "Reference documentation for ClickHouse features",
            "customProps": {
                "href": "/sql-reference",
                "sidebar": "sqlreference"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Introduction",
                    "description": "Learn ClickHouse syntax",
                    "href": "/sql-reference"
                },
                {
                    "type": "link",
                    "label": "Functions",
                    "description": "Hundreds of built-in functions to help you analyze your data",
                    "href": "/sql-reference/functions"
                },
                {
                    "type": "link",
                    "label": "Engines",
                    "description": "Use the right table and database engines for your data",
                    "href": "/engines"
                },
                {
                    "type": "link",
                    "label": "Other Features",
                    "description": "Learn about other features in ClickHouse",
                    "href": "/sql-reference/operators"
                }
            ]
        },
        {
            "type": "category",
            "label": "Integrations",
            "description": "Integrations, clients, and drivers to use with ClickHouse",
            "customProps": {
                "href": "/integrations",
                "sidebar": "integrations"
            },
            "items": [
                {
                    "type": "link",
                    "label": "All Integrations",
                    "description": "Integrate ClickHouse with other databases and applications",
                    "href": "/integrations"
                },
                {
                    "type": "link",
                    "label": "Language Clients",
                    "description": "Use your favorite language to work with ClickHouse",
                    "href": "/integrations/language-clients"
                },
                {
                    "type": "link",
                    "label": "ClickPipes",
                    "description": "The easiest way to ingest data into ClickHouse",
                    "href": "/integrations/clickpipes"
                },
                {
                    "type": "link",
                    "label": "Native Clients & Interfaces",
                    "description": "Choose a client and interface to connect to ClickHouse",
                    "href": "/interfaces/"
                },
                {
                    "type": "link",
                    "label": "Data Sources",
                    "description": "Load data into ClickHouse from your preferred source",
                    "href": "/integrations/index"
                },
                {
                    "type": "link",
                    "label": "Data Visualization",
                    "description": "Connect ClickHouse to your favorite visualization tool",
                    "href": "/integrations/data-visualization"
                },
                {
                    "type": "link",
                    "label": "Data Formats",
                    "description": "Explore data formats supported by ClickHouse",
                    "href": "/integrations/data-formats"
                },
                {
                    "type": "link",
                    "label": "Data Ingestion",
                    "description": "Ingest data into ClickHouse with a range of ELT tools",
                    "href": "/integrations/data-ingestion-overview"
                }
            ]
        },
        {
            "type": "category",
            "label": "chDB",
            "description": "chDB is an embedded version of ClickHouse",
            "customProps": {
                "href": "/chdb",
                "sidebar": "chdb"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Learn chDB",
                    "description": "Learn how to use chDB",
                    "href": "/chdb"
                },
                {
                    "type": "link",
                    "label": "Language Integrations",
                    "description": "Connect to chDB using a language client",
                    "href": "/chdb/install"
                },
                {
                    "type": "link",
                    "label": "Guides",
                    "description": "Guides to help you use chDB",
                    "href": "/chdb/guides"
                }
            ]
        },
        {
            "type": "category",
            "label": "About",
            "description": "Learn more about ClickHouse",
            "customProps": {
                "href": "/about-clickhouse",
                "sidebar": "aboutClickHouse"
            },
            "items": [
                {
                    "type": "link",
                    "label": "Adopters",
                    "description": "ClickHouse adopters",
                    "href": "/about-us/adopters"
                },
                {
                    "type": "link",
                    "label": "Changelogs",
                    "description": "View the latest changes in ClickHouse",
                    "href": "/whats-new/security-changelog"
                },
                {
                    "type": "link",
                    "label": "Support",
                    "description": "Get support from ClickHouse engineers",
                    "href": "/about-us/support"
                },
                {
                    "type": "link",
                    "label": "Development and Contributing",
                    "description": "Learn how to contribute to ClickHouse",
                    "href": "/development/developer-instruction"
                }
            ]
        }
    ]
}


def transform_dropdown_categories(data):
    transformed = {}

    for category in data.get("dropdownCategories", []):
        category_label = category["label"]

        # Category title
        transformed[f"sidebar.dropdownCategories.category.{category_label}"] = {
            "message": category_label,
            "description": category_label
        }

        # Category description
        if "description" in category:
            transformed[f"sidebar.dropdownCategories.category.description.{category_label}"] = {
                "message": category["description"],
                "description": category["description"]
            }

        # Process items in the category
        for item in category.get("items", []):
            item_label = item["label"]

            # Item title
            transformed[f"sidebar.dropdownCategories.category.{category_label}.{item_label}"] = {
                "message": item_label,
                "description": item_label
            }

            # Item description
            if "description" in item:
                transformed[f"sidebar.dropdownCategories.category.{category_label}.{item_label}.description"] = {
                    "message": item["description"],
                    "description": item["description"]
                }

    return transformed


# Transform and print result
transformed_json = transform_dropdown_categories(data)
print(json.dumps(transformed_json, indent=2, ensure_ascii=False))
