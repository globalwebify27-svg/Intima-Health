import os
import re

dir_path = "/Users/ahmadsana/Documents/intima-health/src"

image_tag_pattern = re.compile(r'(<Image\b[^>]*?)(/?>)', re.DOTALL)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            def replace_fn(match):
                inner = match.group(1)
                closing = match.group(2)
                # If it has fill but no sizes
                if re.search(r'\bfill\b', inner) and not re.search(r'\bsizes=', inner):
                    return inner + ' sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" ' + closing
                return match.group(0)
            
            new_content = image_tag_pattern.sub(replace_fn, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
