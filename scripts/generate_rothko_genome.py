#!/usr/bin/env python3
"""
Pipeline AI / NLP pour le Génome de l'Illustration Rothko

Ce script analyse le texte d'un poème et détermine mathématiquement 
une "graine" et des paramètres visuels déterministes.
Produit un objet JSON riche d'environ 150 octets.
"""

import os
import json
import hashlib
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

# Imports optionnels pour la flexibilité du pipeline local
try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    HAS_TEXTBLOB = False
    print("Warning: 'textblob' not installed. Running with heuristic fallback.")

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("Warning: 'supabase' not installed. Database updates disabled.")


def _analyze_text(text: str) -> tuple:
    """Returns (polarity, subjectivity, num_words)"""
    if HAS_TEXTBLOB:
        try:
            blob = TextBlob(text)
            return blob.sentiment.polarity, blob.sentiment.subjectivity, len(blob.words)
        except Exception:
            pass
            
    # Fallback heuristique si textblob est indisponible
    words = len(text.split())
    # Ex: La présence de mots longs ou de ponctuation forte simule le sentiment
    polarity = (len(text) % 200 - 100) / 100.0  # Pseudo-random entre -1 et 1
    subjectivity = (len(text) % 10) / 10.0
    return polarity, subjectivity, words

def derive_rothko_params(text: str, title: str, identifier: str) -> dict:
    """
    Traduit l'analyse NLP en un dictionnaire JSON (le "Génome") 
    strictement typé contre le contrat TypeScript `RothkoParams`.
    """
    polarity, subjectivity, num_words = _analyze_text(text)
    
    # 1. Seed: Graine mathématique ultra-déterministe
    seed_str = f"{identifier}-{title}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2**31 - 1)
    
    # 2. Palette ID (Mappage vers des tokens CSS en Front-end)
    if polarity < -0.2:
        palette_id = 'deep_void' if subjectivity > 0.5 else 'melancholy'
    elif polarity > 0.2:
        palette_id = 'golden_haze' if subjectivity > 0.5 else 'morning_paper'
    else:
        palettes = ['crimson_fog', 'ocean_depths', 'sunset_ash', 'forest_whisper']
        palette_id = palettes[seed % len(palettes)]
        
    # 3. Shape Type
    shape_types = ['ellipse', 'fluid_blob', 'horizontal_band', 'rectangle']
    shape_type = shape_types[seed % len(shape_types)]
    
    # 4. Layout Bias
    if num_words > 200:
        layout_bias = 'dispersed'
    elif polarity < -0.1:
        layout_bias = 'weighted_bottom'
    elif polarity > 0.3:
        layout_bias = 'weighted_top'
    else:
        layout_bias = 'centered'
        
    # 5. Complexity (1-5) limitant le DOM
    complexity = max(1, min(5, (num_words // 40) + 1))
    
    # 6. Texture Profile
    textures = ['smooth_silk', 'fine_grain', 'heavy_canvas', 'rough_paper']
    texture_idx = int(subjectivity * len(textures)) % len(textures)
    texture_profile = textures[texture_idx]
    
    # 7. Blend Mode
    blend_modes = ['multiply', 'screen', 'overlay', 'color-burn', 'hard-light', 'normal']
    blend_mode = blend_modes[seed % len(blend_modes)]
    
    return {
        "seed": seed,
        "palette_id": palette_id,
        "shape_type": shape_type,
        "layout_bias": layout_bias,
        "complexity": complexity,
        "texture_profile": texture_profile,
        "blend_mode": blend_mode
    }

def process_batch():
    """
    Lit le fichier JSONL compressé, calcule le génome de chaque poème
    et sauvegarde le tout dans un fichier JSON local (rothko_genomes.json).
    Ce fichier sera ensuite consommé par le script ingest.js.
    """
    file_path = os.path.join(os.path.dirname(__file__), "poems.cleaned.jsonl.gz")
    out_path = os.path.join(os.path.dirname(__file__), "rothko_genomes.json")
    
    if not os.path.exists(file_path):
        print(f"Error: Could not find {file_path}")
        return
        
    import gzip
    print(f"Reading from {file_path}...")
    
    genomes_map = {}
    
    try:
        with gzip.open(file_path, "rt", encoding="utf-8") as f:
            total_processed = 0
            
            for line in f:
                poem = json.loads(line)
                page_id = poem.get("page_id")
                title = poem.get("title", "Sans titre")
                text = poem.get("normalized_text", "")
                
                if not page_id or not text:
                    continue
                    
                genome = derive_rothko_params(text, title, str(page_id))
                
                # Ajout au dictionnaire local
                genomes_map[str(page_id)] = genome
                
                total_processed += 1
                if total_processed % 5000 == 0:
                    print(f"✅ Processed {total_processed} poems into memory...")
                    
            print(f"Writing {len(genomes_map)} genomes to {out_path}...")
            with open(out_path, "w", encoding="utf-8") as out:
                json.dump(genomes_map, out, separators=(',', ':')) # compact JSON
                
            print(f"🎉 Terminé. Fichier généré avec succès en local.")

    except Exception as e:
        print(f"Error reading or processing file: {e}")

if __name__ == "__main__":
    process_batch()
