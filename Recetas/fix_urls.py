import os
import re

search_dirs = ['./src']
for root, dirs, files in os.walk(search_dirs[0]):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.astro'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            
            # Replace "http://127...api/..." with ${import.meta.env.PUBLIC_API_URL}/api/...
            content = re.sub(r'\"http://(?:127\.0\.0\.1|localhost):8000([^\"]+)\"', r'${import.meta.env.PUBLIC_API_URL}\1', content)
            
            # Replace 'http://127...api/...' with ${import.meta.env.PUBLIC_API_URL}/api/...
            content = re.sub(r'\'http://(?:127\.0\.0\.1|localhost):8000([^\']+)\'', r'${import.meta.env.PUBLIC_API_URL}\1', content)
            
            # Replace backtick enclosed http://127... with  inside existing template literals
            content = re.sub(r'http://(?:127\.0\.0\.1|localhost):8000', r'', content)

            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")
