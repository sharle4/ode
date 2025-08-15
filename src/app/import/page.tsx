"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const log = (message: string) => {
    setLogs(prevLogs => [`${new Date().toLocaleTimeString()} - ${message}`, ...prevLogs]);
  };

  const handleImport = async () => {
    setIsImporting(true);
    setLogs([]);

    let poemsData;
    try {
      poemsData = JSON.parse(jsonInput);
      if (!Array.isArray(poemsData)) throw new Error("Le JSON doit être un tableau de poèmes.");
      log(`Analyse du JSON réussie. ${poemsData.length} poèmes trouvés.`);
    } catch (error: any) {
      log(`ERREUR de format JSON : ${error.message}`);
      setIsImporting(false);
      return;
    }

    for (const poem of poemsData) {
      if (!poem.title || !poem.author || !poem.content) {
        log(`Poème ignoré : champs 'title', 'author' ou 'content' manquants.`);
        continue;
      }

      try {
        const { data: authorData, error: authorError } = await supabase
          .from('authors')
          .upsert({ name: poem.author.trim() }, { onConflict: 'name' })
          .select()
          .single();

        if (authorError) throw authorError;
        const authorId = authorData.id;
        log(`Auteur traité : ${poem.author.trim()} (ID: ${authorId})`);

        const { data: existingPoem } = await supabase
          .from('poems')
          .select('id')
          .eq('title', poem.title.trim())
          .eq('author_id', authorId)
          .single();

        if (existingPoem) {
          log(`Poème "${poem.title.trim()}" existe déjà. Ignoré.`);
          continue;
        }

        const { error: poemError } = await supabase.from('poems').insert({
          title: poem.title.trim(),
          content: poem.content.trim(),
          author_id: authorId,
          categories: poem.categories || [],
          source: poem.url || null,
        });

        if (poemError) throw poemError;
        log(`SUCCÈS : Poème "${poem.title.trim()}" ajouté.`);

      } catch (error: any) {
        log(`ERREUR pour "${poem.title}": ${error.message}`);
      }
    }

    log('--- Importation terminée ! ---');
    setIsImporting(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold">Outil d'Importation</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Collez ici le contenu de votre fichier JSON.
        </p>

        <div className="mt-4">
          <textarea
            className="w-full h-64 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-mono text-sm"
            placeholder='[{"title": "...", "author": "...", "content": "..."}, ...]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={isImporting}
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleImport}
            disabled={isImporting || !jsonInput}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isImporting ? 'Importation en cours...' : "Lancer l'importation"}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Logs :</h2>
          <div className="mt-2 w-full h-80 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 overflow-y-auto font-mono text-xs">
            {logs.map((logEntry, index) => (
              <p key={index} className={`whitespace-pre-wrap ${logEntry.includes('ERREUR') ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {logEntry}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}