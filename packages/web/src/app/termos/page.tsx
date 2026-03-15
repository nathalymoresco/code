import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso — TravelMatch BR',
  description: 'Termos e condições de uso da plataforma TravelMatch BR.',
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-8 inline-block text-sm text-turquoise-600 hover:underline">
        ← Voltar ao início
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-sand-900">Termos de Uso</h1>
      <p className="mb-8 text-sm text-sand-500">Última atualização: 15 de março de 2026</p>

      <div className="space-y-8 text-sand-700 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-sand-900 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-sand-800 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:space-y-1">

        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma TravelMatch BR (&quot;Plataforma&quot;), você concorda com
            estes Termos de Uso. Se não concordar com qualquer parte destes Termos, não utilize a Plataforma.
          </p>
          <p>
            A Plataforma é operada por TravelMatch BR Ltda., inscrita no CNPJ sob o nº [a definir],
            com sede em [a definir], Brasil.
          </p>
        </section>

        <section>
          <h2>2. Descrição do Serviço</h2>
          <p>O TravelMatch BR é uma plataforma de viagens personalizadas que oferece:</p>
          <ul>
            <li><strong>DNA de Viagem:</strong> Quiz comportamental que identifica seu perfil de viajante em 10 dimensões.</li>
            <li><strong>Recomendação de destinos:</strong> Algoritmo de compatibilidade que sugere destinos com base no seu perfil.</li>
            <li><strong>Montagem de pacotes:</strong> Pacotes personalizados com hospedagem, passeios, transfers e experiências.</li>
            <li><strong>Pagamento integrado:</strong> Processamento de pagamentos via PIX, cartão de crédito ou boleto.</li>
            <li><strong>Acompanhamento de viagem:</strong> Itinerário em tempo real, check-ins, checklist pré-viagem e diário.</li>
            <li><strong>Avaliações:</strong> Sistema de feedback pós-viagem para melhoria contínua.</li>
          </ul>
        </section>

        <section>
          <h2>3. Cadastro e Conta</h2>
          <h3>3.1 Requisitos</h3>
          <ul>
            <li>Ter pelo menos 18 anos de idade.</li>
            <li>Fornecer informações verdadeiras, completas e atualizadas.</li>
            <li>Manter a confidencialidade de suas credenciais de acesso.</li>
          </ul>

          <h3>3.2 Responsabilidade pela Conta</h3>
          <p>
            Você é responsável por todas as atividades realizadas em sua conta. Em caso de uso não
            autorizado, notifique-nos imediatamente. Não nos responsabilizamos por perdas decorrentes
            de uso não autorizado da sua conta.
          </p>

          <h3>3.3 CPF</h3>
          <p>
            O fornecimento do CPF é obrigatório para a contratação de pacotes e processamento de
            pagamentos, conforme exigência do gateway de pagamento e legislação fiscal brasileira.
          </p>
        </section>

        <section>
          <h2>4. DNA de Viagem e Recomendações</h2>
          <h3>4.1 Quiz de Perfil</h3>
          <p>
            O quiz de perfil coleta preferências comportamentais para gerar seu DNA de Viagem.
            As respostas são voluntárias e podem ser atualizadas a qualquer momento refazendo o quiz.
          </p>

          <h3>4.2 Recomendações</h3>
          <p>
            As recomendações de destinos são geradas por algoritmo com base no seu perfil e não
            constituem garantia de satisfação. O score de compatibilidade é uma estimativa baseada
            em critérios objetivos e pode não refletir a experiência real.
          </p>
        </section>

        <section>
          <h2>5. Pacotes e Reservas</h2>
          <h3>5.1 Composição dos Pacotes</h3>
          <p>
            Os pacotes são compostos por serviços de parceiros (hotéis, guias, transportadoras, etc.)
            e incluem uma taxa de serviço de 15% sobre o valor base. O TravelMatch BR atua como
            intermediário na contratação desses serviços.
          </p>

          <h3>5.2 Preços</h3>
          <p>
            Os preços são apresentados em Reais (R$) e podem variar conforme disponibilidade,
            temporada e nível de conforto selecionado. O preço final é confirmado no momento da
            reserva e não será alterado após a confirmação do pagamento.
          </p>

          <h3>5.3 Seguro Viagem</h3>
          <p>
            Todos os pacotes incluem seguro viagem básico. Informações sobre a cobertura são
            apresentadas na página do pacote. O seguro é fornecido por parceiro segurador e
            regido por suas próprias condições.
          </p>
        </section>

        <section>
          <h2>6. Pagamentos</h2>
          <h3>6.1 Métodos de Pagamento</h3>
          <ul>
            <li><strong>PIX:</strong> Pagamento instantâneo via QR Code.</li>
            <li><strong>Cartão de crédito:</strong> Parcelamento em até 12x.</li>
            <li><strong>Boleto bancário:</strong> Vencimento em 3 dias úteis.</li>
          </ul>

          <h3>6.2 Processamento</h3>
          <p>
            Os pagamentos são processados pelo Asaas, gateway de pagamento certificado PCI-DSS.
            O TravelMatch BR não armazena dados completos de cartão de crédito.
          </p>

          <h3>6.3 Sistema de Custódia (Escrow)</h3>
          <p>
            Os valores pagos ficam em custódia até a conclusão da viagem + 3 dias úteis,
            quando são liberados aos parceiros. Este mecanismo protege o viajante em caso
            de não prestação dos serviços.
          </p>
        </section>

        <section>
          <h2>7. Cancelamento e Reembolso</h2>
          <h3>7.1 Política de Cancelamento</h3>
          <ul>
            <li><strong>Até 7 dias antes da viagem:</strong> Reembolso integral (100%).</li>
            <li><strong>Entre 3 e 7 dias antes:</strong> Reembolso de 50% do valor total.</li>
            <li><strong>Menos de 3 dias antes:</strong> Sem reembolso (0%).</li>
          </ul>

          <h3>7.2 Cancelamento pelo TravelMatch BR</h3>
          <p>
            Reservamo-nos o direito de cancelar pacotes em casos de força maior, indisponibilidade
            do parceiro ou questões de segurança. Nestes casos, o reembolso será integral.
          </p>

          <h3>7.3 Prazo de Reembolso</h3>
          <p>
            Os reembolsos aprovados serão processados em até 10 dias úteis pelo mesmo método
            de pagamento utilizado na compra, quando aplicável.
          </p>
        </section>

        <section>
          <h2>8. Obrigações do Usuário</h2>
          <p>Ao utilizar a Plataforma, você se compromete a:</p>
          <ul>
            <li>Fornecer informações verdadeiras e atualizadas.</li>
            <li>Não utilizar a Plataforma para fins ilícitos ou não autorizados.</li>
            <li>Não tentar acessar dados de outros usuários.</li>
            <li>Não interferir no funcionamento da Plataforma.</li>
            <li>Respeitar os parceiros e demais viajantes.</li>
            <li>Cumprir as leis e regulamentações aplicáveis ao destino de viagem.</li>
          </ul>
        </section>

        <section>
          <h2>9. Responsabilidades e Limitações</h2>
          <h3>9.1 Intermediação</h3>
          <p>
            O TravelMatch BR atua como intermediário entre viajantes e prestadores de serviços
            turísticos (parceiros). Não somos prestadores diretos de hospedagem, transporte ou
            passeios, e a responsabilidade pela execução desses serviços é dos respectivos parceiros.
          </p>

          <h3>9.2 Limitação de Responsabilidade</h3>
          <p>Na máxima extensão permitida pela lei, o TravelMatch BR não se responsabiliza por:</p>
          <ul>
            <li>Indisponibilidade temporária da Plataforma por manutenção ou falhas técnicas.</li>
            <li>Qualidade dos serviços prestados diretamente pelos parceiros.</li>
            <li>Condições climáticas, desastres naturais ou eventos de força maior.</li>
            <li>Perdas ou danos indiretos, incidentais ou consequenciais.</li>
          </ul>

          <h3>9.3 Dados Climáticos</h3>
          <p>
            As informações climáticas exibidas são fornecidas pelo OpenWeather e representam
            médias históricas. Não garantimos a precisão dessas informações nem nos responsabilizamos
            por condições climáticas reais no destino.
          </p>
        </section>

        <section>
          <h2>10. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da Plataforma — incluindo textos, imagens, logotipos, algoritmos,
            o sistema de DNA de Viagem e o design da interface — é de propriedade do TravelMatch BR
            ou de seus licenciadores e está protegido pelas leis de propriedade intelectual.
          </p>
          <p>
            Você não pode copiar, modificar, distribuir ou criar obras derivadas do conteúdo da
            Plataforma sem autorização prévia e escrita.
          </p>
        </section>

        <section>
          <h2>11. Avaliações e Conteúdo do Usuário</h2>
          <p>
            Ao publicar avaliações, comentários ou conteúdo no diário de viagem, você concede ao
            TravelMatch BR uma licença não exclusiva, gratuita e mundial para utilizar, exibir e
            compartilhar esse conteúdo na Plataforma para fins de melhoria do serviço.
          </p>
          <p>
            Reservamo-nos o direito de remover conteúdo que viole estes Termos, contenha linguagem
            ofensiva, seja falso ou infrinja direitos de terceiros.
          </p>
        </section>

        <section>
          <h2>12. Privacidade e Proteção de Dados</h2>
          <p>
            O tratamento de dados pessoais é regido por nossa{' '}
            <Link href="/privacidade" className="text-turquoise-600 hover:underline">
              Política de Privacidade
            </Link>
            , que é parte integrante destes Termos. Ao utilizar a Plataforma, você declara ter
            lido e concordado com a Política de Privacidade.
          </p>
        </section>

        <section>
          <h2>13. Suspensão e Encerramento</h2>
          <p>
            Podemos suspender ou encerrar sua conta, sem aviso prévio, em caso de violação destes
            Termos, atividade fraudulenta ou conduta que prejudique outros usuários ou a Plataforma.
          </p>
          <p>
            Você pode encerrar sua conta a qualquer momento entrando em contato conosco. O encerramento
            não afeta obrigações já assumidas (reservas confirmadas, pagamentos pendentes).
          </p>
        </section>

        <section>
          <h2>14. Alterações nos Termos</h2>
          <p>
            Podemos atualizar estes Termos periodicamente. Mudanças significativas serão comunicadas
            por e-mail ou aviso na Plataforma com pelo menos 15 dias de antecedência. O uso
            continuado da Plataforma após as alterações constitui aceitação dos novos Termos.
          </p>
        </section>

        <section>
          <h2>15. Legislação Aplicável e Foro</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
            foro da comarca de [a definir], Estado de [a definir], para dirimir quaisquer
            controvérsias decorrentes destes Termos, com renúncia a qualquer outro, por mais
            privilegiado que seja.
          </p>
        </section>

        <section>
          <h2>16. Contato</h2>
          <p>Para dúvidas sobre estes Termos:</p>
          <ul>
            <li><strong>E-mail:</strong> contato@travelmatch.com.br</li>
            <li><strong>Suporte:</strong> suporte@travelmatch.com.br</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 border-t border-sand-200 pt-6 text-center text-sm text-sand-500">
        <Link href="/privacidade" className="text-turquoise-600 hover:underline">
          Política de Privacidade
        </Link>
        {' · '}
        <Link href="/" className="text-turquoise-600 hover:underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
