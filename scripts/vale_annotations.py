#!/usr/bin/env python3

import json
import argparse
import sys

def process_data(data):
    logs = []
    for line in data.splitlines():
        try:
            line_array = (line.split(':', 5))
            logs.append({
                'Filename': line_array[0],
                'Severity': line_array[3],
                'Check': line_array[4],
                'Line': int(line_array[1]),
                'Col': int(line_array[2]),
                'Message': line_array[5]
            })
        except: print('Did not process line: ', line)
    return logs

# Compares the Vale log data to the git data and returns the GitHub annotation
def compare_log(filename_log, log_data):
    severity = log_data.get('Severity')
    line = log_data.get('Line')
    title = log_data.get('Check')
    message = log_data.get('Message')
    col = log_data.get('Col')
    match severity:
        case 'suggestion': level = 'notice'
        case 'warning': level = 'warning'
        case 'error': level = 'error'
    if level == 'notice':
        message = 'Suggestion: ' + message

    command = f"::file={filename_log},line={line},col={col},title={title}::{message}"
    error_present = True if level == 'error' else False
    return command, error_present

if __name__ == '__main__':
    log_list = []
    error_list = []
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', help='An array of dictionaries mapping a filename to changed lines. ([{filename: [lines_changed]}])', type=str)
    args = parser.parse_args()
    git_data = json.loads(args.data)

    with open('vale_output.log') as f:
        vale_logs = process_data(f.read())

    if vale_logs:
        for entry in vale_logs:
            vale_filename = entry['Filename']
            line = entry['Line']
            for git_filename, git_line_data in git_data.items():
                if vale_filename == git_filename and line in git_line_data:
                    try:
                        annotation, error_present = compare_log(git_filename, entry)
                        log_list.append(annotation)
                        error_list.append(error_present)
                    except:
                        raise Exception(f'Failed to parse log entry for {git_filename}')

        for entry in log_list:
            print(entry)

        if any(error_list):
            print("\nYour PR contains a style error flagged by Vale. "
                  "Please see comments in your PR.")
            sys.exit(1)
