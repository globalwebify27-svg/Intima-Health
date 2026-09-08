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
                
                # We need to replace IntimaHealth and Intima Health and Intima (where appropriate)
                # But we should be careful about variable names and database URIs.
                # Let's replace the display text first.
                
                new_content = content.replace("Intima Health", "KELKAR MANAS HEALTH CLINIC")
                new_content = new_content.replace("IntimaHealth", "KELKAR MANAS HEALTH CLINIC")
                new_content = new_content.replace("Intima Health Clinic", "KELKAR MANAS HEALTH CLINIC")
                new_content = new_content.replace("Intima Admin", "Kelkar Admin")
                
                # Avoid touching code/variables like intima-cart-storage or intima.app or @noemail-intima.com unless asked.
                # However, for text like "The Intima Standard" -> "The Kelkar Manas Standard"
                new_content = new_content.replace("The Intima Standard", "The Kelkar Manas Standard")
                new_content = new_content.replace("Intima Full Spectrum Screen", "Kelkar Manas Full Spectrum Screen")
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
