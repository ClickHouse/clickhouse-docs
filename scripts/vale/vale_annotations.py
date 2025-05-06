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

# Compares git log data and vale log data and returns the GitHub annotations
def compare_log(git_filename, vale_log):
    severity = vale_log.get('Severity')
    line = vale_log.get('Line')
    column = vale_log.get('Col')
    title = vale_log.get('Check')
    message = vale_log.get('Message')
    # Convert vale severity to Github annotation level
    match severity:
        case 'suggestion': level = 'notice'
        case 'warning': level = 'warning'
        case 'error': level = 'error'
    if level == 'notice':
        message = 'Suggestion: ' + message

    command = f"::{level} file={git_filename},line={line},col={column},title={title}::{message}"
    error_present = True if severity == 'error' else False
    return command, error_present

if __name__ == '__main__':
    log_list = []
    error_list = []
    parser = argparse.ArgumentParser()
    parser.add_argument('--git-log-file', help='Path to JSON file with changed lines data', type=str)
    parser.add_argument('--vale-log-file', help='Path to Vale output log file', type=str)
    args = parser.parse_args()

    with open(args.git_log_file, 'r') as f:
        git_data = json.load(f)
    
    vale_logs = None
    if os.path.exists(args.vale_log_file):
        with open(args.vale_log_file, 'r') as f:
            vale_logs = process_data(f.read())

    if vale_logs:
        for vale_log in vale_logs:
            vale_filename = vale_log['Filename']
            line = vale_log['Line']

            for item in git_data:
                git_filename = item['filename']
                git_line_data = item['changed_lines']
                if vale_filename == git_filename and line in git_line_data:
                    try:
                        annotation, error_present = compare_log(git_filename, vale_log)
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
