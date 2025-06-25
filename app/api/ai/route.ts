// app/api/ai/route.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const FETCH_TIMEOUT = 30000;

// --- ОБНОВЛЕННЫЙ ПРОМПТ ДЛЯ АНАЛИЗА ---
const ANALYSIS_SYSTEM_PROMPT = `
Ты — умный маршрутизатор запросов. Твоя задача - проанализировать запрос пользователя и определить, какой тип информации из базы данных ему нужен.
Ответь ТОЛЬКО в формате JSON.

Возможные варианты ответа:
1.  Если пользователь спрашивает об ОДНОЙ конкретной кошке, ответь:
    {"query_type": "specific_cat", "cat_name": "ИмяКошки"}

2.  Если пользователь просит список кошек по какому-либо критерию (например, "все кошки", "кошки с прививками"), ответь:
    {"query_type": "list_cats"}

3.  Если вопрос касается общих правил вакцинации, но не конкретных кошек, ответь:
    {"query_type": "vaccination_rules"}

4.  Если вопрос общий и не требует данных (например, "привет, как дела?"), ответь:
    {"query_type": "general"}
`;

// --- ОБНОВЛЕННАЯ ФУНКЦИЯ ПОЛУЧЕНИЯ ДАННЫХ ---
async function getRelevantDatabaseContext(analysis: { query_type: string; cat_name?: string }) {
    console.log('[DEBUG] Analysis result:', analysis);
    if (analysis.query_type === 'specific_cat' && analysis.cat_name) {
        const allCatsSimple = await prisma.cat.findMany({ select: { id: true, name: true } });
        
        let bestMatch: { id: string; name: string } | null = null;
        let minDistance = Infinity;

        for (const cat of allCatsSimple) {
            const distance = levenshteinDistance(cat.name, analysis.cat_name);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = cat;
            }
        }
        
        if (bestMatch && minDistance <= 3) {
            console.log(`[DEBUG] Fuzzy match found: "${analysis.cat_name}" -> "${bestMatch.name}"`);
            const fullCatData = await prisma.cat.findUnique({
                where: { id: bestMatch.id },
                include: { treatments: true, documents: true },
            });
            return fullCatData ? JSON.stringify({ cats: [fullCatData] }, null, 2) : JSON.stringify({ cats: [] }, null, 2);
        } else {
             return JSON.stringify({ cats: [], not_found: analysis.cat_name }, null, 2); 
        }
    }

    // Для списков и правил вакцинации загружаем всех
    if (analysis.query_type === 'list_cats' || analysis.query_type === 'vaccination_rules') {
        const cats = await prisma.cat.findMany({
            include: { treatments: true, documents: true },
        });
        return JSON.stringify({ cats }, null, 2);
    }
    
    return JSON.stringify({});
}

function levenshteinDistance(a: string, b: string): number {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const matrix = Array(bLower.length + 1).fill(null).map(() => Array(aLower.length + 1).fill(null));
    for (let i = 0; i <= aLower.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= bLower.length; j += 1) matrix[j][0] = j;
    for (let j = 1; j <= bLower.length; j += 1) {
        for (let i = 1; i <= aLower.length; i += 1) {
            const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
        }
    }
    return matrix[bLower.length][aLower.length];
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];

    if (!session || !allowedRoles.includes(session.user.role)) {
        return new Response('Forbidden', { status: 403 });
    }
    
    const userName = session.user?.name || 'дружище';
    const apiKey = process.env.YANDEX_GPT_API_KEY;
    const folderId = process.env.YANDEX_CLOUD_FOLDER_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const modelName = process.env.YANDEX_GPT_MODEL_NAME || 'yandexgpt-lite';

    if (!apiKey || !folderId) {
        return new Response('Ошибка конфигурации ИИ', { status: 500 });
    }

    const yandexApiHeaders = { 'Content-Type': 'application/json', 'Authorization': `Api-Key ${apiKey}` };
    const modelUri = `gpt://${folderId}/${modelName}`;
    const yandexApiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

    try {
        const body = await request.json();
        const { userQuery, history } = body; 
        if (!userQuery) return new Response('Query is required', { status: 400 });

        const analysisResponse = await fetch(yandexApiUrl, {
            method: 'POST',
            headers: yandexApiHeaders,
            body: JSON.stringify({
                modelUri: modelUri,
                completionOptions: { stream: false, temperature: 0, maxTokens: '100' },
                messages: [{ role: 'system', text: ANALYSIS_SYSTEM_PROMPT }, { role: 'user', text: userQuery }],
            }),
        });

        if (!analysisResponse.ok) throw new Error("Analysis call failed");
        
        const analysisData = await analysisResponse.json();
        let analysisResult = { query_type: 'general' };
        try {
            const rawText = analysisData.result.alternatives[0].message.text;
            const cleanedText = rawText.replace(/```json\n|```/g, '').trim();
            analysisResult = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse analysis JSON, falling back to general query.", e);
        }

        const dbContext = await getRelevantDatabaseContext(analysisResult);
        
        const conversationHistory = (history || []).map((msg: { role: string, content: string }) => ({
            role: msg.role,
            text: msg.content,
        }));

        const answerMessages = [
            {
                role: 'system',
                // --- ОБНОВЛЕННЫЙ ПРОМПТ С "ЗОЛОТЫМ ПРАВИЛОМ" ---
                text: `Твой образ — Мурдомыч, добродушный и очень харизматичный усатый дядька, который работает в приюте "МурДом". Ты обожаешь кошек и любишь пошутить. К тебе обращается твой коллега, ${userName}.

**Золотое правило Мурдомыча:** Ты всегда должен четко разделять факты из базы данных и свои выдумки.
1.  **Факты:** Всю информацию о кошках (имена, даты, процедуры) ты берешь **исключительно** из блока <DATA>${dbContext}</DATA>. Если в данных чего-то нет, ты честно говоришь: "Так, в моих бумагах этого не записано, дружище" или что-то в этом духе. Никогда не придумывай факты о кошках!
2.  **Юмор и выдумки:** Твои шутки, истории, забавные словечки и ворчание — это твое личное мнение. Ты можешь подавать их как угодно, чтобы поднять настроение, но никогда не смешивай их с фактическими данными.

**Правила оформления:**
-   Выделяй важные моменты **жирным**.
-   Списки оформляй с помощью звездочек (*).
-   Заголовки делай с помощью решеток (##).
-   Изображения вставляй как Markdown: ![описание](${appUrl}/путь/к/файлу.webp).

**Шпаргалка по прививкам (используй, только если спросят про медицину):**
-   Первичная вакцинация ('first'): первая прививка.
-   Ревакцинация ('second'): через 28 дней после первичной.
-   Ежегодная вакцинация ('revaccination'): через год после ПЕРВОЙ, если это первая ежегодная, или через год после ПРЕДЫДУЩЕЙ ежегодной.

Текущая дата: ${new Date().toLocaleDateString('ru-RU')}.`
            },
            ...conversationHistory, 
            {
                role: 'user',
                text: userQuery
            }
        ];
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const streamingResponse = await fetch(yandexApiUrl, {
            method: 'POST',
            headers: yandexApiHeaders,
            body: JSON.stringify({
                modelUri: modelUri,
                completionOptions: { stream: true, temperature: 0.7, maxTokens: '2000' },
                messages: answerMessages,
            }),
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!streamingResponse.ok || !streamingResponse.body) {
            const errorText = await streamingResponse.text();
            return new Response(errorText, { status: streamingResponse.status });
        }
        
        let previousText = '';
        const textDecoder = new TextDecoder();
        let buffer = '';

        const transformStream = new TransformStream({
            transform(chunk, controller) {
                buffer += textDecoder.decode(chunk, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';

                for (const part of parts) {
                    if (part.trim() === '') continue;
                    try {
                        const jsonPart = JSON.parse(part);
                        const fullText = jsonPart.result?.alternatives?.[0]?.message?.text || '';
                        
                        if (fullText.length > previousText.length) {
                            const newText = fullText.substring(previousText.length);
                            controller.enqueue(new TextEncoder().encode(newText));
                            previousText = fullText;
                        }
                    } catch (e) {
                         // Ignore parsing errors
                    }
                }
            },
            flush(controller) {
                if (buffer.trim() !== '') {
                     try {
                        const jsonPart = JSON.parse(buffer);
                        const fullText = jsonPart.result?.alternatives?.[0]?.message?.text || '';
                        if (fullText.length > previousText.length) {
                           const newText = fullText.substring(previousText.length);
                           controller.enqueue(new TextEncoder().encode(newText));
                        }
                    } catch (e) {
                         // Ignore final parsing errors
                    }
                }
            }
        });

        return new Response(streamingResponse.body.pipeThrough(transformStream), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error("AI handler error:", error);
        return new Response(error.message || 'Internal Server Error', { status: 500 });
    }
}
