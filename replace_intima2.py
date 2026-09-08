import os
import glob

# Walk through src directory
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.md')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # specific replacements for leftover html spans and other text occurrences
                new_content = content.replace('Intima<span className="font-sans text-primary font-semibold">Health</span>', 'KELKAR MANAS HEALTH CLINIC')
                new_content = new_content.replace('INTIMA', 'KELKAR MANAS')
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
