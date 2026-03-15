import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade — TravelMatch BR',
  description: 'Política de privacidade e proteção de dados do TravelMatch BR, em conformidade com a LGPD.',
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-8 inline-block text-sm text-turquoise-600 hover:underline">
        ← Voltar ao início
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-sand-900">Política de Privacidade</h1>
      <p className="mb-8 text-sm text-sand-500">Última atualização: 15 de março de 2026</p>

      <div className="space-y-8 text-sand-700 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-sand-900 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-sand-800 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_p]:leading-relaxed [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-sand-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-sand-200 [&_th]:bg-sand-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_ul]:mb-3 [&_ul]:space-y-1">

        <section>
          <h2>1. Introdução</h2>
          <p>
            A TravelMatch BR (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Plataforma&quot;) respeita a privacidade
            de seus usuários e está comprometida com a proteção dos dados pessoais em conformidade com a
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD) e demais legislações aplicáveis.
          </p>
          <p>
            Esta Política descreve quais dados coletamos, como os utilizamos, com quem os compartilhamos
            e quais são seus direitos como titular de dados.
          </p>
        </section>

        <section>
          <h2>2. Dados que Coletamos</h2>

          <h3>2.1 Dados de Cadastro</h3>
          <ul>
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Telefone (opcional)</li>
            <li>CPF (necessário para processamento de pagamentos)</li>
            <li>Foto de perfil (quando fornecida via Google ou Apple)</li>
          </ul>

          <h3>2.2 DNA de Viagem</h3>
          <p>
            Ao completar nosso quiz de perfil, coletamos suas preferências de viagem em 10 dimensões
            comportamentais (ritmo, natureza, urbano, praia, cultura, gastronomia, sociabilidade,
            fitness, aventura e relax). Esses dados formam seu &quot;DNA de Viagem&quot;, utilizado
            exclusivamente para personalizar recomendações de destinos e pacotes.
          </p>

          <h3>2.3 Dados de Reserva e Viagem</h3>
          <ul>
            <li>Destinos selecionados e datas de viagem</li>
            <li>Número de viajantes e nível de conforto</li>
            <li>Itinerários, check-ins e checklists pré-viagem</li>
            <li>Diário de viagem (quando utilizado)</li>
          </ul>

          <h3>2.4 Dados de Pagamento</h3>
          <ul>
            <li>Método de pagamento escolhido (PIX, cartão de crédito ou boleto)</li>
            <li>Dados necessários para processamento via Asaas (gateway de pagamento)</li>
            <li>Histórico de transações e status de pagamento</li>
          </ul>
          <p>
            <strong>Importante:</strong> Não armazenamos dados completos de cartão de crédito.
            O processamento é feito integralmente pelo Asaas, certificado PCI-DSS.
          </p>

          <h3>2.5 Avaliações e Feedback</h3>
          <ul>
            <li>Avaliações pós-viagem (notas e comentários)</li>
            <li>Net Promoter Score (NPS)</li>
          </ul>

          <h3>2.6 Dados Técnicos</h3>
          <ul>
            <li>Cookies de sessão e autenticação</li>
            <li>Logs de erro (coletados via Sentry para melhoria do serviço)</li>
            <li>Dados de navegação e performance da aplicação</li>
          </ul>
        </section>

        <section>
          <h2>3. Base Legal para Tratamento</h2>
          <table>
            <thead>
              <tr>
                <th>Finalidade</th>
                <th>Base Legal (LGPD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Criação e manutenção de conta</td>
                <td>Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td>Personalização de recomendações (DNA de Viagem)</td>
                <td>Consentimento (Art. 7º, I)</td>
              </tr>
              <tr>
                <td>Processamento de pagamentos</td>
                <td>Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td>Envio de e-mails transacionais</td>
                <td>Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td>Monitoramento de erros e segurança</td>
                <td>Interesse legítimo (Art. 7º, IX)</td>
              </tr>
              <tr>
                <td>Cumprimento de obrigações fiscais</td>
                <td>Obrigação legal (Art. 7º, II)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>4. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com os seguintes terceiros, exclusivamente para as finalidades descritas:</p>
          <table>
            <thead>
              <tr>
                <th>Parceiro</th>
                <th>Finalidade</th>
                <th>Dados Compartilhados</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase (Banco de dados)</td>
                <td>Armazenamento e autenticação</td>
                <td>Todos os dados da conta</td>
              </tr>
              <tr>
                <td>Google (OAuth)</td>
                <td>Login social</td>
                <td>E-mail, nome, foto de perfil</td>
              </tr>
              <tr>
                <td>Apple (OAuth)</td>
                <td>Login social</td>
                <td>E-mail, nome</td>
              </tr>
              <tr>
                <td>Asaas (Pagamentos)</td>
                <td>Processamento de pagamentos</td>
                <td>Nome, e-mail, CPF</td>
              </tr>
              <tr>
                <td>Sentry (Monitoramento)</td>
                <td>Rastreamento de erros</td>
                <td>Logs de erro (anonimizados)</td>
              </tr>
              <tr>
                <td>Vercel (Hospedagem)</td>
                <td>Hospedagem da aplicação</td>
                <td>Dados de requisição</td>
              </tr>
              <tr>
                <td>OpenWeather (Clima)</td>
                <td>Dados climáticos de destinos</td>
                <td>Nenhum dado pessoal</td>
              </tr>
            </tbody>
          </table>
          <p>
            Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins
            de marketing ou publicidade.
          </p>
        </section>

        <section>
          <h2>5. Cookies e Tecnologias Similares</h2>
          <p>Utilizamos os seguintes tipos de cookies:</p>
          <ul>
            <li><strong>Cookies essenciais:</strong> Necessários para autenticação e funcionamento da plataforma (sessão Supabase).</li>
            <li><strong>Cookies de monitoramento:</strong> Utilizados pelo Sentry para rastreamento de erros técnicos (somente em produção, com taxa de amostragem de 10%).</li>
          </ul>
          <p>Não utilizamos cookies de rastreamento publicitário ou de terceiros para fins de marketing.</p>
        </section>

        <section>
          <h2>6. Segurança dos Dados</h2>
          <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
          <ul>
            <li>Comunicação criptografada via HTTPS/TLS</li>
            <li>Autenticação segura com tokens JWT e cookies HttpOnly</li>
            <li>Row Level Security (RLS) no banco de dados — cada usuário acessa apenas seus próprios dados</li>
            <li>Senhas criptografadas com bcrypt (via Supabase Auth)</li>
            <li>Validação de webhooks de pagamento com tokens secretos</li>
            <li>Headers de segurança (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)</li>
          </ul>
        </section>

        <section>
          <h2>7. Retenção de Dados</h2>
          <ul>
            <li><strong>Dados de conta:</strong> Mantidos enquanto a conta estiver ativa.</li>
            <li><strong>DNA de Viagem:</strong> Mantido enquanto a conta estiver ativa, com histórico de evolução.</li>
            <li><strong>Dados de pagamento:</strong> Mantidos por 5 anos após a transação, conforme legislação fiscal brasileira.</li>
            <li><strong>Logs de erro:</strong> Retidos por 90 dias no Sentry.</li>
            <li><strong>Cache de recomendações:</strong> Expiram automaticamente em 24 horas.</li>
          </ul>
          <p>Após a exclusão da conta, seus dados pessoais serão removidos em até 30 dias, exceto aqueles necessários para cumprimento de obrigações legais.</p>
        </section>

        <section>
          <h2>8. Seus Direitos (LGPD)</h2>
          <p>Como titular de dados, você tem direito a:</p>
          <ul>
            <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e obter uma cópia.</li>
            <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li><strong>Anonimização ou eliminação:</strong> Solicitar a remoção de dados desnecessários ou tratados em desconformidade.</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado para transferência.</li>
            <li><strong>Revogação do consentimento:</strong> Retirar o consentimento a qualquer momento.</li>
            <li><strong>Oposição:</strong> Opor-se ao tratamento quando baseado em interesse legítimo.</li>
            <li><strong>Informação sobre compartilhamento:</strong> Saber com quais entidades seus dados foram compartilhados.</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail:{' '}
            <a href="mailto:privacidade@travelmatch.com.br" className="text-turquoise-600 hover:underline">
              privacidade@travelmatch.com.br
            </a>
          </p>
        </section>

        <section>
          <h2>9. Transferência Internacional de Dados</h2>
          <p>
            Alguns de nossos prestadores de serviço (Vercel, Sentry) possuem infraestrutura nos Estados Unidos.
            A transferência internacional de dados é realizada com base em cláusulas contratuais padrão e medidas
            de segurança adequadas, em conformidade com o Art. 33 da LGPD.
          </p>
        </section>

        <section>
          <h2>10. Menores de Idade</h2>
          <p>
            O TravelMatch BR não é destinado a menores de 18 anos. Não coletamos intencionalmente
            dados de menores. Caso identifiquemos dados de menores, eles serão excluídos imediatamente.
          </p>
        </section>

        <section>
          <h2>11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas
            por e-mail ou por aviso na Plataforma. A data da última atualização será sempre indicada no
            topo desta página.
          </p>
        </section>

        <section>
          <h2>12. Contato</h2>
          <p>Para dúvidas sobre esta Política ou sobre o tratamento de seus dados:</p>
          <ul>
            <li><strong>E-mail:</strong> privacidade@travelmatch.com.br</li>
            <li><strong>Encarregado de Dados (DPO):</strong> dpo@travelmatch.com.br</li>
          </ul>
          <p>
            Você também tem o direito de apresentar reclamação à Autoridade Nacional de Proteção de
            Dados (ANPD) — <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-turquoise-600 hover:underline">www.gov.br/anpd</a>.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-sand-200 pt-6 text-center text-sm text-sand-500">
        <Link href="/termos" className="text-turquoise-600 hover:underline">
          Termos de Uso
        </Link>
        {' · '}
        <Link href="/" className="text-turquoise-600 hover:underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
