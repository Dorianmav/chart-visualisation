import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell,
  ComposedChart, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Couleurs pour les graphiques
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number; // Pour permettre des propriétés supplémentaires
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

      const cleanCode = inputCode.trim();
      addDebugLog("Code nettoyé: " + cleanCode);

      if (!cleanCode.startsWith('[') || !cleanCode.endsWith(']')) {
        throw new Error('Le code doit être un tableau valide (commençant par [ et finissant par ])');
      }

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

      if (!Array.isArray(parsedData)) {
        addDebugLog("Les données ne sont pas un tableau");
        throw new Error('Les données doivent être un tableau d\'objets');
      }

      if (parsedData.length === 0) {
        addDebugLog("Le tableau est vide");
        throw new Error('Le tableau ne peut pas être vide');
      }

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

  const examples = {
    simple: `[
  { "name": "Janvier", "value": 100 },
  { "name": "Février", "value": 120 },
  { "name": "Mars", "value": 140 },
  { "name": "Avril", "value": 160 },
  { "name": "Mai", "value": 180 },
  { "name": "Juin", "value": 200 }
]`,
    advanced: `[
  { "name": "Janvier", "value": 100, "profit": 20, "users": 150, "x": 10, "y": 30 },
  { "name": "Février", "value": 120, "profit": 25, "users": 200, "x": 20, "y": 40 },
  { "name": "Mars", "value": 140, "profit": 30, "users": 250, "x": 30, "y": 50 },
  { "name": "Avril", "value": 160, "profit": 35, "users": 300, "x": 40, "y": 60 },
  { "name": "Mai", "value": 180, "profit": 40, "users": 350, "x": 50, "y": 70 },
  { "name": "Juin", "value": 200, "profit": 45, "users": 400, "x": 60, "y": 80 }
]`,
    radar: `[
  { "name": "Force", "value": 80, "fullMark": 100 },
  { "name": "Agilité", "value": 70, "fullMark": 100 },
  { "name": "Intelligence", "value": 90, "fullMark": 100 },
  { "name": "Charisme", "value": 60, "fullMark": 100 },
  { "name": "Endurance", "value": 75, "fullMark": 100 },
  { "name": "Chance", "value": 85, "fullMark": 100 }
]`
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Visualisation de Graphiques</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="editor-section">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Exemples de données:</h3>
            <div className="space-y-2">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => setCode(examples.simple)}
              >
                Exemple Simple
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => setCode(examples.advanced)}
              >
                Exemple Avancé
              </button>
              <button
                className="bg-purple-500 text-white px-3 py-1 rounded"
                onClick={() => setCode(examples.radar)}
              >
                Exemple Radar
              </button>
            </div>
          </div>
          <textarea
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            placeholder="Collez votre tableau de données ici..."
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
          <div className="border rounded-lg p-4 space-y-8 overflow-auto">
            {chartData && chartData.length > 0 ? (
              <>
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
                      {'profit' in chartData[0] && <Bar dataKey="profit" fill="#82ca9d" />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Graphique linéaire</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      {'profit' in chartData[0] && 
                        <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
                      }
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Graphique en aires</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
                      {'profit' in chartData[0] && 
                        <Area type="monotone" dataKey="profit" fill="#82ca9d" stroke="#82ca9d" />
                      }
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Graphique en camembert</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {'x' in chartData[0] && 'y' in chartData[0] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Graphique de dispersion</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="X" />
                        <YAxis type="number" dataKey="y" name="Y" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Points" data={chartData} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-4">Graphique composé</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                      <Line type="monotone" dataKey="value" stroke="#ff7300" />
                      {'profit' in chartData[0] && (
                        <Area type="monotone" dataKey="profit" fill="#82ca9d" stroke="#82ca9d" />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {'fullMark' in chartData[0] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Graphique radar</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%">
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Valeurs"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
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
