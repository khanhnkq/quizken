import csv
import json
import urllib.request
import os

url = "https://raw.githubusercontent.com/tranngocminhhieu/toeic-600-words-scraped-dataset/main/data/toeic_600_words.csv"
output_file = "src/lib/constants/toeicData.ts"

def fetch_and_convert():
    print(f"Fetching data from {url}...")
    try:
        response = urllib.request.urlopen(url)
        lines = [l.decode('utf-8') for l in response.readlines()]
        
        # Remove BOM if present
        if lines[0].startswith('\ufeff'):
            lines[0] = lines[0][1:]

        reader = csv.DictReader(lines)
        
        topics = {}
        
        for row in reader:
            topic_name = row['topic'].strip()
            if not topic_name:
                continue
                
            if topic_name not in topics:
                topics[topic_name] = {
                    "id": topic_name.lower().replace(" & ", "-").replace(" ", "-"),
                    "title": topic_name,
                    "words": []
                }
            
            # Map CSV fields to our app's VocabularyWord structure
            word_data = {
                "id": row['english'].lower().strip(),
                "word": row['english'].strip(),
                "type": row['type'].strip(),
                "pronunciation": row['pronounce'].strip(),
                "meaning": row['vietnamese'].strip(),
                "definition": row['explain'].strip(),
                "example": row['example'].strip(),
                "example_vietnamese": row['example_vietnamese'].strip(),
                "image": row['image_url'].strip(),
                "audio": row['audio_url'].strip()
            }
            
            topics[topic_name]["words"].append(word_data)
            
        # Convert to list
        topics_list = list(topics.values())
        
        # Sort by title
        topics_list.sort(key=lambda x: x['title'])
        
        # Write to TS file
        print(f"Writing parsed data to {output_file}...")
        
        ts_content = f"""// Auto-generated from TOEIC 600 Words Dataset
// Source: {url}

export interface ToeicWord {{
    id: string;
    word: string;
    type: string;
    pronunciation: string;
    meaning: string;
    definition: string;
    example: string;
    example_vietnamese: string;
    image: string;
    audio: string;
}}

export interface ToeicTopic {{
    id: string;
    title: string;
    words: ToeicWord[];
}}

export const TOEIC_DATA: ToeicTopic[] = {json.dumps(topics_list, indent=4, ensure_ascii=False)};
"""
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(ts_content)
            
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_and_convert()
