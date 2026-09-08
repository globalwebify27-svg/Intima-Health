import os
import glob

replacements = {
    'doctor@intimahealth.com': 'doctor@kelkarmanas.com',
    'pune@intima.health': 'pune@kelkarmanas.com',
    'staff@intima.health': 'staff@kelkarmanas.com',
    'admin@intima.health': 'admin@kelkarmanas.com'
}

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.md')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
            except Exception as e:
                pass
