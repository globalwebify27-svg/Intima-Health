import os
import re

files_to_check = [
    "src/app/(public)/checkout/page.tsx",
    "src/app/(public)/register/page.tsx",
    "src/app/(public)/login/page.tsx",
    "src/app/(auth)/staff-login/page.tsx",
    "src/components/layout/Header.tsx",
    "src/components/layout/Sidebar.tsx"
]

pattern = re.compile(r'className="h-10 w-auto object-contain"', re.DOTALL)
replacement = 'className="h-14 w-auto object-contain"'

for filepath in files_to_check:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        new_content = pattern.sub(replacement, content)
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Processed {filepath}")
    else:
        print(f"File not found: {filepath}")
