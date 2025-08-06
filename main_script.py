import openpyxl

#open excel
def main_script(input_file, output_file):
    wb = openpyxl.Workbook()
    ws = wb.active

    #open input.txt and read all non empty line
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines, start=1):
                values = line.strip().split(',')
                for j, value in enumerate(values, start=1):
                    ws.cell(row=i, column=j).value = value
        #generate output    
        wb.save(output_file)
        print(f"Excel file saved as: {output_file}") 

    #incase of error
    except FileNotFoundError:
        print("Input file not found. Make sure input.txt exists.")
    except Exception as e:
        print(f"An error occured: {e}")

#end
if __name__ == "__main__":
    main_script("input.txt", "output.xslx")