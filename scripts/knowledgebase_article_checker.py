#!/usr/bin/env python3
import argparse
import os
import yaml
import re
from termcolor import colored

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description="Script to check knowledge base articles have descriptions, are tagged, use only the allowed tags.",
    )
    parser.add_argument(
        "--kb-dir",
        help="Path to the directory of knowledgebase items to check",
    )
    return parser.parse_args()

def check_yaml_tags(directory, allowed_tags):

    correctly_tagged_files = []
    incorrectly_tagged_files = []

    for filename in os.listdir(directory):
        if filename.endswith(('.md', '.mdx')):
            filepath = os.path.join(directory, filename)

        try:
            with open(filepath, 'r') as file:
                content = file.read()
                # find the first frontmatter tag
                frontmatter_start = content.find('---\n')
                if frontmatter_start != -1:
                    # find the second frontmatter tag
                    frontmatter_end = content.find('---\n', frontmatter_start + 4)
                    if frontmatter_end != -1:
                        frontmatter_str = content[frontmatter_start+4:frontmatter_end]
                    try:
                        frontmatter_data = yaml.safe_load(frontmatter_str)
                        # check tags exist and are one of the allowed tags
                        is_correct = False

                        # check that KB articles are tagged with one of the correct tags
                        if 'tags' in frontmatter_data and frontmatter_data['tags'] is not None:
                            if all(tag in allowed_tags for tag in frontmatter_data['tags']):
                                is_correct = True
                            else:
                                is_correct = False

                        # check that KB articles have a description
                        if 'description' in frontmatter_data and frontmatter_data['description'] is not None:
                                is_correct = True
                        else:
                                is_correct = False

                        # check that KB articles contain the appropriate tags (given by pattern below) before the article content:

                        # {frontMatter.description}
                        # {/* truncate */}

                        pattern = r"\{frontMatter.description\}\n\{\/\* truncate \*\/\}\n"
                        if bool(re.search(pattern, content, flags=re.DOTALL)):
                            is_correct = True
                        else:
                            is_correct = False

                        # add filename as appropriate if issues occured
                        if is_correct is True:
                            correctly_tagged_files.append(filename)
                        else:
                            incorrectly_tagged_files.append(filename)

                    except yaml.YAMLError as e:
                        print(f"Error parsing YAML in '{filename}': {e}")
                        incorrectly_tagged_files.append(filename)
        except FileNotFoundError:
            print(f"File '{filename}' not found.")
            incorrectly_tagged_files.append(filename)
    return {'correctly_tagged': correctly_tagged_files, 'incorrectly_tagged': incorrectly_tagged_files}

def main():

    allowed_tags = \
        [
            'Concepts', 'Migrations', 'Use Cases', 'Best Practices', 'Managing Cloud',
            'Security and Authentication', 'Cloud Migration', 'Core Data Concepts', 'Managing Data',
            'Updating Data', 'Data Modelling', 'Deleting Data', 'Performance and Optimizations',
            'Server Admin', 'Deployments and Scaling', 'Settings', 'Tools and Utilities', 'System Tables',
            'Functions', 'Engines', 'Language Clients', 'ClickPipes', 'Native Clients and Interfaces',
            'Data Sources', 'Data Visualization', 'Data Formats', 'Data Ingestion', 'Data Export', 'chDB',
            'Errors and Exceptions', 'Community'
        ]

    args = parse_args()
    result = check_yaml_tags(args.kb_dir, allowed_tags)

    no_bad_articles = len(result["incorrectly_tagged"])
    if no_bad_articles != 0:
        print("Fail: found {} knowledgebase articles which either lack tags, use an incorrect tag, or are lacking a description:\n".format(len(result["incorrectly_tagged"])))
        for file in result['incorrectly_tagged']:
            print(colored(file, 'red'))
        print("\n")
        print("Please make sure knowledgebase articles are tagged with at least one of the following tags: \n")
        print(allowed_tags)
        return -1
    else:
        print(colored("Success: KB article tag checker did not find any articles missing tags.",'green'))
        return 1

if __name__ == "__main__":
    main()
