import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

const ChartRenderer: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [debug, setDebug] = useState<string>('');

  const addDebugLog = (message: string) => {
    setDebug(prev => prev + "\n" + message);
  };

  const processCode = (inputCode: string) => {
    try {
      addDebugLog("Code reçu: " + inputCode);

      // Nettoyer le code des espaces en début et fin
      const cleanCode = inputCode.trim();
      addDebugLog("Code nettoyé: " + cleanCode);

      // Vérifier si le code commence et finit par des crochets
      if (!cleanCode.startsWith('[') || !cleanCode.endsWith(']')) {
        throw new Error('Le code doit être un tableau valide (commençant par [ et finissant par ])');
      }

      // Essayer de parser le JSON directement
      let parsedData;
      try {
        parsedData = JSON.parse(cleanCode);
        addDebugLog("Données parsées avec succès");
        addDebugLog("Type des données: " + typeof parsedData);
        addDebugLog("Est un tableau: " + Array.isArray(parsedData));
        addDebugLog("Contenu: " + JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        addDebugLog("Erreur de parsing JSON: " + parseError);
        throw new Error('Format JSON invalide. Vérifiez la syntaxe du tableau.');
      }

      // Vérifier que c'est un tableau
      if (!Array.isArray(parsedData)) {
        addDebugLog("Les données ne sont pas un tableau");
        throw new Error('Les données doivent être un tableau d\'objets');
      }

      // Vérifier que le tableau n'est pas vide
      if (parsedData.length === 0) {
        addDebugLog("Le tableau est vide");
        throw new Error('Le tableau ne peut pas être vide');
      }

      // Vérifier la structure de chaque élément
      const isValidData = parsedData.every((item: unknown, index: number): item is DataPoint => {
        if (!item || typeof item !== 'object') {
          addDebugLog(`Élément ${index} n'est pas un objet: ${JSON.stringify(item)}`);
          return false;
        }

        const candidate = item as Record<string, unknown>;
        const hasValidProperties = 
          'name' in candidate &&
          'value' in candidate &&
          typeof candidate.name === 'string' &&
          typeof candidate.value === 'number';

        if (!hasValidProperties) {
          addDebugLog(`Élément ${index} structure invalide: ${JSON.stringify(candidate)}`);
        }

        return hasValidProperties;
      });

      if (!isValidData) {
        throw new Error('Chaque élément doit avoir les propriétés "name" (texte) et "value" (nombre)');
      }

      addDebugLog("Validation réussie, données prêtes pour le graphique");
      return parsedData;
    } catch (err) {
      addDebugLog("Erreur finale: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  useEffect(() => {
    if (!code.trim()) {
      setChartData([]);
      setError(null);
      setDebug('');
      return;
    }

    try {
      const processedData = processCode(code);
      setChartData(processedData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setChartData([]);
    }
  }, [code]);

  const exampleCode = `[
  { "name": "Janvier", "value": 100 },
  { "name": "Février", "value": 120 },
  { "name": "Mars", "value": 140 },
  { "name": "Avril", "value": 160 },
  { "name": "Mai", "value": 180 },
  { "name": "Juin", "value": 200 }
]`;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Visualisation de Graphiques</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="editor-section">
          <textarea
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            placeholder={`Collez votre tableau de données ici...\n\nExemple:\n${exampleCode}`}
          />
          {error && (
            <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">
              Erreur: {error}
            </div>
          )}
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <h4 className="font-semibold">Logs de débogage:</h4>
            <pre className="whitespace-pre-wrap text-xs">{debug}</pre>
          </div>
        </div>
        <div className="preview-section">
          <div className="border rounded-lg p-4 h-96 overflow-auto">
            {chartData && chartData.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Graphique à barres</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>

                <h3 className="text-lg font-semibold my-4">Graphique linéaire</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Collez votre code pour voir les graphiques
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartRenderer;
