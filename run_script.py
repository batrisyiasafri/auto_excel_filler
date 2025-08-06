import sys
import os
from main_script1 import main_script1 #import from actual main script

def get_user_input():
    print("Enter your data line by line. Type 'DONE' when finished: ")
    lines = []
    while True:
        line = input()
        if line.strip().upper() == "DONE":
            break
        if line.strip():
            lines.append(line.strip())
    return lines

def save_to_temp_file(lines, filename="temp_input.txt"):
    with open(filename, 'w') as f:
       for line in lines:
           f.write(line + '\n')
    return filename

def main():
    if len(sys.argv) == 3:
        input_file = sys.argv[1]
        output_file = sys.argv[2]

        if not os.path.isfile(input_file):
            print(f"The input file '{input_file}' was not found.")
            return
        
        main_script1(input_file, output_file)


    else:
        print("No input/output files given. Enter again.")
        user_lines = get_user_input()

        if not user_lines:
            print("No data entered. Exiting.")
            return
        
        temp_input_file = save_to_temp_file(user_lines)
        output_file = input("Enter filename (e.g. output.xslx): ").strip()
        if not output_file.endswith('.xslx'):
            output_file += '.xlsx'


        main_script1(temp_input_file, output_file)





#end
if __name__ == '__main__':
    main()









## previous script
# input_file = "input.txt"
# output_file = "output.xlsx"

# def main():
#     if len(sys.argv) < 3:
#         print("Usage: python run_script.py input.txt output.xslx")
#         input_file = input("Enter input text filename: ").strip()
#         output_file = input("Enter output Excel filename: ").strip()
#     else:
#         input_file = sys.argv[1]
#         output_file = sys.argv[2]

#     if not os.path.isfile(input_file):
#         print(f"The input file '{input_file}' was not found.")
#         return
    
#     main_script1(input_file, output_file)