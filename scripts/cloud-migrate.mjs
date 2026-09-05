#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("\n=======================================================");
console.log("   ODE — Diagnostic & Assistant de Migration Cloud");
console.log("=======================================================\n");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERREUR : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY est absent dans .env.local\n");
  process.exit(1);
}

const isLocal = supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");
console.log(`🎯 Cible actuelle : ${supabaseUrl} (${isLocal ? "LOCAL (Docker)" : "CLOUD (Production)"})`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runDiagnostic() {
  const startTime = Date.now();

  try {
    console.log("⏳ Test de connectivité avec la base de données...");
    
    // Vérification des tables clés
    const tables = [
      { name: 'authors', label: 'Auteurs' },
      { name: 'collections', label: 'Recueils' },
      { name: 'poems', label: 'Poèmes' },
      { name: 'rothko_params', label: 'Génomes Rothko' },
      { name: 'categories', label: 'Catégories' },
    ];

    const results = {};
    let schemaComplete = true;

    for (const t of tables) {
      const { count, error } = await supabase
        .from(t.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results[t.name] = { exists: false, error: error.message };
        schemaComplete = false;
      } else {
        results[t.name] = { exists: true, count: count ?? 0 };
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Connexion réussie (${duration}s)\n`);

    console.log("📊 État des Tables :");
    for (const t of tables) {
      const res = results[t.name];
      if (res.exists) {
        console.log(`   - ${t.label} (${t.name}) : ${res.count.toLocaleString()} entrées`);
      } else {
        console.log(`   - ${t.label} (${t.name}) : ❌ Manquante ou inaccessible (${res.error})`);
      }
    }

    console.log("\n-------------------------------------------------------");

    if (!schemaComplete) {
      console.log("\n⚠️ ATTENTION : Certaines tables manquent dans la base cible.");
      console.log("👉 Pour déployer le schéma et toutes les migrations SQL sur Supabase Cloud :");
      console.log("   1. npx supabase link --project-ref <votre-project-ref>");
      console.log("   2. npx supabase db push\n");
      return;
    }

    const poemsCount = results['poems']?.count || 0;
    if (poemsCount === 0) {
      console.log("\nℹ️ Le schéma est présent mais la base est vide (0 poème).");
      console.log("👉 Pour importer l'intégralité des 30 000 poèmes, lancez :");
      console.log("   npm run ingest\n");
    } else if (poemsCount >= 30000) {
      console.log(`\n🎉 PARFAIT ! La base contient ${poemsCount.toLocaleString()} poèmes.`);
      console.log("🚀 Cette base de données est prête pour la production mondiale !\n");
    } else {
      console.log(`\nℹ️ La base contient un sous-ensemble de poèmes (${poemsCount.toLocaleString()}).`);
      console.log("👉 Pour compléter l'ingestion jusqu'aux ~30 000 poèmes :");
      console.log("   npm run ingest\n");
    }

  } catch (err) {
    console.error("❌ Erreur inattendue :", err);
  }
}

runDiagnostic();
