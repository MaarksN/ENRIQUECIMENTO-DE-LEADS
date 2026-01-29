import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Lead, SalesKit, Competitor, DecisionMaker } from './types';

// Initialize Gemini Client
// IMPORTANT: We use a new instance for every major call in the UI to ensure fresh config/keys if needed, 
// but for this service file we keep a singleton for simple requests.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

/**
 * FEATURE 11 & 21: AI Deep Lead Search & Scoring (Now with Search Grounding)
 */
export const searchNewLeads = async (
  sector: string, 
  location: string, 
  keywords: string,
  size: string,
  quantity: number
): Promise<Partial<Lead>[]> => {
  try {
    const prompt = `Atue como um especialista de elite em inteligência de vendas B2B.
    Encontre EXATAMENTE ${quantity} empresas reais e ativas no setor de "${sector}" localizadas em "${location}".
    Filtro de precisão: Tamanho "${size}", Foco estratégico em "${keywords}".
    
    Para cada empresa, você DEVE fornecer um motivo estratégico de "Por que este lead é uma oportunidade de ouro?".
    
    Retorne um JSON com:
    1. Nome real (companyName).
    2. Localização e Telefone.
    3. Website (se houver).
    4. Score de Lead (0-100) - Seja rigoroso.
    5. Tech Stack (tecnologias prováveis).
    6. Tags (ex: "Alta Crescimento", "Decisor Oculto").
    7. matchReason: Uma frase curta e impactante explicando por que essa empresa é perfeita para prospectar agora.
    
    Use a ferramenta de busca para garantir dados reais.`;

    // Updated to use Search Grounding for accuracy
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Feature: Search Grounding
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              location: { type: Type.STRING },
              sector: { type: Type.STRING },
              website: { type: Type.STRING },
              phone: { type: Type.STRING },
              score: { type: Type.NUMBER },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              revenueEstimate: { type: Type.STRING },
              matchReason: { type: Type.STRING, description: "Motivo estratégico da escolha" }
            },
            required: ["companyName", "location", "score", "matchReason"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

/**
 * FEATURE 30: Decision Maker Matching (Enrichment)
 */
export const enrichDecisionMakers = async (companyName: string): Promise<DecisionMaker[]> => {
  try {
    const prompt = `Identifique cargos prováveis de tomadores de decisão na empresa ${companyName}. 
    Foque em Diretores, Gerentes e C-Level. Retorne 3 personas.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              linkedin: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Enrichment Error:", error);
    return [];
  }
};

/**
 * FEATURE 23, 25, 32, 33: Full Sales Machine (Cadence, Scripts, Email)
 */
export const generateSalesKit = async (companyName: string, sector: string): Promise<SalesKit | null> => {
  try {
    const prompt = `Crie um Kit de Vendas B2B completo para prospectar a empresa ${companyName} (${sector}).
    Língua: Português (Brasil). Tom: Consultivo e Profissional.
    
    O kit deve conter:
    1. Proposta de Valor (1 frase de impacto).
    2. Assunto de Email Frio (Catchy).
    3. Corpo do Email Frio (Personalizado, curto).
    4. Script de Ligação (Telefone) estruturado (Abertura, Gancho, Pergunta, Fechamento).
    5. Cadência de Prospecção de 3 passos (Dia 1, Dia 3, Dia 7) misturando canais.
    6. Duas objeções comuns e como contornar.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valueProposition: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailBody: { type: Type.STRING },
            phoneScript: { type: Type.STRING },
            cadence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  channel: { type: Type.STRING, enum: ["email", "linkedin", "phone"] },
                  subject: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            },
            objectionHandling: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objection: { type: Type.STRING },
                  response: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Sales Kit Error:", error);
    return null;
  }
};

export const analyzeCompetitors = async (companyName: string): Promise<Competitor[]> => {
  try {
    const prompt = `Liste 3 concorrentes diretos ou indiretos para ${companyName} no mercado brasileiro e seu ponto forte principal.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              strength: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Competitor Analysis Error:", error);
    return [];
  }
};

/**
 * NEW FEATURE: Maps Grounding (Gemini 2.5 Flash)
 */
export const checkLocationData = async (companyName: string, city: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the exact address, rating and recent reviews for ${companyName} in ${city}.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Maps Error:", error);
    return "Não foi possível validar a localização.";
  }
};

/**
 * NEW FEATURE: Image Generation (Nano Banana Pro / Gemini 3 Pro Image)
 */
export const generateMarketingImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * NEW FEATURE: Video Generation (Veo 3.1)
 */
export const generateVideoAsset = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
};

/**
 * NEW FEATURE: Text To Speech (Gemini 2.5 Flash TTS)
 */
export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

/**
 * NEW FEATURE: Thinking Mode (Gemini 3 Pro)
 */
export const deepReasoning = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        // maxOutputTokens not set as per instruction
      },
    });
    return response.text;
  } catch (error) {
    console.error("Thinking Error:", error);
    return "Erro no raciocínio profundo.";
  }
};

/**
 * NEW FEATURE: Audio Transcription (Gemini 3 Flash)
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: "Transcribe this audio precisely." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Erro na transcrição.";
  }
};

/**
 * NEW FEATURE: Video Understanding (Gemini 3 Pro)
 * Note: For large videos we would use File API, but for this demo we assume small snippets or 
 * frames due to browser limitations, or we can assume the File API is handled via a server in a real app.
 * Here we use the prompt based approach assuming the user inputs a summary request.
 */
export const analyzeVisualContent = async (base64Data: string, mimeType: string, prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: prompt }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Visual Analysis Error:", error);
        return "Erro na análise visual.";
    }
}

/**
 * 🚀 MOTOR DE EXECUÇÃO DAS 100 FERRAMENTAS
 * Esta função é genérica: ela roda qualquer ferramenta do Registry.
 */
export const executeAITool = async (
  promptTemplate: string,
  inputs: Record<string, string>,
  systemRole: string = 'Assistente de Vendas de Alta Performance'
): Promise<string | null> => {
  try {
    // 1. Interpolação de Variáveis (O "Search & Replace" inteligente)
    // Substitui {{empresa}} pelo valor real, ex: "Petrobras"
    let finalPrompt = promptTemplate;
    Object.keys(inputs).forEach(key => {
      // Cria uma regex global para substituir todas as ocorrências
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalPrompt = finalPrompt.replace(regex, inputs[key] || '');
    });

    // 2. Instancia um novo cliente para garantir que pegue a API Key mais recente (se o usuário trocou)
    // Nota: window.aistudio é um hack específico se você estiver usando o AI Studio no navegador,
    // caso contrário, usa a env var padrão.
    const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key') || '';
    if (!apiKey && !(window as any).aistudio) {
        // Warning: in a real app we might want to handle this better, but for now we assume environment or localStorage
        // throw new Error("Chave de API não configurada.");
    }

    const freshAi = new GoogleGenAI({ apiKey });

    // 3. Chamada à API (Usando Gemini 2.0 Flash para velocidade ou Pro se precisar de raciocínio)
    // O Flash é ideal para ferramentas de texto rápidas.
    const response = await freshAi.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
            role: 'user',
            parts: [{ text: `SYSTEM ROLE: ${systemRole}\n\n--- TAREFA ---\n${finalPrompt}` }]
        }
      ],
      config: {
        temperature: 0.7, // Criatividade balanceada
      }
    });

    return response.text();

  } catch (error: any) {
    console.error("Tool Execution Error:", error);
    throw new Error(error.message || "Falha ao executar a ferramenta de IA.");
  }
};
