import React from "react";

export default function PoliticaPrivacidadeScreen() {
  return (
    <section className="legal-screen custom-font">
      <h1>Política de Privacidade</h1>
      <span className="last-updated">Última atualização: 8 de abril de 2026</span>

      <h2>1. Responsável pelo Tratamento</h2>
      <p>
        Sílvia Seixas Pinho Peralta (Sweevil), NIF 247 911 780, Rua das
        Eirinhas, 157, Casa 6, 4300-166 Porto, Portugal.
      </p>
      <p>
        Contacto para questões de privacidade:{" "}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>
      </p>

      <h2>2. Dados Pessoais Recolhidos</h2>
      <p>
        Recolhemos apenas os dados estritamente necessários para o processamento
        das encomendas e comunicação com o cliente:
      </p>
      <ul>
        <li>Nome completo</li>
        <li>Endereço de entrega</li>
        <li>Endereço de e-mail</li>
        <li>Número de telefone (opcional)</li>
        <li>Dados de pagamento (processados pela entidade de pagamento, não armazenados pela Sweevil)</li>
      </ul>

      <h2>3. Finalidade e Base Legal do Tratamento</h2>
      <p>Os dados são tratados para as seguintes finalidades:</p>
      <ul>
        <li>Processamento e gestão de encomendas (execução de contrato — art. 6.º, n.º 1, al. b) do RGPD)</li>
        <li>Comunicação relacionada com a encomenda, como confirmações e atualizações de envio (interesse legítimo — art. 6.º, n.º 1, al. f) do RGPD)</li>
        <li>Cumprimento de obrigações legais, como emissão de faturas (obrigação legal — art. 6.º, n.º 1, al. c) do RGPD)</li>
      </ul>

      <h2>4. Partilha de Dados com Terceiros</h2>
      <p>
        Os dados pessoais poderão ser partilhados com as transportadoras (CTT,
        DPD, DHL, GLS) exclusivamente para efeitos de entrega da encomenda, e
        com o processador de pagamentos (PayPal) para processamento da
        transação. Não partilhamos dados com terceiros para fins de marketing
        ou publicidade.
      </p>

      <h2>5. Prazo de Conservação</h2>
      <p>
        Os dados são conservados pelo prazo mínimo necessário ao cumprimento
        das obrigações legais (nomeadamente fiscais e contabilísticas), em
        regra por um período não superior a 10 anos, nos termos da legislação
        fiscal portuguesa.
      </p>

      <h2>6. Direitos do Titular dos Dados</h2>
      <p>Nos termos do RGPD, o titular dos dados tem direito a:</p>
      <ul>
        <li>Aceder aos seus dados pessoais</li>
        <li>Retificar dados inexatos ou incompletos</li>
        <li>Solicitar o apagamento dos dados ("direito a ser esquecido")</li>
        <li>Limitar ou opor-se ao tratamento</li>
        <li>Portabilidade dos dados</li>
        <li>Apresentar reclamação junto da CNPD (Comissão Nacional de Proteção de Dados) em <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">www.cnpd.pt</a></li>
      </ul>
      <p>
        Para exercer qualquer um destes direitos, contacte-nos através de{" "}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizativas adequadas para proteger os
        seus dados pessoais contra acesso não autorizado, perda ou destruição.
        Os dados de pagamento são processados diretamente pelas entidades de
        pagamento em ambiente seguro e não são armazenados nos nossos sistemas.
      </p>
    </section>
  );
}
