import requests
import os
import glob

# specific, heavily curated aesthetic URLs for the exact models
images = {
    'audi_q4_e_tron.jpg': 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1080&auto=format&fit=crop',
    'mercedes_benz_glc_300.jpg': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1080&auto=format&fit=crop',
    'mercedes_eqs_suv.jpg': 'https://images.unsplash.com/photo-1668248835473-c2f28c752663?q=80&w=1080&auto=format&fit=crop',
    'mercedes_s_500.jpg': 'https://images.unsplash.com/photo-1727777726042-41ee66e4bae4?q=80&w=1080&auto=format&fit=crop'
}

public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public'))

headers = {'User-Agent': 'Mozilla/5.0'}
for filename, url in images.items():
    print(f'Downloading {filename}...')
    try:
        content = requests.get(url, headers=headers).content
        with open(os.path.join(public_dir, filename), 'wb') as f:
            f.write(content)
        print('Success')
    except Exception as e:
        print(f'Failed: {e}')

# Cleanup all the temporary scraper scripts I created
scripts_to_remove = [
    'download_images.py', 'download_aesthetic.py', 'search_unsplash.py',
    'unsplash_results.txt', 'unsplash_utf8.txt', 'download_selected.py',
    'get_wiki_images.py', 'download_bing.py'
]

for s in scripts_to_remove:
    try:
        if os.path.exists(s):
            os.remove(s)
            print(f'Removed temp scraper {s}')
    except:
        pass
