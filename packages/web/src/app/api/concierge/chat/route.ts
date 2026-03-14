import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ChatBody {
  package_id: string;
  message: string;
  history: { role: string; content: string }[];
}

// Simple rule-based responses for MVP (Vercel AI SDK integration in future)
const FAQ_RESPONSES: Record<string, string> = {
  horario: 'Os horários dos passeios estão no seu itinerário. Confira a página "Itinerário Ativo" para ver o cronograma do dia.',
  cancelar: 'Para cancelamentos, nossa política é: 100% até 7 dias antes, 50% de 3-7 dias, e sem reembolso com menos de 3 dias. Vou conectar você ao concierge humano.',
  checkin: 'Para fazer check-in, abra o QR Code do item no Itinerário Ativo e apresente ao parceiro. Você também pode confirmar manualmente.',
  clima: 'Confira a previsão na página do destino. Recomendamos levar roupas adequadas ao clima local.',
  seguro: 'Seu pacote inclui seguro viagem com cobertura de cancelamento, emergência médica e bagagem.',
  whatsapp: 'Nosso concierge humano está disponível das 8h às 22h pelo WhatsApp. Clique no ícone de telefone acima para ser redirecionado.',
  pagamento: 'Para questões de pagamento, acesse a página de confirmação do seu pacote ou entre em contato com nosso concierge.',
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) return response;
  }

  // Generic responses based on intent
  if (lower.includes('ajuda') || lower.includes('help')) {
    return 'Posso ajudar com: horários de passeios, check-in, clima, seguro, pagamentos e cancelamentos. O que você precisa?';
  }

  if (lower.includes('obrigad') || lower.includes('valeu')) {
    return 'De nada! Estou aqui se precisar de mais alguma coisa. Boa viagem! 🌴';
  }

  if (lower.includes('oi') || lower.includes('olá') || lower.includes('ola')) {
    return 'Olá! Como posso ajudar com sua viagem hoje?';
  }

  return 'Entendi! Para questões mais específicas, recomendo falar com nosso concierge humano pelo WhatsApp (clique no ícone de telefone). Posso ajudar com horários, check-in, clima, seguro ou pagamentos.';
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = (await req.json()) as ChatBody;
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    const response = getAIResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Concierge chat error:', error);
    return NextResponse.json({ error: 'Erro no chat' }, { status: 500 });
  }
}
