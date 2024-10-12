import os
import base64

def convert_images_to_base64(directory_path):
    # Get all PNG files in the directory
    png_files = [f for f in os.listdir(directory_path) if f.endswith('.png')]
    
    # Create a dictionary to store base64 representations
    base64_images = {}

    for png_file in png_files:
        file_path = os.path.join(directory_path, png_file)
        with open(file_path, 'rb') as image_file:
            # Read the file and convert it to base64
            base64_data = base64.b64encode(image_file.read()).decode('utf-8')
            base64_images[png_file] = base64_data

    return base64_images

# Example usage
directory = './neo'
base64_images_dict = convert_images_to_base64(directory)

print("{")
# Print the base64 string for each image
for image_name, base64_string in base64_images_dict.items():
    name = image_name.split(".")[0]
    print('"%s":"data:image/png;base64, %s",' % (name, base64_string))  # Print the first 50 characters of the base64 string
print("}")